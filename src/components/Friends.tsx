import { useState, useEffect } from 'react';
import { Users, UserPlus, Search, Check, X, MessageCircle, Trophy, Zap, Clock, Activity, Gift, Swords, TrendingUp, Star, Award } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { FriendChat } from './FriendChat';

type Friend = {
  friend_id: string;
  friend_username: string;
  friend_full_name: string;
  friend_avatar: string;
  friend_level: number;
  friend_xp: number;
  friend_coins: number;
  friends_since: string;
};

type FriendRequest = {
  id: string;
  sender_id: string;
  sender_username: string;
  sender_full_name: string;
  sender_avatar: string;
  sender_level: number;
  sender_xp: number;
  created_at: string;
};

type SearchResult = {
  id: string;
  username: string;
  full_name: string;
  avatar_url: string;
  level: number;
  xp: number;
  email: string;
  is_friend: boolean;
  request_status: string;
};

type FriendActivity = {
  id: string;
  user_id: string;
  username: string;
  full_name: string;
  activity_type: string;
  activity_data: any;
  created_at: string;
};

type LeaderboardEntry = {
  friend_id: string;
  friend_username: string;
  friend_full_name: string;
  friend_level: number;
  friend_xp: number;
  friend_coins: number;
  rank: number;
};

export const Friends = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'friends' | 'requests' | 'search' | 'activity' | 'leaderboard'>('friends');
  const [friends, setFriends] = useState<Friend[]>([]);
  const [requests, setRequests] = useState<FriendRequest[]>([]);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [activities, setActivities] = useState<FriendActivity[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [sendingCoins, setSendingCoins] = useState(false);
  const [selectedFriend, setSelectedFriend] = useState<string | null>(null);
  const [coinAmount, setCoinAmount] = useState(10);
  const [chatFriend, setChatFriend] = useState<Friend | null>(null);

  useEffect(() => {
    if (user) {
      fetchFriends();
      fetchRequests();
      fetchActivities();
      fetchLeaderboard();
    }
  }, [user]);

  const fetchFriends = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('friends_with_details')
        .select('*')
        .eq('user_id', user.id)
        .order('friends_since', { ascending: false });

      if (error) throw error;
      if (data) setFriends(data);
    } catch (error) {
      console.error('Error fetching friends:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRequests = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('friend_requests_with_details')
        .select('*')
        .eq('receiver_id', user.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data) setRequests(data);
    } catch (error) {
      console.error('Error fetching requests:', error);
    }
  };

  const searchUsers = async () => {
    if (!user || !searchQuery.trim()) return;

    try {
      const { data, error } = await supabase.rpc('search_users', {
        search_query: searchQuery,
        current_user_id: user.id,
      });

      if (error) throw error;
      if (data) setSearchResults(data);
    } catch (error) {
      console.error('Error searching users:', error);
    }
  };

  const sendFriendRequest = async (receiverId: string) => {
    if (!user) return;

    try {
      // Kiểm tra xem đã có request chưa
      const { data: existing } = await supabase
        .from('friend_requests')
        .select('*')
        .or(`and(sender_id.eq.${user.id},receiver_id.eq.${receiverId}),and(sender_id.eq.${receiverId},receiver_id.eq.${user.id})`)
        .maybeSingle();

      if (existing) {
        if (existing.status === 'pending') {
          alert('Đã có lời mời kết bạn đang chờ xử lý!');
        } else if (existing.status === 'rejected') {
          // Xóa request cũ và tạo mới
          await supabase.from('friend_requests').delete().eq('id', existing.id);
          
          const { error } = await supabase.from('friend_requests').insert({
            sender_id: user.id,
            receiver_id: receiverId,
            status: 'pending',
          });

          if (error) throw error;
          alert('Đã gửi lại lời mời kết bạn!');
        } else {
          alert('Đã là bạn bè rồi!');
        }
      } else {
        const { error } = await supabase.from('friend_requests').insert({
          sender_id: user.id,
          receiver_id: receiverId,
          status: 'pending',
        });

        if (error) throw error;
        alert('Đã gửi lời mời kết bạn!');
      }
      
      searchUsers(); // Refresh search results
    } catch (error: any) {
      console.error('Error sending request:', error);
      if (error.message?.includes('duplicate key')) {
        alert('Đã có lời mời kết bạn tồn tại! Vui lòng thử lại sau.');
      } else {
        alert(error.message || 'Có lỗi xảy ra!');
      }
    }
  };

  const acceptRequest = async (requestId: string) => {
    try {
      const { error } = await supabase
        .from('friend_requests')
        .update({ status: 'accepted' })
        .eq('id', requestId);

      if (error) throw error;
      alert('Đã chấp nhận lời mời!');
      fetchRequests();
      fetchFriends();
    } catch (error) {
      console.error('Error accepting request:', error);
    }
  };

  const rejectRequest = async (requestId: string) => {
    try {
      const { error } = await supabase
        .from('friend_requests')
        .update({ status: 'rejected' })
        .eq('id', requestId);

      if (error) throw error;
      fetchRequests();
    } catch (error) {
      console.error('Error rejecting request:', error);
    }
  };

  const unfriend = async (friendId: string) => {
    if (!user || !confirm('Bạn có chắc muốn hủy kết bạn?')) return;

    try {
      const { error } = await supabase.rpc('unfriend', {
        p_user_id: user.id,
        p_friend_id: friendId,
      });

      if (error) throw error;
      fetchFriends();
    } catch (error) {
      console.error('Error unfriending:', error);
    }
  };

  const fetchActivities = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('friend_activities_feed')
        .select('*')
        .eq('viewer_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      if (data) setActivities(data);
    } catch (error) {
      console.error('Error fetching activities:', error);
    }
  };

  const fetchLeaderboard = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('friends_with_details')
        .select('*')
        .eq('user_id', user.id)
        .order('friend_xp', { ascending: false });

      if (error) throw error;
      if (data) {
        const ranked = data.map((friend, index) => ({
          ...friend,
          rank: index + 1,
        }));
        setLeaderboard(ranked);
      }
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    }
  };

  const sendCoins = async (friendId: string, amount: number) => {
    if (!user || amount <= 0) return;

    setSendingCoins(true);
    try {
      const { error } = await supabase.rpc('send_coins_to_friend', {
        p_sender_id: user.id,
        p_receiver_id: friendId,
        p_amount: amount,
      });

      if (error) throw error;
      
      alert(`Đã gửi ${amount} xu thành công! 🎁`);
      setSelectedFriend(null);
      setCoinAmount(10);
      
      // Refresh data
      fetchFriends();
      fetchActivities();
    } catch (error: any) {
      console.error('Error sending coins:', error);
      alert(error.message || 'Không đủ xu để gửi!');
    } finally {
      setSendingCoins(false);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'course_completed':
        return <Trophy className="w-5 h-5 text-yellow-400" />;
      case 'lesson_completed':
        return <Star className="w-5 h-5 text-blue-400" />;
      case 'level_up':
        return <Zap className="w-5 h-5 text-green-400" />;
      case 'game_completed':
        return <Swords className="w-5 h-5 text-purple-400" />;
      case 'coins_sent':
        return <Gift className="w-5 h-5 text-pink-400" />;
      case 'achievement':
        return <Award className="w-5 h-5 text-orange-400" />;
      default:
        return <Activity className="w-5 h-5 text-gray-400" />;
    }
  };

  const getActivityText = (activity: FriendActivity) => {
    const name = activity.full_name || activity.username;
    switch (activity.activity_type) {
      case 'course_completed':
        return `${name} đã hoàn thành khóa học "${activity.activity_data?.course_name}"`;
      case 'lesson_completed':
        return `${name} đã hoàn thành bài học "${activity.activity_data?.lesson_name}"`;
      case 'level_up':
        return `${name} đã lên cấp ${activity.activity_data?.new_level}! 🎉`;
      case 'game_completed':
        return `${name} đã hoàn thành game với ${activity.activity_data?.score} điểm`;
      case 'coins_sent':
        return `${name} đã gửi ${activity.activity_data?.amount} xu cho ${activity.activity_data?.receiver_name}`;
      case 'achievement':
        return `${name} đã đạt thành tích "${activity.activity_data?.achievement_name}"`;
      default:
        return `${name} có hoạt động mới`;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400"></div>
      </div>
    );
  }

  return (
    <div className="w-full animate-fade-in-up">
      <div className="mb-8">
        <h1 className="text-4xl font-black text-white mb-4">Bạn Bè</h1>
        <p className="text-xl text-gray-300">Kết nối và học cùng bạn bè</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
        <button
          onClick={() => setActiveTab('friends')}
          className={`px-6 py-3 rounded-xl font-bold transition-all whitespace-nowrap ${
            activeTab === 'friends'
              ? 'bg-yellow-400 text-white'
              : 'bg-gray-800/60 text-gray-300 hover:bg-gray-700'
          }`}
        >
          <Users className="w-5 h-5 inline mr-2" />
          Bạn Bè ({friends.length})
        </button>
        <button
          onClick={() => setActiveTab('activity')}
          className={`px-6 py-3 rounded-xl font-bold transition-all whitespace-nowrap ${
            activeTab === 'activity'
              ? 'bg-yellow-400 text-white'
              : 'bg-gray-800/60 text-gray-300 hover:bg-gray-700'
          }`}
        >
          <Activity className="w-5 h-5 inline mr-2" />
          Hoạt Động
        </button>
        <button
          onClick={() => setActiveTab('leaderboard')}
          className={`px-6 py-3 rounded-xl font-bold transition-all whitespace-nowrap ${
            activeTab === 'leaderboard'
              ? 'bg-yellow-400 text-white'
              : 'bg-gray-800/60 text-gray-300 hover:bg-gray-700'
          }`}
        >
          <TrendingUp className="w-5 h-5 inline mr-2" />
          Bảng Xếp Hạng
        </button>
        <button
          onClick={() => setActiveTab('requests')}
          className={`px-6 py-3 rounded-xl font-bold transition-all relative whitespace-nowrap ${
            activeTab === 'requests'
              ? 'bg-yellow-400 text-white'
              : 'bg-gray-800/60 text-gray-300 hover:bg-gray-700'
          }`}
        >
          <MessageCircle className="w-5 h-5 inline mr-2" />
          Lời Mời ({requests.length})
          {requests.length > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
              {requests.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('search')}
          className={`px-6 py-3 rounded-xl font-bold transition-all whitespace-nowrap ${
            activeTab === 'search'
              ? 'bg-yellow-400 text-white'
              : 'bg-gray-800/60 text-gray-300 hover:bg-gray-700'
          }`}
        >
          <UserPlus className="w-5 h-5 inline mr-2" />
          Tìm Bạn
        </button>
      </div>

      {/* Friends List */}
      {activeTab === 'friends' && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {friends.length === 0 ? (
            <div className="col-span-full text-center py-16 bg-gray-800/60 backdrop-blur-md rounded-3xl border border-gray-700">
              <Users className="w-16 h-16 text-gray-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Chưa có bạn bè</h3>
              <p className="text-gray-400 mb-6">Hãy tìm và kết bạn với những người học cùng!</p>
              <button
                onClick={() => setActiveTab('search')}
                className="px-6 py-3 bg-yellow-400 text-white rounded-xl font-bold hover:bg-yellow-500 transition-all"
              >
                Tìm Bạn Bè
              </button>
            </div>
          ) : (
            friends.map((friend) => (
              <div
                key={friend.friend_id}
                className="bg-gray-800/70 backdrop-blur-lg rounded-2xl p-6 border border-gray-700 hover:border-yellow-400 transition-all"
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl font-black text-white">
                      {friend.friend_username?.[0]?.toUpperCase() || '?'}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-white truncate">
                      {friend.friend_full_name || friend.friend_username}
                    </h3>
                    <p className="text-sm text-gray-400">@{friend.friend_username}</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 mb-4">
                  <div className="bg-gray-900/50 rounded-lg p-2 text-center">
                    <div className="flex items-center justify-center gap-1 text-green-400 mb-1">
                      <Zap className="w-4 h-4" />
                      <span className="text-xs font-bold">Lv {friend.friend_level}</span>
                    </div>
                  </div>
                  <div className="bg-gray-900/50 rounded-lg p-2 text-center">
                    <div className="flex items-center justify-center gap-1 text-blue-400 mb-1">
                      <Trophy className="w-4 h-4" />
                      <span className="text-xs font-bold">{friend.friend_xp} XP</span>
                    </div>
                  </div>
                  <div className="bg-gray-900/50 rounded-lg p-2 text-center">
                    <div className="flex items-center justify-center gap-1 text-yellow-400 mb-1">
                      <span className="text-xs font-bold">{friend.friend_coins} xu</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-gray-400 mb-4">
                  <Clock className="w-3 h-3" />
                  <span>Bạn từ {new Date(friend.friends_since).toLocaleDateString('vi-VN')}</span>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setChatFriend(friend)}
                    className="flex-1 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-bold transition-all"
                  >
                    <MessageCircle className="w-4 h-4 inline mr-1" />
                    Nhắn Tin
                  </button>
                  <button
                    onClick={() => setSelectedFriend(friend.friend_id)}
                    className="flex-1 py-2 bg-yellow-400 hover:bg-yellow-500 text-white rounded-lg text-sm font-bold transition-all"
                  >
                    <Gift className="w-4 h-4 inline mr-1" />
                    Tặng Xu
                  </button>
                  <button
                    onClick={() => unfriend(friend.friend_id)}
                    className="px-4 py-2 bg-gray-700 hover:bg-red-600 text-white rounded-lg text-sm font-bold transition-all"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Friend Requests */}
      {activeTab === 'requests' && (
        <div className="space-y-4">
          {requests.length === 0 ? (
            <div className="text-center py-16 bg-gray-800/60 backdrop-blur-md rounded-3xl border border-gray-700">
              <MessageCircle className="w-16 h-16 text-gray-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Không có lời mời nào</h3>
              <p className="text-gray-400">Các lời mời kết bạn sẽ hiển thị ở đây</p>
            </div>
          ) : (
            requests.map((request) => (
              <div
                key={request.id}
                className="bg-gray-800/70 backdrop-blur-lg rounded-2xl p-6 border border-gray-700 flex items-center gap-4"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl font-black text-white">
                    {request.sender_username?.[0]?.toUpperCase() || '?'}
                  </span>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-white">
                    {request.sender_full_name || request.sender_username}
                  </h3>
                  <p className="text-sm text-gray-400">@{request.sender_username}</p>
                  <div className="flex items-center gap-3 mt-2 text-sm text-gray-400">
                    <span className="flex items-center gap-1">
                      <Zap className="w-4 h-4 text-green-400" />
                      Lv {request.sender_level}
                    </span>
                    <span className="flex items-center gap-1">
                      <Trophy className="w-4 h-4 text-blue-400" />
                      {request.sender_xp} XP
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => acceptRequest(request.id)}
                    className="p-3 bg-green-500 hover:bg-green-600 text-white rounded-xl transition-all"
                    title="Chấp nhận"
                  >
                    <Check className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => rejectRequest(request.id)}
                    className="p-3 bg-red-500 hover:bg-red-600 text-white rounded-xl transition-all"
                    title="Từ chối"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Search */}
      {activeTab === 'search' && (
        <div>
          <div className="flex gap-4 mb-8">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm theo email, tên hoặc username..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && searchUsers()}
                className="w-full pl-12 pr-4 py-4 bg-gray-800/60 backdrop-blur-md border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:border-yellow-400 focus:outline-none"
              />
            </div>
            <button
              onClick={searchUsers}
              className="px-8 py-4 bg-yellow-400 hover:bg-yellow-500 text-white rounded-xl font-bold transition-all"
            >
              Tìm Kiếm
            </button>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {searchResults.map((result) => (
              <div
                key={result.id}
                className="bg-gray-800/70 backdrop-blur-lg rounded-2xl p-6 border border-gray-700"
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl font-black text-white">
                      {result.username?.[0]?.toUpperCase() || '?'}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-white truncate">
                      {result.full_name || result.username}
                    </h3>
                    <p className="text-sm text-gray-400 truncate">@{result.username}</p>
                    {result.email && (
                      <p className="text-xs text-gray-500 truncate mt-1">
                        📧 {result.email}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 mb-4 text-sm text-gray-400">
                  <span className="flex items-center gap-1">
                    <Zap className="w-4 h-4 text-green-400" />
                    Lv {result.level}
                  </span>
                  <span className="flex items-center gap-1">
                    <Trophy className="w-4 h-4 text-blue-400" />
                    {result.xp} XP
                  </span>
                </div>

                {result.is_friend ? (
                  <button
                    disabled
                    className="w-full py-3 bg-gray-700 text-gray-400 rounded-xl font-bold cursor-not-allowed"
                  >
                    Đã Là Bạn Bè
                  </button>
                ) : result.request_status === 'pending' ? (
                  <button
                    disabled
                    className="w-full py-3 bg-gray-700 text-gray-400 rounded-xl font-bold cursor-not-allowed"
                  >
                    Đã Gửi Lời Mời
                  </button>
                ) : (
                  <button
                    onClick={() => sendFriendRequest(result.id)}
                    className="w-full py-3 bg-yellow-400 hover:bg-yellow-500 text-white rounded-xl font-bold transition-all"
                  >
                    <UserPlus className="w-5 h-5 inline mr-2" />
                    Kết Bạn
                  </button>
                )}
              </div>
            ))}
          </div>

          {searchQuery && searchResults.length === 0 && (
            <div className="text-center py-16 bg-gray-800/60 backdrop-blur-md rounded-3xl border border-gray-700">
              <Search className="w-16 h-16 text-gray-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Không tìm thấy kết quả</h3>
              <p className="text-gray-400">Thử tìm kiếm với từ khóa khác</p>
            </div>
          )}
        </div>
      )}

      {/* Activity Feed */}
      {activeTab === 'activity' && (
        <div className="space-y-4">
          {activities.length === 0 ? (
            <div className="text-center py-16 bg-gray-800/60 backdrop-blur-md rounded-3xl border border-gray-700">
              <Activity className="w-16 h-16 text-gray-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Chưa có hoạt động</h3>
              <p className="text-gray-400">Hoạt động của bạn bè sẽ hiển thị ở đây</p>
            </div>
          ) : (
            activities.map((activity) => (
              <div
                key={activity.id}
                className="bg-gray-800/70 backdrop-blur-lg rounded-2xl p-6 border border-gray-700 hover:border-yellow-400/50 transition-all"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
                    {getActivityIcon(activity.activity_type)}
                  </div>
                  <div className="flex-1">
                    <p className="text-white mb-2">{getActivityText(activity)}</p>
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <Clock className="w-3 h-3" />
                      <span>{new Date(activity.created_at).toLocaleString('vi-VN')}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Leaderboard */}
      {activeTab === 'leaderboard' && (
        <div className="space-y-4">
          {leaderboard.length === 0 ? (
            <div className="text-center py-16 bg-gray-800/60 backdrop-blur-md rounded-3xl border border-gray-700">
              <TrendingUp className="w-16 h-16 text-gray-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Chưa có bảng xếp hạng</h3>
              <p className="text-gray-400">Kết bạn để xem bảng xếp hạng!</p>
            </div>
          ) : (
            leaderboard.map((entry) => (
              <div
                key={entry.friend_id}
                className={`bg-gray-800/70 backdrop-blur-lg rounded-2xl p-6 border transition-all ${
                  entry.rank === 1
                    ? 'border-yellow-400 bg-gradient-to-r from-yellow-400/10 to-transparent'
                    : entry.rank === 2
                    ? 'border-gray-400 bg-gradient-to-r from-gray-400/10 to-transparent'
                    : entry.rank === 3
                    ? 'border-orange-600 bg-gradient-to-r from-orange-600/10 to-transparent'
                    : 'border-gray-700'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="text-center min-w-[60px]">
                    {entry.rank === 1 ? (
                      <div className="text-4xl">🥇</div>
                    ) : entry.rank === 2 ? (
                      <div className="text-4xl">🥈</div>
                    ) : entry.rank === 3 ? (
                      <div className="text-4xl">🥉</div>
                    ) : (
                      <div className="text-2xl font-black text-gray-400">#{entry.rank}</div>
                    )}
                  </div>
                  <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl font-black text-white">
                      {entry.friend_username?.[0]?.toUpperCase() || '?'}
                    </span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-white">
                      {entry.friend_full_name || entry.friend_username}
                    </h3>
                    <p className="text-sm text-gray-400">@{entry.friend_username}</p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-2 text-green-400 mb-1">
                      <Zap className="w-5 h-5" />
                      <span className="text-xl font-bold">Lv {entry.friend_level}</span>
                    </div>
                    <div className="flex items-center gap-2 text-blue-400">
                      <Trophy className="w-4 h-4" />
                      <span className="text-sm font-bold">{entry.friend_xp.toLocaleString()} XP</span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Send Coins Modal */}
      {selectedFriend && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-3xl p-8 max-w-md w-full border border-gray-700 animate-scale-in">
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Gift className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-black text-white mb-2">Tặng Xu Cho Bạn</h2>
              <p className="text-gray-400">
                Gửi xu cho {friends.find((f) => f.friend_id === selectedFriend)?.friend_full_name}
              </p>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-bold text-gray-300 mb-2">Số xu muốn tặng</label>
              <input
                type="number"
                min="1"
                value={coinAmount}
                onChange={(e) => setCoinAmount(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl text-white text-center text-2xl font-bold focus:border-yellow-400 focus:outline-none"
              />
              <div className="flex gap-2 mt-3">
                {[10, 50, 100, 500].map((amount) => (
                  <button
                    key={amount}
                    onClick={() => setCoinAmount(amount)}
                    className="flex-1 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm font-bold transition-all"
                  >
                    {amount}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setSelectedFriend(null);
                  setCoinAmount(10);
                }}
                disabled={sendingCoins}
                className="flex-1 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-xl font-bold transition-all disabled:opacity-50"
              >
                Hủy
              </button>
              <button
                onClick={() => sendCoins(selectedFriend, coinAmount)}
                disabled={sendingCoins}
                className="flex-1 py-3 bg-yellow-400 hover:bg-yellow-500 text-white rounded-xl font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {sendingCoins ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-900"></div>
                    Đang gửi...
                  </>
                ) : (
                  <>
                    <Gift className="w-5 h-5" />
                    Gửi {coinAmount} xu
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Friend Chat Modal */}
      {chatFriend && (
        <FriendChat
          friendId={chatFriend.friend_id}
          friendName={chatFriend.friend_full_name || chatFriend.friend_username}
          friendUsername={chatFriend.friend_username}
          onClose={() => setChatFriend(null)}
        />
      )}
    </div>
  );
};

