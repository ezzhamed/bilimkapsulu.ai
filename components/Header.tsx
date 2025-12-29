import React from 'react';
import { Search, Menu, Moon, Sun, Settings, User } from 'lucide-react';

interface HeaderProps {
  onSearch?: (query: string) => void;
  readCount?: number;
  weeklyGoal?: number;
  isDarkMode?: boolean;
  toggleTheme?: () => void;
  onNavigate?: (route: any, id?: string) => void;
  userName?: string;
}

export const Header: React.FC<HeaderProps> = ({
  onSearch,
  readCount = 0,
  weeklyGoal = 5,
  isDarkMode,
  toggleTheme,
  onNavigate,
  userName
}) => {
  const [searchValue, setSearchValue] = React.useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) onSearch(searchValue);
  };

  const percentage = Math.min((readCount / weeklyGoal) * 100, 100);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md transition-colors duration-300">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between">

        {/* Logo */}
        <div className="flex items-center cursor-pointer ml-32" onClick={() => onNavigate && onNavigate('home')}>
          <div className="flex flex-col leading-[0.85] select-none">
            <span className="font-black text-2xl tracking-tight text-slate-900 dark:text-white">Bilim</span>
            <span className="font-black text-2xl tracking-tight text-slate-900 dark:text-white">
              Kapsulu<span className="text-teal-700 dark:text-teal-400">.ai</span>
            </span>
          </div>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="hidden md:flex flex-1 max-w-md mx-8 relative">
          <input
            type="text"
            placeholder="Stanford, MIT veya konu arayın..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all placeholder:text-slate-400"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
        </form>

        {/* Right Actions */}
        <div className="flex items-center gap-3 md:gap-4">

          {/* Weekly Progress */}
          <div className="hidden md:flex flex-col items-end mr-2">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Haftalık ({readCount}/{weeklyGoal})</span>
            <div className="w-24 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full mt-1 overflow-hidden">
              <div
                className="h-full bg-green-500 transition-all duration-500"
                style={{ width: `${percentage}%` }}
              ></div>
            </div>
          </div>

          {/* Dark Mode Toggle */}
          {toggleTheme && (
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Tema Değiştir"
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          )}

          {/* Settings Button */}
          <button
            onClick={() => onNavigate && onNavigate('settings')}
            className="p-2 rounded-full text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Ayarlar"
          >
            <Settings size={20} />
          </button>

          {/* Profile Button */}
          <button
            onClick={() => onNavigate && onNavigate('profile')}
            className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-4 py-2 rounded-full text-sm font-medium hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors flex items-center gap-2"
          >
            <User size={16} />
            {userName ? userName.split(' ')[0] : 'Profilim'}
          </button>

          <button className="md:hidden text-slate-600 dark:text-slate-300">
            <Menu size={24} />
          </button>
        </div>
      </div>
    </header>
  );
};