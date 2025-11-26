import { useState, useEffect } from 'react';
import { Gamepad2, Trophy, Star, Lock, Zap } from 'lucide-react';
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
};

export const GameCategories = ({ onLevelSelect }: GameCategoriesProps) => {
  const { user, profile } = useAuth();
  const [categories, setCategories] = useState<GameCategory[]>([]);
  const [levels, setLevels] = useState<GameLevel[]>([]);
  const [progress, setProgress] = useState<UserProgress[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedLevel, setSelectedLevel] = useState<GameLevel | null>(null);
  const [loading, setLoading] = useState(true);

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
    } finally {
      setLoading(false);
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
    easy: 'bg-green-100 text-green-700 border-green-300',
    medium: 'bg-yellow-100 text-yellow-700 border-yellow-300',
    hard: 'bg-red-100 text-red-700 border-red-300',
  };

  const difficultyLabels = {
    easy: 'Dễ',
    medium: 'Trung bình',
    hard: 'Khó',
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const selectedCat = categories.find((c) => c.id === selectedCategory);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-black text-gray-900 mb-4">
          Trò Chơi Lập Trình
        </h1>
        <p className="text-xl text-gray-600">
          Rèn luyện kỹ năng qua các thử thách thú vị
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {categories.map((category) => {
          const categoryLevels = levels.filter((l) => l.category_id === category.id);
          const completedLevels = categoryLevels.filter(
            (l) => getLevelProgress(l.id)?.completed
          ).length;

          return (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`p-6 rounded-3xl border-4 transition-all hover:scale-105 text-left ${
                selectedCategory === category.id
                  ? 'border-blue-500 bg-blue-50 shadow-2xl'
                  : 'border-gray-200 bg-white shadow-lg hover:border-blue-300'
              }`}
            >
              <div className="flex items-start gap-4">
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center text-white flex-shrink-0"
                  style={{ backgroundColor: category.color }}
                >
                  <Gamepad2 className="w-8 h-8" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-gray-900 mb-2">
                    {category.name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">
                    {category.description}
                  </p>
                  {categoryLevels.length > 0 && (
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full transition-all"
                          style={{
                            width: `${(completedLevels / categoryLevels.length) * 100}%`,
                          }}
                        />
                      </div>
                      <span className="text-xs text-gray-600 font-medium">
                        {completedLevels}/{categoryLevels.length}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {selectedCat && (
        <div className="bg-white rounded-3xl p-8 border-2 border-gray-200 shadow-xl">
          <div className="flex items-center gap-4 mb-8">
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center text-white"
              style={{ backgroundColor: selectedCat.color }}
            >
              <Gamepad2 className="w-10 h-10" />
            </div>
            <div>
              <h2 className="text-3xl font-black text-gray-900 mb-2">
                {selectedCat.name}
              </h2>
              <p className="text-gray-600">{selectedCat.description}</p>
            </div>
          </div>

          {levels.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-2xl">
              <Trophy className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Chưa có màn chơi
              </h3>
              <p className="text-gray-600">
                Các màn chơi đang được cập nhật
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {levels.map((level) => {
                const levelProgress = getLevelProgress(level.id);
                const isUnlocked = isLevelUnlocked(level);
                const isCompleted = levelProgress?.completed || false;

                return (
                  <button
                    key={level.id}
                    onClick={() => isUnlocked && setSelectedLevel(level)}
                    disabled={!isUnlocked}
                    className={`relative p-6 rounded-2xl border-4 transition-all ${
                      isCompleted
                        ? 'border-green-500 bg-green-50 hover:scale-105'
                        : isUnlocked
                        ? 'border-blue-500 bg-white hover:scale-105 hover:shadow-xl'
                        : 'border-gray-300 bg-gray-100 cursor-not-allowed opacity-60'
                    }`}
                  >
                    {!isUnlocked && (
                      <div className="absolute top-2 right-2">
                        <Lock className="w-5 h-5 text-gray-500" />
                      </div>
                    )}

                    {isCompleted && (
                      <div className="absolute top-2 right-2">
                        <Trophy className="w-5 h-5 text-yellow-600" />
                      </div>
                    )}

                    <div className="text-center">
                      <div className="text-4xl font-black text-gray-900 mb-2">
                        {level.level_number}
                      </div>

                      {levelProgress && levelProgress.stars > 0 && (
                        <div className="flex justify-center gap-1 mb-2">
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

                      <h4 className="font-bold text-sm text-gray-900 mb-2 line-clamp-2">
                        {level.title}
                      </h4>

                      <div
                        className={`text-xs px-2 py-1 rounded-full border-2 inline-block ${
                          difficultyColors[level.difficulty as keyof typeof difficultyColors]
                        }`}
                      >
                        {difficultyLabels[level.difficulty as keyof typeof difficultyLabels]}
                      </div>

                      {isUnlocked && (
                        <div className="mt-3 flex items-center justify-center gap-2 text-xs text-gray-600">
                          <div className="flex items-center gap-1">
                            <Zap className="w-3 h-3 text-orange-500" />
                            <span>+{level.xp_reward}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Trophy className="w-3 h-3 text-yellow-600" />
                            <span>+{level.coins_reward}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
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
    </div>
  );
};
