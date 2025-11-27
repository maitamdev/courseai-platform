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
      <div className="max-w-full mx-auto px-6 py-4">
        <div className="flex items-center justify-between gap-6">
          {/* Logo - Left */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="flex items-center gap-1.5 relative">
              <Code2 className="w-9 h-9 text-white drop-shadow-lg" />
              <Sparkles className="w-7 h-7 text-yellow-300 drop-shadow-lg animate-pulse" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white drop-shadow-lg">COURSE AI</h1>
              <p className="text-xs text-white/80 font-medium">Học lập trình với AI</p>
            </div>
          </div>

          {/* Navigation Menu - Center (Full Width) */}
          {onTabChange && (
            <div className="flex items-center gap-2 flex-1 justify-center max-w-4xl">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                
                return (
                  <button
                    key={item.id}
                    onClick={() => onTabChange(item.id)}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold transition-all whitespace-nowrap ${
                      isActive
                        ? 'bg-yellow-400 text-white shadow-lg scale-105'
                        : 'text-white/90 hover:bg-gray-700/50 hover:text-white hover:scale-105'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="hidden lg:inline">{item.label}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* User Info - Right */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-2 rounded-full flex items-center gap-2 shadow-xl border-2 border-yellow-600">
              <Coins className="w-5 h-5" />
              <span className="font-black">{profile?.total_coins || 0}</span>
            </div>

            <div className="hidden xl:flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border-2 border-white/20">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-white">{profile?.username}</span>
              <div className="flex items-center gap-1 bg-gradient-to-r from-green-400 to-emerald-500 text-white px-2.5 py-1 rounded-full">
                <Zap className="w-4 h-4" />
                <span className="text-sm font-black">Lv {profile?.level || 1}</span>
              </div>
            </div>

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

