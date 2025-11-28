import { useState, useEffect } from 'react';
import { BookOpen, Gamepad2, Coins, Route, User, Home, Menu, X, Trophy, ChevronLeft, ChevronRight, MessageCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

type Tab = 'home' | 'lessons' | 'games' | 'coins' | 'roadmap' | 'profile' | 'course-roadmap' | 'messages';

type SidebarProps = {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
};

export const Sidebar = ({ activeTab, onTabChange }: SidebarProps) => {
  const { user } = useAuth();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user) {
      fetchUnreadCount();
      const interval = setInterval(fetchUnreadCount, 5000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const fetchUnreadCount = async () => {
    if (!user) return;
    
    const { count, error } = await supabase
      .from('friend_messages')
      .select('*', { count: 'exact', head: true })
      .eq('receiver_id', user.id)
      .eq('is_read', false);
    
    if (!error && count !== null) {
      setUnreadCount(count);
    }
  };

  const menuItems = [
    { id: 'home' as Tab, label: 'Trang chủ', icon: Home },
    { id: 'lessons' as Tab, label: 'Khóa học', icon: BookOpen },
    { id: 'roadmap' as Tab, label: 'Lộ trình học', icon: Route },
    { id: 'games' as Tab, label: 'Trò chơi', icon: Gamepad2 },
    { id: 'messages' as Tab, label: 'Tin nhắn', icon: MessageCircle },
    { id: 'coins' as Tab, label: 'Nạp xu', icon: Coins },
    { id: 'profile' as Tab, label: 'Hồ sơ', icon: User },
  ];

  return (
    <>
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="lg:hidden fixed top-20 left-4 z-50 p-3 bg-white/80 backdrop-blur-xl rounded-xl shadow-lg hover:shadow-xl transition-all border border-white/30"
      >
        {isMobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="hidden lg:block fixed top-24 z-50 p-2 bg-white/80 backdrop-blur-xl rounded-r-xl shadow-lg hover:shadow-xl transition-all border-l-0 border border-white/30"
        style={{ left: isCollapsed ? '64px' : '272px' }}
      >
        {isCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
      </button>

      <aside
        className={`fixed left-0 top-16 h-[calc(100vh-4rem)] bg-white/80 backdrop-blur-xl border-r border-white/30 shadow-xl z-40 transition-all duration-300 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } ${isCollapsed ? 'lg:w-20' : 'lg:w-72'}`}
      >
        <div className="flex flex-col h-full overflow-hidden">
          {!isCollapsed && (
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-white mb-1">Menu</h2>
              <p className="text-sm text-gray-300">Khám phá và học tập</p>
            </div>
          )}

          <nav className="flex-1 overflow-y-auto p-4">
            <ul className="space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                const showBadge = item.id === 'messages' && unreadCount > 0;

                return (
                  <li key={item.id}>
                    <button
                      onClick={() => {
                        onTabChange(item.id);
                        setIsMobileOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${
                        isActive
                          ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                          : 'text-gray-300 hover:bg-gray-100'
                      } ${isCollapsed ? 'justify-center' : ''}`}
                      title={isCollapsed ? item.label : ''}
                    >
                      <div className="relative">
                        <Icon className="w-5 h-5 flex-shrink-0" />
                        {showBadge && (
                          <span className="absolute -top-2 -right-2 min-w-[16px] h-[16px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 animate-pulse">
                            {unreadCount > 99 ? '99+' : unreadCount}
                          </span>
                        )}
                      </div>
                      {!isCollapsed && (
                        <div className="flex items-center gap-2 flex-1">
                          <span>{item.label}</span>
                          {showBadge && (
                            <span className="ml-auto bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                              {unreadCount > 99 ? '99+' : unreadCount}
                            </span>
                          )}
                        </div>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>

          {!isCollapsed && (
            <div className="p-4 border-t border-gray-200">
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Trophy className="w-5 h-5 text-yellow-600" />
                  <h3 className="font-bold text-white">Mẹo học tập</h3>
                </div>
                <p className="text-sm text-gray-300">
                  Học mỗi ngày 30 phút để đạt kết quả tốt nhất!
                </p>
              </div>
            </div>
          )}
        </div>
      </aside>

      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setIsMobileOpen(false)}
        />
      )}
    </>
  );
};
