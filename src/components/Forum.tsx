import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { 
  MessageSquare, Search, Filter, Plus, ArrowLeft, Eye, Clock, 
  ThumbsUp, ThumbsDown, Bookmark, BookmarkCheck, CheckCircle2, 
  Pin, Tag, User, Send, Reply, MoreHorizontal, Trash2, Edit3,
  TrendingUp, HelpCircle, Flame, Award, Crown, Shield, Star,
  ChevronRight, MessageCircle, Zap, Code, Database,
  GitBranch, Palette, Briefcase, Lightbulb, PartyPopper, Coffee,
  Bell, Flag, AtSign, Hash, X, AlertTriangle, Medal
} from 'lucide-react';

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  color: string;
  post_count: number;
  sort_order: number;
}

interface Author {
  id: string;
  username: string;
  avatar_url: string | null;
  level: number;
  reputation?: number;
}

interface Post {
  id: string;
  category_id: string;
  user_id: string;
  title: string;
  content: string;
  tags: string[];
  view_count: number;
  reply_count: number;
  vote_count: number;
  is_pinned: boolean;
  is_solved: boolean;
  created_at: string;
  updated_at: string;
  category?: Category;
  author?: Author;
}

interface ReplyType {
  id: string;
  post_id: string;
  user_id: string;
  parent_id: string | null;
  content: string;
  vote_count: number;
  is_accepted: boolean;
  created_at: string;
  author?: Author;
  children?: ReplyType[];
}

interface Notification {
  id: string;
  type: 'reply' | 'vote' | 'accepted' | 'mention';
  post_id: string | null;
  reply_id: string | null;
  actor_id: string;
  message: string;
  is_read: boolean;
  created_at: string;
  actor?: { username: string; avatar_url: string | null };
}

interface TrendingTag {
  name: string;
  usage_count: number;
}

interface ForumProps {
  user: { id: string } | null;
}

const categoryIcons: Record<string, React.ElementType> = {
  'python': Code,
  'javascript': Zap,
  'java': Coffee,
  'html-css': Palette,
  'database': Database,
  'git-devops': GitBranch,
  'algorithm': TrendingUp,
  'career': Briefcase,
  'sharing': Lightbulb,
  'off-topic': PartyPopper
};

const getLevelBadge = (level: number) => {
  if (level >= 50) return { name: 'Huyền Thoại', icon: Crown, color: 'text-yellow-400' };
  if (level >= 30) return { name: 'Cao Thủ', icon: Award, color: 'text-purple-400' };
  if (level >= 20) return { name: 'Chuyên Gia', icon: Shield, color: 'text-blue-400' };
  if (level >= 10) return { name: 'Thành Thạo', icon: Star, color: 'text-green-400' };
  return { name: 'Tân Binh', icon: User, color: 'text-gray-400' };
};

export default function Forum({ user }: ForumProps) {
  const [viewMode, setViewMode] = useState<'home' | 'category' | 'post-detail' | 'new-post' | 'bookmarks' | 'notifications'>('home');
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [replies, setReplies] = useState<ReplyType[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'popular' | 'unanswered'>('newest');
  
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newTags, setNewTags] = useState('');
  const [newCategoryId, setNewCategoryId] = useState('');
  const [replyContent, setReplyContent] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [editingReply, setEditingReply] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  
  // Edit Post State
  const [editingPost, setEditingPost] = useState(false);
  const [editPostTitle, setEditPostTitle] = useState('');
  const [editPostContent, setEditPostContent] = useState('');
  const [editPostTags, setEditPostTags] = useState('');
  
  const [userVotes, setUserVotes] = useState<Record<string, 'up' | 'down'>>({});
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [stats, setStats] = useState({ totalPosts: 0, totalReplies: 0, totalUsers: 0 });
  
  // New States for Advanced Features
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [trendingTags, setTrendingTags] = useState<TrendingTag[]>([]);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportTarget, setReportTarget] = useState<{ type: 'post' | 'reply'; id: string } | null>(null);
  const [reportReason, setReportReason] = useState<string>('');
  const [reportDescription, setReportDescription] = useState('');
  const [userStats, setUserStats] = useState<{ reputation: number; posts_count: number; accepted_answers: number } | null>(null);

  useEffect(() => {
    fetchCategories();
    fetchPosts();
    fetchStats();
    fetchTrendingTags();
    if (user) {
      fetchUserVotes();
      fetchBookmarks();
      fetchNotifications();
      fetchUserStats();
    }
  }, [user]);

  useEffect(() => {
    if (selectedCategory) {
      fetchPosts(selectedCategory.id);
    } else {
      fetchPosts();
    }
  }, [sortBy, selectedCategory]);

  const fetchStats = async () => {
    const { count: postsCount } = await supabase.from('forum_posts').select('*', { count: 'exact', head: true });
    const { count: repliesCount } = await supabase.from('forum_replies').select('*', { count: 'exact', head: true });
    const { count: usersCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
    setStats({
      totalPosts: postsCount || 0,
      totalReplies: repliesCount || 0,
      totalUsers: usersCount || 0
    });
  };

  // Fetch trending tags
  const fetchTrendingTags = async () => {
    const { data } = await supabase.from('forum_tags').select('name, usage_count').order('usage_count', { ascending: false }).limit(10);
    if (data) setTrendingTags(data);
  };

  // Fetch notifications
  const fetchNotifications = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('forum_notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20);
    if (data) {
      setNotifications(data);
      setUnreadCount(data.filter(n => !n.is_read).length);
    }
  };

  // Fetch user stats (reputation)
  const fetchUserStats = async () => {
    if (!user) return;
    const { data } = await supabase.from('forum_user_stats').select('*').eq('user_id', user.id).single();
    if (data) setUserStats(data);
  };

  // Mark notifications as read
  const markNotificationsRead = async (ids: string[]) => {
    if (!user || ids.length === 0) return;
    await supabase.from('forum_notifications').update({ is_read: true }).in('id', ids);
    setNotifications(prev => prev.map(n => ids.includes(n.id) ? { ...n, is_read: true } : n));
    setUnreadCount(prev => Math.max(0, prev - ids.length));
  };

  // Report post/reply
  const submitReport = async () => {
    if (!user || !reportTarget || !reportReason) return;
    const reportData = {
      reporter_id: user.id,
      reason: reportReason,
      description: reportDescription,
      ...(reportTarget.type === 'post' ? { post_id: reportTarget.id } : { reply_id: reportTarget.id })
    };
    await supabase.from('forum_reports').insert(reportData);
    setShowReportModal(false);
    setReportTarget(null);
    setReportReason('');
    setReportDescription('');
    alert('Báo cáo đã được gửi. Cảm ơn bạn!');
  };

  const fetchCategories = async () => {
    const { data } = await supabase.from('forum_categories').select('*').order('sort_order');
    if (data) setCategories(data);
  };

  const fetchPosts = async (categoryId?: string) => {
    setLoading(true);
    let query = supabase.from('forum_posts').select('*');
    if (categoryId) query = query.eq('category_id', categoryId);
    if (sortBy === 'popular') query = query.order('vote_count', { ascending: false });
    else if (sortBy === 'unanswered') query = query.eq('reply_count', 0).order('created_at', { ascending: false });
    else query = query.order('is_pinned', { ascending: false }).order('created_at', { ascending: false });
    const { data } = await query.limit(50);
    if (data) {
      const userIds = [...new Set(data.map(p => p.user_id))];
      const { data: profiles } = await supabase.from('profiles').select('id, username, avatar_url, level').in('id', userIds);
      setPosts(data.map(post => ({
        ...post,
        category: categories.find(c => c.id === post.category_id),
        author: profiles?.find(p => p.id === post.user_id)
      })));
    }
    setLoading(false);
  };

  const fetchBookmarkedPosts = async () => {
    if (!user) return;
    setLoading(true);
    const { data: bookmarkData } = await supabase.from('forum_bookmarks').select('post_id').eq('user_id', user.id);
    if (bookmarkData && bookmarkData.length > 0) {
      const postIds = bookmarkData.map(b => b.post_id);
      const { data } = await supabase.from('forum_posts').select('*').in('id', postIds);
      if (data) {
        const userIds = [...new Set(data.map(p => p.user_id))];
        const { data: profiles } = await supabase.from('profiles').select('id, username, avatar_url, level').in('id', userIds);
        setPosts(data.map(post => ({
          ...post,
          category: categories.find(c => c.id === post.category_id),
          author: profiles?.find(p => p.id === post.user_id)
        })));
      }
    } else {
      setPosts([]);
    }
    setLoading(false);
  };

  const fetchPostDetail = async (postId: string) => {
    setLoading(true);
    // Increment view count using RPC or direct update
    try {
      await supabase.rpc('increment_view_count', { post_id: postId });
    } catch {
      // Fallback: Direct update if RPC doesn't exist
      const { data: post } = await supabase.from('forum_posts').select('view_count').eq('id', postId).single();
      if (post) {
        await supabase.from('forum_posts').update({ view_count: (post.view_count || 0) + 1 }).eq('id', postId);
      }
    }
    
    const { data: post } = await supabase.from('forum_posts').select('*').eq('id', postId).single();
    if (post) {
      const { data: author } = await supabase.from('profiles').select('id, username, avatar_url, level').eq('id', post.user_id).single();
      setSelectedPost({ ...post, author, category: categories.find(c => c.id === post.category_id) });
    }
    
    const { data: repliesData } = await supabase.from('forum_replies').select('*').eq('post_id', postId)
      .order('is_accepted', { ascending: false }).order('vote_count', { ascending: false }).order('created_at');
    if (repliesData) {
      const userIds = [...new Set(repliesData.map(r => r.user_id))];
      const { data: profiles } = await supabase.from('profiles').select('id, username, avatar_url, level').in('id', userIds);
      const repliesWithAuthors = repliesData.map(reply => ({
        ...reply, author: profiles?.find(p => p.id === reply.user_id), children: [] as ReplyType[]
      }));
      const rootReplies: ReplyType[] = [];
      const replyMap = new Map<string, ReplyType>();
      repliesWithAuthors.forEach(r => replyMap.set(r.id, r));
      repliesWithAuthors.forEach(r => {
        if (r.parent_id && replyMap.has(r.parent_id)) replyMap.get(r.parent_id)!.children!.push(r);
        else rootReplies.push(r);
      });
      setReplies(rootReplies);
    }
    setLoading(false);
  };

  const fetchUserVotes = async () => {
    if (!user) return;
    const { data } = await supabase.from('forum_votes').select('post_id, reply_id, vote_type').eq('user_id', user.id);
    if (data) {
      const votes: Record<string, 'up' | 'down'> = {};
      data.forEach(v => {
        if (v.post_id) votes[`post_${v.post_id}`] = v.vote_type;
        if (v.reply_id) votes[`reply_${v.reply_id}`] = v.vote_type;
      });
      setUserVotes(votes);
    }
  };

  const fetchBookmarks = async () => {
    if (!user) return;
    const { data } = await supabase.from('forum_bookmarks').select('post_id').eq('user_id', user.id);
    if (data) setBookmarks(data.map(b => b.post_id));
  };

  const handleVote = async (type: 'post' | 'reply', id: string, voteType: 'up' | 'down') => {
    if (!user) return;
    const key = `${type}_${id}`;
    const current = userVotes[key];
    const field = type === 'post' ? 'post_id' : 'reply_id';
    
    if (current === voteType) {
      await supabase.from('forum_votes').delete().eq('user_id', user.id).eq(field, id);
      setUserVotes(prev => { const n = { ...prev }; delete n[key]; return n; });
    } else {
      if (current) {
        await supabase.from('forum_votes').update({ vote_type: voteType }).eq('user_id', user.id).eq(field, id);
      } else {
        await supabase.from('forum_votes').insert({ user_id: user.id, [field]: id, vote_type: voteType });
      }
      setUserVotes(prev => ({ ...prev, [key]: voteType }));
    }
    if (selectedPost) fetchPostDetail(selectedPost.id);
  };

  const handleBookmark = async (postId: string) => {
    if (!user) return;
    if (bookmarks.includes(postId)) {
      await supabase.from('forum_bookmarks').delete().eq('user_id', user.id).eq('post_id', postId);
      setBookmarks(prev => prev.filter(id => id !== postId));
    } else {
      await supabase.from('forum_bookmarks').insert({ user_id: user.id, post_id: postId });
      setBookmarks(prev => [...prev, postId]);
    }
  };

  const createPost = async () => {
    if (!user || !newTitle.trim() || !newContent.trim() || !newCategoryId) return;
    setLoading(true);
    const { data, error } = await supabase.from('forum_posts').insert({
      user_id: user.id, category_id: newCategoryId, title: newTitle.trim(), content: newContent.trim(),
      tags: newTags.split(',').map(t => t.trim().toLowerCase()).filter(t => t)
    }).select().single();
    if (!error && data) {
      setNewTitle(''); setNewContent(''); setNewTags(''); setNewCategoryId('');
      await fetchPostDetail(data.id);
      setViewMode('post-detail');
    }
    setLoading(false);
  };

  const createReply = async (parentId?: string) => {
    if (!user || !selectedPost || !replyContent.trim()) return;
    await supabase.from('forum_replies').insert({
      post_id: selectedPost.id, user_id: user.id, parent_id: parentId || null, content: replyContent.trim()
    });
    setReplyContent(''); setReplyingTo(null);
    fetchPostDetail(selectedPost.id);
  };

  const updateReply = async (replyId: string) => {
    if (!user || !editContent.trim()) return;
    await supabase.from('forum_replies').update({ content: editContent.trim(), updated_at: new Date().toISOString() }).eq('id', replyId);
    setEditingReply(null); setEditContent('');
    if (selectedPost) fetchPostDetail(selectedPost.id);
  };

  const deleteReply = async (replyId: string) => {
    if (!confirm('Xóa câu trả lời này?')) return;
    await supabase.from('forum_replies').delete().eq('id', replyId);
    if (selectedPost) fetchPostDetail(selectedPost.id);
  };

  const markAsSolved = async (replyId: string) => {
    if (!user || !selectedPost || selectedPost.user_id !== user.id) return;
    await supabase.from('forum_posts').update({ is_solved: true }).eq('id', selectedPost.id);
    await supabase.from('forum_replies').update({ is_accepted: false }).eq('post_id', selectedPost.id);
    await supabase.from('forum_replies').update({ is_accepted: true }).eq('id', replyId);
    fetchPostDetail(selectedPost.id);
  };

  const deletePost = async () => {
    if (!selectedPost || !confirm('Xóa bài viết này?')) return;
    await supabase.from('forum_posts').delete().eq('id', selectedPost.id);
    setViewMode('home'); setSelectedPost(null); fetchPosts();
  };

  const startEditPost = () => {
    if (!selectedPost) return;
    setEditPostTitle(selectedPost.title);
    setEditPostContent(selectedPost.content);
    setEditPostTags(selectedPost.tags?.join(', ') || '');
    setEditingPost(true);
  };

  const cancelEditPost = () => {
    setEditingPost(false);
    setEditPostTitle('');
    setEditPostContent('');
    setEditPostTags('');
  };

  const updatePost = async () => {
    if (!user || !selectedPost || !editPostTitle.trim() || !editPostContent.trim()) return;
    setLoading(true);
    const { error } = await supabase.from('forum_posts').update({
      title: editPostTitle.trim(),
      content: editPostContent.trim(),
      tags: editPostTags.split(',').map(t => t.trim().toLowerCase()).filter(t => t),
      updated_at: new Date().toISOString()
    }).eq('id', selectedPost.id);
    
    if (!error) {
      cancelEditPost();
      fetchPostDetail(selectedPost.id);
    }
    setLoading(false);
  };

  const formatDate = (date: string) => {
    const d = new Date(date);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (mins < 1) return 'Vừa xong';
    if (mins < 60) return `${mins} phút trước`;
    if (hours < 24) return `${hours} giờ trước`;
    if (days < 7) return `${days} ngày trước`;
    return d.toLocaleDateString('vi-VN');
  };

  const filteredPosts = posts.filter(p =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.tags?.some(t => t.includes(searchQuery.toLowerCase()))
  );

  // Components
  const AuthorBadge = ({ author, size = 'md' }: { author?: Author; size?: 'sm' | 'md' | 'lg' }) => {
    if (!author) return null;
    const badge = getLevelBadge(author.level || 1);
    const BadgeIcon = badge.icon;
    const sizes = {
      sm: { avatar: 'w-6 h-6', icon: 'w-3 h-3', text: 'text-xs' },
      md: { avatar: 'w-10 h-10', icon: 'w-4 h-4', text: 'text-sm' },
      lg: { avatar: 'w-12 h-12', icon: 'w-5 h-5', text: 'text-base' }
    };
    const s = sizes[size];
    return (
      <div className="flex items-center gap-2">
        <div className={`${s.avatar} rounded-full bg-gradient-to-br from-gray-700 to-gray-800 overflow-hidden ring-2 ring-gray-600`}>
          {author.avatar_url ? (
            <img src={author.avatar_url} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <User className={`${s.icon} text-gray-500`} />
            </div>
          )}
        </div>
        <div>
          <div className={`font-medium text-white ${s.text}`}>{author.username}</div>
          <div className={`${s.text} flex items-center gap-1 ${badge.color}`}>
            <BadgeIcon className="w-3 h-3" />
            <span>{badge.name}</span>
            <span className="text-gray-500">• Lv.{author.level}</span>
          </div>
        </div>
      </div>
    );
  };

  const VoteButtons = ({ type, id, voteCount, vertical = false }: { type: 'post' | 'reply'; id: string; voteCount: number; vertical?: boolean }) => {
    const key = `${type}_${id}`;
    const current = userVotes[key];
    return (
      <div className={`flex ${vertical ? 'flex-col' : ''} items-center gap-1`}>
        <button 
          onClick={() => handleVote(type, id, 'up')} 
          disabled={!user}
          className={`p-2 rounded-lg transition-all duration-200 ${
            current === 'up' 
              ? 'bg-green-500/20 text-green-400 scale-110' 
              : 'hover:bg-gray-700/50 text-gray-400 hover:text-green-400'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          <ThumbsUp className="w-5 h-5" />
        </button>
        <span className={`text-lg font-bold min-w-[2rem] text-center ${
          voteCount > 0 ? 'text-green-400' : voteCount < 0 ? 'text-red-400' : 'text-gray-500'
        }`}>
          {voteCount}
        </span>
        <button 
          onClick={() => handleVote(type, id, 'down')} 
          disabled={!user}
          className={`p-2 rounded-lg transition-all duration-200 ${
            current === 'down' 
              ? 'bg-red-500/20 text-red-400 scale-110' 
              : 'hover:bg-gray-700/50 text-gray-400 hover:text-red-400'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          <ThumbsDown className="w-5 h-5" />
        </button>
      </div>
    );
  };


  const CategoryCard = ({ category }: { category: Category }) => {
    const IconComponent = categoryIcons[category.slug] || MessageSquare;
    const colorClasses: Record<string, string> = {
      yellow: 'from-yellow-500/20 to-yellow-600/10 border-yellow-500/30 hover:border-yellow-400/50',
      amber: 'from-amber-500/20 to-amber-600/10 border-amber-500/30 hover:border-amber-400/50',
      orange: 'from-orange-500/20 to-orange-600/10 border-orange-500/30 hover:border-orange-400/50',
      pink: 'from-pink-500/20 to-pink-600/10 border-pink-500/30 hover:border-pink-400/50',
      blue: 'from-blue-500/20 to-blue-600/10 border-blue-500/30 hover:border-blue-400/50',
      gray: 'from-gray-500/20 to-gray-600/10 border-gray-500/30 hover:border-gray-400/50',
      purple: 'from-purple-500/20 to-purple-600/10 border-purple-500/30 hover:border-purple-400/50',
      green: 'from-green-500/20 to-green-600/10 border-green-500/30 hover:border-green-400/50',
      cyan: 'from-cyan-500/20 to-cyan-600/10 border-cyan-500/30 hover:border-cyan-400/50',
      red: 'from-red-500/20 to-red-600/10 border-red-500/30 hover:border-red-400/50'
    };
    const iconColors: Record<string, string> = {
      yellow: 'text-yellow-400', amber: 'text-amber-400', orange: 'text-orange-400',
      pink: 'text-pink-400', blue: 'text-blue-400', gray: 'text-gray-400',
      purple: 'text-purple-400', green: 'text-green-400', cyan: 'text-cyan-400', red: 'text-red-400'
    };
    
    return (
      <button
        onClick={() => { setSelectedCategory(category); setViewMode('category'); }}
        className={`p-4 rounded-xl bg-gradient-to-br ${colorClasses[category.color] || colorClasses.blue} 
          border backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] hover:shadow-lg 
          hover:shadow-${category.color}-500/10 text-left group`}
      >
        <div className="flex items-start gap-3">
          <div className={`p-2.5 rounded-lg bg-gray-800/50 ${iconColors[category.color] || 'text-blue-400'}`}>
            <IconComponent className="w-6 h-6" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-white group-hover:text-white/90 truncate">{category.name}</h3>
            <p className="text-sm text-gray-400 line-clamp-2 mt-1">{category.description}</p>
            <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
              <MessageSquare className="w-3.5 h-3.5" />
              <span>{category.post_count} bài viết</span>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-500 group-hover:text-white/70 transition-colors" />
        </div>
      </button>
    );
  };

  const PostCard = ({ post }: { post: Post }) => {
    const category = categories.find(c => c.id === post.category_id) || post.category;
    return (
      <div 
        onClick={() => { fetchPostDetail(post.id); setViewMode('post-detail'); }}
        className={`p-4 rounded-xl bg-gray-800/40 border border-gray-700/50 hover:border-gray-600 
          transition-all duration-200 cursor-pointer hover:bg-gray-800/60 group ${
          post.is_pinned ? 'ring-1 ring-yellow-500/30' : ''
        }`}
      >
        <div className="flex gap-4">
          {/* Vote count */}
          <div className="hidden sm:flex flex-col items-center justify-center min-w-[60px] py-2">
            <div className={`text-2xl font-bold ${
              post.vote_count > 0 ? 'text-green-400' : post.vote_count < 0 ? 'text-red-400' : 'text-gray-500'
            }`}>
              {post.vote_count}
            </div>
            <div className="text-xs text-gray-500">votes</div>
          </div>
          
          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-2">
              {post.is_pinned && (
                <span className="px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400 text-xs flex items-center gap-1">
                  <Pin className="w-3 h-3" /> Ghim
                </span>
              )}
              {post.is_solved && (
                <span className="px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 text-xs flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Đã giải quyết
                </span>
              )}
              {category && (
                <span className="px-2 py-0.5 rounded-full bg-gray-700/50 text-gray-300 text-xs">
                  {category.icon} {category.name}
                </span>
              )}
            </div>
            
            <h3 className="font-semibold text-white group-hover:text-blue-400 transition-colors line-clamp-2 mb-2">
              {post.title}
            </h3>
            
            <p className="text-sm text-gray-400 line-clamp-2 mb-3">{post.content}</p>
            
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-3">
                {post.tags.slice(0, 4).map((tag, i) => (
                  <span key={i} className="px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-400 text-xs">
                    #{tag}
                  </span>
                ))}
                {post.tags.length > 4 && (
                  <span className="text-xs text-gray-500">+{post.tags.length - 4}</span>
                )}
              </div>
            )}
            
            <div className="flex items-center justify-between">
              <AuthorBadge author={post.author} size="sm" />
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <Eye className="w-3.5 h-3.5" /> {post.view_count}
                </span>
                <span className="flex items-center gap-1">
                  <MessageCircle className="w-3.5 h-3.5" /> {post.reply_count}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> {formatDate(post.created_at)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const ReplyCard = ({ reply, depth = 0 }: { reply: ReplyType; depth?: number }) => {
    const isOwner = user?.id === reply.user_id;
    const isPostOwner = user?.id === selectedPost?.user_id;
    
    return (
      <div className={`${depth > 0 ? 'ml-6 sm:ml-12 border-l-2 border-gray-700/50 pl-4' : ''}`}>
        <div className={`p-4 rounded-xl ${
          reply.is_accepted 
            ? 'bg-green-500/10 border border-green-500/30' 
            : 'bg-gray-800/40 border border-gray-700/50'
        } transition-all duration-200`}>
          {reply.is_accepted && (
            <div className="flex items-center gap-2 text-green-400 text-sm mb-3 pb-3 border-b border-green-500/20">
              <CheckCircle2 className="w-5 h-5" />
              <span className="font-medium">Câu trả lời được chấp nhận</span>
            </div>
          )}
          
          <div className="flex gap-4">
            <div className="hidden sm:block">
              <VoteButtons type="reply" id={reply.id} voteCount={reply.vote_count} vertical />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-3">
                <AuthorBadge author={reply.author} size="sm" />
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">{formatDate(reply.created_at)}</span>
                  <div className="relative group">
                    <button className="p-1.5 rounded-lg hover:bg-gray-700/50 text-gray-400">
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                    <div className="absolute right-0 top-full mt-1 py-1 bg-gray-800 rounded-lg border border-gray-700 shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 min-w-[120px]">
                      {isOwner && (
                        <button 
                          onClick={(e) => { e.stopPropagation(); setEditingReply(reply.id); setEditContent(reply.content); }}
                          className="w-full px-3 py-2 text-left text-sm text-gray-300 hover:bg-gray-700/50 flex items-center gap-2"
                        >
                          <Edit3 className="w-4 h-4" /> Sửa
                        </button>
                      )}
                      {isOwner && (
                        <button 
                          onClick={(e) => { e.stopPropagation(); deleteReply(reply.id); }}
                          className="w-full px-3 py-2 text-left text-sm text-red-400 hover:bg-gray-700/50 flex items-center gap-2"
                        >
                          <Trash2 className="w-4 h-4" /> Xóa
                        </button>
                      )}
                      {isPostOwner && !reply.is_accepted && !selectedPost?.is_solved && (
                        <button 
                          onClick={(e) => { e.stopPropagation(); markAsSolved(reply.id); }}
                          className="w-full px-3 py-2 text-left text-sm text-green-400 hover:bg-gray-700/50 flex items-center gap-2"
                        >
                          <CheckCircle2 className="w-4 h-4" /> Chấp nhận
                        </button>
                      )}
                      {user && !isOwner && (
                        <button 
                          onClick={(e) => { e.stopPropagation(); setReportTarget({ type: 'reply', id: reply.id }); setShowReportModal(true); }}
                          className="w-full px-3 py-2 text-left text-sm text-orange-400 hover:bg-gray-700/50 flex items-center gap-2"
                        >
                          <Flag className="w-4 h-4" /> Báo cáo
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              {editingReply === reply.id ? (
                <div className="space-y-3">
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="w-full p-3 rounded-lg bg-gray-900/50 border border-gray-600 text-white resize-none focus:outline-none focus:border-blue-500"
                    rows={4}
                  />
                  <div className="flex gap-2">
                    <button onClick={() => updateReply(reply.id)} className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-500">
                      Lưu
                    </button>
                    <button onClick={() => setEditingReply(null)} className="px-4 py-2 rounded-lg bg-gray-700 text-white text-sm hover:bg-gray-600">
                      Hủy
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-gray-300 whitespace-pre-wrap">{reply.content}</div>
              )}
              
              <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-700/50">
                <div className="sm:hidden">
                  <VoteButtons type="reply" id={reply.id} voteCount={reply.vote_count} />
                </div>
                {user && depth < 2 && (
                  <button 
                    onClick={() => setReplyingTo(replyingTo === reply.id ? null : reply.id)}
                    className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-blue-400 transition-colors"
                  >
                    <Reply className="w-4 h-4" /> Trả lời
                  </button>
                )}
              </div>
              
              {replyingTo === reply.id && (
                <div className="mt-3 space-y-2">
                  <textarea
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    placeholder="Viết câu trả lời..."
                    className="w-full p-3 rounded-lg bg-gray-900/50 border border-gray-600 text-white resize-none focus:outline-none focus:border-blue-500"
                    rows={3}
                  />
                  <div className="flex gap-2">
                    <button 
                      onClick={() => createReply(reply.id)} 
                      disabled={!replyContent.trim()}
                      className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-500 disabled:opacity-50"
                    >
                      Gửi
                    </button>
                    <button onClick={() => { setReplyingTo(null); setReplyContent(''); }} className="px-4 py-2 rounded-lg bg-gray-700 text-white text-sm hover:bg-gray-600">
                      Hủy
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {reply.children && reply.children.length > 0 && (
          <div className="mt-3 space-y-3">
            {reply.children.map(child => (
              <ReplyCard key={child.id} reply={child} depth={depth + 1} />
            ))}
          </div>
        )}
      </div>
    );
  };

  // ================ RENDER VIEWS ================
  
  // Home View
  const renderHome = () => (
    <div className="space-y-6">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600/20 via-purple-600/20 to-pink-600/20 border border-gray-700/50 p-6 md:p-8">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
        <div className="relative">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-blue-500/20">
              <MessageSquare className="w-8 h-8 text-blue-400" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white">Diễn Đàn Hỏi Đáp</h1>
              <p className="text-gray-400">Nơi kết nối & chia sẻ kiến thức lập trình</p>
            </div>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="text-center p-3 rounded-xl bg-gray-800/50 backdrop-blur-sm">
              <div className="text-2xl font-bold text-white">{stats.totalPosts}</div>
              <div className="text-xs text-gray-400">Bài viết</div>
            </div>
            <div className="text-center p-3 rounded-xl bg-gray-800/50 backdrop-blur-sm">
              <div className="text-2xl font-bold text-white">{stats.totalReplies}</div>
              <div className="text-xs text-gray-400">Câu trả lời</div>
            </div>
            <div className="text-center p-3 rounded-xl bg-gray-800/50 backdrop-blur-sm">
              <div className="text-2xl font-bold text-white">{stats.totalUsers}</div>
              <div className="text-xs text-gray-400">Thành viên</div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3">
        {user && (
          <button
            onClick={() => setViewMode('new-post')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 text-white font-medium hover:from-blue-500 hover:to-blue-400 transition-all shadow-lg shadow-blue-500/20"
          >
            <Plus className="w-5 h-5" /> Đặt câu hỏi
          </button>
        )}
        {user && (
          <button
            onClick={() => { setViewMode('bookmarks'); fetchBookmarkedPosts(); }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gray-800 text-gray-300 hover:bg-gray-700 transition-all border border-gray-700"
          >
            <Bookmark className="w-5 h-5" /> Đã lưu ({bookmarks.length})
          </button>
        )}
        {user && (
          <button
            onClick={() => { setViewMode('notifications'); fetchNotifications(); }}
            className="relative flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gray-800 text-gray-300 hover:bg-gray-700 transition-all border border-gray-700"
          >
            <Bell className="w-5 h-5" /> Thông báo
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
        )}
        {user && userStats && (
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/30 text-yellow-400">
            <Medal className="w-5 h-5" />
            <span className="font-medium">{userStats.reputation}</span>
            <span className="text-yellow-400/70 text-sm">điểm</span>
          </div>
        )}
      </div>

      {/* Trending Tags */}
      {trendingTags.length > 0 && (
        <div className="p-4 rounded-xl bg-gray-800/40 border border-gray-700/50">
          <h3 className="text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
            <Hash className="w-4 h-4 text-purple-400" /> Tags phổ biến
          </h3>
          <div className="flex flex-wrap gap-2">
            {trendingTags.map((tag, i) => (
              <button
                key={i}
                onClick={() => setSearchQuery(tag.name)}
                className="px-3 py-1.5 rounded-lg bg-purple-500/10 text-purple-400 text-sm hover:bg-purple-500/20 transition-colors flex items-center gap-1"
              >
                #{tag.name}
                <span className="text-xs text-purple-400/60">({tag.usage_count})</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Categories Grid */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Tag className="w-5 h-5 text-blue-400" /> Danh mục
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {categories.map(cat => (
            <CategoryCard key={cat.id} category={cat} />
          ))}
        </div>
      </div>

      {/* Recent Posts */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Flame className="w-5 h-5 text-orange-400" /> Bài viết mới nhất
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSortBy('newest')}
              className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
                sortBy === 'newest' ? 'bg-blue-500/20 text-blue-400' : 'text-gray-400 hover:bg-gray-800'
              }`}
            >
              Mới nhất
            </button>
            <button
              onClick={() => setSortBy('popular')}
              className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
                sortBy === 'popular' ? 'bg-blue-500/20 text-blue-400' : 'text-gray-400 hover:bg-gray-800'
              }`}
            >
              Phổ biến
            </button>
            <button
              onClick={() => setSortBy('unanswered')}
              className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
                sortBy === 'unanswered' ? 'bg-blue-500/20 text-blue-400' : 'text-gray-400 hover:bg-gray-800'
              }`}
            >
              Chưa trả lời
            </button>
          </div>
        </div>
        
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredPosts.length > 0 ? (
          <div className="space-y-3">
            {filteredPosts.slice(0, 10).map(post => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <HelpCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>Chưa có bài viết nào</p>
            {user && (
              <button
                onClick={() => setViewMode('new-post')}
                className="mt-4 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-500"
              >
                Đặt câu hỏi đầu tiên
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );

  // Category View  
  const renderCategory = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => { setViewMode('home'); setSelectedCategory(null); fetchPosts(); }}
          className="p-2 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            {selectedCategory?.icon} {selectedCategory?.name}
          </h1>
          <p className="text-sm text-gray-400">{selectedCategory?.description}</p>
        </div>
        {user && (
          <button
            onClick={() => { setNewCategoryId(selectedCategory?.id || ''); setViewMode('new-post'); }}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-500"
          >
            <Plus className="w-4 h-4" /> Đặt câu hỏi
          </button>
        )}
      </div>

      {/* Search & Sort */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm kiếm bài viết..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-gray-800/50 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-500" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'newest' | 'popular' | 'unanswered')}
            className="px-3 py-2.5 rounded-xl bg-gray-800/50 border border-gray-700 text-white focus:outline-none focus:border-blue-500"
          >
            <option value="newest">Mới nhất</option>
            <option value="popular">Phổ biến nhất</option>
            <option value="unanswered">Chưa trả lời</option>
          </select>
        </div>
      </div>

      {/* Posts List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filteredPosts.length > 0 ? (
        <div className="space-y-3">
          {filteredPosts.map(post => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500">
          <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>Chưa có bài viết nào trong danh mục này</p>
          {user && (
            <button
              onClick={() => { setNewCategoryId(selectedCategory?.id || ''); setViewMode('new-post'); }}
              className="mt-4 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-500"
            >
              Đặt câu hỏi đầu tiên
            </button>
          )}
        </div>
      )}
    </div>
  );

  // Post Detail View
  const renderPostDetail = () => {
    if (!selectedPost) return null;
    
    const isOwner = user?.id === selectedPost.user_id;
    const category = categories.find(c => c.id === selectedPost.category_id) || selectedPost.category;
    
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => { 
              cancelEditPost();
              if (selectedCategory) {
                setViewMode('category');
                fetchPosts(selectedCategory.id);
              } else {
                setViewMode('home');
                fetchPosts();
              }
              setSelectedPost(null);
            }}
            className="p-2 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1 flex items-center gap-2 flex-wrap">
            {category && (
              <span 
                onClick={() => { setSelectedCategory(category); setViewMode('category'); fetchPosts(category.id); }}
                className="px-2 py-1 rounded-lg bg-gray-800 text-gray-300 text-sm cursor-pointer hover:bg-gray-700"
              >
                {category.icon} {category.name}
              </span>
            )}
            {selectedPost.is_solved && (
              <span className="px-2 py-1 rounded-lg bg-green-500/20 text-green-400 text-sm flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> Đã giải quyết
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleBookmark(selectedPost.id)}
              className={`p-2 rounded-lg transition-colors ${
                bookmarks.includes(selectedPost.id)
                  ? 'bg-yellow-500/20 text-yellow-400'
                  : 'hover:bg-gray-800 text-gray-400 hover:text-yellow-400'
              }`}
            >
              {bookmarks.includes(selectedPost.id) ? <BookmarkCheck className="w-5 h-5" /> : <Bookmark className="w-5 h-5" />}
            </button>
            {user && !isOwner && (
              <button
                onClick={() => { setReportTarget({ type: 'post', id: selectedPost.id }); setShowReportModal(true); }}
                className="p-2 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-orange-400 transition-colors"
                title="Báo cáo bài viết"
              >
                <Flag className="w-5 h-5" />
              </button>
            )}
            {isOwner && !editingPost && (
              <button
                onClick={startEditPost}
                className="p-2 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-blue-400 transition-colors"
              >
                <Edit3 className="w-5 h-5" />
              </button>
            )}
            {isOwner && (
              <button
                onClick={deletePost}
                className="p-2 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-red-400 transition-colors"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Post Content */}
        <div className="bg-gray-800/40 rounded-xl border border-gray-700/50 overflow-hidden">
          <div className="p-6">
            {editingPost ? (
              /* Edit Mode */
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Tiêu đề</label>
                  <input
                    type="text"
                    value={editPostTitle}
                    onChange={(e) => setEditPostTitle(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg bg-gray-900/50 border border-gray-600 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Nội dung</label>
                  <textarea
                    value={editPostContent}
                    onChange={(e) => setEditPostContent(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg bg-gray-900/50 border border-gray-600 text-white resize-none focus:outline-none focus:border-blue-500 min-h-[200px] font-mono"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Tags</label>
                  <input
                    type="text"
                    value={editPostTags}
                    onChange={(e) => setEditPostTags(e.target.value)}
                    placeholder="python, django, api (phân cách bằng dấu phẩy)"
                    className="w-full px-4 py-3 rounded-lg bg-gray-900/50 border border-gray-600 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="flex items-center gap-3 pt-4 border-t border-gray-700">
                  <button
                    onClick={updatePost}
                    disabled={!editPostTitle.trim() || !editPostContent.trim() || loading}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    {loading ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4" />
                    )}
                    Lưu thay đổi
                  </button>
                  <button
                    onClick={cancelEditPost}
                    className="px-5 py-2.5 rounded-lg bg-gray-700 text-gray-300 hover:bg-gray-600 transition-colors"
                  >
                    Hủy
                  </button>
                </div>
              </div>
            ) : (
              /* View Mode */
              <>
                <h1 className="text-xl md:text-2xl font-bold text-white mb-4">{selectedPost.title}</h1>
                
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-700/50">
                  <AuthorBadge author={selectedPost.author} size="md" />
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Eye className="w-4 h-4" /> {selectedPost.view_count}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" /> {formatDate(selectedPost.created_at)}
                    </span>
                    {selectedPost.updated_at !== selectedPost.created_at && (
                      <span className="text-gray-600">(đã chỉnh sửa)</span>
                    )}
                  </div>
                </div>
                
                <div className="prose prose-invert max-w-none">
                  <div className="text-gray-300 whitespace-pre-wrap leading-relaxed">{selectedPost.content}</div>
                </div>
                
                {selectedPost.tags && selectedPost.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-6 pt-4 border-t border-gray-700/50">
                    {selectedPost.tags.map((tag, i) => (
                      <span key={i} className="px-3 py-1 rounded-lg bg-blue-500/10 text-blue-400 text-sm">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
          
          {/* Vote Bar */}
          {!editingPost && (
            <div className="px-6 py-4 bg-gray-900/50 border-t border-gray-700/50 flex items-center justify-between">
              <VoteButtons type="post" id={selectedPost.id} voteCount={selectedPost.vote_count} />
              <div className="flex items-center gap-2 text-gray-500">
                <MessageCircle className="w-5 h-5" />
                <span>{selectedPost.reply_count} câu trả lời</span>
              </div>
            </div>
          )}
        </div>

        {/* Replies Section */}
        {!editingPost && (
          <div>
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-blue-400" />
              {replies.length} Câu trả lời
            </h2>
            
            {/* Reply Input */}
            {user ? (
              <div className="mb-6 p-4 rounded-xl bg-gray-800/40 border border-gray-700/50">
                <textarea
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder="Viết câu trả lời của bạn..."
                  className="w-full p-4 rounded-lg bg-gray-900/50 border border-gray-600 text-white placeholder-gray-500 resize-none focus:outline-none focus:border-blue-500 min-h-[120px]"
                />
                <div className="flex justify-end mt-3">
                  <button
                    onClick={() => createReply()}
                    disabled={!replyContent.trim()}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    <Send className="w-4 h-4" /> Gửi câu trả lời
                  </button>
                </div>
              </div>
            ) : (
              <div className="mb-6 p-4 rounded-xl bg-gray-800/40 border border-gray-700/50 text-center">
                <p className="text-gray-400">Đăng nhập để trả lời câu hỏi này</p>
              </div>
            )}
            
            {/* Replies List */}
            {replies.length > 0 ? (
              <div className="space-y-4">
                {replies.map(reply => (
                  <ReplyCard key={reply.id} reply={reply} />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <MessageSquare className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <p>Chưa có câu trả lời nào</p>
                <p className="text-sm mt-1">Hãy là người đầu tiên trả lời!</p>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  // New Post View
  const renderNewPost = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => { 
            if (selectedCategory) {
              setViewMode('category');
            } else {
              setViewMode('home');
            }
          }}
          className="p-2 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-bold text-white">Đặt câu hỏi mới</h1>
      </div>

      {/* Form */}
      <div className="bg-gray-800/40 rounded-xl border border-gray-700/50 p-6 space-y-5">
        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Danh mục *</label>
          <select
            value={newCategoryId}
            onChange={(e) => setNewCategoryId(e.target.value)}
            className="w-full px-4 py-3 rounded-lg bg-gray-900/50 border border-gray-600 text-white focus:outline-none focus:border-blue-500"
          >
            <option value="">Chọn danh mục</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
            ))}
          </select>
        </div>

        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Tiêu đề *</label>
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Tiêu đề câu hỏi của bạn..."
            className="w-full px-4 py-3 rounded-lg bg-gray-900/50 border border-gray-600 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
          />
          <p className="text-xs text-gray-500 mt-1">Tiêu đề nên ngắn gọn và mô tả rõ vấn đề của bạn</p>
        </div>

        {/* Content */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Nội dung *</label>
          <textarea
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            placeholder="Mô tả chi tiết vấn đề của bạn. Nếu có code, hãy paste vào đây..."
            className="w-full px-4 py-3 rounded-lg bg-gray-900/50 border border-gray-600 text-white placeholder-gray-500 resize-none focus:outline-none focus:border-blue-500 min-h-[200px] font-mono"
          />
          <p className="text-xs text-gray-500 mt-1">Cung cấp đầy đủ thông tin: code, lỗi gặp phải, những gì bạn đã thử...</p>
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Tags</label>
          <input
            type="text"
            value={newTags}
            onChange={(e) => setNewTags(e.target.value)}
            placeholder="python, django, api (phân cách bằng dấu phẩy)"
            className="w-full px-4 py-3 rounded-lg bg-gray-900/50 border border-gray-600 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
          />
          <p className="text-xs text-gray-500 mt-1">Tags giúp người khác tìm thấy câu hỏi của bạn dễ dàng hơn</p>
        </div>

        {/* Submit */}
        <div className="flex items-center gap-4 pt-4 border-t border-gray-700">
          <button
            onClick={createPost}
            disabled={!newTitle.trim() || !newContent.trim() || !newCategoryId || loading}
            className="flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-blue-500 text-white font-medium hover:from-blue-500 hover:to-blue-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
            Đăng câu hỏi
          </button>
          <button
            onClick={() => {
              if (selectedCategory) {
                setViewMode('category');
              } else {
                setViewMode('home');
              }
            }}
            className="px-6 py-3 rounded-lg bg-gray-700 text-gray-300 hover:bg-gray-600 transition-colors"
          >
            Hủy
          </button>
        </div>

        {/* Tips */}
        <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
          <h3 className="text-sm font-medium text-blue-400 mb-2 flex items-center gap-2">
            <Lightbulb className="w-4 h-4" /> Mẹo đặt câu hỏi hay
          </h3>
          <ul className="text-xs text-gray-400 space-y-1">
            <li>• Mô tả rõ ràng vấn đề bạn đang gặp phải</li>
            <li>• Đính kèm code và thông báo lỗi (nếu có)</li>
            <li>• Liệt kê những gì bạn đã thử</li>
            <li>• Sử dụng tags phù hợp để dễ tìm kiếm</li>
          </ul>
        </div>
      </div>
    </div>
  );

  // Bookmarks View
  const renderBookmarks = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => { setViewMode('home'); fetchPosts(); }}
          className="p-2 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Bookmark className="w-5 h-5 text-yellow-400" /> Bài viết đã lưu
          </h1>
          <p className="text-sm text-gray-400">{bookmarks.length} bài viết</p>
        </div>
      </div>

      {/* Posts */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filteredPosts.length > 0 ? (
        <div className="space-y-3">
          {filteredPosts.map(post => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500">
          <Bookmark className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>Bạn chưa lưu bài viết nào</p>
          <button
            onClick={() => { setViewMode('home'); fetchPosts(); }}
            className="mt-4 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-500"
          >
            Khám phá diễn đàn
          </button>
        </div>
      )}
    </div>
  );

  // Notifications View
  const renderNotifications = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => { setViewMode('home'); fetchPosts(); }}
            className="p-2 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <Bell className="w-5 h-5 text-blue-400" /> Thông báo
            </h1>
            <p className="text-sm text-gray-400">{unreadCount} chưa đọc</p>
          </div>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={() => markNotificationsRead(notifications.filter(n => !n.is_read).map(n => n.id))}
            className="text-sm text-blue-400 hover:text-blue-300"
          >
            Đánh dấu tất cả đã đọc
          </button>
        )}
      </div>

      {/* Notifications List */}
      {notifications.length > 0 ? (
        <div className="space-y-2">
          {notifications.map(notif => (
            <div
              key={notif.id}
              onClick={() => {
                if (!notif.is_read) markNotificationsRead([notif.id]);
                if (notif.post_id) {
                  fetchPostDetail(notif.post_id);
                  setViewMode('post-detail');
                }
              }}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                notif.is_read 
                  ? 'bg-gray-800/20 border-gray-700/50 hover:bg-gray-800/40' 
                  : 'bg-blue-500/10 border-blue-500/30 hover:bg-blue-500/20'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${
                  notif.type === 'reply' ? 'bg-blue-500/20 text-blue-400' :
                  notif.type === 'vote' ? 'bg-green-500/20 text-green-400' :
                  notif.type === 'accepted' ? 'bg-yellow-500/20 text-yellow-400' :
                  'bg-purple-500/20 text-purple-400'
                }`}>
                  {notif.type === 'reply' && <MessageCircle className="w-4 h-4" />}
                  {notif.type === 'vote' && <ThumbsUp className="w-4 h-4" />}
                  {notif.type === 'accepted' && <CheckCircle2 className="w-4 h-4" />}
                  {notif.type === 'mention' && <AtSign className="w-4 h-4" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-gray-300">{notif.message}</p>
                  <p className="text-xs text-gray-500 mt-1">{formatDate(notif.created_at)}</p>
                </div>
                {!notif.is_read && (
                  <div className="w-2 h-2 rounded-full bg-blue-500" />
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500">
          <Bell className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>Chưa có thông báo nào</p>
        </div>
      )}
    </div>
  );

  // Report Modal
  const ReportModal = () => {
    if (!showReportModal) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
        <div className="bg-gray-800 rounded-2xl border border-gray-700 w-full max-w-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <Flag className="w-5 h-5 text-red-400" /> Báo cáo vi phạm
            </h3>
            <button onClick={() => setShowReportModal(false)} className="p-1 hover:bg-gray-700 rounded-lg">
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-300 mb-2">Lý do báo cáo *</label>
              <select
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg bg-gray-900 border border-gray-600 text-white focus:outline-none focus:border-red-500"
              >
                <option value="">Chọn lý do</option>
                <option value="spam">Spam / Quảng cáo</option>
                <option value="inappropriate">Nội dung không phù hợp</option>
                <option value="harassment">Quấy rối / Xúc phạm</option>
                <option value="misinformation">Thông tin sai lệch</option>
                <option value="other">Khác</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm text-gray-300 mb-2">Mô tả chi tiết</label>
              <textarea
                value={reportDescription}
                onChange={(e) => setReportDescription(e.target.value)}
                placeholder="Mô tả thêm về vấn đề..."
                className="w-full px-4 py-3 rounded-lg bg-gray-900 border border-gray-600 text-white placeholder-gray-500 resize-none focus:outline-none focus:border-red-500 h-24"
              />
            </div>
            
            <div className="flex gap-3 pt-2">
              <button
                onClick={submitReport}
                disabled={!reportReason}
                className="flex-1 py-2.5 rounded-lg bg-red-600 text-white font-medium hover:bg-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
              >
                <AlertTriangle className="w-4 h-4" /> Gửi báo cáo
              </button>
              <button
                onClick={() => setShowReportModal(false)}
                className="px-6 py-2.5 rounded-lg bg-gray-700 text-gray-300 hover:bg-gray-600 transition-colors"
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Main Render
  return (
    <div className="min-h-screen bg-gray-900 p-4 md:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Search Bar (always visible) */}
        {viewMode === 'home' && (
          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm bài viết, tags..."
              className="w-full pl-12 pr-4 py-3 rounded-xl bg-gray-800/50 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
        )}

        {/* Render Current View */}
        {viewMode === 'home' && renderHome()}
        {viewMode === 'category' && renderCategory()}
        {viewMode === 'post-detail' && renderPostDetail()}
        {viewMode === 'new-post' && renderNewPost()}
        {viewMode === 'bookmarks' && renderBookmarks()}
        {viewMode === 'notifications' && renderNotifications()}
      </div>
      
      {/* Report Modal */}
      <ReportModal />
    </div>
  );
}
