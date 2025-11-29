import { useState, useEffect } from 'react';
import { Gamepad2, Trophy, Star, Lock, Bug, Sword } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { GameLevelPlayer } from './GameLevelPlayer';
import { CodeHeroGame } from './CodeHeroGame';
import { DungeonCodeQuest } from './DungeonCodeQuest';

type GameLevel = {
  id: string;
  category_id: string;
  title: string;
  description: string;
  level_number: number;
  difficulty: string;
  challenge: any;
  solution: string;
  coins_reward: number;
  xp_reward: number;
  required_level: number;
};

type UserProgress = {
  level_id: string;
  completed: boolean;
  stars: number;
};

type GameCategoriesProps = {
  onTreasureQuestClick?: () => void;
};

export const GameCategories = ({ onTreasureQuestClick }: GameCategoriesProps) => {
  const { user, profile } = useAuth();
  const [levels, setLevels] = useState<GameLevel[]>([]);
  const [progress, setProgress] = useState<UserProgress[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedLevel, setSelectedLevel] = useState<GameLevel | null>(null);
  const [showCodeHero, setShowCodeHero] = useState(false);
  const [showDungeonQuest, setShowDungeonQuest] = useState(false);

  useEffect(() => {
    fetchCategories();
    if (user) {
      fetchProgress();
    }
  }, [user]);

  useEffect(() => {
    if (selectedCategory) {
      fetchLevels(selectedCategory);
    }
  }, [selectedCategory]);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('game_categories')
        .select('*')
        .order('name');

      if (error) throw error;
      if (data && data.length > 0) {
        setSelectedCategory(data[0].id);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchLevels = async (categoryId: string) => {
    try {
      const { data, error } = await supabase
        .from('game_levels')
        .select('*')
        .eq('category_id', categoryId)
        .order('level_number');

      if (error) throw error;
      if (data) setLevels(data);
    } catch (error) {
      console.error('Error fetching levels:', error);
    }
  };

  const fetchProgress = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_game_progress')
        .select('level_id, completed, stars')
        .eq('user_id', user.id);

      if (error) throw error;
      if (data) setProgress(data);
    } catch (error) {
      console.error('Error fetching progress:', error);
    }
  };

  const getLevelProgress = (levelId: string) => {
    return progress.find((p) => p.level_id === levelId);
  };

  const isLevelUnlocked = (level: GameLevel) => {
    if (!profile) return false;
    return (profile.level || 1) >= level.required_level;
  };

  const filteredLevels = levels;

  return (
    <div className="w-full">
      {/* Hero Section - Compact */}
      <section className="relative bg-gradient-to-r from-gray-800/80 to-gray-900/80 backdrop-blur-md rounded-2xl p-6 mb-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-transparent to-emerald-500/10"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-white mb-2">🎮 Trung Tâm Trò Chơi</h1>
            <p className="text-gray-400">Học lập trình qua các trò chơi thú vị!</p>
          </div>
          <div className="flex gap-3">
            <button onClick={onTreasureQuestClick} className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-gray-900 rounded-xl font-bold transition-all hover:scale-105 flex items-center gap-2">
              🏆 Kho Báu
            </button>
          </div>
        </div>
      </section>

      {/* Featured Games - Code Hero Adventure */}
      <section className="mb-8">
        <h2 className="text-2xl font-black text-white mb-4 flex items-center gap-2">
          <Star className="w-6 h-6 text-emerald-400" /> Game Nổi Bật
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Code Hero Adventure Card */}
          <div 
            onClick={() => setShowCodeHero(true)}
            className="group relative bg-gradient-to-br from-blue-900/50 to-purple-900/50 rounded-2xl overflow-hidden border-2 border-blue-500/30 hover:border-blue-400 transition-all cursor-pointer hover:scale-[1.02] hover:shadow-xl hover:shadow-blue-500/20"
          >
            {/* Game Preview Image */}
            <div className="relative h-40 bg-gradient-to-br from-blue-600 to-purple-700 flex items-center justify-center overflow-hidden">
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAgTSAwIDIwIEwgNDAgMjAgTSAyMCAwIEwgMjAgNDAgTSAwIDMwIEwgNDAgMzAgTSAzMCAwIEwgMzAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjEpIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-50"></div>
              {/* Animated characters */}
              <div className="relative flex items-center gap-8">
                <div className="w-16 h-16 bg-blue-500 rounded-lg flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
                  <span className="text-3xl">🦸</span>
                </div>
                <div className="text-4xl animate-pulse">⚔️</div>
                <div className="w-14 h-14 bg-red-500 rounded-full flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
                  <Bug className="w-8 h-8 text-white" />
                </div>
              </div>
              {/* Badge */}
              <div className="absolute top-3 left-3 px-3 py-1 bg-gradient-to-r from-emerald-400 to-green-500 text-gray-900 text-xs font-black rounded-full">
                🔥 HOT
              </div>
              <div className="absolute top-3 right-3 px-2 py-1 bg-purple-500/80 text-white text-xs font-bold rounded">
                30 Màn
              </div>
            </div>
            {/* Game Info */}
            <div className="p-4">
              <h3 className="text-xl font-black text-white mb-1 group-hover:text-blue-400 transition-colors">
                Code Hero Adventure
              </h3>
              <p className="text-gray-400 text-sm mb-3">
                Điều khiển chiến binh tiêu diệt bug bằng kiến thức Python! 150+ câu hỏi, 30 màn chơi.
              </p>
              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded font-medium">Python</span>
                  <span className="px-2 py-1 bg-purple-500/20 text-purple-400 text-xs rounded font-medium">Action</span>
                </div>
                <div className="flex items-center gap-1 text-emerald-400 text-sm">
                  <Star className="w-4 h-4 fill-emerald-400" />
                  <span className="font-bold">4.9</span>
                </div>
              </div>
            </div>
          </div>

          {/* Treasure Quest Card */}
          <div 
            onClick={onTreasureQuestClick}
            className="group relative bg-gradient-to-br from-emerald-900/50 to-green-900/50 rounded-2xl overflow-hidden border-2 border-emerald-500/30 hover:border-emerald-400 transition-all cursor-pointer hover:scale-[1.02] hover:shadow-xl hover:shadow-emerald-500/20"
          >
            <div className="relative h-40 bg-gradient-to-br from-emerald-600 to-green-600 flex items-center justify-center">
              <div className="text-6xl group-hover:scale-110 transition-transform">🗺️</div>
              <div className="absolute top-3 left-3 px-3 py-1 bg-white/20 text-white text-xs font-bold rounded-full">
                ⭐ Popular
              </div>
            </div>
            <div className="p-4">
              <h3 className="text-xl font-black text-white mb-1 group-hover:text-emerald-400 transition-colors">
                Kho Báu Bị Mất
              </h3>
              <p className="text-gray-400 text-sm mb-3">
                Khám phá bản đồ, giải câu đố và tìm kho báu ẩn giấu!
              </p>
              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 text-xs rounded font-medium">Puzzle</span>
                  <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded font-medium">Adventure</span>
                </div>
                <div className="flex items-center gap-1 text-emerald-400 text-sm">
                  <Star className="w-4 h-4 fill-emerald-400" />
                  <span className="font-bold">4.8</span>
                </div>
              </div>
            </div>
          </div>

          {/* Dungeon Code Quest Card */}
          <div 
            onClick={() => setShowDungeonQuest(true)}
            className="group relative bg-gradient-to-br from-purple-900/50 to-pink-900/50 rounded-2xl overflow-hidden border-2 border-purple-500/30 hover:border-purple-400 transition-all cursor-pointer hover:scale-[1.02] hover:shadow-xl hover:shadow-purple-500/20"
          >
            <div className="relative h-40 bg-gradient-to-br from-purple-700 to-pink-700 flex items-center justify-center overflow-hidden">
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSJyZ2JhKDAsMCwwLDAuMykiLz48cmVjdCB4PSIwIiB5PSIwIiB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIGZpbGw9InJnYmEoMCwwLDAsMC4yKSIvPjxyZWN0IHg9IjIwIiB5PSIyMCIgd2lkdGg9IjIwIiBoZWlnaHQ9IjIwIiBmaWxsPSJyZ2JhKDAsMCwwLDAuMikiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-50"></div>
              <div className="relative flex items-center gap-6">
                <div className="w-14 h-14 bg-purple-500 rounded-lg flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
                  <span className="text-3xl">🧙</span>
                </div>
                <Sword className="w-10 h-10 text-emerald-400 animate-pulse" />
                <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
                  <span className="text-2xl">👹</span>
                </div>
              </div>
              <div className="absolute top-3 left-3 px-3 py-1 bg-gradient-to-r from-purple-400 to-pink-500 text-white text-xs font-black rounded-full">
                ⚔️ NEW
              </div>
              <div className="absolute top-3 right-3 px-2 py-1 bg-purple-500/80 text-white text-xs font-bold rounded">
                5 Màn
              </div>
            </div>
            <div className="p-4">
              <h3 className="text-xl font-black text-white mb-1 group-hover:text-purple-400 transition-colors">
                Dungeon Code Quest
              </h3>
              <p className="text-gray-400 text-sm mb-3">
                Khám phá hầm ngục, chiến đấu quái vật bằng kiến thức Python!
              </p>
              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  <span className="px-2 py-1 bg-purple-500/20 text-purple-400 text-xs rounded font-medium">Python</span>
                  <span className="px-2 py-1 bg-pink-500/20 text-pink-400 text-xs rounded font-medium">RPG</span>
                </div>
                <div className="flex items-center gap-1 text-emerald-400 text-sm">
                  <Star className="w-4 h-4 fill-emerald-400" />
                  <span className="font-bold">4.9</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Coming Soon Games */}
      <section>
        <h2 className="text-2xl font-black text-white mb-4 flex items-center gap-2">
          <Gamepad2 className="w-6 h-6 text-gray-400" /> Sắp Ra Mắt
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* SQL Detective */}
          <div className="group bg-gradient-to-br from-green-900/30 to-emerald-900/30 rounded-xl overflow-hidden border border-green-500/20 opacity-80">
            <div className="h-32 bg-gradient-to-br from-green-700/50 to-emerald-800/50 flex items-center justify-center relative">
              <span className="text-4xl">🔍</span>
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                <span className="px-3 py-1.5 bg-green-600/80 text-white text-xs font-bold rounded-lg">Coming Soon</span>
              </div>
            </div>
            <div className="p-3">
              <h3 className="font-bold text-white mb-1">SQL Detective</h3>
              <p className="text-gray-400 text-xs mb-2">Giải mã dữ liệu với SQL queries</p>
              <div className="flex gap-1">
                <span className="px-1.5 py-0.5 bg-green-500/20 text-green-400 text-[10px] rounded">SQL</span>
                <span className="px-1.5 py-0.5 bg-emerald-500/20 text-emerald-400 text-[10px] rounded">Mystery</span>
              </div>
            </div>
          </div>

          {/* HTML Builder */}
          <div className="group bg-gradient-to-br from-green-900/30 to-red-900/30 rounded-xl overflow-hidden border border-green-500/20 opacity-80">
            <div className="h-32 bg-gradient-to-br from-green-700/50 to-red-800/50 flex items-center justify-center relative">
              <span className="text-4xl">🏗️</span>
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                <span className="px-3 py-1.5 bg-green-600/80 text-white text-xs font-bold rounded-lg">Coming Soon</span>
              </div>
            </div>
            <div className="p-3">
              <h3 className="font-bold text-white mb-1">HTML Builder</h3>
              <p className="text-gray-400 text-xs mb-2">Xây dựng website từ các khối</p>
              <div className="flex gap-1">
                <span className="px-1.5 py-0.5 bg-green-500/20 text-green-400 text-[10px] rounded">HTML</span>
                <span className="px-1.5 py-0.5 bg-red-500/20 text-red-400 text-[10px] rounded">CSS</span>
              </div>
            </div>
          </div>

          {/* Algorithm Race */}
          <div className="group bg-gradient-to-br from-cyan-900/30 to-blue-900/30 rounded-xl overflow-hidden border border-cyan-500/20 opacity-80">
            <div className="h-32 bg-gradient-to-br from-cyan-700/50 to-blue-800/50 flex items-center justify-center relative">
              <span className="text-4xl">🏎️</span>
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                <span className="px-3 py-1.5 bg-cyan-600/80 text-white text-xs font-bold rounded-lg">Coming Soon</span>
              </div>
            </div>
            <div className="p-3">
              <h3 className="font-bold text-white mb-1">Algorithm Race</h3>
              <p className="text-gray-400 text-xs mb-2">Đua xe với thuật toán tối ưu</p>
              <div className="flex gap-1">
                <span className="px-1.5 py-0.5 bg-cyan-500/20 text-cyan-400 text-[10px] rounded">Algorithm</span>
                <span className="px-1.5 py-0.5 bg-blue-500/20 text-blue-400 text-[10px] rounded">Racing</span>
              </div>
            </div>
          </div>

          {/* Git Quest */}
          <div className="group bg-gradient-to-br from-pink-900/30 to-purple-900/30 rounded-xl overflow-hidden border border-pink-500/20 opacity-80">
            <div className="h-32 bg-gradient-to-br from-pink-700/50 to-purple-800/50 flex items-center justify-center relative">
              <span className="text-4xl">🌳</span>
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                <span className="px-3 py-1.5 bg-pink-600/80 text-white text-xs font-bold rounded-lg">Coming Soon</span>
              </div>
            </div>
            <div className="p-3">
              <h3 className="font-bold text-white mb-1">Git Quest</h3>
              <p className="text-gray-400 text-xs mb-2">Làm chủ Git qua phiêu lưu</p>
              <div className="flex gap-1">
                <span className="px-1.5 py-0.5 bg-pink-500/20 text-pink-400 text-[10px] rounded">Git</span>
                <span className="px-1.5 py-0.5 bg-purple-500/20 text-purple-400 text-[10px] rounded">Adventure</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Database Games - Hidden when empty */}
      {filteredLevels.length > 0 && (
        <section className="mt-8">
          <h2 className="text-2xl font-black text-white mb-4">Thêm Trò Chơi</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {filteredLevels.map((level) => {
              const levelProgress = getLevelProgress(level.id);
              const isUnlocked = isLevelUnlocked(level);
              const isCompleted = levelProgress?.completed || false;
              return (
                <div key={level.id} onClick={() => isUnlocked && setSelectedLevel(level)}
                  className="bg-gray-800/70 rounded-xl overflow-hidden border border-gray-700 hover:border-emerald-400 transition-all hover:scale-105 cursor-pointer group">
                  <div className="relative h-32 bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center">
                    {!isUnlocked && <div className="absolute inset-0 bg-black/60 flex items-center justify-center"><Lock className="w-10 h-10 text-gray-400" /></div>}
                    <Gamepad2 className="w-12 h-12 text-emerald-400 opacity-50 group-hover:opacity-100" />
                    {isCompleted && <Trophy className="absolute top-2 right-2 w-5 h-5 text-emerald-400" />}
                  </div>
                  <div className="p-3">
                    <h3 className="font-bold text-white text-sm mb-1 group-hover:text-emerald-400">{level.title}</h3>
                    <p className="text-gray-400 text-xs line-clamp-2">{level.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}



      {selectedLevel && (
        <GameLevelPlayer
          level={selectedLevel}
          onClose={() => setSelectedLevel(null)}
          onComplete={() => {
            fetchProgress();
            fetchLevels(selectedCategory);
          }}
        />
      )}

      {/* Code Hero Adventure Modal */}
      {showCodeHero && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="relative bg-gray-900 rounded-3xl p-6 max-w-5xl w-full border border-gray-700">
            <button
              onClick={() => setShowCodeHero(false)}
              className="absolute top-4 right-4 p-2 hover:bg-gray-700 rounded-lg text-gray-400 hover:text-white z-10"
            >
              ✕
            </button>
            <CodeHeroGame />
          </div>
        </div>
      )}

      {/* Dungeon Code Quest Modal */}
      {showDungeonQuest && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="relative bg-gray-900 rounded-3xl p-6 max-w-5xl w-full border border-purple-700/50">
            <button
              onClick={() => setShowDungeonQuest(false)}
              className="absolute top-4 right-4 p-2 hover:bg-gray-700 rounded-lg text-gray-400 hover:text-white z-10"
            >
              ✕
            </button>
            <DungeonCodeQuest />
          </div>
        </div>
      )}
    </div>
  );
};

