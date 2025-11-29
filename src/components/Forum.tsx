import { useState, useEffect } from 'react';
import {
  MessageSquare, Search, Plus, ThumbsUp, ThumbsDown, Eye, Clock,
  CheckCircle, Bookmark, BookmarkCheck, ChevronLeft, Send, Tag,
  Filter, TrendingUp, Flame, MessageCircle, User, MoreHorizontal,
  X, AlertCircle
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

type Category = {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  color: string;
  post_count: number;
};

type Post = {
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
  category?: Category;
  author?: { username: string; avatar_url: string; level: number };
};

type Reply = {
  id: string;
  post_id: string;
  user_id: string;
  parent_id: string | null;
  content: string;
  vote_count: number;
  is_accepted: boolean;
  created_at: string;
  author?: { username: string; avatar_url: string; level: number };
};

type ViewMode = 'categories' | 'posts' | 'post-detail' | 'new-post';

const COLOR_MAP: Record<string, string> = {
  yellow: 'from-yellow-500 to-amber-600',
  amber: 'from-amber-500 to-orange-600',
  orange: 'from-orange-500 to-red-600',
  pink: 'from-pink-500 to-rose-600',
  blue: 'from-blue-500 to-indigo-600',
  gray: 'from-gray-500 to-slate-600',
  purple: 'from-purple-500 to-violet-600',
  green: 'from-green-500 to-emerald-600',
  cyan: 'from-cyan-500 to-teal-600',
  red: 'from-red-500 to-rose-600',
};

export const Forum = () => {
  const { user, profile } = useAuth();
  const [viewMode, setViewMode] = useState<ViewMode>('categories');
  const [categories, setCategories] = useState<Category[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [replies, setReplies] = useState<Reply[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'popular' | 'unanswered'>('newest');
  
  // New post form
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newTags, setNewTags] = useState('');
  const [newCategoryId, setNewCategoryId] = useState('');
  
  // Reply form
  const [replyContent, setReplyContent] = useState('');
  const [userVotes, setUserVotes] = useState<Record<string, 'up' | 'down'>>({});
  const [bookmarks, setBookmarks] = useState<string[]>([]);

  useEffect(() => {
    fetchCategories();
    if (user) {
      fetchUserVotes();
      fetchBookmarks();
    }
  }, [user]);

  const fetchCategories = async () => {
    const { data } = await supabase
      .from('forum_categories')
      .select('*')
      .order('sort_order');
    if (data) setCategories(data);
  };

  const fetchPosts = async (categoryId?: string) => {
    setLoading(true);
    let query = supabase
      .from('forum_posts')
      .select('*')
      .order(sortBy === 'newest' ? 'created_at' : sortBy === 'popular' ? 'vote_count' : 'reply_count', 
             { ascending: sortBy === 'unanswered' });
    
    if (categoryId) {
      query = query.eq('category_id', categoryId);
    }
    
    if (sortBy === 'unanswered') {
      query = query.eq('is_solved', false);
    }

    const { data } = await query.limit(50);
    
    if (data) {
      // Fetch authors
      const userIds = [...new Set(data.map(p => p.user_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, username, avatar_url, level')
        .in('id', userIds);
      
      const postsWithAuthors = data.map(post => ({
        ...post,
        category: categories.find(c => c.id === post.category_id),
        author: profiles?.find(p => p.id === post.user_id)
      }));
      setPosts(postsWithAuthors);
    }
    setLoading(false);
  };

  const fetchPostDetail = async (postId: string) => {
    setLoading(true);
    
    // Increment view count
    await supabase.rpc('increment_view_count', { post_id: postId }).catch(() => {
      // Fallback if RPC doesn't exist
      supabase.from('forum_posts').update({ view_count: (selectedPost?.view_count || 0) + 1 }).eq('id', postId);
    });
    
    // Fetch post
    const { data: post } = await supabase
      .from('forum_posts')
      .select('*')
      .eq('id', postId)
      .single();
    
    if (post) {
      const { data: authorData } = await supabase
        .from('profiles')
        .select('id, username, avatar_url, level')
        .eq('id', post.user_id)
        .single();
      
      setSelectedPost({ ...post, author: authorData, category: categories.find(c => c.id === post.category_id) });
    }
    
    // Fetch replies
    const { data: repliesData } = await supabase
      .from('forum_replies')
      .select('*')
      .eq('post_id', postId)
      .order('is_accepted', { ascending: false })
      .order('vote_count', { ascending: false })
      .order('created_at');
    
    if (repliesData) {
      const userIds = [...new Set(repliesData.map(r => r.user_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, username, avatar_url, level')
        .in('id', userIds);
      
      const repliesWithAuthors = repliesData.map(reply => ({
        ...reply,
        author: profiles?.find(p => p.id === reply.user_id)
      }));
      setReplies(repliesWithAuthors);
    }
    
    setLoading(false);
  };

  const fetchUserVotes = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('forum_votes')
      .select('post_id, reply_id, vote_type')
      .eq('user_id', user.id);
    
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
    const { data } = await supabase
      .from('forum_bookmarks')
      .select('post_id')
      .eq('user_id', user.id);
    if (data) setBookmarks(data.map(b => b.post_id));
  };

  const handleVote = async (type: 'post' | 'reply', id: string, voteType: 'up' | 'down') => {
    if (!user) return;
    
    const key = `${type}_${id}`;
    const currentVote = userVotes[key];
    
    if (currentVote === voteType) {
      // Remove vote
      await supabase
        .from('forum_votes')
        .delete()
        .eq('user_id', user.id)
        .eq(type === 'post' ? 'post_id' : 'reply_id', id);
      
      setUserVotes(prev => {
        const newVotes = { ...prev };
        delete newVotes[key];
        return newVotes;
      });
    } else {
      // Upsert vote
      await supabase
        .from('forum_votes')
        .upsert({
          user_id: user.id,
          [type === 'post' ? 'post_id' : 'reply_id']: id,
          vote_type: voteType
        });
      
      setUserVotes(prev => ({ ...prev, [key]: voteType }));
    }
    
    // Refresh data
    if (type === 'post' && selectedPost) {
      fetchPostDetail(selectedPost.id);
    }
  };

  const handleBookmark = async (postId: string) => {
    if (!user) return;
    
    if (bookmarks.includes(postId)) {
      await supabase
        .from('forum_bookmarks')
        .delete()
        .eq('user_id', user.id)
        .eq('post_id', postId);
      setBookmarks(prev => prev.filter(id => id !== postId));
    } else {
      await supabase
        .from('forum_bookmarks')
        .insert({ user_id: user.id, post_id: postId });
      setBookmarks(prev => [...prev, postId]);
    }
  };

  const createPost = async () => {
    if (!user || !newTitle.trim() || !newContent.trim() || !newCategoryId) return;
    
    const { data, error } = await supabase
      .from('forum_posts')
      .insert({
        user_id: user.id,
        category_id: newCategoryId,
        title: newTitle.trim(),
        content: newContent.trim(),
        tags: newTags.split(',').map(t => t.trim()).filter(t => t)
      })
      .select()
      .single();
    
    if (error) {
      alert('Có lỗi xảy ra!');
      return;
    }
    
    if (data) {
      setNewTitle('');
      setNewContent('');
      setNewTags('');
      setSelectedPost(data);
      setViewMode('post-detail');
      fetchPostDetail(data.id);
    }
  };

  const createReply = async () => {
    if (!user || !selectedPost || !replyContent.trim()) return;
    
    const { error } = await supabase
      .from('forum_replies')
      .insert({
        post_id: selectedPost.id,
        user_id: user.id,
        content: replyContent.trim()
      });
    
    if (!error) {
      setReplyContent('');
      fetchPostDetail(selectedPost.id);
    }
  };

  const markAsSolved = async (replyId: string) => {
    if (!user || !selectedPost || selectedPost.user_id !== user.id) return;
    
    await supabase
      .from('forum_posts')
      .update({ is_solved: true, solved_answer_id: replyId })
      .eq('id', selectedPost.id);
    
    await supabase
      .from('forum_replies')
      .update({ is_accepted: true })
      .eq('id', replyId);
    
    fetchPostDetail(selectedPost.id);
  };

  const formatDate = (date: string) => {
    const d = new Date(date);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return 'Vừa xong';
    if (minutes < 60) return `${minutes} phút trước`;
    if (hours < 24) return `${hours} giờ trước`;
    if (days < 7) return `${days} ngày trước`;
    return d.toLocaleDateString('vi-VN');
  };

  const filteredPosts = posts.filter(post =>
    post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.content.toLowerCase().includes(searchQuery.toLowerCase())
  );


  // Render Categories
  const renderCategories = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-3">
            <MessageSquare className="w-7 h-7 sm:w-8 sm:h-8 text-blue-400" />
            Diễn Đàn Hỏi Đáp
          </h1>
          <p className="text-gray-400 mt-1 text-sm sm:text-base">Đặt câu hỏi, chia sẻ kiến thức với cộng đồng</p>
        </div>
        {user && (
          <button
            onClick={() => setViewMode('new-post')}
            className="flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-400 hover:to-indigo-400 text-white rounded-xl font-bold transition-all text-sm sm:text-base"
          >
            <Plus className="w-5 h-5" />
            Đặt Câu Hỏi
          </button>
        )}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Tìm kiếm câu hỏi..."
          className="w-full pl-12 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder:text-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
        />
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {categories.map(category => (
          <button
            key={category.id}
            onClick={() => {
              setSelectedCategory(category);
              setViewMode('posts');
              fetchPosts(category.id);
            }}
            className="bg-gray-800/50 hover:bg-gray-800 rounded-xl p-4 sm:p-5 border border-gray-700 hover:border-blue-500/50 transition-all text-left group"
          >
            <div className="flex items-start gap-3 sm:gap-4">
              <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br ${COLOR_MAP[category.color] || COLOR_MAP.blue} flex items-center justify-center text-2xl sm:text-3xl shadow-lg`}>
                {category.icon}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-white group-hover:text-blue-400 transition-colors text-sm sm:text-base truncate">
                  {category.name}
                </h3>
                <p className="text-gray-400 text-xs sm:text-sm mt-1 line-clamp-2">{category.description}</p>
                <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>{category.post_count} bài viết</span>
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Recent Posts */}
      <div className="bg-gray-800/50 rounded-xl p-4 sm:p-6 border border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
            <Flame className="w-5 h-5 text-orange-400" />
            Câu Hỏi Mới Nhất
          </h2>
          <button
            onClick={() => {
              setSelectedCategory(null);
              setViewMode('posts');
              fetchPosts();
            }}
            className="text-blue-400 hover:text-blue-300 text-sm font-medium"
          >
            Xem tất cả →
          </button>
        </div>
        
        {posts.slice(0, 5).map(post => (
          <div
            key={post.id}
            onClick={() => {
              setSelectedPost(post);
              setViewMode('post-detail');
              fetchPostDetail(post.id);
            }}
            className="py-3 border-b border-gray-700 last:border-0 cursor-pointer hover:bg-gray-700/30 -mx-2 px-2 rounded-lg transition-colors"
          >
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gray-700 overflow-hidden flex-shrink-0">
                {post.author?.avatar_url ? (
                  <img src={post.author.avatar_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <User className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-white hover:text-blue-400 transition-colors text-sm sm:text-base line-clamp-1">
                  {post.is_solved && <CheckCircle className="w-4 h-4 text-green-400 inline mr-1" />}
                  {post.title}
                </h3>
                <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-1 text-xs text-gray-400">
                  <span>{post.author?.username || 'Ẩn danh'}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Eye className="w-3 h-3" /> {post.view_count}
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageCircle className="w-3 h-3" /> {post.reply_count}
                  </span>
                  <span className="hidden sm:inline">•</span>
                  <span className="hidden sm:inline">{formatDate(post.created_at)}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Render Posts List
  const renderPosts = () => (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 sm:gap-4">
        <button
          onClick={() => {
            setViewMode('categories');
            setSelectedCategory(null);
          }}
          className="p-2 hover:bg-gray-700 rounded-lg text-gray-400 hover:text-white"
        >
          <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2 truncate">
            {selectedCategory?.icon} {selectedCategory?.name || 'Tất cả câu hỏi'}
          </h1>
          <p className="text-gray-400 text-xs sm:text-sm truncate">{selectedCategory?.description || 'Tất cả câu hỏi từ cộng đồng'}</p>
        </div>
        {user && (
          <button
            onClick={() => {
              setNewCategoryId(selectedCategory?.id || '');
              setViewMode('new-post');
            }}
            className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-blue-500 hover:bg-blue-400 text-white rounded-lg font-medium text-sm"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Đặt câu hỏi</span>
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm kiếm..."
            className="w-full pl-10 pr-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm"
          />
        </div>
        <div className="flex gap-2">
          {[
            { key: 'newest', label: 'Mới nhất', icon: Clock },
            { key: 'popular', label: 'Phổ biến', icon: TrendingUp },
            { key: 'unanswered', label: 'Chưa trả lời', icon: AlertCircle },
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => {
                setSortBy(key as any);
                fetchPosts(selectedCategory?.id);
              }}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                sortBy === key
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-800 text-gray-400 hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Posts */}
      {loading ? (
        <div className="text-center py-12 text-gray-400">Đang tải...</div>
      ) : filteredPosts.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>Chưa có câu hỏi nào</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredPosts.map(post => (
            <div
              key={post.id}
              onClick={() => {
                setSelectedPost(post);
                setViewMode('post-detail');
                fetchPostDetail(post.id);
              }}
              className="bg-gray-800/50 hover:bg-gray-800 rounded-xl p-4 border border-gray-700 hover:border-blue-500/50 cursor-pointer transition-all"
            >
              <div className="flex gap-3 sm:gap-4">
                {/* Vote count */}
                <div className="hidden sm:flex flex-col items-center gap-1 text-center min-w-[50px]">
                  <div className={`text-lg font-bold ${post.vote_count > 0 ? 'text-green-400' : post.vote_count < 0 ? 'text-red-400' : 'text-gray-400'}`}>
                    {post.vote_count}
                  </div>
                  <div className="text-xs text-gray-500">votes</div>
                  <div className={`text-sm font-medium ${post.reply_count > 0 ? 'text-blue-400' : 'text-gray-500'}`}>
                    {post.reply_count}
                  </div>
                  <div className="text-xs text-gray-500">trả lời</div>
                </div>
                
                {/* Content */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-white hover:text-blue-400 transition-colors text-sm sm:text-base line-clamp-2">
                    {post.is_pinned && <span className="text-yellow-400 mr-1">📌</span>}
                    {post.is_solved && <CheckCircle className="w-4 h-4 text-green-400 inline mr-1" />}
                    {post.title}
                  </h3>
                  <p className="text-gray-400 text-xs sm:text-sm mt-1 line-clamp-2">{post.content}</p>
                  
                  {/* Tags */}
                  {post.tags && post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {post.tags.slice(0, 3).map((tag, idx) => (
                        <span key={idx} className="px-2 py-0.5 bg-blue-500/20 text-blue-400 text-xs rounded">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                  
                  {/* Meta */}
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-2 sm:mt-3 text-xs text-gray-400">
                    <div className="flex items-center gap-1.5">
                      <div className="w-5 h-5 rounded-full bg-gray-700 overflow-hidden">
                        {post.author?.avatar_url ? (
                          <img src={post.author.avatar_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <User className="w-3 h-3 m-1 text-gray-500" />
                        )}
                      </div>
                      <span>{post.author?.username || 'Ẩn danh'}</span>
                    </div>
                    <span className="hidden sm:inline">•</span>
                    <span className="flex items-center gap-1">
                      <Eye className="w-3 h-3" /> {post.view_count}
                    </span>
                    <span className="sm:hidden flex items-center gap-1">
                      <MessageCircle className="w-3 h-3" /> {post.reply_count}
                    </span>
                    <span>•</span>
                    <span>{formatDate(post.created_at)}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );


  // Render Post Detail
  const renderPostDetail = () => {
    if (!selectedPost) return null;
    
    const postVoteKey = `post_${selectedPost.id}`;
    const currentVote = userVotes[postVoteKey];
    const isBookmarked = bookmarks.includes(selectedPost.id);
    
    return (
      <div className="space-y-4 sm:space-y-6">
        {/* Header */}
        <button
          onClick={() => {
            setViewMode(selectedCategory ? 'posts' : 'categories');
            setSelectedPost(null);
          }}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
          <span className="text-sm">Quay lại</span>
        </button>

        {/* Post */}
        <div className="bg-gray-800/50 rounded-xl border border-gray-700 overflow-hidden">
          <div className="p-4 sm:p-6">
            {/* Title */}
            <div className="flex items-start gap-3 mb-4">
              {selectedPost.is_solved && (
                <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs font-medium rounded flex items-center gap-1 flex-shrink-0">
                  <CheckCircle className="w-3 h-3" /> Đã giải quyết
                </span>
              )}
              <h1 className="text-xl sm:text-2xl font-bold text-white flex-1">{selectedPost.title}</h1>
            </div>
            
            {/* Author info */}
            <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-700">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gray-700 overflow-hidden">
                {selectedPost.author?.avatar_url ? (
                  <img src={selectedPost.author.avatar_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <User className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                )}
              </div>
              <div>
                <div className="font-medium text-white text-sm sm:text-base">{selectedPost.author?.username || 'Ẩn danh'}</div>
                <div className="text-xs sm:text-sm text-gray-400">
                  Level {selectedPost.author?.level || 1} • {formatDate(selectedPost.created_at)}
                </div>
              </div>
            </div>
            
            {/* Content */}
            <div className="prose prose-invert max-w-none text-sm sm:text-base">
              <p className="text-gray-300 whitespace-pre-wrap">{selectedPost.content}</p>
            </div>
            
            {/* Tags */}
            {selectedPost.tags && selectedPost.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {selectedPost.tags.map((tag, idx) => (
                  <span key={idx} className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded flex items-center gap-1">
                    <Tag className="w-3 h-3" /> {tag}
                  </span>
                ))}
              </div>
            )}
            
            {/* Actions */}
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-700">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleVote('post', selectedPost.id, 'up')}
                  className={`p-2 rounded-lg transition-colors ${
                    currentVote === 'up' ? 'bg-green-500/20 text-green-400' : 'hover:bg-gray-700 text-gray-400'
                  }`}
                >
                  <ThumbsUp className="w-5 h-5" />
                </button>
                <span className={`font-bold ${selectedPost.vote_count > 0 ? 'text-green-400' : selectedPost.vote_count < 0 ? 'text-red-400' : 'text-gray-400'}`}>
                  {selectedPost.vote_count}
                </span>
                <button
                  onClick={() => handleVote('post', selectedPost.id, 'down')}
                  className={`p-2 rounded-lg transition-colors ${
                    currentVote === 'down' ? 'bg-red-500/20 text-red-400' : 'hover:bg-gray-700 text-gray-400'
                  }`}
                >
                  <ThumbsDown className="w-5 h-5" />
                </button>
              </div>
              
              <div className="flex items-center gap-2 text-gray-400 text-sm">
                <span className="flex items-center gap-1">
                  <Eye className="w-4 h-4" /> {selectedPost.view_count}
                </span>
                <button
                  onClick={() => handleBookmark(selectedPost.id)}
                  className={`p-2 rounded-lg transition-colors ${
                    isBookmarked ? 'text-yellow-400' : 'hover:bg-gray-700'
                  }`}
                >
                  {isBookmarked ? <BookmarkCheck className="w-5 h-5" /> : <Bookmark className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Replies */}
        <div className="space-y-4">
          <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-blue-400" />
            {replies.length} Câu trả lời
          </h2>
          
          {replies.map(reply => {
            const replyVoteKey = `reply_${reply.id}`;
            const replyVote = userVotes[replyVoteKey];
            
            return (
              <div
                key={reply.id}
                className={`bg-gray-800/50 rounded-xl p-4 sm:p-5 border ${
                  reply.is_accepted ? 'border-green-500/50 bg-green-500/5' : 'border-gray-700'
                }`}
              >
                {reply.is_accepted && (
                  <div className="flex items-center gap-2 text-green-400 text-sm font-medium mb-3">
                    <CheckCircle className="w-4 h-4" />
                    Câu trả lời được chấp nhận
                  </div>
                )}
                
                <div className="flex gap-3 sm:gap-4">
                  {/* Vote buttons */}
                  <div className="flex flex-col items-center gap-1">
                    <button
                      onClick={() => handleVote('reply', reply.id, 'up')}
                      className={`p-1.5 rounded transition-colors ${
                        replyVote === 'up' ? 'text-green-400' : 'text-gray-500 hover:text-gray-300'
                      }`}
                    >
                      <ThumbsUp className="w-4 h-4" />
                    </button>
                    <span className={`text-sm font-medium ${reply.vote_count > 0 ? 'text-green-400' : reply.vote_count < 0 ? 'text-red-400' : 'text-gray-500'}`}>
                      {reply.vote_count}
                    </span>
                    <button
                      onClick={() => handleVote('reply', reply.id, 'down')}
                      className={`p-1.5 rounded transition-colors ${
                        replyVote === 'down' ? 'text-red-400' : 'text-gray-500 hover:text-gray-300'
                      }`}
                    >
                      <ThumbsDown className="w-4 h-4" />
                    </button>
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gray-700 overflow-hidden">
                        {reply.author?.avatar_url ? (
                          <img src={reply.author.avatar_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <User className="w-3 h-3 sm:w-4 sm:h-4 m-1.5 sm:m-2 text-gray-500" />
                        )}
                      </div>
                      <span className="font-medium text-white text-sm">{reply.author?.username || 'Ẩn danh'}</span>
                      <span className="text-gray-500 text-xs">•</span>
                      <span className="text-gray-500 text-xs">{formatDate(reply.created_at)}</span>
                    </div>
                    <p className="text-gray-300 text-sm sm:text-base whitespace-pre-wrap">{reply.content}</p>
                    
                    {/* Accept button */}
                    {user && selectedPost.user_id === user.id && !selectedPost.is_solved && (
                      <button
                        onClick={() => markAsSolved(reply.id)}
                        className="mt-3 text-xs text-green-400 hover:text-green-300 flex items-center gap-1"
                      >
                        <CheckCircle className="w-3 h-3" />
                        Chấp nhận câu trả lời này
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Reply Form */}
        {user ? (
          <div className="bg-gray-800/50 rounded-xl p-4 sm:p-5 border border-gray-700">
            <h3 className="font-bold text-white mb-3 text-sm sm:text-base">Viết câu trả lời</h3>
            <textarea
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder="Chia sẻ kiến thức của bạn..."
              rows={4}
              className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-xl text-white placeholder:text-gray-500 focus:border-blue-500 resize-none text-sm sm:text-base"
            />
            <div className="flex justify-end mt-3">
              <button
                onClick={createReply}
                disabled={!replyContent.trim()}
                className="flex items-center gap-2 px-4 sm:px-6 py-2.5 bg-blue-500 hover:bg-blue-400 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-medium text-sm sm:text-base"
              >
                <Send className="w-4 h-4" />
                Gửi trả lời
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700 text-center">
            <p className="text-gray-400">Đăng nhập để trả lời câu hỏi này</p>
          </div>
        )}
      </div>
    );
  };

  // Render New Post Form
  const renderNewPost = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => setViewMode(selectedCategory ? 'posts' : 'categories')}
          className="p-2 hover:bg-gray-700 rounded-lg text-gray-400 hover:text-white"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-xl sm:text-2xl font-bold text-white">Đặt Câu Hỏi Mới</h1>
      </div>

      <div className="bg-gray-800/50 rounded-xl p-4 sm:p-6 border border-gray-700 space-y-4">
        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Danh mục</label>
          <select
            value={newCategoryId}
            onChange={(e) => setNewCategoryId(e.target.value)}
            className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-xl text-white focus:border-blue-500"
          >
            <option value="">Chọn danh mục</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
            ))}
          </select>
        </div>

        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Tiêu đề câu hỏi</label>
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="VD: Làm sao để sắp xếp mảng trong Python?"
            className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-xl text-white placeholder:text-gray-500 focus:border-blue-500"
          />
        </div>

        {/* Content */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Nội dung chi tiết</label>
          <textarea
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            placeholder="Mô tả chi tiết vấn đề của bạn, code mẫu, lỗi gặp phải..."
            rows={8}
            className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-xl text-white placeholder:text-gray-500 focus:border-blue-500 resize-none"
          />
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Tags (phân cách bằng dấu phẩy)</label>
          <input
            type="text"
            value={newTags}
            onChange={(e) => setNewTags(e.target.value)}
            placeholder="VD: python, array, sorting"
            className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-xl text-white placeholder:text-gray-500 focus:border-blue-500"
          />
        </div>

        {/* Submit */}
        <div className="flex justify-end gap-3 pt-4">
          <button
            onClick={() => setViewMode(selectedCategory ? 'posts' : 'categories')}
            className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-xl font-medium"
          >
            Hủy
          </button>
          <button
            onClick={createPost}
            disabled={!newTitle.trim() || !newContent.trim() || !newCategoryId}
            className="flex items-center gap-2 px-6 py-3 bg-blue-500 hover:bg-blue-400 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-medium"
          >
            <Send className="w-5 h-5" />
            Đăng câu hỏi
          </button>
        </div>
      </div>
    </div>
  );

  // Fetch initial posts
  useEffect(() => {
    if (categories.length > 0 && posts.length === 0) {
      fetchPosts();
    }
  }, [categories]);

  return (
    <div className="w-full max-w-5xl mx-auto">
      {viewMode === 'categories' && renderCategories()}
      {viewMode === 'posts' && renderPosts()}
      {viewMode === 'post-detail' && renderPostDetail()}
      {viewMode === 'new-post' && renderNewPost()}
    </div>
  );
};
