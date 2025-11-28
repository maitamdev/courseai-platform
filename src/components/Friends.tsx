import { useState, useEffect } from 'react';
import { Users, UserPlus, Search, Trophy } from 'lucide-react';
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
  sender_level: number;
  created_at: string;
};

export const Friends = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'friends' | 'requests' | 'search' | 'leaderboard'>('friends');
  const [friends, setFriends] = useState<Friend[]>([]);
  const [requests, setRequests] = useState<FriendRequest[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      fetchFriends();
      fetchRequests();
    }
  }, [user]);

  const fetchFriends = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('friendships')
      .select(`
        friend_id,
        profiles:friend_id (
          id,
          username,
          full_name,
          avatar_url,
          level,
          total_xp,
          total_coins
        )
      `)
      .eq('user_id', user.id)
      .eq('status', 'accepted');

    if (error) {
      console.error('Error fetching friends:', error);
      return;
    }

    if (data) {
      const friendsList = data.map((item: any) => ({
        id: item.profiles.id,
        username: item.profiles.username,
        full_name: item.profiles.full_name,
        avatar_url: item.profiles.avatar_url,
        level: item.profiles.level,
        total_xp: item.profiles.total_xp,
        total_coins: item.profiles.total_coins
      }));
      setFriends(friendsList);
    }
  };

  const fetchRequests = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('friend_requests')
      .select(`
        id,
        sender_id,
        profiles!friend_requests_sender_id_fkey (
          username,
          full_name,
          level
        )
      `)
      .eq('receiver_id', user.id)
      .eq('status', 'pending');

    if (data) {
      setRequests(data.map((req: any) => ({
        id: req.id,
        sender_id: req.sender_id,
        sender_username: req.profiles.username,
        sender_full_name: req.profiles.full_name,
        sender_level: req.profiles.level,
        created_at: req.created_at
      })));
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    const { data } = await supabase
      .from('profiles')
      .select('id, username, full_name, level, total_xp')
      .or(`username.ilike.%${searchQuery}%,full_name.ilike.%${searchQuery}%`)
      .neq('id', user?.id)
      .limit(10);

    if (data) setSearchResults(data);
  };

  const sendFriendRequest = async (receiverId: string) => {
    if (!user) return;

    await supabase.from('friend_requests').insert({
      sender_id: user.id,
      receiver_id: receiverId,
      status: 'pending'
    });

    alert('Đã gửi lời mời kết bạn!');
  };

  const acceptRequest = async (requestId: string, senderId: string) => {
    if (!user) return;

    try {
      // Update request status - trigger sẽ tự động tạo friendship
      const { error } = await supabase
        .from('friend_requests')
        .update({ status: 'accepted' })
        .eq('id', requestId);

      if (error) {
        console.error('Error accepting request:', error);
        alert('Có lỗi xảy ra: ' + error.message);
        return;
      }

      alert('Đã chấp nhận lời mời kết bạn!');
      
      // Refresh data
      setTimeout(() => {
        fetchFriends();
        fetchRequests();
      }, 500);
    } catch (error) {
      console.error('Error accepting request:', error);
      alert('Có lỗi xảy ra!');
    }
  };

  const rejectRequest = async (requestId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('friend_requests')
        .update({ status: 'rejected' })
        .eq('id', requestId);

      if (error) {
        alert('Có lỗi xảy ra: ' + error.message);
        return;
      }

      alert('Đã từ chối lời mời kết bạn');
      fetchRequests();
    } catch {
      alert('Có lỗi xảy ra!');
    }
  };

  const unfriend = async (friendId: string, friendName: string) => {
    if (!user) return;
    
    if (!confirm(`Bạn có chắc muốn hủy kết bạn với ${friendName}?`)) return;

    try {
      // Xóa cả 2 chiều friendship
      const { error: error1 } = await supabase
        .from('friendships')
        .delete()
        .eq('user_id', user.id)
        .eq('friend_id', friendId);

      const { error: error2 } = await supabase
        .from('friendships')
        .delete()
        .eq('user_id', friendId)
        .eq('friend_id', user.id);

      if (error1 || error2) {
        alert('Có lỗi xảy ra!');
        return;
      }

      alert('Đã hủy kết bạn');
      fetchFriends();
    } catch {
      alert('Có lỗi xảy ra!');
    }
  };

  const openChat = (friendId: string) => {
    // Store friend ID to open chat with
    try {
      sessionStorage.setItem('openChatWith', friendId);
    } catch (e) {
      console.warn('sessionStorage not available');
    }
    // Trigger tab change event
    const event = new CustomEvent('changeTab', { detail: 'messages' });
    window.dispatchEvent(event);
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-black text-white mb-2">Bạn bè</h1>
        <p className="text-gray-400">Kết nối và học tập cùng bạn bè</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 bg-gray-800/50 backdrop-blur-lg rounded-xl p-2">
        <button
          onClick={() => setActiveTab('friends')}
          className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-all ${
            activeTab === 'friends'
              ? 'bg-yellow-400 text-gray-900'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <Users className="w-5 h-5 inline mr-2" />
          Bạn bè ({friends.length})
        </button>
        <button
          onClick={() => setActiveTab('requests')}
          className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-all ${
            activeTab === 'requests'
              ? 'bg-yellow-400 text-gray-900'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <UserPlus className="w-5 h-5 inline mr-2" />
          Lời mời ({requests.length})
        </button>
        <button
          onClick={() => setActiveTab('search')}
          className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-all ${
            activeTab === 'search'
              ? 'bg-yellow-400 text-gray-900'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <Search className="w-5 h-5 inline mr-2" />
          Tìm kiếm
        </button>
        <button
          onClick={() => setActiveTab('leaderboard')}
          className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-all ${
            activeTab === 'leaderboard'
              ? 'bg-yellow-400 text-gray-900'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <Trophy className="w-5 h-5 inline mr-2" />
          Xếp hạng
        </button>
      </div>

      {/* Content */}
      <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-6 border border-gray-700">
        {activeTab === 'friends' && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {friends.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">Chưa có bạn bè nào</p>
              </div>
            ) : (
              friends.map((friend) => (
                <div key={friend.id} className="bg-gray-900/50 rounded-xl p-4 border border-gray-700 hover:border-yellow-400 transition-all">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-white font-bold overflow-hidden">
                      {friend.avatar_url ? (
                        <img src={friend.avatar_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        friend.username?.[0]?.toUpperCase()
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-white">{friend.full_name || friend.username}</h3>
                      <p className="text-sm text-gray-400">Level {friend.level}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 text-sm mb-3">
                    <div className="flex-1 bg-gray-800 rounded-lg p-2 text-center">
                      <div className="text-yellow-400 font-bold">{friend.total_xp}</div>
                      <div className="text-gray-500 text-xs">XP</div>
                    </div>
                    <div className="flex-1 bg-gray-800 rounded-lg p-2 text-center">
                      <div className="text-yellow-400 font-bold">{friend.total_coins}</div>
                      <div className="text-gray-500 text-xs">Xu</div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => openChat(friend.id)}
                      className="flex-1 px-4 py-2 bg-yellow-400 hover:bg-yellow-500 text-gray-900 rounded-lg font-semibold transition-all text-sm"
                    >
                      💬 Nhắn tin
                    </button>
                    <button 
                      onClick={() => unfriend(friend.id, friend.full_name || friend.username)}
                      className="px-3 py-2 bg-red-500/20 hover:bg-red-500 text-red-400 hover:text-white rounded-lg font-semibold transition-all text-sm"
                      title="Hủy kết bạn"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'requests' && (
          <div className="space-y-3">
            {requests.length === 0 ? (
              <div className="text-center py-12">
                <UserPlus className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">Không có lời mời kết bạn</p>
              </div>
            ) : (
              requests.map((req) => (
                <div key={req.id} className="flex items-center justify-between bg-gray-900/50 rounded-xl p-4 border border-gray-700">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                      {req.sender_username?.[0]?.toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-bold text-white">{req.sender_full_name || req.sender_username}</h3>
                      <p className="text-sm text-gray-400">Level {req.sender_level}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => acceptRequest(req.id, req.sender_id)}
                      className="px-5 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-semibold transition-all"
                    >
                      ✓ Chấp nhận
                    </button>
                    <button
                      onClick={() => rejectRequest(req.id)}
                      className="px-5 py-2 bg-red-500/20 hover:bg-red-500 text-red-400 hover:text-white rounded-lg font-semibold transition-all"
                    >
                      ✕ Từ chối
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'search' && (
          <div>
            <div className="flex gap-2 mb-6">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Tìm theo tên hoặc username..."
                className="flex-1 px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-yellow-400 focus:outline-none"
              />
              <button
                onClick={handleSearch}
                className="px-6 py-3 bg-yellow-400 hover:bg-yellow-500 text-gray-900 rounded-lg font-semibold transition-all"
              >
                <Search className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              {searchResults.map((result) => (
                <div key={result.id} className="flex items-center justify-between bg-gray-900/50 rounded-xl p-4 border border-gray-700">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold">
                      {result.username?.[0]?.toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-bold text-white">{result.full_name || result.username}</h3>
                      <p className="text-sm text-gray-400">Level {result.level} • {result.total_xp} XP</p>
                    </div>
                  </div>
                  <button
                    onClick={() => sendFriendRequest(result.id)}
                    className="px-6 py-2 bg-yellow-400 hover:bg-yellow-500 text-gray-900 rounded-lg font-semibold transition-all"
                  >
                    Kết bạn
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'leaderboard' && (
          <div className="text-center py-12">
            <Trophy className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
            <p className="text-gray-400">Bảng xếp hạng đang được phát triển</p>
          </div>
        )}
      </div>
    </div>
  );
};
