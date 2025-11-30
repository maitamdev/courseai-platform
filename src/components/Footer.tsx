import { Code2, Facebook, Twitter, Youtube, Mail, Phone, MapPin, Send, Heart, Sparkles, Github, Linkedin, Instagram } from 'lucide-react';
import { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

export const Footer = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const { t } = useLanguage();

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 3000);
    }
  };

  return (
    <footer className="relative bg-gradient-to-b from-gray-900 via-gray-900 to-black text-white mt-20 overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-green-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/3 rounded-full blur-3xl"></div>
      </div>

      {/* Top Wave Decoration */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent"></div>

      <div className="relative max-w-7xl mx-auto px-4 pt-16 pb-8">
        {/* Newsletter Section */}
        <div className="relative mb-16">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-600/20 via-green-600/20 to-emerald-600/20 rounded-3xl blur-xl"></div>
          <div className="relative bg-gradient-to-r from-gray-800/80 to-gray-800/80 backdrop-blur-xl rounded-3xl p-8 md:p-12 border border-emerald-500/20">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
              <div className="text-center lg:text-left">
                <div className="flex items-center justify-center lg:justify-start gap-2 mb-3">
                  <Sparkles className="w-6 h-6 text-emerald-400 animate-pulse" />
                  <span className="text-emerald-400 font-semibold text-sm uppercase tracking-wider">Newsletter</span>
                </div>
                <h3 className="text-2xl md:text-3xl font-bold mb-2">{t('nav.home') === 'Home' ? 'Subscribe to Newsletter' : 'Đăng ký nhận tin mới'}</h3>
                <p className="text-gray-400 max-w-md">{t('nav.home') === 'Home' ? 'Get notifications about new courses, coding tips and exclusive offers!' : 'Nhận thông báo về khóa học mới, tips lập trình và ưu đãi độc quyền!'}</p>
              </div>
              <form onSubmit={handleSubscribe} className="w-full lg:w-auto">
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={t('nav.home') === 'Home' ? 'Enter your email' : 'Nhập email của bạn'}
                      className="w-full sm:w-80 pl-12 pr-4 py-4 rounded-xl bg-gray-900/80 border border-gray-700 text-white placeholder-gray-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all"
                    />
                  </div>
                  <button
                    type="submit"
                    className="group px-8 py-4 bg-gradient-to-r from-emerald-500 to-green-500 rounded-xl font-bold hover:from-emerald-600 hover:to-green-600 transition-all shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 flex items-center justify-center gap-2"
                  >
                    {subscribed ? (
                      <>
                        <span>{t('nav.home') === 'Home' ? 'Subscribed!' : 'Đã đăng ký!'}</span>
                        <Heart className="w-5 h-5 text-red-300 animate-pulse" />
                      </>
                    ) : (
                      <>
                        <span>{t('nav.home') === 'Home' ? 'Subscribe' : 'Đăng ký'}</span>
                        <Send className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-emerald-500/20 rounded-xl blur-lg"></div>
                <div className="relative w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center">
                  <Code2 className="w-7 h-7 text-white" />
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-black">
                  <span className="text-emerald-400">CODE</span>
                  <span className="text-white">MIND</span>
                </h3>
                <p className="text-xs text-gray-500 font-medium">AI Learning Platform</p>
              </div>
            </div>
            <p className="text-gray-400 mb-6 leading-relaxed">
              {t('nav.home') === 'Home' 
                ? 'Smart AI-powered programming learning platform that makes learning to code effective and fun like playing games.'
                : 'Nền tảng học lập trình thông minh với AI, giúp bạn học code hiệu quả và thú vị như chơi game.'}
            </p>
            
            {/* Social Links */}
            <div className="flex gap-3">
              {[
                { icon: Facebook, color: 'hover:bg-blue-600', href: '#' },
                { icon: Instagram, color: 'hover:bg-pink-600', href: '#' },
                { icon: Twitter, color: 'hover:bg-sky-500', href: '#' },
                { icon: Youtube, color: 'hover:bg-red-600', href: '#' },
                { icon: Github, color: 'hover:bg-gray-600', href: '#' },
                { icon: Linkedin, color: 'hover:bg-blue-700', href: '#' },
              ].map((social, idx) => (
                <a
                  key={idx}
                  href={social.href}
                  className={`w-10 h-10 bg-gray-800 rounded-xl flex items-center justify-center ${social.color} transition-all duration-300 hover:scale-110 hover:-translate-y-1 border border-gray-700 hover:border-transparent`}
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-bold mb-6 flex items-center gap-2">
              <span className="w-8 h-0.5 bg-gradient-to-r from-emerald-500 to-transparent rounded-full"></span>
              {t('nav.home') === 'Home' ? 'Courses' : 'Khóa học'}
            </h4>
            <ul className="space-y-3">
              {(t('nav.home') === 'Home' ? [
                'JavaScript Basics',
                'React & React Native',
                'Python for Beginners',
                'Full-Stack Development',
                'Data Structures & Algorithms',
              ] : [
                'JavaScript cơ bản',
                'React & React Native',
                'Python cho người mới',
                'Full-Stack Development',
                'Data Structures & Algorithms',
              ]).map((item, idx) => (
                <li key={idx}>
                  <a href="#" className="group flex items-center gap-2 text-gray-400 hover:text-emerald-400 transition-colors">
                    <span className="w-1.5 h-1.5 bg-gray-600 rounded-full group-hover:bg-emerald-500 transition-colors"></span>
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-lg font-bold mb-6 flex items-center gap-2">
              <span className="w-8 h-0.5 bg-gradient-to-r from-emerald-500 to-transparent rounded-full"></span>
              {t('nav.home') === 'Home' ? 'Support' : 'Hỗ trợ'}
            </h4>
            <ul className="space-y-3">
              {(t('nav.home') === 'Home' ? [
                'Help Center',
                'FAQ',
                'Terms of Service',
                'Privacy Policy',
                'Contact Us',
              ] : [
                'Trung tâm trợ giúp',
                'Câu hỏi thường gặp',
                'Điều khoản sử dụng',
                'Chính sách bảo mật',
                'Liên hệ với chúng tôi',
              ]).map((item, idx) => (
                <li key={idx}>
                  <a href="#" className="group flex items-center gap-2 text-gray-400 hover:text-emerald-400 transition-colors">
                    <span className="w-1.5 h-1.5 bg-gray-600 rounded-full group-hover:bg-emerald-500 transition-colors"></span>
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-lg font-bold mb-6 flex items-center gap-2">
              <span className="w-8 h-0.5 bg-gradient-to-r from-emerald-500 to-transparent rounded-full"></span>
              {t('nav.home') === 'Home' ? 'Contact' : 'Liên hệ'}
            </h4>
            <ul className="space-y-4">
              <li>
                <a href="#" className="group flex items-start gap-3 text-gray-400 hover:text-white transition-colors">
                  <div className="w-10 h-10 bg-gray-800 rounded-xl flex items-center justify-center group-hover:bg-emerald-500/20 transition-colors flex-shrink-0">
                    <MapPin className="w-5 h-5 text-emerald-400" />
                  </div>
                  <span className="pt-2">123 Đường Lê Lợi, Quận 1, TP.HCM</span>
                </a>
              </li>
              <li>
                <a href="tel:19001234" className="group flex items-center gap-3 text-gray-400 hover:text-white transition-colors">
                  <div className="w-10 h-10 bg-gray-800 rounded-xl flex items-center justify-center group-hover:bg-emerald-500/20 transition-colors">
                    <Phone className="w-5 h-5 text-emerald-400" />
                  </div>
                  <span>1900 1234</span>
                </a>
              </li>
              <li>
                <a href="mailto:support@codemind.ai" className="group flex items-center gap-3 text-gray-400 hover:text-white transition-colors">
                  <div className="w-10 h-10 bg-gray-800 rounded-xl flex items-center justify-center group-hover:bg-emerald-500/20 transition-colors">
                    <Mail className="w-5 h-5 text-emerald-400" />
                  </div>
                  <span>support@codemind.ai</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="relative">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent"></div>
          <div className="pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-500 text-sm flex items-center gap-1">
              © 2025 CodeMind AI. Made by 
              <span className="text-emerald-400 font-semibold">MaiTamDev</span>
              <Heart className="w-4 h-4 text-red-500 animate-pulse" /> 
            </p>
            <div className="flex flex-wrap justify-center gap-6 text-sm">
              {(t('nav.home') === 'Home' ? ['About Us', 'Blog', 'Careers', 'Partners'] : ['Về chúng tôi', 'Blog', 'Tuyển dụng', 'Đối tác']).map((item, idx) => (
                <a 
                  key={idx}
                  href="#" 
                  className="text-gray-500 hover:text-emerald-400 transition-colors relative group"
                >
                  {item}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-emerald-500 group-hover:w-full transition-all duration-300"></span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
