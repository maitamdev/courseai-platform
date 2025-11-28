import { useState, useEffect } from 'react';
import { Gamepad2, Trophy, Star, Lock, Zap, Search } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { GameLevelPlayer } from './GameLevelPlayer';

type GameCategory = {
  id: string;
  name: string;
  slug: string;
  icon: string;
  description: string;
  difficulty: string;
  color: string;
};

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
  onLevelSelect?: (level: GameLevel) => void;
  onTreasureQuestClick?: () => void;
};

export const GameCategories = ({ onLevelSelect, onTreasureQuestClick }: GameCategoriesProps) => {
  const { user, profile } = useAuth();
  const [categories, setCategories] = useState<GameCategory[]>([]);
  const [levels, setLevels] = useState<GameLevel[]>([]);
  const [progress, setProgress] = useState<UserProgress[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedLevel, setSelectedLevel] = useState<GameLevel | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

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
        setCategories(data);
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

  const difficultyColors = {
    easy: 'bg-green-500',
    medium: 'bg-yellow-400',
    hard: 'bg-red-500',
  };

  const difficultyLabels = {
    easy: 'Beginner',
    medium: 'Intermediate',
    hard: 'Advanced',
  };

  const filteredLevels = levels.filter((level) =>
    level.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedCat = categories.find((c) => c.id === selectedCategory);

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="relative bg-gray-800/60 backdrop-blur-md rounded-3xl p-12 mb-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/10 to-transparent"></div>
        <div className="relative z-10 grid md:grid-cols-2 gap-8 items-center">
          <div>
            <h1 className="text-5xl font-black text-white mb-4">
              Nâng Cao Kỹ Năng<br />Với Thử Thách Thú Vị
            </h1>
            <p className="text-xl text-gray-300 mb-6">
              Khám phá bộ sưu tập trò chơi tương tác được thiết kế để học lập trình trở nên vui vẻ và hiệu quả. Bắt đầu chơi và xem kỹ năng của bạn phát triển!
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={onTreasureQuestClick}
                className="px-8 py-3 bg-yellow-400 hover:bg-yellow-500 text-white rounded-lg font-bold transition-all hover:scale-105"
              >
                🏆 Kho Báu Bị Mất
              </button>
              <button
                onClick={() => selectedCat && setSelectedLevel(levels[0])}
                className="px-8 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-bold transition-all hover:scale-105"
              >
                Xem Tất Cả Game
              </button>
            </div>
          </div>
          <div className="hidden md:block">
            <div className="relative">
              <div className="absolute inset-0 bg-yellow-400/20 rounded-3xl blur-3xl"></div>
              <div className="relative bg-gray-900/50 backdrop-blur-lg rounded-3xl p-8 border-2 border-gray-700">
                <div className="space-y-4">
                  <div className="flex items-center gap-4 bg-gray-800/50 rounded-xl p-4">
                    <Gamepad2 className="w-12 h-12 text-yellow-400" />
                    <div>
                      <div className="font-bold text-white">Python Maze Runner</div>
                      <div className="text-sm text-gray-400">Master loops by guiding your character</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 bg-gray-800/50 rounded-xl p-4">
                    <Trophy className="w-12 h-12 text-yellow-400" />
                    <div>
                      <div className="font-bold text-white">JavaScript Tower Defense</div>
                      <div className="text-sm text-gray-400">Learn functions and logic</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Explore Games Section */}
      <section>
        <h2 className="text-3xl font-black text-white mb-6">Khám Phá Trò Chơi</h2>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm trò chơi..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-800/60 backdrop-blur-md border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:border-yellow-400 focus:outline-none"
            />
          </div>
          <div className="flex gap-2">
            <select className="px-4 py-3 bg-gray-800/60 backdrop-blur-md border border-gray-700 rounded-lg text-white focus:border-yellow-400 focus:outline-none">
              <option>Language</option>
              <option>Python</option>
              <option>JavaScript</option>
              <option>SQL</option>
            </select>
            <select className="px-4 py-3 bg-gray-800/60 backdrop-blur-md border border-gray-700 rounded-lg text-white focus:border-yellow-400 focus:outline-none">
              <option>Difficulty</option>
              <option>Beginner</option>
              <option>Intermediate</option>
              <option>Advanced</option>
            </select>
            <select className="px-4 py-3 bg-gray-800/60 backdrop-blur-md border border-gray-700 rounded-lg text-white focus:border-yellow-400 focus:outline-none">
              <option>Concept</option>
              <option>Loops</option>
              <option>Functions</option>
              <option>Arrays</option>
            </select>
          </div>
        </div>

        {/* Game Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredLevels.map((level) => {
            const levelProgress = getLevelProgress(level.id);
            const isUnlocked = isLevelUnlocked(level);
            const isCompleted = levelProgress?.completed || false;

            return (
              <div
                key={level.id}
                className="bg-gray-800/70 backdrop-blur-lg rounded-xl overflow-hidden border border-gray-700 hover:border-yellow-400 transition-all hover:scale-105 cursor-pointer group"
                onClick={() => isUnlocked && setSelectedLevel(level)}
              >
                {/* Game Image/Preview */}
                <div className="relative h-48 bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center">
                  {!isUnlocked && (
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
                      <Lock className="w-12 h-12 text-gray-400" />
                    </div>
                  )}
                  <Gamepad2 className="w-20 h-20 text-yellow-400 opacity-50 group-hover:opacity-100 transition-opacity" />
                  
                  {/* Tags */}
                  <div className="absolute top-3 left-3 flex gap-2">
                    <span className={`px-2 py-1 ${difficultyColors[level.difficulty as keyof typeof difficultyColors]} text-white text-xs font-bold rounded`}>
                      {level.difficulty}
                    </span>
                    <span className="px-2 py-1 bg-gray-900/80 text-white text-xs font-bold rounded">
                      {difficultyLabels[level.difficulty as keyof typeof difficultyLabels]}
                    </span>
                  </div>

                  {isCompleted && (
                    <div className="absolute top-3 right-3">
                      <Trophy className="w-6 h-6 text-yellow-400" />
                    </div>
                  )}
                </div>

                {/* Game Info */}
                <div className="p-4">
                  <h3 className="text-lg font-bold text-white mb-2 group-hover:text-yellow-400 transition-colors line-clamp-1">
                    {level.title}
                  </h3>
                  <p className="text-sm text-gray-400 mb-4 line-clamp-2">
                    {level.description}
                  </p>

                  {levelProgress && levelProgress.stars > 0 && (
                    <div className="flex gap-1 mb-3">
                      {[1, 2, 3].map((star) => (
                        <Star
                          key={star}
                          className={`w-4 h-4 ${
                            star <= levelProgress.stars
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  )}

                  <button
                    disabled={!isUnlocked}
                    className={`w-full py-2 rounded-lg font-bold transition-all ${
                      isUnlocked
                        ? 'bg-yellow-400 hover:bg-yellow-500 text-white'
                        : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {isUnlocked ? 'Chơi Ngay' : 'Đã Khóa'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {filteredLevels.length === 0 && (
          <div className="text-center py-16 bg-gray-800/60 backdrop-blur-md rounded-3xl border border-gray-700">
            <Gamepad2 className="w-16 h-16 text-gray-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">
              Không tìm thấy trò chơi
            </h3>
            <p className="text-gray-400">
              Thử tìm kiếm với từ khóa khác
            </p>
          </div>
        )}
      </section>

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
    </div>
  );
};

