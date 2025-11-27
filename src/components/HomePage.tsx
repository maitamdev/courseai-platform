import { useState } from 'react';
import { Code2, Users, Library, GraduationCap, ChevronLeft, ChevronRight } from 'lucide-react';

type HomePageProps = {
  onGetStarted: () => void;
};

export const HomePage = ({ onGetStarted }: HomePageProps) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      title: 'Học Lập Trình Vui Như Chơi Game',
      description: 'Nền tảng học code online với phương pháp gamification độc đáo. Hoàn thành bài học, săn kho báu, kiếm xu và leo top bảng xếp hạng cùng hàng ngàn học viên khác.',
    },
    {
      title: 'Khóa Học Chất Lượng Cao',
      description: 'Hơn 50+ khóa học từ cơ bản đến nâng cao về JavaScript, Python, C++, React và nhiều ngôn ngữ khác. Nội dung được biên soạn bởi các chuyên gia hàng đầu.',
    },
    {
      title: 'Thực Hành Ngay Trên Trình Duyệt',
      description: 'Code editor tích hợp sẵn, chạy code và xem kết quả ngay lập tức. Không cần cài đặt gì, học mọi lúc mọi nơi với chỉ một trình duyệt web.',
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

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  return (
    <div className="w-full">
      {/* Hero Section with Slider */}
      <section className="relative bg-gray-700/60 backdrop-blur-md w-full">
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
            <h1 className="text-5xl md:text-6xl font-black mb-6 leading-tight animate-fade-in">
              {slides[currentSlide].title}
            </h1>
            <p className="text-xl text-white/80 mb-10 leading-relaxed max-w-3xl mx-auto animate-fade-in">
              {slides[currentSlide].description}
            </p>
            <button
              onClick={onGetStarted}
              className="px-10 py-4 bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-gray-900 rounded-lg font-bold text-lg transition-all hover:scale-105 shadow-xl hover:shadow-2xl"
            >
              BẮT ĐẦU KHÓA HỌC
            </button>
          </div>

          {/* Slide Indicators */}
          <div className="flex justify-center gap-2 mt-12">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-3 h-3 rounded-full transition-all ${
                  index === currentSlide ? 'bg-yellow-400 w-8' : 'bg-white/30 hover:bg-white/50'
                }`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-gray-900/70 backdrop-blur-lg w-full py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="flex items-start gap-6 text-white"
                >
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center">
                      <Icon className="w-8 h-8 text-gray-900" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                    <p className="text-white/70 leading-relaxed">{feature.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-gray-800/60 backdrop-blur-md w-full py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 text-center text-white">
            <div>
              <div className="text-5xl font-black mb-2 text-yellow-400">10K+</div>
              <div className="text-lg text-white/80">Học viên</div>
            </div>
            <div>
              <div className="text-5xl font-black mb-2 text-yellow-400">50+</div>
              <div className="text-lg text-white/80">Khóa học</div>
            </div>
            <div>
              <div className="text-5xl font-black mb-2 text-yellow-400">100+</div>
              <div className="text-lg text-white/80">Bài học</div>
            </div>
            <div>
              <div className="text-5xl font-black mb-2 text-yellow-400">4.9★</div>
              <div className="text-lg text-white/80">Đánh giá</div>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Courses Section */}
      <section className="bg-gray-900/70 backdrop-blur-lg w-full py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-black text-white mb-4">Khóa Học Phổ Biến</h2>
            <p className="text-xl text-white/70">Bắt đầu hành trình học code của bạn ngay hôm nay</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { title: 'JavaScript Cơ Bản', lessons: '20 bài học', level: 'Beginner', color: 'from-blue-500 to-blue-600' },
              { title: 'Python cho AI', lessons: '25 bài học', level: 'Intermediate', color: 'from-green-500 to-green-600' },
              { title: 'React.js Advanced', lessons: '30 bài học', level: 'Advanced', color: 'from-purple-500 to-purple-600' },
            ].map((course, index) => (
              <div
                key={index}
                className="bg-gray-700/50 backdrop-blur-sm rounded-xl overflow-hidden border border-gray-600 hover:border-yellow-400 transition-all hover:scale-105 cursor-pointer group"
              >
                <div className={`h-40 bg-gradient-to-br ${course.color} flex items-center justify-center`}>
                  <Code2 className="w-16 h-16 text-white" />
                </div>
                <div className="p-6">
                  <div className="inline-block px-3 py-1 bg-yellow-400 text-gray-900 text-xs font-bold rounded-full mb-3">
                    {course.level}
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2 group-hover:text-yellow-400 transition-colors">
                    {course.title}
                  </h3>
                  <p className="text-white/70 text-sm mb-4">{course.lessons}</p>
                  <button
                    onClick={onGetStarted}
                    className="w-full py-2 bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold rounded-lg transition-all"
                  >
                    Xem chi tiết
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-yellow-400/90 backdrop-blur-md w-full py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-black text-gray-900 mb-4">
            Sẵn Sàng Bắt Đầu Học?
          </h2>
          <p className="text-xl text-gray-800 mb-8 max-w-2xl mx-auto">
            Tham gia cùng hàng ngàn học viên đang học lập trình hiệu quả
          </p>
          <button
            onClick={onGetStarted}
            className="px-10 py-4 bg-gray-900 hover:bg-gray-800 text-white rounded-lg font-bold text-lg transition-all hover:scale-105 shadow-xl"
          >
            ĐĂNG KÝ NGAY
          </button>
        </div>
      </section>
    </div>
  );
};
