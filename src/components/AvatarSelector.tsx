import { useState } from 'react';
import { X, Check } from 'lucide-react';

type AvatarSelectorProps = {
  currentAvatar: string | null;
  onSelect: (avatar: string) => void;
  onClose: () => void;
};

// Danh sách avatar có sẵn - sử dụng DiceBear API
const AVATAR_STYLES = [
  // Adventurer style
  { id: 'adventurer-1', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Felix' },
  { id: 'adventurer-2', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Aneka' },
  { id: 'adventurer-3', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Milo' },
  { id: 'adventurer-4', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Luna' },
  { id: 'adventurer-5', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Max' },
  { id: 'adventurer-6', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Zoe' },
  // Avataaars style
  { id: 'avataaars-1', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John' },
  { id: 'avataaars-2', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jane' },
  { id: 'avataaars-3', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bob' },
  { id: 'avataaars-4', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alice' },
  { id: 'avataaars-5', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Charlie' },
  { id: 'avataaars-6', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Diana' },
  // Bottts (Robot) style
  { id: 'bottts-1', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=Robot1' },
  { id: 'bottts-2', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=Robot2' },
  { id: 'bottts-3', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=Robot3' },
  { id: 'bottts-4', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=Robot4' },
  { id: 'bottts-5', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=Robot5' },
  { id: 'bottts-6', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=Robot6' },
  // Fun Emoji style
  { id: 'emoji-1', url: 'https://api.dicebear.com/7.x/fun-emoji/svg?seed=Happy' },
  { id: 'emoji-2', url: 'https://api.dicebear.com/7.x/fun-emoji/svg?seed=Cool' },
  { id: 'emoji-3', url: 'https://api.dicebear.com/7.x/fun-emoji/svg?seed=Smile' },
  { id: 'emoji-4', url: 'https://api.dicebear.com/7.x/fun-emoji/svg?seed=Star' },
  { id: 'emoji-5', url: 'https://api.dicebear.com/7.x/fun-emoji/svg?seed=Love' },
  { id: 'emoji-6', url: 'https://api.dicebear.com/7.x/fun-emoji/svg?seed=Wink' },
  // Lorelei style
  { id: 'lorelei-1', url: 'https://api.dicebear.com/7.x/lorelei/svg?seed=Anna' },
  { id: 'lorelei-2', url: 'https://api.dicebear.com/7.x/lorelei/svg?seed=Emma' },
  { id: 'lorelei-3', url: 'https://api.dicebear.com/7.x/lorelei/svg?seed=Lily' },
  { id: 'lorelei-4', url: 'https://api.dicebear.com/7.x/lorelei/svg?seed=Sophie' },
  { id: 'lorelei-5', url: 'https://api.dicebear.com/7.x/lorelei/svg?seed=Mia' },
  { id: 'lorelei-6', url: 'https://api.dicebear.com/7.x/lorelei/svg?seed=Chloe' },
  // Pixel Art style
  { id: 'pixel-1', url: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=Gamer1' },
  { id: 'pixel-2', url: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=Gamer2' },
  { id: 'pixel-3', url: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=Gamer3' },
  { id: 'pixel-4', url: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=Gamer4' },
  { id: 'pixel-5', url: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=Gamer5' },
  { id: 'pixel-6', url: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=Gamer6' },
];

export const AvatarSelector = ({ currentAvatar, onSelect, onClose }: AvatarSelectorProps) => {
  const [selected, setSelected] = useState<string | null>(currentAvatar);

  const handleConfirm = () => {
    if (selected) {
      onSelect(selected);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-2xl max-w-2xl w-full max-h-[80vh] flex flex-col border border-gray-700 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-xl font-bold text-white">Chọn Avatar</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-gray-400" />
          </button>
        </div>

        {/* Avatar Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-4 sm:grid-cols-6 gap-4">
            {AVATAR_STYLES.map((avatar) => (
              <button
                key={avatar.id}
                onClick={() => setSelected(avatar.url)}
                className={`relative aspect-square rounded-xl overflow-hidden border-3 transition-all hover:scale-105 ${
                  selected === avatar.url
                    ? 'border-emerald-400 ring-2 ring-emerald-400/50'
                    : 'border-gray-700 hover:border-gray-500'
                }`}
              >
                <img
                  src={avatar.url}
                  alt={avatar.id}
                  className="w-full h-full object-cover bg-gray-800"
                />
                {selected === avatar.url && (
                  <div className="absolute inset-0 bg-emerald-400/20 flex items-center justify-center">
                    <div className="w-6 h-6 bg-emerald-400 rounded-full flex items-center justify-center">
                      <Check className="w-4 h-4 text-gray-900" />
                    </div>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-700 flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 border border-gray-600 text-gray-300 rounded-xl font-semibold hover:bg-gray-800 transition-colors"
          >
            Hủy
          </button>
          <button
            onClick={handleConfirm}
            disabled={!selected}
            className="px-6 py-2.5 bg-emerald-400 hover:bg-emerald-500 text-gray-900 rounded-xl font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Xác nhận
          </button>
        </div>
      </div>
    </div>
  );
};
