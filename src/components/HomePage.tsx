import { useState, useEffect } from 'react';
import { Code2, Users, Library, GraduationCap, ChevronLeft, ChevronRight, Zap, Trophy, Target, Sparkles, BookOpen, Rocket, Star, CheckCircle2 } from 'lucide-react';

type HomePageProps = {
  onGetStarted: () => void;
};

export const HomePage = ({ onGetStarted }: HomePageProps) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const slides = [
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

  const features = [
    {
      icon: GraduationCap,
      title: 'Học Tập Linh Hoạt',
      description: 'Học mọi lúc mọi nơi với nội dung được tối ưu cho mọi thiết bị.',
    },
    {
      icon: Users,
      title: 'Giảng Viên Chuyên Nghiệp',
      description: 'Đội ngũ giảng viên giàu kinh nghiệm và tâm huyết với nghề.',
    },
    {
      icon: Library,
      title: 'Thư Viện Phong Phú',
      description: 'Hàng trăm tài liệu, bài tập và dự án thực tế để thực hành.',
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

  return (
    <div className="w-full">
      {/* Hero Section with Slider */}
      <section 
        className="relative w-full"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=1920&q=80)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed'
        }}
      >
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900/90 via-gray-900/85 to-gray-900/90"></div>
        
        <div className="max-w-7xl mx-auto px-4 py-32 relative">
          {/* Slider Navigation */}
          <button
            onClick={prevSlide}
            className="absolute left-8 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center transition-all border border-white/20"
          >
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>

          <button
            onClick={nextSlide}
            className="absolute right-8 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center transition-all border border-white/20"
          >
            <ChevronRight className="w-6 h-6 text-white" />
          </button>

          {/* Slide Content */}
          <div className="text-center text-white max-w-4xl mx-auto">
            <h1 
              className={`text-5xl md:text-6xl font-black mb-6 leading-tight transition-all duration-500 ${
                isTransitioning ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'
              }`}
            >
              {slides[currentSlide].title}
            </h1>
            <p 
              className={`text-xl text-white/80 mb-10 leading-relaxed max-w-3xl mx-auto transition-all duration-500 delay-100 ${
                isTransitioning ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'
              }`}
            >
              {slides[currentSlide].description}
            </p>
            <button
              onClick={onGetStarted}
              className={`px-10 py-4 bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-white rounded-lg font-bold text-lg transition-all hover:scale-105 shadow-xl hover:shadow-2xl delay-200 ${
                isTransitioning ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'
              }`}
            >
              BẮT ĐẦU KHÓA HỌC
            </button>
          </div>

          {/* Slide Indicators */}
          <div className="flex justify-center gap-2 mt-12">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => changeSlide(index)}
                className={`h-3 rounded-full transition-all duration-500 ${
                  index === currentSlide ? 'bg-yellow-400 w-8' : 'bg-white/30 hover:bg-white/50 w-3'
                }`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Features Section - Enhanced */}
      <section className="relative bg-gray-900/70 backdrop-blur-lg w-full py-24 overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-yellow-400/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl"></div>
        
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-400/20 rounded-full mb-4">
              <Sparkles className="w-5 h-5 text-yellow-400" />
              <span className="text-yellow-400 font-bold text-sm">Tại Sao Chọn CodeMind AI?</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
              Học Lập Trình Hiệu Quả Hơn
            </h2>
            <p className="text-xl text-white/70 max-w-2xl mx-auto">
              Nền tảng được thiết kế để tối ưu hóa trải nghiệm học tập của bạn
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Zap,
                title: 'Học Tập Nhanh Chóng',
                description: 'Phương pháp học tập được tối ưu giúp bạn tiếp thu kiến thức nhanh gấp 3 lần.',
                color: 'from-yellow-400 to-orange-500'
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
            ].map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="group relative bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700 hover:border-yellow-400 transition-all duration-300 hover:scale-105 hover:shadow-2xl"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  
                  <div className={`w-16 h-16 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  
                  <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-yellow-400 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-white/70 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Stats Section - Enhanced */}
      <section className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 w-full py-24">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmYmJmMjQiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE2YzAtMi4yMSAxLjc5LTQgNC00czQgMS43OSA0IDQtMS43OSA0LTQgNC00LTEuNzktNC00em0wIDI0YzAtMi4yMSAxLjc5LTQgNC00czQgMS43OSA0IDQtMS43OSA0LTQgNC00LTEuNzktNC00ek0xMiAxNmMwLTIuMjEgMS43OS00IDQtNHM0IDEuNzkgNCA0LTEuNzkgNC00IDQtNC0xLjc5LTQtNHptMCAyNGMwLTIuMjEgMS43OS00IDQtNHM0IDEuNzkgNCA0LTEuNzkgNC00IDQtNC0xLjc5LTQtNHoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-30"></div>
        
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { number: '10K+', label: 'Học viên', icon: Users, color: 'from-blue-500 to-cyan-500' },
              { number: '50+', label: 'Khóa học', icon: BookOpen, color: 'from-purple-500 to-pink-500' },
              { number: '100+', label: 'Bài học', icon: Rocket, color: 'from-green-500 to-emerald-500' },
              { number: '4.9★', label: 'Đánh giá', icon: Star, color: 'from-yellow-400 to-orange-500' }
            ].map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="text-center group">
                  <div className="relative inline-block mb-4">
                    <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} blur-xl opacity-50 group-hover:opacity-75 transition-opacity`}></div>
                    <div className={`relative w-20 h-20 bg-gradient-to-br ${stat.color} rounded-2xl flex items-center justify-center mx-auto transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-2xl`}>
                      <Icon className="w-10 h-10 text-white" />
                    </div>
                  </div>
                  <div className="text-5xl md:text-6xl font-black mb-2 bg-gradient-to-r from-yellow-400 to-yellow-500 bg-clip-text text-transparent group-hover:scale-110 transition-transform inline-block">
                    {stat.number}
                  </div>
                  <div className="text-lg text-white/80 font-medium">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Popular Courses Section - Enhanced */}
      <section className="relative bg-gray-900/70 backdrop-blur-lg w-full py-24">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-400/20 rounded-full mb-4">
              <Rocket className="w-5 h-5 text-blue-400" />
              <span className="text-blue-400 font-bold text-sm">Khóa Học Nổi Bật</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
              Khóa Học Được Yêu Thích Nhất
            </h2>
            <p className="text-xl text-white/70 max-w-2xl mx-auto">
              Được hàng ngàn học viên tin tưởng và đánh giá cao
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { 
                title: 'JavaScript Cơ Bản', 
                lessons: '20 bài học', 
                students: '2.5K học viên',
                level: 'Beginner', 
                color: 'from-blue-500 to-blue-600',
                features: ['Syntax cơ bản', 'DOM Manipulation', 'ES6+ Features']
              },
              { 
                title: 'Python cho AI', 
                lessons: '25 bài học',
                students: '1.8K học viên', 
                level: 'Intermediate', 
                color: 'from-green-500 to-green-600',
                features: ['Machine Learning', 'Data Analysis', 'Neural Networks']
              },
              { 
                title: 'React.js Advanced', 
                lessons: '30 bài học',
                students: '3.2K học viên', 
                level: 'Advanced', 
                color: 'from-purple-500 to-purple-600',
                features: ['Hooks & Context', 'Performance', 'Best Practices']
              },
            ].map((course, index) => (
              <div
                key={index}
                className="group relative bg-gray-800/50 backdrop-blur-sm rounded-2xl overflow-hidden border border-gray-700 hover:border-yellow-400 transition-all duration-300 hover:scale-105 hover:shadow-2xl cursor-pointer"
              >
                {/* Course Image/Icon */}
                <div className={`relative h-48 bg-gradient-to-br ${course.color} flex items-center justify-center overflow-hidden`}>
                  <div className="absolute inset-0 bg-black/20"></div>
                  <Code2 className="w-20 h-20 text-white relative z-10 group-hover:scale-110 transition-transform" />
                  <div className="absolute top-4 right-4 z-10">
                    <div className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-white text-xs font-bold border border-white/30">
                      {course.level}
                    </div>
                  </div>
                </div>

                {/* Course Content */}
                <div className="p-6">
                  <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-yellow-400 transition-colors">
                    {course.title}
                  </h3>
                  
                  <div className="flex items-center gap-4 text-sm text-white/60 mb-4">
                    <div className="flex items-center gap-1">
                      <BookOpen className="w-4 h-4" />
                      <span>{course.lessons}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      <span>{course.students}</span>
                    </div>
                  </div>

                  <div className="space-y-2 mb-6">
                    {course.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-white/70 text-sm">
                        <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={onGetStarted}
                    className="w-full py-3 bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-white font-bold rounded-xl transition-all hover:shadow-lg"
                  >
                    Xem Chi Tiết
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="relative bg-gray-800/60 backdrop-blur-md w-full py-24">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-400/20 rounded-full mb-4">
              <Star className="w-5 h-5 text-purple-400" />
              <span className="text-purple-400 font-bold text-sm">Học Viên Nói Gì</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
              Câu Chuyện Thành Công
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
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
            ].map((testimonial, index) => (
              <div key={index} className="bg-gray-700/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-600 hover:border-yellow-400 transition-all hover:scale-105">
                <div className="flex items-center gap-4 mb-4">
                  <div className="text-5xl">{testimonial.avatar}</div>
                  <div>
                    <h4 className="text-lg font-bold text-white">{testimonial.name}</h4>
                    <p className="text-sm text-white/60">{testimonial.role}</p>
                  </div>
                </div>
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-white/80 leading-relaxed italic">"{testimonial.comment}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section - Enhanced */}
      <section className="relative bg-gradient-to-br from-yellow-400 via-yellow-500 to-orange-500 w-full py-24 overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yLjIxIDEuNzktNCA0LTRzNCAxLjc5IDQgNC0xLjc5IDQtNCA0LTQtMS43OS00LTR6bTAgMTJjMC0yLjIxIDEuNzktNCA0LTRzNCAxLjc5IDQgNC0xLjc5IDQtNCA0LTQtMS43OS00LTR6TTEyIDM0YzAtMi4yMSAxLjc5LTQgNC00czQgMS43OSA0IDQtMS43OSA0LTQgNC00LTEuNzktNC00em0wIDEyYzAtMi4yMSAxLjc5LTQgNC00czQgMS43OSA0IDQtMS43OSA0LTQgNC00LTEuNzktNC00eiIvPjwvZz48L2c+PC9zdmc+')] opacity-30"></div>
        
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full mb-6">
            <Sparkles className="w-5 h-5 text-white" />
            <span className="text-white font-bold text-sm">Ưu Đãi Đặc Biệt</span>
          </div>
          
          <h2 className="text-4xl md:text-6xl font-black text-white mb-6 leading-tight">
            Bắt Đầu Hành Trình<br />Lập Trình Của Bạn
          </h2>
          
          <p className="text-xl md:text-2xl text-white/90 mb-10 max-w-2xl mx-auto leading-relaxed">
            Tham gia cùng <span className="font-bold">10,000+ học viên</span> đang học lập trình hiệu quả mỗi ngày
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={onGetStarted}
              className="group px-10 py-5 bg-gray-900 hover:bg-gray-800 text-white rounded-xl font-bold text-lg transition-all hover:scale-105 shadow-2xl flex items-center gap-3"
            >
              <span>ĐĂNG KÝ NGAY</span>
              <Rocket className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={onGetStarted}
              className="px-10 py-5 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white rounded-xl font-bold text-lg transition-all border-2 border-white/30 hover:border-white/50"
            >
              Xem Demo
            </button>
          </div>

          <div className="mt-12 flex flex-wrap justify-center gap-8 text-white/90">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5" />
              <span className="font-medium">Miễn phí 7 ngày</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5" />
              <span className="font-medium">Không cần thẻ tín dụng</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5" />
              <span className="font-medium">Hủy bất cứ lúc nào</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

