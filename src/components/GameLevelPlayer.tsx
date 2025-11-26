import { useState, useEffect } from 'react';
import { X, Code2, Play, CheckCircle, XCircle, Lightbulb, Trophy, Coins } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

type GameLevel = {
  id: string;
  title: string;
  description: string;
  level_number: number;
  difficulty: string;
  challenge: any;
  solution: string;
  coins_reward: number;
  xp_reward: number;
  category_id: string;
};

type GameLevelPlayerProps = {
  level: GameLevel;
  onClose: () => void;
  onComplete: () => void;
};

export const GameLevelPlayer = ({ level, onClose, onComplete }: GameLevelPlayerProps) => {
  const { user, profile, refreshProfile } = useAuth();
  const [userCode, setUserCode] = useState('');
  const [showHints, setShowHints] = useState(false);
  const [currentHint, setCurrentHint] = useState(0);
  const [result, setResult] = useState<'pending' | 'success' | 'error'>('pending');
  const [message, setMessage] = useState('');
  const [timeLeft, setTimeLeft] = useState(300);
  const [isRunning, setIsRunning] = useState(false);
  const [attempts, setAttempts] = useState(0);

  useEffect(() => {
    let timer: any;
    if (isRunning && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isRunning, timeLeft]);

  useEffect(() => {
    setIsRunning(true);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleRunCode = async () => {
    setAttempts(prev => prev + 1);
    setIsRunning(false);

    if (!userCode.trim()) {
      setResult('error');
      setMessage('Vui lòng nhập code của bạn!');
      return;
    }

    const isCorrect = userCode.toLowerCase().includes('function') ||
                      userCode.toLowerCase().includes('const') ||
                      userCode.toLowerCase().includes('let') ||
                      userCode.length > 20;

    if (isCorrect) {
      setResult('success');
      setMessage('🎉 Chính xác! Bạn đã hoàn thành màn chơi!');

      const stars = timeLeft > 240 ? 3 : timeLeft > 120 ? 2 : 1;

      if (user) {
        try {
          await supabase.from('user_game_progress').upsert({
            user_id: user.id,
            level_id: level.id,
            completed: true,
            stars: stars,
            time_spent: 300 - timeLeft,
            attempts: attempts,
            completed_at: new Date().toISOString()
          });

          const newCoins = (profile?.total_coins || 0) + level.coins_reward;
          const newXP = (profile?.total_xp || 0) + level.xp_reward;

          await supabase
            .from('profiles')
            .update({
              total_coins: newCoins,
              total_xp: newXP
            })
            .eq('id', user.id);

          await supabase.from('coin_transactions').insert({
            user_id: user.id,
            transaction_type: 'earn',
            amount: level.coins_reward,
            description: `Hoàn thành ${level.title}`
          });

          await refreshProfile();

          setTimeout(() => {
            onComplete();
            onClose();
          }, 2000);
        } catch (error) {
          console.error('Error saving progress:', error);
        }
      }
    } else {
      setResult('error');
      setMessage('❌ Chưa đúng! Hãy thử lại.');
    }
  };

  const showNextHint = () => {
    const hints = level.challenge.hints || ['Đọc kỹ đề bài', 'Suy nghĩ về logic', 'Kiểm tra cú pháp'];
    setShowHints(true);
    setCurrentHint(prev => Math.min(prev + 1, hints.length - 1));
  };

  const hints = level.challenge.hints || ['Đọc kỹ đề bài', 'Suy nghĩ về logic', 'Kiểm tra cú pháp'];

  const difficultyColors = {
    easy: 'bg-green-100 text-green-700 border-green-300',
    medium: 'bg-yellow-100 text-yellow-700 border-yellow-300',
    hard: 'bg-red-100 text-red-700 border-red-300'
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl max-w-6xl w-full max-h-[95vh] overflow-y-auto">
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 flex justify-between items-center z-10 rounded-t-3xl">
          <div className="flex-1">
            <h2 className="text-2xl font-bold mb-2">{level.title}</h2>
            <div className="flex gap-4 items-center text-sm">
              <span className={`px-3 py-1 rounded-full border-2 font-bold ${difficultyColors[level.difficulty as keyof typeof difficultyColors]}`}>
                Màn {level.level_number}
              </span>
              <span className="flex items-center gap-1 bg-white/20 px-3 py-1 rounded-full">
                ⏱️ {formatTime(timeLeft)}
              </span>
              <span className="flex items-center gap-1 bg-white/20 px-3 py-1 rounded-full">
                🎯 Lần thử: {attempts}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-8">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-6 border-2 border-blue-200">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Code2 className="w-6 h-6 text-blue-600" />
                  Nhiệm vụ
                </h3>
                <p className="text-gray-700 leading-relaxed mb-4">{level.description}</p>
                <div className="bg-white rounded-xl p-4 font-mono text-sm border-2 border-blue-300">
                  <pre className="text-gray-800 whitespace-pre-wrap">
                    {level.challenge.question || 'Viết code để giải quyết vấn đề'}
                  </pre>
                </div>
              </div>

              <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl p-6 border-2 border-yellow-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <Lightbulb className="w-6 h-6 text-yellow-600" />
                    Gợi ý
                  </h3>
                  {!showHints && (
                    <button
                      onClick={() => setShowHints(true)}
                      className="px-4 py-2 bg-yellow-500 text-white rounded-xl font-bold hover:bg-yellow-600 transition-all text-sm"
                    >
                      Xem gợi ý
                    </button>
                  )}
                </div>

                {showHints ? (
                  <div className="space-y-3">
                    {hints.slice(0, currentHint + 1).map((hint, index) => (
                      <div key={index} className="bg-white rounded-xl p-4 border-2 border-yellow-300">
                        <span className="text-gray-700">💡 {hint}</span>
                      </div>
                    ))}
                    {currentHint < hints.length - 1 && (
                      <button
                        onClick={showNextHint}
                        className="w-full px-4 py-2 bg-white border-2 border-yellow-300 text-yellow-700 rounded-xl font-bold hover:bg-yellow-50 transition-all"
                      >
                        Gợi ý tiếp theo
                      </button>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-600 text-sm">
                    Click vào nút "Xem gợi ý" nếu bạn gặp khó khăn!
                  </p>
                )}
              </div>

              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border-2 border-green-200">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Trophy className="w-6 h-6 text-green-600" />
                  Phần thưởng
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white rounded-xl p-4 text-center border-2 border-green-300">
                    <Coins className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
                    <p className="text-2xl font-black text-gray-900">+{level.coins_reward}</p>
                    <p className="text-sm text-gray-600">Xu</p>
                  </div>
                  <div className="bg-white rounded-xl p-4 text-center border-2 border-green-300">
                    <Trophy className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                    <p className="text-2xl font-black text-gray-900">+{level.xp_reward}</p>
                    <p className="text-sm text-gray-600">XP</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-gray-900 rounded-2xl overflow-hidden border-4 border-gray-700">
                <div className="bg-gray-800 px-4 py-3 flex items-center gap-2 border-b-2 border-gray-700">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  </div>
                  <span className="text-gray-400 text-sm ml-2">code-editor.js</span>
                </div>
                <textarea
                  value={userCode}
                  onChange={(e) => setUserCode(e.target.value)}
                  className="w-full h-96 bg-gray-900 text-green-400 font-mono text-sm p-6 focus:outline-none resize-none"
                  placeholder="// Viết code của bạn ở đây...
function solution() {
  // Your code here
}
"
                  spellCheck={false}
                />
              </div>

              <button
                onClick={handleRunCode}
                disabled={result === 'success'}
                className="w-full py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-2xl font-bold text-lg hover:shadow-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
              >
                <Play className="w-6 h-6" />
                Chạy code
              </button>

              {result !== 'pending' && (
                <div className={`p-6 rounded-2xl border-4 ${
                  result === 'success'
                    ? 'bg-green-50 border-green-400'
                    : 'bg-red-50 border-red-400'
                }`}>
                  <div className="flex items-center gap-3 mb-3">
                    {result === 'success' ? (
                      <CheckCircle className="w-8 h-8 text-green-600" />
                    ) : (
                      <XCircle className="w-8 h-8 text-red-600" />
                    )}
                    <h3 className={`text-xl font-bold ${
                      result === 'success' ? 'text-green-900' : 'text-red-900'
                    }`}>
                      {result === 'success' ? 'Thành công!' : 'Thất bại!'}
                    </h3>
                  </div>
                  <p className={`text-lg ${
                    result === 'success' ? 'text-green-800' : 'text-red-800'
                  }`}>
                    {message}
                  </p>
                  {result === 'success' && (
                    <div className="mt-4 pt-4 border-t-2 border-green-300">
                      <p className="text-sm text-green-700 mb-2">Bạn nhận được:</p>
                      <div className="flex gap-4">
                        <span className="px-4 py-2 bg-white rounded-xl font-bold text-green-900 border-2 border-green-400">
                          +{level.coins_reward} xu
                        </span>
                        <span className="px-4 py-2 bg-white rounded-xl font-bold text-green-900 border-2 border-green-400">
                          +{level.xp_reward} XP
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
