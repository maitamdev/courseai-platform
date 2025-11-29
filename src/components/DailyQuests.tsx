import { useState, useEffect } from 'react';
import { Target, CheckCircle, Coins, Star, Zap, BookOpen, Gamepad2, Users, MessageCircle, LucideIcon } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

type QuestType = 'lesson' | 'game' | 'social' | 'login';

type Quest = {
  id: string;
  title: string;
  description: string;
  iconName: string;
  target: number;
  current: number;
  reward: { coins: number; xp: number };
  type: QuestType;
};

const ICON_MAP: Record<string, LucideIcon> = {
  Zap, BookOpen, Gamepad2, Users, MessageCircle
};

const DEFAULT_QUESTS: Omit<Quest, 'current'>[] = [
  { id: '1', title: 'Đăng nhập', description: 'Đăng nhập vào hệ thống', iconName: 'Zap', target: 1, reward: { coins: 5, xp: 10 }, type: 'login' },
  { id: '2', title: 'Học 2 bài', description: 'Hoàn thành 2 bài học', iconName: 'BookOpen', target: 2, reward: { coins: 20, xp: 40 }, type: 'lesson' },
  { id: '3', title: 'Chơi game', description: 'Chơi 1 game bất kỳ', iconName: 'Gamepad2', target: 1, reward: { coins: 15, xp: 30 }, type: 'game' },
  { id: '4', title: 'Kết bạn', description: 'Gửi 1 lời mời kết bạn', iconName: 'Users', target: 1, reward: { coins: 10, xp: 20 }, type: 'social' },
  { id: '5', title: 'Nhắn tin', description: 'Gửi 3 tin nhắn cho bạn bè', iconName: 'MessageCircle', target: 3, reward: { coins: 10, xp: 20 }, type: 'social' },
];

export const DailyQuests = () => {
  const { user, profile, refreshProfile } = useAuth();
  const [quests, setQuests] = useState<Quest[]>([]);
  const [lastReset, setLastReset] = useState<string | null>(null);

  useEffect(() => {
    if (user) loadQuests();
  }, [user]);

  const loadQuests = () => {
    const today = new Date().toDateString();
    const saved = localStorage.getItem(`quests_${user?.id}`);
    
    if (saved) {
      const data = JSON.parse(saved);
      if (data.date === today) {
        setQuests(data.quests);
        setLastReset(data.date);
        return;
      }
    }
    
    // Generate new daily quests
    const newQuests: Quest[] = DEFAULT_QUESTS.map(q => ({
      ...q,
      current: q.type === 'login' ? 1 : 0
    }));
    
    setQuests(newQuests);
    setLastReset(today);
    saveQuests(newQuests, today);
  };

  const saveQuests = (q: Quest[], date: string) => {
    localStorage.setItem(`quests_${user?.id}`, JSON.stringify({ quests: q, date }));
  };

  const claimReward = async (quest: Quest) => {
    if (quest.current < quest.target || !user || !profile) return;
    
    const claimed = localStorage.getItem(`quest_claimed_${user.id}_${quest.id}_${lastReset}`);
    if (claimed) return;

    localStorage.setItem(`quest_claimed_${user.id}_${quest.id}_${lastReset}`, 'true');

    await supabase.from('profiles').update({
      total_coins: (profile.total_coins || 0) + quest.reward.coins,
      xp: (profile.xp || 0) + quest.reward.xp,
    }).eq('id', user.id);
    
    refreshProfile();
  };

  const isCompleted = (quest: Quest) => quest.current >= quest.target;
  const isClaimed = (quest: Quest) => {
    return localStorage.getItem(`quest_claimed_${user?.id}_${quest.id}_${lastReset}`) === 'true';
  };

  const completedCount = quests.filter(q => isCompleted(q)).length;

  const getIcon = (iconName: string) => ICON_MAP[iconName] || Zap;

  return (
    <div className="bg-gradient-to-br from-indigo-900/30 to-purple-900/30 rounded-2xl p-6 border border-indigo-500/30">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center">
            <Target className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Nhiệm Vụ Hàng Ngày</h3>
            <p className="text-gray-400 text-sm">Reset lúc 00:00</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-black text-indigo-400">{completedCount}/{quests.length}</div>
          <div className="text-xs text-gray-400">Hoàn thành</div>
        </div>
      </div>

      <div className="mb-6">
        <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all"
            style={{ width: `${(completedCount / quests.length) * 100}%` }}
          />
        </div>
      </div>

      <div className="space-y-3">
        {quests.map(quest => {
          const Icon = getIcon(quest.iconName);
          const completed = isCompleted(quest);
          const claimed = isClaimed(quest);
          const progress = Math.min((quest.current / quest.target) * 100, 100);

          return (
            <div
              key={quest.id}
              className={`p-4 rounded-xl border transition-all ${
                completed
                  ? claimed
                    ? 'bg-gray-800/30 border-gray-700/50 opacity-60'
                    : 'bg-green-500/10 border-green-500/50'
                  : 'bg-gray-800/50 border-gray-700/50'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  completed ? 'bg-green-500/20' : 'bg-gray-700/50'
                }`}>
                  {completed ? (
                    <CheckCircle className="w-5 h-5 text-green-400" />
                  ) : (
                    <Icon className="w-5 h-5 text-gray-400" />
                  )}
                </div>
                <div className="flex-1">
                  <h4 className={`font-medium ${completed ? 'text-green-400' : 'text-white'}`}>
                    {quest.title}
                  </h4>
                  <p className="text-xs text-gray-500">{quest.description}</p>
                  {!completed && (
                    <div className="mt-2">
                      <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-500" style={{ width: `${progress}%` }} />
                      </div>
                      <p className="text-[10px] text-gray-500 mt-1">{quest.current}/{quest.target}</p>
                    </div>
                  )}
                </div>
                <div className="text-right">
                  {completed && !claimed ? (
                    <button
                      onClick={() => claimReward(quest)}
                      className="px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white text-sm font-bold rounded-lg transition-colors"
                    >
                      Nhận
                    </button>
                  ) : claimed ? (
                    <span className="text-xs text-gray-500">Đã nhận</span>
                  ) : (
                    <div className="text-xs text-gray-400">
                      <div className="flex items-center gap-1"><Coins className="w-3 h-3 text-emerald-400" />+{quest.reward.coins}</div>
                      <div className="flex items-center gap-1"><Star className="w-3 h-3 text-purple-400" />+{quest.reward.xp}</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
