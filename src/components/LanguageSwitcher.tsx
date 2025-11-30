import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { Globe } from 'lucide-react';

interface LanguageSwitcherProps {
  className?: string;
  showLabel?: boolean;
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ 
  className = '', 
  showLabel = false 
}) => {
  const { language, setLanguage } = useLanguage();

  const toggleLanguage = () => {
    setLanguage(language === 'vi' ? 'en' : 'vi');
  };

  return (
    <button
      onClick={toggleLanguage}
      className={`flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700/50 transition-all duration-200 ${className}`}
      title={language === 'vi' ? 'Switch to English' : 'Chuyển sang Tiếng Việt'}
    >
      <Globe className="w-4 h-4 text-blue-400" />
      <span className="font-medium text-sm">
        {language === 'vi' ? '🇻🇳 VI' : '🇺🇸 EN'}
      </span>
      {showLabel && (
        <span className="text-xs text-gray-400 hidden sm:inline">
          {language === 'vi' ? 'Tiếng Việt' : 'English'}
        </span>
      )}
    </button>
  );
};

export default LanguageSwitcher;
