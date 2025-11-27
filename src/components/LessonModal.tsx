import { useState } from 'react';
import { X, Lightbulb, Code, Target, Coins, CheckCircle } from 'lucide-react';
import { Lesson } from '../lib/supabase';

type LessonModalProps = {
  lesson: Lesson;
  onClose: () => void;
  onComplete: (code: string) => Promise<void>;
  completed: boolean;
};

export const LessonModal = ({ lesson, onClose, onComplete, completed }: LessonModalProps) => {
  const [code, setCode] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!code.trim() || completed) return;

    setSubmitting(true);
    try {
      await onComplete(code);
    } catch (error) {
      console.error('Error submitting:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">
              {lesson.title}
            </h2>
            <p className="text-gray-300">{lesson.description}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="bg-blue-50 rounded-xl p-5">
            <div className="flex items-start gap-3">
              <Lightbulb className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-white mb-2">Lý thuyết</h3>
                <p className="text-gray-300 leading-relaxed">
                  {lesson.content.theory}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl p-5">
            <div className="flex items-start gap-3">
              <Code className="w-6 h-6 text-gray-300 flex-shrink-0 mt-1" />
              <div className="flex-1">
                <h3 className="font-semibold text-white mb-2">Ví dụ</h3>
                <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm font-mono">
                  {lesson.content.example}
                </pre>
              </div>
            </div>
          </div>

          <div className="bg-orange-50 rounded-xl p-5">
            <div className="flex items-start gap-3">
              <Target className="w-6 h-6 text-orange-600 flex-shrink-0 mt-1" />
              <div className="flex-1">
                <h3 className="font-semibold text-white mb-2">Thử thách</h3>
                <p className="text-gray-300 mb-4">
                  {lesson.content.challenge}
                </p>

                <textarea
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  disabled={completed}
                  placeholder="Viết code của bạn ở đây..."
                  className="w-full h-32 bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm resize-none focus:ring-2 focus:ring-orange-500 focus:outline-none disabled:opacity-50"
                />

                {completed ? (
                  <div className="mt-4 flex items-center gap-2 text-green-600 font-medium">
                    <CheckCircle className="w-5 h-5" />
                    <span>Bạn đã hoàn thành bài học này!</span>
                  </div>
                ) : (
                  <button
                    onClick={handleSubmit}
                    disabled={!code.trim() || submitting}
                    className="mt-4 w-full bg-orange-600 text-white py-3 rounded-lg font-medium hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <Coins className="w-5 h-5" />
                    {submitting ? 'Đang gửi...' : `Hoàn thành (+${lesson.coins_reward} xu)`}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

