import { useState } from 'react';
import { Copy, Check, AlertCircle, Clock, CheckCircle, XCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

type CoinPackage = {
  id: string;
  name: string;
  coins: number;
  price_vnd: number;
  bonus_coins: number;
};

type TopupRequest = {
  id: string;
  amount_vnd: number;
  coins_amount: number;
  status: 'pending' | 'approved' | 'rejected';
  admin_note: string | null;
  created_at: string;
};

export const ManualTopup = ({ packages: _packages }: { packages: CoinPackage[] }) => {
  const { user } = useAuth();
  const [selectedPackage, setSelectedPackage] = useState<CoinPackage | null>(null);
  const [transferNote, setTransferNote] = useState('');
  const [copied, setCopied] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [requests, setRequests] = useState<TopupRequest[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN').format(price) + 'đ';
  };

  const handleSubmitRequest = async () => {
    if (!user || !selectedPackage) return;

    setSubmitting(true);
    try {
      const { error } = await supabase.from('topup_requests').insert({
        user_id: user.id,
        package_id: selectedPackage.id,
        amount_vnd: selectedPackage.price_vnd,
        coins_amount: selectedPackage.coins + selectedPackage.bonus_coins,
        transfer_note: transferNote,
        status: 'pending',
      });

      if (error) throw error;

      alert('Đã gửi yêu cầu nạp xu! Admin sẽ xử lý trong vòng 1-24 giờ.');
      setSelectedPackage(null);
      setTransferNote('');
      loadRequests();
    } catch (error) {
      console.error('Error submitting request:', error);
      alert('❌ Có lỗi xảy ra. Vui lòng thử lại!');
    } finally {
      setSubmitting(false);
    }
  };

  const loadRequests = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('topup_requests')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      console.error('Error loading requests:', error);
    } else if (data) {
      setRequests(data);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-emerald-600" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return null;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'approved':
        return 'Đã duyệt';
      case 'pending':
        return 'Đang chờ';
      case 'rejected':
        return 'Từ chối';
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-emerald-100 text-emerald-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-white';
    }
  };

  return (
    <div className="space-y-6">
      {/* Instructions */}
      <div className="bg-blue-50 rounded-2xl p-6 border-2 border-blue-200">
        <div className="flex gap-3">
          <AlertCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-bold text-white mb-2">📱 Hướng Dẫn Nạp Xu Thủ Công</h3>
            <ol className="text-sm text-gray-300 space-y-2">
              <li className="flex gap-2">
                <span className="font-bold">1.</span>
                <span>Chọn gói xu bên dưới</span>
              </li>
              <li className="flex gap-2">
                <span className="font-bold">2.</span>
                <span>Chuyển khoản đến tài khoản MBBank: <span className="font-bold">0877724374</span></span>
              </li>
              <li className="flex gap-2">
                <span className="font-bold">3.</span>
                <span>Nội dung CK: <span className="font-mono font-bold">NAP XU [Tên của bạn]</span></span>
              </li>
              <li className="flex gap-2">
                <span className="font-bold">4.</span>
                <span>Gửi yêu cầu và đợi admin duyệt (1-24 giờ)</span>
              </li>
            </ol>
          </div>
        </div>
      </div>

      {/* Bank Info */}
      {selectedPackage && (
        <div className="bg-white rounded-2xl p-6 border-2 border-gray-200">
          <h3 className="font-bold text-white mb-4">💳 Thông Tin Chuyển Khoản</h3>
          
          <div className="space-y-3 mb-6">
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Ngân hàng:</span>
              <span className="font-bold text-white">MBBank</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Số TK:</span>
              <div className="flex items-center gap-2">
                <span className="font-bold text-white">0877724374</span>
                <button
                  onClick={() => handleCopy('0877724374')}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4 text-gray-300" />}
                </button>
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Chủ TK:</span>
              <span className="font-bold text-white">MAI TRAN THIEN TAM</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Số tiền:</span>
              <span className="font-bold text-blue-600 text-xl">{formatPrice(selectedPackage.price_vnd)}</span>
            </div>
            
            <div className="border-t pt-3">
              <div className="text-gray-300 mb-2">Nội dung CK (gợi ý):</div>
              <div className="flex items-center gap-2 bg-emerald-100 p-3 rounded-lg border-2 border-emerald-300">
                <span className="font-mono font-bold text-white flex-1">
                  NAP XU {user?.email?.split('@')[0] || 'USER'}
                </span>
                <button
                  onClick={() => handleCopy(`NAP XU ${user?.email?.split('@')[0] || 'USER'}`)}
                  className="p-2 hover:bg-emerald-200 rounded-lg transition-colors"
                >
                  {copied ? <Check className="w-5 h-5 text-green-600" /> : <Copy className="w-5 h-5 text-gray-300" />}
                </button>
              </div>
            </div>
          </div>

          {/* Note Input */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Ghi chú (tùy chọn)
            </label>
            <textarea
              value={transferNote}
              onChange={(e) => setTransferNote(e.target.value)}
              placeholder="Ví dụ: Đã chuyển khoản lúc 10:30 ngày 26/11/2024"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
              rows={3}
            />
          </div>

          {/* Submit Button */}
          <button
            onClick={handleSubmitRequest}
            disabled={submitting}
            className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Đang gửi...' : 'Xác Nhận Đã Chuyển Khoản'}
          </button>

          <button
            onClick={() => setSelectedPackage(null)}
            className="w-full mt-3 py-3 bg-gray-100 text-gray-300 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
          >
            Hủy
          </button>
        </div>
      )}

      {/* History Button */}
      <button
        onClick={() => {
          setShowHistory(!showHistory);
          if (!showHistory) loadRequests();
        }}
        className="w-full py-3 bg-gray-100 text-gray-300 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
      >
        {showHistory ? 'Ẩn Lịch Sử' : '📜 Xem Lịch Sử Yêu Cầu'}
      </button>

      {/* History */}
      {showHistory && (
        <div className="bg-white rounded-2xl p-6 border-2 border-gray-200">
          <h3 className="font-bold text-white mb-4">Lịch Sử Yêu Cầu Nạp Xu</h3>
          
          {requests.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Chưa có yêu cầu nào
            </div>
          ) : (
            <div className="space-y-3">
              {requests.map((req) => (
                <div key={req.id} className="border-2 border-gray-200 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(req.status)}
                      <span className="font-bold text-white">
                        {formatPrice(req.amount_vnd)}
                      </span>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(req.status)}`}>
                      {getStatusText(req.status)}
                    </div>
                  </div>
                  
                  <div className="text-sm text-gray-300">
                    Nhận: {req.coins_amount} xu
                  </div>
                  
                  {req.admin_note && (
                    <div className="mt-2 text-sm bg-gray-50 p-2 rounded">
                      <span className="font-semibold">Admin:</span> {req.admin_note}
                    </div>
                  )}
                  
                  <div className="text-xs text-gray-500 mt-2">
                    {new Date(req.created_at).toLocaleString('vi-VN')}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

