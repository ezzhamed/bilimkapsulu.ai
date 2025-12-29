
import React, { useMemo, useState, useEffect } from 'react';
import { TopicCategory, Paper, SavedPaper } from '../types';
import { getPaperById, TOPICS } from '../services/mockData';
import { User, BookOpen, Target, Clock, ArrowLeft, Edit2, X, Check, Bookmark, LayoutList, BarChart3, WifiOff, StickyNote, Trash2 } from 'lucide-react';
import { AnalyticsChart } from '../components/AnalyticsChart';
import { getAllSavedPapers, removeSavedPaper } from '../services/offlineStorage';

interface ProfilePageProps {
  readPaperIds: Set<string>;
  savedPaperIds: Set<string>;
  userInterests: TopicCategory[];
  onNavigate: (page: string, id?: string) => void;
  weeklyGoal: number;
  userProfile: {
    name: string;
    university: string;
    fieldOfStudy: string;
  };
  onUpdateInterests?: (interests: TopicCategory[]) => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ readPaperIds, savedPaperIds, userInterests, onNavigate, weeklyGoal, userProfile, onUpdateInterests }) => {

  const [isEditingInterests, setIsEditingInterests] = useState(false);
  const [tempInterests, setTempInterests] = useState<TopicCategory[]>([]);
  const [activeTab, setActiveTab] = useState<'history' | 'saved' | 'offline' | 'analytics'>('history');

  // Offline papers state
  const [offlinePapers, setOfflinePapers] = useState<SavedPaper[]>([]);
  const [isLoadingOffline, setIsLoadingOffline] = useState(true);

  // Load offline papers
  useEffect(() => {
    const loadOfflinePapers = async () => {
      setIsLoadingOffline(true);
      try {
        const papers = await getAllSavedPapers();
        setOfflinePapers(papers);
      } catch (error) {
        console.error('Failed to load offline papers:', error);
      } finally {
        setIsLoadingOffline(false);
      }
    };
    loadOfflinePapers();
  }, []);

  const handleRemoveOffline = async (paperId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await removeSavedPaper(paperId);
      setOfflinePapers(offlinePapers.filter(p => p.id !== paperId));
    } catch (error) {
      console.error('Failed to remove offline paper:', error);
    }
  };

  // Retrieve full paper objects from IDs for History
  const readHistory = useMemo(() => {
    const papers: Paper[] = [];
    const ids = Array.from(readPaperIds) as string[];
    for (const id of ids) {
      const p = getPaperById(id);
      if (p) papers.push(p);
    }
    return papers.reverse();
  }, [readPaperIds]);

  // Retrieve full paper objects from IDs for Saved
  const savedPapers = useMemo(() => {
    const papers: Paper[] = [];
    const ids = Array.from(savedPaperIds) as string[];
    for (const id of ids) {
      const p = getPaperById(id);
      if (p) papers.push(p);
    }
    return papers.reverse();
  }, [savedPaperIds]);

  const totalReadTime = readHistory.reduce((acc, curr) => acc + curr.readTimeMinutes, 0);

  // Fallback defaults
  const name = userProfile?.name || "Kullanıcı";
  const university = userProfile?.university || "Belirtilmemiş";
  const field = userProfile?.fieldOfStudy || "Genel Araştırmacı";

  // Get Initials
  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) || 'KA';

  const startEditing = () => {
    setTempInterests([...userInterests]);
    setIsEditingInterests(true);
  };

  const toggleInterest = (topic: TopicCategory) => {
    if (tempInterests.includes(topic)) {
      setTempInterests(tempInterests.filter(t => t !== topic));
    } else {
      setTempInterests([...tempInterests, topic]);
    }
  };

  const saveInterests = () => {
    if (onUpdateInterests) {
      onUpdateInterests(tempInterests);
    }
    setIsEditingInterests(false);
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20">

      {/* Edit Interests Modal */}
      {isEditingInterests && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col border border-slate-200 dark:border-slate-800">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900 rounded-t-2xl">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">İlgi Alanlarını Düzenle</h3>
              <button onClick={() => setIsEditingInterests(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white">
                <X size={24} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {TOPICS.map(topic => (
                  <button
                    key={topic}
                    onClick={() => toggleInterest(topic)}
                    className={`px-4 py-3 rounded-xl text-sm font-bold border transition-all flex items-center justify-between ${tempInterests.includes(topic)
                      ? 'bg-indigo-50 dark:bg-indigo-900/30 border-indigo-500 text-indigo-700 dark:text-indigo-300'
                      : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                      }`}
                  >
                    {topic}
                    {tempInterests.includes(topic) && <Check size={14} />}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-6 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3 bg-slate-50 dark:bg-slate-900/50 rounded-b-2xl">
              <button
                onClick={() => setIsEditingInterests(false)}
                className="px-6 py-2.5 rounded-full font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
              >
                İptal
              </button>
              <button
                onClick={saveInterests}
                disabled={tempInterests.length === 0}
                className="px-6 py-2.5 rounded-full font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Check size={18} /> Kaydet
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header Section */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-5xl mx-auto px-4 py-12">
          <button
            onClick={() => onNavigate('home')}
            className="mb-8 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-2 text-sm font-medium transition-colors"
          >
            <ArrowLeft size={16} /> Panelye Dön
          </button>

          <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
            <div className="w-24 h-24 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center text-3xl font-bold border-4 border-white dark:border-slate-800 shadow-lg">
              {initials}
            </div>
            <div className="text-center md:text-left flex-1">
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{name}</h1>
              <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">{field} • {university}</p>

              <div className="flex items-center justify-center md:justify-start gap-2 mt-4 flex-wrap">
                {userInterests.map(interest => (
                  <span key={interest} className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold rounded-full">
                    {interest}
                  </span>
                ))}
                {onUpdateInterests && (
                  <button
                    onClick={startEditing}
                    className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400 flex items-center justify-center hover:bg-indigo-200 dark:hover:bg-indigo-800 transition-colors"
                    title="İlgi Alanlarını Düzenle"
                  >
                    <Edit2 size={12} />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 mt-12">

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <BookOpen size={20} />
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Okunan</p>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">{readPaperIds.size}</h3>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <Target size={20} />
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Hedef</p>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  %{weeklyGoal > 0 ? Math.min(Math.round((readPaperIds.size / weeklyGoal) * 100), 100) : 0}
                </h3>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                <Clock size={20} />
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Süre</p>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">{totalReadTime} dk</h3>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 flex items-center justify-center">
                <WifiOff size={20} />
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Çevrimdışı</p>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">{offlinePapers.length}</h3>
              </div>
            </div>
          </div>
        </div>

        {/* Content Tabs */}
        <div className="flex gap-4 overflow-x-auto border-b border-slate-200 dark:border-slate-800 mb-6 pb-1">
          <button
            onClick={() => setActiveTab('history')}
            className={`pb-3 text-sm font-bold flex items-center gap-2 transition-all whitespace-nowrap ${activeTab === 'history'
              ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
          >
            <Clock size={16} /> Geçmiş
          </button>
          <button
            onClick={() => setActiveTab('saved')}
            className={`pb-3 text-sm font-bold flex items-center gap-2 transition-all whitespace-nowrap ${activeTab === 'saved'
              ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
          >
            <Bookmark size={16} /> Kaydedilenler
          </button>
          <button
            onClick={() => setActiveTab('offline')}
            className={`pb-3 text-sm font-bold flex items-center gap-2 transition-all whitespace-nowrap ${activeTab === 'offline'
              ? 'text-green-600 dark:text-green-400 border-b-2 border-green-600 dark:border-green-400'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
          >
            <WifiOff size={16} /> Çevrimdışı ({offlinePapers.length})
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`pb-3 text-sm font-bold flex items-center gap-2 transition-all whitespace-nowrap ${activeTab === 'analytics'
              ? 'text-purple-600 dark:text-purple-400 border-b-2 border-purple-600 dark:border-purple-400'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
          >
            <BarChart3 size={16} /> İstatistikler
          </button>
        </div>

        {/* History Tab */}
        {activeTab === 'history' && (
          readHistory.length > 0 ? (
            <div className="space-y-4">
              {readHistory.map((paper) => (
                <div
                  key={paper.id}
                  onClick={() => onNavigate('paper', paper.id)}
                  className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-500 cursor-pointer transition-colors group flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded">
                        {paper.category}
                      </span>
                      <span className="text-xs text-slate-400 dark:text-slate-500">
                        {paper.readTimeMinutes} dk
                      </span>
                    </div>
                    <h3 className="font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {paper.title}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-2xl mt-1">
                      {paper.university} • {paper.publicationYear}
                    </p>
                  </div>
                  <div className="text-xs font-medium text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-3 py-1 rounded-full whitespace-nowrap">
                    Okundu
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
              <p className="text-slate-500 dark:text-slate-400">Henüz okuma geçmişi bulunmuyor.</p>
              <button onClick={() => onNavigate('home')} className="mt-4 text-indigo-600 dark:text-indigo-400 font-bold hover:underline">
                Keşfetmeye Başla
              </button>
            </div>
          )
        )}

        {/* Saved Tab */}
        {activeTab === 'saved' && (
          savedPapers.length > 0 ? (
            <div className="space-y-4">
              {savedPapers.map((paper) => (
                <div
                  key={paper.id}
                  onClick={() => onNavigate('paper', paper.id)}
                  className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-500 cursor-pointer transition-colors group flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded">
                        {paper.category}
                      </span>
                    </div>
                    <h3 className="font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {paper.title}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-2xl mt-1">
                      {paper.university} • {paper.publicationYear}
                    </p>
                  </div>
                  <div className="text-xs font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 px-3 py-1 rounded-full whitespace-nowrap">
                    Kaydedildi
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
              <p className="text-slate-500 dark:text-slate-400">Henüz kaydedilmiş makale bulunmuyor.</p>
              <button onClick={() => onNavigate('home')} className="mt-4 text-indigo-600 dark:text-indigo-400 font-bold hover:underline">
                Keşfetmeye Başla
              </button>
            </div>
          )
        )}

        {/* Offline Tab */}
        {activeTab === 'offline' && (
          isLoadingOffline ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full" />
            </div>
          ) : offlinePapers.length > 0 ? (
            <div className="space-y-4">
              {offlinePapers.map((savedPaper) => (
                <div
                  key={savedPaper.id}
                  onClick={() => onNavigate('paper', savedPaper.id)}
                  className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-green-500 dark:hover:border-green-500 cursor-pointer transition-colors group"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-bold bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-0.5 rounded flex items-center gap-1">
                          <WifiOff size={10} /> Çevrimdışı
                        </span>
                        <span className="text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded">
                          {savedPaper.paper.category}
                        </span>
                        {savedPaper.notes?.length > 0 && (
                          <span className="text-[10px] font-bold bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded flex items-center gap-1">
                            <StickyNote size={10} /> {savedPaper.notes.length} not
                          </span>
                        )}
                      </div>
                      <h3 className="font-bold text-slate-900 dark:text-white group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                        {savedPaper.paper.title}
                      </h3>
                      <div className="flex items-center gap-3 mt-2 text-xs text-slate-500 dark:text-slate-400">
                        <span>İndirildi: {formatDate(savedPaper.savedAt)}</span>
                        {savedPaper.readingProgress > 0 && (
                          <span className="text-indigo-600 dark:text-indigo-400">%{savedPaper.readingProgress} okundu</span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={(e) => handleRemoveOffline(savedPaper.id, e)}
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      title="Çevrimdışı listesinden kaldır"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
              <WifiOff size={48} className="mx-auto text-slate-300 dark:text-slate-600 mb-4" />
              <p className="text-slate-500 dark:text-slate-400">Henüz çevrimdışı kaydedilmiş makale yok.</p>
              <p className="text-sm text-slate-400 dark:text-slate-500 mt-2">Makalenin "İndir" butonuna tıklayarak çevrimdışı okuyabilirsiniz.</p>
            </div>
          )
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <AnalyticsChart />
        )}

      </div>
    </div>
  );
};
