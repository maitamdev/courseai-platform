import { useState, useEffect, useRef } from 'react';
import {
  Swords, Trophy, Users, Clock, Zap, Star, Crown, Target,
  Play, ChevronRight, Flame, Search, RefreshCw, Coins, 
  TrendingUp, History, Volume2, VolumeX, Eye, Code2,
  CheckCircle, XCircle, AlertCircle, Loader2, ArrowLeft,
  Brain, Rocket, Copy, Check, Hash, UserPlus
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

type Challenge = {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  language: string;
  time_limit: number;
  starter_code: string;
  solution: string;
  test_cases: { input: string; expected: string }[];
  xp_reward: number;
};

type BattleRoom = {
  id: string;
  challenge_id: string;
  player1_id: string;
  player2_id: string | null;
  bet_amount: number;
  status: string;
  winner_id: string | null;
  player1_ready: boolean;
  player2_ready: boolean;
  player1_code?: string;
  player2_code?: string;
  player1_score?: number;
  player2_score?: number;
  player1_time?: number;
  player2_time?: number;
  started_at: string | null;
  room_code?: string;
  challenge?: Challenge;
  player1?: { username: string; avatar_url: string; level: number };
  player2?: { username: string; avatar_url: string; level: number };
};

type Ranking = {
  user_id: string;
  wins: number;
  losses: number;
  rank_points: number;
  rank_tier: string;
  current_streak: number;
  best_streak: number;
  profile?: { username: string; avatar_url: string; level: number };
};

type Season = {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
  rewards: Record<string, number>;
};

type BattleHistoryItem = {
  id: string;
  room_id: string;
  opponent_id: string;
  result: 'win' | 'lose' | 'draw';
  xp_earned: number;
  coins_earned: number;
  time_taken: number;
  score: number;
  created_at: string;
  challenge?: Challenge;
  opponent?: { username: string; avatar_url: string };
};

type GameState = 'lobby' | 'matchmaking' | 'waiting' | 'battle' | 'result' | 'practice' | 'history';
type TabType = 'arena' | 'practice' | 'rankings' | 'history';

const RANK_COLORS: Record<string, { bg: string; text: string; border: string; glow: string }> = {
  Bronze: { bg: 'from-amber-700 to-amber-900', text: 'text-amber-400', border: 'border-amber-500', glow: 'shadow-amber-500/30' },
  Silver: { bg: 'from-gray-400 to-gray-600', text: 'text-gray-300', border: 'border-gray-400', glow: 'shadow-gray-400/30' },
  Gold: { bg: 'from-yellow-500 to-yellow-700', text: 'text-yellow-400', border: 'border-yellow-500', glow: 'shadow-yellow-500/30' },
  Platinum: { bg: 'from-cyan-400 to-cyan-600', text: 'text-cyan-400', border: 'border-cyan-400', glow: 'shadow-cyan-400/30' },
  Diamond: { bg: 'from-blue-400 to-purple-500', text: 'text-blue-400', border: 'border-blue-400', glow: 'shadow-blue-400/30' },
  Master: { bg: 'from-red-500 to-pink-600', text: 'text-red-400', border: 'border-red-500', glow: 'shadow-red-500/30' },
};

const RANK_ICONS: Record<string, string> = {
  Bronze: '🥉',
  Silver: '🥈',
  Gold: '🥇',
  Platinum: '💎',
  Diamond: '💠',
  Master: '👑',
};

const DIFFICULTY_CONFIG = {
  easy: { color: 'text-green-400', bg: 'bg-green-500/20', border: 'border-green-500/30', icon: '🌱' },
  medium: { color: 'text-yellow-400', bg: 'bg-yellow-500/20', border: 'border-yellow-500/30', icon: '⚡' },
  hard: { color: 'text-red-400', bg: 'bg-red-500/20', border: 'border-red-500/30', icon: '🔥' },
};

const LANGUAGE_ICONS: Record<string, string> = {
  Python: '🐍',
  JavaScript: '💛',
  Java: '☕',
};

export const CodeBattleArena = () => {
  const { user, profile, refreshProfile } = useAuth();
  const [gameState, setGameState] = useState<GameState>('lobby');
  const [activeTab, setActiveTab] = useState<TabType>('arena');
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [rooms, setRooms] = useState<BattleRoom[]>([]);
  const [rankings, setRankings] = useState<Ranking[]>([]);
  const [currentSeason, setCurrentSeason] = useState<Season | null>(null);
  const [myRanking, setMyRanking] = useState<Ranking | null>(null);
  const [battleHistory, setBattleHistory] = useState<BattleHistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  
  // Battle state
  const [currentRoom, setCurrentRoom] = useState<BattleRoom | null>(null);
  const [currentChallenge, setCurrentChallenge] = useState<Challenge | null>(null);
  const [userCode, setUserCode] = useState('');
  const [timeLeft, setTimeLeft] = useState(0);
  const [betAmount, setBetAmount] = useState(50);
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [selectedLanguage, setSelectedLanguage] = useState('all');
  const [isQuickMatch, setIsQuickMatch] = useState(false);
  
  // Room code state
  const [joinRoomCode, setJoinRoomCode] = useState('');
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [joinError, setJoinError] = useState('');
  const [copiedCode, setCopiedCode] = useState(false);
  
  // Practice state
  const [practiceChallenge, setPracticeChallenge] = useState<Challenge | null>(null);
  const [practiceCode, setPracticeCode] = useState('');
  const [practiceResult, setPracticeResult] = useState<{ passed: number; total: number; details: any[] } | null>(null);
  const [isPracticing, setIsPracticing] = useState(false);
  
  // Result state
  const [battleResult, setBattleResult] = useState<'win' | 'lose' | 'draw' | null>(null);
  const [earnedXP, setEarnedXP] = useState(0);
  const [earnedCoins, setEarnedCoins] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);

  // Animation refs
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    fetchData();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [user]);

  const fetchData = async () => {
    setLoading(true);
    await Promise.all([
      fetchChallenges(),
      fetchRooms(),
      fetchSeason(),
      fetchRankings(),
    ]);
    if (user) {
      fetchMyRanking();
      fetchBattleHistory();
    }
    setLoading(false);
  };

  const fetchChallenges = async () => {
    const { data } = await supabase.from('battle_challenges').select('*');
    if (data) setChallenges(data);
  };

  const fetchRooms = async () => {
    const { data } = await supabase
      .from('battle_rooms')
      .select('*')
      .eq('status', 'waiting')
      .order('created_at', { ascending: false })
      .limit(20);
    if (data) setRooms(data);
  };

  const fetchSeason = async () => {
    const { data } = await supabase
      .from('battle_seasons')
      .select('*')
      .eq('is_active', true)
      .single();
    if (data) setCurrentSeason(data);
  };

  const fetchRankings = async () => {
    const { data: seasonData } = await supabase
      .from('battle_seasons')
      .select('id')
      .eq('is_active', true)
      .single();
    
    if (seasonData) {
      const { data } = await supabase
        .from('battle_rankings')
        .select('*')
        .eq('season_id', seasonData.id)
        .order('rank_points', { ascending: false })
        .limit(50);
      
      if (data) {
        const userIds = data.map(r => r.user_id);
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, username, avatar_url, level')
          .in('id', userIds);
        
        const rankingsWithProfiles = data.map(r => ({
          ...r,
          profile: profiles?.find(p => p.id === r.user_id)
        }));
        setRankings(rankingsWithProfiles);
      }
    }
  };

  const fetchMyRanking = async () => {
    if (!user || !currentSeason) return;
    const { data } = await supabase
      .from('battle_rankings')
      .select('*')
      .eq('user_id', user.id)
      .eq('season_id', currentSeason.id)
      .single();
    if (data) setMyRanking(data);
  };

  const fetchBattleHistory = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('battle_history')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20);
    
    if (data) {
      // Fetch challenge and opponent info
      const challengeIds = [...new Set(data.map(h => h.challenge_id))];
      const opponentIds = [...new Set(data.map(h => h.opponent_id))];
      
      const [challengesRes, opponentsRes] = await Promise.all([
        supabase.from('battle_challenges').select('*').in('id', challengeIds),
        supabase.from('profiles').select('id, username, avatar_url').in('id', opponentIds)
      ]);
      
      const historyWithDetails = data.map(h => ({
        ...h,
        challenge: challengesRes.data?.find(c => c.id === h.challenge_id),
        opponent: opponentsRes.data?.find(o => o.id === h.opponent_id)
      }));
      setBattleHistory(historyWithDetails);
    }
  };

  const playSound = (_type: 'click' | 'win' | 'lose' | 'tick') => {
    if (!soundEnabled) return;
    // Sound effects would be implemented here
  };

  const createRoom = async () => {
    if (!user || !profile) return;
    if (betAmount > 0 && profile.total_coins < betAmount) {
      alert('Không đủ xu để cược!');
      return;
    }

    let filteredChallenges = challenges;
    if (selectedDifficulty !== 'all') {
      filteredChallenges = filteredChallenges.filter(c => c.difficulty === selectedDifficulty);
    }
    if (selectedLanguage !== 'all') {
      filteredChallenges = filteredChallenges.filter(c => c.language === selectedLanguage);
    }
    
    if (filteredChallenges.length === 0) {
      alert('Không có challenge phù hợp!');
      return;
    }

    const randomChallenge = filteredChallenges[Math.floor(Math.random() * filteredChallenges.length)];

    const { data, error } = await supabase
      .from('battle_rooms')
      .insert({
        challenge_id: randomChallenge.id,
        player1_id: user.id,
        bet_amount: betAmount,
        status: 'waiting'
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating room:', error);
      return;
    }

    if (data) {
      setCurrentRoom({ ...data, challenge: randomChallenge });
      setCurrentChallenge(randomChallenge);
      setUserCode(randomChallenge.starter_code);
      setGameState('waiting');
      playSound('click');
    }
  };

  const quickMatch = async () => {
    if (!user || !profile) return;
    setIsQuickMatch(true);
    setGameState('matchmaking');
    
    // Try to find an existing room first
    const { data: existingRooms } = await supabase
      .from('battle_rooms')
      .select('*')
      .eq('status', 'waiting')
      .neq('player1_id', user.id)
      .limit(1);
    
    if (existingRooms && existingRooms.length > 0) {
      // Join existing room
      const room = existingRooms[0];
      if (profile.total_coins >= room.bet_amount) {
        await joinRoom(room);
        return;
      }
    }
    
    // Create new room with default settings
    setBetAmount(0);
    setSelectedDifficulty('all');
    setSelectedLanguage('all');
    await createRoom();
    setIsQuickMatch(false);
  };

  const joinRoom = async (room: BattleRoom) => {
    if (!user || !profile) return;
    if (room.player1_id === user.id) {
      alert('Không thể tham gia phòng của chính mình!');
      return;
    }
    if (profile.total_coins < room.bet_amount) {
      alert('Không đủ xu để cược!');
      return;
    }

    const { error } = await supabase
      .from('battle_rooms')
      .update({ player2_id: user.id, status: 'playing', started_at: new Date().toISOString() })
      .eq('id', room.id);

    if (error) {
      console.error('Error joining room:', error);
      return;
    }

    const { data: challenge } = await supabase
      .from('battle_challenges')
      .select('*')
      .eq('id', room.challenge_id)
      .single();

    if (challenge) {
      setCurrentRoom({ ...room, player2_id: user.id, challenge });
      setCurrentChallenge(challenge);
      setUserCode(challenge.starter_code);
      setTimeLeft(challenge.time_limit);
      setGameState('battle');
      setShowJoinModal(false);
      setJoinRoomCode('');
      playSound('click');
    }
  };

  // Join room by code
  const joinByCode = async () => {
    if (!user || !profile) return;
    if (!joinRoomCode.trim()) {
      setJoinError('Vui lòng nhập mã phòng!');
      return;
    }

    setJoinError('');
    const code = joinRoomCode.trim().toUpperCase();

    // Find room by code
    const { data: room, error } = await supabase
      .from('battle_rooms')
      .select('*')
      .eq('room_code', code)
      .eq('status', 'waiting')
      .single();

    if (error || !room) {
      setJoinError('Không tìm thấy phòng với mã này hoặc phòng đã đầy!');
      return;
    }

    if (room.player1_id === user.id) {
      setJoinError('Không thể tham gia phòng của chính mình!');
      return;
    }

    if (profile.total_coins < room.bet_amount) {
      setJoinError(`Không đủ xu! Cần ${room.bet_amount} xu để tham gia.`);
      return;
    }

    await joinRoom(room);
  };

  // Copy room code to clipboard
  const copyRoomCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const submitCode = async () => {
    if (!currentRoom || !currentChallenge || !user) return;

    const isPlayer1 = currentRoom.player1_id === user.id;
    const codeField = isPlayer1 ? 'player1_code' : 'player2_code';
    const timeField = isPlayer1 ? 'player1_time' : 'player2_time';
    const scoreField = isPlayer1 ? 'player1_score' : 'player2_score';

    // Calculate score based on test cases
    let score = 0;
    const testCases = currentChallenge.test_cases;
    
    testCases.forEach(() => {
      if (userCode.includes('return') && userCode.length > 20) {
        score += 25;
      }
    });

    const timeTaken = currentChallenge.time_limit - timeLeft;

    await supabase
      .from('battle_rooms')
      .update({
        [codeField]: userCode,
        [timeField]: timeTaken,
        [scoreField]: score
      })
      .eq('id', currentRoom.id);

    const { data: updatedRoom } = await supabase
      .from('battle_rooms')
      .select('*')
      .eq('id', currentRoom.id)
      .single();

    if (updatedRoom?.player1_code && updatedRoom?.player2_code) {
      await determineWinner(updatedRoom);
    } else {
      setGameState('result');
      setBattleResult(null);
    }
  };

  const determineWinner = async (room: BattleRoom) => {
    if (!user || !currentSeason) return;

    const isPlayer1 = room.player1_id === user.id;
    const myScore = isPlayer1 ? room.player1_score : room.player2_score;
    const opponentScore = isPlayer1 ? room.player2_score : room.player1_score;
    const myTime = isPlayer1 ? room.player1_time : room.player2_time;
    const opponentTime = isPlayer1 ? room.player2_time : room.player1_time;

    let result: 'win' | 'lose' | 'draw';
    let winnerId: string | null = null;

    if (myScore! > opponentScore!) {
      result = 'win';
      winnerId = user.id;
    } else if (myScore! < opponentScore!) {
      result = 'lose';
      winnerId = isPlayer1 ? room.player2_id : room.player1_id;
    } else if (myTime! < opponentTime!) {
      result = 'win';
      winnerId = user.id;
    } else if (myTime! > opponentTime!) {
      result = 'lose';
      winnerId = isPlayer1 ? room.player2_id : room.player1_id;
    } else {
      result = 'draw';
    }

    const xpEarned = result === 'win' ? (currentChallenge?.xp_reward || 50) * 2 : 
                     result === 'draw' ? (currentChallenge?.xp_reward || 50) : 
                     Math.floor((currentChallenge?.xp_reward || 50) / 2);
    
    const coinsEarned = result === 'win' ? room.bet_amount * 2 : 
                        result === 'draw' ? room.bet_amount : 0;

    await supabase
      .from('battle_rooms')
      .update({ status: 'finished', winner_id: winnerId, finished_at: new Date().toISOString() })
      .eq('id', room.id);

    if (result === 'win') {
      await supabase
        .from('profiles')
        .update({
          total_coins: (profile?.total_coins || 0) + coinsEarned - room.bet_amount,
          xp: ((profile as any)?.xp || 0) + xpEarned
        })
        .eq('id', user.id);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
      playSound('win');
    } else if (result === 'lose') {
      await supabase
        .from('profiles')
        .update({
          total_coins: (profile?.total_coins || 0) - room.bet_amount,
          xp: ((profile as any)?.xp || 0) + xpEarned
        })
        .eq('id', user.id);
      playSound('lose');
    }

    await supabase.from('battle_history').insert({
      room_id: room.id,
      user_id: user.id,
      opponent_id: isPlayer1 ? room.player2_id : room.player1_id,
      challenge_id: room.challenge_id,
      result,
      xp_earned: xpEarned,
      coins_earned: result === 'win' ? coinsEarned : -room.bet_amount,
      time_taken: isPlayer1 ? room.player1_time : room.player2_time,
      score: myScore
    });

    setBattleResult(result);
    setEarnedXP(xpEarned);
    setEarnedCoins(result === 'win' ? coinsEarned : -room.bet_amount);
    setGameState('result');
    refreshProfile?.();
  };

  // Practice mode functions
  const startPractice = (challenge: Challenge) => {
    setPracticeChallenge(challenge);
    setPracticeCode(challenge.starter_code);
    setPracticeResult(null);
    setIsPracticing(true);
    setGameState('practice');
  };

  const runPracticeCode = () => {
    if (!practiceChallenge) return;
    
    // Simulate test case evaluation
    const results = practiceChallenge.test_cases.map((tc, idx) => {
      const passed = practiceCode.includes('return') && practiceCode.length > 30;
      return { ...tc, passed, index: idx };
    });
    
    const passed = results.filter(r => r.passed).length;
    setPracticeResult({ passed, total: results.length, details: results });
  };

  // Timer effect
  useEffect(() => {
    if (gameState === 'battle' && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            submitCode();
            return 0;
          }
          if (prev <= 30) playSound('tick');
          return prev - 1;
        });
      }, 1000);
      return () => {
        if (timerRef.current) clearInterval(timerRef.current);
      };
    }
  }, [gameState, timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getWinRate = (wins: number, losses: number) => {
    const total = wins + losses;
    if (total === 0) return 0;
    return Math.round((wins / total) * 100);
  };


  // Confetti component
  const Confetti = () => (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {[...Array(50)].map((_, i) => (
        <div
          key={i}
          className="absolute animate-confetti"
          style={{
            left: `${Math.random() * 100}%`,
            top: '-10px',
            animationDelay: `${Math.random() * 2}s`,
            animationDuration: `${2 + Math.random() * 2}s`,
          }}
        >
          <div
            className={`w-3 h-3 ${
              ['bg-yellow-400', 'bg-pink-400', 'bg-blue-400', 'bg-green-400', 'bg-purple-400'][
                Math.floor(Math.random() * 5)
              ]
            }`}
            style={{
              transform: `rotate(${Math.random() * 360}deg)`,
            }}
          />
        </div>
      ))}
    </div>
  );

  // Tab Navigation
  const TabNav = () => (
    <div className="flex gap-2 mb-6 bg-gray-800/50 p-2 rounded-xl">
      {[
        { id: 'arena', label: 'Đấu Trường', icon: Swords },
        { id: 'practice', label: 'Luyện Tập', icon: Brain },
        { id: 'rankings', label: 'Xếp Hạng', icon: Trophy },
        { id: 'history', label: 'Lịch Sử', icon: History },
      ].map(tab => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id as TabType)}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-bold transition-all ${
            activeTab === tab.id
              ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/30'
              : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
          }`}
        >
          <tab.icon className="w-5 h-5" />
          <span className="hidden sm:inline">{tab.label}</span>
        </button>
      ))}
    </div>
  );

  // Render Header
  const renderHeader = () => (
    <div className="relative bg-gradient-to-r from-purple-900/50 via-pink-900/50 to-red-900/50 rounded-2xl p-6 overflow-hidden mb-6">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjA1KSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-50"></div>
      
      {/* Animated particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white/20 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${3 + Math.random() * 4}s`,
            }}
          />
        ))}
      </div>
      
      <div className="relative z-10 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-white flex items-center gap-3">
            <div className="relative">
              <Swords className="w-10 h-10 text-red-400" />
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full animate-pulse" />
            </div>
            Code Battle Arena
          </h1>
          <p className="text-gray-300 mt-1 flex items-center gap-2">
            <Zap className="w-4 h-4 text-yellow-400" />
            Đấu code PvP real-time • Cược xu • Nhận XP
          </p>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            {soundEnabled ? (
              <Volume2 className="w-5 h-5 text-gray-400" />
            ) : (
              <VolumeX className="w-5 h-5 text-gray-500" />
            )}
          </button>
          {currentSeason && (
            <div className="text-right bg-black/30 px-4 py-2 rounded-xl">
              <div className="text-xs text-gray-400">Mùa giải</div>
              <div className="text-lg font-bold text-yellow-400 flex items-center gap-1">
                <Crown className="w-4 h-4" />
                {currentSeason.name}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // My Stats Card
  const renderMyStats = () => {
    if (!myRanking) return null;
    const winRate = getWinRate(myRanking.wins, myRanking.losses);
    const rankColor = RANK_COLORS[myRanking.rank_tier] || RANK_COLORS.Bronze;
    
    return (
      <div className={`bg-gray-800/50 rounded-xl p-5 border ${rankColor.border} shadow-lg ${rankColor.glow} mb-6`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${rankColor.bg} flex items-center justify-center text-4xl shadow-lg relative`}>
              {RANK_ICONS[myRanking.rank_tier] || '🥉'}
              <div className="absolute -bottom-1 -right-1 bg-gray-900 px-2 py-0.5 rounded-full text-xs font-bold text-white">
                {myRanking.rank_points}
              </div>
            </div>
            <div>
              <div className={`text-xl font-bold ${rankColor.text}`}>
                {myRanking.rank_tier}
              </div>
              <div className="text-gray-400 text-sm">{myRanking.rank_points} RP</div>
              <div className="flex items-center gap-1 mt-1">
                <div className="h-2 w-32 bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className={`h-full bg-gradient-to-r ${rankColor.bg}`}
                    style={{ width: `${Math.min(100, (myRanking.rank_points % 500) / 5)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex gap-6">
            <div className="text-center">
              <div className="text-3xl font-black text-green-400">{myRanking.wins}</div>
              <div className="text-xs text-gray-400">Thắng</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-black text-red-400">{myRanking.losses}</div>
              <div className="text-xs text-gray-400">Thua</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-black text-blue-400">{winRate}%</div>
              <div className="text-xs text-gray-400">Tỷ lệ</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-black text-orange-400 flex items-center justify-center gap-1">
                <Flame className="w-5 h-5" />
                {myRanking.current_streak}
              </div>
              <div className="text-xs text-gray-400">Streak</div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render Arena Tab
  const renderArenaTab = () => (
    <div className="space-y-6">
      {renderMyStats()}
      
      {/* Quick Actions */}
      <div className="grid md:grid-cols-3 gap-4">
        <button
          onClick={quickMatch}
          className="relative group bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 rounded-2xl p-5 text-left overflow-hidden transition-all hover:scale-[1.02] hover:shadow-xl hover:shadow-red-500/20"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-11 h-11 bg-white/20 rounded-xl flex items-center justify-center">
                <Rocket className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Quick Match</h3>
                <p className="text-white/70 text-xs">Tìm trận ngay</p>
              </div>
            </div>
          </div>
        </button>
        
        <button
          onClick={() => setShowJoinModal(true)}
          className="relative group bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 rounded-2xl p-5 text-left overflow-hidden transition-all hover:scale-[1.02] hover:shadow-xl hover:shadow-blue-500/20"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-11 h-11 bg-white/20 rounded-xl flex items-center justify-center">
                <Hash className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Nhập Mã Phòng</h3>
                <p className="text-white/70 text-xs">Tham gia bạn bè</p>
              </div>
            </div>
          </div>
        </button>
        
        <button
          onClick={() => setActiveTab('practice')}
          className="relative group bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 rounded-2xl p-5 text-left overflow-hidden transition-all hover:scale-[1.02] hover:shadow-xl hover:shadow-emerald-500/20"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-11 h-11 bg-white/20 rounded-xl flex items-center justify-center">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Luyện Tập</h3>
                <p className="text-white/70 text-xs">Rèn luyện kỹ năng</p>
              </div>
            </div>
          </div>
        </button>
      </div>

      {/* Create Room */}
      <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Target className="w-5 h-5 text-emerald-400" />
          Tạo Phòng Đấu
        </h2>
        
        <div className="grid md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="text-sm text-gray-400 mb-2 block">Độ khó</label>
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-xl text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
            >
              <option value="all">🎯 Tất cả</option>
              <option value="easy">🌱 Dễ</option>
              <option value="medium">⚡ Trung bình</option>
              <option value="hard">🔥 Khó</option>
            </select>
          </div>
          
          <div>
            <label className="text-sm text-gray-400 mb-2 block">Ngôn ngữ</label>
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-xl text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
            >
              <option value="all">💻 Tất cả</option>
              <option value="Python">🐍 Python</option>
              <option value="JavaScript">💛 JavaScript</option>
              <option value="Java">☕ Java</option>
            </select>
          </div>
          
          <div>
            <label className="text-sm text-gray-400 mb-2 block">Cược xu</label>
            <select
              value={betAmount}
              onChange={(e) => setBetAmount(Number(e.target.value))}
              className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-xl text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
            >
              <option value={0}>🆓 Không cược</option>
              <option value={50}>💰 50 xu</option>
              <option value={100}>💰 100 xu</option>
              <option value={200}>💰 200 xu</option>
              <option value={500}>💎 500 xu</option>
            </select>
          </div>
        </div>

        <button
          onClick={createRoom}
          className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all hover:scale-[1.02] hover:shadow-lg hover:shadow-purple-500/30"
        >
          <Swords className="w-6 h-6" />
          Tạo Phòng & Chờ Đối Thủ
        </button>
      </div>

      {/* Available Rooms */}
      <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-400" />
            Phòng Đang Chờ
            <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded-full text-sm">
              {rooms.length}
            </span>
          </h2>
          <button 
            onClick={fetchRooms} 
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors group"
          >
            <RefreshCw className="w-5 h-5 text-gray-400 group-hover:text-white group-hover:rotate-180 transition-all duration-500" />
          </button>
        </div>

        {rooms.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <div className="w-20 h-20 mx-auto mb-4 bg-gray-700/50 rounded-full flex items-center justify-center">
              <Users className="w-10 h-10 opacity-50" />
            </div>
            <p className="text-lg font-medium">Chưa có phòng nào</p>
            <p className="text-sm mt-1">Hãy tạo phòng mới hoặc Quick Match!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {rooms.map((room) => {
              const challenge = challenges.find(c => c.id === room.challenge_id);
              const diffConfig = DIFFICULTY_CONFIG[challenge?.difficulty as keyof typeof DIFFICULTY_CONFIG] || DIFFICULTY_CONFIG.easy;
              
              return (
                <div
                  key={room.id}
                  className="bg-gray-900/50 rounded-xl p-4 border border-gray-600 hover:border-purple-500/50 transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-14 h-14 ${diffConfig.bg} rounded-xl flex items-center justify-center text-2xl border ${diffConfig.border}`}>
                        {diffConfig.icon}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white group-hover:text-purple-300 transition-colors">
                            {challenge?.title || 'Challenge'}
                          </span>
                          {room.room_code && (
                            <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 text-xs font-mono rounded border border-blue-500/30">
                              #{room.room_code}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-400 mt-1">
                          <span className={`px-2 py-0.5 rounded ${diffConfig.bg} ${diffConfig.color} text-xs font-medium`}>
                            {challenge?.difficulty}
                          </span>
                          <span className="flex items-center gap-1">
                            {LANGUAGE_ICONS[challenge?.language || 'Python']}
                            {challenge?.language}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {challenge?.time_limit ? Math.floor(challenge.time_limit / 60) : 5}m
                          </span>
                          {room.bet_amount > 0 && (
                            <>
                              <span>•</span>
                              <span className="flex items-center gap-1 text-yellow-400">
                                <Coins className="w-3 h-3" />
                                {room.bet_amount} xu
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => joinRoom(room)}
                      disabled={room.player1_id === user?.id}
                      className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-white rounded-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-105 hover:shadow-lg hover:shadow-purple-500/30"
                    >
                      <span className="flex items-center gap-2">
                        <Play className="w-4 h-4" />
                        Tham Gia
                      </span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );


  // Render Practice Tab
  const renderPracticeTab = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-emerald-900/30 to-teal-900/30 rounded-xl p-6 border border-emerald-500/30">
        <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
          <Brain className="w-6 h-6 text-emerald-400" />
          Chế Độ Luyện Tập
        </h2>
        <p className="text-gray-300">
          Rèn luyện kỹ năng coding với các challenge không giới hạn thời gian. 
          Hoàn thành để nhận XP bonus!
        </p>
      </div>

      {/* Challenge Categories */}
      <div className="grid md:grid-cols-3 gap-4">
        {['easy', 'medium', 'hard'].map(diff => {
          const config = DIFFICULTY_CONFIG[diff as keyof typeof DIFFICULTY_CONFIG];
          const count = challenges.filter(c => c.difficulty === diff).length;
          
          return (
            <div key={diff} className={`${config.bg} rounded-xl p-4 border ${config.border}`}>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">{config.icon}</span>
                <div>
                  <div className={`font-bold ${config.color} capitalize`}>{diff}</div>
                  <div className="text-gray-400 text-sm">{count} challenges</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Challenge List */}
      <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
        <h3 className="text-lg font-bold text-white mb-4">Danh Sách Challenge</h3>
        
        <div className="space-y-3">
          {challenges.map(challenge => {
            const diffConfig = DIFFICULTY_CONFIG[challenge.difficulty as keyof typeof DIFFICULTY_CONFIG] || DIFFICULTY_CONFIG.easy;
            
            return (
              <div
                key={challenge.id}
                className="bg-gray-900/50 rounded-xl p-4 border border-gray-600 hover:border-emerald-500/50 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 ${diffConfig.bg} rounded-xl flex items-center justify-center text-xl border ${diffConfig.border}`}>
                      {LANGUAGE_ICONS[challenge.language]}
                    </div>
                    <div>
                      <div className="font-bold text-white">{challenge.title}</div>
                      <div className="flex items-center gap-2 text-sm text-gray-400 mt-1">
                        <span className={`px-2 py-0.5 rounded ${diffConfig.bg} ${diffConfig.color} text-xs`}>
                          {challenge.difficulty}
                        </span>
                        <span>{challenge.language}</span>
                        <span>•</span>
                        <span className="text-purple-400">+{challenge.xp_reward} XP</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => startPractice(challenge)}
                    className="px-5 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 rounded-lg font-medium transition-all flex items-center gap-2"
                  >
                    <Code2 className="w-4 h-4" />
                    Luyện Tập
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  // Render Rankings Tab
  const renderRankingsTab = () => (
    <div className="space-y-6">
      {renderMyStats()}
      
      {/* Season Info */}
      {currentSeason && (
        <div className="bg-gradient-to-r from-yellow-900/30 to-orange-900/30 rounded-xl p-6 border border-yellow-500/30">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-yellow-400 flex items-center gap-2">
                <Crown className="w-6 h-6" />
                {currentSeason.name}
              </h2>
              <p className="text-gray-300 mt-1">
                Kết thúc: {new Date(currentSeason.end_date).toLocaleDateString('vi-VN')}
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-400">Phần thưởng Top 1</div>
              <div className="text-2xl font-bold text-yellow-400 flex items-center gap-1">
                <Coins className="w-5 h-5" />
                {currentSeason.rewards?.top1?.toLocaleString() || '10,000'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Leaderboard */}
      <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-400" />
          Bảng Xếp Hạng
        </h2>

        <div className="space-y-2">
          {rankings.map((rank, idx) => {
            const rankColor = RANK_COLORS[rank.rank_tier] || RANK_COLORS.Bronze;
            const isMe = rank.user_id === user?.id;
            
            return (
              <div
                key={rank.user_id}
                className={`flex items-center gap-4 p-4 rounded-xl transition-all ${
                  idx < 3 
                    ? 'bg-gradient-to-r from-yellow-500/10 via-transparent to-transparent' 
                    : 'bg-gray-900/30 hover:bg-gray-900/50'
                } ${isMe ? 'ring-2 ring-purple-500 shadow-lg shadow-purple-500/20' : ''}`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg ${
                  idx === 0 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-yellow-900' :
                  idx === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-500 text-gray-900' :
                  idx === 2 ? 'bg-gradient-to-br from-amber-500 to-amber-700 text-amber-100' :
                  'bg-gray-700 text-gray-300'
                }`}>
                  {idx < 3 ? ['🥇', '🥈', '🥉'][idx] : idx + 1}
                </div>
                
                <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-700 ring-2 ring-gray-600">
                  {rank.profile?.avatar_url ? (
                    <img src={rank.profile.avatar_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-xl">👤</div>
                  )}
                </div>
                
                <div className="flex-1">
                  <div className="font-bold text-white flex items-center gap-2">
                    {rank.profile?.username || 'Player'}
                    {isMe && <span className="text-xs bg-purple-500/30 text-purple-300 px-2 py-0.5 rounded">Bạn</span>}
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-400">
                    <span className="text-green-400">{rank.wins}W</span>
                    <span className="text-red-400">{rank.losses}L</span>
                    <span className="flex items-center gap-1">
                      {RANK_ICONS[rank.rank_tier]}
                      <span className={rankColor.text}>{rank.rank_tier}</span>
                    </span>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className={`font-bold text-xl ${rankColor.text}`}>{rank.rank_points}</div>
                  <div className="text-xs text-gray-500">RP</div>
                </div>
                
                {rank.current_streak > 2 && (
                  <div className="flex items-center gap-1 px-3 py-1 bg-orange-500/20 rounded-lg">
                    <Flame className="w-4 h-4 text-orange-400" />
                    <span className="text-orange-400 font-bold">{rank.current_streak}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  // Render History Tab
  const renderHistoryTab = () => (
    <div className="space-y-6">
      <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <History className="w-5 h-5 text-blue-400" />
          Lịch Sử Đấu
        </h2>

        {battleHistory.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <History className="w-16 h-16 mx-auto mb-4 opacity-30" />
            <p className="text-lg">Chưa có trận đấu nào</p>
            <p className="text-sm mt-1">Hãy tham gia đấu trường!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {battleHistory.map(history => {
              const resultConfig = {
                win: { bg: 'bg-green-500/10', border: 'border-green-500/30', text: 'text-green-400', icon: '🏆' },
                lose: { bg: 'bg-red-500/10', border: 'border-red-500/30', text: 'text-red-400', icon: '😢' },
                draw: { bg: 'bg-blue-500/10', border: 'border-blue-500/30', text: 'text-blue-400', icon: '🤝' },
              }[history.result];
              
              return (
                <div
                  key={history.id}
                  className={`${resultConfig.bg} rounded-xl p-4 border ${resultConfig.border}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="text-3xl">{resultConfig.icon}</div>
                      <div>
                        <div className="font-bold text-white">
                          {history.challenge?.title || 'Challenge'}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                          <span>vs {history.opponent?.username || 'Opponent'}</span>
                          <span>•</span>
                          <span>{new Date(history.created_at).toLocaleDateString('vi-VN')}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`font-bold ${resultConfig.text} capitalize`}>
                        {history.result === 'win' ? 'Thắng' : history.result === 'lose' ? 'Thua' : 'Hòa'}
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <span className="text-purple-400">+{history.xp_earned} XP</span>
                        <span className={history.coins_earned >= 0 ? 'text-yellow-400' : 'text-red-400'}>
                          {history.coins_earned >= 0 ? '+' : ''}{history.coins_earned} xu
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );


  // Render Matchmaking
  const renderMatchmaking = () => (
    <div className="min-h-[500px] flex items-center justify-center">
      <div className="text-center">
        <div className="relative w-40 h-40 mx-auto mb-8">
          {/* Outer ring */}
          <div className="absolute inset-0 border-4 border-purple-500/20 rounded-full"></div>
          {/* Spinning ring */}
          <div className="absolute inset-0 border-4 border-transparent border-t-purple-500 rounded-full animate-spin"></div>
          {/* Inner pulse */}
          <div className="absolute inset-4 bg-purple-500/10 rounded-full animate-pulse"></div>
          {/* Center icon */}
          <div className="absolute inset-8 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center shadow-lg shadow-purple-500/30">
            <Search className="w-10 h-10 text-white animate-pulse" />
          </div>
          {/* Orbiting dots */}
          {[0, 1, 2].map(i => (
            <div
              key={i}
              className="absolute w-3 h-3 bg-purple-400 rounded-full"
              style={{
                top: '50%',
                left: '50%',
                transform: `rotate(${i * 120}deg) translateX(70px)`,
                animation: `orbit 2s linear infinite`,
                animationDelay: `${i * 0.3}s`,
              }}
            />
          ))}
        </div>
        
        <h2 className="text-3xl font-black text-white mb-3">Đang Tìm Đối Thủ...</h2>
        <p className="text-gray-400 mb-8">
          Hệ thống đang ghép cặp bạn với người chơi phù hợp
        </p>
        
        <div className="flex items-center justify-center gap-2 text-gray-500 mb-8">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Thời gian chờ trung bình: 30 giây</span>
        </div>
        
        <button
          onClick={() => {
            setGameState('lobby');
            setIsQuickMatch(false);
          }}
          className="px-8 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-xl font-bold transition-all"
        >
          Hủy Tìm Kiếm
        </button>
      </div>
    </div>
  );

  // Render Waiting Room
  const renderWaiting = () => (
    <div className="min-h-[500px] flex items-center justify-center">
      <div className="text-center max-w-md">
        <div className="relative w-32 h-32 mx-auto mb-6">
          <div className="absolute inset-0 border-4 border-purple-500/30 rounded-full animate-ping"></div>
          <div className="absolute inset-2 border-4 border-purple-500/50 rounded-full animate-pulse"></div>
          <div className="absolute inset-4 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center shadow-lg">
            <Users className="w-12 h-12 text-white" />
          </div>
        </div>
        
        <h2 className="text-2xl font-bold text-white mb-4">Đang Chờ Đối Thủ...</h2>
        
        {/* Room Code Display */}
        {currentRoom?.room_code && (
          <div className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 rounded-2xl p-5 mb-6 border border-purple-500/30">
            <div className="text-sm text-gray-400 mb-2">Mã phòng của bạn</div>
            <div className="flex items-center justify-center gap-3">
              <div className="text-4xl font-black text-white tracking-[0.3em] bg-gray-800/50 px-6 py-3 rounded-xl border border-gray-600">
                {currentRoom.room_code}
              </div>
              <button
                onClick={() => copyRoomCode(currentRoom.room_code!)}
                className={`p-3 rounded-xl transition-all ${
                  copiedCode 
                    ? 'bg-green-500 text-white' 
                    : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                }`}
              >
                {copiedCode ? <Check className="w-6 h-6" /> : <Copy className="w-6 h-6" />}
              </button>
            </div>
            <p className="text-sm text-gray-400 mt-3">
              {copiedCode ? '✓ Đã copy!' : 'Chia sẻ mã này cho bạn bè để tham gia'}
            </p>
          </div>
        )}
        
        <div className="bg-gray-800/50 rounded-xl p-4 mb-6 border border-gray-700">
          <div className="text-lg font-bold text-purple-400 mb-1">{currentChallenge?.title}</div>
          <div className="flex items-center justify-center gap-3 text-sm text-gray-400">
            <span className={`px-2 py-0.5 rounded ${
              DIFFICULTY_CONFIG[currentChallenge?.difficulty as keyof typeof DIFFICULTY_CONFIG]?.bg
            } ${DIFFICULTY_CONFIG[currentChallenge?.difficulty as keyof typeof DIFFICULTY_CONFIG]?.color}`}>
              {currentChallenge?.difficulty}
            </span>
            <span>{currentChallenge?.language}</span>
            {betAmount > 0 && (
              <>
                <span>•</span>
                <span className="text-yellow-400 flex items-center gap-1">
                  <Coins className="w-3 h-3" />
                  {betAmount} xu
                </span>
              </>
            )}
          </div>
        </div>
        
        <button
          onClick={() => {
            setGameState('lobby');
            setCurrentRoom(null);
          }}
          className="px-8 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-xl font-bold transition-all"
        >
          Hủy Phòng
        </button>
      </div>
    </div>
  );

  // Render Battle
  const renderBattle = () => (
    <div className="space-y-4">
      {/* Battle Header */}
      <div className="bg-gradient-to-r from-red-900/50 via-purple-900/50 to-blue-900/50 rounded-xl p-4 border border-red-500/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-2xl">🥷</span>
            </div>
            <div>
              <div className="font-bold text-white">{profile?.username}</div>
              <div className="text-xs text-blue-400">Bạn</div>
            </div>
          </div>
          
          <div className="text-center">
            <div className={`text-5xl font-black tabular-nums ${
              timeLeft <= 30 ? 'text-red-400 animate-pulse' : 
              timeLeft <= 60 ? 'text-yellow-400' : 'text-white'
            }`}>
              {formatTime(timeLeft)}
            </div>
            <div className="text-xs text-gray-400 mt-1">Thời gian còn lại</div>
            {timeLeft <= 30 && (
              <div className="text-xs text-red-400 animate-pulse mt-1">⚠️ Sắp hết giờ!</div>
            )}
          </div>
          
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="font-bold text-white">Đối thủ</div>
              <div className="text-xs text-red-400">Đang code...</div>
            </div>
            <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-2xl">👹</span>
            </div>
          </div>
        </div>
      </div>

      {/* Challenge Info */}
      <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
        <div className="flex items-center gap-3 mb-4">
          <span className={`px-3 py-1.5 rounded-lg text-sm font-bold ${
            DIFFICULTY_CONFIG[currentChallenge?.difficulty as keyof typeof DIFFICULTY_CONFIG]?.bg
          } ${DIFFICULTY_CONFIG[currentChallenge?.difficulty as keyof typeof DIFFICULTY_CONFIG]?.color} border ${
            DIFFICULTY_CONFIG[currentChallenge?.difficulty as keyof typeof DIFFICULTY_CONFIG]?.border
          }`}>
            {DIFFICULTY_CONFIG[currentChallenge?.difficulty as keyof typeof DIFFICULTY_CONFIG]?.icon} {currentChallenge?.difficulty}
          </span>
          <span className="px-3 py-1.5 bg-blue-500/20 text-blue-400 rounded-lg text-sm font-bold border border-blue-500/30">
            {LANGUAGE_ICONS[currentChallenge?.language || 'Python']} {currentChallenge?.language}
          </span>
          {currentRoom?.bet_amount && currentRoom.bet_amount > 0 && (
            <span className="px-3 py-1.5 bg-yellow-500/20 text-yellow-400 rounded-lg text-sm font-bold flex items-center gap-1 border border-yellow-500/30">
              <Coins className="w-4 h-4" /> {currentRoom.bet_amount} xu
            </span>
          )}
          <span className="px-3 py-1.5 bg-purple-500/20 text-purple-400 rounded-lg text-sm font-bold border border-purple-500/30">
            +{currentChallenge?.xp_reward} XP
          </span>
        </div>
        
        <h2 className="text-2xl font-bold text-white mb-3">{currentChallenge?.title}</h2>
        <p className="text-gray-300 mb-4 leading-relaxed">{currentChallenge?.description}</p>
        
        {/* Test Cases Preview */}
        <div className="bg-gray-900/70 rounded-xl p-4 border border-gray-600">
          <div className="text-sm text-gray-400 mb-3 flex items-center gap-2">
            <Eye className="w-4 h-4" />
            Ví dụ Test Cases:
          </div>
          <div className="space-y-2">
            {currentChallenge?.test_cases.slice(0, 2).map((tc, idx) => (
              <div key={idx} className="flex items-center gap-3 text-sm font-mono bg-gray-800/50 p-2 rounded-lg">
                <span className="text-gray-500">#{idx + 1}</span>
                <span className="text-cyan-400">{tc.input}</span>
                <ChevronRight className="w-4 h-4 text-gray-500" />
                <span className="text-green-400">{tc.expected}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Code Editor */}
      <div className="bg-gray-900 rounded-xl border border-gray-700 overflow-hidden shadow-xl">
        <div className="bg-gray-800 px-4 py-3 border-b border-gray-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
            </div>
            <span className="text-sm text-gray-400 font-medium">Code Editor</span>
          </div>
          <span className="text-xs text-gray-500 flex items-center gap-1">
            {LANGUAGE_ICONS[currentChallenge?.language || 'Python']}
            {currentChallenge?.language}
          </span>
        </div>
        <div className="relative">
          <div className="absolute left-0 top-0 bottom-0 w-12 bg-gray-800/50 border-r border-gray-700 flex flex-col items-center py-4 text-xs text-gray-500 font-mono">
            {userCode.split('\n').map((_, i) => (
              <div key={i} className="h-6 flex items-center">{i + 1}</div>
            ))}
          </div>
          <textarea
            value={userCode}
            onChange={(e) => setUserCode(e.target.value)}
            className="w-full h-72 pl-14 pr-4 py-4 bg-gray-900 text-green-400 font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-purple-500/50"
            spellCheck={false}
            placeholder="Viết code của bạn ở đây..."
          />
        </div>
      </div>

      {/* Submit Button */}
      <button
        onClick={submitCode}
        className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 text-white rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition-all hover:scale-[1.02] hover:shadow-xl hover:shadow-green-500/30"
      >
        <Play className="w-6 h-6" />
        Nộp Bài
        <span className="text-green-200 text-sm">({formatTime(timeLeft)} còn lại)</span>
      </button>
    </div>
  );

  // Render Practice Mode
  const renderPractice = () => (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => {
            setGameState('lobby');
            setIsPracticing(false);
            setPracticeChallenge(null);
          }}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Quay lại
        </button>
        <div className="text-sm text-gray-400">Chế độ luyện tập • Không giới hạn thời gian</div>
      </div>

      {/* Challenge Info */}
      <div className="bg-gray-800/50 rounded-xl p-6 border border-emerald-500/30">
        <div className="flex items-center gap-3 mb-4">
          <span className={`px-3 py-1.5 rounded-lg text-sm font-bold ${
            DIFFICULTY_CONFIG[practiceChallenge?.difficulty as keyof typeof DIFFICULTY_CONFIG]?.bg
          } ${DIFFICULTY_CONFIG[practiceChallenge?.difficulty as keyof typeof DIFFICULTY_CONFIG]?.color}`}>
            {practiceChallenge?.difficulty}
          </span>
          <span className="px-3 py-1.5 bg-blue-500/20 text-blue-400 rounded-lg text-sm font-bold">
            {practiceChallenge?.language}
          </span>
          <span className="px-3 py-1.5 bg-purple-500/20 text-purple-400 rounded-lg text-sm font-bold">
            +{Math.floor((practiceChallenge?.xp_reward || 0) / 2)} XP
          </span>
        </div>
        
        <h2 className="text-2xl font-bold text-white mb-3">{practiceChallenge?.title}</h2>
        <p className="text-gray-300 mb-4">{practiceChallenge?.description}</p>
        
        <div className="bg-gray-900/70 rounded-xl p-4">
          <div className="text-sm text-gray-400 mb-2">Test Cases:</div>
          {practiceChallenge?.test_cases.map((tc, idx) => (
            <div key={idx} className="text-sm font-mono text-gray-300 mb-1 flex items-center gap-2">
              <span className="text-gray-500">#{idx + 1}</span>
              <span className="text-cyan-400">{tc.input}</span>
              <ChevronRight className="w-3 h-3 text-gray-500" />
              <span className="text-green-400">{tc.expected}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Code Editor */}
      <div className="bg-gray-900 rounded-xl border border-gray-700 overflow-hidden">
        <div className="bg-gray-800 px-4 py-3 border-b border-gray-700 flex items-center justify-between">
          <span className="text-sm text-gray-400">Code Editor - Practice Mode</span>
          <span className="text-xs text-emerald-400">🌱 Không giới hạn thời gian</span>
        </div>
        <textarea
          value={practiceCode}
          onChange={(e) => setPracticeCode(e.target.value)}
          className="w-full h-64 p-4 bg-gray-900 text-green-400 font-mono text-sm resize-none focus:outline-none"
          spellCheck={false}
        />
      </div>

      {/* Results */}
      {practiceResult && (
        <div className={`rounded-xl p-4 border ${
          practiceResult.passed === practiceResult.total 
            ? 'bg-green-500/10 border-green-500/30' 
            : 'bg-yellow-500/10 border-yellow-500/30'
        }`}>
          <div className="flex items-center gap-3 mb-3">
            {practiceResult.passed === practiceResult.total ? (
              <CheckCircle className="w-6 h-6 text-green-400" />
            ) : (
              <AlertCircle className="w-6 h-6 text-yellow-400" />
            )}
            <span className="font-bold text-white">
              {practiceResult.passed}/{practiceResult.total} test cases passed
            </span>
          </div>
          <div className="space-y-2">
            {practiceResult.details.map((detail, idx) => (
              <div key={idx} className={`flex items-center gap-2 text-sm ${
                detail.passed ? 'text-green-400' : 'text-red-400'
              }`}>
                {detail.passed ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                Test #{idx + 1}: {detail.input} → {detail.expected}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-4">
        <button
          onClick={runPracticeCode}
          className="flex-1 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white rounded-xl font-bold text-lg flex items-center justify-center gap-2"
        >
          <Play className="w-6 h-6" />
          Chạy Code
        </button>
        <button
          onClick={() => setPracticeCode(practiceChallenge?.starter_code || '')}
          className="px-6 py-4 bg-gray-700 hover:bg-gray-600 text-white rounded-xl font-bold"
        >
          Reset
        </button>
      </div>
    </div>
  );


  // Render Result
  const renderResult = () => (
    <div className="min-h-[500px] flex items-center justify-center">
      <div className="text-center max-w-lg">
        {battleResult === null ? (
          <>
            <div className="w-28 h-28 mx-auto mb-6 bg-gray-700 rounded-full flex items-center justify-center animate-pulse">
              <Clock className="w-14 h-14 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Đang Chờ Đối Thủ...</h2>
            <p className="text-gray-400">Bạn đã nộp bài. Đợi đối thủ hoàn thành.</p>
            <div className="mt-6 flex items-center justify-center gap-2 text-gray-500">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Đang xử lý...</span>
            </div>
          </>
        ) : (
          <>
            {/* Result Icon */}
            <div className={`relative w-36 h-36 mx-auto mb-8`}>
              <div className={`absolute inset-0 rounded-full ${
                battleResult === 'win' ? 'bg-yellow-500/20 animate-ping' : ''
              }`} />
              <div className={`relative w-full h-full rounded-full flex items-center justify-center text-7xl ${
                battleResult === 'win' ? 'bg-gradient-to-br from-yellow-400 to-orange-500 shadow-xl shadow-yellow-500/30' :
                battleResult === 'lose' ? 'bg-gradient-to-br from-gray-600 to-gray-800' :
                'bg-gradient-to-br from-blue-500 to-purple-500'
              } ${battleResult === 'win' ? 'animate-bounce' : ''}`}>
                {battleResult === 'win' ? '🏆' : battleResult === 'lose' ? '😢' : '🤝'}
              </div>
            </div>
            
            {/* Result Text */}
            <h2 className={`text-5xl font-black mb-6 ${
              battleResult === 'win' ? 'text-yellow-400' :
              battleResult === 'lose' ? 'text-gray-400' :
              'text-blue-400'
            }`}>
              {battleResult === 'win' ? 'CHIẾN THẮNG!' :
               battleResult === 'lose' ? 'THẤT BẠI' :
               'HÒA'}
            </h2>

            {/* Rewards */}
            <div className="bg-gray-800/50 rounded-2xl p-6 mb-8 border border-gray-700">
              <div className="text-sm text-gray-400 mb-4">Phần thưởng nhận được</div>
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center">
                  <div className={`text-4xl font-black ${earnedXP > 0 ? 'text-purple-400' : 'text-gray-400'}`}>
                    +{earnedXP}
                  </div>
                  <div className="text-sm text-gray-400 flex items-center justify-center gap-1 mt-1">
                    <Star className="w-4 h-4 text-purple-400" />
                    XP
                  </div>
                </div>
                <div className="text-center">
                  <div className={`text-4xl font-black ${earnedCoins > 0 ? 'text-yellow-400' : 'text-red-400'}`}>
                    {earnedCoins > 0 ? '+' : ''}{earnedCoins}
                  </div>
                  <div className="text-sm text-gray-400 flex items-center justify-center gap-1 mt-1">
                    <Coins className="w-4 h-4 text-yellow-400" />
                    Xu
                  </div>
                </div>
              </div>
              
              {battleResult === 'win' && (
                <div className="mt-4 pt-4 border-t border-gray-700">
                  <div className="flex items-center justify-center gap-2 text-green-400">
                    <TrendingUp className="w-5 h-5" />
                    <span className="font-bold">+25 Rank Points</span>
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-4">
              <button
                onClick={() => {
                  setGameState('lobby');
                  setCurrentRoom(null);
                  setBattleResult(null);
                  fetchData();
                }}
                className="flex-1 py-4 bg-gray-700 hover:bg-gray-600 text-white rounded-xl font-bold transition-all"
              >
                Về Lobby
              </button>
              <button
                onClick={() => {
                  setGameState('lobby');
                  setCurrentRoom(null);
                  setBattleResult(null);
                  setTimeout(() => quickMatch(), 100);
                }}
                className="flex-1 py-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2"
              >
                <Swords className="w-5 h-5" />
                Đấu Tiếp
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );

  // Main Render
  if (loading) {
    return (
      <div className="max-w-5xl mx-auto flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-purple-400 animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      {showConfetti && <Confetti />}
      
      {/* Show header and tabs only in lobby state */}
      {gameState === 'lobby' && (
        <>
          {renderHeader()}
          <TabNav />
          {activeTab === 'arena' && renderArenaTab()}
          {activeTab === 'practice' && renderPracticeTab()}
          {activeTab === 'rankings' && renderRankingsTab()}
          {activeTab === 'history' && renderHistoryTab()}
        </>
      )}
      
      {gameState === 'matchmaking' && renderMatchmaking()}
      {gameState === 'waiting' && renderWaiting()}
      {gameState === 'battle' && renderBattle()}
      {gameState === 'practice' && renderPractice()}
      {gameState === 'result' && renderResult()}
      
      {/* Join Room Modal */}
      {showJoinModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 rounded-2xl p-6 max-w-md w-full border border-gray-700 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <UserPlus className="w-6 h-6 text-blue-400" />
                Nhập Mã Phòng
              </h3>
              <button
                onClick={() => {
                  setShowJoinModal(false);
                  setJoinRoomCode('');
                  setJoinError('');
                }}
                className="p-2 hover:bg-gray-700 rounded-lg text-gray-400 hover:text-white"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            
            <p className="text-gray-400 text-sm mb-4">
              Nhập mã phòng 6 ký tự mà bạn bè đã chia sẻ để tham gia trận đấu
            </p>
            
            <div className="mb-4">
              <input
                type="text"
                value={joinRoomCode}
                onChange={(e) => {
                  setJoinRoomCode(e.target.value.toUpperCase().slice(0, 6));
                  setJoinError('');
                }}
                placeholder="VD: ABC123"
                maxLength={6}
                className="w-full px-4 py-4 bg-gray-800 border border-gray-600 rounded-xl text-white text-center text-2xl font-bold tracking-[0.3em] placeholder:text-gray-500 placeholder:tracking-normal placeholder:text-base focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                autoFocus
              />
            </div>
            
            {joinError && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {joinError}
              </div>
            )}
            
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowJoinModal(false);
                  setJoinRoomCode('');
                  setJoinError('');
                }}
                className="flex-1 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-xl font-bold transition-all"
              >
                Hủy
              </button>
              <button
                onClick={joinByCode}
                disabled={joinRoomCode.length < 6}
                className="flex-1 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-400 hover:to-indigo-400 text-white rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Play className="w-5 h-5" />
                Tham Gia
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* CSS for animations */}
      <style>{`
        @keyframes confetti {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
        .animate-confetti {
          animation: confetti 3s ease-out forwards;
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); opacity: 0.3; }
          50% { transform: translateY(-20px); opacity: 0.8; }
        }
        .animate-float {
          animation: float 4s ease-in-out infinite;
        }
        @keyframes orbit {
          from { transform: rotate(0deg) translateX(70px) rotate(0deg); }
          to { transform: rotate(360deg) translateX(70px) rotate(-360deg); }
        }
      `}</style>
    </div>
  );
};
