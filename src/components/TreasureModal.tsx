import { useState } from 'react';
import { X, MapPin, Coins, AlertCircle } from 'lucide-react';
import { Treasure } from '../lib/supabase';

type TreasureModalProps = {
  treasure: Treasure;
  onClose: () => void;
  onSolve: (answer: string) => Promise<boolean>;
};

export const TreasureModal = ({ treasure, onClose, onSolve }: TreasureModalProps) => {
  const [answer, setAnswer] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!answer.trim()) return;

    setSubmitting(true);
    setError('');

    try {
      const isCorrect = await onSolve(answer.trim());
      if (!isCorrect) {
        setError('Câu trả lời chưa đúng. Hãy thử lại!');
      }
    } catch (err) {
      setError('Có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-lg w-full">
        <div className="bg-gradient-to-r from-orange-400 to-pink-500 p-6 rounded-t-2xl text-white">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-3">
              <MapPin className="w-8 h-8" />
              <h2 className="text-2xl font-bold">Tìm kho báu</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="bg-white bg-opacity-20 rounded-lg p-4">
            <p className="text-sm mb-1 opacity-90">Phần thưởng</p>
            <div className="flex items-center gap-2 text-lg font-bold">
              <Coins className="w-6 h-6" />
              <span>+{treasure.coins_reward} xu</span>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Câu đố:</h3>
            <div className="bg-gray-50 rounded-lg p-4 border-l-4 border-orange-500">
              <p className="text-gray-700 italic leading-relaxed">
                "{treasure.riddle}"
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Câu trả lời của bạn:
              </label>
              <input
                type="text"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Nhập câu trả lời..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                autoFocus
              />
            </div>

            {error && (
              <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={!answer.trim() || submitting}
              className="w-full bg-gradient-to-r from-orange-500 to-pink-500 text-white py-3 rounded-lg font-medium hover:from-orange-600 hover:to-pink-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Đang kiểm tra...' : 'Mở kho báu'}
            </button>
          </form>

          <div className="text-center">
            <p className="text-sm text-gray-500">
              💡 Gợi ý: Câu trả lời liên quan đến lập trình
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
