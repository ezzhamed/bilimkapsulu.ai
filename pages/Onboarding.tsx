
import React, { useState } from 'react';
import { TopicCategory } from '../types';
import { TOPICS } from '../services/mockData';
import { Sparkles, Check, ArrowRight, Target, ChevronLeft, User, Key, ExternalLink, Eye, EyeOff, AlertCircle } from 'lucide-react';

interface OnboardingProps {
  onComplete: (interests: TopicCategory[], weeklyGoal: number) => void;
}

export const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  // Step: 1 = Personal Info, 2 = API Key, 3 = Interests, 4 = Weekly Goal
  const [step, setStep] = useState(1);

  // Step 1: Personal Info
  const [userName, setUserName] = useState('');
  const [university, setUniversity] = useState('');
  const [fieldOfStudy, setFieldOfStudy] = useState('');

  // Step 2: API Key
  const [apiKey, setApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);

  // Step 3: Interests
  const [selected, setSelected] = useState<TopicCategory[]>([]);

  // Step 4: Goal
  const [goal, setGoal] = useState<number>(5);

  const toggleTopic = (topic: TopicCategory) => {
    if (selected.includes(topic)) {
      setSelected(selected.filter(t => t !== topic));
    } else {
      setSelected([...selected, topic]);
    }
  };

  const handleStep1Next = () => {
    // Save personal info to localStorage
    localStorage.setItem('userName', userName);
    localStorage.setItem('userUniversity', university);
    localStorage.setItem('userFieldOfStudy', fieldOfStudy);
    setStep(2);
  };

  const handleStep2Next = () => {
    // Save API key to localStorage
    if (apiKey) {
      localStorage.setItem('gemini_api_key', apiKey);
    }
    setStep(3);
  };

  const handleStep2Skip = () => {
    setStep(3);
  };

  const handleStep3Next = () => {
    setStep(4);
  };

  const handleFinish = () => {
    onComplete(selected, goal);
  };

  const totalSteps = 4;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4 transition-colors duration-300">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl dark:shadow-none max-w-3xl w-full p-8 md:p-12 animate-in fade-in zoom-in duration-300 border border-transparent dark:border-slate-800">

        {/* Step Indicator */}
        <div className="flex justify-center gap-2 mb-8">
          {[1, 2, 3, 4].map(s => (
            <div
              key={s}
              className={`h-1.5 w-8 rounded-full transition-colors ${step >= s ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-700'}`}
            ></div>
          ))}
        </div>

        {/* Step 1: Personal Info */}
        {step === 1 && (
          <>
            <div className="text-center mb-10">
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <User size={32} />
              </div>
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-3">Hoş Geldiniz!</h2>
              <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto text-lg">
                Sizi tanımak istiyoruz. Lütfen bilgilerinizi girin.
              </p>
            </div>

            <div className="max-w-md mx-auto space-y-6 mb-10">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  İsminiz <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="Adınızı girin"
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  autoFocus
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Üniversite (İsteğe bağlı)
                  </label>
                  <input
                    type="text"
                    value={university}
                    onChange={(e) => setUniversity(e.target.value)}
                    placeholder="Üniversiteniz"
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Çalışma Alanı (İsteğe bağlı)
                  </label>
                  <input
                    type="text"
                    value={fieldOfStudy}
                    onChange={(e) => setFieldOfStudy(e.target.value)}
                    placeholder="Örn: Bilgisayar Mühendisliği"
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col items-center gap-4">
              <button
                onClick={handleStep1Next}
                disabled={!userName.trim()}
                className="w-full md:w-auto bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-10 py-4 rounded-full font-bold text-lg hover:bg-slate-800 dark:hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg flex items-center justify-center gap-2"
              >
                Devam Et <ArrowRight size={20} />
              </button>

              {!userName.trim() && (
                <p className="text-sm text-slate-400 animate-pulse">
                  Devam etmek için isminizi girin.
                </p>
              )}
            </div>
          </>
        )}

        {/* Step 2: API Key */}
        {step === 2 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300">
            <button
              onClick={() => setStep(1)}
              className="mb-6 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white flex items-center gap-2 text-sm font-medium"
            >
              <ChevronLeft size={16} /> Geri Dön
            </button>

            <div className="text-center mb-10">
              <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-600 text-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Key size={32} />
              </div>
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-3">API Anahtarı</h2>
              <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto text-lg">
                Yapay zeka sohbet özelliği için Gemini API anahtarınızı girin.
              </p>
            </div>

            <div className="max-w-md mx-auto space-y-6 mb-10">
              <div className="relative">
                <input
                  type={showApiKey ? 'text' : 'password'}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="AIzaSy..."
                  className="w-full px-4 py-4 pr-12 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono text-sm"
                />
                <button
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                >
                  {showApiKey ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>

              <a
                href="https://aistudio.google.com/apikey"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 p-4 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-xl text-indigo-700 dark:text-indigo-300 font-medium hover:bg-indigo-100 dark:hover:bg-indigo-900/30 transition-colors"
              >
                <ExternalLink size={18} />
                Ücretsiz API Anahtarı Al (Google AI Studio)
              </a>

              <div className="flex items-start gap-2 p-4 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl">
                <AlertCircle className="text-slate-500 shrink-0 mt-0.5" size={18} />
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  API anahtarı yalnızca cihazınızda saklanır. Hiçbir yere gönderilmez.
                </p>
              </div>
            </div>

            <div className="flex flex-col items-center gap-4">
              <button
                onClick={handleStep2Next}
                className="w-full md:w-auto bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-10 py-4 rounded-full font-bold text-lg hover:bg-slate-800 dark:hover:bg-slate-200 transition-all shadow-lg flex items-center justify-center gap-2"
              >
                {apiKey ? 'Devam Et' : 'Atla ve Devam Et'} <ArrowRight size={20} />
              </button>

              {!apiKey && (
                <p className="text-sm text-amber-600 dark:text-amber-400">
                  API anahtarı olmadan yapay zeka sohbet özelliği çalışmaz.
                </p>
              )}
            </div>
          </div>
        )}

        {/* Step 3: Interests */}
        {step === 3 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300">
            <button
              onClick={() => setStep(2)}
              className="mb-6 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white flex items-center gap-2 text-sm font-medium"
            >
              <ChevronLeft size={16} /> Geri Dön
            </button>

            <div className="text-center mb-10">
              <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                <Sparkles size={32} />
              </div>
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-3">İlgi Alanlarınızı Seçin</h2>
              <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto text-lg">
                Size en uygun akademik içeriği sunabilmemiz için lütfen takip etmek istediğiniz konuları işaretleyin.
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10 h-[350px] overflow-y-auto custom-scrollbar pr-2">
              {TOPICS.map(topic => (
                <button
                  key={topic}
                  onClick={() => toggleTopic(topic)}
                  className={`p-4 rounded-xl border text-sm font-bold transition-all flex flex-col items-center justify-center gap-3 h-28 group relative overflow-hidden
                    ${selected.includes(topic)
                      ? 'border-indigo-600 bg-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-none scale-105'
                      : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:border-indigo-300 dark:hover:border-indigo-500 hover:bg-slate-50 dark:hover:bg-slate-700'
                    }
                  `}
                >
                  <span className="relative z-10 text-center">{topic}</span>
                  {selected.includes(topic) && (
                    <div className="absolute top-2 right-2">
                      <Check size={14} className="text-indigo-200" />
                    </div>
                  )}
                </button>
              ))}
            </div>

            <div className="flex flex-col items-center gap-4">
              <button
                onClick={handleStep3Next}
                disabled={selected.length === 0}
                className="w-full md:w-auto bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-10 py-4 rounded-full font-bold text-lg hover:bg-slate-800 dark:hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg flex items-center justify-center gap-2"
              >
                Devam Et <ArrowRight size={20} />
              </button>

              {selected.length === 0 && (
                <p className="text-sm text-slate-400 animate-pulse">
                  Devam etmek için en az bir konu seçin.
                </p>
              )}
            </div>
          </div>
        )}

        {/* Step 4: Weekly Goal */}
        {step === 4 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300">
            <button
              onClick={() => setStep(3)}
              className="mb-6 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white flex items-center gap-2 text-sm font-medium"
            >
              <ChevronLeft size={16} /> Geri Dön
            </button>

            <div className="text-center mb-10">
              <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                <Target size={32} />
              </div>
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-3">Haftalık Hedef Belirleyin</h2>
              <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto text-lg">
                Bu hafta kaç akademik makale incelemek istersiniz? Küçük adımlarla başlamak iyidir.
              </p>
            </div>

            <div className="flex flex-col items-center justify-center mb-12">
              <div className="text-6xl font-black text-slate-900 dark:text-white mb-8 tabular-nums">
                {goal} <span className="text-2xl text-slate-400 font-medium">makale</span>
              </div>

              <div className="w-full max-w-md px-4">
                <input
                  type="range"
                  min="1"
                  max="20"
                  step="1"
                  value={goal}
                  onChange={(e) => setGoal(parseInt(e.target.value))}
                  className="w-full h-3 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
                <div className="flex justify-between text-xs text-slate-400 mt-2 font-bold uppercase">
                  <span>Hafif (1)</span>
                  <span>Orta (10)</span>
                  <span>Yoğun (20)</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mt-8 w-full max-w-md">
                {[3, 5, 10].map(val => (
                  <button
                    key={val}
                    onClick={() => setGoal(val)}
                    className={`py-2 px-4 rounded-lg text-sm font-bold border transition-colors ${goal === val
                        ? 'bg-indigo-50 dark:bg-indigo-900/30 border-indigo-600 text-indigo-700 dark:text-indigo-300'
                        : 'border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-indigo-300'
                      }`}
                  >
                    {val} Makale
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-center">
              <button
                onClick={handleFinish}
                className="w-full md:w-auto bg-emerald-600 text-white px-12 py-4 rounded-full font-bold text-lg hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200 dark:shadow-none flex items-center justify-center gap-2"
              >
                Başlayalım <Check size={20} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
