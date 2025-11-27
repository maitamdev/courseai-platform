import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Code2, Sparkles, Zap, Trophy, Gem, Rocket, Star, Mail, ArrowLeft } from 'lucide-react';

type AuthView = 'login' | 'signup' | 'forgot-password' | 'check-email';

export const Auth = () => {
  const [view, setView] = useState<AuthView>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await signIn(email, password);
    } catch (err: any) {
      if (err.message.includes('Email not confirmed')) {
        setError('Email chưa được xác nhận. Vui lòng kiểm tra hộp thư của bạn!');
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
    setSuccess('');
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
    setSuccess('');
    setLoading(true);

    try {
      const { supabase } = await import('../lib/supabase');
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        setError(error.message);
      } else {
        setView('check-email');
        setSuccess('Đã gửi link đặt lại mật khẩu đến email của bạn!');
      }
    } catch (err: any) {
      setError(err.message || 'Đã có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  const renderCheckEmail = () => (
    <div className="text-center py-8 animate-fade-in">
      <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce-in">
        <Mail className="w-10 h-10 text-white" />
      </div>
      <h2 className="text-2xl font-black text-gray-900 mb-4">Kiểm Tra Email</h2>
      <p className="text-gray-600 mb-6 leading-relaxed">
        {success || 'Chúng tôi đã gửi một email xác nhận đến'}<br />
        <span className="font-bold text-blue-600">{email}</span>
      </p>
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
        <p className="text-sm text-blue-800">
          📧 Vui lòng kiểm tra hộp thư (và cả thư mục spam) để xác nhận tài khoản.
        </p>
      </div>
      <button
        onClick={() => {
          setView('login');
          setSuccess('');
          setError('');
        }}
        className="text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-2 mx-auto"
      >
        <ArrowLeft className="w-4 h-4" />
        Quay lại đăng nhập
      </button>
    </div>
  );

  const renderForgotPassword = () => (
    <div className="animate-fade-in">
      <button
        onClick={() => {
          setView('login');
          setError('');
          setSuccess('');
        }}
        className="text-gray-600 hover:text-gray-800 font-semibold flex items-center gap-2 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Quay lại
      </button>

      <h2 className="text-2xl font-black text-gray-900 mb-2">Quên Mật Khẩu?</h2>
      <p className="text-gray-600 mb-6">
        Nhập email của bạn và chúng tôi sẽ gửi link đặt lại mật khẩu.
      </p>

      <form onSubmit={handleForgotPassword} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="email@example.com"
          />
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl font-bold hover:shadow-xl hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Đang gửi...' : 'Gửi Link Đặt Lại'}
        </button>
      </form>
    </div>
  );

  const renderAuth = () => (
    <div className="animate-fade-in">
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => {
            setView('login');
            setError('');
            setSuccess('');
          }}
          className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all transform ${
            view === 'login'
              ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg scale-105'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:scale-105'
          }`}
        >
          Đăng nhập
        </button>
        <button
          onClick={() => {
            setView('signup');
            setError('');
            setSuccess('');
          }}
          className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all transform ${
            view === 'signup'
              ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg scale-105'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:scale-105'
          }`}
        >
          Đăng ký
        </button>
      </div>

      <form onSubmit={view === 'login' ? handleLogin : handleSignup} className="space-y-4">
        {view === 'signup' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tên người dùng
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="email@example.com"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-sm font-medium text-gray-700">
              Mật khẩu
            </label>
            {view === 'login' && (
              <button
                type="button"
                onClick={() => setView('forgot-password')}
                className="text-sm text-blue-600 hover:text-blue-700 font-semibold"
              >
                Quên mật khẩu?
              </button>
            )}
          </div>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Ít nhất 6 ký tự"
          />
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm">
            {success}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white py-3 rounded-xl font-bold hover:shadow-2xl hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group"
        >
          <span className="relative z-10">
            {loading ? 'Đang xử lý...' : view === 'login' ? 'Đăng nhập' : 'Đăng ký'}
          </span>
          <div className="absolute inset-0 bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
        </button>
      </form>

      {view === 'signup' && (
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-xl">
          <p className="text-sm text-blue-800">
            ℹ️ Sau khi đăng ký, bạn sẽ nhận email xác nhận. Vui lòng click vào link trong email để kích hoạt tài khoản.
          </p>
        </div>
      )}
    </div>
  );

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
            COURSE AI
          </h1>
          <p className="text-xl text-white/90 font-medium drop-shadow-lg animate-slide-up">
            Học lập trình với AI thông minh!
          </p>
        </div>

        <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-white/20 animate-slide-up animation-delay-300">
          {view === 'check-email' ? renderCheckEmail() : view === 'forgot-password' ? renderForgotPassword() : renderAuth()}
        </div>
      </div>
    </div>
  );
};
