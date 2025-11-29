import { useState, useEffect, useCallback } from 'react';
import { Swords, Heart, Shield, Zap, Star, Trophy, ChevronRight, RotateCcw, Volume2, VolumeX, Sparkles, Lock, Crown } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

type Level = {
  id: string;
  level_number: number;
  title: string;
  description: string;
  story: string;
  enemy_name: string;
  enemy_hp: number;
  enemy_image: string;
  background_theme: string;
  coins_reward: number;
  xp_reward: number;
  required_level: number;
};

type Question = {
  id: string;
  question: string;
  code_snippet: string | null;
  options: string[];
  correct_answer: number;
  explanation: string;
  damage: number;
};

type Progress = {
  level_id: string;
  completed: boolean;
  stars: number;
  best_score: number;
};

type GameState = 'menu' | 'story' | 'battle' | 'victory' | 'defeat' | 'level_select';


const BACKGROUNDS: Record<string, { gradient: string; particles: string[]; ground: string }> = {
  forest: { 
    gradient: 'from-green-950 via-emerald-900 to-green-950', 
    particles: ['🍃', '🌿', '🍂', '✨'],
    ground: 'from-green-800 to-green-900'
  },
  cave: { 
    gradient: 'from-slate-950 via-gray-900 to-zinc-950', 
    particles: ['💎', '🔮', '✨', '💫'],
    ground: 'from-gray-700 to-gray-800'
  },
  mountain: { 
    gradient: 'from-indigo-950 via-blue-900 to-purple-950', 
    particles: ['❄️', '🌨️', '✨', '⭐'],
    ground: 'from-slate-600 to-slate-700'
  },
  temple: { 
    gradient: 'from-amber-950 via-orange-900 to-red-950', 
    particles: ['🔥', '✨', '💫', '⚡'],
    ground: 'from-amber-800 to-amber-900'
  },
  castle: { 
    gradient: 'from-purple-950 via-violet-900 to-fuchsia-950', 
    particles: ['👻', '💀', '✨', '🔮'],
    ground: 'from-purple-800 to-purple-900'
  },
};

const ATTACK_EFFECTS = ['💥', '⚔️', '🗡️', '✨', '💫'];
const DAMAGE_COLORS = ['text-red-400', 'text-orange-400', 'text-yellow-400'];
const PARTICLES = ['✨', '⚡', '💫', '🌟', '⭐'];

// Pixel Art Style Characters (CSS-based)
const PixelNinja = ({ attacking, className = '' }: { attacking?: boolean; className?: string }) => (
  <div className={`relative ${className} ${attacking ? 'animate-pulse' : ''}`}>
    <div className="relative w-20 h-24">
      {/* Body */}
      <div className="absolute inset-0 flex flex-col items-center">
        {/* Head */}
        <div className="w-12 h-10 bg-gray-800 rounded-t-lg relative">
          <div className="absolute top-2 left-2 w-2 h-2 bg-white rounded-full" />
          <div className="absolute top-2 right-2 w-2 h-2 bg-white rounded-full" />
          <div className="absolute top-1 left-1/2 -translate-x-1/2 w-8 h-2 bg-red-600 rounded" />
        </div>
        {/* Torso */}
        <div className="w-14 h-8 bg-gray-900 rounded relative">
          <div className="absolute top-1 left-1/2 -translate-x-1/2 w-6 h-1 bg-red-700" />
        </div>
        {/* Legs */}
        <div className="flex gap-1">
          <div className="w-5 h-6 bg-gray-800 rounded-b" />
          <div className="w-5 h-6 bg-gray-800 rounded-b" />
        </div>
      </div>
      {/* Sword */}
      {attacking && (
        <div className="absolute -right-8 top-4 w-12 h-2 bg-gradient-to-r from-gray-400 to-white rounded animate-spin" 
          style={{ transformOrigin: 'left center', animationDuration: '0.3s' }} />
      )}
    </div>
    {/* Shadow */}
    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-16 h-3 bg-black/40 rounded-full blur-sm" />
  </div>
);

const PixelEnemy = ({ type, hit, className = '' }: { type: string; hit?: boolean; className?: string }) => {
  const getEnemyStyle = () => {
    switch(type) {
      case '👺': return { body: 'bg-green-600', accent: 'bg-green-800' };
      case '👹': return { body: 'bg-red-700', accent: 'bg-red-900' };
      case '🐉': return { body: 'bg-purple-600', accent: 'bg-purple-800' };
      case '🥷': return { body: 'bg-gray-900', accent: 'bg-gray-700' };
      case '😈': return { body: 'bg-red-900', accent: 'bg-black' };
      default: return { body: 'bg-gray-600', accent: 'bg-gray-800' };
    }
  };
  const style = getEnemyStyle();
  
  return (
    <div className={`relative ${className} ${hit ? 'animate-pulse opacity-50' : ''}`}>
      <div className="relative w-24 h-28">
        {/* Monster Body */}
        <div className={`absolute inset-0 ${style.body} rounded-2xl shadow-lg`}>
          {/* Eyes */}
          <div className="absolute top-4 left-3 w-4 h-4 bg-yellow-400 rounded-full animate-pulse">
            <div className="absolute top-1 left-1 w-2 h-2 bg-red-600 rounded-full" />
          </div>
          <div className="absolute top-4 right-3 w-4 h-4 bg-yellow-400 rounded-full animate-pulse">
            <div className="absolute top-1 left-1 w-2 h-2 bg-red-600 rounded-full" />
          </div>
          {/* Mouth */}
          <div className={`absolute bottom-6 left-1/2 -translate-x-1/2 w-10 h-4 ${style.accent} rounded-lg`}>
            <div className="flex justify-around pt-1">
              <div className="w-1 h-2 bg-white" />
              <div className="w-1 h-2 bg-white" />
              <div className="w-1 h-2 bg-white" />
            </div>
          </div>
          {/* Horns */}
          <div className={`absolute -top-3 left-2 w-3 h-6 ${style.accent} rounded-t-full transform -rotate-12`} />
          <div className={`absolute -top-3 right-2 w-3 h-6 ${style.accent} rounded-t-full transform rotate-12`} />
        </div>
      </div>
      {/* Shadow */}
      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-20 h-4 bg-black/40 rounded-full blur-sm" />
      {/* Hit Effect */}
      {hit && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-4xl animate-ping">💥</span>
        </div>
      )}
    </div>
  );
};

export const JavaNinjaGame = () => {
  const { user, profile, refreshProfile } = useAuth();
  const [gameState, setGameState] = useState<GameState>('menu');
  const [levels, setLevels] = useState<Level[]>([]);
  const [currentLevel, setCurrentLevel] = useState<Level | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [progress, setProgress] = useState<Progress[]>([]);
  
  // Battle state
  const [playerHp, setPlayerHp] = useState(100);
  const [enemyHp, setEnemyHp] = useState(100);
  const [maxEnemyHp, setMaxEnemyHp] = useState(100);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [combo, setCombo] = useState(0);
  const [score, setScore] = useState(0);
  const [particles, setParticles] = useState<{id: number; x: number; y: number; char: string}[]>([]);
  
  // Effects
  const [shake, setShake] = useState(false);
  const [flash, setFlash] = useState('');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [ninjaAttack, setNinjaAttack] = useState(false);
  const [enemyHit, setEnemyHit] = useState(false);

  useEffect(() => {
    fetchLevels();
    if (user) fetchProgress();
  }, [user]);

  const fetchLevels = async () => {
    const { data } = await supabase.from('java_ninja_levels').select('*').order('level_number');
    if (data) setLevels(data);
  };

  const fetchProgress = async () => {
    if (!user) return;
    const { data } = await supabase.from('java_ninja_progress').select('*').eq('user_id', user.id);
    if (data) setProgress(data);
  };


  const fetchQuestions = async (levelId: string) => {
    const { data } = await supabase.from('java_ninja_questions').select('*').eq('level_id', levelId);
    if (data) {
      const shuffled = data.sort(() => Math.random() - 0.5).slice(0, 4);
      setQuestions(shuffled);
    }
  };

  const isLevelUnlocked = (level: Level) => {
    if (!profile) return false;
    return (profile.level || 1) >= level.required_level;
  };

  const getLevelProgress = (levelId: string) => progress.find(p => p.level_id === levelId);

  const spawnParticles = useCallback((x: number, y: number, count: number = 5) => {
    const newParticles = Array.from({ length: count }, (_, i) => ({
      id: Date.now() + i,
      x: x + (Math.random() - 0.5) * 100,
      y: y + (Math.random() - 0.5) * 100,
      char: PARTICLES[Math.floor(Math.random() * PARTICLES.length)]
    }));
    setParticles(prev => [...prev, ...newParticles]);
    setTimeout(() => setParticles(prev => prev.filter(p => !newParticles.find(np => np.id === p.id))), 1000);
  }, []);

  const startLevel = async (level: Level) => {
    setCurrentLevel(level);
    setPlayerHp(100);
    setEnemyHp(level.enemy_hp);
    setMaxEnemyHp(level.enemy_hp);
    setCurrentQuestionIndex(0);
    setCombo(0);
    setScore(0);
    setSelectedAnswer(null);
    setShowResult(false);
    await fetchQuestions(level.id);
    setGameState('story');
  };

  const handleAnswer = (answerIndex: number) => {
    if (showResult || selectedAnswer !== null) return;
    
    setSelectedAnswer(answerIndex);
    const question = questions[currentQuestionIndex];
    const correct = answerIndex === question.correct_answer;
    setIsCorrect(correct);
    setShowResult(true);

    if (correct) {
      // Attack animation
      setNinjaAttack(true);
      setTimeout(() => {
        setNinjaAttack(false);
        setEnemyHit(true);
        setTimeout(() => setEnemyHit(false), 300);
      }, 300);
      
      const damage = question.damage + (combo * 5);
      setEnemyHp(prev => Math.max(0, prev - damage));
      setCombo(prev => prev + 1);
      setScore(prev => prev + (100 * (combo + 1)));
      setFlash('green');
      spawnParticles(window.innerWidth * 0.7, window.innerHeight * 0.4, 8);
    } else {
      setShake(true);
      setPlayerHp(prev => Math.max(0, prev - 20));
      setCombo(0);
      setFlash('red');
      setTimeout(() => setShake(false), 500);
    }
    setTimeout(() => setFlash(''), 300);
  };


  const nextQuestion = () => {
    if (enemyHp <= 0) {
      handleVictory();
      return;
    }
    if (playerHp <= 0) {
      setGameState('defeat');
      return;
    }
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    } else {
      // Ran out of questions but enemy still alive
      if (enemyHp > 0) {
        setGameState('defeat');
      } else {
        handleVictory();
      }
    }
  };

  const handleVictory = async () => {
    if (!user || !currentLevel) return;
    
    const stars = playerHp >= 80 ? 3 : playerHp >= 50 ? 2 : 1;
    const existingProgress = getLevelProgress(currentLevel.id);
    
    // Update or insert progress
    if (existingProgress) {
      await supabase.from('java_ninja_progress').update({
        completed: true,
        stars: Math.max(existingProgress.stars, stars),
        best_score: Math.max(existingProgress.best_score, score),
        attempts: (existingProgress as any).attempts + 1,
        completed_at: new Date().toISOString()
      }).eq('user_id', user.id).eq('level_id', currentLevel.id);
    } else {
      await supabase.from('java_ninja_progress').insert({
        user_id: user.id,
        level_id: currentLevel.id,
        completed: true,
        stars,
        best_score: score,
        attempts: 1,
        completed_at: new Date().toISOString()
      });
      
      // Give rewards only first time
      await supabase.from('profiles').update({
        coins: ((profile as any)?.coins || 0) + currentLevel.coins_reward,
        xp: ((profile as any)?.xp || 0) + currentLevel.xp_reward
      }).eq('id', user.id);
      
      refreshProfile();
    }
    
    fetchProgress();
    setGameState('victory');
  };

  // Render Menu with enhanced graphics
  const renderMenu = () => (
    <div className="relative min-h-[650px] flex flex-col items-center justify-center overflow-hidden">
      {/* Animated Parallax Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-indigo-950 via-purple-900 to-slate-950">
        {/* Stars Layer */}
        <div className="absolute inset-0">
          {[...Array(100)].map((_, i) => (
            <div key={i} className="absolute rounded-full bg-white animate-twinkle"
              style={{ 
                left: `${Math.random()*100}%`, 
                top: `${Math.random()*60}%`, 
                width: `${1 + Math.random()*2}px`,
                height: `${1 + Math.random()*2}px`,
                animationDelay: `${Math.random()*3}s`,
                animationDuration: `${2 + Math.random()*2}s`
              }} />
          ))}
        </div>
        {/* Moon */}
        <div className="absolute top-10 right-20 w-20 h-20 bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-full shadow-2xl shadow-yellow-200/30">
          <div className="absolute top-3 left-4 w-4 h-4 bg-yellow-300/50 rounded-full" />
          <div className="absolute bottom-4 right-3 w-3 h-3 bg-yellow-300/50 rounded-full" />
        </div>
        {/* Mountains */}
        <div className="absolute bottom-0 left-0 right-0 h-48">
          <svg viewBox="0 0 1200 200" className="w-full h-full" preserveAspectRatio="none">
            <polygon points="0,200 200,80 400,150 600,50 800,120 1000,60 1200,200" fill="rgba(30,20,50,0.8)" />
            <polygon points="0,200 150,120 350,180 500,100 700,160 900,90 1100,140 1200,200" fill="rgba(20,15,40,0.9)" />
          </svg>
        </div>
        {/* Ground */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-slate-950 to-transparent" />
      </div>
      
      {/* Floating Particles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <div key={i} className="absolute text-2xl animate-float opacity-60"
            style={{ 
              left: `${Math.random()*100}%`, 
              top: `${20 + Math.random()*60}%`,
              animationDelay: `${Math.random()*5}s`,
              animationDuration: `${4 + Math.random()*4}s`
            }}>
            {['✨', '🌟', '💫', '⭐'][Math.floor(Math.random()*4)]}
          </div>
        ))}
      </div>
      
      {/* Main Content */}
      <div className="relative z-10 text-center">
        {/* Animated Character */}
        <div className="mb-8 relative inline-block">
          <div className="relative">
            <PixelNinja className="mx-auto transform scale-150" />
            {/* Glow Effect */}
            <div className="absolute inset-0 bg-purple-500/20 blur-3xl rounded-full" />
          </div>
          {/* Floating Swords */}
          <div className="absolute -left-12 top-0 text-4xl animate-float" style={{animationDelay: '0.5s'}}>⚔️</div>
          <div className="absolute -right-12 top-0 text-4xl animate-float" style={{animationDelay: '1s'}}>🗡️</div>
        </div>
        
        {/* Title with Glow */}
        <div className="relative">
          <h1 className="text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-red-500 to-pink-500 mb-2 animate-pulse" 
            style={{textShadow: '0 0 60px rgba(255,100,100,0.5)'}}>
            JAVA NINJA
          </h1>
          <p className="text-3xl text-purple-300 mb-2 font-bold tracking-widest">アドベンチャー</p>
          <p className="text-gray-400 mb-8 text-lg">Chinh phục Java qua những trận chiến huyền thoại!</p>
        </div>
        
        {/* Buttons */}
        <div className="flex flex-col gap-4 items-center">
          <button onClick={() => setGameState('level_select')}
            className="group relative px-14 py-6 bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 hover:from-yellow-400 hover:via-orange-400 hover:to-red-400 text-white rounded-2xl font-black text-2xl transition-all hover:scale-110 shadow-2xl shadow-orange-500/50 flex items-center gap-3 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
            <Swords className="w-8 h-8 group-hover:rotate-12 transition-transform" />
            BẮT ĐẦU
            <ChevronRight className="w-8 h-8 group-hover:translate-x-2 transition-transform" />
          </button>
          
          <button onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-4 bg-white/10 hover:bg-white/20 rounded-xl transition-all border border-white/10">
            {soundEnabled ? <Volume2 className="w-6 h-6 text-white" /> : <VolumeX className="w-6 h-6 text-gray-400" />}
          </button>
        </div>
        
        {/* Stats */}
        <div className="mt-12 flex gap-10 justify-center">
          {[
            { icon: '🗡️', label: '5 Màn', color: 'from-red-500 to-orange-500' },
            { icon: '☕', label: 'Java', color: 'from-orange-500 to-yellow-500' },
            { icon: '🏆', label: 'Phần thưởng', color: 'from-yellow-500 to-green-500' },
          ].map((item, i) => (
            <div key={i} className="text-center group cursor-default">
              <div className={`w-16 h-16 mx-auto mb-2 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center text-3xl shadow-lg group-hover:scale-110 transition-transform`}>
                {item.icon}
              </div>
              <div className="text-gray-300 font-medium">{item.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );


  // Render Level Select
  const renderLevelSelect = () => (
    <div className="relative min-h-[600px] p-6">
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900" />
      
      <div className="relative z-10">
        <button onClick={() => setGameState('menu')} className="mb-6 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-white flex items-center gap-2">
          ← Quay lại
        </button>
        
        <h2 className="text-4xl font-black text-white mb-2 flex items-center gap-3">
          <Crown className="w-10 h-10 text-yellow-400" />
          Chọn Màn Chơi
        </h2>
        <p className="text-gray-400 mb-8">Chinh phục từng vùng đất để trở thành Java Master!</p>
        
        {/* Level Path */}
        <div className="relative">
          {/* Connection Line */}
          <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-green-500 via-yellow-500 to-red-500 opacity-30 -translate-x-1/2" />
          
          <div className="space-y-6">
            {levels.map((level, index) => {
              const unlocked = isLevelUnlocked(level);
              const levelProgress = getLevelProgress(level.id);
              const completed = levelProgress?.completed;
              
              return (
                <div key={level.id} className={`relative flex items-center gap-6 ${index % 2 === 0 ? '' : 'flex-row-reverse'}`}>
                  {/* Level Node */}
                  <div className={`relative flex-shrink-0 w-24 h-24 rounded-2xl flex items-center justify-center text-5xl transition-all cursor-pointer
                    ${unlocked ? 'hover:scale-110' : 'opacity-50 cursor-not-allowed'}
                    ${completed ? 'bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg shadow-green-500/50' : 
                      unlocked ? 'bg-gradient-to-br from-purple-500 to-pink-600 shadow-lg shadow-purple-500/50' : 
                      'bg-gray-800'}`}
                    onClick={() => unlocked && startLevel(level)}>
                    {!unlocked ? <Lock className="w-10 h-10 text-gray-500" /> : level.enemy_image}
                    {completed && (
                      <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">
                        <Trophy className="w-5 h-5 text-yellow-900" />
                      </div>
                    )}
                  </div>
                  
                  {/* Level Info Card */}
                  <div className={`flex-1 p-5 rounded-2xl border transition-all
                    ${unlocked ? 'bg-gray-800/80 border-purple-500/30 hover:border-purple-400' : 'bg-gray-900/50 border-gray-700'}`}
                    onClick={() => unlocked && startLevel(level)}>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-1 bg-purple-500/20 text-purple-400 text-xs font-bold rounded">Màn {level.level_number}</span>
                      {completed && <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs font-bold rounded">✓ Hoàn thành</span>}
                    </div>
                    <h3 className={`text-xl font-bold mb-1 ${unlocked ? 'text-white' : 'text-gray-500'}`}>{level.title}</h3>
                    <p className={`text-sm mb-3 ${unlocked ? 'text-gray-400' : 'text-gray-600'}`}>{level.description}</p>
                    
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1 text-red-400">
                        <Heart className="w-4 h-4" /> {level.enemy_hp} HP
                      </div>
                      <div className="flex items-center gap-1 text-yellow-400">
                        💰 {level.coins_reward}
                      </div>
                      <div className="flex items-center gap-1 text-purple-400">
                        ⭐ {level.xp_reward} XP
                      </div>
                    </div>
                    
                    {levelProgress && (
                      <div className="mt-3 flex items-center gap-1">
                        {[1,2,3].map(s => (
                          <Star key={s} className={`w-5 h-5 ${s <= levelProgress.stars ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'}`} />
                        ))}
                        <span className="ml-2 text-xs text-gray-500">Best: {levelProgress.best_score}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );


  // Render Story
  const renderStory = () => (
    <div className={`relative min-h-[600px] flex items-center justify-center bg-gradient-to-br ${BACKGROUNDS[currentLevel?.background_theme || 'forest']}`}>
      <div className="absolute inset-0 bg-black/40" />
      
      <div className="relative z-10 max-w-2xl mx-auto p-8 text-center">
        <div className="text-8xl mb-6 animate-bounce">{currentLevel?.enemy_image}</div>
        <h2 className="text-4xl font-black text-white mb-4">{currentLevel?.title}</h2>
        <div className="bg-black/50 backdrop-blur rounded-2xl p-6 mb-8 border border-white/10">
          <p className="text-lg text-gray-200 leading-relaxed italic">"{currentLevel?.story}"</p>
        </div>
        
        <div className="flex items-center justify-center gap-4 mb-8">
          <div className="px-4 py-2 bg-red-500/20 rounded-xl border border-red-500/30">
            <span className="text-red-400 font-bold">{currentLevel?.enemy_name}</span>
          </div>
          <div className="text-2xl">⚔️</div>
          <div className="px-4 py-2 bg-blue-500/20 rounded-xl border border-blue-500/30">
            <span className="text-blue-400 font-bold">Ninja {profile?.username || 'Player'}</span>
          </div>
        </div>
        
        <button onClick={() => setGameState('battle')}
          className="px-10 py-4 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-400 hover:to-orange-400 text-white rounded-2xl font-black text-xl transition-all hover:scale-110 shadow-2xl shadow-red-500/50 flex items-center gap-3 mx-auto">
          <Swords className="w-6 h-6" />
          CHIẾN ĐẤU!
        </button>
      </div>
    </div>
  );

  // Render Battle with enhanced graphics
  const renderBattle = () => {
    const question = questions[currentQuestionIndex];
    if (!question || !currentLevel) return null;
    
    const bg = BACKGROUNDS[currentLevel.background_theme] || BACKGROUNDS.forest;
    const enemyHpPercent = (enemyHp / maxEnemyHp) * 100;
    const playerHpPercent = playerHp;
    
    return (
      <div className={`relative min-h-[650px] overflow-hidden ${shake ? 'animate-shake' : ''}`}>
        {/* Dynamic Background */}
        <div className={`absolute inset-0 bg-gradient-to-b ${bg.gradient}`}>
          {/* Animated Background Particles */}
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(20)].map((_, i) => (
              <div key={i} className="absolute text-xl animate-float opacity-40"
                style={{ 
                  left: `${Math.random()*100}%`, 
                  top: `${Math.random()*50}%`,
                  animationDelay: `${Math.random()*5}s`,
                  animationDuration: `${5 + Math.random()*5}s`
                }}>
                {bg.particles[Math.floor(Math.random()*bg.particles.length)]}
              </div>
            ))}
          </div>
          
          {/* Ground with texture */}
          <div className={`absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t ${bg.ground}`}>
            <div className="absolute inset-0 opacity-30" style={{
              backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 20px, rgba(0,0,0,0.1) 20px, rgba(0,0,0,0.1) 40px)'
            }} />
          </div>
        </div>
        
        {/* Flash Effect */}
        {flash && (
          <div className={`absolute inset-0 pointer-events-none z-20 transition-opacity duration-200 ${
            flash === 'green' ? 'bg-green-500/30' : 'bg-red-500/30'
          }`} />
        )}
        
        {/* Attack Particles */}
        {particles.map(p => (
          <div key={p.id} className="absolute text-3xl animate-ping pointer-events-none z-30" style={{left: p.x, top: p.y}}>
            {p.char}
          </div>
        ))}
        
        {/* Battle Arena */}
        <div className="relative h-48 sm:h-56 md:h-64 flex items-end justify-between px-4 sm:px-8 md:px-12 pb-4 sm:pb-6">
          {/* Player Side */}
          <div className={`relative transition-all duration-300 ${ninjaAttack ? 'translate-x-8 sm:translate-x-16 md:translate-x-24 scale-105 sm:scale-110' : ''}`}>
            <PixelNinja attacking={ninjaAttack} className="transform scale-75 sm:scale-100 md:scale-110" />
            {/* Player Aura */}
            <div className="absolute inset-0 bg-blue-500/20 blur-xl sm:blur-2xl rounded-full -z-10" />
            {/* Attack Trail */}
            {ninjaAttack && (
              <div className="absolute top-1/2 left-full w-16 sm:w-24 md:w-32 h-1 sm:h-2 bg-gradient-to-r from-cyan-400 to-transparent rounded-full animate-pulse" />
            )}
          </div>
          
          {/* Center Effects */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            {ninjaAttack && (
              <div className="text-3xl sm:text-4xl md:text-5xl animate-ping">
                {ATTACK_EFFECTS[Math.floor(Math.random()*ATTACK_EFFECTS.length)]}
              </div>
            )}
          </div>
          
          {/* Enemy Side */}
          <div className={`relative transition-all duration-300 ${enemyHit ? 'scale-90 -translate-x-2 sm:-translate-x-4' : ''}`}>
            <PixelEnemy type={currentLevel.enemy_image} hit={enemyHit} className="transform scale-75 sm:scale-100 md:scale-110" />
            {/* Enemy Aura */}
            <div className="absolute inset-0 bg-red-500/20 blur-xl sm:blur-2xl rounded-full -z-10" />
            {/* Damage Number */}
            {enemyHit && (
              <div className={`absolute -top-6 sm:-top-8 left-1/2 -translate-x-1/2 text-2xl sm:text-3xl md:text-4xl font-black ${DAMAGE_COLORS[Math.floor(Math.random()*DAMAGE_COLORS.length)]} animate-bounce`}>
                -{questions[currentQuestionIndex]?.damage + combo * 5}
              </div>
            )}
          </div>
        </div>
        
        {/* Enhanced HP Bars */}
        <div className="relative px-3 sm:px-4 md:px-6 py-3 sm:py-4 bg-gradient-to-b from-black/80 to-black/60 backdrop-blur-md border-t border-white/10">
          <div className="flex flex-col sm:flex-row justify-between gap-3 sm:gap-6 md:gap-12 max-w-4xl mx-auto">
            {/* Player HP */}
            <div className="flex-1">
              <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-sm sm:text-lg shadow-lg flex-shrink-0">
                  🥷
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs sm:text-sm font-bold text-blue-400">Ninja</span>
                    <span className="text-[10px] sm:text-xs text-gray-400 font-mono">{playerHp}/100</span>
                  </div>
                  <div className="h-3 sm:h-4 md:h-5 bg-gray-800/80 rounded-full overflow-hidden border border-gray-700">
                    <div className="h-full bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-400 transition-all duration-500 rounded-full relative"
                      style={{width: `${playerHpPercent}%`}}>
                      <div className="absolute inset-0 bg-gradient-to-b from-white/30 to-transparent" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Enemy HP */}
            <div className="flex-1">
              <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2 flex-row-reverse">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center text-sm sm:text-lg shadow-lg flex-shrink-0">
                  {currentLevel.enemy_image}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] sm:text-xs text-gray-400 font-mono">{enemyHp}/{maxEnemyHp}</span>
                    <span className="text-xs sm:text-sm font-bold text-red-400 truncate">{currentLevel.enemy_name}</span>
                  </div>
                  <div className="h-3 sm:h-4 md:h-5 bg-gray-800/80 rounded-full overflow-hidden border border-gray-700">
                    <div className="h-full bg-gradient-to-r from-red-600 via-red-500 to-orange-400 transition-all duration-500 rounded-full relative"
                      style={{width: `${enemyHpPercent}%`}}>
                      <div className="absolute inset-0 bg-gradient-to-b from-white/30 to-transparent" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Battle Stats */}
          <div className="flex justify-center gap-2 sm:gap-4 md:gap-6 mt-2 sm:mt-3 flex-wrap">
            <div className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-3 md:px-4 py-1 sm:py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm ${combo > 0 ? 'bg-yellow-500/20 border border-yellow-500/30' : 'bg-gray-800/50'}`}>
              <Zap className={`w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 ${combo > 0 ? 'text-yellow-400 animate-pulse' : 'text-gray-500'}`} />
              <span className={`font-bold ${combo > 0 ? 'text-yellow-400' : 'text-gray-500'}`}>x{combo}</span>
            </div>
            <div className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 md:px-4 py-1 sm:py-2 rounded-lg sm:rounded-xl bg-purple-500/20 border border-purple-500/30 text-xs sm:text-sm">
              <Star className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 text-purple-400" />
              <span className="font-bold text-purple-400">{score.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 md:px-4 py-1 sm:py-2 rounded-lg sm:rounded-xl bg-gray-800/50 text-xs sm:text-sm">
              <span className="text-gray-400">{currentQuestionIndex + 1}/{questions.length}</span>
            </div>
          </div>
        </div>

        
        {/* Question Panel */}
        <div className="p-3 sm:p-4 md:p-6 bg-gray-900/95 backdrop-blur">
          <div className="max-w-3xl mx-auto">
            <div className="mb-3 sm:mb-4">
              <h3 className="text-base sm:text-lg md:text-xl font-bold text-white mb-2 sm:mb-3">{question.question}</h3>
              {question.code_snippet && (
                <pre className="bg-gray-950 rounded-lg sm:rounded-xl p-2 sm:p-3 md:p-4 text-xs sm:text-sm text-green-400 font-mono overflow-x-auto border border-gray-700">
                  {question.code_snippet}
                </pre>
              )}
            </div>
            
            {/* Options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 mb-3 sm:mb-4">
              {question.options.map((option, index) => {
                let btnClass = 'bg-gray-800 border-gray-600 hover:border-purple-400 hover:bg-purple-500/10';
                if (showResult) {
                  if (index === question.correct_answer) {
                    btnClass = 'bg-green-500/20 border-green-500 text-green-400';
                  } else if (index === selectedAnswer && !isCorrect) {
                    btnClass = 'bg-red-500/20 border-red-500 text-red-400';
                  }
                } else if (selectedAnswer === index) {
                  btnClass = 'bg-purple-500/20 border-purple-500';
                }
                
                return (
                  <button key={index} onClick={() => handleAnswer(index)} disabled={showResult}
                    className={`p-2 sm:p-3 md:p-4 rounded-lg sm:rounded-xl border-2 text-left transition-all ${btnClass} ${!showResult && 'hover:scale-[1.02]'}`}>
                    <span className="inline-flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 rounded-md sm:rounded-lg bg-gray-700 text-white font-bold mr-2 sm:mr-3 text-xs sm:text-sm">
                      {String.fromCharCode(65 + index)}
                    </span>
                    <span className="text-white text-sm sm:text-base">{option}</span>
                  </button>
                );
              })}
            </div>
            
            {/* Result & Explanation */}
            {showResult && (
              <div className={`p-4 rounded-xl mb-4 ${isCorrect ? 'bg-green-500/20 border border-green-500/30' : 'bg-red-500/20 border border-red-500/30'}`}>
                <div className="flex items-center gap-2 mb-2">
                  {isCorrect ? (
                    <><Sparkles className="w-5 h-5 text-green-400" /><span className="font-bold text-green-400">Chính xác! +{question.damage + combo * 5} damage</span></>
                  ) : (
                    <><Shield className="w-5 h-5 text-red-400" /><span className="font-bold text-red-400">Sai rồi! -20 HP</span></>
                  )}
                </div>
                <p className="text-gray-300 text-sm">{question.explanation}</p>
              </div>
            )}
            
            {showResult && (
              <button onClick={nextQuestion}
                className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-white rounded-xl font-bold text-lg transition-all hover:scale-[1.02]">
                {enemyHp <= 0 ? '🎉 Chiến Thắng!' : playerHp <= 0 ? '💀 Thất Bại' : 'Câu Tiếp Theo →'}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };


  // Render Victory
  const renderVictory = () => {
    const stars = playerHp >= 80 ? 3 : playerHp >= 50 ? 2 : 1;
    
    return (
      <div className="relative min-h-[600px] flex items-center justify-center bg-gradient-to-br from-yellow-900 via-orange-900 to-red-900 overflow-hidden">
        {/* Confetti */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(30)].map((_, i) => (
            <div key={i} className="absolute text-2xl animate-bounce"
              style={{ left: `${Math.random()*100}%`, top: `${Math.random()*100}%`, animationDelay: `${Math.random()}s`, animationDuration: `${1 + Math.random()}s` }}>
              {['🎉', '🎊', '⭐', '✨', '🏆'][Math.floor(Math.random() * 5)]}
            </div>
          ))}
        </div>
        
        <div className="relative z-10 text-center p-8">
          <div className="text-9xl mb-6 animate-bounce">🏆</div>
          <h2 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500 mb-4">
            CHIẾN THẮNG!
          </h2>
          <p className="text-xl text-gray-300 mb-6">Bạn đã đánh bại {currentLevel?.enemy_name}!</p>
          
          {/* Stars */}
          <div className="flex justify-center gap-2 mb-6">
            {[1,2,3].map(s => (
              <Star key={s} className={`w-12 h-12 transition-all duration-500 ${s <= stars ? 'text-yellow-400 fill-yellow-400 scale-110' : 'text-gray-600'}`}
                style={{ animationDelay: `${s * 0.2}s` }} />
            ))}
          </div>
          
          {/* Rewards */}
          <div className="bg-black/50 backdrop-blur rounded-2xl p-6 mb-8 inline-block">
            <div className="text-4xl font-black text-white mb-2">{score}</div>
            <div className="text-gray-400 mb-4">Điểm số</div>
            <div className="flex gap-6 justify-center">
              <div className="text-center">
                <div className="text-2xl">💰</div>
                <div className="text-yellow-400 font-bold">+{currentLevel?.coins_reward}</div>
              </div>
              <div className="text-center">
                <div className="text-2xl">⭐</div>
                <div className="text-purple-400 font-bold">+{currentLevel?.xp_reward} XP</div>
              </div>
            </div>
          </div>
          
          <div className="flex gap-4 justify-center">
            <button onClick={() => currentLevel && startLevel(currentLevel)}
              className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold flex items-center gap-2">
              <RotateCcw className="w-5 h-5" /> Chơi lại
            </button>
            <button onClick={() => setGameState('level_select')}
              className="px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-white rounded-xl font-bold">
              Màn tiếp theo →
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Render Defeat
  const renderDefeat = () => (
    <div className="relative min-h-[600px] flex items-center justify-center bg-gradient-to-br from-gray-900 via-red-950 to-gray-900">
      <div className="relative z-10 text-center p-8">
        <div className="text-9xl mb-6 opacity-50">💀</div>
        <h2 className="text-5xl font-black text-red-500 mb-4">THẤT BẠI</h2>
        <p className="text-xl text-gray-400 mb-8">{currentLevel?.enemy_name} đã đánh bại bạn...</p>
        
        <div className="flex gap-4 justify-center">
          <button onClick={() => currentLevel && startLevel(currentLevel)}
            className="px-8 py-4 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-400 hover:to-orange-400 text-white rounded-xl font-bold text-lg flex items-center gap-2">
            <RotateCcw className="w-5 h-5" /> Thử lại
          </button>
          <button onClick={() => setGameState('level_select')}
            className="px-6 py-4 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold">
            Chọn màn khác
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="w-full rounded-3xl overflow-hidden">
      <style>{`
        @keyframes shake { 
          0%, 100% { transform: translateX(0); } 
          10%, 30%, 50%, 70%, 90% { transform: translateX(-8px); } 
          20%, 40%, 60%, 80% { transform: translateX(8px); } 
        }
        .animate-shake { animation: shake 0.6s ease-in-out; }
        
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
        .animate-float { animation: float 4s ease-in-out infinite; }
        
        @keyframes twinkle {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.5); }
        }
        .animate-twinkle { animation: twinkle 2s ease-in-out infinite; }
        
        @keyframes glow {
          0%, 100% { box-shadow: 0 0 20px rgba(255,255,255,0.3); }
          50% { box-shadow: 0 0 40px rgba(255,255,255,0.6); }
        }
        .animate-glow { animation: glow 2s ease-in-out infinite; }
        
        @keyframes slideIn {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-slideIn { animation: slideIn 0.5s ease-out; }
      `}</style>
      
      {gameState === 'menu' && renderMenu()}
      {gameState === 'level_select' && renderLevelSelect()}
      {gameState === 'story' && renderStory()}
      {gameState === 'battle' && renderBattle()}
      {gameState === 'victory' && renderVictory()}
      {gameState === 'defeat' && renderDefeat()}
    </div>
  );
};
