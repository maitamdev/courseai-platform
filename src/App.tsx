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
