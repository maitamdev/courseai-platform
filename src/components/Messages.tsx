import { useState, useEffect, useRef } from 'react';
import { MessageCircle, Send, ArrowLeft } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

type Conversation = {
  friend_id: string;
  friend_username: string;
  friend_full_name: string;
  last_message: string;
  last_message_time: string;
  unread_count: number;
};

type Message = {
  id: string;
  sender_id: string;
  content: string;
  created_at: string;
};

export const Messages = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedFriend, setSelectedFriend] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) {
      fetchConversations();
    }
  }, [user]);

  // Auto-select friend when conversations load
  useEffect(() => {
    const openChatWithId = sessionStorage.getItem('openChatWith');
    if (openChatWithId && conversations.length > 0) {
      sessionStorage.removeItem('openChatWith');
      const conv = conversations.find(c => c.friend_id === openChatWithId);
      if (conv) {
        setSelectedFriend(conv);
      }
    }
  }, [conversations]);

  useEffect(() => {
    if (selectedFriend) {
      fetchMessages(selectedFriend.friend_id);
      const cleanup = subscribeToMessages(selectedFriend.friend_id);
      return cleanup;
    }
  }, [selectedFriend, user]);

  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  };

  const fetchConversations = async () => {
    if (!user) return;

    console.log('Fetching conversations for user:', user.id);

    // Get friends list with their profile info
    const { data: friendships, error } = await supabase
      .from('friendships')
      .select('friend_id')
      .eq('user_id', user.id)
      .eq('status', 'accepted');

    if (error) {
      console.error('Error fetching friendships:', error);
      return;
    }

    console.log('Friendships found:', friendships);

    if (!friendships || friendships.length === 0) {
      console.log('No friends found');
      setConversations([]);
      return;
    }

    // Get profile info for each friend
    const friendIds = friendships.map(f => f.friend_id);
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('id, username, full_name')
      .in('id', friendIds);

    if (profileError) {
      console.error('Error fetching profiles:', profileError);
      return;
    }

    console.log('Profiles found:', profiles);

    if (profiles && profiles.length > 0) {
      // For each friend, get last message
      const convos = await Promise.all(
        profiles.map(async (profile: any) => {
          const { data: lastMsg, error: msgError } = await supabase
            .from('friend_messages')
            .select('message, created_at')
            .or(`and(sender_id.eq.${user.id},receiver_id.eq.${profile.id}),and(sender_id.eq.${profile.id},receiver_id.eq.${user.id})`)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

          if (msgError && msgError.code !== 'PGRST116') {
            console.error('Error fetching last message:', msgError);
          }

          return {
            friend_id: profile.id,
            friend_username: profile.username,
            friend_full_name: profile.full_name,
            last_message: lastMsg?.message || 'Chưa có tin nhắn',
            last_message_time: lastMsg?.created_at || '',
            unread_count: 0
          };
        })
      );

      console.log('Conversations:', convos);
      setConversations(convos);
    } else {
      console.log('No profiles found');
      setConversations([]);
    }
  };

  const fetchMessages = async (friendId: string) => {
    if (!user) return;

    console.log('Fetching messages between', user.id, 'and', friendId);

    const { data, error } = await supabase
      .from('friend_messages')
      .select('id, sender_id, receiver_id, message, created_at')
      .or(`and(sender_id.eq.${user.id},receiver_id.eq.${friendId}),and(sender_id.eq.${friendId},receiver_id.eq.${user.id})`)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching messages:', error);
      return;
    }

    console.log('Messages fetched:', data);

    if (data) {
      const formattedMessages = data.map(msg => ({
        id: msg.id,
        sender_id: msg.sender_id,
        content: msg.message,
        created_at: msg.created_at
      }));
      console.log('Formatted messages:', formattedMessages);
      setMessages(formattedMessages);
    }
  };

  const subscribeToMessages = (friendId: string) => {
    if (!user) return () => {};
    
    // Unique channel name để tránh conflict
    const channelName = `messages-${user.id}-${friendId}`;
    
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'friend_messages'
        },
        (payload: any) => {
          const newMsg = payload.new;
          // Chỉ nhận tin nhắn từ friend gửi cho mình
          if (newMsg.sender_id === friendId && newMsg.receiver_id === user.id) {
            const formattedMsg: Message = {
              id: newMsg.id,
              sender_id: newMsg.sender_id,
              content: newMsg.message,
              created_at: newMsg.created_at
            };
            setMessages((prev) => {
              // Tránh duplicate
              if (prev.some(m => m.id === formattedMsg.id)) return prev;
              return [...prev, formattedMsg];
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const sendMessage = async () => {
    if (!user || !selectedFriend || !newMessage.trim()) return;

    const messageContent = newMessage.trim();
    const tempId = `temp-${Date.now()}`;
    
    // Optimistic update - hiển thị tin nhắn ngay lập tức
    const optimisticMessage: Message = {
      id: tempId,
      sender_id: user.id,
      content: messageContent,
      created_at: new Date().toISOString()
    };
    
    setMessages((prev) => [...prev, optimisticMessage]);
    setNewMessage(''); // Clear input ngay lập tức

    const { error } = await supabase
      .from('friend_messages')
      .insert({
        sender_id: user.id,
        receiver_id: selectedFriend.friend_id,
        message: messageContent
      });

    if (error) {
      console.error('Error sending message:', error);
      // Xóa tin nhắn optimistic nếu lỗi
      setMessages((prev) => prev.filter(m => m.id !== tempId));
      alert('Không thể gửi tin nhắn: ' + error.message);
      setNewMessage(messageContent); // Restore message
    }
  };

  return (
    <div className="max-w-7xl mx-auto h-[calc(100vh-12rem)]">
      <div className="mb-6">
        <h1 className="text-4xl font-black text-white mb-2">Tin nhắn</h1>
        <p className="text-gray-400">Trò chuyện với bạn bè</p>
      </div>

      <div className="grid md:grid-cols-3 gap-4 h-full">
        {/* Conversations List */}
        <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl border border-gray-700 overflow-hidden">
          <div className="p-4 border-b border-gray-700">
            <h2 className="font-bold text-white">Cuộc trò chuyện</h2>
          </div>
          <div className="overflow-y-auto h-[calc(100%-4rem)]">
            {conversations.length === 0 ? (
              <div className="text-center py-12 px-4">
                <MessageCircle className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400 text-sm">Chưa có cuộc trò chuyện</p>
              </div>
            ) : (
              conversations.map((conv) => (
                <button
                  key={conv.friend_id}
                  onClick={() => setSelectedFriend(conv)}
                  className={`w-full p-4 border-b border-gray-700 hover:bg-gray-700/50 transition-all text-left ${
                    selectedFriend?.friend_id === conv.friend_id ? 'bg-gray-700/50' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                      {conv.friend_username?.[0]?.toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-white truncate">
                        {conv.friend_full_name || conv.friend_username}
                      </h3>
                      <p className="text-sm text-gray-400 truncate">{conv.last_message}</p>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="md:col-span-2 bg-gray-800/50 backdrop-blur-lg rounded-2xl border border-gray-700 flex flex-col overflow-hidden">
          {selectedFriend ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-700 flex items-center gap-3">
                <button
                  onClick={() => setSelectedFriend(null)}
                  className="md:hidden p-2 hover:bg-gray-700 rounded-lg"
                >
                  <ArrowLeft className="w-5 h-5 text-white" />
                </button>
                <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                  {selectedFriend.friend_username?.[0]?.toUpperCase()}
                </div>
                <div>
                  <h3 className="font-bold text-white">
                    {selectedFriend.friend_full_name || selectedFriend.friend_username}
                  </h3>
                  <p className="text-xs text-green-400">Đang hoạt động</p>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[70%] px-4 py-2 rounded-2xl ${
                        msg.sender_id === user?.id
                          ? 'bg-yellow-400 text-gray-900'
                          : 'bg-gray-700 text-white'
                      }`}
                    >
                      <p className="break-words">{msg.content}</p>
                      <p className="text-xs opacity-70 mt-1">
                        {new Date(msg.created_at).toLocaleTimeString('vi-VN', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-4 border-t border-gray-700">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        sendMessage();
                      }
                    }}
                    placeholder="Nhập tin nhắn..."
                    className="flex-1 px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:border-yellow-400 focus:outline-none"
                  />
                  <button
                    onClick={() => sendMessage()}
                    className="px-6 py-3 bg-yellow-400 hover:bg-yellow-500 text-gray-900 rounded-xl font-semibold transition-all"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageCircle className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">Chọn một cuộc trò chuyện để bắt đầu</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
