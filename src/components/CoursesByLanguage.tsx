import { useState, useEffect } from 'react';
import { Code2, Users, Clock, Star, Play } from 'lucide-react';
import { supabase } from '../lib/supabase';

type Language = {
  id: string;
  name: string;
  slug: string;
  icon: string;
  description: string;
  color: string;
  difficulty: string;
};

type Course = {
  id: string;
  title: string;
  description: string;
  price_coins: number;
  instructor_name: string;
  duration_hours: number;
  video_count: number;
  student_count: number;
  rating: number;
  language_id: string;
};

type CoursesByLanguageProps = {
  onCourseSelect: (courseId: string) => void;
};

export const CoursesByLanguage = ({ onCourseSelect }: CoursesByLanguageProps) => {
  const [languages, setLanguages] = useState<Language[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedLanguage, setSelectedLanguage] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLanguages();
  }, []);

  useEffect(() => {
    if (selectedLanguage) {
      fetchCourses(selectedLanguage);
    }
  }, [selectedLanguage]);

  const fetchLanguages = async () => {
    try {
      const { data, error } = await supabase
        .from('programming_languages')
        .select('*')
        .order('name');

      if (error) throw error;
      if (data && data.length > 0) {
        setLanguages(data);
        setSelectedLanguage(data[0].id);
      }
    } catch (error) {
      console.error('Error fetching languages:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCourses = async (languageId: string) => {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('language_id', languageId)
        .eq('is_published', true)
        .order('title');

      if (error) throw error;
      if (data) setCourses(data);
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  const difficultyColors = {
    beginner: 'bg-green-100 text-green-700 border-green-300',
    intermediate: 'bg-yellow-100 text-yellow-700 border-yellow-300',
    advanced: 'bg-red-100 text-red-700 border-red-300',
  };

  const difficultyLabels = {
    beginner: 'Cơ bản',
    intermediate: 'Trung bình',
    advanced: 'Nâng cao',
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-black text-white mb-4">
          Khóa Học Lập Trình
        </h1>
        <p className="text-xl text-gray-300">
          Chọn ngôn ngữ bạn muốn học và bắt đầu hành trình của mình
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {languages.map((lang) => (
          <button
            key={lang.id}
            onClick={() => setSelectedLanguage(lang.id)}
            className={`p-6 rounded-2xl border-4 transition-all hover:scale-105 ${
              selectedLanguage === lang.id
                ? 'border-yellow-400 bg-gray-700/80 backdrop-blur-md shadow-xl'
                : 'border-gray-600 bg-gray-800/60 backdrop-blur-md shadow-lg hover:border-yellow-400/50'
            }`}
          >
            <div className="text-center">
              <div
                className="w-16 h-16 mx-auto mb-3 rounded-2xl flex items-center justify-center text-white font-bold text-2xl"
                style={{ backgroundColor: lang.color }}
              >
                {lang.name[0]}
              </div>
              <h3 className="font-bold text-white mb-1">{lang.name}</h3>
              <span
                className={`text-xs px-2 py-1 rounded-full border-2 ${
                  difficultyColors[lang.difficulty as keyof typeof difficultyColors]
                }`}
              >
                {difficultyLabels[lang.difficulty as keyof typeof difficultyLabels]}
              </span>
            </div>
          </button>
        ))}
      </div>

      {courses.length === 0 ? (
        <div className="text-center py-12 bg-gray-800/60 backdrop-blur-md rounded-3xl border border-gray-700">
          <Code2 className="w-16 h-16 text-gray-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">
            Chưa có khóa học
          </h3>
          <p className="text-gray-400">
            Các khóa học cho ngôn ngữ này đang được cập nhật
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <div
              key={course.id}
              className="bg-gray-800/70 backdrop-blur-lg rounded-3xl shadow-lg hover:shadow-2xl transition-all overflow-hidden border-2 border-gray-700 hover:border-yellow-400 group cursor-pointer"
              onClick={() => onCourseSelect(course.id)}
            >
              <div className="relative h-48 bg-gradient-to-br from-blue-500 via-purple-600 to-pink-500 flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-black opacity-20"></div>
                <Play className="w-20 h-20 text-white relative z-10 opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all" />
                <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-white text-sm font-bold">
                  {course.video_count} videos
                </div>
              </div>

              <div className="p-6">
                <h3 className="text-xl font-bold text-white mb-2 line-clamp-2 group-hover:text-yellow-400 transition-colors">
                  {course.title}
                </h3>

                <p className="text-gray-300 text-sm mb-4 line-clamp-2">
                  {course.description}
                </p>

                <div className="flex items-center gap-2 text-sm text-gray-300 mb-3">
                  <Users className="w-4 h-4" />
                  <span>{course.instructor_name}</span>
                </div>

                <div className="flex items-center gap-4 text-sm text-gray-400 mb-4">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{course.duration_hours}h</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    <span>{course.student_count}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span>{course.rating}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-700">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center">
                      <Code2 className="w-4 h-4 text-gray-900" />
                    </div>
                    <span className="text-2xl font-black text-white">
                      {course.price_coins}
                    </span>
                    <span className="text-sm text-gray-400">xu</span>
                  </div>
                  <button className="px-6 py-2 bg-yellow-400 hover:bg-yellow-500 text-gray-900 rounded-xl font-bold hover:shadow-lg transition-all hover:scale-105">
                    Xem
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
