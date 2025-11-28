import { useState } from 'react';
import { BookOpen, Gamepad2, Coins, Route, User, Home, Menu, X, Trophy, ChevronLeft, ChevronRight, MessageCircle } from 'lucide-react';

type Tab = 'home' | 'lessons' | 'games' | 'coins' | 'roadmap' | 'profile' | 'course-roadmap' | 'messages';

type SidebarProps = {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
};

export const Sidebar = ({ activeTab, onTabChange }: SidebarProps) => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

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
                      <Icon className="w-5 h-5 flex-shrink-0" />
                      {!isCollapsed && <span>{item.label}</span>}
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
