import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Home } from './pages/Home';
import { PaperView } from './pages/PaperView';
import { LandingPage } from './pages/LandingPage';
import { Onboarding } from './pages/Onboarding';
import { ProfilePage } from './pages/ProfilePage';
import { SettingsPage } from './pages/SettingsPage';
import { TopicCategory } from './types';
import { TOPICS } from './services/mockData';

type AppRoute = 'landing' | 'onboarding' | 'home' | 'paper' | 'profile' | 'settings';

const App: React.FC = () => {
  // Router State
  const [route, setRoute] = useState<AppRoute>('landing');
  const [paperId, setPaperId] = useState<string | undefined>(undefined);

  // Global Search State
  const [globalSearchQuery, setGlobalSearchQuery] = useState('');

  // User Info State (from localStorage)
  const [userName, setUserName] = useState(() => {
    return localStorage.getItem('userName') || '';
  });

  // Onboarding State
  const [hasOnboarded, setHasOnboarded] = useState(() => {
    return localStorage.getItem('hasOnboarded') === 'true';
  });

  const [userInterests, setUserInterests] = useState<TopicCategory[]>(() => {
    const saved = localStorage.getItem('userInterests');
    return saved ? JSON.parse(saved) : [];
  });

  // Theme State
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  // Progress Tracking State
  const [readPapers, setReadPapers] = useState<Set<string>>(() => {
    const saved = localStorage.getItem('readPapers');
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });

  // Saved/Bookmarked Papers State
  const [savedPapers, setSavedPapers] = useState<Set<string>>(() => {
    const saved = localStorage.getItem('savedPapers');
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });

  // Weekly Goal State
  const [weeklyGoal, setWeeklyGoal] = useState<number>(() => {
    const saved = localStorage.getItem('weeklyGoal');
    return saved ? parseInt(saved, 10) : 5;
  });

  // --- PERSISTENCE EFFECTS ---

  useEffect(() => {
    localStorage.setItem('hasOnboarded', hasOnboarded.toString());
  }, [hasOnboarded]);

  useEffect(() => {
    localStorage.setItem('userInterests', JSON.stringify(userInterests));
  }, [userInterests]);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  useEffect(() => {
    localStorage.setItem('readPapers', JSON.stringify(Array.from(readPapers)));
  }, [readPapers]);

  useEffect(() => {
    localStorage.setItem('savedPapers', JSON.stringify(Array.from(savedPapers)));
  }, [savedPapers]);

  useEffect(() => {
    localStorage.setItem('weeklyGoal', weeklyGoal.toString());
  }, [weeklyGoal]);

  // Handle Browser History / Hash
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');

      if (hash.startsWith('/paper/')) {
        const id = hash.split('/paper/')[1].split('?')[0];
        if (id) {
          setPaperId(id);
          setRoute('paper');
        }
      } else if (hash === '/dashboard') {
        if (hasOnboarded) setRoute('home');
        else setRoute('onboarding');
      } else if (hash === '/profile') {
        if (hasOnboarded) setRoute('profile');
        else setRoute('onboarding');
      } else if (hash === '/settings') {
        if (hasOnboarded) setRoute('settings');
        else setRoute('onboarding');
      } else if (hash === '/onboarding') {
        setRoute('onboarding');
      } else {
        if (hasOnboarded) setRoute('home');
        else setRoute('landing');
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [hasOnboarded]);

  // Navigation Helpers
  const navigateTo = (target: AppRoute, id?: string) => {
    if (target === 'paper' && id) {
      window.location.hash = `/paper/${id}`;
      setPaperId(id);
      setRoute('paper');
    } else if (target === 'home') {
      window.location.hash = '/dashboard';
      setRoute('home');
    } else if (target === 'profile') {
      window.location.hash = '/profile';
      setRoute('profile');
    } else if (target === 'settings') {
      window.location.hash = '/settings';
      setRoute('settings');
    } else if (target === 'onboarding') {
      window.location.hash = '/onboarding';
      setRoute('onboarding');
    } else {
      window.location.hash = '/';
      setRoute(target);
    }
  };

  // Logic Flows
  const handleGetStarted = () => {
    navigateTo('onboarding');
  };

  const handleOnboardingComplete = (interests: TopicCategory[], goal: number) => {
    setUserInterests(interests);
    setWeeklyGoal(goal);
    setHasOnboarded(true);
    setUserName(localStorage.getItem('userName') || '');
    navigateTo('home');
  };

  const handleClearAllData = () => {
    // Clear all localStorage data
    localStorage.removeItem('userName');
    localStorage.removeItem('userUniversity');
    localStorage.removeItem('userFieldOfStudy');
    localStorage.removeItem('gemini_api_key');
    localStorage.removeItem('hasOnboarded');
    localStorage.removeItem('userInterests');
    localStorage.removeItem('readPapers');
    localStorage.removeItem('savedPapers');
    localStorage.removeItem('weeklyGoal');
    localStorage.removeItem('trendingCache');

    // Reset state
    setHasOnboarded(false);
    setUserInterests([]);
    setReadPapers(new Set());
    setSavedPapers(new Set());
    setWeeklyGoal(5);
    setUserName('');

    navigateTo('landing');
  };

  const handleMarkAsRead = (id: string) => {
    if (!readPapers.has(id)) {
      setReadPapers(prev => {
        const newSet = new Set(prev);
        newSet.add(id);
        return newSet;
      });
    }
  };

  const handleToggleSave = (id: string) => {
    setSavedPapers(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleSearch = (query: string) => {
    setGlobalSearchQuery(query);
    if (route !== 'home') {
      navigateTo('home');
    }
  };

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  // Render Logic based on Route
  const renderContent = () => {
    switch (route) {
      case 'landing':
        return <LandingPage onGetStarted={handleGetStarted} />;

      case 'onboarding':
        return <Onboarding onComplete={handleOnboardingComplete} />;

      case 'home':
        if (!hasOnboarded) return <LandingPage onGetStarted={handleGetStarted} />;
        return <Home
          onNavigate={navigateTo}
          userInterests={userInterests}
          readCount={readPapers.size}
          weeklyGoal={weeklyGoal}
          setWeeklyGoal={setWeeklyGoal}
          initialSearchQuery={globalSearchQuery}
        />;

      case 'paper':
        if (!paperId) return <Home onNavigate={navigateTo} userInterests={userInterests} readCount={readPapers.size} weeklyGoal={weeklyGoal} setWeeklyGoal={setWeeklyGoal} initialSearchQuery={globalSearchQuery} />;
        return <PaperView
          paperId={paperId}
          onBack={() => navigateTo('home')}
          isSaved={savedPapers.has(paperId)}
          onToggleSave={() => handleToggleSave(paperId)}
          onMarkAsRead={() => handleMarkAsRead(paperId)}
        />;

      case 'profile':
        if (!hasOnboarded) return <LandingPage onGetStarted={handleGetStarted} />;
        return <ProfilePage
          readPaperIds={readPapers}
          savedPaperIds={savedPapers}
          userInterests={userInterests}
          onNavigate={navigateTo}
          weeklyGoal={weeklyGoal}
          userProfile={{
            name: userName || 'Kullanıcı',
            university: localStorage.getItem('userUniversity') || '',
            fieldOfStudy: localStorage.getItem('userFieldOfStudy') || ''
          }}
          onUpdateInterests={setUserInterests}
        />;

      case 'settings':
        if (!hasOnboarded) return <LandingPage onGetStarted={handleGetStarted} />;
        return <SettingsPage
          onNavigate={navigateTo}
          userInterests={userInterests}
          weeklyGoal={weeklyGoal}
          onUpdateInterests={setUserInterests}
          onUpdateGoal={setWeeklyGoal}
          onClearAllData={handleClearAllData}
        />;

      default:
        return <LandingPage onGetStarted={handleGetStarted} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-slate-950 transition-colors duration-300">
      {/* Show standard Header only on Home, Paper, Profile and Settings pages */}
      {(route === 'home' || route === 'paper' || route === 'profile' || route === 'settings') && (
        <Header
          onSearch={handleSearch}
          readCount={readPapers.size}
          weeklyGoal={weeklyGoal}
          isDarkMode={isDarkMode}
          toggleTheme={toggleTheme}
          onNavigate={navigateTo}
          userName={userName}
        />
      )}

      <main className="flex-1">
        {renderContent()}
      </main>
    </div>
  );
};

export default App;
