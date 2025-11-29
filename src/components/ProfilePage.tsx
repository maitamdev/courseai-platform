import { useEffect, useState } from 'react';
import { User, BookOpen, Coins, Calendar, LogOut, Award, ShoppingBag, Camera, Code2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { AvatarSelector } from './AvatarSelector';
import { Achievements } from './Achievements';
import { CodePlayground } from './CodePlayground';

type PurchasedCourse = {
  id: string;
  course_id: string;
  purchased_at: string;
  course_title: string;
  course_instructor: string;
  course_price: number;
  course_language: string;
};

type CoinTransaction = {
  id: string;
  transaction_type: string;
  amount: number;
  description: string;
  created_at: string;
};

export const ProfilePage = () => {
  const { user, profile, refreshProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<'info' | 'courses' | 'transactions' | 'achievements' | 'playground'>('info');
  const [purchasedCourses, setPurchasedCourses] = useState<PurchasedCourse[]>([]);
  const [transactions, setTransactions] = useState<CoinTransaction[]>([]);
  const [showAvatarSelector, setShowAvatarSelector] = useState(false);

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
      // Fetch purchased courses
      const { data: purchasedData } = await supabase
        .from('purchased_courses')
        .select('id, course_id, purchased_at')
        .eq('user_id', user.id)
        .order('purchased_at', { ascending: false });

      if (purchasedData && purchasedData.length > 0) {
        // Fetch course details for each purchased course
        const courseIds = purchasedData.map(p => p.course_id);
        const { data: coursesData } = await supabase
          .from('courses')
          .select('id, title, instructor_name, price_coins, language')
          .in('id', courseIds);

        // Combine data
        const combined = purchasedData.map(p => {
          const course = coursesData?.find(c => c.id === p.course_id);
          return {
            id: p.id,
            course_id: p.course_id,
            purchased_at: p.purchased_at,
            course_title: course?.title || 'Khóa học',
            course_instructor: course?.instructor_name || 'CodeMind AI',
            course_price: course?.price_coins || 0,
            course_language: course?.language || 'Python'
          };
        });
        setPurchasedCourses(combined);
      }

      // Fetch transactions
      const { data: transactionsData } = await supabase
        .from('coin_transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (transactionsData) setTransactions(transactionsData);
    } catch (error) {
      console.error('Error fetching user data:', error);
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
      refreshProfile?.();
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Có lỗi xảy ra!');
    }
  };

  const handleAvatarSelect = async (avatarUrl: string) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ avatar_url: avatarUrl })
        .eq('id', user.id);
      
      if (error) throw error;
      setShowAvatarSelector(false);
      refreshProfile?.();
    } catch (error) {
      console.error('Error updating avatar:', error);
      alert('Có lỗi khi cập nhật avatar!');
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

  return (
    <div className="max-w-7xl mx-auto">
      <div className="grid md:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="md:col-span-1">
          <div className="bg-gray-800/80 backdrop-blur-lg rounded-xl shadow-md border border-gray-700 overflow-hidden sticky top-6">
            {/* Avatar Section */}
            <div className="bg-gradient-to-r from-gray-700 to-gray-800 p-6 text-center border-b border-gray-700">
              <div className="relative inline-block">
                <div className="w-20 h-20 mx-auto bg-white rounded-full flex items-center justify-center mb-3 shadow-lg overflow-hidden">
                  {(profile as any)?.avatar_url ? (
                    <img 
                      src={(profile as any).avatar_url} 
                      alt="Avatar" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-10 h-10 text-blue-600" />
                  )}
                </div>
                <button
                  onClick={() => setShowAvatarSelector(true)}
                  className="absolute bottom-2 right-0 w-8 h-8 bg-emerald-400 hover:bg-emerald-500 rounded-full flex items-center justify-center shadow-lg transition-colors"
                  title="Đổi avatar"
                >
                  <Camera className="w-4 h-4 text-gray-900" />
                </button>
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
                    ? 'bg-emerald-400 text-white font-semibold'
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
                    ? 'bg-emerald-400 text-white font-semibold'
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
                    ? 'bg-emerald-400 text-white font-semibold'
                    : 'text-gray-300 hover:bg-gray-700'
                }`}
              >
                <ShoppingBag className="w-5 h-5" />
                <span>Lịch sử giao dịch</span>
              </button>

              <div className="border-t border-gray-700 my-4"></div>

              <button
                onClick={() => setActiveTab('achievements')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-colors ${
                  activeTab === 'achievements'
                    ? 'bg-emerald-400 text-white font-semibold'
                    : 'text-gray-300 hover:bg-gray-700'
                }`}
              >
                <Award className="w-5 h-5" />
                <span>Thành tựu</span>
              </button>

              <button
                onClick={() => setActiveTab('playground')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-colors ${
                  activeTab === 'playground'
                    ? 'bg-emerald-400 text-white font-semibold'
                    : 'text-gray-300 hover:bg-gray-700'
                }`}
              >
                <Code2 className="w-5 h-5" />
                <span>Code Playground</span>
              </button>

              <div className="border-t border-gray-700 my-4"></div>

              <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-400 hover:bg-red-500/20 transition-colors font-semibold">
                <LogOut className="w-5 h-5" />
                <span>Đăng xuất</span>
              </button>
            </div>

            {/* Stats */}
            <div className="p-4 bg-gray-900/50 border-t border-gray-700">
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center">
                  <div className="text-2xl font-bold text-emerald-400">{profile?.total_coins || 0}</div>
                  <div className="text-xs text-gray-400">Xu</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-400">{profile?.level || 1}</div>
                  <div className="text-xs text-gray-400">Level</div>
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
                      className="w-full px-4 py-2 bg-gray-900/50 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-emerald-400 focus:border-transparent"
                      placeholder="Nhập họ tên"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">Tên đăng nhập</label>
                    <input
                      type="text"
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-900/50 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-emerald-400 focus:border-transparent"
                      placeholder="Nhập tên đăng nhập"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">Email</label>
                    <input
                      type="email"
                      value={user?.email || ''}
                      disabled
                      className="w-full px-4 py-2 bg-gray-900/30 border border-gray-600 rounded-lg text-gray-400"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">Số điện thoại</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-900/50 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-emerald-400 focus:border-transparent"
                      placeholder="Nhập số điện thoại"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">Ngày sinh</label>
                    <input
                      type="date"
                      value={formData.birthday}
                      onChange={(e) => setFormData({ ...formData, birthday: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-900/50 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-emerald-400 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">Giới tính</label>
                    <select
                      value={formData.gender}
                      onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-900/50 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-emerald-400 focus:border-transparent"
                    >
                      <option value="Nam" className="bg-gray-800">Nam</option>
                      <option value="Nữ" className="bg-gray-800">Nữ</option>
                      <option value="Khác" className="bg-gray-800">Khác</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Mã khách hàng</label>
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
                    className="px-6 py-2 bg-emerald-400 text-white rounded-lg font-semibold hover:bg-emerald-500 transition-colors"
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
                  <button 
                    onClick={() => {
                      // Chuyển sang tab lessons
                      window.dispatchEvent(new CustomEvent('changeTab', { detail: 'lessons' }));
                    }}
                    className="px-6 py-2 bg-emerald-400 text-white rounded-lg font-semibold hover:bg-emerald-500"
                  >
                    Xem khóa học
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {purchasedCourses.map((pc) => (
                    <div
                      key={pc.id}
                      className="bg-gray-700/50 border border-gray-600 rounded-xl p-5 hover:border-emerald-400/50 transition-all group"
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-emerald-500 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                          <BookOpen className="w-8 h-8 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-white mb-2 group-hover:text-emerald-400 transition-colors">
                            {pc.course_title}
                          </h3>
                          <div className="flex items-center gap-4 text-sm text-gray-300 mb-2">
                            <span>👨‍🏫 {pc.course_instructor}</span>
                            <span className="flex items-center gap-1">
                              <Coins className="w-4 h-4 text-emerald-500" />
                              {pc.course_price} xu
                            </span>
                            <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded text-xs">
                              {pc.course_language}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-400">
                            <Calendar className="w-3 h-3" />
                            <span>Đã mua: {formatDate(pc.purchased_at)}</span>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            // Lưu course_id và chuyển sang tab lessons
                            try {
                              sessionStorage.setItem('openCourseId', pc.course_id);
                            } catch {}
                            window.dispatchEvent(new CustomEvent('changeTab', { detail: 'lessons' }));
                          }}
                          className="px-4 py-2 bg-emerald-400 hover:bg-emerald-500 text-gray-900 rounded-lg text-sm font-bold transition-colors"
                        >
                          Bắt đầu học →
                        </button>
                      </div>
                    </div>
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

          {/* Tab: Thành tựu */}
          {activeTab === 'achievements' && (
            <Achievements />
          )}

          {/* Tab: Code Playground */}
          {activeTab === 'playground' && (
            <CodePlayground />
          )}
        </div>
      </div>

      {/* Avatar Selector Modal */}
      {showAvatarSelector && (
        <AvatarSelector
          currentAvatar={(profile as any)?.avatar_url || null}
          onSelect={handleAvatarSelect}
          onClose={() => setShowAvatarSelector(false)}
        />
      )}
    </div>
  );
};

