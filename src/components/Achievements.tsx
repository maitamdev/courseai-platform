import { useState, useEffect } from 'react';
import { Trophy, Star, BookOpen, Users, Coins, Crown, Target, Lock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

type Achievement = {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'learning' | 'social' | 'gaming' | 'special';
  requirement: { type: string; value: number };
  reward: { coins: number; xp: number };
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
};

const ACHIEVEMENTS: Achievement[] = [
  // Learning
  { id: 'first_lesson', title: 'Bước Đầu Tiên', description: 'Hoàn thành bài học đầu tiên', icon: '📚', category: 'learning', requirement: { type: 'lessons', value: 1 }, reward: { coins: 10, xp: 20 }, rarity: 'common' },
  { id: 'lesson_master', title: 'Học Sinh Chăm Chỉ', description: 'Hoàn thành 10 bài học', icon: '🎓', category: 'learning', requirement: { type: 'lessons', value: 10 }, reward: { coins: 50, xp: 100 }, rarity: 'rare' },
  { id: 'course_complete', title: 'Tốt Nghiệp', description: 'Hoàn thành 1 khóa học', icon: '🏆', category: 'learning', requirement: { type: 'courses', value: 1 }, reward: { coins: 100, xp: 200 }, rarity: 'epic' },
  
  // Gaming
  { id: 'first_game', title: 'Game Thủ Mới', description: 'Chơi game đầu tiên', icon: '🎮', category: 'gaming', requirement: { type: 'games', value: 1 }, reward: { coins: 10, xp: 20 }, rarity: 'common' },
  { id: 'treasure_hunter', title: 'Thợ Săn Kho Báu', description: 'Tìm 5 kho báu', icon: '🗺️', category: 'gaming', requirement: { type: 'treasures', value: 5 }, reward: { coins: 50, xp: 100 }, rarity: 'rare' },
  { id: 'code_hero', title: 'Code Hero', description: 'Hoàn thành 10 level Code Hero', icon: '⚔️', category: 'gaming', requirement: { type: 'code_hero', value: 10 }, reward: { coins: 100, xp: 200 }, rarity: 'epic' },
  
  // Social
  { id: 'first_friend', title: 'Bạn Mới', description: 'Kết bạn với 1 người', icon: '👋', category: 'social', requirement: { type: 'friends', value: 1 }, reward: { coins: 10, xp: 20 }, rarity: 'common' },
  { id: 'popular', title: 'Người Nổi Tiếng', description: 'Có 10 bạn bè', icon: '🌟', category: 'social', requirement: { type: 'friends', value: 10 }, reward: { coins: 50, xp: 100 }, rarity: 'rare' },
  { id: 'influencer', title: 'Influencer', description: 'Nhận 50 likes trên bài viết', icon: '❤️', category: 'social', requirement: { type: 'likes', value: 50 }, reward: { coins: 100, xp: 200 }, rarity: 'epic' },
  
  // Special
  { id: 'streak_7', title: 'Kiên Trì', description: 'Điểm danh 7 ngày liên tiếp', icon: '🔥', category: 'special', requirement: { type: 'streak', value: 7 }, reward: { coins: 100, xp: 200 }, rarity: 'rare' },
  { id: 'rich', title: 'Đại Gia', description: 'Sở hữu 1000 xu', icon: '💰', category: 'special', requirement: { type: 'coins', value: 1000 }, reward: { coins: 0, xp: 500 }, rarity: 'epic' },
  { id: 'legend', title: 'Huyền Thoại', description: 'Đạt level 50', icon: '👑', category: 'special', requirement: { type: 'level', value: 50 }, reward: { coins: 500, xp: 1000 }, rarity: 'legendary' },
];

const RARITY_COLORS = {
  common: 'from-gray-500 to-gray-600',
  rare: 'from-blue-500 to-blue-600',
  epic: 'from-purple-500 to-purple-600',
  legendary: 'from-emerald-500 to-green-500',
};

export const Achievements = () => {
  const { user, profile, refreshProfile } = useAuth();
  const [unlockedIds, setUnlockedIds] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [progressData, setProgressData] = useState<Record<string, number>>({});


  useEffect(() => {
    if (user) loadAchievements();
  }, [user]);

  const loadAchievements = async () => {
    if (!user) return;
    setLoading(true);

    try {
      // Load unlocked achievements from database
      const { data: achievements } = await supabase
        .from('user_achievements')
        .select('achievement_id')
        .eq('user_id', user.id);

      if (achievements) {
        setUnlockedIds(achievements.map(a => a.achievement_id));
      }

      // Load progress data
      const { data: progress } = await supabase
        .from('achievement_progress')
        .select('achievement_type, current_value')
        .eq('user_id', user.id);

      if (progress) {
        const progressMap: Record<string, number> = {};
        progress.forEach(p => {
          progressMap[p.achievement_type] = p.current_value;
        });
        setProgressData(progressMap);
      }
    } catch {
      // Fallback to localStorage
      const saved = localStorage.getItem(`achievements_${user.id}`);
      if (saved) setUnlockedIds(JSON.parse(saved));
    }
    
    setLoading(false);
  };

  const getProgress = (achievement: Achievement): number => {
    if (!profile) return 0;
    const { type, value } = achievement.requirement;
    let current = 0;
    
    // First check database progress
    if (progressData[type] !== undefined) {
      current = progressData[type];
    } else {
      // Fallback to profile data
      switch (type) {
        case 'level': current = profile.level || 1; break;
        case 'coins': current = profile.total_coins || 0; break;
        case 'streak': 
          const streakData = localStorage.getItem(`streak_${user?.id}`);
          current = streakData ? JSON.parse(streakData).streak || 0 : 0;
          break;
        default: current = 0;
      }
    }
    
    return Math.min((current / value) * 100, 100);
  };

  const unlockAchievement = async (achievement: Achievement) => {
    if (!user || !profile) return;

    try {
      // Insert into database
      await supabase.from('user_achievements').insert({
        user_id: user.id,
        achievement_id: achievement.id,
        coins_rewarded: achievement.reward.coins,
        xp_rewarded: achievement.reward.xp
      });

      // Update profile with rewards
      await supabase.from('profiles').update({
        total_coins: (profile.total_coins || 0) + achievement.reward.coins,
        xp: (profile.xp || 0) + achievement.reward.xp
      }).eq('id', user.id);

      refreshProfile();
      setUnlockedIds(prev => [...prev, achievement.id]);
    } catch {
      // Fallback to localStorage
      const newUnlocked = [...unlockedIds, achievement.id];
      localStorage.setItem(`achievements_${user.id}`, JSON.stringify(newUnlocked));
      setUnlockedIds(newUnlocked);
    }
  };

  const isUnlocked = (id: string) => unlockedIds.includes(id);

  const categories = [
    { id: 'all', label: 'Tất cả', icon: Trophy },
    { id: 'learning', label: 'Học tập', icon: BookOpen },
    { id: 'gaming', label: 'Game', icon: Target },
    { id: 'social', label: 'Xã hội', icon: Users },
    { id: 'special', label: 'Đặc biệt', icon: Crown },
  ];

  const filteredAchievements = selectedCategory === 'all' 
    ? ACHIEVEMENTS 
    : ACHIEVEMENTS.filter(a => a.category === selectedCategory);

  const unlockedCount = ACHIEVEMENTS.filter(a => isUnlocked(a.id)).length;

  // Check and auto-unlock achievements based on progress
  useEffect(() => {
    if (!profile || loading) return;
    
    ACHIEVEMENTS.forEach(achievement => {
      if (isUnlocked(achievement.id)) return;
      
      const progress = getProgress(achievement);
      if (progress >= 100) {
        unlockAchievement(achievement);
      }
    });
  }, [profile, progressData, loading]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="animate-pulse">
          <div className="h-32 bg-gray-800 rounded-2xl mb-6"></div>
          <div className="grid md:grid-cols-2 gap-4">
            {[1,2,3,4].map(i => (
              <div key={i} className="h-32 bg-gray-800 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }


  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-900/50 to-green-900/50 rounded-2xl p-6 mb-6 border border-emerald-500/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-green-500 rounded-2xl flex items-center justify-center">
              <Trophy className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white">Thành Tựu</h2>
              <p className="text-gray-400">Hoàn thành thử thách để nhận phần thưởng!</p>
            </div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-black text-emerald-400">{unlockedCount}/{ACHIEVEMENTS.length}</div>
            <div className="text-sm text-gray-400">Đã mở khóa</div>
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium whitespace-nowrap transition-all ${
              selectedCategory === cat.id
                ? 'bg-emerald-500 text-gray-900'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            <cat.icon className="w-4 h-4" />
            {cat.label}
          </button>
        ))}
      </div>

      {/* Achievements Grid */}
      <div className="grid md:grid-cols-2 gap-4">
        {filteredAchievements.map(achievement => {
          const unlocked = isUnlocked(achievement.id);
          const progress = getProgress(achievement);
          
          return (
            <div
              key={achievement.id}
              className={`relative p-4 rounded-xl border-2 transition-all ${
                unlocked
                  ? 'bg-gradient-to-br from-emerald-900/30 to-green-900/30 border-emerald-500/50'
                  : 'bg-gray-800/50 border-gray-700/50'
              }`}
            >
              {/* Rarity badge */}
              <div className={`absolute top-2 right-2 px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-gradient-to-r ${RARITY_COLORS[achievement.rarity]} text-white`}>
                {achievement.rarity}
              </div>

              <div className="flex items-start gap-4">
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-3xl ${
                  unlocked ? 'bg-emerald-500/20' : 'bg-gray-700/50'
                }`}>
                  {unlocked ? achievement.icon : <Lock className="w-6 h-6 text-gray-500" />}
                </div>
                <div className="flex-1">
                  <h3 className={`font-bold ${unlocked ? 'text-white' : 'text-gray-400'}`}>
                    {achievement.title}
                  </h3>
                  <p className="text-sm text-gray-500 mb-2">{achievement.description}</p>
                  
                  {/* Progress bar */}
                  {!unlocked && (
                    <div className="mb-2">
                      <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-emerald-500 to-green-500 transition-all"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <div className="text-xs text-gray-500 mt-1">{Math.round(progress)}%</div>
                    </div>
                  )}

                  {/* Rewards */}
                  <div className="flex items-center gap-3 text-xs">
                    {achievement.reward.coins > 0 && (
                      <span className="flex items-center gap-1 text-emerald-400">
                        <Coins className="w-3 h-3" /> +{achievement.reward.coins}
                      </span>
                    )}
                    {achievement.reward.xp > 0 && (
                      <span className="flex items-center gap-1 text-purple-400">
                        <Star className="w-3 h-3" /> +{achievement.reward.xp}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {unlocked && (
                <div className="absolute bottom-2 right-2 text-green-400 text-xs font-bold flex items-center gap-1">
                  ✅ Đã mở khóa
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
