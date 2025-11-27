import { BookOpen, Gamepad2, Coins, Route, User, Home } from 'lucide-react';

type Tab = 'home' | 'lessons' | 'games' | 'coins' | 'roadmap' | 'profile' | 'course-roadmap';

type NavbarProps = {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
};

export const Navbar = ({ activeTab, onTabChange }: NavbarProps) => {
  const menuItems = [
    { id: 'home' as Tab, label: 'Trang chủ', icon: Home },
    { id: 'lessons' as Tab, label: 'Khóa học', icon: BookOpen },
    { id: 'roadmap' as Tab, label: 'Lộ trình học', icon: Route },
    { id: 'games' as Tab, label: 'Trò chơi', icon: Gamepad2 },
    { id: 'coins' as Tab, label: 'Nạp xu', icon: Coins },
    { id: 'profile' as Tab, label: 'Hồ sơ', icon: User },
  ];

  return (
    <nav className="bg-white/80 backdrop-blur-xl border-b border-white/30 shadow-lg sticky top-16 z-30">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-center gap-2 overflow-x-auto py-3">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg scale-105'
                    : 'text-gray-300 hover:bg-gray-100 hover:scale-105'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="hidden sm:inline">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

