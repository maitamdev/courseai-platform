import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

// Hook to save and restore scroll position
export function useScrollRestoration() {
  const location = useLocation();
  const scrollPositions = useRef<{ [key: string]: number }>({});

  useEffect(() => {
    // Save current scroll position before leaving
    const saveScrollPosition = () => {
      scrollPositions.current[location.pathname] = window.scrollY;
    };

    // Restore scroll position when entering
    const restoreScrollPosition = () => {
      const savedPosition = scrollPositions.current[location.pathname];
      if (savedPosition !== undefined) {
        // Use setTimeout to ensure DOM is ready
        setTimeout(() => {
          window.scrollTo(0, savedPosition);
        }, 0);
      }
    };

    restoreScrollPosition();

    // Save on scroll
    window.addEventListener('scroll', saveScrollPosition);
    
    return () => {
      window.removeEventListener('scroll', saveScrollPosition);
      saveScrollPosition(); // Save before unmount
    };
  }, [location.pathname]);
}

// Alternative: Save to sessionStorage for persistence across page reloads
export function useScrollRestorationWithStorage(key: string) {
  useEffect(() => {
    // Restore scroll position
    const savedPosition = sessionStorage.getItem(`scroll-${key}`);
    if (savedPosition) {
      setTimeout(() => {
        window.scrollTo(0, parseInt(savedPosition));
      }, 0);
    }

    // Save scroll position
    const handleScroll = () => {
      sessionStorage.setItem(`scroll-${key}`, window.scrollY.toString());
    };

    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      handleScroll(); // Save before unmount
    };
  }, [key]);
}
