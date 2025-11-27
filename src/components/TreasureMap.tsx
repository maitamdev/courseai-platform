import { useState } from 'react';
import { MapPin, Lock, CheckCircle, X } from 'lucide-react';
import { Treasure, FoundTreasure, UserProgress } from '../lib/supabase';

type TreasureMapProps = {
  treasures: Treasure[];
  foundTreasures: FoundTreasure[];
  userProgress: UserProgress[];
  onTreasureClick: (treasure: Treasure) => void;
};

export const TreasureMap = ({ treasures, foundTreasures, userProgress, onTreasureClick }: TreasureMapProps) => {
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);

  const isTreasureFound = (treasureId: string) => {
    return foundTreasures.some((f) => f.treasure_id === treasureId);
  };

  const isTreasureUnlocked = (treasure: Treasure) => {
    if (!treasure.unlocked_by_lesson) return true;
    return userProgress.some((p) => p.lesson_id === treasure.unlocked_by_lesson && p.completed);
  };

  const locations = Array.from(new Set(treasures.map((t) => t.location_name)));

  const treasuresByLocation = locations.map((location) => {
    const locationTreasures = treasures.filter((t) => t.location_name === location);
    return {
      name: location,
      treasures: locationTreasures,
      x: locationTreasures[0]?.map_x || 0,
      y: locationTreasures[0]?.map_y || 0,
    };
  });

  return (
    <div className="bg-gradient-to-br from-amber-100 via-orange-50 to-yellow-100 rounded-3xl shadow-2xl p-8 border-4 border-amber-700 relative overflow-hidden animate-slide-up">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-20 h-20 bg-yellow-400 rounded-full blur-2xl animate-blob"></div>
        <div className="absolute bottom-10 right-10 w-32 h-32 bg-orange-400 rounded-full blur-2xl animate-blob animation-delay-2000"></div>
      </div>

      <div className="flex justify-between items-center mb-6 relative z-10">
        <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-800 to-orange-600 drop-shadow-lg">
          Bản Đồ Kho Báu
        </h2>
        <div className="flex gap-4 text-sm flex-wrap">
          <div className="flex items-center gap-1 bg-white/80 px-3 py-1.5 rounded-full shadow-md">
            <Lock className="w-4 h-4 text-gray-500" />
            <span className="text-gray-300 font-semibold">Khóa</span>
          </div>
          <div className="flex items-center gap-1 bg-white/80 px-3 py-1.5 rounded-full shadow-md">
            <MapPin className="w-4 h-4 text-blue-600" />
            <span className="text-gray-300 font-semibold">Có thể mở</span>
          </div>
          <div className="flex items-center gap-1 bg-white/80 px-3 py-1.5 rounded-full shadow-md">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <span className="text-gray-300 font-semibold">Đã tìm thấy</span>
          </div>
        </div>
      </div>

      <div className="relative bg-gradient-to-br from-blue-300 via-emerald-200 to-yellow-300 rounded-2xl h-[500px] overflow-hidden border-4 border-amber-800 shadow-inner">
        <svg
          className="absolute inset-0 w-full h-full"
          viewBox="0 0 800 500"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <pattern id="waves" x="0" y="0" width="50" height="50" patternUnits="userSpaceOnUse">
              <path d="M0 25 Q 12.5 15, 25 25 T 50 25" fill="none" stroke="rgba(59, 130, 246, 0.2)" strokeWidth="2" />
            </pattern>
            <linearGradient id="greenGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#059669" />
            </linearGradient>
            <linearGradient id="blueGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#2563eb" />
            </linearGradient>
            <linearGradient id="grayGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#9ca3af" />
              <stop offset="100%" stopColor="#6b7280" />
            </linearGradient>
            <radialGradient id="glow">
              <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#fbbf24" stopOpacity="0" />
            </radialGradient>
          </defs>
          <rect width="800" height="500" fill="url(#waves)" />

          {treasuresByLocation.map((loc, idx) => {
            if (idx < treasuresByLocation.length - 1) {
              const nextLoc = treasuresByLocation[idx + 1];
              return (
                <line
                  key={`path-${idx}`}
                  x1={loc.x}
                  y1={loc.y}
                  x2={nextLoc.x}
                  y2={nextLoc.y}
                  stroke="#92400e"
                  strokeWidth="3"
                  strokeDasharray="5,5"
                  opacity="0.5"
                />
              );
            }
            return null;
          })}

          {treasuresByLocation.map((location, idx) => {
            const allFound = location.treasures.every((t) => isTreasureFound(t.id));
            const hasUnlocked = location.treasures.some((t) => isTreasureUnlocked(t));

            return (
              <g
                key={location.name}
                onClick={() => setSelectedLocation(location.name)}
                className="cursor-pointer"
                style={{ transformOrigin: `${location.x}px ${location.y}px` }}
              >
                <circle
                  cx={location.x}
                  cy={location.y}
                  r="40"
                  fill="url(#glow)"
                  opacity="0.3"
                  className="animate-pulse"
                  style={{ animationDelay: `${idx * 0.2}s` }}
                />
                <circle
                  cx={location.x}
                  cy={location.y}
                  r="32"
                  fill={allFound ? 'url(#greenGradient)' : hasUnlocked ? 'url(#blueGradient)' : 'url(#grayGradient)'}
                  stroke={allFound ? '#059669' : hasUnlocked ? '#2563eb' : '#6b7280'}
                  strokeWidth="4"
                  className="hover:opacity-90 transition-all"
                  filter="drop-shadow(0 4px 6px rgba(0,0,0,0.3))"
                />
                {allFound ? (
                  <text
                    x={location.x}
                    y={location.y + 10}
                    textAnchor="middle"
                    fill="white"
                    fontSize="28"
                    fontWeight="bold"
                  >
                    ✓
                  </text>
                ) : !hasUnlocked ? (
                  <text
                    x={location.x}
                    y={location.y + 10}
                    textAnchor="middle"
                    fill="white"
                    fontSize="28"
                  >
                    🔒
                  </text>
                ) : (
                  <text
                    x={location.x}
                    y={location.y + 10}
                    textAnchor="middle"
                    fill="white"
                    fontSize="30"
                    className="animate-bounce"
                  >
                    💎
                  </text>
                )}
                <rect
                  x={location.x - 60}
                  y={location.y + 45}
                  width="120"
                  height="30"
                  rx="15"
                  fill="rgba(0,0,0,0.7)"
                  className="pointer-events-none"
                />
                <text
                  x={location.x}
                  y={location.y + 65}
                  textAnchor="middle"
                  fill="white"
                  fontSize="14"
                  fontWeight="bold"
                  className="pointer-events-none"
                >
                  {location.name}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {selectedLocation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold text-white">{selectedLocation}</h3>
              <button
                onClick={() => setSelectedLocation(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              {treasures
                .filter((t) => t.location_name === selectedLocation)
                .map((treasure) => {
                  const found = isTreasureFound(treasure.id);
                  const unlocked = isTreasureUnlocked(treasure);

                  return (
                    <button
                      key={treasure.id}
                      onClick={() => {
                        if (unlocked && !found) {
                          onTreasureClick(treasure);
                          setSelectedLocation(null);
                        }
                      }}
                      disabled={!unlocked || found}
                      className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                        found
                          ? 'bg-green-50 border-green-300'
                          : unlocked
                          ? 'bg-blue-50 border-blue-300 hover:bg-blue-100 cursor-pointer'
                          : 'bg-gray-100 border-gray-300 opacity-60'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold text-white">
                            {found ? treasure.title : '???'}
                          </h4>
                          <p className="text-sm text-gray-300 mt-1">
                            +{treasure.coins_reward} xu
                          </p>
                        </div>
                        {found ? (
                          <CheckCircle className="w-6 h-6 text-green-600" />
                        ) : unlocked ? (
                          <MapPin className="w-6 h-6 text-blue-600" />
                        ) : (
                          <Lock className="w-6 h-6 text-gray-400" />
                        )}
                      </div>
                    </button>
                  );
                })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

