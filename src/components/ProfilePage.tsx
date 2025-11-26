import { useEffect, useState } from 'react';
import { Trophy, BookOpen, Coins, Award, Calendar, TrendingUp, Star, Target, User, Mail } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

type PurchasedCourse = {
  id: string;
  course_id: string;
  purchased_at: string;
  courses: {
    title: string;
    instructor_name: string;
    price: number;
  };
};

type CoinTransaction = {
  id: string;
  transaction_type: string;
  amount: number;
  description: string;
  created_at: string;
};

export const ProfilePage = () => {
  const { user, profile } = useAuth();
  const [purchasedCourses, setPurchasedCourses] = useState<PurchasedCourse[]>([]);
  const [transactions, setTransactions] = useState<CoinTransaction[]>([]);
  const [gameProgress, setGameProgress] = useState({ completed: 0, total: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchUserData();
    }
  }, [user]);

  const fetchUserData = async () => {
    if (!user) return;

    try {
      const [coursesRes, transactionsRes, gamesRes] = await Promise.all([
        supabase
          .from('purchased_courses')
          .select('id, course_id, purchased_at, courses(title, instructor_name, price)')
          .eq('user_id', user.id)
          .order('purchased_at', { ascending: false }),
        supabase
          .from('coin_transactions')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(50),
        supabase
          .from('user_game_progress')
          .select('completed')
          .eq('user_id', user.id)
      ]);

      if (coursesRes.data) setPurchasedCourses(coursesRes.data);
      if (transactionsRes.data) setTransactions(transactionsRes.data);

      if (gamesRes.data) {
        const completed = gamesRes.data.filter(g => g.completed).length;
        setGameProgress({ completed, total: gamesRes.data.length });
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'purchase':
        return 'text-green-600 bg-green-50 border-green-300';
      case 'spend':
        return 'text-red-600 bg-red-50 border-red-300';
      case 'earn':
        return 'text-blue-600 bg-blue-50 border-blue-300';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-300';
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
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 rounded-3xl p-8 text-white shadow-2xl">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border-4 border-white/30">
              <User className="w-12 h-12" />
            </div>
            <div>
              <h1 className="text-3xl font-black mb-2">{user?.email?.split('@')[0]}</h1>
              <div className="flex items-center gap-2 text-sm opacity-90 mb-3">
                <Mail className="w-4 h-4" />
                <span>{user?.email}</span>
              </div>
              <div className="flex gap-4">
                <div className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-bold">
                  Level {profile?.level || 1}
                </div>
                <div className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-bold">
                  {profile?.total_xp || 0} XP
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-3xl p-6 text-white shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <Trophy className="w-6 h-6" />
            </div>
            <span className="text-3xl font-black">{profile?.level || 1}</span>
          </div>
          <h3 className="text-lg font-bold">Level</h3>
          <p className="text-sm opacity-90">Cấp độ hiện tại</p>
        </div>

        <div className="bg-gradient-to-br from-yellow-500 to-orange-500 rounded-3xl p-6 text-white shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <Coins className="w-6 h-6" />
            </div>
            <span className="text-3xl font-black">{profile?.total_coins || 0}</span>
          </div>
          <h3 className="text-lg font-bold">Xu</h3>
          <p className="text-sm opacity-90">Số dư hiện tại</p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-3xl p-6 text-white shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <TrendingUp className="w-6 h-6" />
            </div>
            <span className="text-3xl font-black">{profile?.total_xp || 0}</span>
          </div>
          <h3 className="text-lg font-bold">XP</h3>
          <p className="text-sm opacity-90">Kinh nghiệm</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-3xl p-6 text-white shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <BookOpen className="w-6 h-6" />
            </div>
            <span className="text-3xl font-black">{purchasedCourses.length}</span>
          </div>
          <h3 className="text-lg font-bold">Khóa học</h3>
          <p className="text-sm opacity-90">Đã mua</p>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-white rounded-3xl p-6 shadow-xl border-2 border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <Target className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Khóa học</h3>
          </div>
          <p className="text-4xl font-black text-blue-600 mb-2">{purchasedCourses.length}</p>
          <p className="text-sm text-gray-600">Đã sở hữu</p>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-xl border-2 border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <Award className="w-5 h-5 text-green-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Game</h3>
          </div>
          <p className="text-4xl font-black text-green-600 mb-2">{gameProgress.completed}</p>
          <p className="text-sm text-gray-600">Màn đã hoàn thành</p>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-xl border-2 border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
              <Star className="w-5 h-5 text-yellow-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Giao dịch</h3>
          </div>
          <p className="text-4xl font-black text-yellow-600 mb-2">{transactions.length}</p>
          <p className="text-sm text-gray-600">Lịch sử</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-3xl p-6 shadow-xl border-2 border-gray-200">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-purple-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">Khóa học của tôi</h3>
          </div>

          {purchasedCourses.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="font-semibold">Chưa mua khóa học nào</p>
              <p className="text-sm">Hãy khám phá và mua khóa học để bắt đầu học!</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[500px] overflow-y-auto">
              {purchasedCourses.map((pc) => (
                <div key={pc.id} className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl border-2 border-purple-200 hover:border-purple-400 transition-all hover:shadow-lg">
                  <h4 className="font-bold text-gray-900 mb-2">{pc.courses.title}</h4>
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-gray-600">👨‍🏫 {pc.courses.instructor_name}</span>
                    <span className="text-purple-600 font-bold bg-white px-3 py-1 rounded-full">
                      {pc.courses.price} xu
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Calendar className="w-3 h-3" />
                    <span>{formatDate(pc.purchased_at)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-xl border-2 border-gray-200">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
              <Coins className="w-5 h-5 text-yellow-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">Lịch sử giao dịch</h3>
          </div>

          {transactions.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Coins className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="font-semibold">Chưa có giao dịch nào</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[500px] overflow-y-auto">
              {transactions.map((tx) => (
                <div key={tx.id} className={`p-4 rounded-2xl border-2 ${getTransactionColor(tx.transaction_type)}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-gray-900 text-sm flex-1">{tx.description}</span>
                    <span className="text-lg font-black ml-2">
                      {tx.amount > 0 ? '+' : ''}{tx.amount}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <Calendar className="w-3 h-3" />
                    <span>{formatDate(tx.created_at)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
