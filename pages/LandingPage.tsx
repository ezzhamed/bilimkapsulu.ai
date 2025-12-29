
import React, { useRef } from 'react';
import { BookOpen, Sparkles, Users, ArrowRight, Globe } from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted }) => {
  const featuresRef = useRef<HTMLDivElement>(null);

  const scrollToFeatures = () => {
    featuresRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 transition-colors duration-300">
      {/* Navbar */}
      <nav className="container mx-auto px-6 py-6 flex justify-between items-center">
        <div className="flex flex-col leading-[0.85] select-none cursor-pointer">
          <span className="font-black text-2xl tracking-tight text-slate-900 dark:text-white">Bilim</span>
          <span className="font-black text-2xl tracking-tight text-slate-900 dark:text-white">
            Kapsulu<span className="text-teal-700 dark:text-teal-400">.ai</span>
          </span>
        </div>
        <div className="flex gap-4">
          <button onClick={onGetStarted} className="bg-indigo-600 text-white px-6 py-2.5 rounded-full font-medium hover:bg-indigo-700 transition-colors flex items-center gap-2">
            Hemen Başla <ArrowRight size={18} />
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="container mx-auto px-6 py-16 md:py-28 flex flex-col md:flex-row items-center gap-12">
        <div className="flex-1 space-y-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 dark:bg-teal-900/30 text-teal-800 dark:text-teal-300 text-sm font-medium border border-teal-100 dark:border-teal-800">
            <Sparkles size={14} />
            <span>Yapay Zeka Destekli Akademik Arşiv</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-slate-900 dark:text-white leading-[1.1]">
            Bilimsel Geleceği, <br />
            <span className="text-indigo-600 dark:text-indigo-400">Bugünden Keşfet.</span>
          </h1>
          <p className="text-xl text-slate-500 dark:text-slate-400 leading-relaxed max-w-lg">
            Harvard, MIT ve Stanford gibi üniversitelerin yayınlarına Türkçe erişin.
            Yapay zeka ile özetleyin, analiz edin ve tartışın.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <button onClick={onGetStarted} className="flex items-center justify-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-8 py-4 rounded-full text-lg font-bold hover:bg-slate-800 dark:hover:bg-slate-200 transition-all shadow-lg shadow-slate-200 dark:shadow-none">
              Hemen Başla <ArrowRight size={20} />
            </button>
            <button
              onClick={scrollToFeatures}
              className="flex items-center justify-center gap-2 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 px-8 py-4 rounded-full text-lg font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
            >
              Nasıl Çalışır?
            </button>
          </div>

          <div className="flex items-center gap-4 pt-4 text-sm text-slate-400 dark:text-slate-500">
            <div className="flex -space-x-2">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 border-2 border-white dark:border-slate-950"></div>
              ))}
            </div>
            <p>Ücretsiz ve açık kaynak</p>
          </div>
        </div>

        <div className="flex-1 relative">
          <div className="relative z-10 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 max-w-md mx-auto rotate-3 hover:rotate-0 transition-transform duration-500">
            <div className="flex items-center gap-3 mb-4 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                <BookOpen size={20} />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white">Attention Is All You Need</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Google Research • Yapay Zeka</p>
              </div>
            </div>
            <div className="space-y-2 mb-4">
              <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded w-full"></div>
              <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded w-[90%]"></div>
              <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded w-[95%]"></div>
            </div>
            <div className="bg-indigo-50 dark:bg-indigo-900/30 p-3 rounded-lg border border-indigo-100 dark:border-indigo-800">
              <div className="flex gap-2 text-indigo-700 dark:text-indigo-300 text-xs font-bold mb-1">
                <Sparkles size={12} /> AI Özeti
              </div>
              <p className="text-xs text-indigo-900/70 dark:text-indigo-200/70 leading-relaxed">
                Transformer mimarisi, sıralı verileri işlemek için dikkat mekanizmalarını kullanır...
              </p>
            </div>
          </div>

          {/* Decorative Elements */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-tr from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 rounded-full blur-3xl -z-10 opacity-50"></div>
        </div>
      </div>

      {/* Features Grid */}
      <div ref={featuresRef} className="bg-slate-50 dark:bg-slate-900 py-20">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Araştırma Sürecinizi Hızlandırın</h2>
            <p className="text-slate-500 dark:text-slate-400">Dil bariyerlerini kaldırın, karmaşık makaleleri saniyeler içinde anlayın.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Globe, title: "Türkçe Kaynaklar", desc: "Tüm içerikler anında profesyonel düzeyde Türkçe'ye çevrilir." },
              { icon: Sparkles, title: "AI Asistanı", desc: "Her makale için özel eğitilmiş asistan ile sohbet edin ve sorular sorun." },
              { icon: Users, title: "Kişiselleştirilmiş Akış", desc: "İlgi alanlarınıza göre haftalık seçilmiş makale listeleri alın." }
            ].map((feat, idx) => (
              <div key={idx} className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-500 transition-colors">
                <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center mb-6">
                  <feat.icon size={24} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{feat.title}</h3>
                <p className="text-slate-500 dark:text-slate-400 leading-relaxed">{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* API Key Notice */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-700 py-12">
        <div className="container mx-auto px-6 text-center">
          <h3 className="text-2xl font-bold text-white mb-4">Kurulum Gerektirmez!</h3>
          <p className="text-indigo-100 max-w-xl mx-auto mb-6">
            Sadece ücretsiz bir Gemini API anahtarı alın ve hemen kullanmaya başlayın.
            Tüm verileriniz cihazınızda güvenle saklanır.
          </p>
          <button
            onClick={onGetStarted}
            className="bg-white text-indigo-700 px-8 py-3 rounded-full font-bold hover:bg-indigo-50 transition-colors"
          >
            Başlamak İçin Tıklayın
          </button>
        </div>
      </div>
    </div>
  );
};
