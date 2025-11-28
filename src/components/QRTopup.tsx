import { useState, useEffect } from 'react';
import { Copy, Check, X, RefreshCw } from 'lucide-react';
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

type Props = {
  packages: CoinPackage[];
  selectedPackage: CoinPackage;
  onClose: () => void;
};

export const QRTopup = ({ selectedPackage, onClose }: Props) => {
  const { user, refreshProfile } = useAuth();
  const [paymentSession, setPaymentSession] = useState<PaymentSession | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(600);
  const [checking, setChecking] = useState(false);
  const [loading, setLoading] = useState(true);

  // Generate QR on mount
  useEffect(() => {
    if (selectedPackage && user) {
      generateQRCode();
    }
  }, [selectedPackage, user]);

  // Countdown timer
  useEffect(() => {
    if (!paymentSession) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          onClose();
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
    }, 5000);

    return () => clearInterval(checkInterval);
  }, [paymentSession]);

  const generateQRCode = async () => {
    if (!user || !selectedPackage) {
      console.log('Missing user or package:', { user, selectedPackage });
      return;
    }

    setLoading(true);
    const transactionCode = `NAPXU${Date.now().toString().slice(-8)}`;
    const transferContent = `${transactionCode} ${user.id.slice(0, 8)}`;
    
    const qrUrl = `https://img.vietqr.io/image/MB-0877724374-compact2.png?amount=${selectedPackage.price_vnd}&addInfo=${encodeURIComponent(transferContent)}&accountName=MAI%20TRAN%20THIEN%20TAM`;

    try {
      const { data: session, error } = await supabase
        .from('payment_sessions')
        .insert({
          user_id: user.id,
          package_id: selectedPackage.id,
          amount_vnd: selectedPackage.price_vnd,
          coins_amount: selectedPackage.coins + selectedPackage.bonus_coins,
          transfer_content: transferContent,
          transaction_code: transactionCode,
          qr_code_url: qrUrl,
          status: 'pending',
          expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
        })
        .select()
        .single();

      if (error) {
        console.error('Supabase error:', error);
        // Nếu lỗi database, vẫn hiển thị QR để user có thể chuyển khoản
        setPaymentSession({
          id: 'temp-' + Date.now(),
          qr_code_url: qrUrl,
          transfer_content: transferContent,
          amount: selectedPackage.price_vnd,
          coins: selectedPackage.coins + selectedPackage.bonus_coins,
        });
        setLoading(false);
        return;
      }

      setPaymentSession({
        id: session.id,
        qr_code_url: qrUrl,
        transfer_content: transferContent,
        amount: selectedPackage.price_vnd,
        coins: selectedPackage.coins + selectedPackage.bonus_coins,
      });
    } catch (err) {
      console.error('Error:', err);
      // Fallback - vẫn hiển thị QR
      setPaymentSession({
        id: 'temp-' + Date.now(),
        qr_code_url: qrUrl,
        transfer_content: transferContent,
        amount: selectedPackage.price_vnd,
        coins: selectedPackage.coins + selectedPackage.bonus_coins,
      });
    }
    setLoading(false);
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
        onClose();
      }
    } catch (error) {
      console.error('Error checking payment:', error);
    } finally {
      setChecking(false);
    }
  };

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopied(field);
    setTimeout(() => setCopied(null), 2000);
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
    <div className="fixed inset-0 bg-[#0a0f1a] z-50 overflow-y-auto">
      <div className="min-h-screen flex flex-col">
        {/* Header */}
        <div className="sticky top-0 bg-[#0a1420]/95 backdrop-blur-sm border-b border-gray-800 px-6 py-4 flex justify-between items-center z-10">
          <div>
            <h2 className="text-2xl font-bold text-white">Quét Mã QR Thanh Toán</h2>
            <p className="text-sm text-gray-400">
              Hết hạn sau: <span className="font-bold text-cyan-400">{formatTime(countdown)}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-3 hover:bg-gray-800 rounded-xl transition-colors border border-gray-700"
          >
            <X className="w-6 h-6 text-gray-400" />
          </button>
        </div>

        <div className="flex-1 flex items-center justify-center p-6">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <RefreshCw className="w-12 h-12 text-cyan-400 animate-spin" />
            </div>
          ) : paymentSession && (
            <div className="w-full max-w-4xl mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left - QR Code */}
                <div className="bg-[#0d1829] rounded-2xl p-8 border border-gray-800">
                  <div className="text-center">
                    <div className="bg-white p-6 rounded-2xl inline-block mb-6 shadow-xl">
                      <img 
                        src={paymentSession.qr_code_url} 
                        alt="QR Code" 
                        className="w-64 h-64 mx-auto"
                      />
                    </div>
                    <p className="text-gray-400 mb-3">Quét mã bằng app ngân hàng</p>
                    <p className="text-4xl font-bold text-cyan-400">
                      {formatPrice(paymentSession.amount)}
                    </p>
                    <p className="text-gray-500 mt-2">
                      Nhận <span className="text-white font-semibold">{paymentSession.coins.toLocaleString()} xu</span>
                    </p>
                  </div>
                </div>

                {/* Right - Bank Info & Status */}
                <div className="space-y-6">
                  {/* Bank Info */}
                  <div className="bg-[#0d1829] border border-gray-800 rounded-2xl p-6">
                    <h3 className="font-bold text-white text-lg mb-5">Thông Tin Chuyển Khoản</h3>
                    
                    <div className="space-y-4">
                      <div className="flex justify-between items-center py-2 border-b border-gray-800">
                        <span className="text-gray-400">Ngân hàng</span>
                        <span className="font-semibold text-white">MBBank</span>
                      </div>
                      
                      <div className="flex justify-between items-center py-2 border-b border-gray-800">
                        <span className="text-gray-400">Số tài khoản</span>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-white">0877724374</span>
                          <button
                            onClick={() => handleCopy('0877724374', 'account')}
                            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                          >
                            {copied === 'account' ? (
                              <Check className="w-4 h-4 text-green-400" />
                            ) : (
                              <Copy className="w-4 h-4 text-gray-500" />
                            )}
                          </button>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center py-2 border-b border-gray-800">
                        <span className="text-gray-400">Chủ tài khoản</span>
                        <span className="font-semibold text-white">MAI TRAN THIEN TAM</span>
                      </div>
                      
                      <div className="flex justify-between items-center py-2 border-b border-gray-800">
                        <span className="text-gray-400">Số tiền</span>
                        <span className="font-bold text-cyan-400 text-xl">{formatPrice(paymentSession.amount)}</span>
                      </div>
                      
                      <div className="pt-2">
                        <div className="text-gray-400 mb-3">Nội dung chuyển khoản</div>
                        <div className="flex items-center gap-2 bg-cyan-500/10 p-4 rounded-xl border border-cyan-500/30">
                          <span className="font-mono font-bold text-cyan-400 flex-1">
                            {paymentSession.transfer_content}
                          </span>
                          <button
                            onClick={() => handleCopy(paymentSession.transfer_content, 'content')}
                            className="p-2 hover:bg-cyan-500/20 rounded-lg transition-colors"
                          >
                            {copied === 'content' ? (
                              <Check className="w-5 h-5 text-green-400" />
                            ) : (
                              <Copy className="w-5 h-5 text-cyan-400" />
                            )}
                          </button>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                          ⚠️ Nội dung đã tự động điền khi quét QR
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Status */}
                  <div className="bg-cyan-500/10 rounded-2xl p-5 border border-cyan-500/30">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 bg-cyan-500/20 rounded-xl flex items-center justify-center">
                        <RefreshCw className="w-6 h-6 text-cyan-400 animate-spin" />
                      </div>
                      <div>
                        <p className="font-semibold text-white">Đang chờ thanh toán...</p>
                        <p className="text-sm text-gray-400">Xu sẽ được cộng tự động sau khi nhận tiền</p>
                      </div>
                    </div>
                    
                    <button
                      onClick={checkPaymentStatus}
                      disabled={checking}
                      className="w-full py-3 bg-cyan-500 text-white rounded-xl font-semibold hover:bg-cyan-600 transition-colors disabled:opacity-50"
                    >
                      {checking ? 'Đang kiểm tra...' : 'Kiểm tra ngay'}
                    </button>
                  </div>

                  {/* Instructions */}
                  <div className="bg-[#0d1829] rounded-2xl p-5 border border-gray-800">
                    <h4 className="font-semibold text-white mb-3">📱 Hướng dẫn</h4>
                    <div className="text-sm text-gray-400 space-y-2">
                      <p>1. Mở app ngân hàng → Quét mã QR</p>
                      <p>2. Kiểm tra thông tin và xác nhận thanh toán</p>
                      <p>3. Xu sẽ được cộng trong 5-30 giây</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
