import { useState, useEffect } from 'react';
import { Coins, Copy, Check, Gift, Crown, QrCode, X, RefreshCw } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

type CoinPackage = {
  id: string;
  name: string;
  coins: number;
  price_vnd: number;
  bonus_coins: number;
  is_popular: boolean;
};

type PaymentSession = {
  id: string;
  qr_code_url: string;
  transfer_content: string;
  amount: number;
  coins: number;
};

export const QRTopup = ({ packages }: { packages: CoinPackage[] }) => {
  const { user, refreshProfile } = useAuth();
  const [selectedPackage, setSelectedPackage] = useState<CoinPackage | null>(null);
  const [paymentSession, setPaymentSession] = useState<PaymentSession | null>(null);
  const [copied, setCopied] = useState(false);
  const [countdown, setCountdown] = useState(600); // 10 phút
  const [checking, setChecking] = useState(false);

  // Countdown timer
  useEffect(() => {
    if (!paymentSession) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setPaymentSession(null);
          setSelectedPackage(null);
          return 600;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [paymentSession]);

  // Auto check payment
  useEffect(() => {
    if (!paymentSession) return;

    const checkInterval = setInterval(() => {
      checkPaymentStatus();
    }, 5000); // Check mỗi 5 giây

    return () => clearInterval(checkInterval);
  }, [paymentSession]);

  const generateQRCode = async (pkg: CoinPackage) => {
    if (!user) return;

    setSelectedPackage(pkg);
    
    // Tạo mã giao dịch unique
    const transactionCode = `NAPXU${Date.now().toString().slice(-8)}`;
    const transferContent = `${transactionCode} ${user.id.slice(0, 8)}`;
    
    // Tạo QR Code URL với VietQR API
    const qrUrl = `https://img.vietqr.io/image/MB-0877724374-compact2.png?amount=${pkg.price_vnd}&addInfo=${encodeURIComponent(transferContent)}&accountName=MAI%20TRAN%20THIEN%20TAM`;

    // Lưu payment session vào database
    const { data: session, error } = await supabase
      .from('payment_sessions')
      .insert({
        user_id: user.id,
        package_id: pkg.id,
        amount_vnd: pkg.price_vnd,
        coins_amount: pkg.coins + pkg.bonus_coins,
        transfer_content: transferContent,
        transaction_code: transactionCode,
        qr_code_url: qrUrl,
        status: 'pending',
        expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating payment session:', error);
      alert('Có lỗi xảy ra. Vui lòng thử lại!');
      return;
    }

    setPaymentSession({
      id: session.id,
      qr_code_url: qrUrl,
      transfer_content: transferContent,
      amount: pkg.price_vnd,
      coins: pkg.coins + pkg.bonus_coins,
    });
    setCountdown(600);
  };

  const checkPaymentStatus = async () => {
    if (!paymentSession || checking) return;

    setChecking(true);
    try {
      const { data, error } = await supabase
        .from('payment_sessions')
        .select('status, coins_amount')
        .eq('id', paymentSession.id)
        .single();

      if (error) throw error;

      if (data.status === 'completed') {
        await refreshProfile();
        alert(`🎉 Nạp xu thành công! Bạn đã nhận ${data.coins_amount} xu!`);
        setPaymentSession(null);
        setSelectedPackage(null);
      }
    } catch (error) {
      console.error('Error checking payment:', error);
    } finally {
      setChecking(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN').format(price) + 'đ';
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-8">
      {/* Coin Packages */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 max-w-[1600px] mx-auto">
        {packages.map((pkg) => (
          <div
            key={pkg.id}
            onClick={() => generateQRCode(pkg)}
            className={`relative p-6 rounded-2xl border-2 transition-all cursor-pointer hover:scale-105 ${
              pkg.is_popular
                ? 'border-yellow-400 bg-gradient-to-br from-yellow-500/30 to-orange-500/30 backdrop-blur-md shadow-2xl shadow-yellow-500/50'
                : 'border-gray-600 bg-gray-800/80 backdrop-blur-md hover:border-yellow-400'
            } ${selectedPackage?.id === pkg.id ? 'ring-4 ring-yellow-400' : ''}`}
          >
            {pkg.is_popular && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 px-6 py-2 rounded-full text-sm font-black shadow-xl">
                ⭐ Phổ Biến Nhất
              </div>
            )}

            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-xl">
                <Coins className="w-10 h-10 text-gray-900" />
              </div>

              <h3 className="text-base font-black text-white mb-3">{pkg.name}</h3>

              <div className="mb-4">
                <div className="text-5xl font-black text-white mb-2 drop-shadow-lg">
                  {pkg.coins.toLocaleString()}
                </div>
                <div className="text-sm text-gray-300 uppercase tracking-wider font-bold">xu</div>
              </div>

              <div className="text-2xl font-black text-yellow-400 mb-4 drop-shadow-lg">
                {formatPrice(pkg.price_vnd)}
              </div>

              {pkg.bonus_coins > 0 && (
                <div className="inline-flex items-center gap-1 bg-green-500/30 text-green-300 px-3 py-1.5 rounded-full text-sm font-black mb-4 border-2 border-green-400/50 shadow-lg">
                  <Gift className="w-4 h-4" />
                  +{pkg.bonus_coins}
                </div>
              )}

              <div className="text-sm text-gray-200 mb-4 bg-gray-900/50 py-2 px-3 rounded-lg">
                Tổng: <span className="font-black text-white">{(pkg.coins + pkg.bonus_coins).toLocaleString()} xu</span>
              </div>

              <button className="w-full py-3 rounded-xl font-black text-sm transition-all flex items-center justify-center gap-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 hover:shadow-2xl hover:shadow-yellow-500/50 hover:scale-105">
                <QrCode className="w-5 h-5" />
                Tạo QR
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* QR Code Modal */}
      {paymentSession && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-gray-800/95 backdrop-blur-xl rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-700 shadow-2xl animate-fade-in-scale">
            {/* Header */}
            <div className="sticky top-0 bg-gray-900/90 backdrop-blur-xl border-b border-gray-700 p-6 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-white">Quét Mã QR Để Thanh Toán</h2>
                <p className="text-gray-400">Mã hết hạn sau: <span className="font-bold text-yellow-400">{formatTime(countdown)}</span></p>
              </div>
              <button
                onClick={() => {
                  setPaymentSession(null);
                  setSelectedPackage(null);
                }}
                className="p-2 hover:bg-gray-700 rounded-full transition-colors"
              >
                <X className="w-6 h-6 text-gray-400" />
              </button>
            </div>

            <div className="p-8">
              {/* QR Code */}
              <div className="bg-gradient-to-br from-yellow-400/10 to-orange-500/10 rounded-3xl p-8 mb-6 text-center border-2 border-yellow-400/30">
                <div className="bg-white p-6 rounded-2xl inline-block mb-4 shadow-lg">
                  <img 
                    src={paymentSession.qr_code_url} 
                    alt="QR Code" 
                    className="w-64 h-64 mx-auto"
                  />
                </div>
                <div className="text-sm text-gray-400 mb-2">Quét mã QR bằng app ngân hàng</div>
                <div className="text-2xl font-bold text-yellow-400">
                  {formatPrice(paymentSession.amount)}
                </div>
              </div>

              {/* Bank Info */}
              <div className="bg-gray-900/50 border-2 border-gray-700 rounded-2xl p-6 mb-6">
                <h3 className="font-bold text-white mb-4">Thông Tin Chuyển Khoản</h3>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Ngân hàng:</span>
                    <span className="font-bold text-white">MBBank</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Số TK:</span>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white">0877724374</span>
                      <button
                        onClick={() => handleCopy('0877724374')}
                        className="p-1 hover:bg-gray-700 rounded"
                      >
                        {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4 text-gray-400" />}
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Chủ TK:</span>
                    <span className="font-bold text-white">MAI TRAN THIEN TAM</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Số tiền:</span>
                    <span className="font-bold text-yellow-400 text-xl">{formatPrice(paymentSession.amount)}</span>
                  </div>
                  
                  <div className="border-t border-gray-700 pt-3">
                    <div className="text-gray-400 mb-2">Nội dung CK:</div>
                    <div className="flex items-center gap-2 bg-yellow-400/20 p-3 rounded-lg border-2 border-yellow-400/30">
                      <span className="font-mono font-bold text-yellow-400 flex-1">
                        {paymentSession.transfer_content}
                      </span>
                      <button
                        onClick={() => handleCopy(paymentSession.transfer_content)}
                        className="p-2 hover:bg-yellow-400/30 rounded-lg transition-colors"
                      >
                        {copied ? <Check className="w-5 h-5 text-green-400" /> : <Copy className="w-5 h-5 text-yellow-400" />}
                      </button>
                    </div>
                    <div className="text-xs text-red-600 mt-2 font-semibold">
                      ⚠️ Nội dung đã được điền tự động khi quét QR
                    </div>
                  </div>
                </div>
              </div>

              {/* Status */}
              <div className="bg-blue-50 rounded-2xl p-6 border-2 border-blue-200">
                <div className="flex items-center gap-3 mb-3">
                  <div className="animate-spin">
                    <RefreshCw className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-bold text-white">Đang chờ thanh toán...</div>
                    <div className="text-sm text-gray-400">Hệ thống sẽ tự động cộng xu sau khi nhận được tiền</div>
                  </div>
                </div>
                
                <button
                  onClick={checkPaymentStatus}
                  disabled={checking}
                  className="w-full mt-4 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {checking ? 'Đang kiểm tra...' : 'Kiểm tra ngay'}
                </button>
              </div>

              {/* Instructions */}
              <div className="mt-6 bg-green-500/10 rounded-2xl p-6 border-2 border-green-500/30">
                <h3 className="font-bold text-white mb-3">📱 Hướng Dẫn Thanh Toán</h3>
                <ol className="space-y-2 text-sm text-gray-300">
                  <li className="flex gap-2">
                    <span className="font-bold">1.</span>
                    <span>Mở app MBBank (hoặc app ngân hàng khác)</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-bold">2.</span>
                    <span>Chọn "Quét mã QR" hoặc "Chuyển khoản"</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-bold">3.</span>
                    <span>Quét mã QR phía trên (thông tin sẽ tự động điền)</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-bold">4.</span>
                    <span>Xác nhận và hoàn tất thanh toán</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-bold">5.</span>
                    <span className="text-green-600 font-semibold">Xu sẽ được cộng tự động trong 5-30 giây!</span>
                  </li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
