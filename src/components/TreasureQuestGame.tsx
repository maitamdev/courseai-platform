import { useState } from 'react';
import { Map, Code, Puzzle, Trophy, ArrowRight, Sparkles, Lock, Star, Zap } from 'lucide-react';

type GameStage = 'intro' | 'playing' | 'completed';

type Challenge = {
  id: number;
  title: string;
  description: string;
  code: string;
  correctAnswer: string;
  hint: string;
  reward: number;
};

export const TreasureQuestGame = () => {
  const [stage, setStage] = useState<GameStage>('intro');
  const [currentChallenge, setCurrentChallenge] = useState(0);
  const [userCode, setUserCode] = useState('');
  const [score, setScore] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [message, setMessage] = useState('');

  const challenges: Challenge[] = [
    {
      id: 1,
      title: 'Cổng Bí Ẩn',
      description: 'Giải mã thông điệp cổ xưa để mở cổng. Sử dụng vòng lặp để in ra các số từ 1 đến 5.',
      code: 'for i in range(1, ?):\n    print(i)',
      correctAnswer: '6',
      hint: 'range(1, 6) sẽ tạo ra các số từ 1 đến 5',
      reward: 100,
    },
    {
      id: 2,
      title: 'Mê Cung Số Học',
      description: 'Tính tổng các số từ 1 đến 10 để tìm đường đi đúng.',
      code: 'total = 0\nfor i in range(1, 11):\n    total += i\nprint(total)',
      correctAnswer: '55',
      hint: '1+2+3+4+5+6+7+8+9+10 = 55',
      reward: 150,
    },
    {
      id: 3,
      title: 'Kho Báu Cuối Cùng',
      description: 'Viết hàm kiểm tra số chẵn để mở khóa kho báu.',
      code: 'def is_even(n):\n    return n % 2 == ?\n\nprint(is_even(4))',
      correctAnswer: '0',
      hint: 'Số chẵn chia hết cho 2, phần dư bằng 0',
      reward: 200,
    },
  ];

  const handleStartGame = () => {
    setStage('playing');
    setCurrentChallenge(0);
    setScore(0);
    setUserCode('');
    setMessage('');
  };

  const handleSubmit = () => {
    const challenge = challenges[currentChallenge];
    if (userCode.trim() === challenge.correctAnswer) {
      setScore(score + challenge.reward);
      setMessage('🎉 Chính xác! Bạn đã vượt qua thử thách!');
      
      setTimeout(() => {
        if (currentChallenge < challenges.length - 1) {
          setCurrentChallenge(currentChallenge + 1);
          setUserCode('');
          setMessage('');
          setShowHint(false);
        } else {
          setStage('completed');
        }
      }, 2000);
    } else {
      setMessage('❌ Chưa đúng! Hãy thử lại hoặc xem gợi ý.');
    }
  };

  if (stage === 'intro') {
    return (
      <div className="w-full">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-3xl overflow-hidden mb-8">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDI1NSwgMjU1LCAyNTUsIDAuMDUpIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30"></div>
          
          <div className="relative z-10 px-8 py-20 text-center">
            <div className="inline-flex items-center gap-2 bg-emerald-400/20 backdrop-blur-sm px-4 py-2 rounded-full mb-6 border border-emerald-400/30">
              <Sparkles className="w-5 h-5 text-emerald-400" />
              <span className="text-emerald-400 font-bold">Trò Chơi Phiêu Lưu Lập Trình</span>
            </div>

            <h1 className="text-6xl font-black text-white mb-6 leading-tight">
              Code Quest:<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-green-500">
                Kho Báu Bị Mất
              </span>
            </h1>

            <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8 leading-relaxed">
              Giải mã những bí ẩn cổ xưa, giải mã các thông điệp khó hiểu và hướng dẫn nhân vật của bạn 
              qua những vùng đất hiểm trở để tìm kho báu huyền thoại đã mất bằng kỹ năng lập trình của bạn!
            </p>

            <button
              onClick={handleStartGame}
              className="group px-10 py-5 bg-gradient-to-r from-emerald-400 to-green-500 hover:from-emerald-500 hover:to-green-600 text-white rounded-xl font-black text-xl transition-all hover:scale-105 shadow-2xl inline-flex items-center gap-3"
            >
              <span>Bắt Đầu Cuộc Phiêu Lưu</span>
              <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </button>

            <div className="mt-12 flex items-center justify-center gap-8 text-sm">
              <div className="flex items-center gap-2 text-gray-400">
                <Trophy className="w-5 h-5 text-emerald-400" />
                <span>3 Thử Thách</span>
              </div>
              <div className="flex items-center gap-2 text-gray-400">
                <Zap className="w-5 h-5 text-emerald-400" />
                <span>450 Xu Thưởng</span>
              </div>
              <div className="flex items-center gap-2 text-gray-400">
                <Star className="w-5 h-5 text-emerald-400" />
                <span>Học Python</span>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="grid md:grid-cols-3 gap-6">
          <div className="bg-gray-800/70 backdrop-blur-lg rounded-2xl p-8 border border-gray-700 hover:border-emerald-400 transition-all group">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Code className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">Học Lệnh Python</h3>
            <p className="text-gray-400 leading-relaxed">
              Thực hành các lệnh Python cơ bản như vòng lặp, điều kiện và hàm thông qua các thử thách thực tế.
            </p>
          </div>

          <div className="bg-gray-800/70 backdrop-blur-lg rounded-2xl p-8 border border-gray-700 hover:border-emerald-400 transition-all group">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Puzzle className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">Giải Câu Đố Logic</h3>
            <p className="text-gray-400 leading-relaxed">
              Rèn luyện tư duy logic và kỹ năng giải quyết vấn đề qua các câu đố lập trình thú vị.
            </p>
          </div>

          <div className="bg-gray-800/70 backdrop-blur-lg rounded-2xl p-8 border border-gray-700 hover:border-emerald-400 transition-all group">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Map className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">Khám Phá Bản Đồ Động</h3>
            <p className="text-gray-400 leading-relaxed">
              Điều hướng qua các vùng đất bí ẩn, mở khóa các khu vực mới khi hoàn thành thử thách.
            </p>
          </div>
        </section>
      </div>
    );
  }

  if (stage === 'completed') {
    return (
      <div className="w-full">
        <div className="bg-gradient-to-br from-emerald-400/20 to-green-500/20 backdrop-blur-lg rounded-3xl p-12 border-2 border-emerald-400 text-center">
          <div className="w-24 h-24 bg-gradient-to-br from-emerald-400 to-green-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
            <Trophy className="w-12 h-12 text-white" />
          </div>
          
          <h2 className="text-5xl font-black text-white mb-4">
            🎉 Chúc Mừng!
          </h2>
          
          <p className="text-2xl text-gray-300 mb-6">
            Bạn đã tìm thấy kho báu huyền thoại!
          </p>

          <div className="bg-gray-900/50 rounded-2xl p-8 mb-8 inline-block">
            <div className="text-6xl font-black text-emerald-400 mb-2">
              {score}
            </div>
            <div className="text-xl text-gray-400">Xu Thưởng</div>
          </div>

          <div className="flex gap-4 justify-center">
            <button
              onClick={handleStartGame}
              className="px-8 py-4 bg-emerald-400 hover:bg-emerald-500 text-white rounded-xl font-bold transition-all hover:scale-105"
            >
              Chơi Lại
            </button>
            <button
              onClick={() => setStage('intro')}
              className="px-8 py-4 bg-gray-700 hover:bg-gray-600 text-white rounded-xl font-bold transition-all hover:scale-105"
            >
              Về Trang Chủ
            </button>
          </div>
        </div>
      </div>
    );
  }

  const challenge = challenges[currentChallenge];
  const progress = ((currentChallenge + 1) / challenges.length) * 100;

  return (
    <div className="w-full">
      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-bold text-gray-400">
            Thử Thách {currentChallenge + 1}/{challenges.length}
          </span>
          <span className="text-sm font-bold text-emerald-400">
            {score} Xu
          </span>
        </div>
        <div className="w-full bg-gray-800 rounded-full h-3">
          <div
            className="bg-gradient-to-r from-emerald-400 to-green-500 h-3 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Challenge Info */}
        <div className="bg-gray-800/70 backdrop-blur-lg rounded-2xl p-8 border border-gray-700">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-green-500 rounded-xl flex items-center justify-center">
              <Lock className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white">{challenge.title}</h2>
              <p className="text-sm text-gray-400">Phần thưởng: {challenge.reward} xu</p>
            </div>
          </div>

          <p className="text-lg text-gray-300 mb-6 leading-relaxed">
            {challenge.description}
          </p>

          <div className="bg-gray-900/50 rounded-xl p-6 mb-6 border border-gray-700">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-bold text-gray-400">Code Mẫu:</span>
              <span className="text-xs px-2 py-1 bg-blue-500 text-white rounded">Python</span>
            </div>
            <pre className="text-green-400 font-mono text-sm overflow-x-auto">
              {challenge.code}
            </pre>
          </div>

          {showHint && (
            <div className="bg-emerald-400/10 border border-emerald-400/30 rounded-xl p-4 mb-4">
              <div className="flex items-start gap-2">
                <Sparkles className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-emerald-400 mb-1">Gợi ý:</div>
                  <div className="text-gray-300 text-sm">{challenge.hint}</div>
                </div>
              </div>
            </div>
          )}

          {!showHint && (
            <button
              onClick={() => setShowHint(true)}
              className="w-full py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-xl font-bold transition-all"
            >
              💡 Xem Gợi Ý
            </button>
          )}
        </div>

        {/* Answer Input */}
        <div className="bg-gray-800/70 backdrop-blur-lg rounded-2xl p-8 border border-gray-700">
          <h3 className="text-xl font-bold text-white mb-4">Nhập Câu Trả Lời</h3>
          
          <div className="mb-6">
            <label className="block text-sm font-bold text-gray-400 mb-2">
              Điền vào chỗ trống (?)
            </label>
            <input
              type="text"
              value={userCode}
              onChange={(e) => setUserCode(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
              placeholder="Nhập câu trả lời..."
              className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:border-emerald-400 focus:outline-none font-mono text-lg"
            />
          </div>

          {message && (
            <div className={`p-4 rounded-xl mb-6 ${
              message.includes('Chính xác') 
                ? 'bg-green-500/20 border border-green-500/30 text-green-400' 
                : 'bg-red-500/20 border border-red-500/30 text-red-400'
            }`}>
              {message}
            </div>
          )}

          <button
            onClick={handleSubmit}
            className="w-full py-4 bg-gradient-to-r from-emerald-400 to-green-500 hover:from-emerald-500 hover:to-green-600 text-white rounded-xl font-black text-lg transition-all hover:scale-105 shadow-xl"
          >
            Kiểm Tra Đáp Án
          </button>

          <div className="mt-6 p-4 bg-gray-900/50 rounded-xl border border-gray-700">
            <div className="text-sm text-gray-400 mb-2">Tiến độ:</div>
            <div className="flex gap-2">
              {challenges.map((_, index) => (
                <div
                  key={index}
                  className={`flex-1 h-2 rounded-full ${
                    index < currentChallenge
                      ? 'bg-green-500'
                      : index === currentChallenge
                      ? 'bg-emerald-400'
                      : 'bg-gray-700'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

