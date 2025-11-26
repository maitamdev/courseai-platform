import { BookOpen, CheckCircle, Coins, Sparkles, Zap } from 'lucide-react';
import { Lesson } from '../lib/supabase';

type LessonCardProps = {
  lesson: Lesson;
  completed: boolean;
  onClick: () => void;
};

const difficultyColors = {
  beginner: 'from-green-400 to-emerald-500',
  intermediate: 'from-yellow-400 to-orange-500',
  advanced: 'from-red-400 to-pink-500',
};

const difficultyBadgeColors = {
  beginner: 'bg-green-100 text-green-700 border-green-300',
  intermediate: 'bg-yellow-100 text-yellow-700 border-yellow-300',
  advanced: 'bg-red-100 text-red-700 border-red-300',
};

const difficultyText = {
  beginner: 'Cơ bản',
  intermediate: 'Trung bình',
  advanced: 'Nâng cao',
};

export const LessonCard = ({ lesson, completed, onClick }: LessonCardProps) => {
  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 border-2 border-transparent hover:border-blue-400 relative overflow-hidden group transform hover:scale-[1.02] animate-slide-up"
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${difficultyColors[lesson.difficulty]} opacity-0 group-hover:opacity-5 transition-opacity`}></div>

      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-500"></div>

      {completed && (
        <div className="absolute top-4 right-4 animate-bounce-in">
          <div className="relative">
            <CheckCircle className="w-7 h-7 text-green-500 drop-shadow-lg" />
            <Sparkles className="w-4 h-4 text-yellow-400 absolute -top-1 -right-1 animate-pulse" />
          </div>
        </div>
      )}

      <div className="flex items-start gap-4 relative z-10">
        <div className={`bg-gradient-to-br ${difficultyColors[lesson.difficulty]} p-4 rounded-xl group-hover:scale-110 transition-transform shadow-lg`}>
          <BookOpen className="w-7 h-7 text-white" />
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
              {lesson.title}
            </h3>
            <span className={`text-xs px-3 py-1 rounded-full font-semibold border-2 ${difficultyBadgeColors[lesson.difficulty]}`}>
              {difficultyText[lesson.difficulty]}
            </span>
          </div>

          <p className="text-gray-600 text-sm mb-4 leading-relaxed">
            {lesson.description}
          </p>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-yellow-500 text-white px-4 py-2 rounded-full shadow-md group-hover:shadow-lg transition-shadow">
              <Coins className="w-4 h-4" />
              <span className="text-sm font-bold">+{lesson.coins_reward} xu</span>
            </div>
            <div className="flex items-center gap-1 text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
              <Zap className="w-4 h-4" />
              <span className="text-xs font-semibold">+20 XP</span>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
    </button>
  );
};
