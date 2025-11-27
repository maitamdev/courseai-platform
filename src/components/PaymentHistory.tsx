import { useState, useEffect } from 'react';
import { Clock, CheckCircle, XCircle, Loader } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

type PaymentSession = {
  id: string;
  amount_vnd: number;
  coins_amount: number;
  status: 'pending' | 'completed' | 'expired' | 'failed';
  created_at: string;
  completed_at: string | null;
};

export const PaymentHistory = () => {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<PaymentSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchHistory();
    }
  }, [user]);

  const fetchHistory = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('payment_sessions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      console.error('Error fetching history:', error);
    } else if (data) {
      setSessions(data);
    }
    setLoading(false);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN').format(price) + 'đ';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN');
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'pending':
        return <Loader className="w-5 h-5 text-blue-600 animate-spin" />;
      case 'expired':
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Clock className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Thành công';
      case 'pending':
        return 'Đang chờ';
      case 'expired':
        return 'Hết hạn';
      case 'failed':
        return 'Thất bại';
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-blue-100 text-blue-800';
      case 'expired':
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (sessions.length === 0) {
    return (
      <div className="text-center py-12">
        <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">Chưa có lịch sử nạp xu</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl shadow-lg p-6">
      <h3 className="text-xl font-bold text-gray-900 mb-6">📜 Lịch Sử Nạp Xu</h3>
      
      <div className="space-y-4">
        {sessions.map((session) => (
          <div
            key={session.id}
            className="border-2 border-gray-200 rounded-2xl p-4 hover:border-blue-300 transition-colors"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                {getStatusIcon(session.status)}
                <div>
                  <div className="font-bold text-gray-900">
                    {formatPrice(session.amount_vnd)}
                  </div>
                  <div className="text-sm text-gray-600">
                    {session.coins_amount} xu
                  </div>
                </div>
              </div>
              
              <div className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(session.status)}`}>
                {getStatusText(session.status)}
              </div>
            </div>
            
            <div className="text-xs text-gray-500 mt-2">
              <div>Tạo lúc: {formatDate(session.created_at)}</div>
              {session.completed_at && (
                <div>Hoàn thành: {formatDate(session.completed_at)}</div>
              )}
            </div>
          </div>
        ))}
      </div>
      
      <button
        onClick={fetchHistory}
        className="w-full mt-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
      >
        Tải lại
      </button>
    </div>
  );
};
