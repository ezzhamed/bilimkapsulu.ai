import React, { useState, useEffect } from 'react';
import { ArrowLeft, Key, User, Target, Trash2, Eye, EyeOff, Check, ExternalLink, Save, AlertCircle, Database, RefreshCw } from 'lucide-react';
import { TopicCategory } from '../types';
import { TOPICS } from '../services/mockData';
import { clearApiCache } from '../services/externalApiService';

interface SettingsPageProps {
  onNavigate: (page: string) => void;
  userInterests: TopicCategory[];
  weeklyGoal: number;
  onUpdateInterests: (interests: TopicCategory[]) => void;
  onUpdateGoal: (goal: number) => void;
  onClearAllData: () => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
  onNavigate,
  userInterests,
  weeklyGoal,
  onUpdateInterests,
  onUpdateGoal,
  onClearAllData
}) => {
  // API Key State
  const [apiKey, setApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [apiKeySaved, setApiKeySaved] = useState(false);

  // User Info State
  const [userName, setUserName] = useState('');
  const [university, setUniversity] = useState('');
  const [fieldOfStudy, setFieldOfStudy] = useState('');
  const [infoSaved, setInfoSaved] = useState(false);

  // Goal State
  const [tempGoal, setTempGoal] = useState(weeklyGoal);
  const [goalSaved, setGoalSaved] = useState(false);

  // Selected Interests
  const [selectedInterests, setSelectedInterests] = useState<TopicCategory[]>(userInterests);

  // Confirm Clear Dialog
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // Load saved data on mount
  useEffect(() => {
    setApiKey(localStorage.getItem('gemini_api_key') || '');
    setUserName(localStorage.getItem('userName') || '');
    setUniversity(localStorage.getItem('userUniversity') || '');
    setFieldOfStudy(localStorage.getItem('userFieldOfStudy') || '');
  }, []);

  const handleSaveApiKey = () => {
    localStorage.setItem('gemini_api_key', apiKey);
    setApiKeySaved(true);
    setTimeout(() => setApiKeySaved(false), 2000);
  };

  const handleSaveUserInfo = () => {
    localStorage.setItem('userName', userName);
    localStorage.setItem('userUniversity', university);
    localStorage.setItem('userFieldOfStudy', fieldOfStudy);
    setInfoSaved(true);
    setTimeout(() => setInfoSaved(false), 2000);
  };

  const handleSaveGoal = () => {
    if (tempGoal > 0) {
      onUpdateGoal(tempGoal);
      setGoalSaved(true);
      setTimeout(() => setGoalSaved(false), 2000);
    }
  };

  const toggleInterest = (topic: TopicCategory) => {
    if (selectedInterests.includes(topic)) {
      setSelectedInterests(selectedInterests.filter(t => t !== topic));
    } else {
      setSelectedInterests([...selectedInterests, topic]);
    }
  };

  const handleSaveInterests = () => {
    onUpdateInterests(selectedInterests);
  };

  const handleClearAllData = () => {
    onClearAllData();
    setShowClearConfirm(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20 transition-colors duration-300">
      <div className="max-w-3xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => onNavigate('home')}
            className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors"
          >
            <ArrowLeft className="text-slate-600 dark:text-slate-400" size={24} />
          </button>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Ayarlar</h1>
        </div>

        <div className="space-y-6">

          {/* API Key Section */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Key className="text-white" size={20} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">API Anahtarı</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">Gemini AI için gerekli</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="relative">
                <input
                  type={showApiKey ? 'text' : 'password'}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="AIzaSy..."
                  className="w-full px-4 py-3 pr-12 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-sm"
                />
                <button
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                >
                  {showApiKey ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>

              <div className="flex items-center justify-between">
                <a
                  href="https://aistudio.google.com/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                >
                  Ücretsiz API anahtarı al <ExternalLink size={14} />
                </a>
                <button
                  onClick={handleSaveApiKey}
                  disabled={!apiKey}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all ${apiKeySaved
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-50 disabled:cursor-not-allowed'
                    }`}
                >
                  {apiKeySaved ? <><Check size={16} /> Kaydedildi</> : <><Save size={16} /> Kaydet</>}
                </button>
              </div>

              {!apiKey && (
                <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                  <AlertCircle className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" size={18} />
                  <p className="text-sm text-amber-800 dark:text-amber-300">
                    API anahtarı olmadan yapay zeka sohbet özelliği çalışmaz.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* User Info Section */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
                <User className="text-white" size={20} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Kişisel Bilgiler</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">İsim ve akademik bilgiler</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">İsim</label>
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="Adınız"
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Üniversite</label>
                  <input
                    type="text"
                    value={university}
                    onChange={(e) => setUniversity(e.target.value)}
                    placeholder="Üniversiteniz"
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Alan</label>
                  <input
                    type="text"
                    value={fieldOfStudy}
                    onChange={(e) => setFieldOfStudy(e.target.value)}
                    placeholder="Çalışma alanınız"
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <button
                  onClick={handleSaveUserInfo}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all ${infoSaved
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    }`}
                >
                  {infoSaved ? <><Check size={16} /> Kaydedildi</> : <><Save size={16} /> Kaydet</>}
                </button>
              </div>
            </div>
          </div>

          {/* Weekly Goal Section */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center">
                <Target className="text-white" size={20} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Haftalık Hedef</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">Kaç makale okumayı hedefliyorsun?</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <input
                type="number"
                min="1"
                max="50"
                value={tempGoal}
                onChange={(e) => setTempGoal(parseInt(e.target.value) || 1)}
                className="w-24 px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-center text-lg font-bold focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              <span className="text-slate-600 dark:text-slate-400">makale / hafta</span>
              <button
                onClick={handleSaveGoal}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all ml-auto ${goalSaved
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                  : 'bg-orange-600 hover:bg-orange-700 text-white'
                  }`}
              >
                {goalSaved ? <><Check size={16} /> Kaydedildi</> : <><Save size={16} /> Kaydet</>}
              </button>
            </div>
          </div>

          {/* Interests Section */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center">
                  <span className="text-white text-lg">🎯</span>
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">İlgi Alanları</h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{selectedInterests.length} alan seçildi</p>
                </div>
              </div>
              <button
                onClick={handleSaveInterests}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-sm transition-all"
              >
                <Save size={16} /> Kaydet
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {TOPICS.map(topic => (
                <button
                  key={topic}
                  onClick={() => toggleInterest(topic)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${selectedInterests.includes(topic)
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                >
                  {topic}
                </button>
              ))}
            </div>
          </div>

          {/* Cache Management Section */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-slate-500 to-slate-700 rounded-xl flex items-center justify-center">
                <Database className="text-white" size={20} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Önbellek Yönetimi</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">API verileri önbellekte saklanır</p>
              </div>
            </div>

            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
              Veriler 15-60 dakika boyunca önbellekte saklanır. Güncel veriler için önbelleği temizleyebilirsiniz.
            </p>

            <button
              onClick={() => {
                clearApiCache();
                alert('Önbellek temizlendi!');
              }}
              className="flex items-center gap-2 px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg font-medium text-sm transition-colors"
            >
              <RefreshCw size={16} /> Önbelleği Temizle
            </button>
          </div>

          {/* Danger Zone */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-red-200 dark:border-red-900 p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-pink-600 rounded-xl flex items-center justify-center">
                <Trash2 className="text-white" size={20} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-red-600 dark:text-red-400">Tehlikeli Bölge</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">Bu işlemler geri alınamaz</p>
              </div>
            </div>

            {showClearConfirm ? (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
                <p className="text-red-800 dark:text-red-300 font-medium mb-4">
                  Tüm verileriniz silinecek. Emin misiniz?
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={handleClearAllData}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium text-sm"
                  >
                    Evet, Tümünü Sil
                  </button>
                  <button
                    onClick={() => setShowClearConfirm(false)}
                    className="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg font-medium text-sm"
                  >
                    İptal
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowClearConfirm(true)}
                className="flex items-center gap-2 px-4 py-2 border border-red-300 dark:border-red-800 text-red-600 dark:text-red-400 rounded-lg font-medium text-sm hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              >
                <Trash2 size={16} /> Tüm Verileri Sil
              </button>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};
