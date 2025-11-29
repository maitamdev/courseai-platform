import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Code2, Sparkles, Mail, ArrowLeft, Eye, EyeOff, BookOpen, Users, Star, Award } from 'lucide-react';

type AuthView = 'login' | 'signup' | 'forgot-password' | 'check-email';

export const Auth = () => {
  const [view, setView] = useState<AuthView>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const { signIn, signUp } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signIn(email, password);
    } catch (err: any) {
      if (err.message.includes('Email not confirmed')) {
        setError('Email chưa được xác nhận. Vui lòng kiểm tra hộp thư!');
      } else if (err.message.includes('Invalid')) {
        setError('Email hoặc mật khẩu không đúng!');
      } else {
        setError(err.message || 'Đã có lỗi xảy ra');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signUp(email, password, username);
      setView('check-email');
      setSuccess('Đăng ký thành công! Vui lòng kiểm tra email để xác nhận tài khoản.');
    } catch (err: any) {
      setError(err.message || 'Đã có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { supabase } = await import('../lib/supabase');
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) setError(error.message);
      else {
        setView('check-email');
        setSuccess('Đã gửi link đặt lại mật khẩu đến email của bạn!');
      }
    } catch (err: any) {
      setError(err.message || 'Đã có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    { icon: BookOpen, value: '50+', label: 'Khóa học chất lượng' },
    { icon: Users, value: '10,000+', label: 'Học viên đang học' },
    { icon: Star, value: '4.9/5', label: 'Đánh giá trung bình' },
    { icon: Award, value: '100%', label: 'Chứng chỉ uy tín' },
  ];


  // Check email view
  if (view === 'check-email') {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-gray-800 rounded-2xl p-8 text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <Mail className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">Kiểm Tra Email</h2>
          <p className="text-gray-300 mb-6">
            {success || 'Chúng tôi đã gửi email xác nhận đến'}<br />
            <span className="font-bold text-yellow-400">{email}</span>
          </p>
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 mb-6">
            <p className="text-sm text-blue-300">
              📧 Vui lòng kiểm tra hộp thư (và cả thư mục spam) để xác nhận tài khoản.
            </p>
          </div>
          <button
            onClick={() => { setView('login'); setSuccess(''); setError(''); }}
            className="text-yellow-400 hover:text-yellow-300 font-semibold flex items-center gap-2 mx-auto"
          >
            <ArrowLeft className="w-4 h-4" />
            Quay lại đăng nhập
          </button>
        </div>
      </div>
    );
  }

  // Forgot password view
  if (view === 'forgot-password') {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-gray-800 rounded-2xl p-8">
          <button
            onClick={() => { setView('login'); setError(''); }}
            className="text-gray-400 hover:text-white flex items-center gap-2 mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Quay lại
          </button>
          <h2 className="text-2xl font-bold text-white mb-2">Quên Mật Khẩu?</h2>
          <p className="text-gray-400 mb-6">Nhập email để nhận link đặt lại mật khẩu.</p>
          <form onSubmit={handleForgotPassword} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-12 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-500 focus:border-yellow-400 focus:outline-none"
                  placeholder="email@example.com"
                />
              </div>
            </div>
            {error && <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl text-sm">{error}</div>}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 rounded-xl font-bold hover:opacity-90 transition-all disabled:opacity-50"
            >
              {loading ? 'Đang gửi...' : 'Gửi Link Đặt Lại'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Main login/signup view
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-center px-16 relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute w-96 h-96 bg-yellow-400/10 rounded-full blur-3xl -top-48 -left-48"></div>
          <div className="absolute w-96 h-96 bg-blue-400/10 rounded-full blur-3xl bottom-0 right-0"></div>
        </div>

        <div className="relative z-10">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-8">
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center">
                <Code2 className="w-9 h-9 text-gray-900" />
              </div>
              <Sparkles className="w-6 h-6 text-yellow-400 absolute -top-2 -right-2" />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-5xl font-black text-white mb-2">CodeMind AI</h1>
          <p className="text-xl text-yellow-400 font-semibold mb-4">NỀN TẢNG HỌC LẬP TRÌNH THÔNG MINH</p>
          
          <div className="w-16 h-1 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full mb-8"></div>

          <p className="text-gray-300 text-lg mb-12 max-w-md">
            Nâng cao kỹ năng lập trình với các khóa học chất lượng, 
            AI hỗ trợ cá nhân hóa, và cộng đồng học tập sôi động.
          </p>

          {/* Stats */}
          <div className="space-y-4">
            {stats.map((stat, idx) => (
              <div key={idx} className="flex items-center gap-4 bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10 hover:border-yellow-400/30 transition-all">
                <div className="w-12 h-12 bg-gradient-to-br from-yellow-400/20 to-orange-500/20 rounded-xl flex items-center justify-center">
                  <stat.icon className="w-6 h-6 text-yellow-400" />
                </div>
                <div>
                  <div className="text-white font-bold text-lg">{stat.value}</div>
                  <div className="text-gray-400 text-sm">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>


      {/* Right side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center">
              <Code2 className="w-7 h-7 text-gray-900" />
            </div>
            <span className="text-2xl font-black text-white">CodeMind AI</span>
          </div>

          <div className="bg-gray-800/80 backdrop-blur-xl rounded-2xl p-8 border border-gray-700/50 shadow-2xl">
            <h2 className="text-2xl font-bold text-white text-center mb-2">
              {view === 'login' ? 'Chào Mừng Trở Lại!' : 'Tạo Tài Khoản Mới'}
            </h2>
            <p className="text-gray-400 text-center mb-8">
              {view === 'login' ? 'Đăng nhập để tiếp tục hành trình học tập' : 'Bắt đầu hành trình học lập trình của bạn'}
            </p>

            <form onSubmit={view === 'login' ? handleLogin : handleSignup} className="space-y-5">
              {view === 'signup' && (
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Tên người dùng</label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-500 focus:border-yellow-400 focus:outline-none transition-all"
                    placeholder="Nhập tên của bạn"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm text-gray-400 mb-2">Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full pl-12 pr-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-500 focus:border-yellow-400 focus:outline-none transition-all"
                    placeholder="email@example.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Mật khẩu</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-500 focus:border-yellow-400 focus:outline-none transition-all pr-12"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {view === 'login' && (
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded border-gray-600 text-yellow-400 focus:ring-yellow-400 bg-gray-700"
                    />
                    <span className="text-sm text-gray-400">Ghi nhớ đăng nhập</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setView('forgot-password')}
                    className="text-sm text-yellow-400 hover:text-yellow-300 font-medium"
                  >
                    Quên mật khẩu?
                  </button>
                </div>
              )}

              {error && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 rounded-xl font-bold text-lg hover:opacity-90 transition-all disabled:opacity-50 shadow-lg shadow-yellow-400/20"
              >
                {loading ? 'Đang xử lý...' : view === 'login' ? 'Đăng Nhập' : 'Đăng Ký'}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-400">
                {view === 'login' ? "Chưa có tài khoản?" : "Đã có tài khoản?"}
              </p>
              <button
                onClick={() => { setView(view === 'login' ? 'signup' : 'login'); setError(''); }}
                className="mt-2 w-full py-3 border-2 border-gray-600 text-white rounded-xl font-semibold hover:border-yellow-400 hover:text-yellow-400 transition-all"
              >
                {view === 'login' ? 'Đăng Ký Ngay' : 'Đăng Nhập'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
