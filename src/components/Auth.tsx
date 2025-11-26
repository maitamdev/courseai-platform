import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Code2, Sparkles, Zap, Trophy, Gem, Rocket, Star } from 'lucide-react';

export const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        await signIn(email, password);
      } else {
        await signUp(email, password, username);
      }
    } catch (err: any) {
      setError(err.message || 'Đã có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500 flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute w-96 h-96 bg-yellow-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob top-0 -left-48"></div>
        <div className="absolute w-96 h-96 bg-pink-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000 top-0 right-0"></div>
        <div className="absolute w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000 bottom-0 left-1/2"></div>
      </div>

      <div className="absolute inset-0 pointer-events-none">
        <Star className="absolute top-20 left-10 text-yellow-300 opacity-40 w-6 h-6 animate-pulse" />
        <Star className="absolute top-40 right-20 text-pink-300 opacity-60 w-4 h-4 animate-pulse animation-delay-1000" />
        <Gem className="absolute top-60 left-1/4 text-blue-300 opacity-40 w-5 h-5 animate-bounce" />
        <Trophy className="absolute bottom-40 right-10 text-yellow-300 opacity-50 w-8 h-8 animate-pulse animation-delay-2000" />
        <Zap className="absolute bottom-20 left-20 text-orange-300 opacity-40 w-6 h-6 animate-bounce animation-delay-1000" />
        <Rocket className="absolute top-1/2 right-1/3 text-purple-300 opacity-30 w-7 h-7 animate-pulse" />
      </div>

      <div className="max-w-md w-full relative z-10">
        <div className="text-center mb-8 animate-fade-in">
          <div className="flex justify-center items-center gap-3 mb-4">
            <div className="relative">
              <Code2 className="w-16 h-16 text-white drop-shadow-lg animate-float" />
              <div className="absolute inset-0 bg-blue-400 rounded-full blur-xl opacity-50 animate-pulse"></div>
            </div>
            <div className="relative">
              <Sparkles className="w-14 h-14 text-yellow-300 drop-shadow-lg animate-float animation-delay-500" />
              <div className="absolute inset-0 bg-yellow-400 rounded-full blur-xl opacity-50 animate-pulse animation-delay-500"></div>
            </div>
          </div>
          <h1 className="text-5xl font-black text-white mb-3 drop-shadow-2xl animate-slide-down">
            Code Quest
          </h1>
          <p className="text-xl text-white/90 font-medium drop-shadow-lg animate-slide-up">
            Học lập trình vui như chơi game!
          </p>
        </div>

        <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-white/20 animate-slide-up animation-delay-300">
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all transform ${
                isLogin
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg scale-105'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:scale-105'
              }`}
            >
              Đăng nhập
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all transform ${
                !isLogin
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg scale-105'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:scale-105'
              }`}
            >
              Đăng ký
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tên người dùng
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Nhập tên của bạn"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="email@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mật khẩu
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ít nhất 6 ký tự"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white py-3 rounded-xl font-bold hover:shadow-2xl hover:scale-105 transition-all transform disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 relative overflow-hidden group"
            >
              <span className="relative z-10">{loading ? 'Đang xử lý...' : isLogin ? 'Đăng nhập' : 'Đăng ký'}</span>
              <div className="absolute inset-0 bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
