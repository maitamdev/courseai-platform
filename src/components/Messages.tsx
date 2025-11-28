import { useState, useEffect, useRef } from 'react';
import {
  MessageCircle, Send, ArrowLeft, Search, Phone, Video, Smile, Image as ImageIcon,
  Check, CheckCheck, X, Mic, MicOff, Copy, Trash2, Edit3, Pin, Reply,
  Users, Palette, Search as SearchIcon, Play, Volume2
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

// Emoji categories
const EMOJI_CATEGORIES = [
  { name: 'Mặt cười', icon: '😀', emojis: ['😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '🙃', '😉', '😊', '😇', '🥰', '😍', '🤩', '😘', '😗', '☺️', '😚', '😙', '🥲', '😋', '😛', '😜', '🤪', '😝', '🤑', '🤗', '🤭', '🤫', '🤔', '🤐', '🤨', '😐', '😑', '😶', '😏', '😒', '🙄', '😬', '😌', '😔', '😪', '🤤', '😴', '😷', '🤒', '🤕', '🤢', '🤮', '🤧', '🥵', '🥶', '🥴', '😵', '🤯', '🤠', '🥳', '🥸', '😎', '🤓', '🧐'] },
  { name: 'Cử chỉ', icon: '👋', emojis: ['👋', '🤚', '🖐️', '✋', '🖖', '👌', '🤌', '🤏', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '👇', '☝️', '👍', '👎', '✊', '👊', '🤛', '🤜', '👏', '🙌', '👐', '🤲', '🤝', '🙏', '✍️', '💅', '🤳', '💪'] },
  { name: 'Trái tim', icon: '❤️', emojis: ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '♥️', '💋', '💌', '🔥', '💥', '✨', '🌟', '⭐', '💫'] },
  { name: 'Động vật', icon: '🐶', emojis: ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🙈', '🙉', '🙊', '🐔', '🐧', '🐦', '🦆', '🦅', '🦉', '🦋', '🐝', '🐞'] },
  { name: 'Đồ ăn', icon: '🍔', emojis: ['🍏', '🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🍒', '🍑', '🥭', '🍍', '🍔', '🍟', '🍕', '🌭', '🍿', '🧁', '🍰', '🎂', '🍩', '🍪', '☕', '🍵', '🧃', '🍺', '🍷'] },
];

// Chat themes
const CHAT_THEMES = [
  { id: 'default', name: 'Mặc định', gradient: 'from-yellow-400 to-yellow-500', bg: 'bg-gray-900/95' },
  { id: 'ocean', name: 'Đại dương', gradient: 'from-blue-400 to-cyan-500', bg: 'bg-slate-900/95' },
  { id: 'sunset', name: 'Hoàng hôn', gradient: 'from-orange-400 to-pink-500', bg: 'bg-gray-900/95' },
  { id: 'forest', name: 'Rừng xanh', gradient: 'from-green-400 to-emerald-500', bg: 'bg-gray-900/95' },
  { id: 'purple', name: 'Tím mộng', gradient: 'from-purple-400 to-pink-500', bg: 'bg-gray-900/95' },
  { id: 'fire', name: 'Lửa', gradient: 'from-red-500 to-orange-500', bg: 'bg-gray-900/95' },
];

const REACTION_EMOJIS = ['❤️', '😂', '😮', '😢', '😡', '👍'];

type Conversation = {
  friend_id: string;
  friend_username: string;
  friend_full_name: string;
  friend_avatar: string | null;
  last_message: string;
  last_message_time: string;
  unread_count: number;
  is_online?: boolean;
  last_seen?: string;
};

type Message = {
  id: string;
  sender_id: string;
  content: string;
  created_at: string;
  is_read?: boolean;
  is_deleted?: boolean;
  is_edited?: boolean;
  is_pinned?: boolean;
  message_type?: string;
  media_url?: string;
  voice_duration?: number;
  reply_to_id?: string;
  reply_to?: Message;
  reactions?: { emoji: string; user_id: string }[];
};

type GroupChat = {
  id: string;
  name: string;
  avatar_url?: string;
  members: { user_id: string; username: string; avatar_url?: string; role: string }[];
  last_message?: string;
  last_message_time?: string;
};

export const Messages = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedFriend, setSelectedFriend] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showMobileChat, setShowMobileChat] = useState(false);
  
  // Emoji picker
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [activeEmojiCategory, setActiveEmojiCategory] = useState(0);
  
  // Typing indicator
  const [friendIsTyping, setFriendIsTyping] = useState(false);
  
  // Message actions
  const [editingMessage, setEditingMessage] = useState<Message | null>(null);
  const [editText, setEditText] = useState('');
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  
  // Search in chat
  const [showChatSearch, setShowChatSearch] = useState(false);
  const [chatSearchQuery, setChatSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Message[]>([]);
  
  // Theme
  const [showThemeSelector, setShowThemeSelector] = useState(false);
  const [currentTheme, setCurrentTheme] = useState(CHAT_THEMES[0]);
  
  // Voice recording
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  
  // Media upload
  const [uploadingMedia, setUploadingMedia] = useState(false);
  
  // Group chat
  const [groupChats, setGroupChats] = useState<GroupChat[]>([]);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<GroupChat | null>(null);
  const [newGroupName, setNewGroupName] = useState('');
  const [selectedGroupMembers, setSelectedGroupMembers] = useState<string[]>([]);
  
  // View mode
  const [viewMode, setViewMode] = useState<'direct' | 'groups'>('direct');
  
  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);


  // Update online status
  useEffect(() => {
    if (!user) return;
    const updateStatus = async (online: boolean) => {
      try {
        await supabase.rpc('update_online_status', { p_is_online: online });
      } catch {}
    };
    updateStatus(true);
    const interval = setInterval(() => updateStatus(true), 30000);
    const handleVisibility = () => updateStatus(!document.hidden);
    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('beforeunload', () => updateStatus(false));
    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibility);
      updateStatus(false);
    };
  }, [user]);

  // Close emoji picker on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(e.target as Node)) {
        setShowEmojiPicker(false);
      }
    };
    if (showEmojiPicker) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [showEmojiPicker]);

  // Fetch conversations
  useEffect(() => {
    if (user) {
      fetchConversations();
      fetchGroupChats();
      const interval = setInterval(fetchConversations, 3000);
      return () => clearInterval(interval);
    }
  }, [user]);

  // Open chat from session storage
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
    } catch {}
  }, [conversations]);

  // Fetch messages when friend selected
  useEffect(() => {
    if (selectedFriend) {
      fetchMessages(selectedFriend.friend_id);
      markMessagesAsRead(selectedFriend.friend_id);
      fetchChatTheme(selectedFriend.friend_id);
      const interval = setInterval(() => fetchMessages(selectedFriend.friend_id), 2000);
      return () => clearInterval(interval);
    }
  }, [selectedFriend, user]);

  // Check typing status
  useEffect(() => {
    if (!selectedFriend || !user) return;
    const checkTyping = async () => {
      try {
        const { data } = await supabase
          .from('typing_status')
          .select('is_typing, updated_at')
          .eq('user_id', selectedFriend.friend_id)
          .eq('friend_id', user.id)
          .single();
        if (data) {
          const isRecent = Date.now() - new Date(data.updated_at).getTime() < 5000;
          setFriendIsTyping(data.is_typing && isRecent);
        }
      } catch { setFriendIsTyping(false); }
    };
    checkTyping();
    const interval = setInterval(checkTyping, 1500);
    return () => clearInterval(interval);
  }, [selectedFriend, user]);

  // Recording timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording) {
      interval = setInterval(() => setRecordingTime(t => t + 1), 1000);
    } else {
      setRecordingTime(0);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const fetchConversations = async () => {
    if (!user) return;
    const { data: friendships } = await supabase
      .from('friendships').select('friend_id').eq('user_id', user.id).eq('status', 'accepted');
    if (!friendships?.length) { setConversations([]); return; }

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
        
        // Get online status
        const { data: status } = await supabase
          .from('user_online_status')
          .select('is_online, last_seen')
          .eq('user_id', p.id)
          .single();

        return {
          friend_id: p.id, friend_username: p.username, friend_full_name: p.full_name,
          friend_avatar: p.avatar_url, last_message: lastMsg?.message || 'Chưa có tin nhắn',
          last_message_time: lastMsg?.created_at || '', unread_count: count || 0,
          is_online: status?.is_online && (Date.now() - new Date(status.last_seen).getTime() < 60000),
          last_seen: status?.last_seen
        };
      }));
      convos.sort((a, b) => new Date(b.last_message_time || 0).getTime() - new Date(a.last_message_time || 0).getTime());
      setConversations(convos);
    }
  };

  const fetchGroupChats = async () => {
    if (!user) return;
    try {
      const { data: memberships } = await supabase
        .from('group_members')
        .select('group_id')
        .eq('user_id', user.id);
      
      if (memberships?.length) {
        const groupIds = memberships.map(m => m.group_id);
        const { data: groups } = await supabase
          .from('group_chats')
          .select('*')
          .in('id', groupIds);
        
        if (groups) {
          const groupsWithMembers = await Promise.all(groups.map(async (g) => {
            const { data: members } = await supabase
              .from('group_members')
              .select('user_id, role')
              .eq('group_id', g.id);
            
            const memberProfiles = await Promise.all((members || []).map(async (m) => {
              const { data: profile } = await supabase
                .from('profiles')
                .select('username, avatar_url')
                .eq('id', m.user_id)
                .single();
              return { ...m, username: profile?.username, avatar_url: profile?.avatar_url };
            }));

            return { ...g, members: memberProfiles };
          }));
          setGroupChats(groupsWithMembers);
        }
      }
    } catch {}
  };

  const fetchMessages = async (friendId: string) => {
    if (!user) return;
    const { data } = await supabase.from('friend_messages')
      .select('id, sender_id, message, created_at, is_read, is_deleted, is_edited, is_pinned, message_type, media_url, voice_duration, reply_to_id')
      .or(`and(sender_id.eq.${user.id},receiver_id.eq.${friendId}),and(sender_id.eq.${friendId},receiver_id.eq.${user.id})`)
      .order('created_at', { ascending: true });
    
    if (data) {
      // Fetch reactions for messages
      const messageIds = data.map(m => m.id);
      const { data: reactions } = await supabase
        .from('message_reactions')
        .select('message_id, emoji, user_id')
        .in('message_id', messageIds);

      const formatted: Message[] = data.map(m => ({
        id: m.id, sender_id: m.sender_id, content: m.message, created_at: m.created_at,
        is_read: m.is_read, is_deleted: m.is_deleted, is_edited: m.is_edited,
        is_pinned: m.is_pinned, message_type: m.message_type || 'text',
        media_url: m.media_url, voice_duration: m.voice_duration, reply_to_id: m.reply_to_id,
        reactions: reactions?.filter(r => r.message_id === m.id) || []
      }));

      // Fetch reply_to messages
      const replyIds = formatted.filter(m => m.reply_to_id).map(m => m.reply_to_id);
      if (replyIds.length) {
        const { data: replyMsgs } = await supabase
          .from('friend_messages')
          .select('id, message, sender_id')
          .in('id', replyIds);
        
        formatted.forEach(m => {
          if (m.reply_to_id) {
            const reply = replyMsgs?.find(r => r.id === m.reply_to_id);
            if (reply) m.reply_to = { id: reply.id, content: reply.message, sender_id: reply.sender_id } as Message;
          }
        });
      }

      setMessages(formatted);
    }
  };

  const fetchChatTheme = async (friendId: string) => {
    if (!user) return;
    try {
      const { data } = await supabase
        .from('chat_themes')
        .select('theme')
        .eq('user_id', user.id)
        .eq('friend_id', friendId)
        .single();
      if (data) {
        const theme = CHAT_THEMES.find(t => t.id === data.theme);
        if (theme) setCurrentTheme(theme);
      } else {
        setCurrentTheme(CHAT_THEMES[0]);
      }
    } catch { setCurrentTheme(CHAT_THEMES[0]); }
  };

  const markMessagesAsRead = async (friendId: string) => {
    if (!user) return;
    try {
      await supabase.rpc('mark_messages_as_read', { p_user_id: user.id, p_friend_id: friendId });
      setConversations(prev => prev.map(c => c.friend_id === friendId ? { ...c, unread_count: 0 } : c));
    } catch {}
  };

  const updateTypingStatus = async (isTyping: boolean) => {
    if (!user || !selectedFriend) return;
    try {
      await supabase.rpc('update_typing_status', { p_friend_id: selectedFriend.friend_id, p_is_typing: isTyping });
    } catch {}
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);
    updateTypingStatus(true);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => updateTypingStatus(false), 2000);
  };


  const sendMessage = async (type: string = 'text', mediaUrl?: string, duration?: number) => {
    if (!user || !selectedFriend) return;
    if (type === 'text' && !newMessage.trim()) return;

    const content = type === 'text' ? newMessage.trim() : (type === 'voice' ? '🎤 Tin nhắn thoại' : '📷 Hình ảnh');
    const tempId = `temp-${Date.now()}`;
    
    setMessages(prev => [...prev, {
      id: tempId, sender_id: user.id, content, created_at: new Date().toISOString(),
      is_read: false, message_type: type, media_url: mediaUrl, voice_duration: duration,
      reply_to_id: replyingTo?.id, reply_to: replyingTo || undefined
    }]);
    setNewMessage('');
    setReplyingTo(null);
    updateTypingStatus(false);

    const { error } = await supabase.from('friend_messages').insert({
      sender_id: user.id, receiver_id: selectedFriend.friend_id, message: content,
      message_type: type, media_url: mediaUrl, voice_duration: duration,
      reply_to_id: replyingTo?.id
    });

    if (error) {
      setMessages(prev => prev.filter(m => m.id !== tempId));
      alert('Không thể gửi: ' + error.message);
    } else {
      setConversations(prev => prev.map(c => 
        c.friend_id === selectedFriend.friend_id 
          ? { ...c, last_message: content, last_message_time: new Date().toISOString() } 
          : c
      ));
    }
  };

  const deleteMessage = async (messageId: string) => {
    try {
      await supabase.rpc('soft_delete_message', { p_message_id: messageId });
      setMessages(prev => prev.map(m => m.id === messageId ? { ...m, is_deleted: true, content: 'Tin nhắn đã bị xóa' } : m));
    } catch {}
  };

  const editMessage = async () => {
    if (!editingMessage || !editText.trim()) return;
    try {
      await supabase.rpc('edit_message', { p_message_id: editingMessage.id, p_new_message: editText.trim() });
      setMessages(prev => prev.map(m => m.id === editingMessage.id ? { ...m, content: editText.trim(), is_edited: true } : m));
      setEditingMessage(null);
      setEditText('');
    } catch {}
  };

  const togglePinMessage = async (messageId: string) => {
    try {
      await supabase.rpc('toggle_pin_message', { p_message_id: messageId });
      setMessages(prev => prev.map(m => m.id === messageId ? { ...m, is_pinned: !m.is_pinned } : m));
    } catch {}
  };

  const addReaction = async (messageId: string, emoji: string) => {
    if (!user) return;
    try {
      const { data: existing } = await supabase
        .from('message_reactions')
        .select('id')
        .eq('message_id', messageId)
        .eq('user_id', user.id)
        .eq('emoji', emoji)
        .single();

      if (existing) {
        await supabase.from('message_reactions').delete().eq('id', existing.id);
      } else {
        await supabase.from('message_reactions').insert({ message_id: messageId, user_id: user.id, emoji });
      }
      fetchMessages(selectedFriend!.friend_id);
    } catch {}
  };

  const copyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
  };

  const setTheme = async (theme: typeof CHAT_THEMES[0]) => {
    if (!selectedFriend) return;
    setCurrentTheme(theme);
    setShowThemeSelector(false);
    try {
      await supabase.rpc('set_chat_theme', { p_friend_id: selectedFriend.friend_id, p_theme: theme.id });
    } catch {}
  };

  const searchInChat = () => {
    if (!chatSearchQuery.trim()) { setSearchResults([]); return; }
    const results = messages.filter(m => 
      m.content.toLowerCase().includes(chatSearchQuery.toLowerCase()) && !m.is_deleted
    );
    setSearchResults(results);
  };

  // Voice recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch {
      alert('Không thể truy cập microphone');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const sendVoiceMessage = async () => {
    if (!audioBlob || !user || !selectedFriend) return;
    setUploadingMedia(true);
    try {
      const fileName = `voice_${user.id}_${Date.now()}.webm`;
      const { error } = await supabase.storage
        .from('chat-media')
        .upload(fileName, audioBlob);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage.from('chat-media').getPublicUrl(fileName);
      await sendMessage('voice', publicUrl, recordingTime);
      setAudioBlob(null);
    } catch {
      alert('Không thể gửi tin nhắn thoại');
    }
    setUploadingMedia(false);
  };

  const cancelRecording = () => {
    setAudioBlob(null);
    setIsRecording(false);
    setRecordingTime(0);
  };

  // Media upload
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user || !selectedFriend) return;

    if (!file.type.startsWith('image/')) {
      alert('Chỉ hỗ trợ gửi hình ảnh');
      return;
    }

    setUploadingMedia(true);
    try {
      const fileName = `image_${user.id}_${Date.now()}.${file.name.split('.').pop()}`;
      const { error } = await supabase.storage.from('chat-media').upload(fileName, file);
      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage.from('chat-media').getPublicUrl(fileName);
      await sendMessage('image', publicUrl);
    } catch {
      alert('Không thể gửi hình ảnh');
    }
    setUploadingMedia(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Group chat functions
  const createGroupChat = async () => {
    if (!user || !newGroupName.trim() || selectedGroupMembers.length === 0) return;
    try {
      const { data: group, error } = await supabase
        .from('group_chats')
        .insert({ name: newGroupName.trim(), created_by: user.id })
        .select()
        .single();

      if (error) throw error;

      // Add creator and selected members
      const members = [user.id, ...selectedGroupMembers].map(uid => ({
        group_id: group.id,
        user_id: uid,
        role: uid === user.id ? 'admin' : 'member'
      }));

      await supabase.from('group_members').insert(members);
      
      setShowCreateGroup(false);
      setNewGroupName('');
      setSelectedGroupMembers([]);
      fetchGroupChats();
    } catch {
      alert('Không thể tạo nhóm');
    }
  };

  const insertEmoji = (emoji: string) => {
    setNewMessage(prev => prev + emoji);
    inputRef.current?.focus();
  };

  const formatTime = (d: string) => {
    if (!d) return '';
    const date = new Date(d);
    const days = Math.floor((Date.now() - date.getTime()) / 86400000);
    if (days === 0) return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    if (days === 1) return 'Hôm qua';
    if (days < 7) return date.toLocaleDateString('vi-VN', { weekday: 'short' });
    return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatLastSeen = (lastSeen: string) => {
    const diff = Date.now() - new Date(lastSeen).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Vừa xong';
    if (mins < 60) return `${mins} phút trước`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours} giờ trước`;
    return formatTime(lastSeen);
  };

  const groupByDate = (msgs: Message[]) => {
    const groups: { date: string; messages: Message[] }[] = [];
    msgs.forEach(m => {
      const d = new Date(m.created_at).toLocaleDateString('vi-VN');
      if (!groups.length || groups[groups.length - 1].date !== d) {
        groups.push({ date: d, messages: [m] });
      } else {
        groups[groups.length - 1].messages.push(m);
      }
    });
    return groups;
  };

  const getDateLabel = (d: string) => {
    const today = new Date().toLocaleDateString('vi-VN');
    if (d === today) return 'Hôm nay';
    const yesterday = new Date(Date.now() - 86400000).toLocaleDateString('vi-VN');
    if (d === yesterday) return 'Hôm qua';
    return d;
  };

  const pinnedMessages = messages.filter(m => m.is_pinned);
  const filtered = conversations.filter(c => 
    c.friend_full_name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.friend_username?.toLowerCase().includes(searchQuery.toLowerCase())
  );


  // Render message content based on type
  const renderMessageContent = (msg: Message) => {
    if (msg.is_deleted) {
      return <p className="italic text-gray-400">Tin nhắn đã bị xóa</p>;
    }

    switch (msg.message_type) {
      case 'image':
        return (
          <div className="max-w-xs">
            <img src={msg.media_url} alt="Sent image" className="rounded-lg max-w-full cursor-pointer hover:opacity-90" 
              onClick={() => window.open(msg.media_url, '_blank')} />
          </div>
        );
      case 'voice':
        return (
          <div className="flex items-center gap-3 min-w-[200px]">
            <button className="p-2 bg-white/20 rounded-full hover:bg-white/30">
              <Play className="w-4 h-4" />
            </button>
            <div className="flex-1 h-1 bg-white/30 rounded-full">
              <div className="h-full w-0 bg-white rounded-full"></div>
            </div>
            <span className="text-xs">{formatDuration(msg.voice_duration || 0)}</span>
          </div>
        );
      default:
        return <p className="break-words leading-relaxed whitespace-pre-wrap">{msg.content}</p>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto h-[calc(100vh-10rem)] min-h-[500px]">
      <div className="h-full grid md:grid-cols-[380px_1fr] bg-gray-900/80 backdrop-blur-xl rounded-3xl border border-gray-700/50 overflow-hidden shadow-2xl relative">
        
        {/* Sidebar */}
        <div className={`flex flex-col border-r border-gray-700/50 ${showMobileChat ? 'hidden md:flex' : 'flex'}`}>
          {/* Header */}
          <div className="p-5 border-b border-gray-700/50">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-bold text-white">Tin nhắn</h1>
              <div className="flex gap-2">
                <button onClick={() => setShowCreateGroup(true)} className="p-2 hover:bg-gray-700 rounded-lg text-gray-400 hover:text-white" title="Tạo nhóm">
                  <Users className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            {/* View mode tabs */}
            <div className="flex gap-2 mb-4">
              <button onClick={() => setViewMode('direct')}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${viewMode === 'direct' ? 'bg-yellow-400 text-gray-900' : 'bg-gray-800 text-gray-400 hover:text-white'}`}>
                Trực tiếp
              </button>
              <button onClick={() => setViewMode('groups')}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${viewMode === 'groups' ? 'bg-yellow-400 text-gray-900' : 'bg-gray-800 text-gray-400 hover:text-white'}`}>
                Nhóm ({groupChats.length})
              </button>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Tìm kiếm..."
                className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-500 focus:border-yellow-400/50 focus:outline-none" />
            </div>
          </div>


          {/* Conversation list */}
          <div className="flex-1 overflow-y-auto">
            {viewMode === 'direct' ? (
              !filtered.length ? (
                <div className="flex flex-col items-center justify-center h-full text-center px-6">
                  <MessageCircle className="w-16 h-16 text-gray-600 mb-4" />
                  <p className="text-gray-400">Chưa có cuộc trò chuyện</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-700/30">
                  {filtered.map(conv => (
                    <button key={conv.friend_id} onClick={() => { setSelectedFriend(conv); setSelectedGroup(null); setShowMobileChat(true); }}
                      className={`w-full p-4 hover:bg-gray-800/50 transition-all text-left ${selectedFriend?.friend_id === conv.friend_id ? 'bg-gradient-to-r from-yellow-400/10 to-transparent border-l-4 border-yellow-400' : ''}`}>
                      <div className="flex items-center gap-3">
                        <div className="relative flex-shrink-0">
                          <div className="w-14 h-14 rounded-full overflow-hidden ring-2 ring-gray-700 bg-gradient-to-br from-blue-500 to-purple-600">
                            {conv.friend_avatar ? <img src={conv.friend_avatar} alt="" className="w-full h-full object-cover" /> :
                              <div className="w-full h-full flex items-center justify-center text-white text-xl font-bold">{(conv.friend_username || '?')[0]?.toUpperCase()}</div>}
                          </div>
                          <span className={`absolute bottom-0 right-0 w-4 h-4 ${conv.is_online ? 'bg-green-500' : 'bg-gray-500'} border-2 border-gray-900 rounded-full`}></span>
                          {conv.unread_count > 0 && <span className="absolute -top-1 -right-1 min-w-[22px] h-[22px] bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">{conv.unread_count > 99 ? '99+' : conv.unread_count}</span>}
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
              )
            ) : (
              !groupChats.length ? (
                <div className="flex flex-col items-center justify-center h-full text-center px-6">
                  <Users className="w-16 h-16 text-gray-600 mb-4" />
                  <p className="text-gray-400">Chưa có nhóm chat</p>
                  <button onClick={() => setShowCreateGroup(true)} className="mt-4 px-4 py-2 bg-yellow-400 text-gray-900 rounded-lg font-medium hover:bg-yellow-500">
                    Tạo nhóm mới
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-gray-700/30">
                  {groupChats.map(group => (
                    <button key={group.id} onClick={() => { setSelectedGroup(group); setSelectedFriend(null); setShowMobileChat(true); }}
                      className={`w-full p-4 hover:bg-gray-800/50 transition-all text-left ${selectedGroup?.id === group.id ? 'bg-gradient-to-r from-yellow-400/10 to-transparent border-l-4 border-yellow-400' : ''}`}>
                      <div className="flex items-center gap-3">
                        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                          <Users className="w-7 h-7 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-white truncate">{group.name}</h3>
                          <p className="text-sm text-gray-500">{group.members.length} thành viên</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )
            )}
          </div>
        </div>


        {/* Chat area */}
        <div className={`flex flex-col ${currentTheme.bg} h-full overflow-hidden ${showMobileChat || selectedFriend || selectedGroup ? 'flex' : 'hidden md:flex'}`}>
          {selectedFriend ? (
            <>
              {/* Chat header */}
              <div className="px-5 py-4 border-b border-gray-700/50 bg-gray-800/30 flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-3">
                  <button onClick={() => { setShowMobileChat(false); setSelectedFriend(null); }} className="md:hidden p-2 hover:bg-gray-700 rounded-lg">
                    <ArrowLeft className="w-5 h-5 text-white" />
                  </button>
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full overflow-hidden ring-2 ring-gray-700 bg-gradient-to-br from-blue-500 to-purple-600">
                      {selectedFriend.friend_avatar ? <img src={selectedFriend.friend_avatar} alt="" className="w-full h-full object-cover" /> :
                        <div className="w-full h-full flex items-center justify-center text-white font-bold">{(selectedFriend.friend_username || '?')[0]?.toUpperCase()}</div>}
                    </div>
                    <span className={`absolute bottom-0 right-0 w-3 h-3 ${selectedFriend.is_online ? 'bg-green-500' : 'bg-gray-500'} border-2 border-gray-900 rounded-full`}></span>
                  </div>
                  <div>
                    <h3 className="font-bold text-white">{selectedFriend.friend_full_name || selectedFriend.friend_username}</h3>
                    <p className={`text-xs flex items-center gap-1 ${selectedFriend.is_online ? 'text-green-400' : 'text-gray-400'}`}>
                      {selectedFriend.is_online ? (
                        <><span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>Đang hoạt động</>
                      ) : (
                        selectedFriend.last_seen ? `Hoạt động ${formatLastSeen(selectedFriend.last_seen)}` : 'Offline'
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => setShowChatSearch(!showChatSearch)} className={`p-2.5 rounded-xl ${showChatSearch ? 'bg-yellow-400 text-gray-900' : 'hover:bg-gray-700/50 text-gray-400 hover:text-white'}`}>
                    <SearchIcon className="w-5 h-5" />
                  </button>
                  <button onClick={() => setShowThemeSelector(!showThemeSelector)} className="p-2.5 hover:bg-gray-700/50 rounded-xl text-gray-400 hover:text-white">
                    <Palette className="w-5 h-5" />
                  </button>
                  <button className="p-2.5 hover:bg-gray-700/50 rounded-xl text-gray-400 hover:text-white"><Phone className="w-5 h-5" /></button>
                  <button className="p-2.5 hover:bg-gray-700/50 rounded-xl text-gray-400 hover:text-white"><Video className="w-5 h-5" /></button>
                </div>
              </div>

              {/* Search in chat */}
              {showChatSearch && (
                <div className="px-4 py-3 border-b border-gray-700/50 bg-gray-800/50">
                  <div className="flex gap-2">
                    <input type="text" value={chatSearchQuery} onChange={e => setChatSearchQuery(e.target.value)} onKeyDown={e => e.key === 'Enter' && searchInChat()}
                      placeholder="Tìm trong cuộc trò chuyện..." className="flex-1 px-4 py-2 bg-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none" />
                    <button onClick={searchInChat} className="px-4 py-2 bg-yellow-400 text-gray-900 rounded-lg font-medium">Tìm</button>
                  </div>
                  {searchResults.length > 0 && (
                    <div className="mt-2 max-h-40 overflow-y-auto">
                      {searchResults.map(msg => (
                        <div key={msg.id} className="p-2 hover:bg-gray-700 rounded-lg cursor-pointer text-sm">
                          <p className="text-white truncate">{msg.content}</p>
                          <p className="text-gray-500 text-xs">{formatTime(msg.created_at)}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Theme selector */}
              {showThemeSelector && (
                <div className="px-4 py-3 border-b border-gray-700/50 bg-gray-800/50">
                  <p className="text-sm text-gray-400 mb-2">Chọn theme chat:</p>
                  <div className="flex gap-2 flex-wrap">
                    {CHAT_THEMES.map(theme => (
                      <button key={theme.id} onClick={() => setTheme(theme)}
                        className={`px-3 py-1.5 rounded-full text-sm font-medium bg-gradient-to-r ${theme.gradient} text-gray-900 ${currentTheme.id === theme.id ? 'ring-2 ring-white' : ''}`}>
                        {theme.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Pinned messages */}
              {pinnedMessages.length > 0 && (
                <div className="px-4 py-2 border-b border-gray-700/50 bg-yellow-400/10">
                  <div className="flex items-center gap-2 text-yellow-400">
                    <Pin className="w-4 h-4" />
                    <span className="text-sm font-medium">Tin nhắn đã ghim ({pinnedMessages.length})</span>
                  </div>
                </div>
              )}


              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4 min-h-0">
                {groupByDate(messages).map((g, i) => (
                  <div key={i}>
                    <div className="flex justify-center mb-4">
                      <span className="px-4 py-1.5 bg-gray-800/80 text-gray-400 text-xs font-medium rounded-full">{getDateLabel(g.date)}</span>
                    </div>
                    <div className="space-y-2">
                      {g.messages.map((msg, j) => {
                        const isSender = msg.sender_id === user?.id;
                        const showAvatar = !isSender && (j === 0 || g.messages[j - 1]?.sender_id !== msg.sender_id);
                        
                        return (
                          <div key={msg.id} className={`flex items-end gap-2 ${isSender ? 'justify-end' : 'justify-start'} group`}>
                            {!isSender && (
                              <div className="w-8 h-8 flex-shrink-0">
                                {showAvatar && (
                                  <div className="w-8 h-8 rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600">
                                    {selectedFriend.friend_avatar ? <img src={selectedFriend.friend_avatar} alt="" className="w-full h-full object-cover" /> :
                                      <div className="w-full h-full flex items-center justify-center text-white text-xs font-bold">{(selectedFriend.friend_username || '?')[0]?.toUpperCase()}</div>}
                                  </div>
                                )}
                              </div>
                            )}
                            
                            <div className="max-w-[70%] relative">
                              {/* Reply preview */}
                              {msg.reply_to && (
                                <div className={`mb-1 px-3 py-1.5 rounded-lg text-xs ${isSender ? 'bg-gray-700/50 text-gray-300' : 'bg-gray-700/50 text-gray-300'}`}>
                                  <p className="text-gray-400">Trả lời:</p>
                                  <p className="truncate">{msg.reply_to.content}</p>
                                </div>
                              )}
                              
                              {/* Message bubble */}
                              <div className={`relative px-4 py-2.5 rounded-2xl shadow-sm ${
                                isSender 
                                  ? `bg-gradient-to-r ${currentTheme.gradient} text-gray-900 rounded-br-md` 
                                  : 'bg-gray-800 text-white rounded-bl-md'
                              } ${msg.is_pinned ? 'ring-2 ring-yellow-400' : ''}`}>
                                {renderMessageContent(msg)}
                                {msg.is_edited && <span className="text-[10px] opacity-60 ml-1">(đã chỉnh sửa)</span>}
                                
                                {/* Message actions - show on hover */}
                                <div className={`absolute ${isSender ? 'left-0 -translate-x-full pr-2' : 'right-0 translate-x-full pl-2'} top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1`}>
                                  {!msg.is_deleted && (
                                    <>
                                      <button onClick={() => setReplyingTo(msg)} className="p-1.5 bg-gray-700 rounded-lg hover:bg-gray-600" title="Trả lời">
                                        <Reply className="w-3.5 h-3.5 text-gray-300" />
                                      </button>
                                      <button onClick={() => copyMessage(msg.content)} className="p-1.5 bg-gray-700 rounded-lg hover:bg-gray-600" title="Sao chép">
                                        <Copy className="w-3.5 h-3.5 text-gray-300" />
                                      </button>
                                      {isSender && (
                                        <>
                                          <button onClick={() => { setEditingMessage(msg); setEditText(msg.content); }} className="p-1.5 bg-gray-700 rounded-lg hover:bg-gray-600" title="Chỉnh sửa">
                                            <Edit3 className="w-3.5 h-3.5 text-gray-300" />
                                          </button>
                                          <button onClick={() => deleteMessage(msg.id)} className="p-1.5 bg-gray-700 rounded-lg hover:bg-red-600" title="Xóa">
                                            <Trash2 className="w-3.5 h-3.5 text-gray-300" />
                                          </button>
                                        </>
                                      )}
                                      <button onClick={() => togglePinMessage(msg.id)} className="p-1.5 bg-gray-700 rounded-lg hover:bg-gray-600" title={msg.is_pinned ? 'Bỏ ghim' : 'Ghim'}>
                                        <Pin className={`w-3.5 h-3.5 ${msg.is_pinned ? 'text-yellow-400' : 'text-gray-300'}`} />
                                      </button>
                                    </>
                                  )}
                                </div>
                              </div>
                              
                              {/* Reactions */}
                              {msg.reactions && msg.reactions.length > 0 && (
                                <div className={`flex gap-1 mt-1 ${isSender ? 'justify-end' : 'justify-start'}`}>
                                  {Array.from(new Set(msg.reactions.map(r => r.emoji))).map(emoji => {
                                    const count = msg.reactions!.filter(r => r.emoji === emoji).length;
                                    return (
                                      <span key={emoji} className="px-2 py-0.5 bg-gray-700 rounded-full text-sm">
                                        {emoji} {count > 1 && count}
                                      </span>
                                    );
                                  })}
                                </div>
                              )}
                              
                              {/* Quick reactions */}
                              {!msg.is_deleted && (
                                <div className={`absolute ${isSender ? 'left-0' : 'right-0'} -bottom-6 opacity-0 group-hover:opacity-100 transition-opacity flex gap-0.5 bg-gray-800 rounded-full px-1 py-0.5 shadow-lg`}>
                                  {REACTION_EMOJIS.map(emoji => (
                                    <button key={emoji} onClick={() => addReaction(msg.id, emoji)} className="hover:scale-125 transition-transform text-sm p-0.5">
                                      {emoji}
                                    </button>
                                  ))}
                                </div>
                              )}
                              
                              {/* Time and status */}
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
                    <div className="w-8 h-8 rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600">
                      {selectedFriend.friend_avatar ? <img src={selectedFriend.friend_avatar} alt="" className="w-full h-full object-cover" /> :
                        <div className="w-full h-full flex items-center justify-center text-white text-xs font-bold">{(selectedFriend.friend_username || '?')[0]?.toUpperCase()}</div>}
                    </div>
                    <div className="bg-gray-800 px-4 py-3 rounded-2xl rounded-bl-md">
                      <div className="flex gap-1">
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>


              {/* Edit message modal */}
              {editingMessage && (
                <div className="px-4 py-3 border-t border-gray-700/50 bg-gray-800/50">
                  <div className="flex items-center gap-2 mb-2">
                    <Edit3 className="w-4 h-4 text-yellow-400" />
                    <span className="text-sm text-yellow-400">Đang chỉnh sửa tin nhắn</span>
                    <button onClick={() => { setEditingMessage(null); setEditText(''); }} className="ml-auto text-gray-400 hover:text-white">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex gap-2">
                    <input type="text" value={editText} onChange={e => setEditText(e.target.value)} onKeyDown={e => e.key === 'Enter' && editMessage()}
                      className="flex-1 px-4 py-2 bg-gray-700 rounded-lg text-white focus:outline-none" />
                    <button onClick={editMessage} className="px-4 py-2 bg-yellow-400 text-gray-900 rounded-lg font-medium">Lưu</button>
                  </div>
                </div>
              )}

              {/* Reply preview */}
              {replyingTo && (
                <div className="px-4 py-2 border-t border-gray-700/50 bg-gray-800/50">
                  <div className="flex items-center gap-2">
                    <Reply className="w-4 h-4 text-blue-400" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-blue-400">Đang trả lời</p>
                      <p className="text-sm text-gray-300 truncate">{replyingTo.content}</p>
                    </div>
                    <button onClick={() => setReplyingTo(null)} className="text-gray-400 hover:text-white">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Voice recording UI */}
              {(isRecording || audioBlob) && (
                <div className="px-4 py-3 border-t border-gray-700/50 bg-red-500/10">
                  <div className="flex items-center gap-3">
                    {isRecording ? (
                      <>
                        <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                        <span className="text-white font-medium">{formatDuration(recordingTime)}</span>
                        <div className="flex-1 h-1 bg-gray-700 rounded-full overflow-hidden">
                          <div className="h-full bg-red-500 animate-pulse" style={{ width: '100%' }}></div>
                        </div>
                        <button onClick={stopRecording} className="p-2 bg-red-500 rounded-full text-white">
                          <MicOff className="w-5 h-5" />
                        </button>
                      </>
                    ) : (
                      <>
                        <Volume2 className="w-5 h-5 text-gray-400" />
                        <span className="text-white">{formatDuration(recordingTime)}</span>
                        <div className="flex-1"></div>
                        <button onClick={cancelRecording} className="p-2 hover:bg-gray-700 rounded-full text-gray-400">
                          <X className="w-5 h-5" />
                        </button>
                        <button onClick={sendVoiceMessage} disabled={uploadingMedia} className="p-2 bg-yellow-400 rounded-full text-gray-900">
                          <Send className="w-5 h-5" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Input area */}
              {!isRecording && !audioBlob && !editingMessage && (
                <div className="p-4 border-t border-gray-700/50 bg-gray-800/30 flex-shrink-0 relative">
                  {/* Emoji Picker */}
                  {showEmojiPicker && (
                    <div ref={emojiPickerRef} className="absolute bottom-full left-0 right-0 mb-2 mx-4 bg-gray-800 border border-gray-700 rounded-2xl shadow-2xl overflow-hidden z-50">
                      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700">
                        <span className="text-white font-semibold">Biểu tượng cảm xúc</span>
                        <button onClick={() => setShowEmojiPicker(false)} className="p-1 hover:bg-gray-700 rounded-lg text-gray-400">
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                      <div className="flex gap-1 px-2 py-2 border-b border-gray-700 overflow-x-auto">
                        {EMOJI_CATEGORIES.map((cat, idx) => (
                          <button key={idx} onClick={() => setActiveEmojiCategory(idx)}
                            className={`p-2 rounded-lg text-xl hover:bg-gray-700 flex-shrink-0 ${activeEmojiCategory === idx ? 'bg-yellow-400/20 ring-2 ring-yellow-400' : ''}`}>
                            {cat.icon}
                          </button>
                        ))}
                      </div>
                      <div className="h-48 overflow-y-auto px-2 py-2">
                        <div className="grid grid-cols-8 gap-1">
                          {EMOJI_CATEGORIES[activeEmojiCategory].emojis.map((emoji, idx) => (
                            <button key={idx} onClick={() => insertEmoji(emoji)} className="p-2 text-2xl hover:bg-gray-700 rounded-lg hover:scale-110 transition-transform">
                              {emoji}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex items-end gap-3">
                    <div className="flex gap-1">
                      <input type="file" ref={fileInputRef} onChange={handleFileSelect} accept="image/*" className="hidden" />
                      <button onClick={() => fileInputRef.current?.click()} disabled={uploadingMedia} className="p-2.5 hover:bg-gray-700/50 rounded-xl text-gray-400 hover:text-yellow-400 disabled:opacity-50">
                        <ImageIcon className="w-5 h-5" />
                      </button>
                      <button onClick={startRecording} className="p-2.5 hover:bg-gray-700/50 rounded-xl text-gray-400 hover:text-yellow-400">
                        <Mic className="w-5 h-5" />
                      </button>
                    </div>
                    <div className="flex-1 relative">
                      <input ref={inputRef} type="text" value={newMessage} onChange={handleInputChange}
                        onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                        onBlur={() => updateTypingStatus(false)}
                        placeholder="Nhập tin nhắn..." className="w-full px-5 py-3.5 bg-gray-800/80 border border-gray-700/50 rounded-2xl text-white placeholder-gray-500 focus:border-yellow-400/50 focus:outline-none pr-12" />
                      <button onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                        className={`absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg transition-colors ${showEmojiPicker ? 'text-yellow-400 bg-gray-700/50' : 'text-gray-400 hover:text-yellow-400'}`}>
                        <Smile className="w-5 h-5" />
                      </button>
                    </div>
                    <button onClick={() => sendMessage()} disabled={!newMessage.trim() || uploadingMedia}
                      className={`p-3.5 bg-gradient-to-r ${currentTheme.gradient} hover:opacity-90 text-gray-900 rounded-2xl disabled:opacity-50 shadow-lg`}>
                      <Send className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}
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


      {/* Create group modal */}
      {showCreateGroup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-2xl w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700">
              <h3 className="text-xl font-bold text-white">Tạo nhóm chat</h3>
              <button onClick={() => setShowCreateGroup(false)} className="p-2 hover:bg-gray-700 rounded-lg text-gray-400">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Tên nhóm</label>
                <input type="text" value={newGroupName} onChange={e => setNewGroupName(e.target.value)}
                  placeholder="Nhập tên nhóm..." className="w-full px-4 py-3 bg-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400" />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Chọn thành viên</label>
                <div className="max-h-48 overflow-y-auto space-y-2">
                  {conversations.map(conv => (
                    <label key={conv.friend_id} className="flex items-center gap-3 p-3 bg-gray-700/50 rounded-xl cursor-pointer hover:bg-gray-700">
                      <input type="checkbox" checked={selectedGroupMembers.includes(conv.friend_id)}
                        onChange={e => {
                          if (e.target.checked) setSelectedGroupMembers(prev => [...prev, conv.friend_id]);
                          else setSelectedGroupMembers(prev => prev.filter(id => id !== conv.friend_id));
                        }}
                        className="w-5 h-5 rounded border-gray-600 text-yellow-400 focus:ring-yellow-400" />
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600">
                        {conv.friend_avatar ? <img src={conv.friend_avatar} alt="" className="w-full h-full object-cover" /> :
                          <div className="w-full h-full flex items-center justify-center text-white font-bold">{(conv.friend_username || '?')[0]?.toUpperCase()}</div>}
                      </div>
                      <span className="text-white">{conv.friend_full_name || conv.friend_username}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-700 flex gap-3">
              <button onClick={() => setShowCreateGroup(false)} className="flex-1 py-3 bg-gray-700 text-white rounded-xl font-medium hover:bg-gray-600">
                Hủy
              </button>
              <button onClick={createGroupChat} disabled={!newGroupName.trim() || selectedGroupMembers.length === 0}
                className="flex-1 py-3 bg-yellow-400 text-gray-900 rounded-xl font-medium hover:bg-yellow-500 disabled:opacity-50">
                Tạo nhóm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
