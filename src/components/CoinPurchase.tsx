import { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';
import { supabase } from '../lib/supabase';
// @ts-ignore - QRTopup exists
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    const { data } = await supabase
      .from('coin_packages')
      .select('*')
      .order('price_vnd');
    
    if (data) setPackages(data);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="max-w-[1800px] mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in-up">
          <div className="inline-flex items-center gap-2 bg-yellow-400/20 backdrop-blur-sm px-6 py-2 rounded-full mb-6 border border-yellow-400/30">
            <Sparkles className="w-5 h-5 text-yellow-400" />
            <span className="font-bold text-yellow-400">Quét QR - Nhận Xu Tự Động Trong 5 Giây!</span>
          </div>
          
          <h1 className="text-6xl font-black mb-4">
            <span className="bg-gradient-to-r from-yellow-400 via-orange-500 to-yellow-400 bg-clip-text text-transparent">
              Nạp Xu Siêu Tốc
            </span>
          </h1>
          
          <p className="text-xl text-gray-300 mb-2">
            ⚡ Quét QR → Chuyển khoản → Nhận xu ngay lập tức
          </p>
          <p className="text-sm text-gray-400">
            Hỗ trợ tất cả ngân hàng Việt Nam • An toàn • Bảo mật
          </p>
        </div>

        {/* QR Topup */}
        <div className="animate-fade-in-scale animation-delay-300">
          <QRTopup packages={packages} />
        </div>
      </div>
    </div>
  );
};

