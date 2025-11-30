import { useState, useEffect } from 'react';
import { Code2, Users, ChevronLeft, ChevronRight, Zap, Trophy, Target, Sparkles, BookOpen, Rocket, Star, CheckCircle2 } from 'lucide-react';
import { ScrollReveal } from './ScrollReveal';
import { supabase } from '../lib/supabase';
import { useLanguage } from '../contexts/LanguageContext';

type Course = {
  id: string;
  title: string;
  description: string;
  language: string;
  difficulty: string;
  price_coins: number;
  lessons_count?: number;
};

type HomePageProps = {
  onGetStarted: () => void;
  onViewCourse?: (courseId: string) => void;
};

export const HomePage = ({ onGetStarted, onViewCourse }: HomePageProps) => {
  const { t } = useLanguage();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [popularCourses, setPopularCourses] = useState<Course[]>([]);

  const slides = t('nav.home') === 'Home' ? [
    {
      title: 'Leading Online Programming Learning Platform',
      description: 'Develop professional programming skills with modern learning methods. Courses are systematically designed, combining theory and practice for optimal learning efficiency.',
    },
    {
      title: 'High Quality Courses From Experts',
      description: 'Over 50+ courses from basic to advanced in JavaScript, Python, C++, React and many other technologies. Content is compiled by experienced programmers in the industry.',
    },
    {
      title: 'Practice With Integrated Development Environment',
      description: 'Professional code editor built-in, supporting multiple programming languages. Write code, compile and see results instantly without installing software.',
    },
  ] : [
    {
      title: 'Nền Tảng Học Lập Trình Trực Tuyến Hàng Đầu',
      description: 'Phát triển kỹ năng lập trình chuyên nghiệp với phương pháp học tập hiện đại. Khóa học được thiết kế bài bản, kết hợp lý thuyết và thực hành để tối ưu hiệu quả học tập.',
    },
    {
      title: 'Khóa Học Chất Lượng Cao Từ Chuyên Gia',
      description: 'Hơn 50+ khóa học từ cơ bản đến nâng cao về JavaScript, Python, C++, React và nhiều công nghệ khác. Nội dung được biên soạn bởi các lập trình viên giàu kinh nghiệm trong ngành.',
    },
    {
      title: 'Thực Hành Với Môi Trường Lập Trình Tích Hợp',
      description: 'Code editor chuyên nghiệp tích hợp sẵn, hỗ trợ nhiều ngôn ngữ lập trình. Viết code, biên dịch và xem kết quả ngay lập tức mà không cần cài đặt phần mềm.',
    },
  ];



  const changeSlide = (newIndex: number) => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentSlide(newIndex);
      setIsTransitioning(false);
    }, 300);
  };

  const nextSlide = () => {
    changeSlide((currentSlide + 1) % slides.length);
  };

  const prevSlide = () => {
    changeSlide((currentSlide - 1 + slides.length) % slides.length);
  };

  // Auto-slide every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      changeSlide((currentSlide + 1) % slides.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [currentSlide, slides.length]);

  // Fetch popular courses from database
  useEffect(() => {
    const fetchPopularCourses = async () => {
      const { data } = await supabase
        .from('courses')
        .select('id, title, description, language, difficulty, price_coins')
        .order('created_at', { ascending: false })
        .limit(3);
      
      if (data) {
        setPopularCourses(data);
      }
    };
    fetchPopularCourses();
  }, []);

  return (
    <div className="w-full">
      {/* Hero Section with Slider */}
      <section 
        className="relative w-full"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=1920&q=80)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900/90 via-gray-900/85 to-gray-900/90"></div>
        
        <div className="max-w-7xl mx-auto px-4 py-16 sm:py-24 md:py-32 lg:py-40 min-h-[60vh] sm:min-h-[70vh] md:min-h-[85vh] flex flex-col justify-center relative">
          {/* Slider Navigation - Hidden on mobile */}
          <button
            onClick={prevSlide}
            className="hidden sm:flex absolute left-2 sm:left-4 md:left-8 top-1/2 -translate-y-1/2 z-10 w-10 h-10 sm:w-12 sm:h-12 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full items-center justify-center transition-all border border-white/20"
          >
            <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </button>

          <button
            onClick={nextSlide}
            className="hidden sm:flex absolute right-2 sm:right-4 md:right-8 top-1/2 -translate-y-1/2 z-10 w-10 h-10 sm:w-12 sm:h-12 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full items-center justify-center transition-all border border-white/20"
          >
            <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </button>

          {/* Slide Content */}
          <div className="text-center text-white max-w-4xl mx-auto px-2">
            <h1 
              className={`text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-black mb-4 sm:mb-6 leading-tight transition-all duration-500 ${
                isTransitioning ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'
              }`}
            >
              {slides[currentSlide].title}
            </h1>
            <p 
              className={`text-sm sm:text-base md:text-lg lg:text-xl text-white/80 mb-6 sm:mb-8 md:mb-10 leading-relaxed max-w-3xl mx-auto transition-all duration-500 delay-100 ${
                isTransitioning ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'
              }`}
            >
              {slides[currentSlide].description}
            </p>
            <button
              onClick={onGetStarted}
              className={`px-6 sm:px-8 md:px-10 py-3 sm:py-4 bg-gradient-to-r from-emerald-400 to-emerald-500 hover:from-emerald-500 hover:to-emerald-600 text-white rounded-lg font-bold text-sm sm:text-base md:text-lg transition-all hover:scale-105 shadow-xl hover:shadow-2xl delay-200 ${
                isTransitioning ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'
              }`}
            >
              {t('nav.home') === 'Home' ? 'START LEARNING' : 'BẮT ĐẦU KHÓA HỌC'}
            </button>
          </div>

          {/* Slide Indicators */}
          <div className="flex justify-center gap-2 mt-8 sm:mt-12">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => changeSlide(index)}
                className={`h-2 sm:h-3 rounded-full transition-all duration-500 ${
                  index === currentSlide ? 'bg-emerald-400 w-6 sm:w-8' : 'bg-white/30 hover:bg-white/50 w-2 sm:w-3'
                }`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Features Section - Enhanced */}
      <section className="relative bg-gray-900/70 backdrop-blur-lg w-full py-12 sm:py-16 md:py-24 overflow-hidden">
        {/* Decorative elements - Hidden on mobile for performance */}
        <div className="hidden sm:block absolute top-0 left-0 w-48 sm:w-72 md:w-96 h-48 sm:h-72 md:h-96 bg-emerald-400/10 rounded-full blur-3xl"></div>
        <div className="hidden sm:block absolute bottom-0 right-0 w-48 sm:w-72 md:w-96 h-48 sm:h-72 md:h-96 bg-blue-400/10 rounded-full blur-3xl"></div>
        
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="text-center mb-8 sm:mb-12 md:mb-16">
            <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-emerald-400/20 rounded-full mb-3 sm:mb-4">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" />
              <span className="text-emerald-400 font-bold text-xs sm:text-sm">{t('nav.home') === 'Home' ? 'Why Choose CodeMind AI?' : 'Tại Sao Chọn CodeMind AI?'}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-white mb-3 sm:mb-4">
              {t('nav.home') === 'Home' ? 'Learn Programming More Effectively' : 'Học Lập Trình Hiệu Quả Hơn'}
            </h2>
            <p className="text-sm sm:text-base md:text-lg lg:text-xl text-white/70 max-w-2xl mx-auto px-2">
              {t('nav.home') === 'Home' ? 'Platform designed to optimize your learning experience' : 'Nền tảng được thiết kế để tối ưu hóa trải nghiệm học tập của bạn'}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
            {(t('nav.home') === 'Home' ? [
              {
                icon: Zap,
                title: 'Fast Learning',
                description: 'Optimized learning methods help you absorb knowledge 3x faster.',
                color: 'from-emerald-400 to-green-500'
              },
              {
                icon: Target,
                title: 'Clear Roadmap',
                description: 'Each step is designed in detail, helping you go from basic to advanced.',
                color: 'from-blue-400 to-cyan-500'
              },
              {
                icon: Trophy,
                title: 'Prestigious Certificate',
                description: 'Receive recognized certificates upon course completion.',
                color: 'from-purple-400 to-pink-500'
              }
            ] : [
              {
                icon: Zap,
                title: 'Học Tập Nhanh Chóng',
                description: 'Phương pháp học tập được tối ưu giúp bạn tiếp thu kiến thức nhanh gấp 3 lần.',
                color: 'from-emerald-400 to-green-500'
              },
              {
                icon: Target,
                title: 'Lộ Trình Rõ Ràng',
                description: 'Từng bước được thiết kế chi tiết, giúp bạn đi đúng hướng từ cơ bản đến nâng cao.',
                color: 'from-blue-400 to-cyan-500'
              },
              {
                icon: Trophy,
                title: 'Chứng Chỉ Uy Tín',
                description: 'Nhận chứng chỉ được công nhận sau khi hoàn thành khóa học.',
                color: 'from-purple-400 to-pink-500'
              }
            ]).map((feature, index) => {
              const Icon = feature.icon;
              return (
                <ScrollReveal key={index}>
                <div
                  className="group relative bg-gray-800/50 backdrop-blur-sm rounded-xl sm:rounded-2xl p-5 sm:p-6 md:p-8 border border-gray-700 hover:border-emerald-400 transition-all duration-300 hover:scale-[1.02] sm:hover:scale-105"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/5 to-transparent rounded-xl sm:rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  
                  <div className={`w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-gradient-to-br ${feature.color} rounded-lg sm:rounded-xl flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform shadow-lg`}>
                    <Icon className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-white" />
                  </div>
                  
                  <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-2 sm:mb-3 group-hover:text-emerald-400 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-sm sm:text-base text-white/70 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
                </ScrollReveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* Stats Section - Enhanced */}
      <section className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 w-full py-12 sm:py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
            {(t('nav.home') === 'Home' ? [
              { number: '10K+', label: 'Students', icon: Users, color: 'from-blue-500 to-cyan-500' },
              { number: '50+', label: 'Courses', icon: BookOpen, color: 'from-purple-500 to-pink-500' },
              { number: '100+', label: 'Lessons', icon: Rocket, color: 'from-green-500 to-emerald-500' },
              { number: '4.9★', label: 'Rating', icon: Star, color: 'from-emerald-400 to-green-500' }
            ] : [
              { number: '10K+', label: 'Học viên', icon: Users, color: 'from-blue-500 to-cyan-500' },
              { number: '50+', label: 'Khóa học', icon: BookOpen, color: 'from-purple-500 to-pink-500' },
              { number: '100+', label: 'Bài học', icon: Rocket, color: 'from-green-500 to-emerald-500' },
              { number: '4.9★', label: 'Đánh giá', icon: Star, color: 'from-emerald-400 to-green-500' }
            ]).map((stat, index) => {
              const Icon = stat.icon;
              return (
                <ScrollReveal key={index}>
                  <div className="text-center group">
                    <div className="relative inline-block mb-2 sm:mb-4">
                      <div className={`hidden sm:block absolute inset-0 bg-gradient-to-br ${stat.color} blur-xl opacity-50 group-hover:opacity-75 transition-opacity`}></div>
                      <div className={`relative w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 bg-gradient-to-br ${stat.color} rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto transform group-hover:scale-110 transition-all duration-300 shadow-lg sm:shadow-2xl`}>
                        <Icon className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 text-white" />
                      </div>
                    </div>
                    <div className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-black mb-1 sm:mb-2 bg-gradient-to-r from-emerald-400 to-emerald-500 bg-clip-text text-transparent">
                      {stat.number}
                    </div>
                    <div className="text-xs sm:text-sm md:text-lg text-white/80 font-medium">{stat.label}</div>
                  </div>
                </ScrollReveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* Popular Courses Section - Enhanced */}
      <section className="relative bg-gray-900/70 backdrop-blur-lg w-full py-12 sm:py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-8 sm:mb-12 md:mb-16">
            <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-blue-400/20 rounded-full mb-3 sm:mb-4">
              <Rocket className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />
              <span className="text-blue-400 font-bold text-xs sm:text-sm">{t('nav.home') === 'Home' ? 'Featured Courses' : 'Khóa Học Nổi Bật'}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-white mb-3 sm:mb-4">
              {t('nav.home') === 'Home' ? 'Most Popular Courses' : 'Khóa Học Được Yêu Thích Nhất'}
            </h2>
            <p className="text-sm sm:text-base md:text-lg lg:text-xl text-white/70 max-w-2xl mx-auto px-2">
              {t('nav.home') === 'Home' ? 'Trusted and highly rated by thousands of students' : 'Được hàng ngàn học viên tin tưởng và đánh giá cao'}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
            {popularCourses.map((course, index) => {
              // Ảnh thumbnail đa dạng cho mỗi khóa học
              const allImages = [
                'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=400&q=80', // Python/Code
                'https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=400&q=80', // JavaScript
                'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&q=80', // React
                'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=400&q=80', // Database
                'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400&q=80', // Laptop code
                'https://images.unsplash.com/photo-1621839673705-6617adf9e890?w=400&q=80', // HTML
                'https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?w=400&q=80', // Git
                'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&q=80', // AI
                'https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=400&q=80', // Dark code
                'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&q=80', // Code screen
                'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&q=80', // Monitor code
                'https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=400&q=80', // Debug
              ];
              
              // Mỗi khóa học lấy ảnh khác nhau dựa trên index
              const getImage = () => allImages[index % allImages.length];

              const levelMap: Record<string, string> = t('nav.home') === 'Home' ? {
                'beginner': 'Beginner',
                'intermediate': 'Intermediate',
                'advanced': 'Advanced'
              } : {
                'beginner': 'Cơ bản',
                'intermediate': 'Trung cấp',
                'advanced': 'Nâng cao'
              };
              
              return (
                <div
                  key={course.id}
                  className="group relative bg-gray-800/50 backdrop-blur-sm rounded-xl sm:rounded-2xl overflow-hidden border border-gray-700 hover:border-emerald-400 transition-all duration-300 hover:scale-[1.02] sm:hover:scale-105 cursor-pointer"
                  onClick={() => onViewCourse?.(course.id)}
                >
                  {/* Course Image */}
                  <div className="relative h-32 sm:h-40 md:h-48 overflow-hidden">
                    <img 
                      src={getImage()} 
                      alt={course.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-transparent to-transparent"></div>
                    <div className="absolute top-2 sm:top-4 right-2 sm:right-4 z-10">
                      <div className="px-2 sm:px-3 py-0.5 sm:py-1 bg-white/20 backdrop-blur-sm rounded-full text-white text-[10px] sm:text-xs font-bold border border-white/30">
                        {levelMap[course.difficulty] || course.difficulty}
                      </div>
                    </div>
                    <div className="absolute bottom-2 sm:bottom-4 left-2 sm:left-4 z-10">
                      <div className="px-2 sm:px-3 py-0.5 sm:py-1 bg-emerald-500/90 backdrop-blur-sm rounded-full text-white text-[10px] sm:text-xs font-bold">
                        {course.language}
                      </div>
                    </div>
                  </div>

                  {/* Course Content */}
                  <div className="p-4 sm:p-5 md:p-6">
                    <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-2 sm:mb-3 group-hover:text-emerald-400 transition-colors line-clamp-1">
                      {course.title}
                    </h3>
                    
                    <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm text-white/60 mb-3 sm:mb-4">
                      <div className="flex items-center gap-1">
                        <BookOpen className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span>{t('nav.home') === 'Home' ? 'Course' : 'Khóa học'}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-emerald-400 font-bold">{course.price_coins} {t('nav.home') === 'Home' ? 'coins' : 'xu'}</span>
                      </div>
                    </div>

                    <p className="text-white/70 text-xs sm:text-sm mb-4 sm:mb-6 line-clamp-2">
                      {course.description}
                    </p>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onViewCourse?.(course.id);
                      }}
                      className="w-full py-2.5 sm:py-3 bg-gradient-to-r from-emerald-400 to-emerald-500 hover:from-emerald-500 hover:to-emerald-600 text-white font-bold text-sm sm:text-base rounded-lg sm:rounded-xl transition-all hover:shadow-lg"
                    >
                      {t('nav.home') === 'Home' ? 'View Details' : 'Xem Chi Tiết'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="relative bg-gray-800/60 backdrop-blur-md w-full py-12 sm:py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-8 sm:mb-12 md:mb-16">
            <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-purple-400/20 rounded-full mb-3 sm:mb-4">
              <Star className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400" />
              <span className="text-purple-400 font-bold text-xs sm:text-sm">{t('nav.home') === 'Home' ? 'What Students Say' : 'Học Viên Nói Gì'}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-white mb-3 sm:mb-4">
              {t('nav.home') === 'Home' ? 'Success Stories' : 'Câu Chuyện Thành Công'}
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
            {(t('nav.home') === 'Home' ? [
              {
                name: 'John Smith',
                role: 'Frontend Developer',
                avatar: '👨‍💻',
                rating: 5,
                comment: 'The React course helped me land my dream job. Very practical and easy to understand!'
              },
              {
                name: 'Sarah Johnson',
                role: 'Data Scientist',
                avatar: '👩‍💼',
                rating: 5,
                comment: 'Python for AI is the best course I\'ve ever taken. The instructor is very enthusiastic!'
              },
              {
                name: 'Mike Williams',
                role: 'Full Stack Developer',
                avatar: '👨‍🎓',
                rating: 5,
                comment: 'From zero to hero in just 6 months. CodeMind AI truly changed my life!'
              }
            ] : [
              {
                name: 'Nguyễn Văn A',
                role: 'Frontend Developer',
                avatar: '👨‍💻',
                rating: 5,
                comment: 'Khóa học React giúp tôi có được công việc mơ ước. Nội dung rất thực tế và dễ hiểu!'
              },
              {
                name: 'Trần Thị B',
                role: 'Data Scientist',
                avatar: '👩‍💼',
                rating: 5,
                comment: 'Python cho AI là khóa học tuyệt vời nhất tôi từng học. Giảng viên rất nhiệt tình!'
              },
              {
                name: 'Lê Văn C',
                role: 'Full Stack Developer',
                avatar: '👨‍🎓',
                rating: 5,
                comment: 'Từ zero đến hero chỉ trong 6 tháng. CodeMind AI thực sự thay đổi cuộc đời tôi!'
              }
            ]).map((testimonial, index) => (
              <div key={index} className="bg-gray-700/50 backdrop-blur-sm rounded-xl sm:rounded-2xl p-5 sm:p-6 md:p-8 border border-gray-600 hover:border-emerald-400 transition-all hover:scale-[1.02] sm:hover:scale-105">
                <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
                  <div className="text-3xl sm:text-4xl md:text-5xl">{testimonial.avatar}</div>
                  <div>
                    <h4 className="text-base sm:text-lg font-bold text-white">{testimonial.name}</h4>
                    <p className="text-xs sm:text-sm text-white/60">{testimonial.role}</p>
                  </div>
                </div>
                <div className="flex gap-0.5 sm:gap-1 mb-3 sm:mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 sm:w-5 sm:h-5 fill-emerald-400 text-emerald-400" />
                  ))}
                </div>
                <p className="text-sm sm:text-base text-white/80 leading-relaxed italic">"{testimonial.comment}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section - Enhanced */}
      <section className="relative bg-gradient-to-br from-emerald-400/80 via-emerald-500/80 to-green-500/80 backdrop-blur-sm w-full py-12 sm:py-16 md:py-24 overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-white/20 backdrop-blur-sm rounded-full mb-4 sm:mb-6">
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            <span className="text-white font-bold text-xs sm:text-sm">{t('nav.home') === 'Home' ? 'Special Offer' : 'Ưu Đãi Đặc Biệt'}</span>
          </div>
          
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-6xl font-black text-white mb-4 sm:mb-6 leading-tight">
            {t('nav.home') === 'Home' ? 'Start Your Programming Journey' : 'Bắt Đầu Hành Trình'}<br />{t('nav.home') === 'Home' ? 'Today' : 'Lập Trình Của Bạn'}
          </h2>
          
          <p className="text-sm sm:text-base md:text-xl lg:text-2xl text-white/90 mb-6 sm:mb-8 md:mb-10 max-w-2xl mx-auto leading-relaxed px-2">
            {t('nav.home') === 'Home' ? (
              <>Join <span className="font-bold">10,000+ students</span> learning programming effectively every day</>
            ) : (
              <>Tham gia cùng <span className="font-bold">10,000+ học viên</span> đang học lập trình hiệu quả mỗi ngày</>
            )}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center">
            <button
              onClick={onGetStarted}
              className="group w-full sm:w-auto px-6 sm:px-8 md:px-10 py-3 sm:py-4 md:py-5 bg-gray-900 hover:bg-gray-800 text-white rounded-lg sm:rounded-xl font-bold text-sm sm:text-base md:text-lg transition-all hover:scale-105 shadow-2xl flex items-center justify-center gap-2 sm:gap-3"
            >
              <span>{t('nav.home') === 'Home' ? 'SIGN UP NOW' : 'ĐĂNG KÝ NGAY'}</span>
              <Rocket className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={onGetStarted}
              className="w-full sm:w-auto px-6 sm:px-8 md:px-10 py-3 sm:py-4 md:py-5 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white rounded-lg sm:rounded-xl font-bold text-sm sm:text-base md:text-lg transition-all border-2 border-white/30 hover:border-white/50"
            >
              {t('nav.home') === 'Home' ? 'View Demo' : 'Xem Demo'}
            </button>
          </div>

          <div className="mt-8 sm:mt-10 md:mt-12 flex flex-col sm:flex-row flex-wrap justify-center gap-3 sm:gap-6 md:gap-8 text-white/90">
            <div className="flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="font-medium text-sm sm:text-base">{t('nav.home') === 'Home' ? '7 days free trial' : 'Miễn phí 7 ngày'}</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="font-medium text-sm sm:text-base">{t('nav.home') === 'Home' ? 'No credit card required' : 'Không cần thẻ tín dụng'}</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="font-medium text-sm sm:text-base">{t('nav.home') === 'Home' ? 'Cancel anytime' : 'Hủy bất cứ lúc nào'}</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

