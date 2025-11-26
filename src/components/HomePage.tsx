import { Code2, Sparkles, Rocket, Trophy, Target, Zap, ArrowRight, Star, Users, BookOpen } from 'lucide-react';

type HomePageProps = {
  onGetStarted: () => void;
};

export const HomePage = ({ onGetStarted }: HomePageProps) => {
  return (
    <div className="space-y-20">
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 rounded-3xl p-12 md:p-20 text-white">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute w-96 h-96 bg-yellow-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob top-0 -left-48"></div>
          <div className="absolute w-96 h-96 bg-pink-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000 -bottom-48 -right-48"></div>
        </div>

        <div className="relative z-10 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-semibold">Học lập trình theo cách mới</span>
            </div>

            <h1 className="text-5xl md:text-6xl font-black mb-6 leading-tight">
              Học Code Vui Như Chơi Game
            </h1>

            <p className="text-xl text-white/90 mb-8 leading-relaxed">
              Nền tảng học lập trình online với phương pháp gamification. Hoàn thành bài học, săn kho báu, kiếm xu và leo top!
            </p>

            <div className="flex flex-wrap gap-4">
              <button
                onClick={onGetStarted}
                className="group px-8 py-4 bg-white text-purple-600 rounded-xl font-bold text-lg hover:shadow-2xl transition-all flex items-center gap-2 hover:scale-105"
              >
                <span>Bắt đầu học ngay</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>

              <button className="px-8 py-4 bg-white/20 backdrop-blur-sm text-white rounded-xl font-bold text-lg hover:bg-white/30 transition-all border-2 border-white/30">
                Xem demo
              </button>
            </div>

            <div className="flex items-center gap-8 mt-8 pt-8 border-t border-white/20">
              <div>
                <div className="text-3xl font-black">10K+</div>
                <div className="text-sm text-white/80">Học viên</div>
              </div>
              <div>
                <div className="text-3xl font-black">50+</div>
                <div className="text-sm text-white/80">Bài học</div>
              </div>
              <div>
                <div className="text-3xl font-black">4.9</div>
                <div className="text-sm text-white/80 flex items-center gap-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  Đánh giá
                </div>
              </div>
            </div>
          </div>

          <div className="hidden md:block relative">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-3xl blur-2xl opacity-50 animate-pulse"></div>
              <div className="relative bg-white/10 backdrop-blur-lg rounded-3xl p-8 border-2 border-white/20">
                <div className="space-y-4">
                  <div className="flex items-center gap-4 bg-white/20 rounded-xl p-4">
                    <Code2 className="w-12 h-12" />
                    <div>
                      <div className="font-bold">Học JavaScript</div>
                      <div className="text-sm text-white/80">8 bài học hoàn thành</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 bg-white/20 rounded-xl p-4">
                    <Trophy className="w-12 h-12 text-yellow-300" />
                    <div>
                      <div className="font-bold">Săn kho báu</div>
                      <div className="text-sm text-white/80">5/10 kho báu tìm được</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 bg-white/20 rounded-xl p-4">
                    <Zap className="w-12 h-12 text-orange-300" />
                    <div>
                      <div className="font-bold">Tích lũy XP</div>
                      <div className="text-sm text-white/80">Level 5 - 450 XP</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid md:grid-cols-3 gap-8">
        <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all border-2 border-gray-100 hover:border-blue-200 group">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <BookOpen className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-3">Bài học tương tác</h3>
          <p className="text-gray-600 leading-relaxed">
            Học qua ví dụ thực tế, làm bài tập ngay trên trình duyệt. Code, chạy và xem kết quả ngay lập tức.
          </p>
        </div>

        <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all border-2 border-gray-100 hover:border-orange-200 group">
          <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-yellow-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <Target className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-3">Săn kho báu</h3>
          <p className="text-gray-600 leading-relaxed">
            Giải câu đố lập trình để mở khóa kho báu trên bản đồ. Nhận xu và phần thưởng hấp dẫn.
          </p>
        </div>

        <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all border-2 border-gray-100 hover:border-green-200 group">
          <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <Trophy className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-3">Hệ thống thành tích</h3>
          <p className="text-gray-600 leading-relaxed">
            Kiếm XP, lên cấp, mở khóa huy hiệu. Hoàn thành nhiệm vụ hàng ngày để nhận thưởng.
          </p>
        </div>
      </section>

      <section className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-3xl p-12 md:p-16">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-black text-gray-900 mb-4">
            Tại sao chọn Code Quest?
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Phương pháp học hiện đại, hiệu quả và vui vẻ
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Rocket className="w-10 h-10 text-white" />
            </div>
            <h4 className="font-bold text-lg mb-2">Học mọi lúc</h4>
            <p className="text-gray-600 text-sm">
              Học online, bất cứ đâu bất cứ khi nào
            </p>
          </div>

          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-10 h-10 text-white" />
            </div>
            <h4 className="font-bold text-lg mb-2">Cộng đồng</h4>
            <p className="text-gray-600 text-sm">
              Kết nối với hàng ngàn học viên khác
            </p>
          </div>

          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Zap className="w-10 h-10 text-white" />
            </div>
            <h4 className="font-bold text-lg mb-2">Học nhanh</h4>
            <p className="text-gray-600 text-sm">
              Phương pháp gamification giúp tiếp thu nhanh
            </p>
          </div>

          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-pink-500 to-rose-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Star className="w-10 h-10 text-white" />
            </div>
            <h4 className="font-bold text-lg mb-2">Chất lượng</h4>
            <p className="text-gray-600 text-sm">
              Nội dung được biên soạn bởi chuyên gia
            </p>
          </div>
        </div>
      </section>

      <section className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-12 md:p-16 text-center text-white relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute w-64 h-64 bg-white rounded-full opacity-10 blur-3xl -top-32 -left-32 animate-blob"></div>
          <div className="absolute w-64 h-64 bg-white rounded-full opacity-10 blur-3xl -bottom-32 -right-32 animate-blob animation-delay-2000"></div>
        </div>

        <div className="relative z-10">
          <h2 className="text-4xl md:text-5xl font-black mb-6">
            Sẵn sàng bắt đầu?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Tham gia cùng hàng ngàn học viên đang học lập trình một cách vui vẻ và hiệu quả
          </p>
          <button
            onClick={onGetStarted}
            className="px-10 py-5 bg-white text-purple-600 rounded-xl font-bold text-lg hover:shadow-2xl transition-all inline-flex items-center gap-2 hover:scale-105"
          >
            <span>Bắt đầu miễn phí</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </section>
    </div>
  );
};
