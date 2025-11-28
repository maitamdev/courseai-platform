import { useState, useEffect, useRef } from 'react';
import { MessageCircle, Send, ArrowLeft, Check, CheckCheck } from 'lucide-react';
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
  status: 'sent' | 'delivered' | 'seen';
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
      const pollInterval = setInterval(() => {
        fetchConversations();
      }, 3000);
      return () => clearInterval(pollInterval);
    }
  }, [user]);

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
      markMessagesAsSeen(selectedFriend.friend_id);
      
      const pollInterval = setInterval(() => {
        fetchMessages(selectedFriend.friend_id);
      }, 2000);
      
      return () => clearInterval(pollInterval);
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

  const markMessagesAsSeen = async (friendId: string) => {
    if (!user) return;
    
    await supabase
      .from('friend_messages')
      .update({ status: 'seen' })
      .eq('receiver_id', user.id)
      .eq('sender_id', friendId)
      .neq('status', 'seen');
  };

  const fetchConversations = async () => {
    if (!user) return;

    const { data: friendships, error } = await supabase
      .from('friendships')
      .select('friend_id')
      .eq('user_id', user.id)
      .eq('status', 'accepted');

    if (error || !friendships || friendships.length === 0) {
      setConversations([]);
      return;
    }

    const friendIds = friendships.map(f => f.friend_id);
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, username, full_name')
      .in('id', friendIds);

    if (profiles && profiles.length > 0) {
      const convos = await Promise.all(
        profiles.map(async (profile: any) => {
          const { data: lastMsg } = await supabase
            .from('friend_messages')
            .select('message, created_at')
            .or(`and(sender_id.eq.${user.id},receiver_id.eq.${profile.id}),and(sender_id.eq.${profile.id},receiver_id.eq.${user.id})`)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

          // Đếm tin nhắn chưa đọc
          const { count } = await supabase
            .from('friend_messages')
            .select('*', { count: 'exact', head: true })
            .eq('sender_id', profile.id)
            .eq('receiver_id', user.id)
            .neq('status', 'seen');

          return {
            friend_id: profile.id,
            friend_username: profile.username,
            friend_full_name: profile.full_name,
            last_message: lastMsg?.message || 'Chưa có tin nhắn',
            last_message_time: lastMsg?.created_at || '',
            unread_count: count || 0
          };
        })
      );
      setConversations(convos);
    } else {
      setConversations([]);
    }
  };

  const fetchMessages = async (friendId: string) => {
    if (!user) return;

    const { data, error } = await supabase
      .from('friend_messages')
      .select('id, sender_id, receiver_id, message, created_at, status')
      .or(`and(sender_id.eq.${user.id},receiver_id.eq.${friendId}),and(sender_id.eq.${friendId},receiver_id.eq.${user.id})`)
      .order('created_at', { ascending: true });

    if (error) return;

    if (data) {
      const formattedMessages = data.map(msg => ({
        id: msg.id,
        sender_id: msg.sender_id,
        content: msg.message,
        created_at: msg.created_at,
        status: (msg.status || 'sent') as 'sent' | 'delivered' | 'seen'
      }));
      
      setMessages(prev => {
        if (prev.length !== formattedMessages.length || 
            (prev.length > 0 && formattedMessages.length > 0 && 
             prev[prev.length - 1].id !== formattedMessages[formattedMessages.length - 1].id) ||
            JSON.stringify(prev.map(m => m.status)) !== JSON.stringify(formattedMessages.map(m => m.status))) {
          return formattedMessages;
        }
        return prev;
      });
      
      // Đánh dấu đã xem khi fetch
      markMessagesAsSeen(friendId);
    }
  };

  const sendMessage = async () => {
    if (!user || !selectedFriend || !newMessage.trim()) return;

    const messageContent = newMessage.trim();
    const tempId = `temp-${Date.now()}`;
    
    const optimisticMessage: Message = {
      id: tempId,
      sender_id: user.id,
      content: messageContent,
      created_at: new Date().toISOString(),
      status: 'sent'
    };
    
    setMessages((prev) => [...prev, optimisticMessage]);
    setNewMessage('');

    const { error } = await supabase
      .from('friend_messages')
      .insert({
        sender_id: user.id,
        receiver_id: selectedFriend.friend_id,
        message: messageContent,
        status: 'sent'
      });

    if (error) {
      setMessages((prev) => prev.filter(m => m.id !== tempId));
      alert('Không thể gửi tin nhắn: ' + error.message);
      setNewMessage(messageContent);
    } else {
      setConversations(prev => prev.map(conv => 
        conv.friend_id === selectedFriend.friend_id 
          ? { ...conv, last_message: messageContent, last_message_time: new Date().toISOString() }
          : conv
      ));
    }
  };

  const getStatusIcon = (msg: Message) => {
    if (msg.sender_id !== user?.id) return null;
    
    switch (msg.status) {
      case 'seen':
        return <CheckCheck className="w-3.5 h-3.5 text-blue-400" />;
      case 'delivered':
        return <CheckCheck className="w-3.5 h-3.5 text-gray-400" />;
      default:
        return <Check className="w-3.5 h-3.5 text-gray-400" />;
    }
  };

  // Tính tổng tin nhắn chưa đọc
  const totalUnread = conversations.reduce((sum, conv) => sum + conv.unread_count, 0);

  return (
    <div className="max-w-7xl mx-auto h-[calc(100vh-12rem)]">
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-4xl font-black text-white">Tin nhắn</h1>
          {totalUnread > 0 && (
            <span className="bg-red-500 text-white text-sm font-bold px-2.5 py-1 rounded-full">
              {totalUnread}
            </span>
          )}
        </div>
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
                    <div className="relative">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                        {conv.friend_username?.[0]?.toUpperCase()}
                      </div>
                      {conv.unread_count > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                          {conv.unread_count > 9 ? '9+' : conv.unread_count}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-white truncate">
                        {conv.friend_full_name || conv.friend_username}
                      </h3>
                      <p className={`text-sm truncate ${conv.unread_count > 0 ? 'text-white font-semibold' : 'text-gray-400'}`}>
                        {conv.last_message}
                      </p>
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
                      <div className="flex items-center justify-end gap-1 mt-1">
                        <p className="text-xs opacity-70">
                          {new Date(msg.created_at).toLocaleTimeString('vi-VN', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                        {getStatusIcon(msg)}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

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

// Export hook để dùng ở Sidebar
export const useUnreadMessages = () => {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) return;

    const fetchUnread = async () => {
      const { count } = await supabase
        .from('friend_messages')
        .select('*', { count: 'exact', head: true })
        .eq('receiver_id', user.id)
        .neq('status', 'seen');
      
      setUnreadCount(count || 0);
    };

    fetchUnread();
    const interval = setInterval(fetchUnread, 3000);
    return () => clearInterval(interval);
  }, [user]);

  return unreadCount;
};
