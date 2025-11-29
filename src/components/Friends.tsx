import { useState, useEffect } from 'react';
import { Users, UserPlus, Search, Trophy, MessageCircle, X, Crown, Zap, Coins, Star, TrendingUp, UserCheck, Clock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

type Friend = {
  id: string;
  username: string;
  full_name: string;
  avatar_url: string | null;
  level: number;
  total_xp: number;
  total_coins: number;
};

type FriendRequest = {
  id: string;
  sender_id: string;
  sender_username: string;
  sender_full_name: string;
  sender_avatar_url: string | null;
  sender_level: number;
  created_at: string;
};

type LeaderboardUser = {
  id: string;
  username: string;
  full_name: string;
  avatar_url: string | null;
  level: number;
  total_xp: number;
  total_coins: number;
};

export const Friends = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'friends' | 'requests' | 'search' | 'leaderboard'>('friends');
  const [friends, setFriends] = useState<Friend[]>([]);
  const [requests, setRequests] = useState<FriendRequest[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (user) {
      fetchFriends();
      fetchRequests();
      fetchLeaderboard();
    }
  }, [user]);

  const fetchFriends = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('friendships')
      .select(`friend_id, profiles:friend_id (id, username, full_name, avatar_url, level, total_xp, total_coins)`)
      .eq('user_id', user.id)
      .eq('status', 'accepted');

    if (data) {
      setFriends(data.map((item: any) => ({
        id: item.profiles.id, username: item.profiles.username, full_name: item.profiles.full_name,
        avatar_url: item.profiles.avatar_url, level: item.profiles.level,
        total_xp: item.profiles.total_xp, total_coins: item.profiles.total_coins
      })));
    }
  };

  const fetchRequests = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('friend_requests')
      .select(`id, sender_id, created_at, profiles!friend_requests_sender_id_fkey (username, full_name, avatar_url, level)`)
      .eq('receiver_id', user.id)
      .eq('status', 'pending');

    if (data) {
      setRequests(data.map((req: any) => ({
        id: req.id, sender_id: req.sender_id, sender_username: req.profiles.username,
        sender_full_name: req.profiles.full_name, sender_avatar_url: req.profiles.avatar_url,
        sender_level: req.profiles.level, created_at: req.created_at
      })));
    }
  };

  const fetchLeaderboard = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('id, username, full_name, avatar_url, level, total_xp, total_coins')
      .order('total_xp', { ascending: false })
      .limit(20);
    if (data) setLeaderboard(data);
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    const { data } = await supabase
      .from('profiles')
      .select('id, username, full_name, avatar_url, level, total_xp')
      .or(`username.ilike.%${searchQuery}%,full_name.ilike.%${searchQuery}%`)
      .neq('id', user?.id)
      .limit(10);
    if (data) setSearchResults(data);
    setIsSearching(false);
  };

  const sendFriendRequest = async (receiverId: string) => {
    if (!user) return;
    await supabase.from('friend_requests').insert({ sender_id: user.id, receiver_id: receiverId, status: 'pending' });
    alert('Đã gửi lời mời kết bạn!');
  };

  const acceptRequest = async (requestId: string, _senderId: string) => {
    if (!user) return;
    await supabase.from('friend_requests').update({ status: 'accepted' }).eq('id', requestId);
    setTimeout(() => { fetchFriends(); fetchRequests(); }, 500);
  };

  const rejectRequest = async (requestId: string) => {
    await supabase.from('friend_requests').update({ status: 'rejected' }).eq('id', requestId);
    fetchRequests();
  };

  const unfriend = async (friendId: string, friendName: string) => {
    if (!user || !confirm(`Hủy kết bạn với ${friendName}?`)) return;
    await supabase.from('friendships').delete().eq('user_id', user.id).eq('friend_id', friendId);
    await supabase.from('friendships').delete().eq('user_id', friendId).eq('friend_id', user.id);
    fetchFriends();
  };

  const openChat = (friendId: string) => {
    try { sessionStorage.setItem('openChatWith', friendId); } catch {}
    window.dispatchEvent(new CustomEvent('changeTab', { detail: 'messages' }));
  };

  const formatTime = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins} phút trước`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours} giờ trước`;
    return `${Math.floor(hours / 24)} ngày trước`;
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Hero Header */}
      <div className="relative bg-gradient-to-r from-purple-900/50 via-blue-900/50 to-cyan-900/50 rounded-3xl p-8 mb-6 overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMSIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjEpIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-50"></div>
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-black text-white mb-2 flex items-center gap-3">
              <Users className="w-10 h-10 text-cyan-400" />
              Bạn bè
            </h1>
            <p className="text-gray-300">Kết nối, học tập và cạnh tranh cùng bạn bè!</p>
          </div>
          <div className="flex gap-4">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl px-6 py-4 text-center border border-white/20">
              <div className="text-3xl font-black text-cyan-400">{friends.length}</div>
              <div className="text-gray-300 text-sm">Bạn bè</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl px-6 py-4 text-center border border-white/20">
              <div className="text-3xl font-black text-yellow-400">{requests.length}</div>
              <div className="text-gray-300 text-sm">Lời mời</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {[
          { id: 'friends', label: 'Bạn bè', icon: Users, count: friends.length, color: 'cyan' },
          { id: 'requests', label: 'Lời mời', icon: UserPlus, count: requests.length, color: 'yellow' },
          { id: 'search', label: 'Tìm kiếm', icon: Search, color: 'green' },
          { id: 'leaderboard', label: 'Xếp hạng', icon: Trophy, color: 'purple' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold transition-all ${
              activeTab === tab.id
                ? `bg-${tab.color}-500 text-white shadow-lg shadow-${tab.color}-500/30`
                : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50 hover:text-white'
            }`}
          >
            <tab.icon className="w-5 h-5" />
            <span>{tab.label}</span>
            {tab.count !== undefined && tab.count > 0 && (
              <span className={`px-2 py-0.5 rounded-full text-xs ${activeTab === tab.id ? 'bg-white/20' : 'bg-gray-700'}`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="bg-gray-800/50 backdrop-blur-md rounded-2xl border border-gray-700/50 p-6">
        {/* Friends Tab */}
        {activeTab === 'friends' && (
          <div className="space-y-4">
            {friends.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">Bạn chưa có bạn bè nào</p>
                <p className="text-gray-500 text-sm">Tìm kiếm và kết bạn ngay!</p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {friends.map((friend) => (
                  <div key={friend.id} className="bg-gray-900/50 rounded-xl p-4 border border-gray-700/50 hover:border-cyan-500/50 transition-all">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <img
                          src={friend.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${friend.username}`}
                          alt={friend.username}
                          className="w-14 h-14 rounded-full border-2 border-cyan-500/50"
                        />
                        <div className="absolute -bottom-1 -right-1 bg-cyan-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                          {friend.level}
                        </div>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-white">{friend.full_name || friend.username}</h3>
                        <p className="text-gray-400 text-sm">@{friend.username}</p>
                        <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Zap className="w-3 h-3 text-yellow-400" />
                            {friend.total_xp} XP
                          </span>
                          <span className="flex items-center gap-1">
                            <Coins className="w-3 h-3 text-yellow-400" />
                            {friend.total_coins}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => openChat(friend.id)}
                          className="p-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors"
                          title="Nhắn tin"
                        >
                          <MessageCircle className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => unfriend(friend.id, friend.full_name || friend.username)}
                          className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
                          title="Hủy kết bạn"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Requests Tab */}
        {activeTab === 'requests' && (
          <div className="space-y-4">
            {requests.length === 0 ? (
              <div className="text-center py-12">
                <UserPlus className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">Không có lời mời kết bạn nào</p>
              </div>
            ) : (
              <div className="space-y-3">
                {requests.map((req) => (
                  <div key={req.id} className="bg-gray-900/50 rounded-xl p-4 border border-gray-700/50 hover:border-yellow-500/50 transition-all">
                    <div className="flex items-center gap-4">
                      <img
                        src={req.sender_avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${req.sender_username}`}
                        alt={req.sender_username}
                        className="w-12 h-12 rounded-full border-2 border-yellow-500/50"
                      />
                      <div className="flex-1">
                        <h3 className="font-bold text-white">{req.sender_full_name || req.sender_username}</h3>
                        <p className="text-gray-400 text-sm">@{req.sender_username} • Level {req.sender_level}</p>
                        <p className="text-gray-500 text-xs flex items-center gap-1 mt-1">
                          <Clock className="w-3 h-3" />
                          {formatTime(req.created_at)}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => acceptRequest(req.id, req.sender_id)}
                          className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium flex items-center gap-2"
                        >
                          <UserCheck className="w-4 h-4" />
                          Chấp nhận
                        </button>
                        <button
                          onClick={() => rejectRequest(req.id)}
                          className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors font-medium"
                        >
                          Từ chối
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Search Tab */}
        {activeTab === 'search' && (
          <div className="space-y-4">
            <div className="flex gap-3">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Tìm kiếm theo tên hoặc username..."
                className="flex-1 bg-gray-900/50 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500"
              />
              <button
                onClick={handleSearch}
                disabled={isSearching}
                className="px-6 py-3 bg-cyan-500 text-white rounded-xl hover:bg-cyan-600 transition-colors font-bold flex items-center gap-2 disabled:opacity-50"
              >
                <Search className="w-5 h-5" />
                {isSearching ? 'Đang tìm...' : 'Tìm kiếm'}
              </button>
            </div>

            {searchResults.length > 0 && (
              <div className="space-y-3">
                {searchResults.map((result) => (
                  <div key={result.id} className="bg-gray-900/50 rounded-xl p-4 border border-gray-700/50 hover:border-green-500/50 transition-all">
                    <div className="flex items-center gap-4">
                      <img
                        src={result.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${result.username}`}
                        alt={result.username}
                        className="w-12 h-12 rounded-full border-2 border-green-500/50"
                      />
                      <div className="flex-1">
                        <h3 className="font-bold text-white">{result.full_name || result.username}</h3>
                        <p className="text-gray-400 text-sm">@{result.username} • Level {result.level}</p>
                      </div>
                      <button
                        onClick={() => sendFriendRequest(result.id)}
                        className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium flex items-center gap-2"
                      >
                        <UserPlus className="w-4 h-4" />
                        Kết bạn
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {searchQuery && searchResults.length === 0 && !isSearching && (
              <div className="text-center py-8">
                <Search className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400">Không tìm thấy kết quả</p>
              </div>
            )}
          </div>
        )}

        {/* Leaderboard Tab */}
        {activeTab === 'leaderboard' && (
          <div className="space-y-4">
            <div className="grid gap-3">
              {leaderboard.map((player, index) => (
                <div
                  key={player.id}
                  className={`rounded-xl p-4 border transition-all ${
                    index === 0
                      ? 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-yellow-500/50'
                      : index === 1
                      ? 'bg-gradient-to-r from-gray-400/20 to-gray-500/20 border-gray-400/50'
                      : index === 2
                      ? 'bg-gradient-to-r from-orange-600/20 to-orange-700/20 border-orange-600/50'
                      : 'bg-gray-900/50 border-gray-700/50 hover:border-purple-500/50'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 flex items-center justify-center">
                      {index === 0 ? (
                        <Crown className="w-8 h-8 text-yellow-400" />
                      ) : index === 1 ? (
                        <Crown className="w-7 h-7 text-gray-400" />
                      ) : index === 2 ? (
                        <Crown className="w-6 h-6 text-orange-500" />
                      ) : (
                        <span className="text-xl font-bold text-gray-500">#{index + 1}</span>
                      )}
                    </div>
                    <img
                      src={player.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${player.username}`}
                      alt={player.username}
                      className="w-12 h-12 rounded-full border-2 border-purple-500/50"
                    />
                    <div className="flex-1">
                      <h3 className="font-bold text-white flex items-center gap-2">
                        {player.full_name || player.username}
                        {player.id === user?.id && (
                          <span className="text-xs bg-cyan-500/20 text-cyan-400 px-2 py-0.5 rounded-full">Bạn</span>
                        )}
                      </h3>
                      <p className="text-gray-400 text-sm">@{player.username}</p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-yellow-400 font-bold">
                        <Star className="w-4 h-4" />
                        {player.total_xp.toLocaleString()} XP
                      </div>
                      <div className="text-gray-400 text-sm flex items-center gap-1 justify-end">
                        <TrendingUp className="w-3 h-3" />
                        Level {player.level}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
