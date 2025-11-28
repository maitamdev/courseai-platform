import { useEffect, useState } from 'react';
import { useAuth } from './contexts/AuthContext';
import { Auth } from './components/Auth';
import { Dashboard } from './components/Dashboard';
import { AnimatedBackground } from './components/AnimatedBackground';
import { ResetPassword } from './components/ResetPassword';

function App() {
  const { user, loading } = useAuth();
  const [isResetPassword, setIsResetPassword] = useState(false);

  useEffect(() => {
    // Check if URL contains reset password hash
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const type = hashParams.get('type');
    
    if (type === 'recovery') {
      setIsResetPassword(true);
    }
  }, []);

  // Global scroll restoration - persist across ALL events
  useEffect(() => {
    const SCROLL_KEY = 'app-scroll-position';
    
    const getStorage = (key: string) => {
      try { return sessionStorage.getItem(key); } catch { return null; }
    };
    const setStorage = (key: string, value: string) => {
      try { sessionStorage.setItem(key, value); } catch {}
    };
    
    // Restore scroll on mount
    const savedScroll = getStorage(SCROLL_KEY);
    if (savedScroll) {
      const scrollY = parseInt(savedScroll);
      // Multiple attempts to restore scroll
      setTimeout(() => window.scrollTo(0, scrollY), 0);
      setTimeout(() => window.scrollTo(0, scrollY), 50);
      setTimeout(() => window.scrollTo(0, scrollY), 100);
      setTimeout(() => window.scrollTo(0, scrollY), 200);
    }

    // Save scroll position continuously
    const saveScroll = () => {
      setStorage(SCROLL_KEY, window.scrollY.toString());
    };

    let scrollTimer: NodeJS.Timeout;
    const handleScroll = () => {
      clearTimeout(scrollTimer);
      scrollTimer = setTimeout(saveScroll, 50);
    };

    const handleVisibilityChange = () => {
      saveScroll();
    };

    const handleBlur = () => {
      saveScroll();
    };

    const handleFocus = () => {
      // Restore scroll when window regains focus
      const saved = getStorage(SCROLL_KEY);
      if (saved) {
        setTimeout(() => window.scrollTo(0, parseInt(saved)), 0);
      }
    };

    const handleBeforeUnload = () => {
      saveScroll();
    };

    // Add all listeners
    window.addEventListener('scroll', handleScroll, { passive: true });
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    // Save every 1 second as backup
    const interval = setInterval(saveScroll, 1000);

    return () => {
      clearTimeout(scrollTimer);
      clearInterval(interval);
      saveScroll();
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  if (loading) {
    return (
      <>
        <AnimatedBackground />
        <div className="min-h-screen flex items-center justify-center relative z-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
            <p className="text-gray-200">Đang tải...</p>
          </div>
        </div>
      </>
    );
  }

  // Show reset password page if user clicked reset link
  if (isResetPassword) {
    return (
      <>
        <AnimatedBackground />
        <div className="relative z-10">
          <ResetPassword />
        </div>
      </>
    );
  }

  return (
    <>
      <AnimatedBackground />
      <div className="relative z-10">
        {user ? <Dashboard /> : <Auth />}
      </div>
    </>
  );
}

export default App;
