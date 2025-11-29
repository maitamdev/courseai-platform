import { useState, useEffect, useRef } from 'react';
import { Search, X, BookOpen, Users, Gamepad2, FileText, Clock, ArrowRight } from 'lucide-react';

type SearchResult = {
  id: string;
  type: 'course' | 'user' | 'game' | 'post';
  title: string;
  subtitle?: string;
  icon: any;
};

type SearchModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (tab: string, data?: any) => void;
};

export const SearchModal = ({ isOpen, onClose, onNavigate }: SearchModalProps) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
      const saved = localStorage.getItem('recentSearches');
      if (saved) setRecentSearches(JSON.parse(saved));
    }
  }, [isOpen]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    setIsSearching(true);
    const timer = setTimeout(() => {
      // Mock search results
      const mockResults: SearchResult[] = [
        { id: '1', type: 'course', title: 'Python cơ bản', subtitle: '20 bài học', icon: BookOpen },
        { id: '2', type: 'course', title: 'JavaScript nâng cao', subtitle: '15 bài học', icon: BookOpen },
        { id: '3', type: 'game', title: 'Code Hero Adventure', subtitle: '30 màn chơi', icon: Gamepad2 },
        { id: '4', type: 'user', title: 'MaiTamDev', subtitle: 'Level 10', icon: Users },
      ].filter(r => r.title.toLowerCase().includes(query.toLowerCase()));
      
      setResults(mockResults);
      setIsSearching(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSearch = (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    
    // Save to recent
    const updated = [searchQuery, ...recentSearches.filter(s => s !== searchQuery)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('recentSearches', JSON.stringify(updated));
  };

  const handleResultClick = (result: SearchResult) => {
    handleSearch(result.title);
    onClose();
    
    switch (result.type) {
      case 'course': onNavigate('lessons'); break;
      case 'game': onNavigate('games'); break;
      case 'user': onNavigate('friends'); break;
      case 'post': onNavigate('social'); break;
    }
  };

  const clearRecent = () => {
    setRecentSearches([]);
    localStorage.removeItem('recentSearches');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-start justify-center pt-20 px-4">
      <div className="w-full max-w-2xl bg-gray-900 rounded-2xl border border-gray-700 shadow-2xl overflow-hidden">
        {/* Search Input */}
        <div className="flex items-center gap-3 p-4 border-b border-gray-700">
          <Search className="w-5 h-5 text-gray-400" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tìm kiếm khóa học, game, bạn bè..."
            className="flex-1 bg-transparent text-white placeholder-gray-500 focus:outline-none"
          />
          {query && (
            <button onClick={() => setQuery('')} className="p-1 hover:bg-gray-700 rounded">
              <X className="w-4 h-4 text-gray-400" />
            </button>
          )}
          <button onClick={onClose} className="px-3 py-1 text-sm text-gray-400 hover:text-white">
            ESC
          </button>
        </div>

        {/* Content */}
        <div className="max-h-96 overflow-y-auto">
          {query ? (
            // Search Results
            <div className="p-2">
              {isSearching ? (
                <div className="p-8 text-center text-gray-400">Đang tìm kiếm...</div>
              ) : results.length > 0 ? (
                results.map(result => (
                  <button
                    key={result.id}
                    onClick={() => handleResultClick(result)}
                    className="w-full flex items-center gap-3 p-3 hover:bg-gray-800 rounded-xl transition-colors text-left"
                  >
                    <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center">
                      <result.icon className="w-5 h-5 text-cyan-400" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-white">{result.title}</p>
                      {result.subtitle && <p className="text-sm text-gray-500">{result.subtitle}</p>}
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-500" />
                  </button>
                ))
              ) : (
                <div className="p-8 text-center text-gray-400">Không tìm thấy kết quả</div>
              )}
            </div>
          ) : (
            // Recent Searches
            <div className="p-4">
              {recentSearches.length > 0 && (
                <>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-gray-400 flex items-center gap-2">
                      <Clock className="w-4 h-4" /> Tìm kiếm gần đây
                    </span>
                    <button onClick={clearRecent} className="text-xs text-red-400 hover:text-red-300">
                      Xóa tất cả
                    </button>
                  </div>
                  <div className="space-y-1">
                    {recentSearches.map((search, i) => (
                      <button
                        key={i}
                        onClick={() => setQuery(search)}
                        className="w-full flex items-center gap-3 p-2 hover:bg-gray-800 rounded-lg text-left"
                      >
                        <Clock className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-300">{search}</span>
                      </button>
                    ))}
                  </div>
                </>
              )}
              
              {/* Quick Links */}
              <div className="mt-4 pt-4 border-t border-gray-800">
                <p className="text-sm text-gray-400 mb-3">Truy cập nhanh</p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: 'Khóa học', icon: BookOpen, tab: 'lessons' },
                    { label: 'Trò chơi', icon: Gamepad2, tab: 'games' },
                    { label: 'Bạn bè', icon: Users, tab: 'friends' },
                    { label: 'Bài viết', icon: FileText, tab: 'social' },
                  ].map(item => (
                    <button
                      key={item.tab}
                      onClick={() => { onNavigate(item.tab); onClose(); }}
                      className="flex items-center gap-2 p-3 bg-gray-800/50 hover:bg-gray-800 rounded-xl transition-colors"
                    >
                      <item.icon className="w-4 h-4 text-cyan-400" />
                      <span className="text-sm text-gray-300">{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
