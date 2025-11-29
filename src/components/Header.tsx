import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Coins, LogOut, User, Zap, BookOpen, Gamepad2, Home, Users, MessageCircle, Trophy, X, QrCode, Gift, Calendar, MoreHorizontal, Search } from 'lucide-react';
import { QRTopup } from './QRTopup';
import { Notifications } from './Notifications';
import { SearchModal } from './SearchModal';

type Tab = 'home' | 'lessons' | 'games' | 'coins' | 'profile' | 'treasure-quest' | 'friends' | 'messages' | 'events' | 'social' | 'rewards' | 'forum';

type CoinPackage = {
  id: string;
  name: string;
  coins: number;
  price_vnd: number;
  bonus_coins: number;
  is_popular: boolean;
};

type HeaderProps = {
  activeTab?: Tab;
  onTabChange?: (tab: Tab) => void;
};

export const Header = ({ activeTab, onTabChange }: HeaderProps) => {
  const { profile, signOut, user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [showCoinModal, setShowCoinModal] = useState(false);
  const [packages, setPackages] = useState<CoinPackage[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<CoinPackage | null>(null);
  const [showQR, setShowQR] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  useEffect(() => {
    if (user) {
      fetchUnreadCount();
      fetchPackages();
      const interval = setInterval(fetchUnreadCount, 5000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const fetchPackages = async () => {
    const { data } = await supabase
      .from('coin_packages')
      .select('*')
      .order('price_vnd');
    if (data) setPackages(data);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN').format(price) + 'đ';
  };

  const handleSelectPackage = (pkg: CoinPackage) => {
    setSelectedPackage(pkg);
    setShowQR(true);
  };

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
    { id: 'games' as Tab, label: 'Trò chơi', icon: Gamepad2 },
    { id: 'forum' as Tab, label: 'Hỏi đáp', icon: MessageCircle },
    { id: 'rewards' as Tab, label: 'Phần thưởng', icon: Calendar },
    { id: 'events' as Tab, label: 'Sự kiện', icon: Trophy },
    { id: 'friends' as Tab, label: 'Bạn bè', icon: Users },
  ];

  return (
    <>
    {/* Desktop Header */}
    <header className="bg-gradient-to-r from-gray-800 via-gray-900 to-gray-800 shadow-2xl sticky top-0 z-40 border-b border-gray-700">
      <div className="max-w-full mx-auto px-3 md:px-6 py-2 md:py-4">
        <div className="flex items-center justify-between gap-2 md:gap-6">
          {/* Logo - Left */}
          <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
            <img 
              src="/logo.png" 
              alt="CodeMind AI" 
              className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 object-contain drop-shadow-lg"
            />
            <div>
              <h1 className="text-sm sm:text-lg md:text-2xl font-black text-white drop-shadow-lg">
                <span className="text-[#c4e538]">CODE</span><span className="text-white">MIND</span>
              </h1>
              <p className="text-[8px] sm:text-[10px] md:text-xs text-white/80 font-medium">Học lập trình với AI</p>
            </div>
          </div>

          {/* Navigation Menu - Center (Hidden on mobile) */}
          {onTabChange && (
            <div className="hidden lg:flex items-center gap-2 xl:gap-3 flex-1 justify-center max-w-4xl">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                const showBadge = item.id === 'messages' && unreadCount > 0;
                
                return (
                  <button
                    key={item.id}
                    onClick={() => onTabChange(item.id)}
                    className={`relative flex items-center gap-1.5 px-3 py-2 rounded-xl font-bold transition-all whitespace-nowrap text-sm ${
                      isActive
                        ? 'bg-emerald-400 text-gray-900 shadow-lg'
                        : 'text-white/90 hover:bg-gray-700/50 hover:text-white'
                    }`}
                  >
                    <div className="relative">
                      <Icon className="w-4 h-4" />
                      {showBadge && (
                        <span className="absolute -top-2 -right-2 min-w-[16px] h-[16px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-0.5 animate-pulse">
                          {unreadCount > 99 ? '99+' : unreadCount}
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
          <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
            {/* Search button */}
            <button
              onClick={() => setShowSearch(true)}
              className="hidden sm:flex p-2 bg-gray-800/80 hover:bg-gray-700 rounded-lg transition-all"
              title="Tìm kiếm (Ctrl+K)"
            >
              <Search className="w-5 h-5 text-gray-300" />
            </button>

            {/* Notifications */}
            <div className="hidden sm:block">
              <Notifications />
            </div>

            {/* Coin button - Compact on mobile */}
            <button
              onClick={() => setShowCoinModal(true)}
              className="group relative bg-gradient-to-r from-emerald-500 via-green-400 to-emerald-500 text-gray-900 px-2 md:pl-3 md:pr-4 py-1.5 md:py-2 rounded-lg md:rounded-xl flex items-center gap-1.5 md:gap-2 shadow-lg hover:shadow-emerald-500/40 transition-all cursor-pointer overflow-hidden"
              title="Bấm để nạp xu"
            >
              <Coins className="w-4 h-4 md:w-5 md:h-5 text-gray-900" />
              <span className="font-black text-sm md:text-lg text-gray-900">{(profile?.total_coins || 0).toLocaleString()}</span>
              <span className="text-gray-900 font-bold text-xs hidden sm:inline">+</span>
            </button>

            {/* Profile button - Mobile */}
            <button
              onClick={() => onTabChange?.('profile')}
              className="lg:hidden w-9 h-9 rounded-lg overflow-hidden ring-2 ring-purple-500/50"
            >
              {(profile as any)?.avatar_url ? (
                <img src={(profile as any).avatar_url} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
              )}
            </button>

            {/* Profile button - Desktop */}
            <button
              onClick={() => onTabChange?.('profile')}
              className="group hidden lg:flex items-center gap-3 bg-gray-800/80 backdrop-blur-md pl-1.5 pr-4 py-1.5 rounded-xl border border-gray-600/50 hover:border-purple-500/50 hover:bg-gray-700/80 transition-all cursor-pointer"
              title="Xem hồ sơ"
            >
              <div className="relative">
                <div className="w-10 h-10 rounded-xl overflow-hidden ring-2 ring-purple-500/50 group-hover:ring-purple-400 transition-all">
                  {(profile as any)?.avatar_url ? (
                    <img src={(profile as any).avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                      <User className="w-5 h-5 text-white" />
                    </div>
                  )}
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-800" />
              </div>
              <div className="flex flex-col items-start leading-tight gap-0.5">
                <span className="font-bold text-white text-sm">{profile?.username}</span>
                <div className="flex items-center gap-1.5">
                  <div className="flex items-center gap-0.5 bg-gradient-to-r from-emerald-500 to-green-400 text-white px-1.5 py-0.5 rounded text-[10px] font-bold">
                    <Zap className="w-3 h-3" />
                    <span>Lv {profile?.level || 1}</span>
                  </div>
                  {/* XP Progress mini bar */}
                  <div className="w-12 h-1.5 bg-gray-700 rounded-full overflow-hidden" title={`${profile?.xp || 0} XP`}>
                    <div 
                      className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all"
                      style={{ width: `${Math.min(((profile?.xp || 0) % 100), 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            </button>

            <button
              onClick={signOut}
              className="p-2 md:p-2.5 bg-red-500/20 backdrop-blur-md hover:bg-red-500/30 rounded-lg md:rounded-xl transition-all border border-red-500/30 group"
              title="Đăng xuất"
            >
              <LogOut className="w-4 md:w-5 h-4 md:h-5 text-red-400 group-hover:text-red-300 transition-all" />
            </button>
          </div>
        </div>
      </div>
    </header>

    {/* Mobile Bottom Navigation */}
    {/* Mobile Bottom Navigation */}
    {onTabChange && (
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-gray-900/95 backdrop-blur-lg border-t border-gray-700 z-50">
        <div className="flex items-center justify-around px-1 py-2">
          {menuItems.slice(0, 4).map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            const showBadge = item.id === 'messages' && unreadCount > 0;
            
            return (
              <button
                key={item.id}
                onClick={() => { onTabChange(item.id); setShowMoreMenu(false); }}
                className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg transition-all ${
                  isActive ? 'text-emerald-400' : 'text-gray-400'
                }`}
              >
                <div className="relative">
                  <Icon className={`w-5 h-5 ${isActive ? 'scale-110' : ''}`} />
                  {showBadge && (
                    <span className="absolute -top-1 -right-1 min-w-[14px] h-[14px] bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </div>
                <span className="text-[10px] font-medium">{item.label}</span>
              </button>
            );
          })}
          
          {/* More button */}
          <button
            onClick={() => setShowMoreMenu(!showMoreMenu)}
            className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg transition-all ${
              showMoreMenu ? 'text-emerald-400' : 'text-gray-400'
            }`}
          >
            <MoreHorizontal className="w-5 h-5" />
            <span className="text-[10px] font-medium">Thêm</span>
          </button>
        </div>

        {/* More Menu Popup */}
        {showMoreMenu && (
          <div className="absolute bottom-full left-0 right-0 bg-gray-900/98 backdrop-blur-lg border-t border-gray-700 p-4 animate-slideUp">
            <div className="grid grid-cols-4 gap-3">
              {menuItems.slice(4).map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                const showBadge = item.id === 'messages' && unreadCount > 0;
                
                return (
                  <button
                    key={item.id}
                    onClick={() => { onTabChange(item.id); setShowMoreMenu(false); }}
                    className={`flex flex-col items-center gap-1 p-3 rounded-xl transition-all ${
                      isActive ? 'bg-emerald-400/20 text-emerald-400' : 'text-gray-400 hover:bg-gray-800'
                    }`}
                  >
                    <div className="relative">
                      <Icon className="w-6 h-6" />
                      {showBadge && (
                        <span className="absolute -top-1 -right-1 min-w-[14px] h-[14px] bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                          {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                      )}
                    </div>
                    <span className="text-xs font-medium">{item.label}</span>
                  </button>
                );
              })}
              {/* Profile in More menu */}
              <button
                onClick={() => { onTabChange('profile'); setShowMoreMenu(false); }}
                className={`flex flex-col items-center gap-1 p-3 rounded-xl transition-all ${
                  activeTab === 'profile' ? 'bg-emerald-400/20 text-emerald-400' : 'text-gray-400 hover:bg-gray-800'
                }`}
              >
                <User className="w-6 h-6" />
                <span className="text-xs font-medium">Hồ sơ</span>
              </button>
            </div>
          </div>
        )}
      </nav>
    )}

    {/* Overlay for More Menu */}
    {showMoreMenu && (
      <div 
        className="lg:hidden fixed inset-0 bg-black/50 z-40"
        onClick={() => setShowMoreMenu(false)}
      />
    )}

      {/* Coin Purchase Modal */}
      {showCoinModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#0a0f1a] rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto border border-gray-700">
            {/* Modal Header */}
            <div className="sticky top-0 bg-[#0a0f1a] border-b border-gray-700 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center">
                  <Coins className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Nạp Xu</h2>
                  <p className="text-sm text-gray-400">Số dư: <span className="text-emerald-400 font-bold">{profile?.total_coins || 0} xu</span></p>
                </div>
              </div>
              <button
                onClick={() => setShowCoinModal(false)}
                className="p-2 hover:bg-gray-700 rounded-lg text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Packages Grid */}
            <div className="p-6">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                {packages.map((pkg) => (
                  <div
                    key={pkg.id}
                    className={`relative rounded-xl transition-all duration-300 cursor-pointer hover:scale-105 ${
                      pkg.is_popular 
                        ? 'bg-gradient-to-b from-[#0d1829] to-[#0a1420] border-2 border-cyan-500 shadow-lg shadow-cyan-500/20' 
                        : 'bg-[#0d1829] border border-gray-700 hover:border-gray-600'
                    }`}
                    onClick={() => handleSelectPackage(pkg)}
                  >
                    {pkg.is_popular && (
                      <div className="absolute -top-2 left-1/2 -translate-x-1/2 z-10">
                        <span className="bg-cyan-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                          Hot
                        </span>
                      </div>
                    )}

                    <div className="p-4 text-center">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center mx-auto mb-3 ${
                        pkg.is_popular ? 'bg-cyan-500/20' : 'bg-gray-800'
                      }`}>
                        <Coins className={`w-5 h-5 ${pkg.is_popular ? 'text-cyan-400' : 'text-gray-400'}`} />
                      </div>

                      <div className={`text-2xl font-bold mb-1 ${pkg.is_popular ? 'text-cyan-400' : 'text-white'}`}>
                        {pkg.coins.toLocaleString()}
                      </div>
                      <p className="text-gray-500 text-xs mb-2">Xu</p>

                      <p className="text-white font-semibold text-sm mb-2">
                        {formatPrice(pkg.price_vnd)}
                      </p>

                      {pkg.bonus_coins > 0 && (
                        <div className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${
                          pkg.is_popular 
                            ? 'bg-cyan-500/20 text-cyan-400' 
                            : 'bg-green-500/20 text-green-400'
                        }`}>
                          <Gift className="w-3 h-3" />
                          +{pkg.bonus_coins}
                        </div>
                      )}

                      <button className={`w-full mt-3 py-2 rounded-lg font-medium text-xs flex items-center justify-center gap-1 ${
                        pkg.is_popular
                          ? 'bg-cyan-500 text-white hover:bg-cyan-600'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}>
                        <QrCode className="w-3 h-3" />
                        Nạp ngay
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {packages.length === 0 && (
                <div className="text-center py-12">
                  <Coins className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-400">Đang tải gói xu...</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* QR Modal */}
      {showQR && selectedPackage && (
        <QRTopup 
          packages={packages} 
          selectedPackage={selectedPackage}
          onClose={() => {
            setShowQR(false);
            setSelectedPackage(null);
            setShowCoinModal(false);
          }}
        />
      )}

      {/* Search Modal */}
      <SearchModal
        isOpen={showSearch}
        onClose={() => setShowSearch(false)}
        onNavigate={(tab) => {
          onTabChange?.(tab as Tab);
          setShowSearch(false);
        }}
      />
    </>
  );
};
