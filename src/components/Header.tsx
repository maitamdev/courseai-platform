import { useAuth } from '../contexts/AuthContext';
import { Code2, Sparkles, Coins, LogOut, User, Zap, BookOpen, Gamepad2, Route, Home, Users } from 'lucide-react';

type Tab = 'home' | 'lessons' | 'games' | 'coins' | 'roadmap' | 'profile' | 'course-roadmap' | 'treasure-quest' | 'friends';

type HeaderProps = {
  activeTab?: Tab;
  onTabChange?: (tab: Tab) => void;
};

export const Header = ({ activeTab, onTabChange }: HeaderProps) => {
  const { profile, signOut } = useAuth();

  const menuItems = [
    { id: 'home' as Tab, label: 'Trang chủ', icon: Home },
    { id: 'lessons' as Tab, label: 'Khóa học', icon: BookOpen },
    { id: 'roadmap' as Tab, label: 'Lộ trình học', icon: Route },
    { id: 'games' as Tab, label: 'Trò chơi', icon: Gamepad2 },
    { id: 'friends' as Tab, label: 'Bạn bè', icon: Users },
    { id: 'coins' as Tab, label: 'Nạp xu', icon: Coins },
    { id: 'profile' as Tab, label: 'Hồ sơ', icon: User },
  ];

  return (
    <header className="bg-gradient-to-r from-gray-800 via-gray-900 to-gray-800 shadow-2xl sticky top-0 z-40 border-b border-gray-700">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Logo - Left */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="flex items-center gap-1 relative">
              <Code2 className="w-8 h-8 text-white drop-shadow-lg" />
              <Sparkles className="w-6 h-6 text-yellow-300 drop-shadow-lg" />
            </div>
            <div className="hidden lg:block">
              <h1 className="text-xl font-black text-white drop-shadow-lg">COURSE AI</h1>
              <p className="text-xs text-white/90 font-medium">Học lập trình với AI</p>
            </div>
          </div>

          {/* Navigation Menu - Center */}
          {onTabChange && (
            <div className="flex items-center gap-1 overflow-x-auto flex-1 justify-center">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                
                return (
                  <button
                    key={item.id}
                    onClick={() => onTabChange(item.id)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg font-semibold transition-all whitespace-nowrap text-sm ${
                      isActive
                        ? 'bg-yellow-400 text-gray-900 shadow-lg'
                        : 'text-white/80 hover:bg-gray-700 hover:text-white'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="hidden md:inline">{item.label}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* User Info - Right */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-xl border-2 border-yellow-600">
              <Coins className="w-4 h-4" />
              <span className="font-black text-sm">{profile?.total_coins || 0}</span>
            </div>

            <div className="hidden lg:flex items-center gap-2 bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-full border-2 border-white/30">
              <div className="w-6 h-6 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                <User className="w-3 h-3 text-white" />
              </div>
              <span className="font-bold text-white text-sm">{profile?.username}</span>
              <div className="flex items-center gap-1 bg-gradient-to-r from-green-400 to-emerald-500 text-white px-2 py-0.5 rounded-full">
                <Zap className="w-3 h-3" />
                <span className="text-xs font-black">Lv {profile?.level || 1}</span>
              </div>
            </div>

            <button
              onClick={signOut}
              className="p-2 bg-white/20 backdrop-blur-md hover:bg-white/30 rounded-lg transition-all border-2 border-white/30 hover:scale-110 group"
              title="Đăng xuất"
            >
              <LogOut className="w-4 h-4 text-white group-hover:rotate-12 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
