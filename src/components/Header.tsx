import { useAuth } from '../contexts/AuthContext';
import { Code2, Sparkles, Coins, LogOut, User, Zap } from 'lucide-react';

export const Header = () => {
  const { profile, signOut } = useAuth();

  return (
    <header className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 shadow-2xl sticky top-0 z-40 border-b-4 border-white/20">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 relative">
              <div className="absolute inset-0 bg-white/20 rounded-full blur-xl animate-pulse"></div>
              <Code2 className="w-10 h-10 text-white drop-shadow-lg animate-float relative z-10" />
              <Sparkles className="w-8 h-8 text-yellow-300 drop-shadow-lg animate-float animation-delay-500 relative z-10" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white drop-shadow-lg">Code Quest</h1>
              <p className="text-xs text-white/90 font-medium">Học code vui như chơi game</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-5 py-2.5 rounded-full flex items-center gap-2 shadow-xl hover:shadow-2xl transition-all hover:scale-105 border-2 border-white/30">
              <Coins className="w-5 h-5 animate-pulse" />
              <span className="font-black text-lg">{profile?.total_coins || 0}</span>
            </div>

            <div className="hidden sm:flex items-center gap-3 bg-white/20 backdrop-blur-md px-5 py-2.5 rounded-full border-2 border-white/30 hover:bg-white/30 transition-all">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-white">{profile?.username}</span>
              <div className="flex items-center gap-1 bg-gradient-to-r from-green-400 to-emerald-500 text-white px-3 py-1 rounded-full shadow-lg">
                <Zap className="w-3 h-3" />
                <span className="text-xs font-black">Lv {profile?.level || 1}</span>
              </div>
            </div>

            <button
              onClick={signOut}
              className="p-2.5 bg-white/20 backdrop-blur-md hover:bg-white/30 rounded-xl transition-all border-2 border-white/30 hover:scale-110 group"
              title="Đăng xuất"
            >
              <LogOut className="w-5 h-5 text-white group-hover:rotate-12 transition-transform" />
            </button>
          </div>
        </div>

        <div className="sm:hidden mt-3 flex items-center justify-between bg-white/20 backdrop-blur-md px-4 py-2 rounded-xl border-2 border-white/30">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
              <User className="w-3 h-3 text-white" />
            </div>
            <span className="font-bold text-white text-sm">{profile?.username}</span>
          </div>
          <div className="flex items-center gap-1 bg-gradient-to-r from-green-400 to-emerald-500 text-white px-3 py-1 rounded-full shadow-lg">
            <Zap className="w-3 h-3" />
            <span className="text-xs font-black">Lv {profile?.level || 1}</span>
          </div>
        </div>
      </div>
    </header>
  );
};
