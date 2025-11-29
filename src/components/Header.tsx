import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Code2, Sparkles, Coins, LogOut, User, Zap, BookOpen, Gamepad2, Home, Users, MessageCircle, Trophy, X, QrCode, Gift, Calendar } from 'lucide-react';
import { QRTopup } from './QRTopup';

type Tab = 'home' | 'lessons' | 'games' | 'coins' | 'profile' | 'treasure-quest' | 'friends' | 'messages' | 'events' | 'social' | 'rewards';

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
    { id: 'rewards' as Tab, label: 'Phần thưởng', icon: Calendar },
    { id: 'events' as Tab, label: 'Sự kiện', icon: Trophy },
    { id: 'friends' as Tab, label: 'Bạn bè', icon: Users },
    { id: 'messages' as Tab, label: 'Tin nhắn', icon: MessageCircle },
  ];

  return (
    <>
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
                const showBadge = item.id === 'messages' && unreadCount > 0;
                
                return (
                  <button
                    key={item.id}
                    onClick={() => onTabChange(item.id)}
                    className={`relative flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold transition-all whitespace-nowrap ${
                      isActive
                        ? 'bg-yellow-400 text-gray-900 shadow-lg scale-105'
                        : 'text-white/90 hover:bg-gray-700/50 hover:text-white hover:scale-105'
                    }`}
                  >
                    <div className="relative">
                      <Icon className="w-5 h-5" />
                      {showBadge && (
                        <span className="absolute -top-2 -right-2 min-w-[18px] h-[18px] bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center px-1 animate-pulse">
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
          <div className="flex items-center gap-3 flex-shrink-0">
            <button
              onClick={() => setShowCoinModal(true)}
              className="group relative bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-gray-900 pl-3 pr-4 py-2 rounded-xl flex items-center gap-2 shadow-lg hover:shadow-amber-500/40 hover:scale-105 transition-all cursor-pointer overflow-hidden"
              title="Bấm để nạp xu"
            >
              {/* Shine effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              
              {/* Coin icon with glow */}
              <div className="relative w-8 h-8 bg-amber-600/30 rounded-lg flex items-center justify-center">
                <span className="text-lg">🪙</span>
              </div>
              
              {/* Amount */}
              <div className="flex flex-col items-start leading-none">
                <span className="text-[10px] font-medium text-amber-800/70 uppercase tracking-wide">Xu</span>
                <span className="font-black text-lg text-gray-900">{(profile?.total_coins || 0).toLocaleString()}</span>
              </div>
              
              {/* Plus icon */}
              <div className="w-5 h-5 bg-gray-900/20 rounded-full flex items-center justify-center ml-1">
                <span className="text-gray-900 font-bold text-sm">+</span>
              </div>
            </button>

            <button
              onClick={() => onTabChange?.('profile')}
              className="group hidden xl:flex items-center gap-3 bg-gray-800/80 backdrop-blur-md pl-1.5 pr-4 py-1.5 rounded-xl border border-gray-600/50 hover:border-purple-500/50 hover:bg-gray-700/80 hover:scale-105 transition-all cursor-pointer"
              title="Xem hồ sơ"
            >
              {/* Avatar with ring */}
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
                {/* Online indicator */}
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-800" />
              </div>
              
              {/* User info */}
              <div className="flex flex-col items-start leading-tight">
                <span className="font-bold text-white text-sm">{profile?.username}</span>
                <div className="flex items-center gap-1">
                  <div className="flex items-center gap-0.5 bg-gradient-to-r from-emerald-500 to-green-400 text-white px-1.5 py-0.5 rounded text-[10px] font-bold">
                    <Zap className="w-3 h-3" />
                    <span>Lv {profile?.level || 1}</span>
                  </div>
                </div>
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

      {/* Coin Purchase Modal */}
      {showCoinModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#0a0f1a] rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto border border-gray-700">
            {/* Modal Header */}
            <div className="sticky top-0 bg-[#0a0f1a] border-b border-gray-700 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-yellow-500/20 rounded-xl flex items-center justify-center">
                  <Coins className="w-5 h-5 text-yellow-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Nạp Xu</h2>
                  <p className="text-sm text-gray-400">Số dư: <span className="text-yellow-400 font-bold">{profile?.total_coins || 0} xu</span></p>
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
    </>
  );
};
