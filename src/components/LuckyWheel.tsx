import { useState, useEffect } from 'react';
import { Gift, RotateCw } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

type Prize = {
  id: number;
  label: string;
  value: number;
  type: 'coins' | 'xp';
  color: string;
  icon: string;
  probability: number;
};

const PRIZES: Prize[] = [
  { id: 1, label: '5 Xu', value: 5, type: 'coins', color: '#f59e0b', icon: '🪙', probability: 25 },
  { id: 2, label: '10 XP', value: 10, type: 'xp', color: '#8b5cf6', icon: '⭐', probability: 25 },
  { id: 3, label: '15 Xu', value: 15, type: 'coins', color: '#f59e0b', icon: '💰', probability: 20 },
  { id: 4, label: '25 XP', value: 25, type: 'xp', color: '#8b5cf6', icon: '✨', probability: 15 },
  { id: 5, label: '30 Xu', value: 30, type: 'coins', color: '#f59e0b', icon: '💎', probability: 8 },
  { id: 6, label: '50 XP', value: 50, type: 'xp', color: '#8b5cf6', icon: '🌟', probability: 5 },
  { id: 7, label: '100 Xu', value: 100, type: 'coins', color: '#ef4444', icon: '👑', probability: 1.5 },
  { id: 8, label: '200 XP', value: 200, type: 'xp', color: '#ef4444', icon: '🏆', probability: 0.5 },
];

export const LuckyWheel = () => {
  const { user, profile, refreshProfile } = useAuth();
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [prize, setPrize] = useState<Prize | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [freeSpins, setFreeSpins] = useState(1);


  useEffect(() => {
    if (user) loadSpinData();
  }, [user]);

  const loadSpinData = () => {
    if (!user) return;
    const saved = localStorage.getItem(`spin_${user.id}`);
    if (saved) {
      const data = JSON.parse(saved);
      const lastDate = new Date(data.lastSpin);
      const now = new Date();
      if (lastDate.toDateString() !== now.toDateString()) {
        setFreeSpins(1);
      } else {
        setFreeSpins(data.freeSpins || 0);
      }
      setLastSpinDate(data.lastSpin);
    }
  };

  const selectPrize = (): Prize => {
    const rand = Math.random() * 100;
    let cumulative = 0;
    for (const p of PRIZES) {
      cumulative += p.probability;
      if (rand <= cumulative) return p;
    }
    return PRIZES[0];
  };

  const spin = async () => {
    if (spinning || freeSpins <= 0 || !user || !profile) return;
    setSpinning(true);
    setShowResult(false);

    const selectedPrize = selectPrize();
    const prizeIndex = PRIZES.findIndex(p => p.id === selectedPrize.id);
    const segmentAngle = 360 / PRIZES.length;
    const targetAngle = 360 - (prizeIndex * segmentAngle) - (segmentAngle / 2);
    const spins = 5 + Math.random() * 3;
    const finalRotation = rotation + (spins * 360) + targetAngle;

    setRotation(finalRotation);

    setTimeout(async () => {
      setPrize(selectedPrize);
      setShowResult(true);
      setSpinning(false);
      setFreeSpins(prev => prev - 1);

      // Save spin data
      localStorage.setItem(`spin_${user.id}`, JSON.stringify({
        lastSpin: new Date().toISOString(),
        freeSpins: freeSpins - 1,
      }));

      // Update database
      const updateData = selectedPrize.type === 'coins'
        ? { total_coins: (profile.total_coins || 0) + selectedPrize.value }
        : { xp: (profile.xp || 0) + selectedPrize.value };
      
      await supabase.from('profiles').update(updateData).eq('id', user.id);
      refreshProfile();
    }, 4000);
  };

  return (
    <div className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 rounded-2xl p-6 border border-purple-500/30">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
            <Gift className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Vòng Quay May Mắn</h3>
            <p className="text-gray-400 text-sm">Quay mỗi ngày để nhận thưởng!</p>
          </div>
        </div>
        <div className="px-4 py-2 bg-purple-500/20 rounded-xl">
          <span className="font-bold text-purple-400">{freeSpins} lượt</span>
        </div>
      </div>

      {/* Wheel */}
      <div className="relative w-64 h-64 mx-auto mb-6">
        {/* Pointer */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 z-10">
          <div className="w-0 h-0 border-l-[15px] border-r-[15px] border-t-[25px] border-l-transparent border-r-transparent border-t-yellow-400"></div>
        </div>
        
        {/* Wheel */}
        <div
          className="w-full h-full rounded-full border-4 border-yellow-400 overflow-hidden transition-transform duration-[4000ms] ease-out"
          style={{ transform: `rotate(${rotation}deg)` }}
        >
          <svg viewBox="0 0 100 100" className="w-full h-full">
            {PRIZES.map((p, i) => {
              const angle = 360 / PRIZES.length;
              const startAngle = i * angle - 90;
              const endAngle = startAngle + angle;
              const x1 = 50 + 50 * Math.cos((startAngle * Math.PI) / 180);
              const y1 = 50 + 50 * Math.sin((startAngle * Math.PI) / 180);
              const x2 = 50 + 50 * Math.cos((endAngle * Math.PI) / 180);
              const y2 = 50 + 50 * Math.sin((endAngle * Math.PI) / 180);
              const largeArc = angle > 180 ? 1 : 0;
              
              return (
                <g key={p.id}>
                  <path
                    d={`M 50 50 L ${x1} ${y1} A 50 50 0 ${largeArc} 1 ${x2} ${y2} Z`}
                    fill={i % 2 === 0 ? '#1f2937' : '#374151'}
                    stroke="#4b5563"
                    strokeWidth="0.5"
                  />
                  <text
                    x="50"
                    y="20"
                    textAnchor="middle"
                    fill="white"
                    fontSize="6"
                    fontWeight="bold"
                    transform={`rotate(${startAngle + angle / 2 + 90}, 50, 50)`}
                  >
                    {p.icon}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Center button */}
        <button
          onClick={spin}
          disabled={spinning || freeSpins <= 0}
          className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full font-bold transition-all ${
            spinning
              ? 'bg-gray-600 cursor-not-allowed'
              : freeSpins > 0
              ? 'bg-gradient-to-br from-yellow-400 to-orange-500 hover:scale-110 shadow-lg shadow-yellow-500/50'
              : 'bg-gray-600 cursor-not-allowed'
          }`}
        >
          <RotateCw className={`w-6 h-6 mx-auto text-white ${spinning ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Prizes list */}
      <div className="grid grid-cols-4 gap-2">
        {PRIZES.map(p => (
          <div key={p.id} className="text-center p-2 bg-gray-800/50 rounded-lg">
            <div className="text-lg">{p.icon}</div>
            <div className="text-xs text-gray-400">{p.label}</div>
          </div>
        ))}
      </div>

      {/* Result popup */}
      {showResult && prize && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowResult(false)}>
          <div className="bg-gradient-to-br from-purple-900 to-pink-900 rounded-3xl p-8 max-w-sm w-full text-center border-2 border-purple-500/50">
            <div className="text-6xl mb-4">{prize.icon}</div>
            <h2 className="text-2xl font-black text-white mb-2">Chúc mừng!</h2>
            <p className="text-gray-300 mb-4">Bạn nhận được:</p>
            <div className="text-4xl font-black mb-6" style={{ color: prize.color }}>
              +{prize.value} {prize.type === 'coins' ? 'Xu' : 'XP'}
            </div>
            <button onClick={() => setShowResult(false)} className="px-6 py-3 bg-white/20 hover:bg-white/30 text-white rounded-xl font-bold">
              Tuyệt vời!
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
