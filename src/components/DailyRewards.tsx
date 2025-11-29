import { useState, useEffect } from 'react';
import { Calendar, Gift, Flame, Coins, Star, Sparkles } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

type DayReward = {
  day: number;
  coins: number;
  xp: number;
  bonus?: string;
  icon: string;
};

const DAILY_REWARDS: DayReward[] = [
  { day: 1, coins: 10, xp: 20, icon: '🎁' },
  { day: 2, coins: 15, xp: 30, icon: '🎁' },
  { day: 3, coins: 20, xp: 40, icon: '🎁' },
  { day: 4, coins: 30, xp: 50, icon: '🎁' },
  { day: 5, coins: 40, xp: 60, icon: '🎁' },
  { day: 6, coins: 50, xp: 80, icon: '🎁' },
  { day: 7, coins: 100, xp: 150, bonus: 'Bonus x2!', icon: '👑' },
];

export const DailyRewards = () => {
  const { user, profile, refreshProfile } = useAuth();
  const [currentStreak, setCurrentStreak] = useState(0);
  const [canClaim, setCanClaim] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const [showReward, setShowReward] = useState(false);
  const [claimedReward, setClaimedReward] = useState<DayReward | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) loadStreakData();
  }, [user]);

  const loadStreakData = async () => {
    if (!user) return;
    setLoading(true);
    
    try {
      // Get or create daily rewards record
      const { data, error } = await supabase
        .from('daily_rewards')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code === 'PGRST116') {
        // No record exists, create one
        await supabase.from('daily_rewards').insert({ user_id: user.id });
        setCurrentStreak(0);
        setCanClaim(true);
      } else if (data) {
        setCurrentStreak(data.current_streak || 0);
        checkCanClaim(data.last_claim_date);
      }
    } catch {
      // Fallback to localStorage if table doesn't exist yet
      const saved = localStorage.getItem(`streak_${user.id}`);
      if (saved) {
        const localData = JSON.parse(saved);
        setCurrentStreak(localData.streak || 0);
        checkCanClaimLocal(localData.lastClaim);
      } else {
        setCanClaim(true);
      }
    }
    setLoading(false);
  };


  const checkCanClaim = (lastClaimDate: string | null) => {
    if (!lastClaimDate) { setCanClaim(true); return; }
    const last = new Date(lastClaimDate);
    const now = new Date();
    // Check if it's a different day
    const lastDay = last.toISOString().split('T')[0];
    const today = now.toISOString().split('T')[0];
    setCanClaim(lastDay !== today);
  };

  const checkCanClaimLocal = (lastClaim: string | null) => {
    if (!lastClaim) { setCanClaim(true); return; }
    const last = new Date(lastClaim);
    const now = new Date();
    const diffHours = (now.getTime() - last.getTime()) / (1000 * 60 * 60);
    setCanClaim(diffHours >= 24);
  };

  const claimReward = async () => {
    if (!user || !canClaim || claiming) return;
    setClaiming(true);

    const now = new Date();
    const today = now.toISOString().split('T')[0];
    
    try {
      // Get current data
      const { data: currentData } = await supabase
        .from('daily_rewards')
        .select('*')
        .eq('user_id', user.id)
        .single();

      let newStreak = currentStreak;
      
      if (currentData?.last_claim_date) {
        const lastDate = new Date(currentData.last_claim_date);
        const diffDays = Math.floor((now.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays > 1) newStreak = 0; // Reset if more than 1 day gap
      }
      
      newStreak = (newStreak % 7) + 1;

      const reward = DAILY_REWARDS[newStreak - 1];
      const bonusMultiplier = newStreak === 7 ? 2 : 1;
      const totalCoins = reward.coins * bonusMultiplier;
      const totalXP = reward.xp * bonusMultiplier;

      // Update daily_rewards table
      await supabase.from('daily_rewards').upsert({
        user_id: user.id,
        current_streak: newStreak,
        max_streak: Math.max(newStreak, currentData?.max_streak || 0),
        last_claim_date: today,
        total_claims: (currentData?.total_claims || 0) + 1,
        updated_at: now.toISOString()
      });

      // Insert claim history
      await supabase.from('daily_reward_claims').insert({
        user_id: user.id,
        day_number: newStreak,
        coins_earned: totalCoins,
        xp_earned: totalXP,
        bonus_multiplier: bonusMultiplier
      });

      // Update profile coins and xp
      if (profile) {
        await supabase.from('profiles').update({
          total_coins: (profile.total_coins || 0) + totalCoins,
          xp: (profile.xp || 0) + totalXP,
        }).eq('id', user.id);
        refreshProfile();
      }

      setCurrentStreak(newStreak);
      setCanClaim(false);
      setClaimedReward({ ...reward, coins: totalCoins, xp: totalXP });
      setShowReward(true);
    } catch {
      // Fallback to localStorage
      let newStreak = currentStreak;
      const saved = localStorage.getItem(`streak_${user.id}`);
      if (saved) {
        const data = JSON.parse(saved);
        const lastDate = data.lastClaim ? new Date(data.lastClaim) : null;
        if (lastDate) {
          const diffHours = (now.getTime() - lastDate.getTime()) / (1000 * 60 * 60);
          if (diffHours > 48) newStreak = 0;
        }
      }
      newStreak = (newStreak % 7) + 1;

      const reward = DAILY_REWARDS[newStreak - 1];
      const bonusMultiplier = newStreak === 7 ? 2 : 1;
      const totalCoins = reward.coins * bonusMultiplier;
      const totalXP = reward.xp * bonusMultiplier;

      localStorage.setItem(`streak_${user.id}`, JSON.stringify({
        streak: newStreak,
        lastClaim: now.toISOString(),
      }));

      if (profile) {
        await supabase.from('profiles').update({
          total_coins: (profile.total_coins || 0) + totalCoins,
          xp: (profile.xp || 0) + totalXP,
        }).eq('id', user.id);
        refreshProfile();
      }

      setCurrentStreak(newStreak);
      setCanClaim(false);
      setClaimedReward({ ...reward, coins: totalCoins, xp: totalXP });
      setShowReward(true);
    }
    
    setClaiming(false);
  };


  if (loading) {
    return (
      <div className="bg-gradient-to-br from-green-900/30 to-emerald-900/30 rounded-2xl p-6 border border-green-500/30">
        <div className="animate-pulse flex items-center gap-3">
          <div className="w-12 h-12 bg-gray-700 rounded-xl"></div>
          <div className="flex-1">
            <div className="h-4 bg-gray-700 rounded w-1/2 mb-2"></div>
            <div className="h-3 bg-gray-700 rounded w-1/3"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-green-900/30 to-emerald-900/30 rounded-2xl p-6 border border-green-500/30">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
            <Calendar className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Điểm Danh Hàng Ngày</h3>
            <p className="text-gray-400 text-sm">Đăng nhập mỗi ngày để nhận thưởng!</p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-green-500/20 rounded-xl">
          <Flame className="w-5 h-5 text-green-400" />
          <span className="font-bold text-green-400">{currentStreak} ngày</span>
        </div>
      </div>

      {/* Rewards Grid */}
      <div className="grid grid-cols-7 gap-2 mb-6">
        {DAILY_REWARDS.map((reward, index) => {
          const isPast = index < currentStreak;
          const isCurrent = index === currentStreak;
          
          return (
            <div
              key={reward.day}
              className={`relative p-3 rounded-xl text-center transition-all ${
                isPast
                  ? 'bg-green-500/20 border-2 border-green-500/50'
                  : isCurrent && canClaim
                  ? 'bg-emerald-500/20 border-2 border-emerald-500 animate-pulse'
                  : isCurrent
                  ? 'bg-green-500/20 border-2 border-green-500/50'
                  : 'bg-gray-800/50 border-2 border-gray-700/50 opacity-50'
              }`}
            >
              <div className="text-2xl mb-1">{isPast ? '✅' : reward.icon}</div>
              <div className="text-xs text-gray-400">Ngày {reward.day}</div>
              <div className="text-xs text-emerald-400 font-bold">+{reward.coins}</div>
              {reward.bonus && (
                <div className="absolute -top-2 -right-2 px-1.5 py-0.5 bg-emerald-500 text-[10px] font-bold text-gray-900 rounded">
                  x2
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Claim Button */}
      <button
        onClick={claimReward}
        disabled={!canClaim || claiming}
        className={`w-full py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2 ${
          canClaim
            ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:opacity-90 shadow-lg shadow-green-500/30'
            : 'bg-gray-700 text-gray-400 cursor-not-allowed'
        }`}
      >
        {claiming ? (
          <span className="animate-spin">⏳</span>
        ) : canClaim ? (
          <>
            <Gift className="w-5 h-5" />
            Nhận Thưởng Ngày {(currentStreak % 7) + 1}
          </>
        ) : (
          <>
            <span>✅ Đã nhận hôm nay</span>
          </>
        )}
      </button>

      {/* Reward Popup */}
      {showReward && claimedReward && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowReward(false)}>
          <div className="bg-gradient-to-br from-emerald-900 to-green-900 rounded-3xl p-8 max-w-sm w-full text-center border-2 border-emerald-500/50 animate-bounce-in">
            <Sparkles className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
            <h2 className="text-2xl font-black text-white mb-2">Phần Thưởng!</h2>
            <p className="text-gray-300 mb-6">Ngày {currentStreak} - Streak tiếp tục!</p>
            <div className="flex justify-center gap-6 mb-6">
              <div className="text-center">
                <div className="text-3xl font-black text-emerald-400">+{claimedReward.coins}</div>
                <div className="text-sm text-gray-400 flex items-center gap-1 justify-center"><Coins className="w-4 h-4" /> Xu</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-black text-purple-400">+{claimedReward.xp}</div>
                <div className="text-sm text-gray-400 flex items-center gap-1 justify-center"><Star className="w-4 h-4" /> XP</div>
              </div>
            </div>
            <button onClick={() => setShowReward(false)} className="px-6 py-3 bg-white/20 hover:bg-white/30 text-white rounded-xl font-bold">
              Tuyệt vời!
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
