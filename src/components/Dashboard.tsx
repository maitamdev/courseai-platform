import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { AIAssistant } from './AIAssistant';
import { Header } from './Header';
import { Footer } from './Footer';
import { HomePage } from './HomePage';
import { Courses } from './Courses';
import { CoinPurchase } from './CoinPurchase';
import { GameCategories } from './GameCategories';
import { ProfilePage } from './ProfilePage';
import { TreasureQuestGame } from './TreasureQuestGame';
import { Friends } from './Friends';
import { Messages } from './Messages';

type Tab = 'home' | 'lessons' | 'games' | 'coins' | 'profile' | 'treasure-quest' | 'friends' | 'messages';

export const Dashboard = () => {
  useAuth(); // Keep auth context active
  
  const [activeTab, setActiveTab] = useState<Tab>(() => {
    try {
      const saved = localStorage.getItem('activeTab');
      return (saved as Tab) || 'home';
    } catch {
      return 'home';
    }
  });

  // Listen for tab change events from other components
  useEffect(() => {
    const handleTabChange = (e: CustomEvent) => {
      setActiveTab(e.detail as Tab);
    };
    window.addEventListener('changeTab', handleTabChange as EventListener);
    return () => window.removeEventListener('changeTab', handleTabChange as EventListener);
  }, []);

  // Save activeTab to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('activeTab', activeTab);
    } catch {
      // Ignore
    }
  }, [activeTab]);

  // Scroll restoration
  useEffect(() => {
    const scrollKey = `scroll-${activeTab}`;
    try {
      const saved = sessionStorage.getItem(scrollKey);
      if (saved) {
        requestAnimationFrame(() => window.scrollTo(0, parseInt(saved)));
      }
    } catch {}

    const saveScroll = () => {
      try {
        sessionStorage.setItem(scrollKey, window.scrollY.toString());
      } catch {}
    };

    let timeout: NodeJS.Timeout;
    const handleScroll = () => {
      clearTimeout(timeout);
      timeout = setTimeout(saveScroll, 100);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('beforeunload', saveScroll);
    
    return () => {
      clearTimeout(timeout);
      saveScroll();
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('beforeunload', saveScroll);
    };
  }, [activeTab]);

  return (
    <div className="min-h-screen">
      <Header activeTab={activeTab} onTabChange={setActiveTab} />

      <div className="transition-opacity duration-300">
        {activeTab === 'home' ? (
          <div className="animate-fadeIn">
            <HomePage onGetStarted={() => setActiveTab('lessons')} />
          </div>
        ) : (
          <main className="max-w-7xl mx-auto px-4 py-8 min-h-screen">
            {activeTab === 'lessons' && (
              <div key="lessons" className="animate-fadeIn">
                <Courses />
              </div>
            )}

            {activeTab === 'games' && (
              <div key="games" className="animate-fadeIn">
                <GameCategories onTreasureQuestClick={() => setActiveTab('treasure-quest')} />
              </div>
            )}

            {activeTab === 'treasure-quest' && (
              <div key="treasure-quest" className="animate-fadeIn">
                <TreasureQuestGame />
              </div>
            )}

            {activeTab === 'coins' && (
              <div key="coins" className="animate-fadeIn">
                <CoinPurchase />
              </div>
            )}

            {activeTab === 'profile' && (
              <div key="profile" className="animate-fadeIn">
                <ProfilePage />
              </div>
            )}

            {activeTab === 'friends' && (
              <div key="friends" className="animate-fadeIn">
                <Friends />
              </div>
            )}

            {activeTab === 'messages' && (
              <div key="messages" className="animate-fadeIn">
                <Messages />
              </div>
            )}

            <AIAssistant />
          </main>
        )}

        <Footer />
      </div>
    </div>
  );
};
