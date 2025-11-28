import { useState, useEffect } from 'react';
import { Coins, QrCode, Gift, Sparkles } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { QRTopup } from './QRTopup';

type CoinPackage = {
  id: string;
  name: string;
  coins: number;
  price_vnd: number;
  bonus_coins: number;
  is_popular: boolean;
};

export const CoinPurchase = () => {
  const [packages, setPackages] = useState<CoinPackage[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<CoinPackage | null>(null);
  const [showQR, setShowQR] = useState(false);

  useEffect(() => {
    fetchPackages();
  }, []);

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

  return (
    <div className="w-full min-h-screen bg-[#0a0f1a]">
      <div className="max-w-7xl mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-gray-800/50 backdrop-blur-sm px-5 py-2 rounded-full mb-6 border border-gray-700">
            <QrCode className="w-4 h-4 text-cyan-400" />
            <span className="text-sm text-gray-300">Nhanh Chóng & Dễ Dàng</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Chọn Gói Xu Của Bạn
          </h1>
          
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Chọn gói phù hợp với nhu cầu của bạn. Tất cả giao dịch đều an toàn, 
            tức thì và hỗ trợ tất cả ngân hàng.
          </p>
        </div>

        {/* Packages Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {packages.map((pkg) => (
            <div
              key={pkg.id}
              className={`relative rounded-2xl transition-all duration-300 ${
                pkg.is_popular 
                  ? 'bg-gradient-to-b from-[#0d1829] to-[#0a1420] border-2 border-cyan-500 shadow-lg shadow-cyan-500/20' 
                  : 'bg-[#0d1829] border border-gray-800 hover:border-gray-700'
              }`}
            >
              {/* Popular Badge */}
              {pkg.is_popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                  <span className="bg-cyan-500 text-white text-xs font-bold px-4 py-1 rounded-full uppercase tracking-wider">
                    Phổ Biến
                  </span>
                </div>
              )}

              <div className="p-6 pt-8">
                {/* Icon */}
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 ${
                  pkg.is_popular 
                    ? 'bg-cyan-500/20 border border-cyan-500/50' 
                    : 'bg-gray-800 border border-gray-700'
                }`}>
                  <Coins className={`w-6 h-6 ${pkg.is_popular ? 'text-cyan-400' : 'text-gray-400'}`} />
                </div>

                {/* Package Name */}
                <h3 className="text-gray-400 text-sm font-medium mb-4">{pkg.name}</h3>

                {/* Coins Amount */}
                <div className="mb-2">
                  <span className={`text-5xl font-bold ${pkg.is_popular ? 'text-cyan-400' : 'text-white'}`}>
                    {pkg.coins.toLocaleString()}
                  </span>
                </div>
                <p className="text-gray-500 text-sm mb-4">Xu</p>

                {/* Price */}
                <p className="text-white text-lg font-semibold mb-6">
                  {formatPrice(pkg.price_vnd)}
                </p>

                {/* Bonus Badge */}
                {pkg.bonus_coins > 0 && (
                  <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium mb-4 ${
                    pkg.is_popular 
                      ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' 
                      : 'bg-green-500/20 text-green-400 border border-green-500/30'
                  }`}>
                    <Gift className="w-4 h-4" />
                    +{pkg.bonus_coins} Xu Thưởng
                  </div>
                )}

                {/* Divider */}
                <div className="border-t border-gray-800 my-4"></div>

                {/* Total */}
                <p className="text-gray-500 text-sm mb-6">
                  Tổng: <span className="text-white font-medium">{(pkg.coins + pkg.bonus_coins).toLocaleString()} xu</span>
                </p>

                {/* Button */}
                <button
                  onClick={() => handleSelectPackage(pkg)}
                  className={`w-full py-3 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 ${
                    pkg.is_popular
                      ? 'bg-cyan-500 text-white hover:bg-cyan-600 shadow-lg shadow-cyan-500/30'
                      : 'bg-transparent border border-gray-700 text-gray-300 hover:bg-gray-800 hover:border-gray-600'
                  }`}
                >
                  <QrCode className="w-4 h-4" />
                  Tạo Mã QR
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Features */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#0d1829] border border-gray-800 rounded-xl p-6 text-center">
            <div className="w-12 h-12 bg-yellow-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-6 h-6 text-yellow-400" />
            </div>
            <h3 className="text-white font-semibold mb-2">Tự Động Cộng Xu</h3>
            <p className="text-gray-500 text-sm">Xu được cộng ngay sau khi thanh toán thành công</p>
          </div>
          
          <div className="bg-[#0d1829] border border-gray-800 rounded-xl p-6 text-center">
            <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="text-white font-semibold mb-2">An Toàn & Bảo Mật</h3>
            <p className="text-gray-500 text-sm">Giao dịch được mã hóa và bảo vệ tuyệt đối</p>
          </div>
          
          <div className="bg-[#0d1829] border border-gray-800 rounded-xl p-6 text-center">
            <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
            <h3 className="text-white font-semibold mb-2">Hỗ Trợ Mọi Ngân Hàng</h3>
            <p className="text-gray-500 text-sm">Chấp nhận tất cả ngân hàng tại Việt Nam</p>
          </div>
        </div>
      </div>

      {/* QR Modal */}
      {showQR && selectedPackage && (
        <QRTopup 
          packages={packages} 
          selectedPackage={selectedPackage}
          onClose={() => {
            setShowQR(false);
            setSelectedPackage(null);
          }}
        />
      )}
    </div>
  );
};
