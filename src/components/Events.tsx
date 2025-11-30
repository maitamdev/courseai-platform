import { useState, useEffect, useRef } from 'react';
import {
  Trophy, Clock, Users, Play, CheckCircle, XCircle, Medal,
  Calendar, Timer, Award, ChevronRight, Loader2
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { supabase } from '../lib/supabase';

type Event = {
  id: string;
  title: string;
  description: string;
  event_type: string;
  status: 'upcoming' | 'active' | 'ended';
  start_time: string;
  end_time: string;
  duration_minutes: number;
  rewards: { [key: string]: number };
  banner_url?: string;
  participant_count?: number;
};

type Question = {
  id: string;
  question: string;
  options: string[];
  question_type: string;
  points: number;
  time_limit_seconds: number;
};

type LeaderboardEntry = {
  rank: number;
  user_id: string;
  username: string;
  full_name: string;
  avatar_url: string;
  score: number;
  correct_answers: number;
  time_taken_seconds: number;
};

export const Events = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [answerResult, setAnswerResult] = useState<{ is_correct: boolean; correct_answer: string } | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [myScore, setMyScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [questionStartTime, setQuestionStartTime] = useState(0);
  const [loading, setLoading] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    fetchEvents();
    const interval = setInterval(fetchEvents, 10000); // Refresh every 10s
    return () => clearInterval(interval);
  }, []);

  // Countdown timer for upcoming events
  useEffect(() => {
    const updateCountdowns = () => {
      events.forEach(event => {
        if (event.status === 'upcoming') {
          const diff = new Date(event.start_time).getTime() - Date.now();
          if (diff <= 0) {
            fetchEvents(); // Refresh to get updated status
          }
        }
      });
    };
    const interval = setInterval(updateCountdowns, 1000);
    return () => clearInterval(interval);
  }, [events]);

  // Question timer
  useEffect(() => {
    if (isPlaying && timeLeft > 0) {
      timerRef.current = setTimeout(() => setTimeLeft(t => t - 1), 1000);
    } else if (isPlaying && timeLeft === 0 && !answerResult) {
      handleSubmitAnswer(); // Auto submit when time runs out
    }
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [isPlaying, timeLeft, answerResult]);

  const fetchEvents = async () => {
    // Update event statuses first
    await supabase.rpc('update_event_status');
    
    const { data } = await supabase
      .from('events')
      .select('*')
      .order('start_time', { ascending: true });
    
    if (data) {
      // Get participant counts
      const eventsWithCounts = await Promise.all(data.map(async (event) => {
        const { count } = await supabase
          .from('event_participants')
          .select('*', { count: 'exact', head: true })
          .eq('event_id', event.id);
        return { ...event, participant_count: count || 0 };
      }));
      setEvents(eventsWithCounts);
    }
  };

  const fetchLeaderboard = async (eventId: string) => {
    const { data } = await supabase.rpc('get_event_leaderboard', { p_event_id: eventId });
    if (data) setLeaderboard(data);
  };

  const joinEvent = async (event: Event) => {
    if (!user) return;
    setLoading(true);
    
    try {
      // Join event
      await supabase.rpc('join_event', { p_event_id: event.id });
      
      // Fetch questions
      const { data: questionsData } = await supabase
        .from('event_questions')
        .select('*')
        .eq('event_id', event.id)
        .order('order_index');
      
      if (questionsData) {
        setQuestions(questionsData.map(q => ({
          ...q,
          options: typeof q.options === 'string' ? JSON.parse(q.options) : q.options
        })));
      }
      
      setSelectedEvent(event);
      setCurrentQuestionIndex(0);
      setMyScore(0);
      setIsFinished(false);
      setIsPlaying(true);
      setTimeLeft(questionsData?.[0]?.time_limit_seconds || 60);
      setQuestionStartTime(Date.now());
      setSelectedAnswer(null);
      setAnswerResult(null);
    } catch {
      alert('Không thể tham gia sự kiện');
    }
    setLoading(false);
  };


  const handleSubmitAnswer = async () => {
    if (!selectedEvent || !questions[currentQuestionIndex]) return;
    
    const timeTaken = Math.floor((Date.now() - questionStartTime) / 1000);
    const answer = selectedAnswer || '';
    
    try {
      const { data } = await supabase.rpc('submit_event_answer', {
        p_event_id: selectedEvent.id,
        p_question_id: questions[currentQuestionIndex].id,
        p_answer: answer,
        p_time_taken: timeTaken
      });
      
      if (data) {
        setAnswerResult(data);
        setMyScore(prev => prev + (data.points_earned || 0));
      }
    } catch {}
    
    // Clear timer
    if (timerRef.current) clearTimeout(timerRef.current);
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setAnswerResult(null);
      setTimeLeft(questions[currentQuestionIndex + 1]?.time_limit_seconds || 60);
      setQuestionStartTime(Date.now());
    } else {
      finishEvent();
    }
  };

  const finishEvent = async () => {
    if (!selectedEvent) return;
    
    try {
      await supabase.rpc('finish_event', { p_event_id: selectedEvent.id });
    } catch {}
    
    setIsPlaying(false);
    setIsFinished(true);
    fetchLeaderboard(selectedEvent.id);
  };

  const viewLeaderboard = async (event: Event) => {
    setSelectedEvent(event);
    setIsPlaying(false);
    setIsFinished(true);
    await fetchLeaderboard(event.id);
  };

  const backToEvents = () => {
    setSelectedEvent(null);
    setIsPlaying(false);
    setIsFinished(false);
    setQuestions([]);
    setLeaderboard([]);
  };

  const formatCountdown = (targetTime: string) => {
    const diff = new Date(targetTime).getTime() - Date.now();
    if (diff <= 0) return 'Đang diễn ra';
    
    const hours = Math.floor(diff / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    
    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days} ngày`;
    }
    if (hours > 0) return `${hours}h ${minutes}m`;
    if (minutes > 0) return `${minutes}m ${seconds}s`;
    return `${seconds}s`;
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'upcoming': return 'bg-emerald-500';
      case 'ended': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Đang diễn ra';
      case 'upcoming': return 'Sắp diễn ra';
      case 'ended': return 'Đã kết thúc';
      default: return status;
    }
  };

  // Playing quiz view
  if (isPlaying && selectedEvent && questions.length > 0) {
    const currentQuestion = questions[currentQuestionIndex];
    
    return (
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-4 mb-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white">{selectedEvent.title}</h2>
              <p className="text-gray-400">Câu {currentQuestionIndex + 1}/{questions.length}</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-emerald-400">{myScore}</div>
                <div className="text-xs text-gray-400">Điểm</div>
              </div>
              <div className={`text-center px-4 py-2 rounded-xl ${timeLeft <= 10 ? 'bg-red-500/20 text-red-400' : 'bg-gray-700'}`}>
                <div className="text-2xl font-bold">{timeLeft}</div>
                <div className="text-xs text-gray-400">Giây</div>
              </div>
            </div>
          </div>
          {/* Progress bar */}
          <div className="mt-4 h-2 bg-gray-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-emerald-400 to-green-500 transition-all"
              style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Question */}
        <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-8 border border-gray-700">
          <div className="flex items-center gap-2 mb-4">
            <span className="px-3 py-1 bg-emerald-400/20 text-emerald-400 rounded-full text-sm font-medium">
              +{currentQuestion.points} điểm
            </span>
          </div>
          
          <h3 className="text-2xl font-bold text-white mb-8">{currentQuestion.question}</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentQuestion.options?.map((option, idx) => {
              const isSelected = selectedAnswer === option;
              const isCorrect = answerResult?.correct_answer === option;
              const isWrong = answerResult && isSelected && !answerResult.is_correct;
              
              let bgClass = 'bg-gray-700/50 hover:bg-gray-700 border-gray-600';
              if (answerResult) {
                if (isCorrect) bgClass = 'bg-green-500/20 border-green-500';
                else if (isWrong) bgClass = 'bg-red-500/20 border-red-500';
              } else if (isSelected) {
                bgClass = 'bg-emerald-400/20 border-emerald-400';
              }
              
              return (
                <button
                  key={idx}
                  onClick={() => !answerResult && setSelectedAnswer(option)}
                  disabled={!!answerResult}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${bgClass}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center text-white font-bold">
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span className="text-white font-medium">{option}</span>
                    {answerResult && isCorrect && <CheckCircle className="w-5 h-5 text-green-400 ml-auto" />}
                    {isWrong && <XCircle className="w-5 h-5 text-red-400 ml-auto" />}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Action buttons */}
          <div className="mt-8 flex justify-center gap-4">
            {!answerResult ? (
              <button
                onClick={handleSubmitAnswer}
                disabled={!selectedAnswer}
                className="px-8 py-3 bg-gradient-to-r from-emerald-400 to-green-500 text-gray-900 rounded-xl font-bold disabled:opacity-50 hover:opacity-90 transition-all"
              >
                Xác nhận
              </button>
            ) : (
              <button
                onClick={nextQuestion}
                className="px-8 py-3 bg-gradient-to-r from-green-400 to-emerald-500 text-gray-900 rounded-xl font-bold hover:opacity-90 transition-all flex items-center gap-2"
              >
                {currentQuestionIndex < questions.length - 1 ? 'Câu tiếp theo' : 'Xem kết quả'}
                <ChevronRight className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }


  // Finished / Leaderboard view
  if (isFinished && selectedEvent) {
    return (
      <div className="max-w-4xl mx-auto">
        <button onClick={backToEvents} className="mb-6 text-gray-400 hover:text-white flex items-center gap-2">
          ← Quay lại danh sách
        </button>

        {/* Result card */}
        <div className="bg-gradient-to-br from-emerald-400/20 to-green-500/20 backdrop-blur-lg rounded-2xl p-8 mb-6 border border-emerald-400/30 text-center">
          <Trophy className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-white mb-2">Hoàn thành!</h2>
          <p className="text-gray-300 mb-4">{selectedEvent.title}</p>
          <div className="text-5xl font-black text-emerald-400 mb-2">{myScore}</div>
          <p className="text-gray-400">điểm</p>
        </div>

        {/* Leaderboard */}
        <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-6 border border-gray-700">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <Medal className="w-6 h-6 text-emerald-400" />
            Bảng xếp hạng
          </h3>
          
          {leaderboard.length === 0 ? (
            <p className="text-center text-gray-400 py-8">Chưa có người tham gia</p>
          ) : (
            <div className="space-y-3">
              {leaderboard.map((entry, idx) => {
                const isMe = entry.user_id === user?.id;
                const medalColors = ['text-emerald-400', 'text-gray-300', 'text-green-400'];
                
                return (
                  <div
                    key={entry.user_id}
                    className={`flex items-center gap-4 p-4 rounded-xl ${
                      isMe ? 'bg-emerald-400/10 border border-emerald-400/30' : 'bg-gray-700/30'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                      idx < 3 ? 'bg-gradient-to-br from-emerald-400 to-green-500 text-gray-900' : 'bg-gray-700 text-white'
                    }`}>
                      {idx < 3 ? <Medal className={`w-5 h-5 ${medalColors[idx]}`} /> : entry.rank}
                    </div>
                    
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600">
                      {entry.avatar_url ? (
                        <img src={entry.avatar_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-white font-bold">
                          {entry.username?.[0]?.toUpperCase()}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <div className="font-bold text-white">{entry.full_name || entry.username}</div>
                      <div className="text-sm text-gray-400">
                        {entry.correct_answers} câu đúng • {formatTime(entry.time_taken_seconds)}
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-xl font-bold text-emerald-400">{entry.score}</div>
                      <div className="text-xs text-gray-400">điểm</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Events list view
  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-black text-white mb-2 flex items-center gap-3">
          <Trophy className="w-10 h-10 text-emerald-400" />
          Sự kiện thi đấu
        </h1>
        <p className="text-gray-400">Tham gia các cuộc thi để giành phần thưởng hấp dẫn!</p>
      </div>

      {/* Active events */}
      {events.filter(e => e.status === 'active').length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-bold text-green-400 mb-4 flex items-center gap-2">
            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
            Đang diễn ra
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            {events.filter(e => e.status === 'active').map(event => (
              <div key={event.id} className="bg-gradient-to-br from-green-500/20 to-emerald-500/10 backdrop-blur-lg rounded-2xl p-6 border border-green-500/30">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <span className={`px-3 py-1 ${getStatusColor(event.status)} text-white text-xs font-bold rounded-full`}>
                      {getStatusText(event.status)}
                    </span>
                    <h3 className="text-xl font-bold text-white mt-2">{event.title}</h3>
                    <p className="text-gray-400 text-sm mt-1">{event.description}</p>
                  </div>
                  <Trophy className="w-12 h-12 text-green-400" />
                </div>
                
                <div className="flex items-center gap-4 text-sm text-gray-400 mb-4">
                  <span className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {event.participant_count} người tham gia
                  </span>
                  <span className="flex items-center gap-1">
                    <Timer className="w-4 h-4" />
                    {event.duration_minutes} phút
                  </span>
                </div>

                <div className="flex items-center gap-2 mb-4">
                  <Award className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-400 text-sm">
                    Top 1: {event.rewards?.['1']} xu | Top 2: {event.rewards?.['2']} xu | Top 3: {event.rewards?.['3']} xu
                  </span>
                </div>
                
                <button
                  onClick={() => joinEvent(event)}
                  disabled={loading}
                  className="w-full py-3 bg-gradient-to-r from-green-400 to-emerald-500 text-gray-900 rounded-xl font-bold hover:opacity-90 transition-all flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Play className="w-5 h-5" />}
                  Tham gia ngay
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upcoming events */}
      {events.filter(e => e.status === 'upcoming').length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-bold text-emerald-400 mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Sắp diễn ra
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {events.filter(e => e.status === 'upcoming').map(event => (
              <div key={event.id} className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-6 border border-gray-700 hover:border-emerald-400/50 transition-all">
                <span className={`px-3 py-1 ${getStatusColor(event.status)} text-white text-xs font-bold rounded-full`}>
                  {getStatusText(event.status)}
                </span>
                <h3 className="text-lg font-bold text-white mt-3">{event.title}</h3>
                <p className="text-gray-400 text-sm mt-1 line-clamp-2">{event.description}</p>
                
                <div className="mt-4 p-3 bg-emerald-400/10 rounded-xl">
                  <div className="flex items-center gap-2 text-emerald-400">
                    <Clock className="w-4 h-4" />
                    <span className="font-bold">{formatCountdown(event.start_time)}</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(event.start_time).toLocaleString('vi-VN')}
                  </p>
                </div>

                <div className="mt-4 text-sm text-gray-400">
                  <Award className="w-4 h-4 inline mr-1 text-emerald-400" />
                  Top 1: {event.rewards?.['1']} xu
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Ended events */}
      {events.filter(e => e.status === 'ended').length > 0 && (
        <div>
          <h2 className="text-xl font-bold text-gray-400 mb-4">Đã kết thúc</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {events.filter(e => e.status === 'ended').map(event => (
              <div key={event.id} className="bg-gray-800/30 backdrop-blur-lg rounded-2xl p-6 border border-gray-700/50">
                <span className={`px-3 py-1 ${getStatusColor(event.status)} text-white text-xs font-bold rounded-full`}>
                  {getStatusText(event.status)}
                </span>
                <h3 className="text-lg font-bold text-gray-300 mt-3">{event.title}</h3>
                <p className="text-gray-500 text-sm mt-1">{event.participant_count} người đã tham gia</p>
                
                <button
                  onClick={() => viewLeaderboard(event)}
                  className="mt-4 w-full py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-xl font-medium transition-all"
                >
                  Xem bảng xếp hạng
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {events.length === 0 && (
        <div className="text-center py-16">
          <Trophy className="w-20 h-20 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-400">Chưa có sự kiện nào</h3>
          <p className="text-gray-500">Hãy quay lại sau để tham gia các cuộc thi!</p>
        </div>
      )}
    </div>
  );
};
