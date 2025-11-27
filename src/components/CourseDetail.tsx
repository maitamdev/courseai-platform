import { useState, useEffect } from 'react';
import { X, Play, Lock, CheckCircle, Clock, FileText, BookOpen, Code2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { LessonDetail } from './LessonDetail';

type Section = {
  id: string;
  title: string;
  description: string;
  order_index: number;
};

type Lesson = {
  id: string;
  section_id: string;
  title: string;
  description: string;
  lesson_type: string;
  video_url: string | null;
  video_duration: number | null;
  is_free: boolean;
  order_index: number;
};

type CourseDetailProps = {
  courseId: string;
  onClose: () => void;
};

export const CourseDetail = ({ courseId, onClose }: CourseDetailProps) => {
  const { user, profile, refreshProfile } = useAuth();
  const [course, setCourse] = useState<any>(null);
  const [sections, setSections] = useState<Section[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [isPurchased, setIsPurchased] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState<any>(null);

  useEffect(() => {
    fetchCourseData();
    checkPurchased();
  }, [courseId]);

  const fetchCourseData = async () => {
    try {
      const [courseRes, sectionsRes] = await Promise.all([
        supabase.from('courses').select('*').eq('id', courseId).single(),
        supabase.from('course_sections').select('*').eq('course_id', courseId).order('order_index'),
      ]);

      if (courseRes.data) setCourse(courseRes.data);
      if (sectionsRes.data) {
        setSections(sectionsRes.data);
        fetchAllLessons(sectionsRes.data.map(s => s.id));
      }
    } catch (error) {
      console.error('Error fetching course:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllLessons = async (sectionIds: string[]) => {
    try {
      const { data, error } = await supabase
        .from('course_lessons')
        .select('*')
        .in('section_id', sectionIds)
        .order('order_index');

      if (error) throw error;
      if (data) setLessons(data);
    } catch (error) {
      console.error('Error fetching lessons:', error);
    }
  };

  const checkPurchased = async () => {
    if (!user) return;

    try {
      const { data } = await supabase
        .from('purchased_courses')
        .select('*')
        .eq('user_id', user.id)
        .eq('course_id', courseId)
        .maybeSingle();

      if (data) setIsPurchased(true);
    } catch (error) {
      console.error('Error checking purchase:', error);
    }
  };

  const handlePurchase = async () => {
    if (!user || !course) return;

    if ((profile?.total_coins || 0) < course.price_coins) {
      alert('Bạn không đủ xu! Vui lòng nạp thêm xu.');
      return;
    }

    setPurchasing(true);
    try {
      await supabase.from('purchased_courses').insert({
        user_id: user.id,
        course_id: courseId,
      });

      await supabase
        .from('profiles')
        .update({ total_coins: (profile?.total_coins || 0) - course.price_coins })
        .eq('id', user.id);

      await supabase.from('coin_transactions').insert({
        user_id: user.id,
        transaction_type: 'spend',
        amount: -course.price_coins,
        description: `Mua khóa học: ${course.title}`,
      });

      await refreshProfile();
      setIsPurchased(true);
      alert('Mua khóa học thành công!');
    } catch (error) {
      console.error('Error purchasing:', error);
      alert('Có lỗi xảy ra!');
    } finally {
      setPurchasing(false);
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

  const getLessonIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Play className="w-5 h-5" />;
      case 'article':
        return <FileText className="w-5 h-5" />;
      case 'quiz':
        return <CheckCircle className="w-5 h-5" />;
      case 'exercise':
        return <Code2 className="w-5 h-5" />;
      default:
        return <BookOpen className="w-5 h-5" />;
    }
  };

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return '';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  if (!course) return null;

  const totalLessons = lessons.length;
  const totalDuration = lessons.reduce((acc, l) => acc + (l.video_duration || 0), 0);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-center z-10">
          <h2 className="text-2xl font-bold text-white">{course.title}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-8">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div className="md:col-span-2">
              <div className="bg-gradient-to-br from-blue-500 via-purple-600 to-pink-500 rounded-2xl p-12 text-white mb-6">
                <h3 className="text-3xl font-black mb-4">{course.title}</h3>
                <p className="text-lg mb-6 opacity-90">{course.description}</p>
                <div className="flex gap-4 text-sm">
                  <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                    <BookOpen className="w-4 h-4" />
                    <span>{totalLessons} bài học</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                    <Clock className="w-4 h-4" />
                    <span>{Math.floor(totalDuration / 3600)}h {Math.floor((totalDuration % 3600) / 60)}m</span>
                  </div>
                </div>
              </div>

              <h3 className="text-2xl font-bold text-white mb-4">Nội dung khóa học</h3>

              <div className="space-y-4">
                {sections.map((section) => {
                  const sectionLessons = lessons.filter((l) => l.section_id === section.id);
                  const isExpanded = expandedSections.has(section.id);

                  return (
                    <div key={section.id} className="border-2 border-gray-200 rounded-2xl overflow-hidden">
                      <button
                        onClick={() => toggleSection(section.id)}
                        className="w-full p-6 bg-gray-50 hover:bg-gray-100 transition-colors flex justify-between items-center"
                      >
                        <div className="text-left">
                          <h4 className="font-bold text-lg text-white mb-1">
                            {section.title}
                          </h4>
                          <p className="text-sm text-gray-300">
                            {sectionLessons.length} bài học
                          </p>
                        </div>
                        <div className={`transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                          ▼
                        </div>
                      </button>

                      {isExpanded && (
                        <div className="p-4 bg-white">
                          {sectionLessons.map((lesson) => (
                            <button
                              key={lesson.id}
                              onClick={() => {
                                if (lesson.is_free || isPurchased) {
                                  setSelectedLesson(lesson);
                                } else {
                                  alert('Vui lòng mua khóa học để xem bài này!');
                                }
                              }}
                              className="w-full flex items-center justify-between p-4 hover:bg-gray-50 rounded-xl transition-colors mb-2 text-left"
                            >
                              <div className="flex items-center gap-3">
                                <div className="text-blue-600">
                                  {getLessonIcon(lesson.lesson_type)}
                                </div>
                                <div>
                                  <h5 className="font-medium text-white">{lesson.title}</h5>
                                  {lesson.video_duration && (
                                    <span className="text-sm text-gray-300">
                                      {formatDuration(lesson.video_duration)}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div>
                                {lesson.is_free || isPurchased ? (
                                  <Play className="w-5 h-5 text-green-600" />
                                ) : (
                                  <Lock className="w-5 h-5 text-gray-400" />
                                )}
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="md:col-span-1">
              <div className="sticky top-24 bg-white border-2 border-gray-200 rounded-2xl p-6">
                <div className="text-center mb-6">
                  <div className="text-4xl font-black text-white mb-2">
                    {course.price_coins}
                  </div>
                  <div className="text-gray-300">xu</div>
                </div>

                {isPurchased ? (
                  <div className="bg-green-100 text-green-800 px-6 py-3 rounded-xl font-bold text-center mb-4">
                    Đã mua khóa học
                  </div>
                ) : (
                  <button
                    onClick={handlePurchase}
                    disabled={purchasing}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-xl font-bold hover:shadow-lg transition-all disabled:opacity-50"
                  >
                    {purchasing ? 'Đang xử lý...' : 'Mua khóa học'}
                  </button>
                )}

                <div className="mt-6 space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-300">Giảng viên</span>
                    <span className="font-medium">{course.instructor_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Thời lượng</span>
                    <span className="font-medium">{course.duration_hours}h</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Số bài học</span>
                    <span className="font-medium">{totalLessons}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Học viên</span>
                    <span className="font-medium">{course.student_count}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {selectedLesson && (
        <LessonDetail
          lesson={selectedLesson}
          onClose={() => setSelectedLesson(null)}
        />
      )}
    </div>
  );
};

