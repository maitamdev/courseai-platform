import { useState, useEffect, useRef } from 'react';
import { MessageCircle, Send, ArrowLeft, Search, MoreVertical, Phone, Video, Smile, Image, Paperclip, Check, CheckCheck, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

// Emoji data organized by categories like Messenger
const EMOJI_CATEGORIES = [
  { name: 'Mặt cười', icon: '😀', emojis: ['😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '🙃', '😉', '😊', '😇', '🥰', '😍', '🤩', '😘', '😗', '☺️', '😚', '😙', '🥲', '😋', '😛', '😜', '🤪', '😝', '🤑', '🤗', '🤭', '🤫', '🤔', '🤐', '🤨', '😐', '😑', '😶', '😏', '😒', '🙄', '😬', '🤥', '😌', '😔', '😪', '🤤', '😴', '😷', '🤒', '🤕', '🤢', '🤮', '🤧', '🥵', '🥶', '🥴', '😵', '🤯', '🤠', '🥳', '🥸', '😎', '🤓', '🧐'] },
  { name: 'Cử chỉ', icon: '👋', emojis: ['👋', '🤚', '🖐️', '✋', '🖖', '👌', '🤌', '🤏', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '🖕', '👇', '☝️', '👍', '👎', '✊', '👊', '🤛', '🤜', '👏', '🙌', '👐', '🤲', '🤝', '🙏', '✍️', '💅', '🤳', '💪', '🦾', '🦿', '🦵', '🦶', '👂', '🦻', '👃', '🧠', '🫀', '🫁', '🦷', '🦴', '👀', '👁️', '👅', '👄'] },
  { name: 'Trái tim', icon: '❤️', emojis: ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '♥️', '💋', '💌', '💐', '🌹', '🥀', '🌺', '🌸', '🌷', '🌻', '🌼', '💮', '🏵️', '🎀', '🎁', '🎈', '🎉', '🎊', '✨', '🌟', '⭐', '💫', '🔥', '💥', '💢', '💦', '💨', '🕊️', '🦋', '🐝', '🌈'] },
  { name: 'Động vật', icon: '🐶', emojis: ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐻‍❄️', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🙈', '🙉', '🙊', '🐒', '🐔', '🐧', '🐦', '🐤', '🐣', '🐥', '🦆', '🦅', '🦉', '🦇', '🐺', '🐗', '🐴', '🦄', '🐝', '🪱', '🐛', '🦋', '🐌', '🐞', '🐜', '🪰', '🪲', '🪳', '🦟', '🦗', '🕷️', '🦂', '🐢', '🐍'] },
  { name: 'Đồ ăn', icon: '🍔', emojis: ['🍏', '🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🫐', '🍈', '🍒', '🍑', '🥭', '🍍', '🥥', '🥝', '🍅', '🍆', '🥑', '🥦', '🥬', '🥒', '🌶️', '🫑', '🌽', '🥕', '🫒', '🧄', '🧅', '🥔', '🍠', '🥐', '🥯', '🍞', '🥖', '🥨', '🧀', '🥚', '🍳', '🧈', '🥞', '🧇', '🥓', '🥩', '🍗', '🍖', '🦴', '🌭', '🍔', '🍟', '🍕', '🫓', '🥪', '🥙', '🧆', '🌮', '🌯', '🫔', '🥗', '🥘', '🫕', '🍝', '🍜', '🍲', '🍛', '🍣', '🍱', '🥟', '🦪', '🍤', '🍙', '🍚', '🍘', '🍥', '🥠', '🥮', '🍢', '🍡', '🍧', '🍨', '🍦', '🥧', '🧁', '🍰', '🎂', '🍮', '🍭', '🍬', '🍫', '🍿', '🍩', '🍪', '🌰', '🥜', '🍯', '🥛', '🍼', '🫖', '☕', '🍵', '🧃', '🥤', '🧋', '🍶', '🍺', '🍻', '🥂', '🍷', '🥃', '🍸', '🍹', '🧉', '🍾'] },
  { name: 'Hoạt động', icon: '⚽', emojis: ['⚽', '🏀', '🏈', '⚾', '🥎', '🎾', '🏐', '🏉', '🥏', '🎱', '🪀', '🏓', '🏸', '🏒', '🏑', '🥍', '🏏', '🪃', '🥅', '⛳', '🪁', '🏹', '🎣', '🤿', '🥊', '🥋', '🎽', '🛹', '🛼', '🛷', '⛸️', '🥌', '🎿', '⛷️', '🏂', '🪂', '🏋️', '🤼', '🤸', '⛹️', '🤺', '🤾', '🏌️', '🏇', '🧘', '🏄', '🏊', '🤽', '🚣', '🧗', '🚴', '🚵', '🎖️', '🏆', '🥇', '🥈', '🥉', '🏅', '🎪', '🎭', '🎨', '🎬', '🎤', '🎧', '🎼', '🎹', '🥁', '🪘', '🎷', '🎺', '🪗', '🎸', '🪕', '🎻', '🎲', '♟️', '🎯', '🎳', '🎮', '🎰', '🧩'] },
  { name: 'Du lịch', icon: '🚗', emojis: ['🚗', '🚕', '🚙', '🚌', '🚎', '🏎️', '🚓', '🚑', '🚒', '🚐', '🛻', '🚚', '🚛', '🚜', '🏍️', '🛵', '🚲', '🛴', '🛺', '🚨', '🚔', '🚍', '🚘', '🚖', '🚡', '🚠', '🚟', '🚃', '🚋', '🚞', '🚝', '🚄', '🚅', '🚈', '🚂', '🚆', '🚇', '🚊', '🚉', '✈️', '🛫', '🛬', '🛩️', '💺', '🛰️', '🚀', '🛸', '🚁', '🛶', '⛵', '🚤', '🛥️', '🛳️', '⛴️', '🚢', '⚓', '🪝', '⛽', '🚧', '🚦', '🚥', '🚏', '🗺️', '🗿', '🗽', '🗼', '🏰', '🏯', '🏟️', '🎡', '🎢', '🎠', '⛲', '⛱️', '🏖️', '🏝️', '🏜️', '🌋', '⛰️', '🏔️', '🗻', '🏕️', '⛺', '🛖', '🏠', '🏡', '🏘️', '🏚️', '🏗️', '🏭', '🏢', '🏬', '🏣', '🏤', '🏥', '🏦', '🏨', '🏪', '🏫', '🏩', '💒', '🏛️', '⛪', '🕌', '🕍', '🛕', '🕋', '⛩️', '🛤️', '🛣️', '🗾', '🎑', '🏞️', '🌅', '🌄', '🌠', '🎇', '🎆', '🌇', '🌆', '🏙️', '🌃', '🌌', '🌉', '🌁'] },
  { name: 'Biểu tượng', icon: '💯', emojis: ['💯', '💢', '💬', '👁️‍🗨️', '🗨️', '🗯️', '💭', '💤', '💮', '♨️', '💈', '🛑', '🕛', '🕧', '🕐', '🕜', '🕑', '🕝', '🕒', '🕞', '🕓', '🕟', '🕔', '🕠', '🕕', '🕡', '🕖', '🕢', '🕗', '🕣', '🕘', '🕤', '🕙', '🕥', '🕚', '🕦', '🌀', '♠️', '♥️', '♦️', '♣️', '🃏', '🀄', '🎴', '🔇', '🔈', '🔉', '🔊', '📢', '📣', '📯', '🔔', '🔕', '🎵', '🎶', '🏧', '🚮', '🚰', '♿', '🚹', '🚺', '🚻', '🚼', '🚾', '🛂', '🛃', '🛄', '🛅', '⚠️', '🚸', '⛔', '🚫', '🚳', '🚭', '🚯', '🚱', '🚷', '📵', '🔞', '☢️', '☣️', '⬆️', '↗️', '➡️', '↘️', '⬇️', '↙️', '⬅️', '↖️', '↕️', '↔️', '↩️', '↪️', '⤴️', '⤵️', '🔃', '🔄', '🔙', '🔚', '🔛', '🔜', '🔝', '🛐', '⚛️', '🕉️', '✡️', '☸️', '☯️', '✝️', '☦️', '☪️', '☮️', '🕎', '🔯', '♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓', '⛎', '🔀', '🔁', '🔂', '▶️', '⏩', '⏭️', '⏯️', '◀️', '⏪', '⏮️', '🔼', '⏫', '🔽', '⏬', '⏸️', '⏹️', '⏺️', '⏏️', '🎦', '🔅', '🔆', '📶', '📳', '📴', '✖️', '➕', '➖', '➗', '♾️', '‼️', '⁉️', '❓', '❔', '❕', '❗', '〰️', '💱', '💲', '⚕️', '♻️', '⚜️', '🔱', '📛', '🔰', '⭕', '✅', '☑️', '✔️', '❌', '❎', '➰', '➿', '〽️', '✳️', '✴️', '❇️', '©️', '®️', '™️'] }
];

type Conversation = {
  friend_id: string;
  friend_username: string;
  friend_full_name: string;
  friend_avatar: string | null;
  last_message: string;
  last_message_time: string;
  unread_count: number;
};

type Message = {
  id: string;
  sender_id: string;
  content: string;
  created_at: string;
  is_read?: boolean;
};

export const Messages = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedFriend, setSelectedFriend] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showMobileChat, setShowMobileChat] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [activeEmojiCategory, setActiveEmojiCategory] = useState(0);
  const [friendIsTyping, setFriendIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Close emoji picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(e.target as Node)) {
        setShowEmojiPicker(false);
      }
    };
    if (showEmojiPicker) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showEmojiPicker]);

  const insertEmoji = (emoji: string) => {
    setNewMessage(prev => prev + emoji);
    inputRef.current?.focus();
  };

  // Update typing status
  const updateTypingStatus = async (isTyping: boolean) => {
    if (!user || !selectedFriend) return;
    try {
      await supabase.rpc('update_typing_status', { 
        p_friend_id: selectedFriend.friend_id, 
        p_is_typing: isTyping 
      });
    } catch (e) {
      // Silently fail - typing indicator is not critical
    }
  };

  // Handle input change with typing indicator
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);
    
    // Send typing status
    updateTypingStatus(true);
    
    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Set timeout to clear typing status after 2 seconds of no typing
    typingTimeoutRef.current = setTimeout(() => {
      updateTypingStatus(false);
    }, 2000);
  };

  // Check if friend is typing
  useEffect(() => {
    if (!selectedFriend || !user) return;
    
    const checkTypingStatus = async () => {
      try {
        const { data } = await supabase
          .from('typing_status')
          .select('is_typing, updated_at')
          .eq('user_id', selectedFriend.friend_id)
          .eq('friend_id', user.id)
          .single();
        
        if (data) {
          // Check if typing status is recent (within 5 seconds)
          const updatedAt = new Date(data.updated_at).getTime();
          const isRecent = Date.now() - updatedAt < 5000;
          setFriendIsTyping(data.is_typing && isRecent);
        } else {
          setFriendIsTyping(false);
        }
      } catch {
        setFriendIsTyping(false);
      }
    };

    checkTypingStatus();
    const interval = setInterval(checkTypingStatus, 1500);
    
    return () => {
      clearInterval(interval);
      // Clear typing status when leaving chat
      updateTypingStatus(false);
    };
  }, [selectedFriend, user]);

  useEffect(() => {
    if (user) {
      fetchConversations();
      const pollInterval = setInterval(fetchConversations, 3000);
      return () => clearInterval(pollInterval);
    }
  }, [user]);

  useEffect(() => {
    try {
      const openChatWithId = sessionStorage.getItem('openChatWith');
      if (openChatWithId && conversations.length > 0) {
        sessionStorage.removeItem('openChatWith');
        const conv = conversations.find(c => c.friend_id === openChatWithId);
        if (conv) {
          setSelectedFriend(conv);
          setShowMobileChat(true);
        }
      }
    } catch (e) {
      console.warn('sessionStorage not available');
    }
  }, [conversations]);

  useEffect(() => {
    if (selectedFriend) {
      fetchMessages(selectedFriend.friend_id);
      markMessagesAsRead(selectedFriend.friend_id);
      const pollInterval = setInterval(() => fetchMessages(selectedFriend.friend_id), 2000);
      return () => clearInterval(pollInterval);
    }
  }, [selectedFriend, user]);

  const markMessagesAsRead = async (friendId: string) => {
    if (!user) return;
    try {
      await supabase.rpc('mark_messages_as_read', { p_user_id: user.id, p_friend_id: friendId });
      setConversations(prev => prev.map(conv => 
        conv.friend_id === friendId ? { ...conv, unread_count: 0 } : conv
      ));
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  useEffect(() => {
    if (messages.length > 0) scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  };

  const fetchConversations = async () => {
    if (!user) return;
    const { data: friendships, error } = await supabase
      .from('friendships').select('friend_id').eq('user_id', user.id).eq('status', 'accepted');
    if (error || !friendships?.length) { setConversations([]); return; }

    const friendIds = friendships.map(f => f.friend_id);
    const { data: profiles } = await supabase
      .from('profiles').select('id, username, full_name, avatar_url').in('id', friendIds);

    if (profiles?.length) {
      const convos = await Promise.all(profiles.map(async (p: any) => {
        const { data: lastMsg } = await supabase.from('friend_messages')
          .select('message, created_at')
          .or(`and(sender_id.eq.${user.id},receiver_id.eq.${p.id}),and(sender_id.eq.${p.id},receiver_id.eq.${user.id})`)
          .order('created_at', { ascending: false }).limit(1).single();
        const { count } = await supabase.from('friend_messages')
          .select('*', { count: 'exact', head: true })
          .eq('sender_id', p.id).eq('receiver_id', user.id).eq('is_read', false);
        return {
          friend_id: p.id, friend_username: p.username, friend_full_name: p.full_name,
          friend_avatar: p.avatar_url || null, last_message: lastMsg?.message || 'Chưa có tin nhắn',
          last_message_time: lastMsg?.created_at || '', unread_count: count || 0
        };
      }));
      convos.sort((a, b) => new Date(b.last_message_time || 0).getTime() - new Date(a.last_message_time || 0).getTime());
      setConversations(convos);
    } else setConversations([]);
  };

  const fetchMessages = async (friendId: string) => {
    if (!user) return;
    const { data } = await supabase.from('friend_messages')
      .select('id, sender_id, message, created_at, is_read')
      .or(`and(sender_id.eq.${user.id},receiver_id.eq.${friendId}),and(sender_id.eq.${friendId},receiver_id.eq.${user.id})`)
      .order('created_at', { ascending: true });
    if (data) {
      const formatted = data.map(m => ({ id: m.id, sender_id: m.sender_id, content: m.message, created_at: m.created_at, is_read: m.is_read }));
      setMessages(prev => prev.length !== formatted.length || prev[prev.length-1]?.id !== formatted[formatted.length-1]?.id ? formatted : prev);
    }
  };

  const sendMessage = async () => {
    if (!user || !selectedFriend || !newMessage.trim()) return;
    const content = newMessage.trim();
    const tempId = `temp-${Date.now()}`;
    setMessages(prev => [...prev, { id: tempId, sender_id: user.id, content, created_at: new Date().toISOString(), is_read: false }]);
    setNewMessage('');
    updateTypingStatus(false); // Clear typing status when sending
    inputRef.current?.focus();

    const { error } = await supabase.from('friend_messages').insert({ sender_id: user.id, receiver_id: selectedFriend.friend_id, message: content });
    if (error) {
      setMessages(prev => prev.filter(m => m.id !== tempId));
      alert('Không thể gửi: ' + error.message);
      setNewMessage(content);
    } else {
      setConversations(prev => prev.map(c => c.friend_id === selectedFriend.friend_id ? { ...c, last_message: content, last_message_time: new Date().toISOString() } : c));
    }
  };

  const formatTime = (d: string) => {
    if (!d) return '';
    const date = new Date(d), days = Math.floor((Date.now() - date.getTime()) / 86400000);
    if (days === 0) return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    if (days === 1) return 'Hôm qua';
    if (days < 7) return date.toLocaleDateString('vi-VN', { weekday: 'short' });
    return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
  };

  const groupByDate = (msgs: Message[]) => {
    const groups: { date: string; messages: Message[] }[] = [];
    msgs.forEach(m => {
      const d = new Date(m.created_at).toLocaleDateString('vi-VN');
      if (!groups.length || groups[groups.length-1].date !== d) groups.push({ date: d, messages: [m] });
      else groups[groups.length-1].messages.push(m);
    });
    return groups;
  };

  const getDateLabel = (d: string) => {
    const today = new Date().toLocaleDateString('vi-VN');
    if (d === today) return 'Hôm nay';
    if (d === new Date(Date.now() - 86400000).toLocaleDateString('vi-VN')) return 'Hôm qua';
    return d;
  };

  const filtered = conversations.filter(c => c.friend_full_name?.toLowerCase().includes(searchQuery.toLowerCase()) || c.friend_username?.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="max-w-7xl mx-auto h-[calc(100vh-10rem)] min-h-[500px]">
      <div className="h-full grid md:grid-cols-[380px_1fr] bg-gray-900/80 backdrop-blur-xl rounded-3xl border border-gray-700/50 overflow-hidden shadow-2xl relative">
        
        {/* Sidebar */}
        <div className={`flex flex-col border-r border-gray-700/50 ${showMobileChat ? 'hidden md:flex' : 'flex'}`}>
          <div className="p-5 border-b border-gray-700/50">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-bold text-white">Tin nhắn</h1>
              <span className="px-3 py-1 bg-yellow-400/20 text-yellow-400 text-sm font-semibold rounded-full">{conversations.length}</span>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Tìm kiếm..."
                className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-500 focus:border-yellow-400/50 focus:outline-none transition-all" />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {!filtered.length ? (
              <div className="flex flex-col items-center justify-center h-full text-center px-6">
                <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mb-4"><MessageCircle className="w-10 h-10 text-gray-600" /></div>
                <p className="text-gray-400">Chưa có cuộc trò chuyện</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-700/30">
                {filtered.map(conv => (
                  <button key={conv.friend_id} onClick={() => { setSelectedFriend(conv); setShowMobileChat(true); }}
                    className={`w-full p-4 hover:bg-gray-800/50 transition-all text-left ${selectedFriend?.friend_id === conv.friend_id ? 'bg-gradient-to-r from-yellow-400/10 to-transparent border-l-4 border-yellow-400' : ''}`}>
                    <div className="flex items-center gap-3">
                      <div className="relative flex-shrink-0">
                        <div className="w-14 h-14 rounded-full overflow-hidden ring-2 ring-gray-700 bg-gradient-to-br from-blue-500 to-purple-600">
                          {conv.friend_avatar ? <img src={conv.friend_avatar} alt="" className="w-full h-full object-cover" /> :
                            <div className="w-full h-full flex items-center justify-center text-white text-xl font-bold">{(conv.friend_username || conv.friend_full_name || '?')[0]?.toUpperCase()}</div>}
                        </div>
                        <span className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-gray-900 rounded-full"></span>
                        {conv.unread_count > 0 && <span className="absolute -top-1 -right-1 min-w-[22px] h-[22px] bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-lg">{conv.unread_count > 99 ? '99+' : conv.unread_count}</span>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className={`font-semibold truncate ${conv.unread_count > 0 ? 'text-white' : 'text-gray-300'}`}>{conv.friend_full_name || conv.friend_username}</h3>
                          <span className="text-xs text-gray-500 ml-2">{formatTime(conv.last_message_time)}</span>
                        </div>
                        <p className={`text-sm truncate ${conv.unread_count > 0 ? 'text-white font-medium' : 'text-gray-500'}`}>{conv.last_message}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Chat */}
        <div className={`flex flex-col bg-gray-900/50 h-full overflow-hidden ${showMobileChat || selectedFriend ? 'flex' : 'hidden md:flex'}`}>
          {selectedFriend ? (
            <>
              <div className="px-5 py-4 border-b border-gray-700/50 bg-gray-800/30 flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-3">
                  <button onClick={() => { setShowMobileChat(false); setSelectedFriend(null); }} className="md:hidden p-2 hover:bg-gray-700 rounded-lg"><ArrowLeft className="w-5 h-5 text-white" /></button>
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full overflow-hidden ring-2 ring-gray-700 bg-gradient-to-br from-blue-500 to-purple-600">
                      {selectedFriend.friend_avatar ? <img src={selectedFriend.friend_avatar} alt="" className="w-full h-full object-cover" /> :
                        <div className="w-full h-full flex items-center justify-center text-white font-bold">{(selectedFriend.friend_username || selectedFriend.friend_full_name || '?')[0]?.toUpperCase()}</div>}
                    </div>
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-gray-900 rounded-full"></span>
                  </div>
                  <div>
                    <h3 className="font-bold text-white">{selectedFriend.friend_full_name || selectedFriend.friend_username}</h3>
                    <p className="text-xs text-green-400 flex items-center gap-1"><span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>Đang hoạt động</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button className="p-2.5 hover:bg-gray-700/50 rounded-xl text-gray-400 hover:text-white"><Phone className="w-5 h-5" /></button>
                  <button className="p-2.5 hover:bg-gray-700/50 rounded-xl text-gray-400 hover:text-white"><Video className="w-5 h-5" /></button>
                  <button className="p-2.5 hover:bg-gray-700/50 rounded-xl text-gray-400 hover:text-white"><MoreVertical className="w-5 h-5" /></button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-5 space-y-6 bg-gray-900/95 min-h-0">
                {groupByDate(messages).map((g, i) => (
                  <div key={i}>
                    <div className="flex justify-center mb-4"><span className="px-4 py-1.5 bg-gray-800/80 text-gray-400 text-xs font-medium rounded-full">{getDateLabel(g.date)}</span></div>
                    <div className="space-y-3">
                      {g.messages.map((msg, j) => {
                        const isSender = msg.sender_id === user?.id;
                        const showAvatar = !isSender && (j === 0 || g.messages[j-1]?.sender_id !== msg.sender_id);
                        return (
                          <div key={msg.id} className={`flex items-end gap-2 ${isSender ? 'justify-end' : 'justify-start'}`}>
                            {!isSender && <div className="w-8 h-8 flex-shrink-0">{showAvatar && (
                              <div className="w-8 h-8 rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600">
                                {selectedFriend.friend_avatar ? <img src={selectedFriend.friend_avatar} alt="" className="w-full h-full object-cover" /> :
                                  <div className="w-full h-full flex items-center justify-center text-white text-xs font-bold">{(selectedFriend.friend_username || '?')[0]?.toUpperCase()}</div>}
                              </div>
                            )}</div>}
                            <div className="max-w-[70%]">
                              <div className={`px-4 py-2.5 rounded-2xl shadow-sm ${isSender ? 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 rounded-br-md' : 'bg-gray-800 text-white rounded-bl-md'}`}>
                                <p className="break-words leading-relaxed">{msg.content}</p>
                              </div>
                              <div className={`flex items-center gap-1 mt-1 ${isSender ? 'justify-end' : 'justify-start'}`}>
                                <span className="text-[10px] text-gray-500">{new Date(msg.created_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</span>
                                {isSender && (msg.is_read ? <CheckCheck className="w-3.5 h-3.5 text-blue-400" /> : <Check className="w-3.5 h-3.5 text-gray-500" />)}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
                {/* Typing indicator */}
                {friendIsTyping && (
                  <div className="flex items-center gap-2 pl-10">
                    <div className="w-8 h-8 rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600 flex-shrink-0">
                      {selectedFriend.friend_avatar ? (
                        <img src={selectedFriend.friend_avatar} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-white text-xs font-bold">
                          {(selectedFriend.friend_username || '?')[0]?.toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="bg-gray-800 px-4 py-3 rounded-2xl rounded-bl-md">
                      <div className="flex gap-1">
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                      </div>
                    </div>
                    <span className="text-xs text-gray-500">đang nhập...</span>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              <div className="p-4 border-t border-gray-700/50 bg-gray-800/30 flex-shrink-0 relative">
                {/* Emoji Picker */}
                {showEmojiPicker && (
                  <div ref={emojiPickerRef} className="absolute bottom-full left-0 right-0 mb-2 mx-4 bg-gray-800 border border-gray-700 rounded-2xl shadow-2xl overflow-hidden z-50">
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700">
                      <span className="text-white font-semibold">Biểu tượng cảm xúc</span>
                      <button onClick={() => setShowEmojiPicker(false)} className="p-1 hover:bg-gray-700 rounded-lg text-gray-400 hover:text-white">
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                    {/* Category tabs */}
                    <div className="flex gap-1 px-2 py-2 border-b border-gray-700 overflow-x-auto scrollbar-hide">
                      {EMOJI_CATEGORIES.map((cat, idx) => (
                        <button key={idx} onClick={() => setActiveEmojiCategory(idx)}
                          className={`p-2 rounded-lg text-xl hover:bg-gray-700 transition-colors flex-shrink-0 ${activeEmojiCategory === idx ? 'bg-yellow-400/20 ring-2 ring-yellow-400' : ''}`}
                          title={cat.name}>
                          {cat.icon}
                        </button>
                      ))}
                    </div>
                    {/* Category name */}
                    <div className="px-4 py-2 text-sm text-gray-400 font-medium">
                      {EMOJI_CATEGORIES[activeEmojiCategory].name}
                    </div>
                    {/* Emoji grid */}
                    <div className="h-64 overflow-y-auto px-2 pb-3">
                      <div className="grid grid-cols-8 gap-1">
                        {EMOJI_CATEGORIES[activeEmojiCategory].emojis.map((emoji, idx) => (
                          <button key={idx} onClick={() => insertEmoji(emoji)}
                            className="p-2 text-2xl hover:bg-gray-700 rounded-lg transition-all hover:scale-110 active:scale-95">
                            {emoji}
                          </button>
                        ))}
                      </div>
                    </div>
                    {/* Quick reactions */}
                    <div className="flex items-center gap-2 px-4 py-3 border-t border-gray-700 bg-gray-800/50">
                      <span className="text-xs text-gray-500 mr-2">Nhanh:</span>
                      {['👍', '❤️', '😂', '😮', '😢', '😡', '🔥', '💯'].map((emoji, idx) => (
                        <button key={idx} onClick={() => insertEmoji(emoji)}
                          className="p-1.5 text-xl hover:bg-gray-700 rounded-lg transition-all hover:scale-125">
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-end gap-3">
                  <div className="flex gap-1">
                    <button className="p-2.5 hover:bg-gray-700/50 rounded-xl text-gray-400 hover:text-yellow-400"><Image className="w-5 h-5" /></button>
                    <button className="p-2.5 hover:bg-gray-700/50 rounded-xl text-gray-400 hover:text-yellow-400"><Paperclip className="w-5 h-5" /></button>
                  </div>
                  <div className="flex-1 relative">
                    <input ref={inputRef} type="text" value={newMessage} onChange={handleInputChange}
                      onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                      onBlur={() => updateTypingStatus(false)}
                      placeholder="Nhập tin nhắn..." className="w-full px-5 py-3.5 bg-gray-800/80 border border-gray-700/50 rounded-2xl text-white placeholder-gray-500 focus:border-yellow-400/50 focus:outline-none pr-12" />
                    <button onClick={() => setShowEmojiPicker(!showEmojiPicker)} 
                      className={`absolute right-3 top-1/2 -translate-y-1/2 p-1.5 hover:bg-gray-700/50 rounded-lg transition-colors ${showEmojiPicker ? 'text-yellow-400 bg-gray-700/50' : 'text-gray-400 hover:text-yellow-400'}`}>
                      <Smile className="w-5 h-5" />
                    </button>
                  </div>
                  <button onClick={sendMessage} disabled={!newMessage.trim()}
                    className="p-3.5 bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-gray-900 rounded-2xl disabled:opacity-50 shadow-lg shadow-yellow-400/20">
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center px-6">
                <div className="w-32 h-32 bg-gradient-to-br from-gray-800 to-gray-700 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl">
                  <MessageCircle className="w-16 h-16 text-gray-500" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Chào mừng đến với Tin nhắn</h2>
                <p className="text-gray-400 max-w-sm mx-auto">Chọn một cuộc trò chuyện để bắt đầu nhắn tin</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
