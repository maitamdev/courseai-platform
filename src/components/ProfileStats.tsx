import { useEffect, useState } from 'react';
import { Trophy, Target, Zap, ShoppingBag, Award } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, Badge, UserBadge, DailyQuest, UserDailyProgress } from '../lib/supabase';

type ProfileStatsProps = {
  completedLessonsCount: number;
  foundTreasuresCount: number;
  purchasedCoursesCount: number;
};

export const ProfileStats = ({
  completedLessonsCount,
  foundTreasuresCount,
  purchasedCoursesCount,
}: ProfileStatsProps) => {
  const { user, profile } = useAuth();
  const [badges, setBadges] = useState<Badge[]>([]);
  const [userBadges, setUserBadges] = useState<UserBadge[]>([]);
  const [quests, setQuests] = useState<DailyQuest[]>([]);
  const [questProgress, setQuestProgress] = useState<UserDailyProgress[]>([]);

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    if (!user) return;

    const today = new Date().toISOString().split('T')[0];

    const [badgesRes, userBadgesRes, questsRes, progressRes] = await Promise.all([
      supabase.from('badges').select('*'),
      supabase.from('user_badges').select('*').eq('user_id', user.id),
      supabase.from('daily_quests').select('*').eq('is_active', true),
      supabase
        .from('user_daily_progress')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', today),
    ]);

    if (badgesRes.data) setBadges(badgesRes.data);
    if (userBadgesRes.data) setUserBadges(userBadgesRes.data);
    if (questsRes.data) setQuests(questsRes.data);
    if (progressRes.data) setQuestProgress(progressRes.data);
  };

  const hasBadge = (badgeId: string) => {
    return userBadges.some((ub) => ub.badge_id === badgeId);
  };

  const getQuestProgress = (questId: string) => {
    return questProgress.find((p) => p.quest_id === questId);
  };

  const earnedBadges = badges.filter((b) => hasBadge(b.id));
  const xpToNextLevel = (profile?.level || 1) * 100;
  const xpProgress = ((profile?.xp || 0) % 100 / 100) * 100;

  const iconMap: Record<string, any> = {
    star: Trophy,
    book: Target,
    'graduation-cap': Award,
    map: Target,
    crown: Trophy,
    zap: Zap,
    trophy: Trophy,
    'shopping-bag': ShoppingBag,
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
        <h3 className="text-xl font-bold mb-4">Cấp độ & Kinh nghiệm</h3>
        <div className="flex items-center gap-4 mb-3">
          <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
            <span className="text-2xl font-bold">Lv {profile?.level || 1}</span>
          </div>
          <div className="flex-1">
            <div className="flex justify-between text-sm mb-1">
              <span>{profile?.xp || 0} XP</span>
              <span>{xpToNextLevel} XP</span>
            </div>
            <div className="w-full bg-white bg-opacity-30 rounded-full h-3">
              <div
                className="bg-white h-full rounded-full transition-all"
                style={{ width: `${xpProgress}%` }}
              />
            </div>
          </div>
        </div>
        <p className="text-sm opacity-90">
          Còn {xpToNextLevel - (profile?.xp || 0) % 100} XP nữa lên cấp!
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Target className="w-5 h-5 text-orange-600" />
          Nhiệm Vụ Hàng Ngày
        </h3>
        <div className="space-y-3">
          {quests.map((quest) => {
            const progress = getQuestProgress(quest.id);
            const completed = progress?.completed || false;
            const current = progress?.current_value || 0;
            const percentage = Math.min((current / quest.target_value) * 100, 100);

            return (
              <div
                key={quest.id}
                className={`p-4 rounded-lg border-2 ${
                  completed ? 'bg-green-50 border-green-300' : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-semibold text-gray-900">{quest.title}</h4>
                    <p className="text-xs text-gray-600">{quest.description}</p>
                  </div>
                  {completed && <Award className="w-5 h-5 text-green-600" />}
                </div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-gray-600">
                    {current}/{quest.target_value}
                  </span>
                  <span className="font-semibold text-orange-600">
                    +{quest.xp_reward} XP, +{quest.coins_reward} xu
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-full rounded-full transition-all ${
                      completed ? 'bg-green-500' : 'bg-blue-500'
                    }`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-600" />
          Huy Hiệu ({earnedBadges.length}/{badges.length})
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {badges.map((badge) => {
            const earned = hasBadge(badge.id);
            const Icon = iconMap[badge.icon] || Trophy;

            return (
              <div
                key={badge.id}
                className={`p-4 rounded-lg border-2 text-center transition-all ${
                  earned
                    ? 'bg-yellow-50 border-yellow-300'
                    : 'bg-gray-50 border-gray-200 opacity-50'
                }`}
                title={badge.description}
              >
                <Icon
                  className={`w-8 h-8 mx-auto mb-2 ${
                    earned ? 'text-yellow-600' : 'text-gray-400'
                  }`}
                />
                <p className="text-xs font-semibold text-gray-900">{badge.name}</p>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Thống Kê</h3>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-3xl font-bold text-blue-600">{completedLessonsCount}</div>
            <p className="text-xs text-gray-600 mt-1">Bài học</p>
          </div>
          <div>
            <div className="text-3xl font-bold text-orange-600">{foundTreasuresCount}</div>
            <p className="text-xs text-gray-600 mt-1">Kho báu</p>
          </div>
          <div>
            <div className="text-3xl font-bold text-green-600">{purchasedCoursesCount}</div>
            <p className="text-xs text-gray-600 mt-1">Khóa học</p>
          </div>
        </div>
      </div>
    </div>
  );
};
