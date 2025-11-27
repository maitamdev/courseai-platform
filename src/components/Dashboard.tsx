import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, Lesson, UserProgress, Treasure, FoundTreasure, PurchasedCourse } from '../lib/supabase';
import { LessonCard } from './LessonCard';
import { LessonModal } from './LessonModal';
import { TreasureModal } from './TreasureModal';
import { TreasureMap } from './TreasureMap';
import { Shop } from './Shop';
import { Roadmap } from './Roadmap';
import { ProfileStats } from './ProfileStats';
import { AIAssistant } from './AIAssistant';
import { Header } from './Header';
import { Footer } from './Footer';
import { HomePage } from './HomePage';
import { CoursesByLanguage } from './CoursesByLanguage';
import { CourseDetail } from './CourseDetail';
import { CoinPurchase } from './CoinPurchase';
import { GameCategories } from './GameCategories';
import { ProfilePage } from './ProfilePage';
import { CourseRoadmap } from './CourseRoadmap';
import { TreasureQuestGame } from './TreasureQuestGame';
import { Friends } from './Friends';

type Tab = 'home' | 'lessons' | 'games' | 'coins' | 'roadmap' | 'profile' | 'course-roadmap' | 'treasure-quest' | 'friends';

export const Dashboard = () => {
  const { user, profile, refreshProfile } = useAuth();
  // Lưu và khôi phục tab từ localStorage
  const [activeTab, setActiveTab] = useState<Tab>(() => {
    const saved = localStorage.getItem('activeTab');
    return (saved as Tab) || 'home';
  });
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [userProgress, setUserProgress] = useState<UserProgress[]>([]);
  const [treasures, setTreasures] = useState<Treasure[]>([]);
  const [foundTreasures, setFoundTreasures] = useState<FoundTreasure[]>([]);
  const [purchasedCourses, setPurchasedCourses] = useState<PurchasedCourse[]>([]);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [selectedTreasure, setSelectedTreasure] = useState<Treasure | null>(null);
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [selectedGameLevel, setSelectedGameLevel] = useState<any>(null);
  const [roadmapCourseId, setRoadmapCourseId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const [lessonsRes, progressRes, treasuresRes, foundRes, purchasedRes] = await Promise.all([
        supabase.from('lessons').select('*').order('order_index'),
        supabase.from('user_progress').select('*').eq('user_id', user.id),
        supabase.from('treasures').select('*').order('map_x'),
        supabase.from('found_treasures').select('*').eq('user_id', user.id),
        supabase.from('purchased_courses').select('*').eq('user_id', user.id),
      ]);

      if (lessonsRes.data) setLessons(lessonsRes.data);
      if (progressRes.data) setUserProgress(progressRes.data);
      if (treasuresRes.data) setTreasures(treasuresRes.data);
      if (foundRes.data) setFoundTreasures(foundRes.data);
      if (purchasedRes.data) setPurchasedCourses(purchasedRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  // Lưu activeTab vào localStorage khi thay đổi
  useEffect(() => {
    localStorage.setItem('activeTab', activeTab);
  }, [activeTab]);

  const isLessonCompleted = (lessonId: string) => {
    return userProgress.some((p) => p.lesson_id === lessonId && p.completed);
  };

  const isTreasureFound = (treasureId: string) => {
    return foundTreasures.some((f) => f.treasure_id === treasureId);
  };

  const handleCompleteLesson = async (code: string) => {
    if (!user || !selectedLesson || !profile) return;

    const isAlreadyCompleted = isLessonCompleted(selectedLesson.id);
    const xpReward = isAlreadyCompleted ? 0 : 20;
    const coinsReward = isAlreadyCompleted ? 0 : selectedLesson.coins_reward;

    const { error } = await supabase.from('user_progress').upsert({
      user_id: user.id,
      lesson_id: selectedLesson.id,
      completed: true,
      code_solution: code,
      completed_at: new Date().toISOString(),
    });

    if (error) {
      console.error('Error completing lesson:', error);
      return;
    }

    if (!isAlreadyCompleted) {
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          total_coins: profile.total_coins + coinsReward,
          xp: profile.xp + xpReward,
          level: Math.floor((profile.xp + xpReward) / 100) + 1,
        })
        .eq('id', user.id);

      if (profileError) {
        console.error('Error updating profile:', profileError);
      }

      await checkAndAwardBadges();
    }

    await Promise.all([fetchData(), refreshProfile()]);
    setSelectedLesson(null);
  };

  const handleSolveTreasure = async (answer: string): Promise<boolean> => {
    if (!user || !selectedTreasure || !profile) return false;

    if (answer.toLowerCase() !== selectedTreasure.answer.toLowerCase()) {
      return false;
    }

    const { error } = await supabase.from('found_treasures').insert({
      user_id: user.id,
      treasure_id: selectedTreasure.id,
    });

    if (error) {
      console.error('Error recording found treasure:', error);
      return false;
    }

    const xpReward = 30;
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        total_coins: profile.total_coins + selectedTreasure.coins_reward,
        xp: profile.xp + xpReward,
        level: Math.floor((profile.xp + xpReward) / 100) + 1,
      })
      .eq('id', user.id);

    if (profileError) {
      console.error('Error updating coins:', profileError);
    }

    await checkAndAwardBadges();
    await Promise.all([fetchData(), refreshProfile()]);
    setSelectedTreasure(null);
    return true;
  };

  const checkAndAwardBadges = async () => {
    if (!user) return;

    const completedCount = userProgress.filter((p) => p.completed).length + 1;
    const treasuresCount = foundTreasures.length + 1;
    const purchasedCount = purchasedCourses.length;
    const currentXP = profile?.xp || 0;

    const badges = await supabase.from('badges').select('*');
    const userBadges = await supabase.from('user_badges').select('badge_id').eq('user_id', user.id);

    if (!badges.data || !userBadges.data) return;

    const earnedBadgeIds = new Set(userBadges.data.map((ub) => ub.badge_id));

    for (const badge of badges.data) {
      if (earnedBadgeIds.has(badge.id)) continue;

      let shouldAward = false;

      if (badge.requirement_type === 'lessons_completed' && completedCount >= badge.requirement_value) {
        shouldAward = true;
      } else if (badge.requirement_type === 'treasures_found' && treasuresCount >= badge.requirement_value) {
        shouldAward = true;
      } else if (badge.requirement_type === 'xp_reached' && currentXP >= badge.requirement_value) {
        shouldAward = true;
      } else if (badge.requirement_type === 'courses_purchased' && purchasedCount >= badge.requirement_value) {
        shouldAward = true;
      }

      if (shouldAward) {
        await supabase.from('user_badges').insert({
          user_id: user.id,
          badge_id: badge.id,
        });
      }
    }
  };

  const completedLessonsCount = userProgress.filter((p) => p.completed).length;
  const foundTreasuresCount = foundTreasures.length;
  const purchasedCoursesCount = purchasedCourses.length;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
        <div className="text-center relative z-10">
          <div className="relative w-16 h-16 mx-auto mb-4">
            <div className="absolute inset-0 border-4 border-white/30 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-t-white rounded-full animate-spin"></div>
          </div>
          <p className="text-white text-lg font-semibold animate-pulse">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header activeTab={activeTab} onTabChange={setActiveTab} />

      <div className="transition-all duration-300">
        {activeTab === 'home' ? (
          <div className="animate-fade-in-up">
            <HomePage onGetStarted={() => setActiveTab('lessons')} />
          </div>
        ) : (
          <main className="max-w-7xl mx-auto px-4 py-8 min-h-screen">
            {activeTab === 'lessons' && (
              <div key="lessons" className="animate-fade-in-up">
                <CoursesByLanguage onCourseSelect={(courseId) => {
                  setRoadmapCourseId(courseId);
                  setActiveTab('course-roadmap');
                }} />
              </div>
            )}

          {activeTab === 'course-roadmap' && roadmapCourseId && (
            <div key="course-roadmap" className="animate-fade-in-up">
              <CourseRoadmap 
                courseId={roadmapCourseId} 
                onLessonSelect={(lessonId) => {
                  console.log('Open lesson:', lessonId);
                }}
              />
            </div>
          )}

          {activeTab === 'games' && (
            <div key="games" className="animate-fade-in-up">
              <GameCategories 
                onLevelSelect={setSelectedGameLevel}
                onTreasureQuestClick={() => setActiveTab('treasure-quest')}
              />
            </div>
          )}

          {activeTab === 'treasure-quest' && (
            <div key="treasure-quest" className="animate-fade-in-up">
              <TreasureQuestGame />
            </div>
          )}

          {activeTab === 'coins' && (
            <div key="coins" className="animate-fade-in-up">
              <CoinPurchase />
            </div>
          )}

          {activeTab === 'roadmap' && (
            <div key="roadmap" className="animate-fade-in-up">
              <Roadmap onCourseSelect={(courseId) => {
                setRoadmapCourseId(courseId);
                setActiveTab('course-roadmap');
              }} />
            </div>
          )}

          {activeTab === 'profile' && (
            <div key="profile" className="animate-fade-in-up">
              <ProfilePage onCourseSelect={(courseId) => {
                setRoadmapCourseId(courseId);
                setActiveTab('course-roadmap');
              }} />
            </div>
          )}

          {activeTab === 'friends' && (
            <div key="friends" className="animate-fade-in-up">
              <Friends />
            </div>
          )}

          {selectedCourseId && (
            <CourseDetail
              courseId={selectedCourseId}
              onClose={() => setSelectedCourseId(null)}
            />
          )}

          {selectedLesson && (
            <LessonModal
              lesson={selectedLesson}
              completed={isLessonCompleted(selectedLesson.id)}
              onClose={() => setSelectedLesson(null)}
              onComplete={handleCompleteLesson}
            />
          )}

          {selectedTreasure && (
            <TreasureModal
              treasure={selectedTreasure}
              onClose={() => setSelectedTreasure(null)}
              onSolve={handleSolveTreasure}
            />
          )}

            <AIAssistant />
          </main>
        )}

        <Footer />
      </div>
    </div>
  );
};

