import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, RefreshCw, Clock } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

type TopupRequest = {
  id: string;
  user_id: string;
  amount_vnd: number;
  coins_amount: number;
  transfer_note: string | null;
  status: string;
  created_at: string;
  profiles: {
    username: string | null;
    email: string;
  };
};

export const AdminTopupPanel = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState<TopupRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);

  // Check if user is admin (simple check - you can improve this)
  const isAdmin = user?.email?.includes('admin') || user?.email === 'your-email@example.com';

  useEffect(() => {
    if (isAdmin) {
      loadRequests();
    }
  }, [isAdmin]);

  const loadRequests = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('topup_requests_with_email')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false});

      if (error) throw error;
      
      // Transform data to match expected format
      if (data) {
        const transformed = data.map((req: any) => ({
          ...req,
          profiles: {
            username: req.username,
            email: req.email || 'N/A'
          }
        }));
        setRequests(transformed as any);
      }
    } catch (error) {
      console.error('Error loading requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (requestId: string) => {
    if (!confirm('Xác nhận duyệt yêu cầu này?')) return;

    setProcessing(requestId);
    try {
      const { error } = await supabase.rpc('approve_topup_request', {
        p_request_id: requestId,
        p_admin_note: 'Đã duyệt',
      });

      if (error) throw error;

      alert('✅ Đã duyệt yêu cầu thành công!');
      loadRequests();
    } catch (error: any) {
      console.error('Error approving:', error);
      alert('❌ Lỗi: ' + error.message);
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (requestId: string) => {
    const reason = prompt('Nhập lý do từ chối:');
    if (!reason) return;

    setProcessing(requestId);
    try {
      const { error } = await supabase.rpc('reject_topup_request', {
        p_request_id: requestId,
        p_admin_note: reason,
      });

      if (error) throw error;

      alert('✅ Đã từ chối yêu cầu!');
      loadRequests();
    } catch (error: any) {
      console.error('Error rejecting:', error);
      alert('❌ Lỗi: ' + error.message);
    } finally {
      setProcessing(null);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN').format(price) + 'đ';
  };

  if (!isAdmin) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 font-bold">⛔ Bạn không có quyền truy cập trang này</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white rounded-3xl shadow-xl p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold text-gray-900">👨‍💼 Admin - Duyệt Nạp Xu</h2>
          <button
            onClick={loadRequests}
            className="p-3 bg-blue-100 text-blue-600 rounded-xl hover:bg-blue-200 transition-colors"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>

        {requests.length === 0 ? (
          <div className="text-center py-12">
            <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Không có yêu cầu nào đang chờ</p>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((req) => (
              <div
                key={req.id}
                className="border-2 border-gray-200 rounded-2xl p-6 hover:border-blue-300 transition-colors"
              >
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Left: User Info */}
                  <div>
                    <div className="text-sm text-gray-600 mb-1">User</div>
                    <div className="font-bold text-gray-900 mb-2">
                      {req.profiles.username || req.profiles.email}
                    </div>
                    <div className="text-sm text-gray-600 mb-4">{req.profiles.email}</div>

                    <div className="text-sm text-gray-600 mb-1">Số tiền</div>
                    <div className="text-2xl font-bold text-blue-600 mb-4">
                      {formatPrice(req.amount_vnd)}
                    </div>

                    <div className="text-sm text-gray-600 mb-1">Xu nhận được</div>
                    <div className="text-xl font-bold text-green-600 mb-4">
                      {req.coins_amount} xu
                    </div>

                    {req.transfer_note && (
                      <>
                        <div className="text-sm text-gray-600 mb-1">Ghi chú</div>
                        <div className="text-sm bg-gray-50 p-3 rounded-lg">
                          {req.transfer_note}
                        </div>
                      </>
                    )}

                    <div className="text-xs text-gray-500 mt-4">
                      {new Date(req.created_at).toLocaleString('vi-VN')}
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex flex-col justify-center gap-3">
                    <button
                      onClick={() => handleApprove(req.id)}
                      disabled={processing === req.id}
                      className="py-4 px-6 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      <CheckCircle className="w-5 h-5" />
                      {processing === req.id ? 'Đang xử lý...' : 'Duyệt & Cộng Xu'}
                    </button>

                    <button
                      onClick={() => handleReject(req.id)}
                      disabled={processing === req.id}
                      className="py-4 px-6 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      <XCircle className="w-5 h-5" />
                      Từ Chối
                    </button>

                    <div className="text-xs text-gray-500 text-center mt-2">
                      ID: {req.id.slice(0, 8)}...
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
