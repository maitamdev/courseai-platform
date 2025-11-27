import { useEffect, useState } from 'react';
import { Play, CheckCircle, Lock, Book, Code2, Award, ChevronDown, ChevronUp, ChevronRight } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

type Course = {
  id: string;
  title: string;
  description: string;
  instructor_name: string;
  duration_hours: number;
};

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
  order_index: number;
  is_free: boolean;
};

type RoadmapProps = {
  onCourseSelect?: (courseId: string) => void;
};

export const Roadmap = ({ onCourseSelect }: RoadmapProps) => {
  const { user } = useAuth();
  const [purchasedCourses, setPurchasedCourses] = useState<Course[]>([]);
  const [sections, setSections] = useState<{ [courseId: string]: Section[] }>({});
  const [lessons, setLessons] = useState<{ [sectionId: string]: Lesson[] }>({});
  const [expandedCourses, setExpandedCourses] = useState<Set<string>>(new Set());
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPurchasedCourses();
  }, [user]);

  const fetchPurchasedCourses = async () => {
    if (!user) return;

    try {
      const { data: purchased, error: purchasedError } = await supabase
        .from('purchased_courses')
        .select('course_id')
        .eq('user_id', user.id);

      if (purchasedError) throw purchasedError;

      if (purchased && purchased.length > 0) {
        const courseIds = purchased.map((p) => p.course_id);
        const { data: courses, error: coursesError } = await supabase
          .from('courses')
          .select('id, title, description, instructor_name, duration_hours')
          .in('id', courseIds);

        if (coursesError) throw coursesError;
        if (courses) {
          setPurchasedCourses(courses);
          courses.forEach((course) => fetchCourseSections(course.id));
        }
      }
    } catch (error) {
      console.error('Error fetching purchased courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCourseSections = async (courseId: string) => {
    try {
      const { data, error } = await supabase
        .from('course_sections')
        .select('*')
        .eq('course_id', courseId)
        .order('order_index');

      if (error) throw error;
      if (data) {
        setSections((prev) => ({ ...prev, [courseId]: data }));
        data.forEach((section) => fetchSectionLessons(section.id));
      }
    } catch (error) {
      console.error('Error fetching sections:', error);
    }
  };

  const fetchSectionLessons = async (sectionId: string) => {
    try {
      const { data, error } = await supabase
        .from('course_lessons')
        .select('*')
        .eq('section_id', sectionId)
        .order('order_index');

      if (error) throw error;
      if (data) {
        setLessons((prev) => ({ ...prev, [sectionId]: data }));
      }
    } catch (error) {
      console.error('Error fetching lessons:', error);
    }
  };

  const toggleCourse = (courseId: string) => {
    const newExpanded = new Set(expandedCourses);
    if (newExpanded.has(courseId)) {
      newExpanded.delete(courseId);
    } else {
      newExpanded.add(courseId);
    }
    setExpandedCourses(newExpanded);
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
        return <Play className="w-5 h-5 text-red-600" />;
      case 'article':
        return <Book className="w-5 h-5 text-blue-600" />;
      case 'exercise':
        return <Code2 className="w-5 h-5 text-green-600" />;
      case 'quiz':
        return <Award className="w-5 h-5 text-purple-600" />;
      default:
        return <Book className="w-5 h-5 text-gray-300" />;
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
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (purchasedCourses.length === 0) {
    return (
      <div className="text-center py-20">
        <Lock className="w-20 h-20 text-gray-400 mx-auto mb-6" />
        <h2 className="text-3xl font-bold text-white mb-4">Chưa có khóa học</h2>
        <p className="text-xl text-gray-300 mb-8">
          Bạn chưa mua khóa học nào. Hãy mua khóa học để bắt đầu học tập!
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-black text-white mb-4">Lộ Trình Học Của Bạn</h1>
        <p className="text-xl text-gray-300">
          Các khóa học bạn đã mua - bắt đầu học ngay!
        </p>
      </div>

      <div className="grid gap-4">
        {purchasedCourses.map((course) => {
          const isExpanded = expandedCourses.has(course.id);
          const courseSections = sections[course.id] || [];

          return (
            <div key={course.id} className="bg-gray-800/80 backdrop-blur-lg rounded-xl shadow-xl border border-gray-700 overflow-hidden hover:border-yellow-400 transition-all">
              <button
                onClick={() => onCourseSelect?.(course.id)}
                className="w-full p-5 text-left hover:bg-gray-700/50 transition-colors group flex items-center gap-4"
              >
                {/* Icon */}
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Book className="w-8 h-8 text-white" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <h2 className="text-xl font-bold text-white mb-1 group-hover:text-yellow-400 transition-colors truncate">{course.title}</h2>
                  <p className="text-sm text-gray-400 mb-2 line-clamp-1">{course.description}</p>
                  <div className="flex gap-4 text-xs text-gray-400">
                    <div className="flex items-center gap-1">
                      <Award className="w-3 h-3" />
                      <span>{course.instructor_name}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Play className="w-3 h-3" />
                      <span>{course.duration_hours}h</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Book className="w-3 h-3" />
                      <span>{courseSections.length} chương</span>
                    </div>
                  </div>
                </div>

                {/* Button */}
                <div className="px-5 py-2.5 bg-yellow-400 text-gray-900 rounded-lg font-bold group-hover:bg-yellow-500 transition-colors flex items-center gap-2 flex-shrink-0">
                  Xem lộ trình
                  <ChevronRight className="w-4 h-4" />
                </div>
              </button>
            </div>
          );
        })}
      </div>

      {selectedLesson && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">{selectedLesson.title}</h2>
              <button
                onClick={() => setSelectedLesson(null)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="p-8">
              {selectedLesson.lesson_type === 'video' && selectedLesson.video_url && (
                <div className="aspect-video bg-black rounded-2xl mb-6 overflow-hidden">
                  <iframe
                    src={selectedLesson.video_url.replace('watch?v=', 'embed/')}
                    className="w-full h-full"
                    allowFullScreen
                    title={selectedLesson.title}
                  />
                </div>
              )}

              <div className="bg-gray-50 rounded-2xl p-6 mb-6">
                <h3 className="text-xl font-bold text-white mb-3">Mô tả</h3>
                <p className="text-gray-300 leading-relaxed">{selectedLesson.description}</p>
              </div>

              {selectedLesson.lesson_type === 'exercise' && (
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border-2 border-green-200">
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <Code2 className="w-6 h-6 text-green-600" />
                    Bài tập thực hành
                  </h3>
                  <div className="bg-white rounded-xl p-4 mb-4 font-mono text-sm">
                    <code className="text-white">
                      // Viết code của bạn ở đây<br />
                      function solve() {'{'}<br />
                      &nbsp;&nbsp;// Your solution<br />
                      {'}'}
                    </code>
                  </div>
                  <button className="px-6 py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-all">
                    Chạy code
                  </button>
                </div>
              )}

              {selectedLesson.lesson_type === 'quiz' && (
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border-2 border-purple-200">
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <Award className="w-6 h-6 text-purple-600" />
                    Quiz kiểm tra
                  </h3>
                  <p className="text-gray-300 mb-4">Hoàn thành quiz để tiếp tục!</p>
                  <button className="px-6 py-3 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 transition-all">
                    Bắt đầu quiz
                  </button>
                </div>
              )}

              <div className="flex gap-4 mt-6">
                <button className="flex-1 px-6 py-3 bg-gray-200 text-gray-300 rounded-xl font-bold hover:bg-gray-300 transition-all">
                  Bài trước
                </button>
                <button className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold hover:shadow-lg transition-all">
                  Bài tiếp theo
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

