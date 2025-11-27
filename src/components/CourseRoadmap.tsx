import { useState, useEffect } from 'react';
import { CheckCircle, Lock, PlayCircle, Clock, ChevronDown, ChevronUp, FileText } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

type Lesson = {
  id: string;
  title: string;
  description: string;
  lesson_type: string;
  video_duration: number;
  order_index: number;
  is_free: boolean;
};

type Section = {
  id: string;
  title: string;
  description: string;
  order_index: number;
  lessons: Lesson[];
  completed: number;
  total: number;
};

type CourseRoadmapProps = {
  courseId: string;
  onLessonSelect: (lessonId: string) => void;
};

export const CourseRoadmap = ({ courseId, onLessonSelect }: CourseRoadmapProps) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'content' | 'instructor' | 'reviews'>('content');
  const [course, setCourse] = useState<any>(null);
  const [sections, setSections] = useState<Section[]>([]);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set());
  const [selectedLesson, setSelectedLesson] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCourseData();
  }, [courseId, user]);

  const fetchCourseData = async () => {
    try {
      // Fetch course info
      const { data: courseData } = await supabase
        .from('courses')
        .select('*')
        .eq('id', courseId)
        .single();

      if (courseData) setCourse(courseData);

      // Fetch sections with lessons
      const { data: sectionsData } = await supabase
        .from('course_sections')
        .select(`
          id,
          title,
          description,
          order_index,
          course_lessons (
            id,
            title,
            description,
            lesson_type,
            video_duration,
            order_index,
            is_free
          )
        `)
        .eq('course_id', courseId)
        .order('order_index');

      if (sectionsData) {
        const formattedSections = sectionsData.map((section: any) => ({
          ...section,
          lessons: section.course_lessons.sort((a: any, b: any) => a.order_index - b.order_index),
          completed: 0,
          total: section.course_lessons.length
        }));
        setSections(formattedSections);
        
        // Expand first section by default
        if (formattedSections.length > 0) {
          setExpandedSections(new Set([formattedSections[0].id]));
        }
      }

      // Fetch user progress if logged in
      if (user) {
        try {
          const { data: progressData } = await supabase
            .from('user_progress')
            .select('lesson_id')
            .eq('user_id', user.id)
            .eq('completed', true);

          if (progressData) {
            setCompletedLessons(new Set(progressData.map((p: any) => p.lesson_id)));
          }
        } catch (err) {
          console.log('No progress data yet');
        }
      }
    } catch (error) {
      console.error('Error fetching course data:', error);
    } finally {
      setLoading(false);
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

  const calculateProgress = () => {
    const totalLessons = sections.reduce((sum, s) => sum + s.total, 0);
    const completedCount = Array.from(completedLessons).length;
    return totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;
  };

  const getSectionStatus = (section: Section) => {
    const sectionLessonIds = section.lessons.map(l => l.id);
    const completedInSection = sectionLessonIds.filter(id => completedLessons.has(id)).length;
    
    if (completedInSection === 0) return 'not-started';
    if (completedInSection === section.total) return 'completed';
    return 'in-progress';
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    return `${mins} phút`;
  };

  const handleLessonClick = async (lessonId: string) => {
    try {
      const { data, error } = await supabase
        .from('course_lessons')
        .select('*')
        .eq('id', lessonId)
        .single();

      if (error) throw error;
      if (data) {
        setSelectedLesson(data);
      }
    } catch (error) {
      console.error('Error fetching lesson:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const progress = calculateProgress();

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header with Video */}
      <div className="bg-gradient-to-r from-blue-900 to-purple-900 rounded-xl shadow-lg p-8 mb-6 text-white">
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <span className="inline-block px-3 py-1 bg-green-500 text-white text-xs font-bold rounded-full mb-4">
              KHOÁ HỌC
            </span>
            <h1 className="text-3xl font-bold mb-4">{course?.title}</h1>
            <p className="text-white/90 mb-6">{course?.description}</p>
            
            <div className="flex items-center gap-6 text-sm mb-4">
              <div className="flex items-center gap-2">
                <span className="text-yellow-400">⭐ {course?.rating}</span>
              </div>
              <div>{course?.student_count} học viên</div>
              <div>{course?.duration_hours} giờ</div>
            </div>

            {/* Progress Bar */}
            <div className="bg-white/20 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold">Tiến độ học tập</span>
                <span className="text-sm font-bold">{progress}%</span>
              </div>
              <div className="w-full bg-white/30 rounded-full h-2">
                <div
                  className="bg-green-400 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Video Preview */}
          <div className="bg-black/30 rounded-xl overflow-hidden border-2 border-white/20">
            <div className="aspect-video bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
              <div className="text-center">
                <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <PlayCircle className="w-10 h-10" />
                </div>
                <p className="text-sm">Video giới thiệu khóa học</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 mb-6">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('content')}
            className={`px-6 py-4 font-semibold transition-colors ${
              activeTab === 'content'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-300 hover:text-white'
            }`}
          >
            Nội dung khóa học
          </button>
          <button
            onClick={() => setActiveTab('instructor')}
            className={`px-6 py-4 font-semibold transition-colors ${
              activeTab === 'instructor'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-300 hover:text-white'
            }`}
          >
            Giảng viên
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`px-6 py-4 font-semibold transition-colors ${
              activeTab === 'reviews'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-300 hover:text-white'
            }`}
          >
            Đánh giá
          </button>
        </div>
      </div>

      {/* Main Content */}
      {activeTab === 'content' && (
        <div className="grid md:grid-cols-3 gap-6">
          {/* Left: Sections List */}
          <div className="md:col-span-2 space-y-4">
        {sections.map((section, index) => {
          const status = getSectionStatus(section);
          const isExpanded = expandedSections.has(section.id);
          const sectionLessonIds = section.lessons.map(l => l.id);
          const completedInSection = sectionLessonIds.filter(id => completedLessons.has(id)).length;

          return (
            <div key={section.id} className="relative">
              {/* Vertical Line */}
              {index < sections.length - 1 && (
                <div className="absolute left-6 top-16 bottom-0 w-0.5 bg-gray-200 -mb-4"></div>
              )}

              {/* Section Card */}
              <div className={`bg-white rounded-xl shadow-md border-2 overflow-hidden transition-all ${
                status === 'completed' ? 'border-green-400' :
                status === 'in-progress' ? 'border-blue-400' :
                'border-gray-200'
              }`}>
                {/* Section Header */}
                <button
                  onClick={() => toggleSection(section.id)}
                  className="w-full p-6 flex items-start gap-4 hover:bg-gray-50 transition-colors"
                >
                  {/* Status Icon */}
                  <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${
                    status === 'completed' ? 'bg-green-100' :
                    status === 'in-progress' ? 'bg-blue-100' :
                    'bg-gray-100'
                  }`}>
                    {status === 'completed' ? (
                      <CheckCircle className="w-6 h-6 text-green-600" />
                    ) : status === 'in-progress' ? (
                      <PlayCircle className="w-6 h-6 text-blue-600" />
                    ) : (
                      <Lock className="w-6 h-6 text-gray-400" />
                    )}
                  </div>

                  {/* Section Info */}
                  <div className="flex-1 text-left">
                    <h3 className="text-xl font-bold text-white mb-1">{section.title}</h3>
                    <p className="text-sm text-gray-300 mb-2">{section.description}</p>
                    <div className="flex items-center gap-4 text-sm">
                      <span className={`font-semibold ${
                        status === 'completed' ? 'text-green-600' :
                        status === 'in-progress' ? 'text-blue-600' :
                        'text-gray-500'
                      }`}>
                        {status === 'completed' ? 'Hoàn thành' :
                         status === 'in-progress' ? 'Đang học' :
                         'Chưa bắt đầu'}
                      </span>
                      <span className="text-gray-500">
                        {completedInSection}/{section.total} bài học
                      </span>
                    </div>
                  </div>

                  {/* Expand Icon */}
                  <div className="flex-shrink-0">
                    {isExpanded ? (
                      <ChevronUp className="w-6 h-6 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-6 h-6 text-gray-400" />
                    )}
                  </div>
                </button>

                {/* Lessons List */}
                {isExpanded && (
                  <div className="border-t border-gray-200 bg-gray-50 p-4">
                    <div className="space-y-2">
                      {section.lessons.map((lesson) => {
                        const isCompleted = completedLessons.has(lesson.id);
                        const isLocked = !lesson.is_free && !user;

                        return (
                          <button
                            key={lesson.id}
                            onClick={() => !isLocked && handleLessonClick(lesson.id)}
                            disabled={isLocked}
                            className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                              isCompleted
                                ? 'bg-green-50 border-green-200 hover:border-green-300'
                                : isLocked
                                ? 'bg-gray-100 border-gray-200 cursor-not-allowed opacity-60'
                                : 'bg-white border-gray-200 hover:border-blue-300 hover:shadow-md'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              {/* Lesson Icon */}
                              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                                isCompleted ? 'bg-green-200' :
                                isLocked ? 'bg-gray-300' :
                                'bg-blue-100'
                              }`}>
                                {isCompleted ? (
                                  <CheckCircle className="w-5 h-5 text-green-600" />
                                ) : isLocked ? (
                                  <Lock className="w-4 h-4 text-gray-500" />
                                ) : (
                                  <PlayCircle className="w-5 h-5 text-blue-600" />
                                )}
                              </div>

                              {/* Lesson Info */}
                              <div className="flex-1">
                                <h4 className="font-semibold text-white mb-1">{lesson.title}</h4>
                                <div className="flex items-center gap-3 text-xs text-gray-300">
                                  <span className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {formatDuration(lesson.video_duration || 0)}
                                  </span>
                                  <span className="px-2 py-0.5 bg-gray-200 rounded-full">
                                    {lesson.lesson_type === 'video' ? '📹 Video' : '✏️ Bài tập'}
                                  </span>
                                  {lesson.is_free && (
                                    <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full font-semibold">
                                      Miễn phí
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
          </div>

          {/* Right: Resources */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 sticky top-6">
              <h3 className="text-lg font-bold text-white mb-4">📚 Tài liệu khóa học</h3>
              <div className="space-y-3">
                <a href="#" className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                  <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FileText className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white truncate">Giáo trình.pdf</p>
                    <p className="text-xs text-gray-300">2.5 MB</p>
                  </div>
                </a>

                <a href="#" className="flex items-center gap-3 p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
                  <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FileText className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white truncate">Bài tập.pdf</p>
                    <p className="text-xs text-gray-300">1.8 MB</p>
                  </div>
                </a>

                <a href="#" className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
                  <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FileText className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white truncate">Slide bài giảng.pdf</p>
                    <p className="text-xs text-gray-300">3.2 MB</p>
                  </div>
                </a>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <h4 className="text-sm font-bold text-white mb-3">📊 Thống kê</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-300">Tổng bài học:</span>
                    <span className="font-semibold">{sections.reduce((sum, s) => sum + s.total, 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Đã hoàn thành:</span>
                    <span className="font-semibold text-green-600">{completedLessons.size}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Còn lại:</span>
                    <span className="font-semibold text-orange-600">
                      {sections.reduce((sum, s) => sum + s.total, 0) - completedLessons.size}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'instructor' && (
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-8">
          <h2 className="text-2xl font-bold text-white mb-4">Giảng viên</h2>
          <div className="flex items-start gap-6">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-3xl font-bold">
              {course?.instructor_name?.charAt(0)}
            </div>
            <div>
              <h3 className="text-xl font-bold text-white mb-2">{course?.instructor_name}</h3>
              <p className="text-gray-300 mb-4">Chuyên gia lập trình với hơn 10 năm kinh nghiệm</p>
              <div className="flex gap-4 text-sm text-gray-300">
                <span>⭐ 4.8 đánh giá</span>
                <span>👥 {course?.student_count} học viên</span>
                <span>📚 5 khóa học</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'reviews' && (
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-8">
          <h2 className="text-2xl font-bold text-white mb-6">Đánh giá từ học viên</h2>
          <div className="text-center py-12 text-gray-500">
            <p>Chưa có đánh giá nào</p>
          </div>
        </div>
      )}

      {/* Lesson Modal */}
      {selectedLesson && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={() => setSelectedLesson(null)}>
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">{selectedLesson.title}</h2>
              <button onClick={() => setSelectedLesson(null)} className="p-2 hover:bg-gray-100 rounded-full">
                ✕
              </button>
            </div>

            <div className="p-8">
              {selectedLesson.lesson_type === 'video' && selectedLesson.video_url && (
                <div className="aspect-video bg-black rounded-xl mb-6 overflow-hidden">
                  <iframe
                    src={selectedLesson.video_url.replace('watch?v=', 'embed/')}
                    className="w-full h-full"
                    allowFullScreen
                    title={selectedLesson.title}
                  />
                </div>
              )}

              <div className="bg-gray-50 rounded-xl p-6 mb-6">
                <h3 className="text-xl font-bold text-white mb-3">Mô tả</h3>
                <p className="text-gray-300 leading-relaxed">{selectedLesson.description}</p>
              </div>

              {selectedLesson.content && (
                <div className="bg-blue-50 rounded-xl p-6 border-2 border-blue-200">
                  <h3 className="text-xl font-bold text-white mb-4">Nội dung bài học</h3>
                  {selectedLesson.content.theory && (
                    <div className="mb-4">
                      <h4 className="font-bold text-white mb-2">📚 Lý thuyết:</h4>
                      <ul className="list-disc list-inside space-y-1 text-gray-300">
                        {selectedLesson.content.theory.map((item: string, i: number) => (
                          <li key={i}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {selectedLesson.content.examples && (
                    <div className="mb-4">
                      <h4 className="font-bold text-white mb-2">💡 Ví dụ:</h4>
                      {selectedLesson.content.examples.map((example: string, i: number) => (
                        <pre key={i} className="bg-gray-900 text-green-400 p-4 rounded-lg mb-2 overflow-x-auto text-sm">
                          <code>{example}</code>
                        </pre>
                      ))}
                    </div>
                  )}
                  {selectedLesson.content.keyPoints && (
                    <div>
                      <h4 className="font-bold text-white mb-2">⭐ Điểm quan trọng:</h4>
                      <ul className="list-disc list-inside space-y-1 text-gray-300">
                        {selectedLesson.content.keyPoints.map((point: string, i: number) => (
                          <li key={i}>{point}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              <div className="flex gap-4 mt-6">
                <button className="flex-1 px-6 py-3 bg-gray-200 text-gray-300 rounded-xl font-bold hover:bg-gray-300">
                  ← Bài trước
                </button>
                <button className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold hover:shadow-lg">
                  Bài tiếp theo →
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

