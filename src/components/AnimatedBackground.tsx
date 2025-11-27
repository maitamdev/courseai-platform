export const AnimatedBackground = () => {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Animated Shapes */}
      <div className="absolute w-32 h-32 border-4 border-green-400/30 rounded-lg animate-float-slow top-20 left-10 rotate-12"></div>
      <div className="absolute w-24 h-24 border-4 border-cyan-400/30 rounded-full animate-float-medium top-40 right-20"></div>
      <div className="absolute w-40 h-40 border-4 border-pink-400/30 rounded-lg animate-float-fast bottom-32 left-1/4 -rotate-12"></div>
      <div className="absolute w-20 h-20 border-4 border-yellow-400/30 rounded-full animate-float-slow bottom-20 right-1/3"></div>
      <div className="absolute w-28 h-28 border-4 border-orange-400/30 rounded-lg animate-float-medium top-1/3 right-1/4 rotate-45"></div>
      <div className="absolute w-16 h-16 border-4 border-blue-400/30 rounded-full animate-float-fast top-2/3 left-1/3"></div>
      <div className="absolute w-36 h-36 border-4 border-purple-400/30 rounded-lg animate-float-slow top-1/2 right-10 -rotate-6"></div>
      <div className="absolute w-24 h-24 border-4 border-green-400/30 rounded-full animate-float-medium bottom-40 left-1/2"></div>
      
      {/* Gradient Orbs */}
      <div className="absolute w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse-slow top-0 left-0"></div>
      <div className="absolute w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse-slow bottom-0 right-0 animation-delay-2000"></div>
      <div className="absolute w-96 h-96 bg-pink-500/20 rounded-full blur-3xl animate-pulse-slow top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animation-delay-4000"></div>
    </div>
  );
};

