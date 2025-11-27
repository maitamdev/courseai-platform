import { useState, useEffect } from 'react';
import { ShoppingBag, BookOpen, Coins, CheckCircle, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, Course, PurchasedCourse } from '../lib/supabase';

type ShopProps = {
  onCoinsChange: () => void;
};

export const Shop = ({ onCoinsChange }: ShopProps) => {
  const { user, profile } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [purchasedCourses, setPurchasedCourses] = useState<PurchasedCourse[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [purchasing, setPurchasing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    if (!user) return;

    const [coursesRes, purchasedRes] = await Promise.all([
      supabase.from('courses').select('*').order('level').order('price'),
      supabase.from('purchased_courses').select('*').eq('user_id', user.id),
    ]);

    if (coursesRes.data) setCourses(coursesRes.data);
    if (purchasedRes.data) setPurchasedCourses(purchasedRes.data);
  };

  const isPurchased = (courseId: string) => {
    return purchasedCourses.some((p) => p.course_id === courseId);
  };

  const handlePurchase = async () => {
    if (!user || !selectedCourse || !profile) return;

    if (profile.total_coins < selectedCourse.price) {
      setError('Bạn không đủ xu để mua khóa học này!');
      return;
    }

    setPurchasing(true);
    setError('');

    try {
      const { error: purchaseError } = await supabase.from('purchased_courses').insert({
        user_id: user.id,
        course_id: selectedCourse.id,
      });

      if (purchaseError) throw purchaseError;

      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          total_coins: profile.total_coins - selectedCourse.price,
        })
        .eq('id', user.id);

      if (updateError) throw updateError;

      await fetchData();
      onCoinsChange();
      setSelectedCourse(null);
    } catch (err: any) {
      setError(err.message || 'Có lỗi xảy ra khi mua khóa học');
    } finally {
      setPurchasing(false);
    }
  };

  const levelColors = {
    beginner: 'bg-green-100 text-green-700',
    intermediate: 'bg-yellow-100 text-yellow-700',
    advanced: 'bg-red-100 text-red-700',
  };

  const levelText = {
    beginner: 'Cơ bản',
    intermediate: 'Trung bình',
    advanced: 'Nâng cao',
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">Cửa Hàng Khóa Học</h2>
        <p className="text-gray-300">Mua khóa học để học sâu hơn và kiếm thêm xu!</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => {
          const purchased = isPurchased(course.id);

          return (
            <div
              key={course.id}
              className="bg-white rounded-xl shadow-md overflow-hidden border-2 border-transparent hover:border-blue-300 transition-all"
            >
              <div className={`h-32 bg-gradient-to-br ${
                course.level === 'beginner'
                  ? 'from-green-400 to-blue-500'
                  : course.level === 'intermediate'
                  ? 'from-yellow-400 to-orange-500'
                  : 'from-red-400 to-pink-500'
              } flex items-center justify-center`}>
                <BookOpen className="w-16 h-16 text-white" />
              </div>

              <div className="p-5">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-bold text-lg text-white flex-1">{course.title}</h3>
                  {purchased && <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 ml-2" />}
                </div>

                <span className={`inline-block text-xs px-2 py-1 rounded-full font-medium mb-3 ${levelColors[course.level]}`}>
                  {levelText[course.level]}
                </span>

                <p className="text-gray-300 text-sm mb-4 line-clamp-2">
                  {course.description}
                </p>

                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <span>{course.lessons_count} bài học</span>
                  <div className="flex items-center gap-1 font-semibold text-orange-600">
                    <Coins className="w-4 h-4" />
                    <span>{course.price} xu</span>
                  </div>
                </div>

                {purchased ? (
                  <button
                    disabled
                    className="w-full bg-green-100 text-green-700 py-2 rounded-lg font-medium flex items-center justify-center gap-2"
                  >
                    <CheckCircle className="w-5 h-5" />
                    Đã sở hữu
                  </button>
                ) : (
                  <button
                    onClick={() => setSelectedCourse(course)}
                    className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <ShoppingBag className="w-5 h-5" />
                    Mua ngay
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {selectedCourse && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold text-white">Xác nhận mua hàng</h3>
              <button
                onClick={() => {
                  setSelectedCourse(null);
                  setError('');
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mb-6">
              <h4 className="font-semibold text-white mb-2">{selectedCourse.title}</h4>
              <p className="text-gray-300 text-sm mb-4">{selectedCourse.description}</p>

              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-300">Giá:</span>
                  <span className="font-semibold text-orange-600 flex items-center gap-1">
                    <Coins className="w-4 h-4" />
                    {selectedCourse.price} xu
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-300">Xu hiện tại:</span>
                  <span className="font-semibold">{profile?.total_coins || 0} xu</span>
                </div>
                <div className="border-t pt-2 flex justify-between text-sm">
                  <span className="text-gray-300">Còn lại:</span>
                  <span className={`font-bold ${
                    (profile?.total_coins || 0) >= selectedCourse.price
                      ? 'text-green-600'
                      : 'text-red-600'
                  }`}>
                    {(profile?.total_coins || 0) - selectedCourse.price} xu
                  </span>
                </div>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-4">
                {error}
              </div>
            )}

            <button
              onClick={handlePurchase}
              disabled={purchasing || (profile?.total_coins || 0) < selectedCourse.price}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <ShoppingBag className="w-5 h-5" />
              {purchasing ? 'Đang xử lý...' : 'Xác nhận mua'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

