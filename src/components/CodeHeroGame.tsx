import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Trophy, Heart, Zap, Bug, Play, RotateCcw, X, Check, Clock, Award, Star, Flame, Target, Loader2 } from 'lucide-react';

// Question type from database
type PythonQuestion = {
  id: string;
  question: string;
  answer: string;
  hint: string;
  difficulty: number;
  category: string;
};

// Fallback questions nếu database chưa có
const FALLBACK_QUESTIONS: PythonQuestion[] = [
  { id: '1', question: "print(2 ** 3) = ?", answer: "8", hint: "** là lũy thừa", difficulty: 1, category: "Math" },
  { id: '2', question: "len([1, 2, 3]) = ?", answer: "3", hint: "Đếm phần tử", difficulty: 1, category: "List" },
  { id: '3', question: "10 % 3 = ?", answer: "1", hint: "Chia lấy dư", difficulty: 1, category: "Math" },
];

// Game constants
const CANVAS_WIDTH = 900;
const CANVAS_HEIGHT = 550;
const PLAYER_SIZE = 45;

// Bug types với đặc tính khác nhau
const BUG_TYPES = [
  { name: 'Normal', color: '#EF4444', radius: 22, speed: 2, points: 100, difficulty: 1 },
  { name: 'Fast', color: '#F97316', radius: 18, speed: 4, points: 150, difficulty: 2 },
  { name: 'Tank', color: '#8B5CF6', radius: 30, speed: 1.5, points: 200, difficulty: 2 },
  { name: 'Elite', color: '#EC4899', radius: 25, speed: 3, points: 300, difficulty: 3 },
  { name: 'Boss', color: '#FBBF24', radius: 40, speed: 1, points: 500, difficulty: 4 },
];

// Power-ups
const POWERUP_TYPES = [
  { name: 'Shield', color: '#3B82F6', icon: '🛡️', duration: 10000 },
  { name: 'Speed', color: '#10B981', icon: '⚡', duration: 8000 },
  { name: 'Double', color: '#F59E0B', icon: '2️⃣', duration: 15000 },
  { name: 'Freeze', color: '#06B6D4', icon: '❄️', duration: 5000 },
  { name: 'Health', color: '#EF4444', icon: '❤️', duration: 0 },
];

// 30 Game Levels
const GAME_LEVELS = [
  // Chapter 1: Tutorial (1-5)
  { level: 1, name: 'Khởi đầu', bugs: 3, maxDifficulty: 1, timeLimit: 0, lives: 5, reward: 50, bg: '#0f172a' },
  { level: 2, name: 'Làm quen', bugs: 4, maxDifficulty: 1, timeLimit: 0, lives: 5, reward: 75, bg: '#0f172a' },
  { level: 3, name: 'Thử thách nhỏ', bugs: 5, maxDifficulty: 1, timeLimit: 120, lives: 5, reward: 100, bg: '#0f172a' },
  { level: 4, name: 'Tăng tốc', bugs: 5, maxDifficulty: 2, timeLimit: 120, lives: 5, reward: 125, bg: '#0f172a' },
  { level: 5, name: 'Boss đầu tiên', bugs: 4, maxDifficulty: 2, timeLimit: 0, lives: 4, reward: 200, bg: '#1e1b4b' },
  // Chapter 2: Getting Harder (6-10)
  { level: 6, name: 'Rừng rậm', bugs: 6, maxDifficulty: 2, timeLimit: 100, lives: 4, reward: 150, bg: '#14532d' },
  { level: 7, name: 'Đêm tối', bugs: 7, maxDifficulty: 2, timeLimit: 100, lives: 4, reward: 175, bg: '#1c1917' },
  { level: 8, name: 'Bão cát', bugs: 7, maxDifficulty: 2, timeLimit: 90, lives: 4, reward: 200, bg: '#78350f' },
  { level: 9, name: 'Hang động', bugs: 8, maxDifficulty: 3, timeLimit: 90, lives: 4, reward: 225, bg: '#292524' },
  { level: 10, name: 'Boss Tank', bugs: 5, maxDifficulty: 3, timeLimit: 0, lives: 3, reward: 350, bg: '#4c1d95' },
  // Chapter 3: Intermediate (11-15)
  { level: 11, name: 'Núi lửa', bugs: 8, maxDifficulty: 3, timeLimit: 80, lives: 4, reward: 250, bg: '#7f1d1d' },
  { level: 12, name: 'Băng giá', bugs: 9, maxDifficulty: 3, timeLimit: 80, lives: 4, reward: 275, bg: '#0c4a6e' },
  { level: 13, name: 'Đầm lầy', bugs: 9, maxDifficulty: 3, timeLimit: 75, lives: 3, reward: 300, bg: '#365314' },
  { level: 14, name: 'Sa mạc', bugs: 10, maxDifficulty: 3, timeLimit: 75, lives: 3, reward: 325, bg: '#92400e' },
  { level: 15, name: 'Boss Elite', bugs: 6, maxDifficulty: 4, timeLimit: 0, lives: 3, reward: 500, bg: '#831843' },
  // Chapter 4: Advanced (16-20)
  { level: 16, name: 'Thành phố', bugs: 10, maxDifficulty: 3, timeLimit: 70, lives: 3, reward: 350, bg: '#1e3a5f' },
  { level: 17, name: 'Phòng thí nghiệm', bugs: 11, maxDifficulty: 4, timeLimit: 70, lives: 3, reward: 375, bg: '#134e4a' },
  { level: 18, name: 'Không gian', bugs: 11, maxDifficulty: 4, timeLimit: 65, lives: 3, reward: 400, bg: '#0f0f23' },
  { level: 19, name: 'Hố đen', bugs: 12, maxDifficulty: 4, timeLimit: 65, lives: 3, reward: 425, bg: '#030712' },
  { level: 20, name: 'Boss Vũ trụ', bugs: 8, maxDifficulty: 4, timeLimit: 0, lives: 2, reward: 750, bg: '#1e1b4b' },
  // Chapter 5: Expert (21-25)
  { level: 21, name: 'Địa ngục', bugs: 12, maxDifficulty: 4, timeLimit: 60, lives: 3, reward: 450, bg: '#450a0a' },
  { level: 22, name: 'Thiên đường', bugs: 13, maxDifficulty: 4, timeLimit: 60, lives: 3, reward: 475, bg: '#fef3c7' },
  { level: 23, name: 'Chiều không gian', bugs: 13, maxDifficulty: 4, timeLimit: 55, lives: 2, reward: 500, bg: '#4a044e' },
  { level: 24, name: 'Ma trận', bugs: 14, maxDifficulty: 4, timeLimit: 55, lives: 2, reward: 525, bg: '#022c22' },
  { level: 25, name: 'Boss Ma trận', bugs: 10, maxDifficulty: 4, timeLimit: 0, lives: 2, reward: 1000, bg: '#0a0a0a' },
  // Chapter 6: Master (26-30)
  { level: 26, name: 'Thế giới ảo', bugs: 14, maxDifficulty: 4, timeLimit: 50, lives: 2, reward: 550, bg: '#172554' },
  { level: 27, name: 'Virus Core', bugs: 15, maxDifficulty: 4, timeLimit: 50, lives: 2, reward: 600, bg: '#3f0f0f' },
  { level: 28, name: 'Hệ thống', bugs: 15, maxDifficulty: 4, timeLimit: 45, lives: 2, reward: 650, bg: '#0f3f0f' },
  { level: 29, name: 'Kernel', bugs: 16, maxDifficulty: 4, timeLimit: 45, lives: 1, reward: 700, bg: '#0f0f3f' },
  { level: 30, name: 'FINAL BOSS', bugs: 12, maxDifficulty: 4, timeLimit: 0, lives: 1, reward: 2000, bg: '#000000' },
];

type BugEnemy = {
  id: number; x: number; y: number; dx: number; dy: number;
  type: typeof BUG_TYPES[0]; health: number; maxHealth: number;
};

type PowerUp = {
  id: number; x: number; y: number; type: typeof POWERUP_TYPES[0];
};

type Particle = {
  x: number; y: number; dx: number; dy: number; life: number; color: string; size: number;
};

type GameState = 'menu' | 'levels' | 'playing' | 'question' | 'gameover' | 'victory' | 'leaderboard' | 'paused';

type LeaderboardEntry = {
  user_id: string; best_score: number; total_bugs_killed: number;
  total_games_played: number; profiles?: { username: string; avatar_url: string };
};

export const CodeHeroGame = () => {
  const { user, profile } = useAuth();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameLoopRef = useRef<number>();
  const keysRef = useRef<Set<string>>(new Set());
  
  // Game refs
  const playerRef = useRef({ x: 400, y: 250, speed: 5, baseSpeed: 5 });
  const bugsRef = useRef<BugEnemy[]>([]);
  const powerupsRef = useRef<PowerUp[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const activePowerupsRef = useRef<{[key: string]: number}>({});

  // Questions from database
  const [questions, setQuestions] = useState<PythonQuestion[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(true);

  // UI State
  const [gameState, setGameState] = useState<GameState>('menu');
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(5);
  const [currentLevel, setCurrentLevel] = useState(1);
  const [unlockedLevels, setUnlockedLevels] = useState<number[]>([1]);
  const [completedLevels, setCompletedLevels] = useState<number[]>([]);
  const [levelTimeLeft, setLevelTimeLeft] = useState(0);
  const [speed, setSpeed] = useState(5);
  const [bugsCount, setBugsCount] = useState(0);
  const [bugsKilled, setBugsKilled] = useState(0);
  const [questionsCorrect, setQuestionsCorrect] = useState(0);
  const [questionsWrong, setQuestionsWrong] = useState(0);
  const [playTime, setPlayTime] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [totalXP, setTotalXP] = useState(0);
  const [activePowerups, setActivePowerups] = useState<string[]>([]);
  
  // Question state
  const [currentQuestion, setCurrentQuestion] = useState<PythonQuestion | null>(null);
  const [currentBugId, setCurrentBugId] = useState<number | null>(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [answerResult, setAnswerResult] = useState<'correct' | 'wrong' | null>(null);
  const [timeLeft, setTimeLeft] = useState(30);
  const [streak, setStreak] = useState(0);
  
  // Leaderboard & Stats
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [myBestScore, setMyBestScore] = useState<LeaderboardEntry | null>(null);

  // Fetch questions from database
  const fetchQuestions = async () => {
    setLoadingQuestions(true);
    try {
      const { data, error } = await supabase
        .from('python_questions')
        .select('*')
        .eq('is_active', true)
        .order('difficulty');
      
      if (error) throw error;
      if (data && data.length > 0) {
        setQuestions(data);
      } else {
        setQuestions(FALLBACK_QUESTIONS);
      }
    } catch (err) {
      console.error('Error fetching questions:', err);
      setQuestions(FALLBACK_QUESTIONS);
    }
    setLoadingQuestions(false);
  };

  // Load questions on mount
  useEffect(() => {
    fetchQuestions();
  }, []);

  // Spawn particles
  const spawnParticles = (x: number, y: number, color: string, count: number) => {
    for (let i = 0; i < count; i++) {
      particlesRef.current.push({
        x, y,
        dx: (Math.random() - 0.5) * 8,
        dy: (Math.random() - 0.5) * 8,
        life: 30,
        color,
        size: Math.random() * 4 + 2
      });
    }
  };

  // Create bugs for level
  const createLevelBugs = (levelNum: number) => {
    const levelConfig = GAME_LEVELS[levelNum - 1];
    if (!levelConfig) return;
    
    const bugs: BugEnemy[] = [];
    const isBossLevel = levelConfig.name.includes('Boss') || levelConfig.name === 'FINAL BOSS';
    
    for (let i = 0; i < levelConfig.bugs; i++) {
      const availableTypes = BUG_TYPES.filter(t => t.difficulty <= levelConfig.maxDifficulty);
      let type = availableTypes[Math.floor(Math.random() * availableTypes.length)];
      
      // Boss levels have guaranteed boss bugs
      if (isBossLevel && i === 0) {
        type = BUG_TYPES.find(t => t.name === 'Boss') || type;
      }
      
      const health = type.difficulty + Math.floor(levelNum / 10);
      
      bugs.push({
        id: Date.now() + i,
        x: Math.random() * (CANVAS_WIDTH - 100) + 50,
        y: Math.random() * (CANVAS_HEIGHT - 100) + 50,
        dx: (Math.random() - 0.5) * type.speed * 2,
        dy: (Math.random() - 0.5) * type.speed * 2,
        type, health, maxHealth: health
      });
    }
    bugsRef.current = bugs;
    setBugsCount(bugs.length);
    
    // Set time limit
    if (levelConfig.timeLimit > 0) {
      setLevelTimeLeft(levelConfig.timeLimit);
    } else {
      setLevelTimeLeft(0);
    }
  };

  // Spawn powerup
  const spawnPowerup = () => {
    if (Math.random() < 0.3 && powerupsRef.current.length < 3) {
      const type = POWERUP_TYPES[Math.floor(Math.random() * POWERUP_TYPES.length)];
      powerupsRef.current.push({
        id: Date.now(),
        x: Math.random() * (CANVAS_WIDTH - 60) + 30,
        y: Math.random() * (CANVAS_HEIGHT - 60) + 30,
        type
      });
    }
  };

  // Start specific level
  const startLevel = (levelNum: number) => {
    const levelConfig = GAME_LEVELS[levelNum - 1];
    if (!levelConfig) return;
    
    playerRef.current = { x: 400, y: 250, speed: 5, baseSpeed: 5 };
    bugsRef.current = [];
    powerupsRef.current = [];
    particlesRef.current = [];
    activePowerupsRef.current = {};
    setScore(0);
    setLives(levelConfig.lives);
    setCurrentLevel(levelNum);
    setSpeed(5);
    setBugsKilled(0);
    setQuestionsCorrect(0);
    setQuestionsWrong(0);
    setPlayTime(0);
    setCombo(0);
    setMaxCombo(0);
    setTotalXP(0);
    setStreak(0);
    setActivePowerups([]);
    createLevelBugs(levelNum);
    setGameState('playing');
  };

  // Quick play (level 1 or continue)
  const startGame = () => {
    const nextLevel = completedLevels.length > 0 ? Math.min(Math.max(...completedLevels) + 1, 30) : 1;
    startLevel(nextLevel);
  };

  // Collision check
  const checkCollision = (px: number, py: number, bx: number, by: number, radius: number) => {
    const dx = (px + PLAYER_SIZE/2) - bx;
    const dy = (py + PLAYER_SIZE/2) - by;
    return Math.sqrt(dx*dx + dy*dy) < (PLAYER_SIZE/2 + radius);
  };

  // Get question based on difficulty
  const getQuestion = (difficulty: number) => {
    const availableQuestions = questions.filter(q => q.difficulty <= Math.min(difficulty, 4));
    if (availableQuestions.length === 0) return questions[0] || FALLBACK_QUESTIONS[0];
    return availableQuestions[Math.floor(Math.random() * availableQuestions.length)];
  };

  // Trigger question
  const triggerQuestion = (bugId: number) => {
    const bug = bugsRef.current.find(b => b.id === bugId);
    if (!bug) return;
    const q = getQuestion(bug.type.difficulty);
    setCurrentQuestion(q);
    setCurrentBugId(bugId);
    setUserAnswer('');
    setShowHint(false);
    setAnswerResult(null);
    setTimeLeft(30 - (bug.type.difficulty * 5)); // Harder = less time
    setGameState('question');
  };

  // Submit answer
  const submitAnswer = () => {
    if (!currentQuestion || currentBugId === null) return;
    const bug = bugsRef.current.find(b => b.id === currentBugId);
    const isCorrect = userAnswer.toLowerCase().trim() === currentQuestion.answer.toLowerCase().trim();
    setAnswerResult(isCorrect ? 'correct' : 'wrong');
    
    setTimeout(() => {
      if (isCorrect && bug) {
        bug.health -= 1;
        const hasDouble = activePowerupsRef.current['Double'] > Date.now();
        const comboBonus = Math.min(combo, 10) * 10;
        const points = (bug.type.points + comboBonus) * (hasDouble ? 2 : 1);
        
        if (bug.health <= 0) {
          bugsRef.current = bugsRef.current.filter(b => b.id !== currentBugId);
          spawnParticles(bug.x, bug.y, bug.type.color, 20);
          setBugsKilled(prev => prev + 1);
          spawnPowerup();
        }
        
        setBugsCount(bugsRef.current.length);
        playerRef.current.speed += 0.2;
        setSpeed(Math.round(playerRef.current.speed * 10) / 10);
        setScore(prev => prev + points);
        setQuestionsCorrect(prev => prev + 1);
        setCombo(prev => { const n = prev + 1; if (n > maxCombo) setMaxCombo(n); return n; });
        setStreak(prev => prev + 1);
        setTotalXP(prev => prev + currentQuestion.difficulty * 25);
        
        // Check level complete
        if (bugsRef.current.length === 0) {
          completeLevel();
        }
      } else {
        if (!activePowerupsRef.current['Shield'] || activePowerupsRef.current['Shield'] < Date.now()) {
          setLives(prev => { if (prev <= 1) { endGame(); return 0; } return prev - 1; });
        }
        setQuestionsWrong(prev => prev + 1);
        setCombo(0);
        setStreak(0);
      }
      setCurrentQuestion(null);
      setCurrentBugId(null);
      setGameState('playing');
    }, 1000);
  };

  // Complete level - auto advance to next level
  const completeLevel = async () => {
    const levelConfig = GAME_LEVELS[currentLevel - 1];
    const coinsEarned = (levelConfig?.reward || 100) + bugsKilled * 5 + questionsCorrect * 10;
    
    // Unlock next level
    if (!completedLevels.includes(currentLevel)) {
      setCompletedLevels(prev => [...prev, currentLevel]);
    }
    if (currentLevel < 30 && !unlockedLevels.includes(currentLevel + 1)) {
      setUnlockedLevels(prev => [...prev, currentLevel + 1]);
    }
    
    // Save score
    if (user) {
      try {
        await supabase.rpc('save_code_hero_score', {
          p_score: score + coinsEarned, p_bugs_killed: bugsKilled, p_questions_correct: questionsCorrect,
          p_questions_wrong: questionsWrong, p_max_speed: Math.round(speed), p_play_time: playTime
        });
        await supabase.rpc('add_coins', { amount: coinsEarned });
      } catch (e) { console.error(e); }
    }
    
    // Auto advance to next level after 2 seconds
    if (currentLevel < 30) {
      setGameState('victory');
      setTimeout(() => {
        startLevel(currentLevel + 1);
      }, 2500);
    } else {
      // Completed all 30 levels!
      setGameState('victory');
    }
  };

  // End game (lose)
  const endGame = async () => {
    setGameState('gameover');
    const coinsEarned = bugsKilled * 5 + questionsCorrect * 10;
    
    if (user) {
      try {
        await supabase.rpc('save_code_hero_score', {
          p_score: score, p_bugs_killed: bugsKilled, p_questions_correct: questionsCorrect,
          p_questions_wrong: questionsWrong, p_max_speed: Math.round(speed), p_play_time: playTime
        });
        if (coinsEarned > 0) await supabase.rpc('add_coins', { amount: coinsEarned });
      } catch (e) { console.error(e); }
    }
    fetchLeaderboard();
  };

  // Fetch leaderboard
  const fetchLeaderboard = async () => {
    const { data } = await supabase.from('code_hero_best_scores')
      .select('*, profiles(username, avatar_url)').order('best_score', { ascending: false }).limit(10);
    if (data) setLeaderboard(data);
    if (user) {
      const { data: my } = await supabase.from('code_hero_best_scores').select('*').eq('user_id', user.id).single();
      if (my) setMyBestScore(my);
    }
  };

  // Question timer
  useEffect(() => {
    if (gameState !== 'question') return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setAnswerResult('wrong');
          setTimeout(() => {
            if (!activePowerupsRef.current['Shield'] || activePowerupsRef.current['Shield'] < Date.now()) {
              setLives(p => { if (p <= 1) { endGame(); return 0; } return p - 1; });
            }
            setQuestionsWrong(p => p + 1);
            setCombo(0);
            setCurrentQuestion(null);
            setCurrentBugId(null);
            setGameState('playing');
          }, 1000);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [gameState]);

  // Game loop
  useEffect(() => {
    if (gameState !== 'playing') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let lastSecond = Date.now();
    
    const loop = () => {
      // Time
      if (Date.now() - lastSecond >= 1000) {
        setPlayTime(p => p + 1);
        // Level time limit
        setLevelTimeLeft(prev => {
          if (prev > 0 && prev <= 1) {
            endGame(); // Time's up!
            return 0;
          }
          return prev > 0 ? prev - 1 : 0;
        });
        lastSecond = Date.now();
        // Update active powerups display
        const active: string[] = [];
        Object.entries(activePowerupsRef.current).forEach(([name, time]) => {
          if (time > Date.now()) active.push(name);
        });
        setActivePowerups(active);
      }

      // Clear
      const gradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
      gradient.addColorStop(0, '#0f0f23');
      gradient.addColorStop(1, '#1a1a3e');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      
      // Animated grid
      ctx.strokeStyle = '#2a2a5e';
      ctx.lineWidth = 1;
      const offset = (Date.now() / 50) % 40;
      for (let x = -40 + offset; x < CANVAS_WIDTH + 40; x += 40) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, CANVAS_HEIGHT); ctx.stroke();
      }
      for (let y = 0; y < CANVAS_HEIGHT; y += 40) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(CANVAS_WIDTH, y); ctx.stroke();
      }

      // Move player
      const p = playerRef.current;
      const hasSpeed = activePowerupsRef.current['Speed'] > Date.now();
      const currentSpeed = hasSpeed ? p.speed * 1.5 : p.speed;
      
      if (keysRef.current.has('arrowup') || keysRef.current.has('w')) p.y = Math.max(0, p.y - currentSpeed);
      if (keysRef.current.has('arrowdown') || keysRef.current.has('s')) p.y = Math.min(CANVAS_HEIGHT - PLAYER_SIZE, p.y + currentSpeed);
      if (keysRef.current.has('arrowleft') || keysRef.current.has('a')) p.x = Math.max(0, p.x - currentSpeed);
      if (keysRef.current.has('arrowright') || keysRef.current.has('d')) p.x = Math.min(CANVAS_WIDTH - PLAYER_SIZE, p.x + currentSpeed);

      // Draw Warrior Character
      const hasShield = activePowerupsRef.current['Shield'] > Date.now();
      const cx = p.x + PLAYER_SIZE/2;
      const cy = p.y + PLAYER_SIZE/2;
      
      // Shield aura
      if (hasShield) {
        ctx.strokeStyle = '#60A5FA';
        ctx.lineWidth = 4;
        ctx.shadowColor = '#3B82F6';
        ctx.shadowBlur = 20;
        ctx.beginPath();
        ctx.arc(cx, cy, PLAYER_SIZE/2 + 12, 0, Math.PI * 2);
        ctx.stroke();
        ctx.shadowBlur = 0;
      }
      
      // Speed trail
      if (hasSpeed) {
        ctx.fillStyle = 'rgba(16, 185, 129, 0.3)';
        ctx.beginPath();
        ctx.ellipse(cx - 15, cy, 8, 20, 0, 0, Math.PI * 2);
        ctx.fill();
      }
      
      // Body (armor)
      ctx.fillStyle = hasSpeed ? '#10B981' : '#3B82F6';
      ctx.shadowColor = hasSpeed ? '#10B981' : '#3B82F6';
      ctx.shadowBlur = 15;
      ctx.beginPath();
      ctx.moveTo(cx, p.y + 8); // top
      ctx.lineTo(cx + 18, p.y + 20); // right shoulder
      ctx.lineTo(cx + 15, p.y + 40); // right bottom
      ctx.lineTo(cx - 15, p.y + 40); // left bottom
      ctx.lineTo(cx - 18, p.y + 20); // left shoulder
      ctx.closePath();
      ctx.fill();
      ctx.shadowBlur = 0;
      
      // Armor details
      ctx.strokeStyle = hasSpeed ? '#34D399' : '#60A5FA';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cx, p.y + 15);
      ctx.lineTo(cx, p.y + 35);
      ctx.moveTo(cx - 10, p.y + 25);
      ctx.lineTo(cx + 10, p.y + 25);
      ctx.stroke();
      
      // Head (helmet)
      ctx.fillStyle = '#1E3A5F';
      ctx.beginPath();
      ctx.arc(cx, p.y + 5, 12, 0, Math.PI * 2);
      ctx.fill();
      
      // Helmet visor
      ctx.fillStyle = '#60A5FA';
      ctx.fillRect(cx - 8, p.y + 2, 16, 6);
      
      // Helmet crest
      ctx.fillStyle = '#EF4444';
      ctx.beginPath();
      ctx.moveTo(cx, p.y - 10);
      ctx.lineTo(cx + 4, p.y + 2);
      ctx.lineTo(cx - 4, p.y + 2);
      ctx.closePath();
      ctx.fill();
      
      // Sword (right hand)
      ctx.fillStyle = '#9CA3AF';
      ctx.fillRect(cx + 20, p.y + 15, 4, 25);
      ctx.fillStyle = '#FBBF24';
      ctx.fillRect(cx + 18, p.y + 38, 8, 4);
      ctx.fillStyle = '#7C3AED';
      ctx.beginPath();
      ctx.arc(cx + 22, p.y + 44, 4, 0, Math.PI * 2);
      ctx.fill();
      
      // Shield (left hand) - if has shield powerup
      if (hasShield) {
        ctx.fillStyle = '#1E40AF';
        ctx.beginPath();
        ctx.ellipse(cx - 22, p.y + 28, 10, 14, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#FBBF24';
        ctx.beginPath();
        ctx.arc(cx - 22, p.y + 28, 5, 0, Math.PI * 2);
        ctx.fill();
      }
      
      // Combo indicator
      if (combo > 0) {
        ctx.fillStyle = combo >= 10 ? '#FBBF24' : combo >= 5 ? '#F97316' : '#EF4444';
        ctx.font = 'bold 14px Arial';
        ctx.fillText(`${combo}x COMBO!`, p.x, p.y - 10);
      }

      // Update and draw bugs
      const hasFreeze = activePowerupsRef.current['Freeze'] > Date.now();
      let collisionBugId: number | null = null;
      
      bugsRef.current.forEach(bug => {
        if (!hasFreeze) {
          bug.x += bug.dx;
          bug.y += bug.dy;
          if (bug.x < bug.type.radius || bug.x > CANVAS_WIDTH - bug.type.radius) bug.dx *= -1;
          if (bug.y < bug.type.radius || bug.y > CANVAS_HEIGHT - bug.type.radius) bug.dy *= -1;
          bug.x = Math.max(bug.type.radius, Math.min(CANVAS_WIDTH - bug.type.radius, bug.x));
          bug.y = Math.max(bug.type.radius, Math.min(CANVAS_HEIGHT - bug.type.radius, bug.y));
        }

        // Draw Monster Bug
        const bx = bug.x;
        const by = bug.y;
        const br = bug.type.radius;
        const bugColor = hasFreeze ? '#06B6D4' : bug.type.color;
        
        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.beginPath();
        ctx.ellipse(bx, by + br + 5, br * 0.8, 6, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Body glow
        ctx.shadowColor = bugColor;
        ctx.shadowBlur = 20;
        
        // Main body (oval)
        ctx.fillStyle = bugColor;
        ctx.beginPath();
        ctx.ellipse(bx, by, br, br * 0.8, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        
        // Body segments
        ctx.fillStyle = hasFreeze ? '#0891B2' : (bug.type.name === 'Boss' ? '#D97706' : '#991B1B');
        ctx.beginPath();
        ctx.ellipse(bx, by + br * 0.3, br * 0.7, br * 0.4, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Spikes/horns based on type
        if (bug.type.name === 'Elite' || bug.type.name === 'Boss') {
          ctx.fillStyle = '#1F2937';
          // Left horn
          ctx.beginPath();
          ctx.moveTo(bx - br * 0.5, by - br * 0.5);
          ctx.lineTo(bx - br * 0.3, by - br * 1.2);
          ctx.lineTo(bx - br * 0.1, by - br * 0.5);
          ctx.fill();
          // Right horn
          ctx.beginPath();
          ctx.moveTo(bx + br * 0.5, by - br * 0.5);
          ctx.lineTo(bx + br * 0.3, by - br * 1.2);
          ctx.lineTo(bx + br * 0.1, by - br * 0.5);
          ctx.fill();
        }
        
        // Eyes (angry)
        ctx.fillStyle = '#FBBF24';
        ctx.beginPath();
        ctx.ellipse(bx - br * 0.35, by - br * 0.2, br * 0.25, br * 0.2, -0.3, 0, Math.PI * 2);
        ctx.ellipse(bx + br * 0.35, by - br * 0.2, br * 0.25, br * 0.2, 0.3, 0, Math.PI * 2);
        ctx.fill();
        
        // Pupils
        ctx.fillStyle = '#1F2937';
        ctx.beginPath();
        ctx.arc(bx - br * 0.35, by - br * 0.2, br * 0.1, 0, Math.PI * 2);
        ctx.arc(bx + br * 0.35, by - br * 0.2, br * 0.1, 0, Math.PI * 2);
        ctx.fill();
        
        // Angry eyebrows
        ctx.strokeStyle = '#1F2937';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(bx - br * 0.55, by - br * 0.45);
        ctx.lineTo(bx - br * 0.15, by - br * 0.35);
        ctx.moveTo(bx + br * 0.55, by - br * 0.45);
        ctx.lineTo(bx + br * 0.15, by - br * 0.35);
        ctx.stroke();
        
        // Mouth with teeth
        ctx.fillStyle = '#1F2937';
        ctx.beginPath();
        ctx.ellipse(bx, by + br * 0.35, br * 0.4, br * 0.2, 0, 0, Math.PI);
        ctx.fill();
        ctx.fillStyle = 'white';
        for (let i = -2; i <= 2; i++) {
          ctx.beginPath();
          ctx.moveTo(bx + i * br * 0.15, by + br * 0.25);
          ctx.lineTo(bx + i * br * 0.15 - 3, by + br * 0.4);
          ctx.lineTo(bx + i * br * 0.15 + 3, by + br * 0.4);
          ctx.fill();
        }
        
        // Legs
        ctx.strokeStyle = bugColor;
        ctx.lineWidth = 4;
        ctx.lineCap = 'round';
        const legAngle = Math.sin(Date.now() / 100 + bug.id) * 0.3;
        for (let side = -1; side <= 1; side += 2) {
          for (let i = 0; i < 3; i++) {
            ctx.beginPath();
            ctx.moveTo(bx + side * br * 0.6, by + (i - 1) * br * 0.3);
            ctx.lineTo(bx + side * (br + 10), by + (i - 1) * br * 0.3 + Math.sin(legAngle + i) * 5);
            ctx.stroke();
          }
        }
        
        // Health bar for multi-hit bugs
        if (bug.maxHealth > 1) {
          ctx.fillStyle = '#1F2937';
          ctx.fillRect(bx - 22, by - br - 15, 44, 8);
          ctx.fillStyle = bug.health > bug.maxHealth * 0.5 ? '#10B981' : bug.health > bug.maxHealth * 0.25 ? '#FBBF24' : '#EF4444';
          ctx.fillRect(bx - 20, by - br - 13, 40 * (bug.health / bug.maxHealth), 4);
        }
        
        // Type indicator
        ctx.fillStyle = 'white';
        ctx.font = 'bold 10px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(bug.type.name, bx, by + br + 18);
        
        // Freeze effect
        if (hasFreeze) {
          ctx.strokeStyle = '#67E8F9';
          ctx.lineWidth = 2;
          for (let i = 0; i < 6; i++) {
            const angle = (i / 6) * Math.PI * 2;
            ctx.beginPath();
            ctx.moveTo(bx + Math.cos(angle) * br * 0.5, by + Math.sin(angle) * br * 0.5);
            ctx.lineTo(bx + Math.cos(angle) * (br + 8), by + Math.sin(angle) * (br + 8));
            ctx.stroke();
          }
        }
        
        if (checkCollision(p.x, p.y, bx, by, br)) {
          collisionBugId = bug.id;
        }
      });

      // Draw powerups
      powerupsRef.current.forEach((pu, idx) => {
        ctx.fillStyle = pu.type.color;
        ctx.shadowColor = pu.type.color;
        ctx.shadowBlur = 20;
        ctx.beginPath();
        ctx.arc(pu.x, pu.y, 18, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.font = '20px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(pu.type.icon, pu.x, pu.y + 7);
        
        // Check powerup collision
        if (checkCollision(p.x, p.y, pu.x, pu.y, 18)) {
          if (pu.type.name === 'Health') {
            setLives(l => Math.min(l + 1, 5));
          } else {
            activePowerupsRef.current[pu.type.name] = Date.now() + pu.type.duration;
          }
          spawnParticles(pu.x, pu.y, pu.type.color, 15);
          powerupsRef.current.splice(idx, 1);
        }
      });

      // Update and draw particles
      particlesRef.current = particlesRef.current.filter(pt => {
        pt.x += pt.dx;
        pt.y += pt.dy;
        pt.life -= 1;
        pt.dy += 0.2; // gravity
        
        ctx.fillStyle = pt.color;
        ctx.globalAlpha = pt.life / 30;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
        
        return pt.life > 0;
      });

      // Wave indicator
      // Level indicator
      const levelConfig = GAME_LEVELS[currentLevel - 1];
      ctx.fillStyle = 'rgba(255,255,255,0.08)';
      ctx.font = 'bold 60px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(`Level ${currentLevel}`, CANVAS_WIDTH/2, CANVAS_HEIGHT/2 + 20);
      ctx.font = 'bold 24px Arial';
      ctx.fillText(levelConfig?.name || '', CANVAS_WIDTH/2, CANVAS_HEIGHT/2 + 50);

      if (collisionBugId !== null) {
        triggerQuestion(collisionBugId);
        return;
      }

      gameLoopRef.current = requestAnimationFrame(loop);
    };

    gameLoopRef.current = requestAnimationFrame(loop);
    return () => { if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current); };
  }, [gameState, combo, currentLevel]);

  // Keyboard
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      keysRef.current.add(e.key.toLowerCase());
      if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' '].includes(e.key)) e.preventDefault();
      if (e.key === 'Escape' && gameState === 'playing') setGameState('paused');
    };
    const up = (e: KeyboardEvent) => keysRef.current.delete(e.key.toLowerCase());
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => { window.removeEventListener('keydown', down); window.removeEventListener('keyup', up); };
  }, [gameState]);

  useEffect(() => { fetchLeaderboard(); }, [user]);

  const accuracy = questionsCorrect + questionsWrong > 0 
    ? Math.round((questionsCorrect / (questionsCorrect + questionsWrong)) * 100) : 0;

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500">
          🎮 Code Hero Adventure
        </h1>
        <p className="text-gray-400 text-sm">Tiêu diệt bug bằng kiến thức Python!</p>
      </div>

      {/* Stats Bar */}
      {gameState !== 'menu' && (
        <div className="flex items-center gap-4 bg-gray-800/80 px-4 py-2 rounded-xl border border-gray-700 flex-wrap justify-center">
          <div className="flex items-center gap-1.5">
            <Trophy className="w-4 h-4 text-yellow-400" />
            <span className="font-bold text-white text-sm">{score.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <Heart key={i} className={`w-4 h-4 ${i < lives ? 'text-red-500 fill-red-500' : 'text-gray-600'}`} />
            ))}
          </div>
          <div className="flex items-center gap-1.5">
            <Target className="w-4 h-4 text-purple-400" />
            <span className="text-white text-sm">Lv.<span className="font-bold text-purple-400">{currentLevel}</span></span>
          </div>
          {levelTimeLeft > 0 && (
            <div className={`flex items-center gap-1.5 ${levelTimeLeft <= 10 ? 'text-red-400 animate-pulse' : 'text-cyan-400'}`}>
              <Clock className="w-4 h-4" />
              <span className="font-bold text-sm">{levelTimeLeft}s</span>
            </div>
          )}
          <div className="flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-blue-400" />
            <span className="text-white text-sm">{speed}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Bug className="w-4 h-4 text-red-400" />
            <span className="text-white text-sm">{bugsCount}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Flame className="w-4 h-4 text-orange-400" />
            <span className="text-white text-sm">{combo}x</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Star className="w-4 h-4 text-yellow-400" />
            <span className="text-white text-sm">{totalXP} XP</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-green-400" />
            <span className="text-white text-sm">{Math.floor(playTime/60)}:{(playTime%60).toString().padStart(2,'0')}</span>
          </div>
          {activePowerups.map(p => (
            <div key={p} className="px-2 py-0.5 bg-blue-500/20 rounded text-blue-400 text-xs font-bold">{p}</div>
          ))}
        </div>
      )}

      {/* Canvas */}
      <div className="relative">
        <canvas ref={canvasRef} width={CANVAS_WIDTH} height={CANVAS_HEIGHT} 
          className="rounded-2xl border-4 border-gray-700 shadow-2xl" />

        {/* Menu */}
        {gameState === 'menu' && (
          <div className="absolute inset-0 bg-black/85 rounded-2xl flex flex-col items-center justify-center gap-4 p-6">
            <div className="text-7xl animate-bounce">🦸‍♂️</div>
            <h2 className="text-4xl font-black text-white">Code Hero Adventure</h2>
            <p className="text-gray-400 max-w-lg text-center">
              Di chuyển bằng mũi tên/WASD. Chạm bug để trả lời câu hỏi Python. 
              Thu thập power-ups, đạt combo cao và chinh phục các wave!
            </p>
            
            {/* Questions count from database */}
            <div className="flex items-center gap-2 px-4 py-2 bg-purple-500/20 rounded-full border border-purple-500/30">
              {loadingQuestions ? (
                <><Loader2 className="w-4 h-4 text-purple-400 animate-spin" /><span className="text-purple-400 text-sm">Đang tải câu hỏi...</span></>
              ) : (
                <><span className="text-2xl">🐍</span><span className="text-purple-400 text-sm font-bold">{questions.length} câu hỏi Python từ Database</span></>
              )}
            </div>
            
            {/* Bug types preview */}
            <div className="flex gap-3 my-2">
              {BUG_TYPES.map(t => (
                <div key={t.name} className="flex flex-col items-center gap-1">
                  <div className="w-8 h-8 rounded-full" style={{background: t.color}} />
                  <span className="text-xs text-gray-400">{t.name}</span>
                  <span className="text-xs text-yellow-400">+{t.points}</span>
                </div>
              ))}
            </div>
            
            {/* Powerups preview */}
            <div className="flex gap-3">
              {POWERUP_TYPES.map(p => (
                <div key={p.name} className="flex flex-col items-center gap-1">
                  <span className="text-2xl">{p.icon}</span>
                  <span className="text-xs text-gray-400">{p.name}</span>
                </div>
              ))}
            </div>
            
            <div className="flex gap-3 mt-2">
              <button onClick={startGame} disabled={loadingQuestions || questions.length === 0} 
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-bold hover:scale-105 transition-transform shadow-lg disabled:opacity-50">
                {loadingQuestions ? <Loader2 className="w-5 h-5 animate-spin" /> : <Play className="w-5 h-5" />} Tiếp tục
              </button>
              <button onClick={() => setGameState('levels')} 
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-bold hover:scale-105 transition-transform shadow-lg">
                <Target className="w-5 h-5" /> 30 Màn chơi
              </button>
              <button onClick={() => { fetchLeaderboard(); setGameState('leaderboard'); }} 
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-xl font-bold hover:scale-105 transition-transform shadow-lg">
                <Trophy className="w-5 h-5" /> Xếp hạng
              </button>
            </div>
            
            {/* Progress */}
            <div className="text-center text-sm text-gray-400 mt-2">
              <span>Đã hoàn thành: <span className="text-green-400 font-bold">{completedLevels.length}/30</span> màn</span>
            </div>
            
            <div className="flex gap-4 text-gray-500 text-sm mt-2">
              <span>⬆️⬇️⬅️➡️ hoặc WASD di chuyển</span>
              <span>ESC tạm dừng</span>
            </div>
          </div>
        )}

        {/* Level Selection */}
        {gameState === 'levels' && (
          <div className="absolute inset-0 bg-black/95 rounded-2xl flex flex-col p-4 overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-2xl font-black text-white">🗺️ Chọn màn chơi</h2>
              <button onClick={() => setGameState('menu')} className="p-2 hover:bg-gray-700 rounded-lg text-gray-400">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <div className="grid grid-cols-6 gap-2">
                {GAME_LEVELS.map((lvl) => {
                  const isUnlocked = unlockedLevels.includes(lvl.level);
                  const isCompleted = completedLevels.includes(lvl.level);
                  const isBoss = lvl.name.includes('Boss') || lvl.name === 'FINAL BOSS';
                  return (
                    <button
                      key={lvl.level}
                      onClick={() => isUnlocked && startLevel(lvl.level)}
                      disabled={!isUnlocked}
                      className={`relative p-2 rounded-xl text-center transition-all ${
                        isCompleted ? 'bg-green-500/20 border-2 border-green-500' :
                        isUnlocked ? 'bg-gray-700 border-2 border-gray-600 hover:border-purple-500 hover:scale-105' :
                        'bg-gray-800/50 border-2 border-gray-700 opacity-50 cursor-not-allowed'
                      } ${isBoss ? 'ring-2 ring-yellow-500/50' : ''}`}
                    >
                      <div className={`text-2xl font-black ${isCompleted ? 'text-green-400' : isUnlocked ? 'text-white' : 'text-gray-500'}`}>
                        {lvl.level}
                      </div>
                      <div className="text-[10px] text-gray-400 truncate">{lvl.name}</div>
                      <div className="text-[9px] text-yellow-400">🪙{lvl.reward}</div>
                      {isCompleted && <div className="absolute -top-1 -right-1 text-green-400">✓</div>}
                      {isBoss && !isCompleted && <div className="absolute -top-1 -left-1 text-yellow-400 text-xs">👑</div>}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="mt-3 text-center text-sm text-gray-400">
              Hoàn thành: <span className="text-green-400 font-bold">{completedLevels.length}</span>/30 • 
              Mở khóa: <span className="text-purple-400 font-bold">{unlockedLevels.length}</span>/30
            </div>
          </div>
        )}

        {/* Victory */}
        {gameState === 'victory' && (
          <div className="absolute inset-0 bg-black/90 rounded-2xl flex items-center justify-center p-4">
            <div className="bg-gradient-to-b from-yellow-900/50 to-gray-800 rounded-2xl p-6 max-w-md w-full border-2 border-yellow-500 text-center">
              <div className="text-6xl mb-2 animate-bounce">🏆</div>
              <h2 className="text-3xl font-black text-yellow-400 mb-1">Chiến thắng!</h2>
              <p className="text-gray-300 mb-2">Level {currentLevel}: {GAME_LEVELS[currentLevel-1]?.name}</p>
              
              {/* Auto advance indicator */}
              {currentLevel < 30 && (
                <div className="bg-green-500/20 rounded-lg px-4 py-2 mb-4 border border-green-500/30">
                  <p className="text-green-400 text-sm font-medium animate-pulse">
                    ⏳ Tự động chuyển Level {currentLevel + 1} trong 2.5s...
                  </p>
                </div>
              )}
              {currentLevel >= 30 && (
                <div className="bg-purple-500/20 rounded-lg px-4 py-2 mb-4 border border-purple-500/30">
                  <p className="text-purple-400 text-lg font-bold">
                    🎉 Hoàn thành tất cả 30 màn!
                  </p>
                </div>
              )}
              
              <div className="bg-gray-800/50 rounded-xl p-3 mb-3">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div><span className="text-gray-400">Điểm:</span> <span className="text-white font-bold">{score}</span></div>
                  <div><span className="text-gray-400">Bug:</span> <span className="text-red-400 font-bold">{bugsKilled}</span></div>
                  <div><span className="text-gray-400">Đúng:</span> <span className="text-green-400 font-bold">{questionsCorrect}</span></div>
                  <div><span className="text-gray-400">Time:</span> <span className="text-cyan-400 font-bold">{playTime}s</span></div>
                </div>
              </div>
              
              <div className="bg-yellow-500/20 rounded-xl p-3 mb-4 border border-yellow-500/30">
                <p className="text-yellow-400 font-bold text-lg">
                  🪙 +{(GAME_LEVELS[currentLevel-1]?.reward || 100) + bugsKilled * 5 + questionsCorrect * 10} xu
                </p>
              </div>
              
              <div className="flex gap-3">
                {currentLevel < 30 && (
                  <button onClick={() => startLevel(currentLevel + 1)} 
                    className="flex-1 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-bold hover:scale-105 transition-transform">
                    Level {currentLevel + 1} →
                  </button>
                )}
                <button onClick={() => setGameState('levels')} 
                  className="flex-1 py-3 bg-gray-700 text-white rounded-xl font-bold hover:bg-gray-600">
                  Chọn màn
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Paused */}
        {gameState === 'paused' && (
          <div className="absolute inset-0 bg-black/80 rounded-2xl flex flex-col items-center justify-center gap-4">
            <div className="text-6xl">⏸️</div>
            <h2 className="text-3xl font-black text-white">Tạm dừng</h2>
            <div className="flex gap-4">
              <button onClick={() => setGameState('playing')} className="px-8 py-3 bg-green-500 text-white rounded-xl font-bold hover:scale-105 transition-transform">
                Tiếp tục
              </button>
              <button onClick={() => setGameState('menu')} className="px-8 py-3 bg-gray-700 text-white rounded-xl font-bold hover:scale-105 transition-transform">
                Menu
              </button>
            </div>
          </div>
        )}

        {/* Question */}
        {gameState === 'question' && currentQuestion && (
          <div className="absolute inset-0 bg-black/90 rounded-2xl flex items-center justify-center p-6">
            <div className="bg-gray-800 rounded-2xl p-6 max-w-lg w-full border border-gray-700">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">🐍</span>
                  <div>
                    <h3 className="text-lg font-bold text-white">Câu hỏi Python</h3>
                    <div className="flex gap-2 text-xs">
                      <span className="px-2 py-0.5 bg-purple-500/20 text-purple-400 rounded">{currentQuestion.category}</span>
                      <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 rounded">Lv.{currentQuestion.difficulty}</span>
                    </div>
                  </div>
                </div>
                <div className={`text-2xl font-black ${timeLeft <= 5 ? 'text-red-500 animate-pulse' : 'text-white'}`}>
                  {timeLeft}s
                </div>
              </div>
              
              {/* Timer bar */}
              <div className="h-2 bg-gray-700 rounded-full mb-4 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-green-500 to-yellow-500 transition-all duration-1000"
                  style={{width: `${(timeLeft / (30 - (currentQuestion.difficulty * 5))) * 100}%`}} />
              </div>
              
              {/* Question */}
              <div className="bg-gray-900 rounded-xl p-4 mb-4 border border-gray-700">
                <code className="text-lg text-yellow-400 font-mono">{currentQuestion.question}</code>
              </div>
              
              {/* Streak & Combo */}
              {streak > 0 && (
                <div className="flex gap-2 mb-4">
                  <span className="px-3 py-1 bg-orange-500/20 text-orange-400 rounded-full text-sm font-bold">
                    🔥 {streak} streak
                  </span>
                  {combo > 0 && (
                    <span className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full text-sm font-bold">
                      ⚡ {combo}x combo
                    </span>
                  )}
                </div>
              )}
              
              {answerResult ? (
                <div className={`flex items-center justify-center gap-3 py-4 rounded-xl ${
                  answerResult === 'correct' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                }`}>
                  {answerResult === 'correct' ? (
                    <><Check className="w-8 h-8" /><span className="text-xl font-bold">Chính xác! +{currentQuestion.difficulty * 100}</span></>
                  ) : (
                    <><X className="w-8 h-8" /><span className="text-xl font-bold">Sai! Đáp án: {currentQuestion.answer}</span></>
                  )}
                </div>
              ) : (
                <>
                  <input type="text" value={userAnswer} onChange={e => setUserAnswer(e.target.value)} 
                    onKeyDown={e => e.key === 'Enter' && submitAnswer()}
                    placeholder="Nhập câu trả lời..." autoFocus
                    className="w-full bg-gray-700 border-2 border-gray-600 rounded-xl px-4 py-3 text-white text-lg mb-4 focus:border-purple-500 focus:outline-none" />
                  {showHint && (
                    <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-3 mb-4 text-yellow-400 text-sm">
                      💡 Gợi ý: {currentQuestion.hint}
                    </div>
                  )}
                  <div className="flex gap-3">
                    <button onClick={submitAnswer} disabled={!userAnswer.trim()} 
                      className="flex-1 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-bold disabled:opacity-50 hover:opacity-90 transition-all">
                      Trả lời
                    </button>
                    <button onClick={() => setShowHint(true)} disabled={showHint} 
                      className="px-6 py-3 bg-yellow-500/20 text-yellow-400 rounded-xl font-bold disabled:opacity-50 hover:bg-yellow-500/30 transition-all">
                      Gợi ý
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Game Over */}
        {gameState === 'gameover' && (
          <div className="absolute inset-0 bg-black/90 rounded-2xl flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-gray-800 rounded-2xl p-6 max-w-md w-full border border-gray-700">
              <div className="text-center mb-4">
                <div className="text-5xl mb-2">💀</div>
                <h2 className="text-3xl font-black text-white">Game Over!</h2>
                <p className="text-gray-400">Level {currentLevel}: {GAME_LEVELS[currentLevel-1]?.name}</p>
              </div>
              
              {/* Main stats */}
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="bg-yellow-500/10 rounded-xl p-3 text-center border border-yellow-500/30">
                  <Trophy className="w-6 h-6 text-yellow-400 mx-auto mb-1" />
                  <p className="text-xl font-black text-white">{score.toLocaleString()}</p>
                  <p className="text-gray-400 text-xs">Điểm</p>
                </div>
                <div className="bg-red-500/10 rounded-xl p-3 text-center border border-red-500/30">
                  <Bug className="w-6 h-6 text-red-400 mx-auto mb-1" />
                  <p className="text-xl font-black text-white">{bugsKilled}</p>
                  <p className="text-gray-400 text-xs">Bug diệt</p>
                </div>
                <div className="bg-purple-500/10 rounded-xl p-3 text-center border border-purple-500/30">
                  <Star className="w-6 h-6 text-purple-400 mx-auto mb-1" />
                  <p className="text-xl font-black text-white">{totalXP}</p>
                  <p className="text-gray-400 text-xs">XP</p>
                </div>
              </div>
              
              {/* Detailed stats */}
              <div className="bg-gray-700/50 rounded-xl p-3 mb-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Câu đúng</span>
                  <span className="text-green-400 font-bold">{questionsCorrect}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Câu sai</span>
                  <span className="text-red-400 font-bold">{questionsWrong}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Độ chính xác</span>
                  <span className="text-blue-400 font-bold">{accuracy}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Max Combo</span>
                  <span className="text-orange-400 font-bold">{maxCombo}x</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Tốc độ max</span>
                  <span className="text-cyan-400 font-bold">{speed}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Thời gian</span>
                  <span className="text-white font-bold">{Math.floor(playTime/60)}:{(playTime%60).toString().padStart(2,'0')}</span>
                </div>
              </div>
              
              {/* Rewards */}
              <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-xl p-3 mb-4 border border-yellow-500/30 text-center">
                <p className="text-yellow-400 font-bold">
                  🪙 +{bugsKilled * 5 + questionsCorrect * 10 + Math.floor(totalXP / 10)} xu
                </p>
              </div>
              
              <div className="flex gap-3">
                <button onClick={startGame} className="flex-1 flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-bold hover:scale-105 transition-transform">
                  <RotateCcw className="w-5 h-5" /> Chơi lại
                </button>
                <button onClick={() => setGameState('menu')} className="flex-1 py-3 bg-gray-700 text-white rounded-xl font-bold hover:bg-gray-600 transition-colors">
                  Menu
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Leaderboard */}
        {gameState === 'leaderboard' && (
          <div className="absolute inset-0 bg-black/90 rounded-2xl flex items-center justify-center p-4">
            <div className="bg-gray-800 rounded-2xl p-5 max-w-lg w-full border border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Award className="w-7 h-7 text-yellow-400" />
                  <h2 className="text-2xl font-black text-white">Bảng xếp hạng</h2>
                </div>
                <button onClick={() => setGameState('menu')} className="p-2 hover:bg-gray-700 rounded-lg text-gray-400">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              {myBestScore && (
                <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl p-3 mb-4 border border-purple-500/30">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-gray-400 text-xs">Thành tích của bạn</p>
                      <span className="text-white font-bold">{profile?.username}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-yellow-400 font-bold text-lg">🏆 {myBestScore.best_score.toLocaleString()}</p>
                      <p className="text-gray-400 text-xs">{myBestScore.total_games_played} games</p>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {leaderboard.map((e, i) => (
                  <div key={e.user_id} className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                    i === 0 ? 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30' : 
                    i === 1 ? 'bg-gray-400/10 border border-gray-400/30' : 
                    i === 2 ? 'bg-orange-500/10 border border-orange-500/30' : 'bg-gray-700/30'
                  }`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                      i === 0 ? 'bg-yellow-500 text-black' : 
                      i === 1 ? 'bg-gray-400 text-black' : 
                      i === 2 ? 'bg-orange-500 text-black' : 'bg-gray-600 text-white'
                    }`}>
                      {i === 0 ? '👑' : i + 1}
                    </div>
                    <div className="w-8 h-8 rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600">
                      {e.profiles?.avatar_url ? (
                        <img src={e.profiles.avatar_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-white text-xs font-bold">
                          {e.profiles?.username?.[0]?.toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <span className="text-white font-medium">{e.profiles?.username}</span>
                      <p className="text-gray-500 text-xs">{e.total_bugs_killed} bugs • {e.total_games_played} games</p>
                    </div>
                    <span className="text-yellow-400 font-bold">{e.best_score.toLocaleString()}</span>
                  </div>
                ))}
                {leaderboard.length === 0 && (
                  <p className="text-center text-gray-500 py-8">Chưa có ai chơi game này</p>
                )}
              </div>
              
              <button onClick={startGame} className="w-full mt-4 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-bold hover:scale-105 transition-transform">
                <Play className="w-5 h-5 inline mr-2" /> Chơi ngay
              </button>
            </div>
          </div>
        )}
      </div>
      
      {/* Instructions */}
      {gameState === 'playing' && (
        <p className="text-gray-500 text-xs">
          ⬆️⬇️⬅️➡️/WASD di chuyển • Chạm bug để trả lời • Thu thập power-ups • ESC tạm dừng
        </p>
      )}
    </div>
  );
};
