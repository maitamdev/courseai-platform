import { useState, useEffect } from 'react';
import { Coins, Sparkles, Zap, Crown, Star, Check } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

type CoinPackage = {
  id: string;
  name: string;
  coins_amount: number;
  price: number;
  bonus_coins: number;
  is_popular: boolean;
};

export const CoinPurchase = () => {
  const { user, refreshProfile } = useAuth();
  const [packages, setPackages] = useState<CoinPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState<string | null>(null);

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    try {
      const { data, error } = await supabase
        .from('coin_packages')
        .select('*')
        .order('price');

      if (error) throw error;
      if (data) setPackages(data);
    } catch (error) {
      console.error('Error fetching packages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (pkg: CoinPackage) => {
    if (!user) return;

    setPurchasing(pkg.id);
    try {
      const totalCoins = pkg.coins_amount + pkg.bonus_coins;

      await supabase.from('coin_transactions').insert({
        user_id: user.id,
        transaction_type: 'purchase',
        amount: totalCoins,
        description: `Mua gói ${pkg.name}`,
        reference_id: `PKG_${pkg.id}_${Date.now()}`,
      });

      const { data: profile } = await supabase
        .from('profiles')
        .select('total_coins')
        .eq('id', user.id)
        .single();

      if (profile) {
        await supabase
          .from('profiles')
          .update({ total_coins: (profile.total_coins || 0) + totalCoins })
          .eq('id', user.id);
      }

      await refreshProfile();
      alert(`Mua thành công! Bạn nhận được ${totalCoins} xu!`);
    } catch (error) {
      console.error('Error purchasing:', error);
      alert('Có lỗi xảy ra. Vui lòng thử lại!');
    } finally {
      setPurchasing(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full mb-6 animate-bounce">
          <Coins className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-4xl font-black text-gray-900 mb-4">
          Nạp Xu Code Quest
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Mua xu để mở khóa khóa học cao cấp, mua vật phẩm trong shop và nhiều hơn nữa!
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {packages.map((pkg, index) => {
          const totalCoins = pkg.coins_amount + pkg.bonus_coins;
          const icons = [
            <Sparkles key="1" className="w-6 h-6" />,
            <Zap key="2" className="w-6 h-6" />,
            <Crown key="3" className="w-6 h-6" />,
            <Star key="4" className="w-6 h-6" />,
            <Coins key="5" className="w-6 h-6" />,
          ];

          return (
            <div
              key={pkg.id}
              className={`relative bg-white rounded-3xl p-8 border-4 transition-all hover:shadow-2xl hover:scale-105 ${
                pkg.is_popular
                  ? 'border-gradient-to-r from-yellow-400 to-orange-500 shadow-xl'
                  : 'border-gray-200 shadow-lg'
              }`}
            >
              {pkg.is_popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-6 py-2 rounded-full font-bold text-sm shadow-lg">
                    PHỔ BIẾN NHẤT
                  </div>
                </div>
              )}

              <div className="text-center mb-6">
                <div
                  className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${
                    pkg.is_popular
                      ? 'bg-gradient-to-br from-yellow-400 to-orange-500'
                      : 'bg-gradient-to-br from-blue-500 to-purple-600'
                  } text-white`}
                >
                  {icons[index % icons.length]}
                </div>
                <h3 className="text-2xl font-black text-gray-900 mb-2">
                  {pkg.name}
                </h3>
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Coins className="w-6 h-6 text-yellow-600" />
                  <span className="text-3xl font-black text-gray-900">
                    {pkg.coins_amount.toLocaleString()}
                  </span>
                </div>
                {pkg.bonus_coins > 0 && (
                  <div className="inline-block bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-bold">
                    +{pkg.bonus_coins} xu bonus!
                  </div>
                )}
              </div>

              <div className="mb-6">
                <div className="text-center mb-4">
                  <div className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                    ${pkg.price.toFixed(2)}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-gray-700">
                    <Check className="w-5 h-5 text-green-600" />
                    <span className="text-sm">
                      Tổng {totalCoins.toLocaleString()} xu
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <Check className="w-5 h-5 text-green-600" />
                    <span className="text-sm">Không hết hạn</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <Check className="w-5 h-5 text-green-600" />
                    <span className="text-sm">Thanh toán an toàn</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => handlePurchase(pkg)}
                disabled={purchasing === pkg.id}
                className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${
                  pkg.is_popular
                    ? 'bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white shadow-lg hover:shadow-xl'
                    : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl'
                } disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105`}
              >
                {purchasing === pkg.id ? 'Đang xử lý...' : 'Mua ngay'}
              </button>
            </div>
          );
        })}
      </div>

      <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-3xl p-8 border-2 border-blue-200">
        <h3 className="text-2xl font-bold text-gray-900 mb-4 text-center">
          Các câu hỏi thường gặp
        </h3>
        <div className="space-y-4 max-w-3xl mx-auto">
          <div className="bg-white rounded-xl p-6 shadow-md">
            <h4 className="font-bold text-gray-900 mb-2">
              Xu có hết hạn không?
            </h4>
            <p className="text-gray-600">
              Không, xu của bạn không bao giờ hết hạn. Bạn có thể sử dụng khi nào cần.
            </p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-md">
            <h4 className="font-bold text-gray-900 mb-2">
              Tôi có thể dùng xu để làm gì?
            </h4>
            <p className="text-gray-600">
              Xu dùng để mua khóa học cao cấp, mở khóa tính năng đặc biệt, và mua vật phẩm trong shop.
            </p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-md">
            <h4 className="font-bold text-gray-900 mb-2">
              Thanh toán có an toàn không?
            </h4>
            <p className="text-gray-600">
              Có, chúng tôi sử dụng các cổng thanh toán uy tín và mã hóa SSL để bảo mật thông tin của bạn.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
