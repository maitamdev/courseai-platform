import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Code2, Sparkles, Lock, Check, Eye, EyeOff, Shield, AlertCircle, CheckCircle2 } from 'lucide-react';

export const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [validSession, setValidSession] = useState(false);

  useEffect(() => {
    // Check if we have a valid session from the reset link
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setValidSession(true);
      } else {
        setError('Link đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.');
      }
    });
  }, []);

  useEffect(() => {
    // Calculate password strength
    let strength = 0;
    if (password.length >= 6) strength++;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    setPasswordStrength(strength);
  }, [password]);

  const getStrengthColor = () => {
    if (passwordStrength <= 1) return 'bg-red-500';
    if (passwordStrength <= 2) return 'bg-orange-500';
    if (passwordStrength <= 3) return 'bg-yellow-500';
    if (passwordStrength <= 4) return 'bg-green-500';
    return 'bg-emerald-500';
  };

  const getStrengthText = () => {
    if (passwordStrength <= 1) return 'Yếu';
    if (passwordStrength <= 2) return 'Trung bình';
    if (passwordStrength <= 3) return 'Khá';
    if (passwordStrength <= 4) return 'Mạnh';
    return 'Rất mạnh';
  };

  const passwordRequirements = [
    { met: password.length >= 6, text: 'Ít nhất 6 ký tự' },
    { met: password.length >= 8, text: 'Ít nhất 8 ký tự (khuyến nghị)' },
    { met: /[A-Z]/.test(password), text: 'Có chữ hoa' },
    { met: /[0-9]/.test(password), text: 'Có số' },
    { met: /[^A-Za-z0-9]/.test(password), text: 'Có ký tự đặc biệt' },
  ];

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp!');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự!');
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) {
        setError(error.message);
      } else {
        setSuccess(true);
        setTimeout(() => {
          window.location.href = '/';
        }, 3000);
      }
    } catch (err: any) {
      setError(err.message || 'Đã có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute w-96 h-96 bg-green-500/20 rounded-full blur-3xl animate-pulse top-0 left-0"></div>
          <div className="absolute w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl animate-pulse bottom-0 right-0 animation-delay-2000"></div>
        </div>

        <div className="max-w-md w-full relative z-10 animate-fade-in-scale">
          <div className="bg-gray-800/90 backdrop-blur-xl rounded-3xl shadow-2xl p-12 border border-gray-700 text-center">
            <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce-in shadow-2xl">
              <Check className="w-12 h-12 text-white" />
            </div>
            <h2 className="text-3xl font-black text-white mb-4">Thành Công!</h2>
            <p className="text-gray-300 mb-6 text-lg">
              Mật khẩu của bạn đã được cập nhật thành công.
            </p>
            <div className="flex items-center justify-center gap-2 text-gray-400">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-yellow-400"></div>
              <span>Đang chuyển đến trang đăng nhập...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!validSession && error) {
    return (
      <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full relative z-10">
          <div className="bg-gray-800/90 backdrop-blur-xl rounded-3xl shadow-2xl p-12 border border-gray-700 text-center">
            <div className="w-24 h-24 bg-gradient-to-br from-red-400 to-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-12 h-12 text-white" />
            </div>
            <h2 className="text-3xl font-black text-white mb-4">Link Không Hợp Lệ</h2>
            <p className="text-gray-300 mb-8">
              Link đặt lại mật khẩu không hợp lệ hoặc đã hết hạn. Vui lòng yêu cầu link mới.
            </p>
            <button
              onClick={() => window.location.href = '/'}
              className="px-8 py-3 bg-yellow-400 hover:bg-yellow-500 text-white rounded-xl font-bold transition-all hover:scale-105"
            >
              Quay Về Trang Chủ
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute w-96 h-96 bg-yellow-400/10 rounded-full blur-3xl animate-blob top-0 -left-48"></div>
        <div className="absolute w-96 h-96 bg-blue-400/10 rounded-full blur-3xl animate-blob animation-delay-2000 top-0 right-0"></div>
        <div className="absolute w-96 h-96 bg-purple-400/10 rounded-full blur-3xl animate-blob animation-delay-4000 bottom-0 left-1/2"></div>
      </div>

      <div className="max-w-lg w-full relative z-10">
        <div className="text-center mb-8 animate-fade-in">
          <div className="flex justify-center items-center gap-3 mb-4">
            <div className="relative">
              <Code2 className="w-16 h-16 text-white drop-shadow-lg animate-float" />
              <div className="absolute inset-0 bg-yellow-400/30 rounded-full blur-xl animate-pulse"></div>
            </div>
            <div className="relative">
              <Sparkles className="w-14 h-14 text-yellow-400 drop-shadow-lg animate-float animation-delay-500" />
              <div className="absolute inset-0 bg-yellow-400/30 rounded-full blur-xl animate-pulse animation-delay-500"></div>
            </div>
          </div>
          <h1 className="text-5xl font-black text-white mb-3 drop-shadow-2xl">
            CodeMind AI
          </h1>
          <p className="text-gray-400">Đặt lại mật khẩu của bạn</p>
        </div>

        <div className="bg-gray-800/90 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-gray-700 animate-fade-in-scale">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-xl">
              <Lock className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-black text-white">Mật Khẩu Mới</h2>
              <p className="text-sm text-gray-400">Tạo mật khẩu mạnh để bảo vệ tài khoản</p>
            </div>
          </div>

          <form onSubmit={handleResetPassword} className="space-y-6">
            {/* Password Input */}
            <div>
              <label className="block text-sm font-bold text-gray-300 mb-2">
                Mật khẩu mới
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 pr-12 bg-gray-900/50 border-2 border-gray-700 rounded-xl text-white placeholder-gray-500 focus:border-yellow-400 focus:outline-none transition-all"
                  placeholder="Nhập mật khẩu mới"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              {/* Password Strength */}
              {password && (
                <div className="mt-3 space-y-2 animate-fade-in">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Độ mạnh:</span>
                    <span className={`font-bold ${
                      passwordStrength <= 2 ? 'text-red-400' : 
                      passwordStrength <= 3 ? 'text-yellow-400' : 
                      'text-green-400'
                    }`}>
                      {getStrengthText()}
                    </span>
                  </div>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((level) => (
                      <div
                        key={level}
                        className={`h-2 flex-1 rounded-full transition-all ${
                          level <= passwordStrength ? getStrengthColor() : 'bg-gray-700'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-bold text-gray-300 mb-2">
                Xác nhận mật khẩu
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 pr-12 bg-gray-900/50 border-2 border-gray-700 rounded-xl text-white placeholder-gray-500 focus:border-yellow-400 focus:outline-none transition-all"
                  placeholder="Nhập lại mật khẩu"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-white transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              {/* Password Match Indicator */}
              {confirmPassword && (
                <div className={`mt-2 flex items-center gap-2 text-sm animate-fade-in ${
                  password === confirmPassword ? 'text-green-400' : 'text-red-400'
                }`}>
                  {password === confirmPassword ? (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Mật khẩu khớp</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-4 h-4" />
                      <span>Mật khẩu không khớp</span>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Requirements */}
            <div className="bg-gray-900/50 rounded-xl p-4 border border-gray-700">
              <div className="flex items-center gap-2 mb-3">
                <Shield className="w-5 h-5 text-yellow-400" />
                <span className="text-sm font-bold text-gray-300">Yêu cầu mật khẩu:</span>
              </div>
              <div className="space-y-2">
                {passwordRequirements.map((req, index) => (
                  <div
                    key={index}
                    className={`flex items-center gap-2 text-sm transition-all ${
                      req.met ? 'text-green-400' : 'text-gray-500'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                      req.met ? 'bg-green-500/20' : 'bg-gray-700'
                    }`}>
                      {req.met && <Check className="w-3 h-3" />}
                    </div>
                    <span>{req.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {error && (
              <div className="bg-red-500/10 border-2 border-red-500/30 text-red-400 px-4 py-3 rounded-xl text-sm flex items-center gap-2 animate-fade-in">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || password !== confirmPassword || password.length < 6}
              className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white py-4 rounded-xl font-black text-lg transition-all hover:scale-105 hover:shadow-2xl hover:shadow-yellow-500/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 relative overflow-hidden group"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-900"></div>
                    Đang cập nhật...
                  </>
                ) : (
                  <>
                    <Lock className="w-5 h-5" />
                    Đặt Lại Mật Khẩu
                  </>
                )}
              </span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

