
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { PaperCard } from '../components/PaperCard';
import { getAllPapers, getWeeklyRecommendations, TOPICS, cacheLivePapers } from '../services/mockData';
import { fetchLivePapers, fetchTrendingPapers, searchPapers, fetchPapersFromAllSources, SearchOptions, SearchResult } from '../services/externalApiService';
import { Search, Target, LayoutGrid, Sparkles, ChevronDown, Edit2, Check, X, Globe, Loader2, Database, BookOpen, AlertCircle, RefreshCw, ChevronLeft, ChevronRight, Zap } from 'lucide-react';
import { TopicCategory, Paper } from '../types';

interface HomeProps {
  onNavigate: (page: string, id?: string) => void;
  userInterests: TopicCategory[];
  readCount: number;
  weeklyGoal: number;
  setWeeklyGoal: (goal: number) => void;
  initialSearchQuery?: string;
}

interface ApiError {
  source: string;
  message: string;
}

export const Home: React.FC<HomeProps> = ({ onNavigate, userInterests, readCount, weeklyGoal, setWeeklyGoal, initialSearchQuery }) => {
  // View State
  const [query, setQuery] = useState(initialSearchQuery || '');
  const [activeView, setActiveView] = useState<'dashboard' | 'search' | 'live'>('dashboard');
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [tempGoal, setTempGoal] = useState(weeklyGoal.toString());

  // Handle global search injection
  useEffect(() => {
    if (initialSearchQuery) {
      setQuery(initialSearchQuery);
      handleSearch(initialSearchQuery);
    }
  }, [initialSearchQuery]);

  // Live Data State
  const [livePapers, setLivePapers] = useState<Paper[]>([]);
  const [isLiveLoading, setIsLiveLoading] = useState(false);
  const [liveCategory, setLiveCategory] = useState<TopicCategory>(userInterests[0] || 'Yapay Zeka');
  const [liveSource, setLiveSource] = useState<'openalex' | 'all'>('all');
  const [livePage, setLivePage] = useState(1);
  const [liveErrors, setLiveErrors] = useState<ApiError[]>([]);
  const [liveFromCache, setLiveFromCache] = useState(false);

  // Search Results State
  const [searchResults, setSearchResults] = useState<Paper[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchSource, setSearchSource] = useState<'all' | 'openalex' | 'arxiv' | 'semantic'>('all');
  const [searchPage, setSearchPage] = useState(1);
  const [searchHasMore, setSearchHasMore] = useState(false);
  const [searchErrors, setSearchErrors] = useState<ApiError[]>([]);
  const [searchTotals, setSearchTotals] = useState({ openalex: 0, arxiv: 0, semantic: 0 });
  const [searchFromCache, setSearchFromCache] = useState(false);

  // Trending Real Data State
  const [trendingPapers, setTrendingPapers] = useState<Paper[]>([]);
  const [isTrendingLoading, setIsTrendingLoading] = useState(false);
  const [trendingErrors, setTrendingErrors] = useState<ApiError[]>([]);

  // Progress Logic
  const progressPercentage = Math.min((readCount / weeklyGoal) * 100, 100);

  // Data
  const allPapers = useMemo(() => getAllPapers(), []);
  const weeklyPapers = useMemo(() => getWeeklyRecommendations(userInterests), [userInterests]);

  // Latest/Trending for Dashboard
  const newArrivals = useMemo(() => {
    const weeklyIds = new Set(weeklyPapers.map(p => p.id));
    const combined = [...trendingPapers, ...allPapers];

    return combined
      .filter(p => !weeklyIds.has(p.id))
      .sort((a, b) => {
        if (a.isExternal && !b.isExternal) return -1;
        if (!a.isExternal && b.isExternal) return 1;
        return b.publicationYear - a.publicationYear;
      })
      .slice(0, 6);
  }, [allPapers, weeklyPapers, trendingPapers]);

  // Search Handler
  const handleSearch = useCallback(async (searchQuery?: string, page: number = 1) => {
    const q = searchQuery || query;
    if (!q.trim()) return;

    setActiveView('search');
    setIsSearching(true);
    setSearchErrors([]);

    try {
      const options: SearchOptions = {
        query: q,
        source: searchSource,
        page,
        perPage: 12
      };

      const result: SearchResult = await searchPapers(options);

      if (page === 1) {
        setSearchResults(result.papers);
      } else {
        setSearchResults(prev => [...prev, ...result.papers]);
      }

      setSearchHasMore(result.hasMore);
      setSearchErrors(result.errors);
      setSearchTotals(result.totalBySource);
      setSearchFromCache(result.fromCache);
      setSearchPage(page);

      // Cache papers for viewing
      cacheLivePapers(result.papers);
    } catch (error) {
      console.error('Search error:', error);
      setSearchErrors([{ source: 'System', message: 'Arama sırasında hata oluştu' }]);
    } finally {
      setIsSearching(false);
    }
  }, [query, searchSource]);

  const loadMoreSearch = () => {
    handleSearch(query, searchPage + 1);
  };

  // Live Data Fetcher
  const fetchLiveData = useCallback(async (page: number = 1) => {
    setIsLiveLoading(true);
    setLiveErrors([]);

    try {
      const result = liveSource === 'all'
        ? await fetchPapersFromAllSources(liveCategory, page)
        : await fetchLivePapers(liveCategory, page, 12);

      if (page === 1) {
        setLivePapers(result.data);
      } else {
        setLivePapers(prev => [...prev, ...result.data]);
      }

      setLiveErrors(result.errors);
      setLiveFromCache(result.fromCache);
      setLivePage(page);
      cacheLivePapers(result.data);
    } catch (error) {
      console.error('Live fetch error:', error);
      setLiveErrors([{ source: 'System', message: 'Veri çekilirken hata oluştu' }]);
    } finally {
      setIsLiveLoading(false);
    }
  }, [liveCategory, liveSource]);

  useEffect(() => {
    if (activeView === 'live') {
      setLivePage(1);
      fetchLiveData(1);
    }
  }, [activeView, liveCategory, liveSource]);

  const loadMoreLive = () => {
    fetchLiveData(livePage + 1);
  };

  // Fetch Trending on Mount
  useEffect(() => {
    const loadTrending = async () => {
      setIsTrendingLoading(true);
      setTrendingErrors([]);

      try {
        const result = await fetchTrendingPapers();
        setTrendingPapers(result.data);
        setTrendingErrors(result.errors);
        cacheLivePapers(result.data);
      } catch (error) {
        setTrendingErrors([{ source: 'System', message: 'Trending veriler yüklenemedi' }]);
      } finally {
        setIsTrendingLoading(false);
      }
    };

    loadTrending();
  }, []);

  const saveGoal = () => {
    const val = parseInt(tempGoal);
    if (!isNaN(val) && val > 0) {
      setWeeklyGoal(val);
    }
    setIsEditingGoal(false);
  };

  // Get source badge color
  const getSourceBadge = (paper: Paper) => {
    if (paper.id.startsWith('arxiv-')) return { text: 'arXiv', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' };
    if (paper.id.startsWith('ss-')) return { text: 'Semantic', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' };
    if (paper.id.startsWith('oa-')) return { text: 'OpenAlex', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' };
    return { text: 'Featured', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' };
  };

  // Error Alert Component
  const ErrorAlert = ({ errors }: { errors: ApiError[] }) => {
    if (errors.length === 0) return null;

    return (
      <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
        <div className="flex items-start gap-3">
          <AlertCircle className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" size={20} />
          <div className="flex-1">
            <h4 className="font-medium text-amber-800 dark:text-amber-300 mb-1">Bazı kaynaklar yüklenemedi</h4>
            <ul className="text-sm text-amber-700 dark:text-amber-400 space-y-1">
              {errors.map((err, i) => (
                <li key={i}>• <strong>{err.source}:</strong> {err.message}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    );
  };

  // Cache Badge Component
  const CacheBadge = ({ fromCache }: { fromCache: boolean }) => {
    if (!fromCache) return null;
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-xs font-medium">
        <Zap size={12} /> Önbellekten
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20 transition-colors duration-300">

      {/* Dashboard Header / Tab Switcher */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-16 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16 overflow-x-auto no-scrollbar">
            <div className="flex items-center gap-8 h-full min-w-max">

              <button
                onClick={() => setActiveView('dashboard')}
                className={`h-full flex items-center gap-2 text-sm font-bold border-b-2 transition-colors ${activeView === 'dashboard' ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
              >
                <LayoutGrid size={18} /> Panelim
              </button>
              <button
                onClick={() => setActiveView('search')}
                className={`h-full flex items-center gap-2 text-sm font-bold border-b-2 transition-colors ${activeView === 'search' ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
              >
                <Search size={18} /> Canlı Arama
              </button>
              <button
                onClick={() => setActiveView('live')}
                className={`h-full flex items-center gap-2 text-sm font-bold border-b-2 transition-colors ${activeView === 'live' ? 'border-red-500 text-red-600 dark:text-red-400' : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-red-500'}`}
              >
                <Globe size={18} /> Kategoriler
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 mt-8">

        {/* --- DASHBOARD VIEW --- */}
        {activeView === 'dashboard' && (
          <div className="space-y-12">

            {/* Welcome Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Hoş Geldin 👋</h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1">
                  İlgi alanların: <span className="text-indigo-600 dark:text-indigo-400 font-medium">{userInterests.join(', ') || 'Henüz belirlenmedi'}</span>
                </p>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <Database size={16} />
                <span>3 kaynak: OpenAlex, arXiv, Semantic Scholar</span>
              </div>
            </div>

            {/* Progress Section */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-700 rounded-2xl p-8 text-white shadow-xl shadow-indigo-200/50 dark:shadow-none">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <h2 className="text-2xl font-bold">Haftalık Okuma Hedefin</h2>
                    {!isEditingGoal && (
                      <button onClick={() => { setTempGoal(weeklyGoal.toString()); setIsEditingGoal(true); }} className="p-1 hover:bg-white/20 rounded transition-colors text-white/80 hover:text-white">
                        <Edit2 size={16} />
                      </button>
                    )}
                  </div>
                  <p className="text-indigo-100 opacity-90 max-w-xl">
                    Bu hafta seçtiğin konularda <span className="font-bold">{weeklyGoal}</span> makale okumayı hedefledin.
                  </p>
                </div>
                <div className="bg-white/10 backdrop-blur-md p-5 rounded-xl border border-white/20 min-w-[240px]">
                  <div className="flex justify-between text-sm font-bold mb-2 items-center">
                    <span>İlerleme</span>
                    <div className="flex items-center gap-2">
                      <span>{readCount} / </span>
                      {isEditingGoal ? (
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            value={tempGoal}
                            onChange={(e) => setTempGoal(e.target.value)}
                            className="w-12 bg-white/20 border border-white/40 rounded px-1 py-0.5 text-white text-center focus:outline-none"
                            autoFocus
                          />
                          <button onClick={saveGoal} className="text-green-400 hover:text-green-300"><Check size={16} /></button>
                          <button onClick={() => setIsEditingGoal(false)} className="text-red-400 hover:text-red-300"><X size={16} /></button>
                        </div>
                      ) : (
                        <span>{weeklyGoal}</span>
                      )}
                    </div>
                  </div>
                  <div className="w-full h-2.5 bg-black/20 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-400 transition-all duration-1000 shadow-[0_0_10px_rgba(74,222,128,0.5)]"
                      style={{ width: `${progressPercentage}%` }}
                    ></div>
                  </div>
                  <p className="text-xs mt-3 text-indigo-200 flex items-center justify-between">
                    <span>%{Math.round(progressPercentage)}</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Trending Errors */}
            <ErrorAlert errors={trendingErrors} />

            {/* Personalized Papers based on interests */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Target className="text-indigo-600 dark:text-indigo-400" /> Senin İçin Seçtiklerimiz
                </h2>
                <button onClick={() => setActiveView('live')} className="text-sm text-indigo-600 dark:text-indigo-400 font-bold hover:underline">
                  Tümünü Gör
                </button>
              </div>

              {isTrendingLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 size={32} className="text-indigo-500 animate-spin" />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {newArrivals.map(paper => (
                    <PaperCard
                      key={paper.id}
                      paper={paper}
                      onClick={(id) => onNavigate('paper', id)}
                      isFeatured={true}
                    />
                  ))}
                </div>
              )}
            </section>

            {/* Quick Categories */}
            <section>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Kategorilere Göz At</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {TOPICS.slice(0, 8).map(topic => (
                  <div
                    key={topic}
                    onClick={() => { setLiveCategory(topic); setActiveView('live'); }}
                    className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors cursor-pointer shadow-sm group"
                  >
                    <h3 className="font-bold text-slate-700 dark:text-slate-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">{topic}</h3>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                      Canlı veriler
                    </p>
                  </div>
                ))}
              </div>
            </section>

          </div>
        )}

        {/* --- SEARCH VIEW --- */}
        {activeView === 'search' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">

            <div className="text-center mb-10">
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Canlı Akademik Arama</h1>
              <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
                OpenAlex, arXiv ve Semantic Scholar'dan gerçek zamanlı arama yapın.
              </p>
            </div>

            {/* Search Bar */}
            <div className="max-w-3xl mx-auto mb-8">
              <div className="relative">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="Makale, yazar veya konu arayın..."
                  className="w-full pl-12 pr-4 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-lg text-lg placeholder:text-slate-400"
                />
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-400" size={24} />
                <button
                  onClick={() => { setSearchPage(1); handleSearch(); }}
                  disabled={!query.trim() || isSearching}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-indigo-600 text-white px-6 py-2 rounded-xl font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                >
                  {isSearching ? <Loader2 size={20} className="animate-spin" /> : 'Ara'}
                </button>
              </div>

              {/* Source Filter */}
              <div className="flex items-center justify-center gap-2 mt-4 flex-wrap">
                <span className="text-sm text-slate-500">Kaynak:</span>
                {(['all', 'openalex', 'arxiv', 'semantic'] as const).map(source => (
                  <button
                    key={source}
                    onClick={() => { setSearchSource(source); if (query) { setSearchPage(1); handleSearch(query, 1); } }}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${searchSource === source
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                  >
                    {source === 'all' ? 'Tümü' : source === 'openalex' ? 'OpenAlex' : source === 'arxiv' ? 'arXiv' : 'Semantic Scholar'}
                  </button>
                ))}
              </div>
            </div>

            {/* Search Errors */}
            <ErrorAlert errors={searchErrors} />

            {/* Search Results */}
            {isSearching && searchPage === 1 ? (
              <div className="flex flex-col items-center justify-center py-20">
                <Loader2 size={48} className="text-indigo-500 animate-spin mb-4" />
                <p className="text-slate-500 font-medium">Aranıyor...</p>
              </div>
            ) : searchResults.length > 0 ? (
              <>
                <div className="flex items-center justify-between mb-6 px-2 flex-wrap gap-2">
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-bold text-slate-500 dark:text-slate-400">
                      {searchResults.length} sonuç
                    </span>
                    <CacheBadge fromCache={searchFromCache} />
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <span>OpenAlex: {searchTotals.openalex}</span>
                    <span>•</span>
                    <span>arXiv: {searchTotals.arxiv}</span>
                    <span>•</span>
                    <span>Semantic: {searchTotals.semantic}</span>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  {searchResults.map(paper => (
                    <div key={paper.id} className="relative">
                      <span className={`absolute top-2 right-2 z-10 px-2 py-0.5 rounded-full text-[10px] font-bold ${getSourceBadge(paper).color}`}>
                        {getSourceBadge(paper).text}
                      </span>
                      <PaperCard
                        paper={paper}
                        onClick={(id) => onNavigate('paper', id)}
                      />
                    </div>
                  ))}
                </div>

                {/* Load More Button */}
                {searchHasMore && (
                  <div className="flex justify-center mb-12">
                    <button
                      onClick={loadMoreSearch}
                      disabled={isSearching}
                      className="flex items-center gap-2 px-8 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm disabled:opacity-50"
                    >
                      {isSearching ? (
                        <Loader2 size={18} className="animate-spin" />
                      ) : (
                        <RefreshCw size={18} />
                      )}
                      Daha Fazla Yükle
                    </button>
                  </div>
                )}
              </>
            ) : query && !isSearching ? (
              <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                <BookOpen size={48} className="text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                <p className="text-lg text-slate-500 dark:text-slate-400">Aramanızla eşleşen sonuç bulunamadı.</p>
                <p className="text-sm text-slate-400 mt-2">Farklı anahtar kelimeler deneyin.</p>
              </div>
            ) : (
              <div className="text-center py-20">
                <Search size={64} className="text-slate-200 dark:text-slate-700 mx-auto mb-4" />
                <p className="text-slate-500 dark:text-slate-400">Aramak için yukarıdaki kutuyu kullanın</p>
              </div>
            )}
          </div>
        )}

        {/* --- LIVE DATA VIEW --- */}
        {activeView === 'live' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">

            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Kategoriye Göre Makaleler</h1>
              <p className="text-slate-500 dark:text-slate-400">
                Birden fazla kaynaktan gerçek zamanlı veriler
              </p>
            </div>

            {/* Category Selector */}
            <div className="flex overflow-x-auto gap-2 pb-4 mb-6 no-scrollbar pt-2">
              {TOPICS.map(cat => (
                <button
                  key={cat}
                  onClick={() => { setLiveCategory(cat); setLivePage(1); }}
                  className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-bold transition-colors border ${liveCategory === cat
                    ? 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:border-red-300'
                    }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Live Errors */}
            <ErrorAlert errors={liveErrors} />

            {isLiveLoading && livePage === 1 ? (
              <div className="flex flex-col items-center justify-center py-20">
                <Loader2 size={48} className="text-red-500 animate-spin mb-4" />
                <p className="text-slate-500 font-medium">Veriler çekiliyor...</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  {livePapers.map((paper) => (
                    <div key={paper.id} className="relative">
                      <span className={`absolute top-2 right-2 z-10 px-2 py-0.5 rounded-full text-[10px] font-bold ${getSourceBadge(paper).color}`}>
                        {getSourceBadge(paper).text}
                      </span>
                      <PaperCard
                        paper={paper}
                        onClick={(id) => onNavigate('paper', id)}
                      />
                    </div>
                  ))}
                  {livePapers.length === 0 && !isLiveLoading && (
                    <div className="col-span-full text-center py-12">
                      <p className="text-slate-500">Bu kategoride veri bulunamadı.</p>
                    </div>
                  )}
                </div>

                {/* Load More Button */}
                {livePapers.length > 0 && livePapers.length >= 6 && (
                  <div className="flex justify-center mb-12">
                    <button
                      onClick={loadMoreLive}
                      disabled={isLiveLoading}
                      className="flex items-center gap-2 px-8 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm disabled:opacity-50"
                    >
                      {isLiveLoading ? (
                        <Loader2 size={18} className="animate-spin" />
                      ) : (
                        <RefreshCw size={18} />
                      )}
                      Daha Fazla Yükle
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
