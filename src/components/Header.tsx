import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Code2, Sparkles, Coins, LogOut, User, Zap, BookOpen, Gamepad2, Home, Users, MessageCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

type Tab = 'home' | 'lessons' | 'games' | 'coins' | 'profile' | 'treasure-quest' | 'friends' | 'messages';

type HeaderProps = {
  activeTab?: Tab;
  onTabChange?: (tab: Tab) => void;
};

export const Header = ({ activeTab, onTabChange }: HeaderProps) => {
  const { user, profile, signOut } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch unread messages count
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

  const menuItems = [
    { id: 'home' as Tab, label: 'Trang chủ', icon: Home, badge: 0 },
    { id: 'lessons' as Tab, label: 'Khóa học', icon: BookOpen, badge: 0 },
    { id: 'games' as Tab, label: 'Trò chơi', icon: Gamepad2, badge: 0 },
    { id: 'friends' as Tab, label: 'Bạn bè', icon: Users, badge: 0 },
    { id: 'messages' as Tab, label: 'Tin nhắn', icon: MessageCircle, badge: unreadCount },
    { id: 'coins' as Tab, label: 'Nạp xu', icon: Coins, badge: 0 },
  ];

  return (
    <header className="bg-gradient-to-r from-gray-800 via-gray-900 to-gray-800 shadow-2xl sticky top-0 z-40 border-b border-gray-700">
      <div className="max-w-full mx-auto px-6 py-4">
        <div className="flex items-center justify-between gap-6">
          {/* Logo - Left */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="flex items-center gap-1.5 relative">
              <Code2 className="w-9 h-9 text-white drop-shadow-lg" />
              <Sparkles className="w-7 h-7 text-yellow-300 drop-shadow-lg animate-pulse" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white drop-shadow-lg">CodeMind AI</h1>
              <p className="text-xs text-white/80 font-medium">Học lập trình với AI</p>
            </div>
          </div>

          {/* Navigation Menu - Center (Full Width) */}
          {onTabChange && (
            <div className="flex items-center gap-3 flex-1 justify-center max-w-5xl">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                
                return (
                  <button
                    key={item.id}
                    onClick={() => onTabChange(item.id)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold transition-all whitespace-nowrap ${
                      isActive
                        ? 'bg-yellow-400 text-gray-900 shadow-lg scale-105'
                        : 'text-white/90 hover:bg-gray-700/50 hover:text-white hover:scale-105'
                    }`}
                  >
                    <div className="relative">
                      <Icon className="w-5 h-5" />
                      {item.badge > 0 && (
                        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold min-w-[18px] h-[18px] rounded-full flex items-center justify-center px-1 animate-pulse">
                          {item.badge > 99 ? '99+' : item.badge}
                        </span>
                      )}
                    </div>
                    <span className="hidden xl:inline">{item.label}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* User Info - Right */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 px-4 py-2 rounded-full flex items-center gap-2 shadow-xl border-2 border-yellow-600">
              <Coins className="w-5 h-5" />
              <span className="font-black">{profile?.total_coins || 0}</span>
            </div>

            <button
              onClick={() => onTabChange?.('profile')}
              className="hidden xl:flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border-2 border-white/20 hover:bg-white/20 hover:scale-105 transition-all cursor-pointer"
              title="Xem hồ sơ"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-white">{profile?.username}</span>
              <div className="flex items-center gap-1 bg-gradient-to-r from-green-400 to-emerald-500 text-white px-2.5 py-1 rounded-full">
                <Zap className="w-4 h-4" />
                <span className="text-sm font-black">Lv {profile?.level || 1}</span>
              </div>
            </button>

            <button
              onClick={signOut}
              className="p-2.5 bg-red-500/20 backdrop-blur-md hover:bg-red-500/30 rounded-xl transition-all border-2 border-red-500/30 hover:scale-110 group"
              title="Đăng xuất"
            >
              <LogOut className="w-5 h-5 text-red-400 group-hover:text-red-300 group-hover:rotate-12 transition-all" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

