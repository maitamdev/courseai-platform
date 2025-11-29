import { useState, useEffect, useRef } from 'react';
import { BookOpen, Users, Clock, Star, Play, CheckCircle, Lock, ChevronDown, ChevronUp, X, Gift, Rocket, Award } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Certificate } from './Certificate';

// Types
type LessonContent = {
  video_url?: string;
  overview?: string;
  theory?: string[];
  applications?: string[];
  companies?: string[];
  learning_goals?: string[];
  key_points?: string[];
  examples?: string[];
  tips?: string[];
  starter_code?: string;
  solution?: string;
  hints?: string[];
  questions?: Array<{
    q: string;
    options: string[];
    answer: number;
  }>;
};

type Lesson = {
  id: string;
  title: string;
  description: string;
  lesson_type: string;
  video_duration: number;
  order_index: number;
  is_free: boolean;
  content?: LessonContent;
};

type Section = {
  id: string;
  title: string;
  description: string;
  order_index: number;
  lessons: Lesson[];
};

type Course = {
  id: string;
  title: string;
  description: string;
  language: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  price_coins: number;
  instructor_name: string;
  duration_hours: number;
  student_count: number;
  rating: number;
  image_url?: string;
  sections: Section[];
};

export const Courses = () => {
  const { user, profile } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedLanguage, setSelectedLanguage] = useState('all');
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set());
  const [purchasedCourses, setPurchasedCourses] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [userCode, setUserCode] = useState('');
  const [submitResult, setSubmitResult] = useState<'correct' | 'wrong' | null>(null);
  const [showCertificate, setShowCertificate] = useState(false);
  const hasFetched = useRef(false);
  const lastUserId = useRef<string | null>(null);

  const languages = ['all', 'Python', 'JavaScript', 'React', 'Java', 'C++'];

  // Fetch courses from database - chỉ fetch 1 lần
  useEffect(() => {
    // Chỉ fetch nếu chưa fetch hoặc user thay đổi
    const currentUserId = user?.id || null;
    if (!hasFetched.current || lastUserId.current !== currentUserId) {
      hasFetched.current = true;
      lastUserId.current = currentUserId;
      fetchCourses();
      if (user) {
        fetchUserData();
      }
    }
  }, [user]);

  // Mở khóa học từ sessionStorage (khi click từ ProfilePage)
  useEffect(() => {
    if (courses.length > 0) {
      try {
        const openCourseId = sessionStorage.getItem('openCourseId');
        if (openCourseId) {
          sessionStorage.removeItem('openCourseId');
          const course = courses.find(c => c.id === openCourseId);
          if (course) {
            setSelectedCourse(course);
            setExpandedSections(new Set([course.sections[0]?.id]));
          }
        }
      } catch {}
    }
  }, [courses]);

  // Scroll lên đầu khi mở bài học và reset code
  useEffect(() => {
    if (selectedLesson) {
      window.scrollTo({ top: 0, behavior: 'instant' });
      // Reset code editor với starter code
      setUserCode(selectedLesson.content?.starter_code || '');
      setSubmitResult(null);
    }
  }, [selectedLesson]);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      // Fetch courses
      const { data: coursesData, error: coursesError } = await supabase
        .from('courses')
        .select('*')
        .eq('is_published', true)
        .order('created_at', { ascending: false });

      if (coursesError) throw coursesError;

      if (coursesData) {
        // Fetch sections and lessons for each course
        const coursesWithSections = await Promise.all(
          coursesData.map(async (course) => {
            // Fetch sections
            const { data: sectionsData } = await supabase
              .from('course_sections')
              .select('*')
              .eq('course_id', course.id)
              .order('order_index');

            if (sectionsData) {
              // Fetch lessons for each section
              const sectionsWithLessons = await Promise.all(
                sectionsData.map(async (section) => {
                  const { data: lessonsData } = await supabase
                    .from('course_lessons')
                    .select('*')
                    .eq('section_id', section.id)
                    .order('order_index');

                  return {
                    ...section,
                    lessons: lessonsData || []
                  };
                })
              );

              return {
                ...course,
                sections: sectionsWithLessons
              };
            }

            return {
              ...course,
              sections: []
            };
          })
        );

        setCourses(coursesWithSections);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserData = async () => {
    if (!user) return;

    try {
      // Fetch purchased courses - chỉ lấy khóa học user đã mua
      const { data: purchasedData } = await supabase
        .from('purchased_courses')
        .select('course_id')
        .eq('user_id', user.id);

      if (purchasedData) {
        const purchased = new Set(purchasedData.map(p => p.course_id));
        setPurchasedCourses(purchased);
      }

      // Fetch completed lessons - chỉ lấy tiến độ của user hiện tại
      const { data: progressData } = await supabase
        .from('user_progress')
        .select('lesson_id')
        .eq('user_id', user.id)
        .eq('completed', true);

      if (progressData) {
        setCompletedLessons(new Set(progressData.map(p => p.lesson_id)));
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const filteredCourses = selectedLanguage === 'all'
    ? courses
    : courses.filter(c => c.language === selectedLanguage);

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'bg-green-500';
      case 'intermediate': return 'bg-emerald-500';
      case 'advanced': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getLevelText = (level: string) => {
    switch (level) {
      case 'beginner': return 'Cơ bản';
      case 'intermediate': return 'Trung cấp';
      case 'advanced': return 'Nâng cao';
      default: return level;
    }
  };

  const getLanguageGradient = (language: string) => {
    switch (language) {
      case 'Python': return 'from-blue-500 to-emerald-500';
      case 'JavaScript': return 'from-emerald-400 to-emerald-600';
      case 'React': return 'from-cyan-400 to-blue-500';
      case 'Java': return 'from-red-500 to-green-500';
      case 'C++': return 'from-blue-600 to-purple-600';
      default: return 'from-gray-500 to-gray-700';
    }
  };

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  const handlePurchase = async (course: Course) => {
    if (!user || !profile) {
      alert('Vui lòng đăng nhập để mua khóa học!');
      return;
    }

    // Kiểm tra đã mua chưa
    if (purchasedCourses.has(course.id)) {
      alert('Bạn đã sở hữu khóa học này!');
      return;
    }

    // Kiểm tra đủ xu không
    if (profile.total_coins < course.price_coins) {
      alert(`Không đủ xu! Bạn cần ${course.price_coins} xu nhưng chỉ có ${profile.total_coins} xu.`);
      return;
    }

    try {
      // 1. Trừ xu
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ total_coins: profile.total_coins - course.price_coins })
        .eq('id', user.id);

      if (updateError) throw updateError;

      // 2. Thêm vào purchased_courses
      const { error: purchaseError } = await supabase
        .from('purchased_courses')
        .insert({ user_id: user.id, course_id: course.id });

      if (purchaseError) throw purchaseError;

      // 3. Ghi lịch sử giao dịch
      await supabase.from('coin_transactions').insert({
        user_id: user.id,
        transaction_type: 'purchase',
        amount: -course.price_coins,
        description: `Mua khóa học: ${course.title}`
      });

      setPurchasedCourses(new Set([...purchasedCourses, course.id]));
      alert(`Mua khóa học "${course.title}" thành công!`);
    } catch (error: any) {
      console.error('Error purchasing course:', error);
      if (error.code === '23505') {
        alert('Bạn đã sở hữu khóa học này!');
      } else {
        alert('Có lỗi xảy ra khi mua khóa học!');
      }
    }
  };

  const handleCompleteLesson = async (lessonId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase.from('user_progress').upsert({
        user_id: user.id,
        lesson_id: lessonId,
        completed: true,
        completed_at: new Date().toISOString()
      }, {
        onConflict: 'user_id,lesson_id'
      });

      if (error) {
        console.error('Error saving progress:', error);
        alert('Không thể lưu tiến độ: ' + error.message);
        return;
      }

      // Cập nhật state
      setCompletedLessons(new Set([...completedLessons, lessonId]));
      console.log('Đã lưu tiến độ bài học:', lessonId);
    } catch (error) {
      console.error('Error completing lesson:', error);
    }
  };

  // Kiểm tra bài học có thể truy cập không
  const canAccessLesson = (course: Course, section: Section, lesson: Lesson, lessonIndex: number) => {
    const isPurchased = purchasedCourses.has(course.id);
    
    // Khóa học miễn phí -> cho xem tất cả
    if (course.price_coins === 0) {
      return true;
    }
    
    // Chưa mua khóa học -> CHỈ xem được bài có is_free = true
    if (!isPurchased) {
      return lesson.is_free === true;
    }
    
    // Đã mua khóa học -> kiểm tra thứ tự học
    const sectionIndex = course.sections.findIndex(s => s.id === section.id);
    
    // Bài đầu tiên của section đầu tiên luôn mở
    if (sectionIndex === 0 && lessonIndex === 0) {
      return true;
    }
    
    // Bài tiếp theo chỉ mở khi bài trước đã hoàn thành
    if (lessonIndex > 0) {
      const prevLesson = section.lessons[lessonIndex - 1];
      return completedLessons.has(prevLesson.id);
    } else {
      // Bài đầu của section -> kiểm tra bài cuối của section trước
      if (sectionIndex > 0) {
        const prevSection = course.sections[sectionIndex - 1];
        const lastLessonOfPrevSection = prevSection.lessons[prevSection.lessons.length - 1];
        return completedLessons.has(lastLessonOfPrevSection.id);
      }
    }
    
    return true;
  };



  const getTotalLessons = (course: Course) => {
    return course.sections.reduce((sum, s) => sum + s.lessons.length, 0);
  };

  const getCompletedCount = (course: Course) => {
    return course.sections.reduce((sum, s) => 
      sum + s.lessons.filter(l => completedLessons.has(l.id)).length, 0);
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    return `${mins} phút`;
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="text-center py-12">
          <div className="w-16 h-16 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Đang tải khóa học...</p>
        </div>
      </div>
    );
  }

  // Render danh sách khóa học
  if (!selectedCourse) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-black text-white mb-2"> KHOÁ HỌC</h1>
          <p className="text-gray-400">Chọn khóa học và bắt đầu hành trình lập trình của bạn</p>
        </div>

        {/* Filter */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {languages.map((lang) => (
            <button
              key={lang}
              onClick={() => setSelectedLanguage(lang)}
              className={`px-5 py-2.5 rounded-xl font-semibold whitespace-nowrap transition-all ${
                selectedLanguage === lang
                  ? 'bg-emerald-400 text-gray-900'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              {lang === 'all' ? 'Tất cả' : lang}
            </button>
          ))}
        </div>

        {/* Courses Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <div
              key={course.id}
              onClick={() => {
                setSelectedCourse(course);
                setExpandedSections(new Set([course.sections[0]?.id]));
              }}
              className="bg-gray-800/50 rounded-2xl border border-gray-700 overflow-hidden hover:border-emerald-400/50 cursor-pointer transition-all hover:scale-[1.02]"
            >
              {/* Header với ảnh nền */}
              <div 
                className="relative h-48 p-6 bg-cover bg-center"
                style={{ 
                  backgroundImage: course.image_url 
                    ? `linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.7)), url(${course.image_url})`
                    : `linear-gradient(to br, ${getLanguageGradient(course.language).replace('from-', '').replace('to-', ', ')})`,
                  backgroundColor: !course.image_url ? '#1f2937' : undefined
                }}
              >
                <div className="flex justify-between mb-4">
                  <span className={`px-3 py-1 ${getLevelColor(course.level)} text-white text-xs font-bold rounded-full`}>
                    {getLevelText(course.level)}
                  </span>
                  <span className="px-3 py-1 bg-white/20 backdrop-blur-sm text-white text-xs font-bold rounded-full">
                    {course.language}
                  </span>
                </div>
                <div className="absolute bottom-6 left-6 right-6">
                  <h3 className="text-xl font-bold text-white mb-2 drop-shadow-lg">{course.title}</h3>
                  <p className="text-white/90 text-sm line-clamp-2 drop-shadow-md">{course.description}</p>
                </div>
              </div>

              <div className="p-5">
                <div className="flex items-center gap-4 text-sm text-gray-400 mb-4">
                  <span className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {course.student_count}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {course.duration_hours}h
                  </span>
                  <span className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-emerald-400 fill-emerald-400" />
                    {course.rating}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-700">
                  {course.price_coins === 0 ? (
                    <span className="text-green-400 font-bold">Miễn phí</span>
                  ) : (
                    <span className="text-emerald-400 font-bold">{course.price_coins} xu</span>
                  )}
                  <span className="text-sm text-gray-400">{getTotalLessons(course)} bài học</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Render chi tiết khóa học
  const progress = Math.round((getCompletedCount(selectedCourse) / getTotalLessons(selectedCourse)) * 100);
  const isPurchased = purchasedCourses.has(selectedCourse.id);

  return (
    <div className="max-w-5xl mx-auto">
      {/* Back button */}
      <button
        onClick={() => {
          setSelectedCourse(null);
          setSelectedLesson(null);
        }}
        className="mb-6 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg flex items-center gap-2"
      >
        ← Quay lại
      </button>

      {/* Course Header */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-2xl mb-6 overflow-hidden">
        <div className="flex">
          {/* Nội dung bên trái */}
          <div className="flex-1 p-8">
            <div className="flex justify-between items-start mb-4">
              <span className={`px-3 py-1 ${getLevelColor(selectedCourse.level)} text-white text-sm font-bold rounded-full`}>
                {getLevelText(selectedCourse.level)}
              </span>
              {isPurchased && (
                <span className="px-3 py-1 bg-green-500 text-white text-sm font-bold rounded-full">
                  ✓ Đã sở hữu
                </span>
              )}
            </div>

            <h1 className="text-3xl font-black text-white mb-3">{selectedCourse.title}</h1>
            <p className="text-white/90 mb-6">{selectedCourse.description}</p>

        <div className="flex items-center gap-6 text-white/80 text-sm mb-6">
          <span className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            {selectedCourse.student_count} học viên
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            {selectedCourse.duration_hours} giờ
          </span>
          <span className="flex items-center gap-1">
            <Star className="w-4 h-4 text-emerald-300 fill-emerald-300" />
            {selectedCourse.rating}
          </span>
          <span className="flex items-center gap-1">
            <BookOpen className="w-4 h-4" />
            {getTotalLessons(selectedCourse)} bài học
          </span>
        </div>

        {/* Progress */}
        {isPurchased && (
          <div className="bg-white/20 rounded-xl p-4 mb-6">
            <div className="flex justify-between text-white text-sm mb-2">
              <span>Tiến độ học tập</span>
              <span className="font-bold">{progress}%</span>
            </div>
            <div className="w-full bg-white/30 rounded-full h-2 mb-3">
              <div className="bg-green-400 h-2 rounded-full transition-all" style={{ width: `${progress}%` }}></div>
            </div>
            {/* Certificate button when 100% complete */}
            {progress === 100 && (
              <button
                onClick={() => setShowCertificate(true)}
                className="w-full py-3 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
              >
                <Award className="w-5 h-5" />
                🎉 Nhận Chứng Chỉ Hoàn Thành
              </button>
            )}
          </div>
        )}

        {/* Purchase button */}
        {!isPurchased && selectedCourse.price_coins > 0 && (
          <div className="space-y-4">
            <div className="bg-green-500/20 border border-green-500/30 rounded-xl p-4">
              <p className="text-green-300 text-sm">
                🔒 <strong>Khóa học trả phí:</strong> Bạn cần mua khóa học này để truy cập tất cả bài học. 
                Chỉ bài học đầu tiên được miễn phí để xem trước.
              </p>
            </div>
            <button
              onClick={() => handlePurchase(selectedCourse)}
              className="px-8 py-3 bg-emerald-400 hover:bg-emerald-500 text-gray-900 rounded-xl font-bold"
            >
              Mua khóa học - {selectedCourse.price_coins} xu
            </button>
          </div>
        )}

        {selectedCourse.price_coins === 0 && (
          <div className="bg-green-500/20 border border-green-500/30 rounded-xl p-4">
            <p className="text-green-300 text-sm">
              🎉 <strong>Khóa học miễn phí:</strong> Bạn có thể truy cập tất cả bài học trong khóa học này!
            </p>
          </div>
        )}
          </div>
          
          {/* Ảnh khóa học bên phải */}
          {selectedCourse.image_url && (
            <div className="hidden md:flex w-48 items-center justify-center bg-[#1a2332] p-4">
              <img 
                src={selectedCourse.image_url} 
                alt={selectedCourse.title}
                className="w-36 h-36 object-contain"
              />
            </div>
          )}
        </div>
      </div>

      {/* Thông báo nếu chưa mua */}
      {!isPurchased && selectedCourse.price_coins > 0 && (
        <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-emerald-400/20 rounded-full flex items-center justify-center">
              <Lock className="w-8 h-8 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white mb-1">Mua khóa học để xem lộ trình đầy đủ</h3>
              <p className="text-gray-400">Bạn có thể xem trước bài học đầu tiên miễn phí bên dưới.</p>
            </div>
          </div>
        </div>
      )}

      {/* Sections */}
      <div className="space-y-3">
        {selectedCourse.sections.map((section, sIndex) => (
          <div key={section.id} className="bg-gray-800/50 rounded-xl border border-gray-700 overflow-hidden">
            <button
              onClick={() => toggleSection(section.id)}
              className="w-full p-4 flex items-center justify-between hover:bg-gray-700/50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-lg ${
                  isPurchased ? 'bg-emerald-400 text-gray-900' : 'bg-gray-700 text-gray-400'
                }`}>
                  {isPurchased ? sIndex + 1 : <Lock className="w-5 h-5" />}
                </div>
                <div className="text-left">
                  <h3 className="font-bold text-white text-lg mb-1">{section.title}</h3>
                  <p className="text-sm text-gray-400">
                    {section.lessons.length} bài học • {Math.round(section.lessons.reduce((sum, l) => sum + l.video_duration, 0) / 60)} phút
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {expandedSections.has(section.id) ? (
                  <ChevronUp className="w-5 h-5 text-emerald-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                )}
              </div>
            </button>

            {expandedSections.has(section.id) && (
              <div className="border-t border-gray-700 bg-gray-900/30">
                {section.lessons.map((lesson, lessonIndex) => {
                  const canAccess = canAccessLesson(selectedCourse, section, lesson, lessonIndex);
                  const isCompleted = completedLessons.has(lesson.id);
                  const isLocked = !canAccess && !lesson.is_free;

                  return (
                    <button
                      key={lesson.id}
                      onClick={() => canAccess && setSelectedLesson(lesson)}
                      disabled={!canAccess}
                      className={`w-full p-4 flex items-center gap-4 border-b border-gray-700/30 last:border-0 transition-all ${
                        canAccess ? 'hover:bg-gray-700/50 cursor-pointer' : 'opacity-60 cursor-not-allowed'
                      }`}
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                          isCompleted ? 'bg-green-500' : canAccess ? 'bg-blue-500' : 'bg-gray-700'
                        }`}>
                          {isCompleted ? (
                            <CheckCircle className="w-5 h-5 text-white" />
                          ) : canAccess ? (
                            <Play className="w-5 h-5 text-white" />
                          ) : (
                            <Lock className="w-4 h-4 text-gray-400" />
                          )}
                        </div>
                        
                        <div className="flex-1 text-left min-w-0">
                          <h4 className="font-semibold text-white mb-1">{lesson.title}</h4>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="flex items-center gap-1 text-xs text-gray-400">
                              <Clock className="w-3 h-3" />
                              {formatDuration(lesson.video_duration)}
                            </span>
                            <span className={`px-2 py-0.5 text-xs font-medium rounded ${
                              lesson.lesson_type === 'video' ? 'bg-blue-500/20 text-blue-400' :
                              lesson.lesson_type === 'exercise' ? 'bg-green-500/20 text-green-400' :
                              'bg-purple-500/20 text-purple-400'
                            }`}>
                              {lesson.lesson_type === 'video' ? '📹 Video' : lesson.lesson_type === 'exercise' ? '✏️ Bài tập' : '❓ Quiz'}
                            </span>
                            {lesson.is_free && !isPurchased && (
                              <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs font-medium rounded flex items-center gap-1">
                                <Gift className="w-3 h-3" />
                                Miễn phí
                              </span>
                            )}
                            {isLocked && (
                              <span className="px-2 py-0.5 bg-red-500/20 text-red-400 text-xs font-medium rounded">
                                🔒 {isPurchased ? 'Hoàn thành bài trước' : 'Cần mua'}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Certificate Modal */}
      {showCertificate && selectedCourse && (
        <Certificate
          studentName={profile?.username || (profile as any)?.full_name || 'Học viên'}
          courseName={selectedCourse.title}
          completionDate={new Date().toLocaleDateString('vi-VN', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
          instructorName={selectedCourse.instructor_name}
          courseId={selectedCourse.id}
          onClose={() => setShowCertificate(false)}
        />
      )}

      {/* Lesson Modal */}
      {selectedLesson && (
        <div className="fixed inset-0 bg-black/90 flex items-start justify-center z-50 p-4 overflow-y-auto" onClick={() => setSelectedLesson(null)}>
          <div className="bg-gray-800 rounded-2xl max-w-4xl w-full my-4" onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div className="sticky top-0 bg-gray-800 p-5 border-b border-gray-700 flex justify-between items-center z-10">
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1.5 text-xs font-bold rounded-lg ${
                  selectedLesson.lesson_type === 'video' ? 'bg-blue-500' : 
                  selectedLesson.lesson_type === 'exercise' ? 'bg-green-500' : 'bg-purple-500'
                }`}>
                  {selectedLesson.lesson_type === 'video' ? '📹 Video' : 
                   selectedLesson.lesson_type === 'exercise' ? '✏️ Bài tập' : '❓ Quiz'}
                </span>
                <h2 className="text-xl font-bold text-white">{selectedLesson.title}</h2>
              </div>
              <button 
                onClick={() => setSelectedLesson(null)} 
                className="p-2 hover:bg-gray-700 rounded-full transition-all"
              >
                <X className="w-6 h-6 text-white" />
              </button>
            </div>
            
            {/* Nội dung */}
            <div className="p-6">
              {/* Video bài giảng */}
              {selectedLesson.lesson_type === 'video' && (
                <>
                  {selectedLesson.content?.video_url ? (
                    <div className="aspect-video bg-black rounded-xl mb-6 overflow-hidden">
                      <iframe
                        src={selectedLesson.content.video_url}
                        className="w-full h-full"
                        allowFullScreen
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        title={selectedLesson.title}
                      />
                    </div>
                  ) : (
                    <div className="aspect-video bg-gray-900 rounded-xl mb-6 flex items-center justify-center">
                      <div className="text-center">
                        <Play className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
                        <p className="text-gray-400">Video: {selectedLesson.title}</p>
                        <p className="text-sm text-gray-500">Thời lượng: {formatDuration(selectedLesson.video_duration)}</p>
                      </div>
                    </div>
                  )}

                  {/* Tổng quan */}
                  {selectedLesson.content?.overview && (
                    <div className="bg-gray-700/50 rounded-xl p-5 mb-6">
                      <h3 className="font-bold text-white mb-3 flex items-center gap-2">
                        📋 Tổng quan
                      </h3>
                      <p className="text-gray-300 leading-relaxed">{selectedLesson.content.overview}</p>
                    </div>
                  )}

                  {/* Kiến thức lý thuyết */}
                  {selectedLesson.content?.theory && selectedLesson.content.theory.length > 0 && (
                    <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-5 mb-6">
                      <h3 className="font-bold text-blue-400 mb-3 flex items-center gap-2">
                        <BookOpen className="w-5 h-5" /> Kiến thức chính
                      </h3>
                      <ul className="space-y-2">
                        {selectedLesson.content.theory.map((item, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-gray-300">
                            <span className="text-blue-400 mt-1">•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Ứng dụng của Python */}
                  {selectedLesson.content?.applications && selectedLesson.content.applications.length > 0 && (
                    <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-xl p-5 mb-6">
                      <h3 className="font-bold text-cyan-400 mb-3 flex items-center gap-2">
                        <Rocket className="w-5 h-5" /> Ứng dụng thực tế
                      </h3>
                      <ul className="space-y-2">
                        {selectedLesson.content.applications.map((app, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-gray-300">
                            <span className="text-cyan-400 mt-1">→</span>
                            <span>{app}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Công ty sử dụng */}
                  {selectedLesson.content?.companies && selectedLesson.content.companies.length > 0 && (
                    <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-5 mb-6">
                      <h3 className="font-bold text-green-400 mb-3 flex items-center gap-2">
                        🏢 Các công ty lớn sử dụng Python
                      </h3>
                      <div className="grid grid-cols-2 gap-2">
                        {selectedLesson.content.companies.map((company, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-gray-300 bg-gray-800/50 rounded-lg px-3 py-2">
                            <span className="text-green-400">✦</span>
                            <span>{company}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Mục tiêu học tập */}
                  {selectedLesson.content?.learning_goals && selectedLesson.content.learning_goals.length > 0 && (
                    <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-xl p-5 mb-6">
                      <h3 className="font-bold text-indigo-400 mb-3 flex items-center gap-2">
                        🎯 Mục tiêu học tập của khóa học
                      </h3>
                      <ul className="space-y-2">
                        {selectedLesson.content.learning_goals.map((goal, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-gray-300">
                            <span>{goal}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Điểm quan trọng */}
                  {selectedLesson.content?.key_points && selectedLesson.content.key_points.length > 0 && (
                    <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-5 mb-6">
                      <h3 className="font-bold text-emerald-400 mb-3 flex items-center gap-2">
                        ⭐ Điểm quan trọng cần nhớ
                      </h3>
                      <ul className="space-y-2">
                        {selectedLesson.content.key_points.map((point, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-gray-300">
                            <span className="text-emerald-400 mt-1">✓</span>
                            <span>{point}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Ví dụ code */}
                  {selectedLesson.content?.examples && selectedLesson.content.examples.length > 0 && (
                    <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-5 mb-6">
                      <h3 className="font-bold text-green-400 mb-3 flex items-center gap-2">
                        💻 Ví dụ minh họa
                      </h3>
                      {selectedLesson.content.examples.map((example, idx) => (
                        <pre key={idx} className="bg-gray-900 rounded-lg p-4 overflow-x-auto mb-3 last:mb-0">
                          <code className="text-green-400 text-sm whitespace-pre-wrap">{example}</code>
                        </pre>
                      ))}
                    </div>
                  )}

                  {/* Mẹo hay */}
                  {selectedLesson.content?.tips && selectedLesson.content.tips.length > 0 && (
                    <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-5 mb-6">
                      <h3 className="font-bold text-purple-400 mb-3 flex items-center gap-2">
                        💡 Mẹo hay
                      </h3>
                      <ul className="space-y-2">
                        {selectedLesson.content.tips.map((tip, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-gray-300">
                            <span className="text-purple-400 mt-1">→</span>
                            <span>{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </>
              )}

              {/* Bài tập thực hành */}
              {selectedLesson.lesson_type === 'exercise' && (
                <>
                  <div className="bg-gray-900/50 rounded-xl p-4 mb-6">
                    <h3 className="font-bold text-white mb-2">📝 Yêu cầu bài tập</h3>
                    <p className="text-gray-300">{selectedLesson.description}</p>
                  </div>

                  {/* Code Editor */}
                  <div className="mb-6">
                    <h3 className="font-bold text-white mb-3">💻 Viết code của bạn</h3>
                    <textarea
                      value={userCode}
                      onChange={(e) => {
                        setUserCode(e.target.value);
                        setSubmitResult(null);
                      }}
                      className="w-full h-48 bg-gray-900 text-green-400 font-mono text-sm p-4 rounded-xl border border-gray-700 focus:border-emerald-400 focus:outline-none resize-none"
                      placeholder="Viết code của bạn ở đây..."
                      spellCheck={false}
                    />
                  </div>

                  {/* Kết quả nộp bài */}
                  {submitResult === 'correct' && (
                    <div className="bg-green-500/20 border border-green-500/50 rounded-xl p-4 mb-6">
                      <p className="text-green-400 font-bold">✅ Chính xác! Bạn đã hoàn thành bài tập.</p>
                    </div>
                  )}
                  {submitResult === 'wrong' && (
                    <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-4 mb-6">
                      <p className="text-red-400 font-bold">❌ Chưa đúng! Hãy kiểm tra lại code của bạn.</p>
                      <p className="text-gray-400 text-sm mt-1">Gợi ý: Xem lại yêu cầu bài tập và các gợi ý bên dưới.</p>
                    </div>
                  )}

                  {/* Nút nộp bài */}
                  <button
                    onClick={() => {
                      const solution = selectedLesson.content?.solution || '';
                      // So sánh code (bỏ khoảng trắng thừa)
                      const normalizeCode = (code: string) => 
                        code.replace(/\s+/g, ' ').trim().toLowerCase();
                      
                      if (normalizeCode(userCode) === normalizeCode(solution)) {
                        setSubmitResult('correct');
                      } else {
                        setSubmitResult('wrong');
                      }
                    }}
                    disabled={!userCode.trim()}
                    className="w-full py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-xl font-bold mb-6"
                  >
                    Nộp bài
                  </button>

                  {/* Gợi ý */}
                  {selectedLesson.content?.hints && selectedLesson.content.hints.length > 0 && (
                    <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-5 mb-6">
                      <h3 className="font-bold text-emerald-400 mb-3">💡 Gợi ý</h3>
                      <ul className="space-y-2">
                        {selectedLesson.content.hints.map((hint, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-gray-300">
                            <span className="text-emerald-400">{idx + 1}.</span>
                            <span>{hint}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Lời giải (ẩn mặc định) */}
                  {selectedLesson.content?.solution && (
                    <details className="mb-6">
                      <summary className="cursor-pointer bg-green-500/10 border border-green-500/30 rounded-xl p-4 text-green-400 font-bold">
                        🔓 Xem lời giải (click để mở)
                      </summary>
                      <pre className="bg-gray-900 rounded-b-xl p-4 overflow-x-auto mt-0 border border-t-0 border-green-500/30">
                        <code className="text-green-400 text-sm whitespace-pre-wrap">
                          {selectedLesson.content.solution}
                        </code>
                      </pre>
                    </details>
                  )}
                </>
              )}

              {/* Quiz */}
              {selectedLesson.lesson_type === 'quiz' && selectedLesson.content?.questions && (
                <div className="space-y-6">
                  {selectedLesson.content.questions.map((question, qIdx) => (
                    <div key={qIdx} className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-5">
                      <h3 className="font-bold text-purple-400 mb-4">Câu {qIdx + 1}: {question.q}</h3>
                      <div className="space-y-2">
                        {question.options.map((option, oIdx) => (
                          <button
                            key={oIdx}
                            className="w-full text-left p-3 bg-gray-700/50 hover:bg-gray-700 rounded-lg text-gray-300 transition-all"
                          >
                            {String.fromCharCode(65 + oIdx)}. {option}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Mô tả */}
              {selectedLesson.description && selectedLesson.lesson_type === 'video' && (
                <div className="bg-gray-900/50 rounded-xl p-4 mb-6">
                  <h3 className="font-bold text-white mb-2">📖 Mô tả bài học</h3>
                  <p className="text-gray-300">{selectedLesson.description}</p>
                </div>
              )}

              {/* Complete button */}
              <div className="mt-6 pt-6 border-t border-gray-700">
                {!completedLessons.has(selectedLesson.id) ? (
                  <>
                    {/* Bài tập: chỉ hoàn thành khi nộp đúng */}
                    {selectedLesson.lesson_type === 'exercise' ? (
                      submitResult === 'correct' ? (
                        <button
                          onClick={() => {
                            handleCompleteLesson(selectedLesson.id);
                            setSelectedLesson(null);
                          }}
                          className="w-full py-4 bg-green-500 hover:bg-green-600 text-white rounded-xl font-bold text-lg"
                        >
                          ✓ Hoàn thành bài tập
                        </button>
                      ) : (
                        <div className="text-center py-4 bg-gray-700/50 text-gray-400 rounded-xl font-bold text-lg">
                          🔒 Nộp bài đúng để hoàn thành
                        </div>
                      )
                    ) : (
                      /* Video/Quiz: có thể hoàn thành ngay */
                      <button
                        onClick={() => {
                          handleCompleteLesson(selectedLesson.id);
                          setSelectedLesson(null);
                        }}
                        className="w-full py-4 bg-green-500 hover:bg-green-600 text-white rounded-xl font-bold text-lg"
                      >
                        ✓ Hoàn thành bài học
                      </button>
                    )}
                  </>
                ) : (
                  <div className="text-center py-4 bg-green-500/20 text-green-400 rounded-xl font-bold text-lg">
                    ✓ Đã hoàn thành bài học này
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};