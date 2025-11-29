import { useState, useEffect, useRef } from 'react';
import {
  Heart, MessageCircle, Share2, Bookmark, Image as ImageIcon,
  Send, X, Smile, Loader2, Trash2
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

type Post = {
  id: string;
  user_id: string;
  content: string;
  media_urls: string[];
  post_type: string;
  likes_count: number;
  comments_count: number;
  shares_count: number;
  created_at: string;
  user?: {
    username: string;
    full_name: string;
    avatar_url: string;
    level: number;
  };
  is_liked?: boolean;
  is_saved?: boolean;
  shared_post?: Post;
};

type Comment = {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
  likes_count: number;
  user?: {
    username: string;
    full_name: string;
    avatar_url: string;
  };
  is_liked?: boolean;
};

export const SocialFeed = () => {
  const { user, profile } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostImages, setNewPostImages] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [posting, setPosting] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchPosts();
  }, [user]);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const { data: postsData } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (postsData) {
        const postsWithUsers = await Promise.all(postsData.map(async (post) => {
          // Get user info
          const { data: userData } = await supabase
            .from('profiles')
            .select('username, full_name, avatar_url, level')
            .eq('id', post.user_id)
            .single();

          // Check if liked
          let isLiked = false;
          if (user) {
            const { data: likeData } = await supabase
              .from('post_likes')
              .select('id')
              .eq('post_id', post.id)
              .eq('user_id', user.id)
              .single();
            isLiked = !!likeData;
          }

          // Check if saved
          let isSaved = false;
          if (user) {
            const { data: saveData } = await supabase
              .from('saved_posts')
              .select('id')
              .eq('post_id', post.id)
              .eq('user_id', user.id)
              .single();
            isSaved = !!saveData;
          }

          // Get shared post if exists
          let sharedPost = null;
          if (post.shared_post_id) {
            const { data: shared } = await supabase
              .from('posts')
              .select('*')
              .eq('id', post.shared_post_id)
              .single();
            if (shared) {
              const { data: sharedUser } = await supabase
                .from('profiles')
                .select('username, full_name, avatar_url')
                .eq('id', shared.user_id)
                .single();
              sharedPost = { ...shared, user: sharedUser };
            }
          }

          return { ...post, user: userData, is_liked: isLiked, is_saved: isSaved, shared_post: sharedPost };
        }));

        setPosts(postsWithUsers);
      }
    } catch (err) {
      console.error('Error fetching posts:', err);
    }
    setLoading(false);
  };


  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + newPostImages.length > 4) {
      alert('Tối đa 4 ảnh');
      return;
    }
    setNewPostImages(prev => [...prev, ...files]);
    const urls = files.map(f => URL.createObjectURL(f));
    setPreviewUrls(prev => [...prev, ...urls]);
  };

  const removeImage = (index: number) => {
    setNewPostImages(prev => prev.filter((_, i) => i !== index));
    setPreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  const createPost = async () => {
    if (!user || (!newPostContent.trim() && newPostImages.length === 0)) return;
    setPosting(true);

    try {
      const mediaUrls: string[] = [];

      // Upload images
      for (const file of newPostImages) {
        const fileName = `post_${user.id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${file.name.split('.').pop()}`;
        const { error } = await supabase.storage.from('chat-media').upload(fileName, file);
        if (!error) {
          const { data: { publicUrl } } = supabase.storage.from('chat-media').getPublicUrl(fileName);
          mediaUrls.push(publicUrl);
        }
      }

      const { error } = await supabase.from('posts').insert({
        user_id: user.id,
        content: newPostContent.trim(),
        media_urls: mediaUrls,
        post_type: mediaUrls.length > 0 ? 'image' : 'text'
      });

      if (error) throw error;

      setNewPostContent('');
      setNewPostImages([]);
      setPreviewUrls([]);
      fetchPosts();
    } catch {
      alert('Không thể đăng bài');
    }
    setPosting(false);
  };

  const toggleLike = async (postId: string) => {
    if (!user) return;
    try {
      await supabase.rpc('toggle_post_like', { p_post_id: postId });
      setPosts(prev => prev.map(p => 
        p.id === postId 
          ? { ...p, is_liked: !p.is_liked, likes_count: p.is_liked ? p.likes_count - 1 : p.likes_count + 1 }
          : p
      ));
    } catch {}
  };

  const toggleSave = async (postId: string) => {
    if (!user) return;
    try {
      const post = posts.find(p => p.id === postId);
      if (post?.is_saved) {
        await supabase.from('saved_posts').delete().eq('post_id', postId).eq('user_id', user.id);
      } else {
        await supabase.from('saved_posts').insert({ post_id: postId, user_id: user.id });
      }
      setPosts(prev => prev.map(p => p.id === postId ? { ...p, is_saved: !p.is_saved } : p));
    } catch {}
  };

  const sharePost = async (postId: string) => {
    if (!user) return;
    const content = prompt('Thêm nội dung chia sẻ (có thể bỏ trống):');
    if (content === null) return;
    try {
      await supabase.rpc('share_post', { p_post_id: postId, p_content: content || null });
      fetchPosts();
      alert('Đã chia sẻ bài viết!');
    } catch {}
  };

  const deletePost = async (postId: string) => {
    if (!confirm('Bạn có chắc muốn xóa bài viết này?')) return;
    try {
      await supabase.from('posts').delete().eq('id', postId);
      setPosts(prev => prev.filter(p => p.id !== postId));
    } catch {}
  };

  const openComments = async (post: Post) => {
    setSelectedPost(post);
    try {
      const { data } = await supabase
        .from('post_comments')
        .select('*')
        .eq('post_id', post.id)
        .order('created_at', { ascending: true });

      if (data) {
        const commentsWithUsers = await Promise.all(data.map(async (comment) => {
          const { data: userData } = await supabase
            .from('profiles')
            .select('username, full_name, avatar_url')
            .eq('id', comment.user_id)
            .single();
          return { ...comment, user: userData };
        }));
        setComments(commentsWithUsers);
      }
    } catch {}
  };

  const addComment = async () => {
    if (!user || !selectedPost || !newComment.trim()) return;
    try {
      await supabase.rpc('add_comment', { p_post_id: selectedPost.id, p_content: newComment.trim() });
      setNewComment('');
      openComments(selectedPost);
      setPosts(prev => prev.map(p => p.id === selectedPost.id ? { ...p, comments_count: p.comments_count + 1 } : p));
    } catch {}
  };

  const formatTime = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Vừa xong';
    if (mins < 60) return `${mins} phút`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours} giờ`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days} ngày`;
    return new Date(date).toLocaleDateString('vi-VN');
  };


  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-black text-white mb-2">Bảng tin</h1>
        <p className="text-gray-400">Chia sẻ và kết nối với cộng đồng</p>
      </div>

      {/* Create post */}
      <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-4 mb-6 border border-gray-700">
        <div className="flex gap-3">
          <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-emerald-400 to-green-500 flex-shrink-0">
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-900 font-bold">
                {profile?.username?.[0]?.toUpperCase() || '?'}
              </div>
            )}
          </div>
          <div className="flex-1">
            <textarea
              value={newPostContent}
              onChange={(e) => setNewPostContent(e.target.value)}
              placeholder="Bạn đang nghĩ gì?"
              className="w-full bg-gray-700/50 border border-gray-600 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-emerald-400 focus:outline-none resize-none"
              rows={3}
            />
            
            {/* Image previews */}
            {previewUrls.length > 0 && (
              <div className="flex gap-2 mt-3 flex-wrap">
                {previewUrls.map((url, idx) => (
                  <div key={idx} className="relative">
                    <img src={url} alt="" className="w-20 h-20 object-cover rounded-lg" />
                    <button
                      onClick={() => removeImage(idx)}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-center justify-between mt-3">
              <div className="flex gap-2">
                <input type="file" ref={fileInputRef} onChange={handleImageSelect} accept="image/*" multiple className="hidden" />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2 hover:bg-gray-700 rounded-lg text-gray-400 hover:text-green-400 transition-colors"
                  title="Thêm ảnh"
                >
                  <ImageIcon className="w-5 h-5" />
                </button>
                <button className="p-2 hover:bg-gray-700 rounded-lg text-gray-400 hover:text-emerald-400 transition-colors">
                  <Smile className="w-5 h-5" />
                </button>
              </div>
              <button
                onClick={createPost}
                disabled={posting || (!newPostContent.trim() && newPostImages.length === 0)}
                className="px-6 py-2 bg-gradient-to-r from-emerald-400 to-green-500 text-gray-900 rounded-xl font-bold disabled:opacity-50 hover:opacity-90 transition-all flex items-center gap-2"
              >
                {posting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                Đăng
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Posts */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-12">
          <MessageCircle className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400">Chưa có bài viết nào</p>
          <p className="text-gray-500 text-sm">Hãy là người đầu tiên chia sẻ!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map(post => (
            <div key={post.id} className="bg-gray-800/50 backdrop-blur-lg rounded-2xl border border-gray-700 overflow-hidden">
              {/* Post header */}
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600">
                    {post.user?.avatar_url ? (
                      <img src={post.user.avatar_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white font-bold">
                        {post.user?.username?.[0]?.toUpperCase() || '?'}
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white">{post.user?.full_name || post.user?.username}</span>
                      {post.user?.level && (
                        <span className="px-2 py-0.5 bg-emerald-400/20 text-emerald-400 text-xs rounded-full">Lv.{post.user.level}</span>
                      )}
                    </div>
                    <span className="text-sm text-gray-500">{formatTime(post.created_at)}</span>
                  </div>
                </div>
                {post.user_id === user?.id && (
                  <button onClick={() => deletePost(post.id)} className="p-2 hover:bg-gray-700 rounded-lg text-gray-400 hover:text-red-400">
                    <Trash2 className="w-5 h-5" />
                  </button>
                )}
              </div>

              {/* Post content */}
              {post.content && (
                <div className="px-4 pb-3">
                  <p className="text-white whitespace-pre-wrap">{post.content}</p>
                </div>
              )}

              {/* Shared post */}
              {post.shared_post && (
                <div className="mx-4 mb-3 p-3 bg-gray-700/50 rounded-xl border border-gray-600">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600">
                      {post.shared_post.user?.avatar_url ? (
                        <img src={post.shared_post.user.avatar_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-white text-xs font-bold">
                          {post.shared_post.user?.username?.[0]?.toUpperCase()}
                        </div>
                      )}
                    </div>
                    <span className="text-sm text-gray-300">{post.shared_post.user?.full_name || post.shared_post.user?.username}</span>
                  </div>
                  <p className="text-gray-300 text-sm">{post.shared_post.content}</p>
                </div>
              )}

              {/* Post images */}
              {post.media_urls && post.media_urls.length > 0 && (
                <div className={`grid gap-1 ${post.media_urls.length === 1 ? 'grid-cols-1' : post.media_urls.length === 2 ? 'grid-cols-2' : 'grid-cols-2'}`}>
                  {post.media_urls.slice(0, 4).map((url, idx) => (
                    <div key={idx} className={`relative ${post.media_urls.length === 3 && idx === 0 ? 'row-span-2' : ''}`}>
                      <img
                        src={url}
                        alt=""
                        className="w-full h-full object-cover cursor-pointer hover:opacity-90"
                        style={{ maxHeight: post.media_urls.length === 1 ? '500px' : '250px' }}
                        onClick={() => window.open(url, '_blank')}
                      />
                      {idx === 3 && post.media_urls.length > 4 && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <span className="text-white text-2xl font-bold">+{post.media_urls.length - 4}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Post stats */}
              <div className="px-4 py-2 flex items-center justify-between text-sm text-gray-500 border-b border-gray-700/50">
                <span>{post.likes_count > 0 && `${post.likes_count} lượt thích`}</span>
                <div className="flex gap-3">
                  {post.comments_count > 0 && <span>{post.comments_count} bình luận</span>}
                  {post.shares_count > 0 && <span>{post.shares_count} chia sẻ</span>}
                </div>
              </div>

              {/* Post actions */}
              <div className="px-2 py-1 flex">
                <button
                  onClick={() => toggleLike(post.id)}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg transition-colors ${
                    post.is_liked ? 'text-red-400 bg-red-400/10' : 'text-gray-400 hover:bg-gray-700'
                  }`}
                >
                  <Heart className={`w-5 h-5 ${post.is_liked ? 'fill-current' : ''}`} />
                  <span className="font-medium">Thích</span>
                </button>
                <button
                  onClick={() => openComments(post)}
                  className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-gray-400 hover:bg-gray-700 transition-colors"
                >
                  <MessageCircle className="w-5 h-5" />
                  <span className="font-medium">Bình luận</span>
                </button>
                <button
                  onClick={() => sharePost(post.id)}
                  className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-gray-400 hover:bg-gray-700 transition-colors"
                >
                  <Share2 className="w-5 h-5" />
                  <span className="font-medium">Chia sẻ</span>
                </button>
                <button
                  onClick={() => toggleSave(post.id)}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg transition-colors ${
                    post.is_saved ? 'text-emerald-400 bg-emerald-400/10' : 'text-gray-400 hover:bg-gray-700'
                  }`}
                >
                  <Bookmark className={`w-5 h-5 ${post.is_saved ? 'fill-current' : ''}`} />
                  <span className="font-medium">Lưu</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}


      {/* Comments modal */}
      {selectedPost && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-2xl w-full max-w-lg max-h-[80vh] flex flex-col overflow-hidden">
            {/* Modal header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700">
              <h3 className="text-lg font-bold text-white">Bình luận</h3>
              <button onClick={() => setSelectedPost(null)} className="p-2 hover:bg-gray-700 rounded-lg text-gray-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Comments list */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {comments.length === 0 ? (
                <p className="text-center text-gray-500 py-8">Chưa có bình luận nào</p>
              ) : (
                comments.map(comment => (
                  <div key={comment.id} className="flex gap-3">
                    <div className="w-8 h-8 rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600 flex-shrink-0">
                      {comment.user?.avatar_url ? (
                        <img src={comment.user.avatar_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-white text-xs font-bold">
                          {comment.user?.username?.[0]?.toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="bg-gray-700 rounded-2xl px-4 py-2">
                        <span className="font-semibold text-white text-sm">{comment.user?.full_name || comment.user?.username}</span>
                        <p className="text-gray-200 text-sm">{comment.content}</p>
                      </div>
                      <div className="flex gap-4 mt-1 px-2 text-xs text-gray-500">
                        <span>{formatTime(comment.created_at)}</span>
                        <button className="hover:text-white">Thích</button>
                        <button className="hover:text-white">Trả lời</button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Comment input */}
            <div className="p-4 border-t border-gray-700">
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full overflow-hidden bg-gradient-to-br from-emerald-400 to-green-500 flex-shrink-0">
                  {profile?.avatar_url ? (
                    <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-900 text-xs font-bold">
                      {profile?.username?.[0]?.toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="flex-1 flex gap-2">
                  <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addComment()}
                    placeholder="Viết bình luận..."
                    className="flex-1 bg-gray-700 border border-gray-600 rounded-full px-4 py-2 text-white placeholder-gray-500 focus:border-emerald-400 focus:outline-none text-sm"
                  />
                  <button
                    onClick={addComment}
                    disabled={!newComment.trim()}
                    className="p-2 bg-emerald-400 rounded-full text-gray-900 disabled:opacity-50 hover:bg-emerald-500 transition-colors"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
