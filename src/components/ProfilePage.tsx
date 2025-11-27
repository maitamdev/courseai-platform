import { useEffect, useState } from 'react';
import { User, BookOpen, Coins, Calendar, LogOut, Settings, Award, ShoppingBag } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

type PurchasedCourse = {
  id: string;
  course_id: string;
  purchased_at: string;
  courses: {
    title: string;
    instructor_name: string;
    price_coins: number;
  };
};

type CoinTransaction = {
  id: string;
  transaction_type: string;
  amount: number;
  description: string;
  created_at: string;
};

type ProfilePageProps = {
  onCourseSelect?: (courseId: string) => void;
};

export const ProfilePage = ({ onCourseSelect }: ProfilePageProps) => {
  const { user, profile } = useAuth();
  const [activeTab, setActiveTab] = useState<'info' | 'courses' | 'transactions'>('info');
  const [purchasedCourses, setPurchasedCourses] = useState<PurchasedCourse[]>([]);
  const [transactions, setTransactions] = useState<CoinTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    full_name: '',
    username: '',
    phone: '',
    birthday: '',
    gender: 'Nam'
  });

  useEffect(() => {
    if (user) {
      fetchUserData();
      setFormData({
        full_name: (profile as any)?.full_name || '',
        username: profile?.username || '',
        phone: '',
        birthday: '',
        gender: 'Nam'
      });
    }
  }, [user, profile]);

  const fetchUserData = async () => {
    if (!user) return;

    try {
      const [coursesRes, transactionsRes] = await Promise.all([
        supabase
          .from('purchased_courses')
          .select('id, course_id, purchased_at, courses(title, instructor_name, price_coins)')
          .eq('user_id', user.id)
          .order('purchased_at', { ascending: false }),
        supabase
          .from('coin_transactions')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(20)
      ]);

      if (coursesRes.data) setPurchasedCourses(coursesRes.data as any);
      if (transactionsRes.data) setTransactions(transactionsRes.data);
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name,
          username: formData.username
        })
        .eq('id', user.id);
      
      if (error) throw error;
      alert('Cập nhật thông tin thành công!');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Có lỗi xảy ra!');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTransactionColor = (type: string) => {
    if (type === 'purchase') return 'text-green-600 bg-green-50';
    if (type === 'spend') return 'text-red-600 bg-red-50';
    return 'text-blue-600 bg-blue-50';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="grid md:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="md:col-span-1">
          <div className="bg-gray-800/80 backdrop-blur-lg rounded-xl shadow-md border border-gray-700 overflow-hidden sticky top-6">
            {/* Avatar Section */}
            <div className="bg-gradient-to-r from-gray-700 to-gray-800 p-6 text-center border-b border-gray-700">
              <div className="w-20 h-20 mx-auto bg-white rounded-full flex items-center justify-center mb-3 shadow-lg">
                <User className="w-10 h-10 text-blue-600" />
              </div>
              <h3 className="font-bold text-white text-lg mb-1">
                {(profile as any)?.full_name || user?.email?.split('@')[0]}
              </h3>
              <p className="text-sm text-white/80">{user?.email}</p>
            </div>

            {/* Menu */}
            <div className="p-4">
              <button
                onClick={() => setActiveTab('info')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-colors ${
                  activeTab === 'info'
                    ? 'bg-yellow-400 text-gray-900 font-semibold'
                    : 'text-gray-300 hover:bg-gray-700'
                }`}
              >
                <User className="w-5 h-5" />
                <span>Thông tin cá nhân</span>
              </button>

              <button
                onClick={() => setActiveTab('courses')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-colors ${
                  activeTab === 'courses'
                    ? 'bg-yellow-400 text-gray-900 font-semibold'
                    : 'text-gray-300 hover:bg-gray-700'
                }`}
              >
                <BookOpen className="w-5 h-5" />
                <span>Khóa học của tôi</span>
              </button>

              <button
                onClick={() => setActiveTab('transactions')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-colors ${
                  activeTab === 'transactions'
                    ? 'bg-yellow-400 text-gray-900 font-semibold'
                    : 'text-gray-300 hover:bg-gray-700'
                }`}
              >
                <ShoppingBag className="w-5 h-5" />
                <span>Lịch sử giao dịch</span>
              </button>

              <div className="border-t border-gray-200 my-4"></div>

              <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
                <Award className="w-5 h-5" />
                <span>Phiếu giảm giá</span>
              </button>

              <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
                <Settings className="w-5 h-5" />
                <span>Cài đặt</span>
              </button>

              <div className="border-t border-gray-200 my-4"></div>

              <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors font-semibold">
                <LogOut className="w-5 h-5" />
                <span>Đăng xuất</span>
              </button>
            </div>

            {/* Stats */}
            <div className="p-4 bg-gray-900/50 border-t border-gray-700">
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">{profile?.total_coins || 0}</div>
                  <div className="text-xs text-gray-600">Xu</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{profile?.level || 1}</div>
                  <div className="text-xs text-gray-600">Level</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="md:col-span-3">
          {/* Tab: Thông tin cá nhân */}
          {activeTab === 'info' && (
            <div className="bg-gray-800/80 backdrop-blur-lg rounded-xl shadow-md border border-gray-700 p-6">
              <h2 className="text-2xl font-bold text-white mb-6">Thông tin cá nhân</h2>

              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">Họ và tên</label>
                    <input
                      type="text"
                      value={formData.full_name}
                      onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Nhập họ tên"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Tên đăng nhập</label>
                    <input
                      type="text"
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Nhập tên đăng nhập"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                    <input
                      type="email"
                      value={user?.email || ''}
                      disabled
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Số điện thoại</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Nhập số điện thoại"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Ngày sinh</label>
                    <input
                      type="date"
                      value={formData.birthday}
                      onChange={(e) => setFormData({ ...formData, birthday: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Giới tính</label>
                    <select
                      value={formData.gender}
                      onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="Nam">Nam</option>
                      <option value="Nữ">Nữ</option>
                      <option value="Khác">Khác</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Mã khách hàng</label>
                  <input
                    type="text"
                    value={user?.id.slice(0, 13).toUpperCase() || ''}
                    disabled
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500 font-mono"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleSaveProfile}
                    className="px-6 py-2 bg-yellow-400 text-gray-900 rounded-lg font-semibold hover:bg-yellow-500 transition-colors"
                  >
                    Lưu thay đổi
                  </button>
                  <button className="px-6 py-2 border border-gray-600 text-gray-300 rounded-lg font-semibold hover:bg-gray-700 transition-colors">
                    Đổi mật khẩu
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Tab: Khóa học */}
          {activeTab === 'courses' && (
            <div className="bg-gray-800/80 backdrop-blur-lg rounded-xl shadow-md border border-gray-700 p-6">
              <h2 className="text-2xl font-bold text-white mb-6">Khóa học của tôi</h2>

              {purchasedCourses.length === 0 ? (
                <div className="text-center py-16">
                  <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-white mb-2">Chưa có khóa học nào</h3>
                  <p className="text-gray-400 mb-6">Hãy khám phá và mua khóa học để bắt đầu học!</p>
                  <button className="px-6 py-2 bg-yellow-400 text-gray-900 rounded-lg font-semibold hover:bg-yellow-500">
                    Xem khóa học
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {purchasedCourses.map((pc) => (
                    <button
                      key={pc.id}
                      onClick={() => onCourseSelect?.(pc.course_id)}
                      className="w-full border-2 border-gray-200 rounded-xl p-5 hover:border-blue-400 hover:shadow-lg transition-all text-left group"
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                          <BookOpen className="w-8 h-8 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-white mb-2 group-hover:text-yellow-400 transition-colors">
                            {pc.courses.title}
                          </h3>
                          <div className="flex items-center gap-4 text-sm text-gray-300 mb-2">
                            <span>👨‍🏫 {pc.courses.instructor_name}</span>
                            <span className="flex items-center gap-1">
                              <Coins className="w-4 h-4 text-yellow-500" />
                              {pc.courses.price_coins} xu
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-400">
                            <Calendar className="w-3 h-3" />
                            <span>Đã mua: {formatDate(pc.purchased_at)}</span>
                          </div>
                        </div>
                        <div className="flex-shrink-0 self-center">
                          <div className="px-4 py-2 bg-yellow-400 text-gray-900 rounded-lg text-sm font-semibold group-hover:bg-yellow-500 transition-colors">
                            Học ngay →
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab: Lịch sử giao dịch */}
          {activeTab === 'transactions' && (
            <div className="bg-gray-800/80 backdrop-blur-lg rounded-xl shadow-md border border-gray-700 p-6">
              <h2 className="text-2xl font-bold text-white mb-6">Lịch sử giao dịch</h2>

              {transactions.length === 0 ? (
                <div className="text-center py-16">
                  <Coins className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-white mb-2">Chưa có giao dịch nào</h3>
                  <p className="text-gray-400">Lịch sử giao dịch của bạn sẽ hiển thị ở đây</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {transactions.map((tx) => (
                    <div key={tx.id} className="p-4 rounded-lg bg-gray-700/50 border border-gray-600">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-white mb-1">{tx.description}</h4>
                          <div className="flex items-center gap-2 text-sm text-gray-400">
                            <Calendar className="w-4 h-4" />
                            <span>{formatDate(tx.created_at)}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`text-xl font-bold ${tx.amount > 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {tx.amount > 0 ? '+' : ''}{tx.amount}
                          </div>
                          <div className="text-sm text-gray-400">xu</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
