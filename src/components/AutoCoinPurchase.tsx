import { useState } from 'react';
import { QrCode, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

const BANK_INFO = {
  bankId: 'MB',
  accountNo: '0877724374',
  accountName: 'MAI TAM',
  template: 'compact2'
};

// Tỷ giá: 1,000 VND = 10 xu
const COIN_PACKAGES = [
  { amount: 100, price: 10000, bonus: 0 },
  { amount: 500, price: 50000, bonus: 50 },
  { amount: 1000, price: 100000, bonus: 150 },
  { amount: 2500, price: 250000, bonus: 500 },
  { amount: 5000, price: 500000, bonus: 1000 },
];

export const AutoCoinPurchase = () => {
  const { user, profile, refreshProfile } = useAuth();
  const [selectedPackage, setSelectedPackage] = useState(COIN_PACKAGES[1]);
  const [showQR, setShowQR] = useState(false);
  const [checking, setChecking] = useState(false);
  const [transactionId, setTransactionId] = useState('');

  const generateTransactionId = () => {
    return `COIN${Date.now()}${user?.id.slice(0, 4)}`;
  };

  const handleShowQR = () => {
    const txId = generateTransactionId();
    setTransactionId(txId);
    setShowQR(true);
    startCheckingPayment(txId);
  };

  const startCheckingPayment = async (txId: string) => {
    setChecking(true);
    
    // Polling: Check payment mỗi 5 giây trong 5 phút
    const maxAttempts = 60; // 5 phút
    let attempts = 0;

    const checkInterval = setInterval(async () => {
      attempts++;
      
      try {
        // Gọi API kiểm tra giao dịch
        const response = await fetch(`/api/check-payment`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            accountNo: BANK_INFO.accountNo,
            transactionId: txId,
            amount: selectedPackage.price
          })
        });

        const data = await response.json();

        if (data.success) {
          // Thanh toán thành công
          clearInterval(checkInterval);
          await processPayment(txId);
          setChecking(false);
          setShowQR(false);
          alert(`Nạp xu thành công! Bạn nhận được ${selectedPackage.amount + selectedPackage.bonus} xu`);
        }
      } catch (error) {
        console.error('Error checking payment:', error);
      }

      if (attempts >= maxAttempts) {
        clearInterval(checkInterval);
        setChecking(false);
        alert('Hết thời gian chờ. Vui lòng thử lại.');
      }
    }, 5000);
  };

  const processPayment = async (txId: string) => {
    if (!user) return;

    const totalCoins = selectedPackage.amount + selectedPackage.bonus;

    try {
      // Cập nhật số xu
      await supabase
        .from('profiles')
        .update({ 
          total_coins: (profile?.total_coins || 0) + totalCoins 
        })
        .eq('id', user.id);

      // Tạo transaction log
      await supabase.from('coin_transactions').insert({
        user_id: user.id,
        transaction_type: 'purchase',
        amount: totalCoins,
        description: `Nạp ${selectedPackage.price.toLocaleString()}đ qua MBBank`,
        reference_id: txId
      });

      await refreshProfile();
    } catch (error) {
      console.error('Error processing payment:', error);
    }
  };

  const qrUrl = `https://img.vietqr.io/image/${BANK_INFO.bankId}-${BANK_INFO.accountNo}-${BANK_INFO.template}.png?amount=${selectedPackage.price}&addInfo=${transactionId}&accountName=${encodeURIComponent(BANK_INFO.accountName)}`;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-3xl shadow-xl p-8">
        <h2 className="text-3xl font-black text-white mb-2">Nạp xu tự động</h2>
        <p className="text-gray-300 mb-8">Quét mã QR và xu sẽ được cộng tự động sau vài giây</p>

        {!showQR ? (
          <>
            <div className="grid md:grid-cols-3 gap-4 mb-8">
              {COIN_PACKAGES.map((pkg) => (
                <button
                  key={pkg.amount}
                  onClick={() => setSelectedPackage(pkg)}
                  className={`p-6 rounded-2xl border-2 transition-all ${
                    selectedPackage.amount === pkg.amount
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                >
                  <div className="text-3xl font-black text-white mb-2">
                    {pkg.amount.toLocaleString()}
                    {pkg.bonus > 0 && (
                      <span className="text-lg text-green-600"> +{pkg.bonus}</span>
                    )}
                  </div>
                  <div className="text-sm text-gray-300 mb-1">xu</div>
                  <div className="text-xl font-bold text-blue-600">
                    {pkg.price.toLocaleString()}đ
                  </div>
                  {pkg.bonus > 0 && (
                    <div className="mt-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full inline-block">
                      Tặng {pkg.bonus} xu
                    </div>
                  )}
                </button>
              ))}
            </div>

            <button
              onClick={handleShowQR}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-xl font-bold text-lg hover:shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <QrCode className="w-6 h-6" />
              Hiển thị mã QR thanh toán
            </button>
          </>
        ) : (
          <div className="text-center">
            <div className="bg-white p-6 rounded-2xl border-2 border-gray-200 inline-block mb-6">
              <img src={qrUrl} alt="QR Code" className="w-64 h-64" />
            </div>

            <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-6 mb-6">
              <div className="flex items-center justify-center gap-2 mb-4">
                {checking ? (
                  <>
                    <Clock className="w-6 h-6 text-blue-600 animate-spin" />
                    <span className="font-bold text-blue-900">Đang chờ thanh toán...</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-6 h-6 text-orange-600" />
                    <span className="font-bold text-orange-900">Quét mã để thanh toán</span>
                  </>
                )}
              </div>

              <div className="space-y-2 text-sm text-gray-300">
                <p><strong>Số tiền:</strong> {selectedPackage.price.toLocaleString()}đ</p>
                <p><strong>Nội dung:</strong> {transactionId}</p>
                <p className="text-xs text-gray-500">
                  ⚠️ Vui lòng chuyển khoản ĐÚNG nội dung để được cộng xu tự động
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => {
                  setShowQR(false);
                  setChecking(false);
                }}
                className="flex-1 bg-gray-200 text-gray-300 py-3 rounded-xl font-bold hover:bg-gray-300 transition-all"
              >
                Hủy
              </button>
              <button
                onClick={() => handleShowQR()}
                className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-all"
              >
                Tạo mã mới
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="mt-6 bg-yellow-50 border-2 border-yellow-200 rounded-2xl p-6">
        <h3 className="font-bold text-yellow-900 mb-2 flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          Lưu ý quan trọng
        </h3>
        <ul className="text-sm text-yellow-800 space-y-1">
          <li>• Chuyển khoản ĐÚNG nội dung để được cộng xu tự động</li>
          <li>• Xu sẽ được cộng sau 5-30 giây kể từ khi chuyển khoản thành công</li>
          <li>• Nếu sau 5 phút chưa nhận được xu, vui lòng liên hệ hỗ trợ</li>
          <li>• Mỗi giao dịch chỉ được sử dụng 1 lần</li>
        </ul>
      </div>
    </div>
  );
};

