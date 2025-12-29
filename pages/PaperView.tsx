
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Paper, PaperHighlight } from '../types';
import { getPaperById } from '../services/mockData';
import { ChatPanel } from '../components/ChatPanel';
import { HighlightPopup, HighlightedText, HighlightEditPopup } from '../components/HighlightPopup';
import {
  startReadingSession,
  endReadingSession,
  savePaperForOffline,
  removeSavedPaper,
  isPaperSavedOffline,
  getHighlightsByPaperId,
  deleteHighlight,
  updateReadingProgress,
  initDB
} from '../services/offlineStorage';
import { ArrowLeft, ExternalLink, Quote, FileText, AlignLeft, Volume2, Pause, Play, Image as ImageIcon, X, Maximize2, Check, Bookmark, Download, WifiOff, Highlighter } from 'lucide-react';

interface PaperViewProps {
  paperId: string;
  onBack: () => void;
  isSaved: boolean;
  onToggleSave: () => void;
  onMarkAsRead: () => void;
}

export const PaperView: React.FC<PaperViewProps> = ({ paperId, onBack, isSaved, onToggleSave, onMarkAsRead }) => {
  const [paper, setPaper] = useState<Paper | undefined>(undefined);
  const [viewMode, setViewMode] = useState<'abstract' | 'fulltext'>('abstract');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const speechRef = useRef<SpeechSynthesisUtterance | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Smart Reading Tracking State
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [readingTime, setReadingTime] = useState(0);
  const [isActivelyReading, setIsActivelyReading] = useState(true);
  const [scrollProgress, setScrollProgress] = useState(0);
  const lastActivityRef = useRef<number>(Date.now());
  const timerRef = useRef<NodeJS.Timeout | null>(null);


  // Highlights State
  const [highlights, setHighlights] = useState<PaperHighlight[]>([]);
  const [showHighlightPopup, setShowHighlightPopup] = useState(false);
  const [selectedText, setSelectedText] = useState('');
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 });

  // Edit Highlight State
  const [editingHighlight, setEditingHighlight] = useState<PaperHighlight | null>(null);
  const [editPopupPosition, setEditPopupPosition] = useState({ x: 0, y: 0 });

  // Offline State
  const [isOfflineSaved, setIsOfflineSaved] = useState(false);
  const [isSavingOffline, setIsSavingOffline] = useState(false);

  // Load paper and initialize
  useEffect(() => {
    // Initialize IndexedDB first
    initDB().catch(console.error);

    const p = getPaperById(paperId);
    setPaper(p);
    setViewMode('abstract');
    setReadingTime(0);
    setScrollProgress(0);

    // Reset scroll
    if (contentRef.current) {
      contentRef.current.scrollTo(0, 0);
    }

    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setSelectedImage(null);
    setIsCopied(false);

    // Load highlights
    const loadHighlights = async () => {
      try {
        const h = await getHighlightsByPaperId(paperId);
        setHighlights(h);
      } catch (e) {
        console.error('Failed to load highlights:', e);
      }
    };
    loadHighlights();

    // Check offline status
    const checkOffline = async () => {
      try {
        const saved = await isPaperSavedOffline(paperId);
        setIsOfflineSaved(saved);
      } catch (e) {
        console.error('Failed to check offline status:', e);
      }
    };
    checkOffline();

    // Start reading session (background tracking)
    const startSession = async () => {
      if (p) {
        try {
          const id = await startReadingSession(paperId, p.title, p.category);
          setSessionId(id);
        } catch (e) {
          console.error('Failed to start reading session:', e);
        }
      }
    };
    startSession();

    return () => {
      window.speechSynthesis.cancel();
    };
  }, [paperId]);

  // Smart Reading Timer
  useEffect(() => {
    timerRef.current = setInterval(() => {
      const now = Date.now();
      const timeSinceActivity = now - lastActivityRef.current;

      // Pause timer if inactive for 30 seconds
      if (timeSinceActivity > 30000) {
        setIsActivelyReading(false);
      } else {
        setIsActivelyReading(true);
        setReadingTime(prev => prev + 1);
      }
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  // Record activity on interaction
  const recordActivity = useCallback(() => {
    lastActivityRef.current = Date.now();
    setIsActivelyReading(true);
  }, []);

  // Scroll tracking
  const handleScroll = useCallback(() => {
    recordActivity();

    if (contentRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = contentRef.current;
      const progress = Math.round((scrollTop / (scrollHeight - clientHeight)) * 100);
      setScrollProgress(Math.max(scrollProgress, progress));

      // Update offline progress
      if (isOfflineSaved) {
        updateReadingProgress(paperId, progress);
      }
    }
  }, [recordActivity, paperId, isOfflineSaved, scrollProgress]);

  // End session on unmount or back
  const handleBack = useCallback(async () => {
    if (sessionId) {
      await endReadingSession(sessionId, scrollProgress, readingTime);
    }
    onBack();
  }, [sessionId, scrollProgress, readingTime, onBack]);

  // Text selection for highlights - DISABLED
  // useEffect(() => {
  //   const handleMouseUp = (e: MouseEvent) => {
  //     setTimeout(() => {
  //       const selection = window.getSelection();
  //       const text = selection?.toString().trim();
  //       if (text && text.length > 3) {
  //         const contentElement = contentRef.current;
  //         if (!contentElement) return;
  //         const range = selection?.getRangeAt(0);
  //         if (!range) return;
  //         const selectionContainer = range.commonAncestorContainer;
  //         const isInContent = contentElement.contains(selectionContainer);
  //         if (isInContent) {
  //           const rect = range.getBoundingClientRect();
  //           if (rect) {
  //             setSelectedText(text);
  //             setPopupPosition({ x: rect.left + rect.width / 2, y: rect.bottom + window.scrollY });
  //             setShowHighlightPopup(true);
  //           }
  //         }
  //       }
  //     }, 10);
  //   };
  //   document.addEventListener('mouseup', handleMouseUp);
  //   return () => {
  //     document.removeEventListener('mouseup', handleMouseUp);
  //   };
  // }, [paper]);

  const handleHighlightAdded = (highlight: PaperHighlight) => {
    setHighlights([...highlights, highlight]);
    setShowHighlightPopup(false);
    window.getSelection()?.removeAllRanges();
  };

  const handleHighlightClick = (highlight: PaperHighlight, event: React.MouseEvent) => {
    // Show edit popup at click position
    event.stopPropagation();
    setEditingHighlight(highlight);
    setEditPopupPosition({ x: event.clientX, y: event.clientY });
  };

  const handleHighlightColorChange = async (highlightId: string, newColor: PaperHighlight['color']) => {
    try {
      // Update in state
      setHighlights(highlights.map(h =>
        h.id === highlightId ? { ...h, color: newColor } : h
      ));
      // Note: Would need to add updateHighlight to offlineStorage for persistence
      setEditingHighlight(null);
    } catch (error) {
      console.error('Failed to update highlight color:', error);
    }
  };

  const handleHighlightDelete = async (highlightId: string) => {
    try {
      await deleteHighlight(highlightId);
      setHighlights(highlights.filter(h => h.id !== highlightId));
      setEditingHighlight(null);
    } catch (error) {
      console.error('Failed to delete highlight:', error);
    }
  };

  const handleViewModeChange = (mode: 'abstract' | 'fulltext') => {
    setViewMode(mode);
    contentRef.current?.scrollTo({ top: 0, behavior: 'smooth' });

    if (mode === 'fulltext') {
      onMarkAsRead();
    }
  };

  // Get source URL for the paper
  const getSourceUrl = (): string | null => {
    if (!paper) return null;

    // arXiv papers
    if (paper.id.startsWith('arxiv-')) {
      const arxivId = paper.id.replace('arxiv-', '');
      return `https://arxiv.org/abs/${arxivId}`;
    }

    // Semantic Scholar papers
    if (paper.id.startsWith('ss-')) {
      const paperId = paper.id.replace('ss-', '');
      return `https://www.semanticscholar.org/paper/${paperId}`;
    }

    // OpenAlex papers
    if (paper.id.startsWith('oa-')) {
      const oaId = paper.id.replace('oa-', '');
      return `https://openalex.org/works/${oaId}`;
    }

    // Fallback to pdfUrl
    if (paper.pdfUrl) {
      return paper.pdfUrl;
    }

    // Fallback to DOI
    if (paper.doi) {
      let doiUrl = paper.doi;
      if (!doiUrl.startsWith('http')) {
        doiUrl = `https://doi.org/${doiUrl.replace(/^doi:/, '')}`;
      }
      return doiUrl;
    }

    return null;
  };

  const sourceUrl = getSourceUrl();

  const handleCite = () => {
    if (!paper) return;

    const authors = paper.authors.join(', ');
    const citation = `${authors} (${paper.publicationYear}). "${paper.title}". ${paper.journal}.`;

    navigator.clipboard.writeText(citation).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    });
  };

  const toggleAudio = () => {
    if (!paper) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else {
      const textToRead = `Makale Başlığı: ${paper.title}. Özet: ${paper.abstract}`;
      const utterance = new SpeechSynthesisUtterance(textToRead);
      utterance.lang = 'tr-TR';
      utterance.rate = 0.9;

      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      speechRef.current = utterance;
      window.speechSynthesis.speak(utterance);
      setIsSpeaking(true);
    }
  };

  const handleSaveOffline = async () => {
    if (!paper) return;

    setIsSavingOffline(true);
    try {
      // Ensure DB is initialized
      await initDB();

      if (isOfflineSaved) {
        await removeSavedPaper(paperId);
        setIsOfflineSaved(false);
      } else {
        await savePaperForOffline(paper);
        setIsOfflineSaved(true);
      }
    } catch (error) {
      console.error('Offline save error:', error);
      alert('Çevrimdışı kaydetme başarısız oldu. Lütfen tekrar deneyin.');
    } finally {
      setIsSavingOffline(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!paper) {
    return (
      <div className="min-h-screen flex items-center justify-center flex-col gap-4 bg-slate-50 dark:bg-slate-950">
        <p className="text-slate-500 dark:text-slate-400">Makale bulunamadı.</p>
        <button onClick={handleBack} className="text-indigo-600 dark:text-indigo-400 hover:underline">Geri Dön</button>
      </div>
    );
  }

  return (
    <div
      className="h-[calc(100vh-64px)] flex flex-col md:flex-row overflow-hidden bg-slate-50 dark:bg-slate-950 transition-colors duration-300 relative"
      onClick={recordActivity}
      onKeyDown={recordActivity}
    >

      {/* Highlight Popup */}
      {showHighlightPopup && (
        <HighlightPopup
          paperId={paperId}
          selectedText={selectedText}
          position={popupPosition}
          onClose={() => setShowHighlightPopup(false)}
          onHighlightAdded={handleHighlightAdded}
        />
      )}

      {/* Highlight Edit Popup */}
      {editingHighlight && (
        <HighlightEditPopup
          highlight={editingHighlight}
          position={editPopupPosition}
          onClose={() => setEditingHighlight(null)}
          onColorChange={handleHighlightColorChange}
          onDelete={handleHighlightDelete}
        />
      )}

      {/* Lightbox Overlay */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setSelectedImage(null)}
        >
          <button
            className="absolute top-6 right-6 text-white/70 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors z-50"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedImage(null);
            }}
          >
            <X size={32} />
          </button>
          <img
            src={selectedImage}
            alt="Full view"
            className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      {/* Reading tracking runs in background - no visible UI */}

      {/* Left Panel: Document Content */}
      <div
        ref={contentRef}
        className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-10 lg:p-16 scroll-smooth"
        onScroll={handleScroll}
      >
        <div className="max-w-3xl mx-auto bg-white dark:bg-slate-900 shadow-sm border border-slate-200 dark:border-slate-800 rounded-xl min-h-[800px] p-12 relative transition-colors duration-300">

          {/* Navigation */}
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={handleBack}
              className="text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-2 text-sm font-medium transition-colors"
            >
              <ArrowLeft size={16} /> Geri Dön
            </button>

            {/* Offline Badge */}
            {isOfflineSaved && (
              <span className="flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-xs font-medium">
                <WifiOff size={12} /> Çevrimdışı
              </span>
            )}
          </div>

          {/* Header */}
          <div className="border-b border-slate-100 dark:border-slate-800 pb-8 mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4 leading-tight text-center">
              {paper.title}
            </h1>

            <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-slate-500 dark:text-slate-400">
              <span className={`font-medium px-2 py-1 rounded ${paper.documentType === 'PROJECT' ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' : 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'}`}>
                {paper.documentType === 'PROJECT' ? 'PROJE' : 'MAKALE'}
              </span>
              <span>{paper.publicationYear}</span>
              <span>•</span>
              <span className="italic">{paper.journal}</span>
            </div>

            <div className="mt-6 flex flex-wrap justify-center gap-2">
              {paper.authors.map((author, i) => (
                <span key={i} className="text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full text-sm">
                  {author}
                </span>
              ))}
            </div>
          </div>

          {/* Actions Toolbar */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-8 border-b border-slate-100 dark:border-slate-800 pb-6">
            {sourceUrl ? (
              <a
                href={sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-slate-900 dark:bg-slate-800 text-white rounded-lg text-sm font-medium hover:bg-slate-800 dark:hover:bg-slate-700 transition-colors"
              >
                <ExternalLink size={16} /> Kaynağa Git
              </a>
            ) : (
              <button
                onClick={() => alert('Bu bir simülasyon makalesidir, gerçek kaynak bulunmamaktadır.')}
                className="flex items-center gap-2 px-4 py-2 bg-slate-400 dark:bg-slate-600 text-white rounded-lg text-sm font-medium cursor-not-allowed"
              >
                <ExternalLink size={16} /> Kaynak Yok
              </button>
            )}

            <button
              onClick={onToggleSave}
              className={`flex items-center gap-2 px-4 py-2 border rounded-lg text-sm font-medium transition-colors ${isSaved ? 'bg-indigo-50 border-indigo-200 text-indigo-700 dark:bg-indigo-900/30 dark:border-indigo-800 dark:text-indigo-400' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
            >
              <Bookmark size={16} fill={isSaved ? "currentColor" : "none"} />
              {isSaved ? 'Kaydedildi' : 'Kaydet'}
            </button>

            <button
              onClick={handleSaveOffline}
              disabled={isSavingOffline}
              className={`flex items-center gap-2 px-4 py-2 border rounded-lg text-sm font-medium transition-colors ${isOfflineSaved ? 'bg-green-50 border-green-200 text-green-700 dark:bg-green-900/30 dark:border-green-800 dark:text-green-400' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
            >
              {isOfflineSaved ? <WifiOff size={16} /> : <Download size={16} />}
              {isOfflineSaved ? 'Çevrimdışı' : 'İndir'}
            </button>

            <button
              onClick={handleCite}
              className={`flex items-center gap-2 px-4 py-2 border rounded-lg text-sm font-medium transition-colors ${isCopied ? 'bg-green-50 border-green-200 text-green-700 dark:bg-green-900/30 dark:border-green-800 dark:text-green-400' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
            >
              {isCopied ? <Check size={16} /> : <Quote size={16} />}
              {isCopied ? 'Kopyalandı' : 'Alıntıla'}
            </button>

            <button
              onClick={toggleAudio}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${isSpeaking
                ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800'
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
            >
              {isSpeaking ? <Pause size={16} className="animate-pulse" /> : <Play size={16} />}
              {isSpeaking ? 'Durdur' : 'Dinle'}
            </button>
          </div>

          {/* Content Tabs */}
          <div className="flex justify-center gap-6 mb-6 border-b border-slate-200 dark:border-slate-800">
            <button
              onClick={() => handleViewModeChange('abstract')}
              className={`pb-3 text-sm font-bold flex items-center gap-2 transition-all ${viewMode === 'abstract'
                ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                }`}
            >
              <AlignLeft size={16} /> Özet
            </button>
            <button
              onClick={() => handleViewModeChange('fulltext')}
              className={`pb-3 text-sm font-bold flex items-center gap-2 transition-all ${viewMode === 'fulltext'
                ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                }`}
            >
              <FileText size={16} /> Tam Metin
            </button>
          </div>

          {/* Highlight Hint - DISABLED */}
          {/* <div className="mb-4 flex items-center justify-center gap-2 text-xs text-slate-400">
            <Highlighter size={12} />
            <span>Metin seçerek vurgulayabilirsiniz</span>
          </div> */}

          {/* Content Area */}
          {viewMode === 'abstract' ? (
            <div className="mb-10 animate-in fade-in duration-300">

              {/* Audio Player Indicator */}
              {isSpeaking && (
                <div className="mb-6 bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-100 dark:border-indigo-800 p-4 rounded-xl flex items-center gap-4">
                  <div className="w-10 h-10 bg-indigo-600 dark:bg-indigo-500 rounded-full flex items-center justify-center text-white animate-pulse">
                    <Volume2 size={20} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-indigo-900 dark:text-indigo-200">Yapay Zeka Okuyor...</p>
                    <div className="w-full bg-indigo-200 dark:bg-indigo-900 h-1 rounded-full mt-2 overflow-hidden">
                      <div className="h-full bg-indigo-600 dark:bg-indigo-500 w-1/3 animate-[shimmer_2s_infinite_linear] -translate-x-full"></div>
                    </div>
                  </div>
                </div>
              )}

              <div className="max-w-2xl mx-auto text-center">
                <p className="text-lg text-slate-700 dark:text-slate-300 leading-loose font-serif mb-8">
                  <HighlightedText
                    text={paper.abstract}
                    highlights={highlights}
                    onHighlightClick={handleHighlightClick}
                  />
                </p>
              </div>

              {/* Figures Section */}
              {paper.figures && paper.figures.length > 0 && (
                <div className="mt-10 pt-8 border-t border-slate-100 dark:border-slate-800">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4 flex items-center justify-center gap-2">
                    <ImageIcon size={16} className="text-slate-400" />
                    Çalışmadan Görseller
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {paper.figures.map((url, index) => (
                      <div
                        key={index}
                        className="group cursor-pointer relative"
                        onClick={() => setSelectedImage(url)}
                      >
                        <div className="bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 aspect-video mb-2 hover:shadow-md transition-all relative">
                          <img src={url} alt={`Figure ${index + 1}`} className="w-full h-full object-cover mix-blend-multiply dark:mix-blend-normal opacity-90 group-hover:opacity-100 transition-opacity" />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                            <Maximize2 className="text-white drop-shadow-md" size={24} />
                          </div>
                        </div>
                        <p className="text-xs text-center text-slate-500 dark:text-slate-400 font-medium group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                          Şekil {index + 1}: Büyütmek için tıklayın
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-12 p-6 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 text-center">
                <p className="text-slate-500 dark:text-slate-400 mb-4">Bu çalışmanın tam metnini okumak için "Tam Metin" sekmesine geçiniz.</p>
                <button
                  onClick={() => handleViewModeChange('fulltext')}
                  className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline"
                >
                  Tam Metni Görüntüle
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-8 animate-in fade-in duration-300 font-serif text-slate-800 dark:text-slate-200 leading-relaxed">
              <section>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3 font-sans">1. Giriş</h2>
                <p className="mb-4">
                  Bu çalışma, {paper.keywords[0] || 'ilgili konu'} alanındaki güncel gelişmeleri ele alarak, Türkiye'deki uygulamalarını {paper.university} bünyesinde yürütülen araştırmalar ışığında incelemeyi amaçlamaktadır. {paper.abstract}
                </p>
              </section>

              {paper.figures && paper.figures[0] && (
                <figure
                  className="my-8 bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700 group cursor-pointer"
                  onClick={() => setSelectedImage(paper.figures[0])}
                >
                  <div className="relative rounded-lg overflow-hidden">
                    <img src={paper.figures[0]} alt="Fig 1" className="w-full mix-blend-multiply dark:mix-blend-normal" />
                  </div>
                  <figcaption className="text-center text-sm text-slate-500 dark:text-slate-400 mt-3 font-sans">
                    <strong>Şekil 1:</strong> Çalışmanın temel bulgularını özetleyen diyagram.
                  </figcaption>
                </figure>
              )}

              <section>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3 font-sans">2. Materyal ve Yöntem</h2>
                <p className="mb-4">
                  Araştırma kapsamında {paper.publicationYear - 1} ve {paper.publicationYear} yılları arasında toplanan veriler kullanılmıştır. Veri seti, hem nicel hem de nitel analiz yöntemleriyle değerlendirilmiştir.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3 font-sans">3. Bulgular</h2>
                <p className="mb-4">
                  Analiz sonuçları, hipotezimizi destekler niteliktedir. Özellikle {paper.keywords[0]} uygulamalarının verimlilik üzerinde istatistiksel olarak anlamlı bir pozitif etkisi gözlemlenmiştir.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3 font-sans">4. Sonuç</h2>
                <p>
                  Sonuç olarak, bu çalışma {paper.title} konusunun önemini vurgulamaktadır.
                </p>
              </section>
            </div>
          )}

        </div>

      </div>

      {/* Right Panel: Chat Only */}
      <div className="w-full md:w-[400px] lg:w-[450px] shrink-0 h-[50vh] md:h-full border-t md:border-t-0 md:border-l border-slate-200 dark:border-slate-800">
        <ChatPanel paper={paper} />
      </div>

    </div>
  );
};
