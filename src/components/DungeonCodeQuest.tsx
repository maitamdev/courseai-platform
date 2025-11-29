import { useState, useEffect, useCallback } from 'react';
import { Heart, Sword, Shield, Coins, Star, X, Zap, SkullIcon, ChevronRight, Trophy, Crown, Castle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

type Position = { x: number; y: number };
type Direction = 'up' | 'down' | 'left' | 'right';

type Entity = {
  id: string;
  type: 'player' | 'enemy' | 'chest' | 'door' | 'key';
  position: Position;
  health?: number;
  maxHealth?: number;
  attack?: number;
  defense?: number;
  sprite: string;
  name?: string;
};



type CodeChallenge = {
  question: string;
  code?: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
};

type DungeonLevel = {
  id: number;
  name: string;
  map: number[][];
  entities: Omit<Entity, 'id'>[];
  challenges: CodeChallenge[];
  coinsReward: number;
  xpReward: number;
};

// Dungeon levels data
const DUNGEON_LEVELS: DungeonLevel[] = [
  {
    id: 1,
    name: "Hang Động Khởi Đầu",
    map: [
      [1,1,1,1,1,1,1,1,1,1,1,1],
      [1,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,1,1,0,1,1,0,1,1,0,1],
      [1,0,1,0,0,0,0,0,0,1,0,1],
      [1,0,0,0,1,1,1,1,0,0,0,1],
      [1,0,1,0,0,0,0,0,0,1,0,1],
      [1,0,1,1,0,1,1,0,1,1,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,1],
      [1,1,1,1,1,1,1,1,1,1,1,1],
    ],
    entities: [
      { type: 'player', position: { x: 1, y: 1 }, health: 100, maxHealth: 100, attack: 15, defense: 5, sprite: '🧙' },
      { type: 'enemy', position: { x: 5, y: 4 }, health: 30, maxHealth: 30, attack: 8, defense: 2, sprite: '👹', name: 'Goblin' },
      { type: 'enemy', position: { x: 9, y: 2 }, health: 25, maxHealth: 25, attack: 10, defense: 1, sprite: '🦇', name: 'Dơi Ma' },
      { type: 'chest', position: { x: 10, y: 7 }, sprite: '📦' },
      { type: 'door', position: { x: 10, y: 4 }, sprite: '🚪' },
    ],
    challenges: [
      { question: "Kết quả của: print(2 + 3 * 4)", options: ["20", "14", "24", "11"], correctAnswer: 1, explanation: "Phép nhân được thực hiện trước: 3*4=12, sau đó 2+12=14", difficulty: 'easy' },
      { question: "Kiểu dữ liệu của '123' trong Python là gì?", options: ["int", "float", "str", "list"], correctAnswer: 2, explanation: "Dấu nháy đơn/kép tạo ra string (chuỗi)", difficulty: 'easy' },
      { question: "Lệnh nào in ra 'Hello'?", options: ["echo 'Hello'", "print('Hello')", "console.log('Hello')", "printf('Hello')"], correctAnswer: 1, explanation: "Python dùng print() để in ra màn hình", difficulty: 'easy' },
    ],
    coinsReward: 50,
    xpReward: 100,
  },
  {
    id: 2,
    name: "Hầm Ngục Tối",
    map: [
      [1,1,1,1,1,1,1,1,1,1,1,1],
      [1,0,0,0,1,0,0,0,0,0,0,1],
      [1,0,1,0,1,0,1,1,1,1,0,1],
      [1,0,1,0,0,0,0,0,0,1,0,1],
      [1,0,1,1,1,1,1,1,0,1,0,1],
      [1,0,0,0,0,0,0,0,0,1,0,1],
      [1,1,1,1,1,1,0,1,1,1,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,1],
      [1,1,1,1,1,1,1,1,1,1,1,1],
    ],
    entities: [
      { type: 'player', position: { x: 1, y: 1 }, health: 100, maxHealth: 100, attack: 18, defense: 6, sprite: '🧙' },
      { type: 'enemy', position: { x: 3, y: 3 }, health: 40, maxHealth: 40, attack: 12, defense: 3, sprite: '💀', name: 'Skeleton' },
      { type: 'enemy', position: { x: 8, y: 5 }, health: 35, maxHealth: 35, attack: 14, defense: 2, sprite: '🧟', name: 'Zombie' },
      { type: 'enemy', position: { x: 5, y: 7 }, health: 45, maxHealth: 45, attack: 10, defense: 5, sprite: '👻', name: 'Ma' },
      { type: 'chest', position: { x: 1, y: 7 }, sprite: '📦' },
      { type: 'door', position: { x: 10, y: 7 }, sprite: '🚪' },
    ],
    challenges: [
      { question: "for i in range(3): print(i) - In ra gì?", options: ["1 2 3", "0 1 2", "0 1 2 3", "1 2"], correctAnswer: 1, explanation: "range(3) tạo dãy từ 0 đến 2", difficulty: 'medium' },
      { question: "len([1, 2, 3, 4, 5]) trả về?", options: ["4", "5", "6", "Error"], correctAnswer: 1, explanation: "len() đếm số phần tử trong list", difficulty: 'easy' },
      { question: "x = [1,2,3]; x.append(4); print(x)", options: ["[1,2,3]", "[1,2,3,4]", "[4,1,2,3]", "Error"], correctAnswer: 1, explanation: "append() thêm phần tử vào cuối list", difficulty: 'medium' },
      { question: "'hello'.upper() trả về?", options: ["'hello'", "'Hello'", "'HELLO'", "Error"], correctAnswer: 2, explanation: "upper() chuyển tất cả thành chữ hoa", difficulty: 'easy' },
    ],
    coinsReward: 80,
    xpReward: 150,
  },

  {
    id: 3,
    name: "Lâu Đài Bóng Tối",
    map: [
      [1,1,1,1,1,1,1,1,1,1,1,1],
      [1,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,1,1,1,0,1,1,1,1,0,1],
      [1,0,0,0,1,0,1,0,0,0,0,1],
      [1,1,1,0,1,0,1,0,1,1,1,1],
      [1,0,0,0,1,0,0,0,1,0,0,1],
      [1,0,1,1,1,1,1,0,1,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,1],
      [1,1,1,1,1,1,1,1,1,1,1,1],
    ],
    entities: [
      { type: 'player', position: { x: 1, y: 1 }, health: 100, maxHealth: 100, attack: 20, defense: 8, sprite: '🧙' },
      { type: 'enemy', position: { x: 5, y: 3 }, health: 60, maxHealth: 60, attack: 18, defense: 5, sprite: '🐉', name: 'Rồng Con' },
      { type: 'enemy', position: { x: 9, y: 5 }, health: 50, maxHealth: 50, attack: 20, defense: 4, sprite: '👿', name: 'Quỷ' },
      { type: 'enemy', position: { x: 3, y: 7 }, health: 55, maxHealth: 55, attack: 16, defense: 6, sprite: '🧛', name: 'Ma Cà Rồng' },
      { type: 'chest', position: { x: 10, y: 1 }, sprite: '📦' },
      { type: 'door', position: { x: 10, y: 7 }, sprite: '🚪' },
    ],
    challenges: [
      { question: "def add(a, b): return a + b\nadd(3, 5) trả về?", options: ["35", "8", "a + b", "Error"], correctAnswer: 1, explanation: "Hàm add cộng 2 số: 3 + 5 = 8", difficulty: 'medium' },
      { question: "x = {'a': 1, 'b': 2}; x['a'] = ?", options: ["'a'", "1", "2", "Error"], correctAnswer: 1, explanation: "Truy cập dictionary bằng key 'a' trả về value 1", difficulty: 'medium' },
      { question: "if 5 > 3 and 2 < 4: print('Yes')", options: ["Yes", "No", "Error", "None"], correctAnswer: 0, explanation: "Cả 2 điều kiện đều True nên in 'Yes'", difficulty: 'medium' },
      { question: "[x*2 for x in [1,2,3]] = ?", options: ["[1,2,3]", "[2,4,6]", "[1,4,9]", "Error"], correctAnswer: 1, explanation: "List comprehension nhân mỗi phần tử với 2", difficulty: 'hard' },
    ],
    coinsReward: 120,
    xpReward: 200,
  },
  {
    id: 4,
    name: "Đền Thờ Cổ Đại",
    map: [
      [1,1,1,1,1,1,1,1,1,1,1,1],
      [1,0,0,1,0,0,0,0,1,0,0,1],
      [1,0,0,1,0,1,1,0,1,0,0,1],
      [1,0,0,0,0,1,1,0,0,0,0,1],
      [1,1,1,0,0,0,0,0,0,1,1,1],
      [1,0,0,0,0,1,1,0,0,0,0,1],
      [1,0,0,1,0,1,1,0,1,0,0,1],
      [1,0,0,1,0,0,0,0,1,0,0,1],
      [1,1,1,1,1,1,1,1,1,1,1,1],
    ],
    entities: [
      { type: 'player', position: { x: 1, y: 1 }, health: 100, maxHealth: 100, attack: 25, defense: 10, sprite: '🧙' },
      { type: 'enemy', position: { x: 5, y: 2 }, health: 80, maxHealth: 80, attack: 22, defense: 8, sprite: '🗿', name: 'Golem' },
      { type: 'enemy', position: { x: 9, y: 4 }, health: 70, maxHealth: 70, attack: 25, defense: 6, sprite: '🦂', name: 'Bọ Cạp Khổng Lồ' },
      { type: 'enemy', position: { x: 2, y: 6 }, health: 75, maxHealth: 75, attack: 20, defense: 10, sprite: '🐍', name: 'Rắn Hổ Mang' },
      { type: 'chest', position: { x: 10, y: 1 }, sprite: '📦' },
      { type: 'chest', position: { x: 1, y: 7 }, sprite: '📦' },
      { type: 'door', position: { x: 10, y: 7 }, sprite: '🚪' },
    ],
    challenges: [
      { question: "try:\n  x = 1/0\nexcept:\n  print('Error')", options: ["1", "0", "Error", "None"], correctAnswer: 2, explanation: "Chia cho 0 gây exception, except bắt và in 'Error'", difficulty: 'hard' },
      { question: "class Dog:\n  def bark(self): return 'Woof'\nd = Dog()\nd.bark() = ?", options: ["'Woof'", "Dog", "bark", "Error"], correctAnswer: 0, explanation: "Gọi method bark() của object d trả về 'Woof'", difficulty: 'hard' },
      { question: "lambda x: x**2 gọi với 4 = ?", options: ["8", "16", "4", "Error"], correctAnswer: 1, explanation: "Lambda tính x bình phương: 4**2 = 16", difficulty: 'hard' },
      { question: "sorted([3,1,4,1,5], reverse=True) = ?", options: ["[1,1,3,4,5]", "[5,4,3,1,1]", "[3,1,4,1,5]", "Error"], correctAnswer: 1, explanation: "sorted với reverse=True sắp xếp giảm dần", difficulty: 'medium' },
    ],
    coinsReward: 150,
    xpReward: 250,
  },

  {
    id: 5,
    name: "Ngục Tối Cuối Cùng - Boss",
    map: [
      [1,1,1,1,1,1,1,1,1,1,1,1],
      [1,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,1,1,0,0,1,1,0,0,1],
      [1,0,0,1,0,0,0,0,1,0,0,1],
      [1,0,0,1,1,0,0,1,1,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,1],
      [1,1,1,1,1,1,1,1,1,1,1,1],
    ],
    entities: [
      { type: 'player', position: { x: 1, y: 4 }, health: 100, maxHealth: 100, attack: 30, defense: 12, sprite: '🧙' },
      { type: 'enemy', position: { x: 5, y: 4 }, health: 200, maxHealth: 200, attack: 35, defense: 15, sprite: '👑', name: 'Vua Quỷ' },
      { type: 'chest', position: { x: 10, y: 1 }, sprite: '👑' },
    ],
    challenges: [
      { question: "import random\nrandom.randint(1, 10) trả về?", options: ["Số từ 0-10", "Số từ 1-10", "Số từ 1-9", "Error"], correctAnswer: 1, explanation: "randint(1,10) trả về số nguyên ngẫu nhiên từ 1 đến 10 (bao gồm cả 2 đầu)", difficulty: 'medium' },
      { question: "with open('file.txt', 'r') as f:\n  data = f.read()\n'r' nghĩa là?", options: ["Write", "Read", "Append", "Binary"], correctAnswer: 1, explanation: "'r' là chế độ đọc file (read)", difficulty: 'medium' },
      { question: "@decorator\ndef func(): pass\n@ là gì?", options: ["Comment", "Decorator", "Import", "Class"], correctAnswer: 1, explanation: "@ là cú pháp decorator trong Python", difficulty: 'hard' },
      { question: "async def fetch():\n  await get_data()\nasync/await dùng cho?", options: ["Loop", "Async programming", "Error handling", "Class"], correctAnswer: 1, explanation: "async/await dùng cho lập trình bất đồng bộ", difficulty: 'hard' },
      { question: "Để cài package Python, dùng lệnh?", options: ["npm install", "pip install", "apt install", "brew install"], correctAnswer: 1, explanation: "pip là package manager của Python", difficulty: 'easy' },
    ],
    coinsReward: 300,
    xpReward: 500,
  },
];

const TILE_SPRITES: Record<number, { bg: string; walkable: boolean }> = {
  0: { bg: 'bg-gray-700', walkable: true },  // floor
  1: { bg: 'bg-gray-900', walkable: false }, // wall
};

export const DungeonCodeQuest = () => {
  const { user, profile, refreshProfile } = useAuth();
  const [currentLevel, setCurrentLevel] = useState(0);
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'battle' | 'victory' | 'gameover'>('menu');
  const [entities, setEntities] = useState<Entity[]>([]);
  const [player, setPlayer] = useState<Entity | null>(null);
  const [currentEnemy, setCurrentEnemy] = useState<Entity | null>(null);
  const [currentChallenge, setCurrentChallenge] = useState<CodeChallenge | null>(null);
  const [challengeIndex, setChallengeIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [collectedCoins, setCollectedCoins] = useState(0);
  const [collectedXP, setCollectedXP] = useState(0);
  const [defeatedEnemies, setDefeatedEnemies] = useState<string[]>([]);
  const [openedChests, setOpenedChests] = useState<string[]>([]);
  const [message, setMessage] = useState('');
  const [unlockedLevels, setUnlockedLevels] = useState<number[]>([1]);

  const level = DUNGEON_LEVELS[currentLevel];

  useEffect(() => {
    // Load unlocked levels from database
    const loadProgress = async () => {
      if (!user) return;
      try {
        const { data } = await supabase
          .from('dungeon_progress')
          .select('unlocked_levels')
          .eq('user_id', user.id)
          .single();
        
        if (data?.unlocked_levels) {
          setUnlockedLevels(data.unlocked_levels);
        }
      } catch {
        // Fallback to localStorage
        const saved = localStorage.getItem(`dungeonUnlockedLevels_${user.id}`);
        if (saved) {
          setUnlockedLevels(JSON.parse(saved));
        }
      }
    };
    loadProgress();
  }, [user]);

  const initLevel = useCallback(() => {
    const levelData = DUNGEON_LEVELS[currentLevel];
    const newEntities: Entity[] = levelData.entities.map((e, i) => ({
      ...e,
      id: `${e.type}-${i}`,
    }));
    setEntities(newEntities);
    setPlayer(newEntities.find(e => e.type === 'player') || null);
    setDefeatedEnemies([]);
    setOpenedChests([]);
    setChallengeIndex(0);
    setMessage('Dùng phím mũi tên hoặc WASD để di chuyển!');
  }, [currentLevel]);

  const startGame = (levelIndex: number) => {
    setCurrentLevel(levelIndex);
    setGameState('playing');
    setCollectedCoins(0);
    setCollectedXP(0);
    setTimeout(() => initLevel(), 100);
  };

  useEffect(() => {
    if (gameState === 'playing') {
      initLevel();
    }
  }, [gameState, initLevel]);

  const movePlayer = useCallback((direction: Direction) => {
    if (!player || gameState !== 'playing') return;

    const newPos = { ...player.position };
    switch (direction) {
      case 'up': newPos.y -= 1; break;
      case 'down': newPos.y += 1; break;
      case 'left': newPos.x -= 1; break;
      case 'right': newPos.x += 1; break;
    }

    // Check bounds and walls
    if (newPos.x < 0 || newPos.x >= level.map[0].length || newPos.y < 0 || newPos.y >= level.map.length) return;
    if (level.map[newPos.y][newPos.x] === 1) return;

    // Check for entity collision
    const entityAtPos = entities.find(e => e.id !== player.id && e.position.x === newPos.x && e.position.y === newPos.y);
    
    if (entityAtPos) {
      if (entityAtPos.type === 'enemy' && !defeatedEnemies.includes(entityAtPos.id)) {
        // Start battle
        setCurrentEnemy(entityAtPos);
        setCurrentChallenge(level.challenges[challengeIndex % level.challenges.length]);
        setGameState('battle');
        setSelectedAnswer(null);
        setShowResult(false);
        return;
      } else if (entityAtPos.type === 'chest' && !openedChests.includes(entityAtPos.id)) {
        // Open chest
        const bonus = Math.floor(level.coinsReward / 3);
        setCollectedCoins(prev => prev + bonus);
        setOpenedChests(prev => [...prev, entityAtPos.id]);
        setMessage(`Mở rương nhận ${bonus} xu!`);
      } else if (entityAtPos.type === 'door') {
        // Check if all enemies defeated
        const allEnemies = entities.filter(e => e.type === 'enemy');
        if (allEnemies.every(e => defeatedEnemies.includes(e.id))) {
          completeLevel();
          return;
        } else {
          setMessage('⚠️ Tiêu diệt hết quái vật để mở cửa!');
          return;
        }
      }
    }

    // Move player
    setPlayer({ ...player, position: newPos });
    setEntities(prev => prev.map(e => e.id === player.id ? { ...e, position: newPos } : e));
  }, [player, gameState, level, entities, defeatedEnemies, openedChests, challengeIndex]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState !== 'playing') return;
      switch (e.key) {
        case 'ArrowUp': case 'w': case 'W': movePlayer('up'); break;
        case 'ArrowDown': case 's': case 'S': movePlayer('down'); break;
        case 'ArrowLeft': case 'a': case 'A': movePlayer('left'); break;
        case 'ArrowRight': case 'd': case 'D': movePlayer('right'); break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [movePlayer, gameState]);

  const handleAnswer = (answerIndex: number) => {
    if (showResult || !currentChallenge) return;
    setSelectedAnswer(answerIndex);
    const correct = answerIndex === currentChallenge.correctAnswer;
    setIsCorrect(correct);
    setShowResult(true);

    setTimeout(() => {
      if (correct && currentEnemy) {
        // Deal damage to enemy
        const damage = (player?.attack || 15) - (currentEnemy.defense || 0);
        const newHealth = (currentEnemy.health || 0) - Math.max(damage, 5);
        
        if (newHealth <= 0) {
          // Enemy defeated
          setDefeatedEnemies(prev => [...prev, currentEnemy.id]);
          setCollectedXP(prev => prev + 30);
          setMessage(`⚔️ Đánh bại ${currentEnemy.name}! +30 XP`);
          setGameState('playing');
          setCurrentEnemy(null);
          setCurrentChallenge(null);
          setChallengeIndex(prev => prev + 1);
        } else {
          // Enemy still alive, continue battle
          setCurrentEnemy({ ...currentEnemy, health: newHealth });
          setChallengeIndex(prev => prev + 1);
          setCurrentChallenge(level.challenges[(challengeIndex + 1) % level.challenges.length]);
          setSelectedAnswer(null);
          setShowResult(false);
        }
      } else if (!correct && player) {
        // Player takes damage
        const damage = (currentEnemy?.attack || 10) - (player.defense || 0);
        const newHealth = (player.health || 100) - Math.max(damage, 5);
        
        if (newHealth <= 0) {
          setGameState('gameover');
        } else {
          setPlayer({ ...player, health: newHealth });
          setEntities(prev => prev.map(e => e.id === player.id ? { ...e, health: newHealth } : e));
          setChallengeIndex(prev => prev + 1);
          setCurrentChallenge(level.challenges[(challengeIndex + 1) % level.challenges.length]);
          setSelectedAnswer(null);
          setShowResult(false);
        }
      }
    }, 2000);
  };

  const completeLevel = async () => {
    setGameState('victory');
    const totalCoins = collectedCoins + level.coinsReward;
    const totalXP = collectedXP + level.xpReward;
    setCollectedCoins(totalCoins);
    setCollectedXP(totalXP);

    // Unlock next level
    const nextLevel = currentLevel + 2;
    if (!unlockedLevels.includes(nextLevel) && nextLevel <= DUNGEON_LEVELS.length) {
      const newUnlocked = [...unlockedLevels, nextLevel];
      setUnlockedLevels(newUnlocked);
      
      // Save to database
      if (user) {
        try {
          await supabase.from('dungeon_progress').upsert({
            user_id: user.id,
            unlocked_levels: newUnlocked,
            current_level: nextLevel,
            updated_at: new Date().toISOString()
          });
        } catch {
          // Fallback to localStorage
          localStorage.setItem(`dungeonUnlockedLevels_${user.id}`, JSON.stringify(newUnlocked));
        }
      }
    }

    // Save rewards to database
    if (user && profile) {
      try {
        await supabase.from('profiles').update({
          total_coins: (profile.total_coins || 0) + totalCoins,
          xp: (profile.xp || 0) + totalXP,
        }).eq('id', user.id);
        refreshProfile();
      } catch (error) {
        console.error('Error saving rewards:', error);
      }
    }
  };

  // Render Menu
  if (gameState === 'menu') {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500 mb-2">
            🧙‍♂️ Python Wizard
          </h1>
          <p className="text-gray-400">Trở thành phù thủy Python, dùng phép thuật code đánh bại quái vật!</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {DUNGEON_LEVELS.map((lvl, index) => {
            const isUnlocked = unlockedLevels.includes(index + 1);
            return (
              <div
                key={lvl.id}
                onClick={() => isUnlocked && startGame(index)}
                className={`relative p-4 rounded-xl border-2 transition-all ${
                  isUnlocked
                    ? 'bg-gradient-to-br from-purple-900/50 to-pink-900/50 border-purple-500/50 hover:border-purple-400 cursor-pointer hover:scale-105'
                    : 'bg-gray-800/50 border-gray-700/50 opacity-60 cursor-not-allowed'
                }`}
              >
                {!isUnlocked && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-xl">
                    <span className="text-4xl">🔒</span>
                  </div>
                )}
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center text-2xl">
                    {index === 4 ? <Crown className="w-6 h-6 text-yellow-400" /> : <Castle className="w-6 h-6 text-purple-400" />}
                  </div>
                  <div>
                    <h3 className="font-bold text-white">Level {index + 1}</h3>
                    <p className="text-sm text-gray-400">{lvl.name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <span className="flex items-center gap-1 text-emerald-400">
                    <Coins className="w-4 h-4" /> {lvl.coinsReward}
                  </span>
                  <span className="flex items-center gap-1 text-purple-400">
                    <Star className="w-4 h-4" /> {lvl.xpReward} XP
                  </span>
                  <span className="flex items-center gap-1 text-red-400">
                    <SkullIcon className="w-4 h-4" /> {lvl.entities.filter(e => e.type === 'enemy').length}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Render Battle
  if (gameState === 'battle' && currentEnemy && currentChallenge) {
    return (
      <div className="max-w-3xl mx-auto">
        {/* Battle Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <span className="text-4xl">{player?.sprite}</span>
            <div>
              <p className="font-bold text-white">Bạn</p>
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-red-500" />
                <div className="w-32 h-3 bg-gray-700 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-red-500 to-red-400" style={{ width: `${((player?.health || 0) / (player?.maxHealth || 100)) * 100}%` }} />
                </div>
                <span className="text-sm text-gray-400">{player?.health}/{player?.maxHealth}</span>
              </div>
            </div>
          </div>
          <Sword className="w-8 h-8 text-emerald-400 animate-pulse" />
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="font-bold text-red-400">{currentEnemy.name}</p>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-400">{currentEnemy.health}/{currentEnemy.maxHealth}</span>
                <div className="w-32 h-3 bg-gray-700 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-red-600 to-red-500" style={{ width: `${((currentEnemy.health || 0) / (currentEnemy.maxHealth || 100)) * 100}%` }} />
                </div>
                <Heart className="w-4 h-4 text-red-500" />
              </div>
            </div>
            <span className="text-4xl">{currentEnemy.sprite}</span>
          </div>
        </div>

        {/* Challenge */}
        <div className="bg-gray-800/80 rounded-2xl p-6 border border-purple-500/30">
          <div className="flex items-center gap-2 mb-4">
            <Zap className="w-5 h-5 text-emerald-400" />
            <span className="text-sm font-medium text-emerald-400">Trả lời đúng để tấn công!</span>
          </div>
          
          <div className="bg-gray-900/80 rounded-xl p-4 mb-4">
            <pre className="text-green-400 font-mono text-sm whitespace-pre-wrap">{currentChallenge.question}</pre>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {currentChallenge.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswer(index)}
                disabled={showResult}
                className={`p-3 rounded-xl font-medium transition-all text-left ${
                  showResult
                    ? index === currentChallenge.correctAnswer
                      ? 'bg-green-500/30 border-2 border-green-500 text-green-400'
                      : selectedAnswer === index
                      ? 'bg-red-500/30 border-2 border-red-500 text-red-400'
                      : 'bg-gray-700/50 border-2 border-gray-600 text-gray-400'
                    : 'bg-gray-700/50 border-2 border-gray-600 hover:border-purple-500 hover:bg-purple-500/20 text-white'
                }`}
              >
                <span className="mr-2 text-gray-500">{String.fromCharCode(65 + index)}.</span>
                {option}
              </button>
            ))}
          </div>

          {showResult && (
            <div className={`mt-4 p-4 rounded-xl ${isCorrect ? 'bg-green-500/20 border border-green-500/50' : 'bg-red-500/20 border border-red-500/50'}`}>
              <p className={`font-bold mb-1 ${isCorrect ? 'text-green-400' : 'text-red-400'}`}>
                {isCorrect ? 'Chính xác! Tấn công thành công!' : 'Sai rồi! Bạn bị tấn công!'}
              </p>
              <p className="text-gray-300 text-sm">{currentChallenge.explanation}</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Render Victory
  if (gameState === 'victory') {
    return (
      <div className="max-w-md mx-auto text-center">
        <div className="bg-gradient-to-br from-emerald-900/50 to-green-900/50 rounded-3xl p-8 border-2 border-emerald-500/50">
          <Trophy className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
          <h2 className="text-3xl font-black text-emerald-400 mb-2">Chiến Thắng!</h2>
          <p className="text-gray-300 mb-6">Bạn đã hoàn thành {level.name}!</p>
          
          <div className="flex justify-center gap-6 mb-6">
            <div className="text-center">
              <div className="text-3xl font-black text-emerald-400">{collectedCoins}</div>
              <div className="text-sm text-gray-400 flex items-center gap-1 justify-center">
                <Coins className="w-4 h-4" /> Xu
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-black text-purple-400">{collectedXP}</div>
              <div className="text-sm text-gray-400 flex items-center gap-1 justify-center">
                <Star className="w-4 h-4" /> XP
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button onClick={() => setGameState('menu')} className="flex-1 px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-xl font-bold transition-all">
              Menu
            </button>
            {currentLevel < DUNGEON_LEVELS.length - 1 && (
              <button onClick={() => startGame(currentLevel + 1)} className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2">
                Tiếp tục <ChevronRight className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Render Game Over
  if (gameState === 'gameover') {
    return (
      <div className="max-w-md mx-auto text-center">
        <div className="bg-gradient-to-br from-red-900/50 to-gray-900/50 rounded-3xl p-8 border-2 border-red-500/50">
          <div className="text-6xl mb-4">💀</div>
          <h2 className="text-3xl font-black text-red-400 mb-2">Game Over</h2>
          <p className="text-gray-300 mb-6">Bạn đã bị đánh bại...</p>
          
          <div className="flex gap-3">
            <button onClick={() => setGameState('menu')} className="flex-1 px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-xl font-bold transition-all">
              Menu
            </button>
            <button onClick={() => startGame(currentLevel)} className="flex-1 px-4 py-3 bg-gradient-to-r from-red-500 to-green-500 hover:from-red-600 hover:to-green-600 text-white rounded-xl font-bold transition-all">
              Thử lại
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Render Playing
  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <button onClick={() => setGameState('menu')} className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg">
            <X className="w-5 h-5" />
          </button>
          <div>
            <h2 className="font-bold text-white">{level.name}</h2>
            <p className="text-sm text-gray-400">Level {currentLevel + 1}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/20 rounded-lg">
            <Coins className="w-4 h-4 text-emerald-400" />
            <span className="font-bold text-emerald-400">{collectedCoins}</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-purple-500/20 rounded-lg">
            <Star className="w-4 h-4 text-purple-400" />
            <span className="font-bold text-purple-400">{collectedXP}</span>
          </div>
        </div>
      </div>

      {/* Player Stats */}
      <div className="flex items-center gap-4 mb-4 p-3 bg-gray-800/50 rounded-xl">
        <span className="text-2xl">{player?.sprite}</span>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <Heart className="w-4 h-4 text-red-500" />
            <div className="flex-1 h-3 bg-gray-700 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-red-500 to-red-400 transition-all" style={{ width: `${((player?.health || 0) / (player?.maxHealth || 100)) * 100}%` }} />
            </div>
            <span className="text-sm text-gray-400 w-16">{player?.health}/{player?.maxHealth}</span>
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-400">
            <span className="flex items-center gap-1"><Sword className="w-3 h-3 text-green-400" /> {player?.attack}</span>
            <span className="flex items-center gap-1"><Shield className="w-3 h-3 text-blue-400" /> {player?.defense}</span>
          </div>
        </div>
      </div>

      {/* Message */}
      {message && (
        <div className="mb-4 p-3 bg-purple-500/20 border border-purple-500/30 rounded-xl text-center text-purple-300">
          {message}
        </div>
      )}

      {/* Game Map */}
      <div className="flex justify-center mb-4">
        <div className="bg-gray-900 p-2 rounded-xl border border-gray-700 inline-block">
          {level.map.map((row, y) => (
            <div key={y} className="flex">
              {row.map((tile, x) => {
                const entity = entities.find(e => e.position.x === x && e.position.y === y);
                const isDefeated = entity && defeatedEnemies.includes(entity.id);
                const isOpened = entity && openedChests.includes(entity.id);
                
                return (
                  <div
                    key={`${x}-${y}`}
                    className={`w-10 h-10 flex items-center justify-center text-xl border border-gray-800 ${TILE_SPRITES[tile].bg}`}
                  >
                    {entity && !isDefeated && !isOpened && entity.sprite}
                    {isDefeated && <span className="opacity-30">💀</span>}
                    {isOpened && <span className="opacity-30">📭</span>}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Mobile Controls */}
      <div className="flex justify-center">
        <div className="grid grid-cols-3 gap-2">
          <div />
          <button onClick={() => movePlayer('up')} className="p-4 bg-gray-700 hover:bg-gray-600 rounded-xl text-2xl active:scale-95">⬆️</button>
          <div />
          <button onClick={() => movePlayer('left')} className="p-4 bg-gray-700 hover:bg-gray-600 rounded-xl text-2xl active:scale-95">⬅️</button>
          <button onClick={() => movePlayer('down')} className="p-4 bg-gray-700 hover:bg-gray-600 rounded-xl text-2xl active:scale-95">⬇️</button>
          <button onClick={() => movePlayer('right')} className="p-4 bg-gray-700 hover:bg-gray-600 rounded-xl text-2xl active:scale-95">➡️</button>
        </div>
      </div>
    </div>
  );
};
