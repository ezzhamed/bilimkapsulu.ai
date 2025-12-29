
import React, { useEffect, useRef, useState } from 'react';
import { Paper, ChatMessage } from '../types';
import { Send, Sparkles, User, Key, ExternalLink } from 'lucide-react';
import { createPaperChatSession, generateSuggestedQuestions, isApiKeyConfigured } from '../services/geminiService';
import { GenerateContentResponse } from '@google/genai';

interface ChatPanelProps {
  paper: Paper;
}

export const ChatPanel: React.FC<ChatPanelProps> = ({ paper }) => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [hasApiKey, setHasApiKey] = useState(false);

  const chatSessionRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Check API key and Initialize Chat Session
  useEffect(() => {
    const initChat = async () => {
      // Check if API key is configured
      const keyConfigured = isApiKeyConfigured();
      setHasApiKey(keyConfigured);

      if (!keyConfigured) {
        setMessages([{
          id: 'no-key',
          role: 'model',
          text: `API anahtarı bulunamadı. Yapay zeka sohbet özelliğini kullanmak için lütfen Ayarlar sayfasından API anahtarınızı girin.`,
          timestamp: Date.now()
        }]);
        return;
      }

      try {
        const context = `Başlık: ${paper.title}\nÖzet: ${paper.abstract}\nYazarlar: ${paper.authors.join(', ')}`;
        chatSessionRef.current = createPaperChatSession(context);

        // Add initial greeting
        setMessages([{
          id: 'init',
          role: 'model',
          text: `Merhaba! Ben **"${paper.title}"** için yapay zeka asistanınızım. Bu araştırmayı anlamanıza nasıl yardımcı olabilirim?`,
          timestamp: Date.now()
        }]);

        // Get suggestions
        const q = await generateSuggestedQuestions(paper.abstract);
        setSuggestions(q);
      } catch (error: any) {
        if (error.message === 'API_KEY_NOT_CONFIGURED') {
          setHasApiKey(false);
          setMessages([{
            id: 'no-key',
            role: 'model',
            text: `API anahtarı bulunamadı. Yapay zeka sohbet özelliğini kullanmak için lütfen Ayarlar sayfasından API anahtarınızı girin.`,
            timestamp: Date.now()
          }]);
        } else {
          console.error("Chat init error:", error);
          setMessages([{
            id: 'error',
            role: 'model',
            text: `Sohbet başlatılırken bir hata oluştu. Lütfen API anahtarınızı kontrol edin.`,
            timestamp: Date.now()
          }]);
        }
      }
    };

    initChat();
  }, [paper]);

  // Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (text: string) => {
    if (!text.trim() || isLoading || !hasApiKey) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: text,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);
    setSuggestions([]); // Clear suggestions after interaction

    try {
      const result = await chatSessionRef.current.sendMessage({ message: text });
      const responseText = (result as GenerateContentResponse).text; // Access text property directly

      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: responseText || "Üzgünüm, bir yanıt oluşturamadım.",
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (error) {
      console.error("Chat error", error);
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: "Üzgünüm, isteğinizi işlerken bir hata oluştu.",
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none transition-colors duration-300">

      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 backdrop-blur-sm">
        <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-sm">
          <Sparkles size={16} />
        </div>
        <div>
          <h3 className="font-bold text-sm text-slate-900 dark:text-white">AI Asistan</h3>
          <p className="text-[10px] text-slate-500 dark:text-slate-400">Makale hakkında sorular sorun</p>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-4 bg-slate-50/30 dark:bg-slate-950/30 custom-scrollbar">
        <div className="space-y-4">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'model' ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                }`}>
                {msg.role === 'model' ? <Sparkles size={16} /> : <User size={16} />}
              </div>
              <div className={`max-w-[85%] rounded-2xl p-3 text-sm leading-relaxed shadow-sm ${msg.role === 'user'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200'
                }`}>
                {/* Simple Markdown simulation for bold text */}
                {msg.text.split('**').map((part, i) =>
                  i % 2 === 1 ? <strong key={i}>{part}</strong> : part
                )}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center shrink-0 animate-pulse">
                <Sparkles size={16} className="text-indigo-600 dark:text-indigo-400" />
              </div>
              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-3 text-sm text-slate-500 dark:text-slate-400 shadow-sm">
                Düşünüyor...
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />

          {/* No API Key Message */}
          {!hasApiKey && (
            <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
              <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300 font-medium mb-2">
                <Key size={16} />
                API Anahtarı Gerekli
              </div>
              <p className="text-sm text-amber-800 dark:text-amber-200 mb-3">
                Yapay zeka sohbet özelliğini kullanmak için ücretsiz bir Gemini API anahtarı eklemeniz gerekiyor.
              </p>
              <a
                href="https://aistudio.google.com/apikey"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm text-amber-700 dark:text-amber-300 hover:underline font-medium"
              >
                API Anahtarı Al <ExternalLink size={14} />
              </a>
            </div>
          )}

          {/* Suggested Questions Chips */}
          {hasApiKey && messages.length < 3 && !isLoading && suggestions.length > 0 && (
            <div className="flex flex-col gap-2 mt-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wider ml-1">Önerilen Sorular</span>
              {suggestions.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(q)}
                  className="text-left p-2.5 text-xs text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-100 dark:border-indigo-800 rounded-xl hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
        <div className="relative flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend(input)}
            placeholder={hasApiKey ? "Bu makale hakkında herhangi bir şey sorun..." : "API anahtarı gerekli..."}
            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white text-sm rounded-full pl-4 pr-12 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-slate-800 transition-all placeholder:text-slate-400 disabled:opacity-50"
            disabled={isLoading || !hasApiKey}
          />
          <button
            onClick={() => handleSend(input)}
            disabled={!input.trim() || isLoading || !hasApiKey}
            className="absolute right-2 p-1.5 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 disabled:opacity-50 disabled:hover:bg-indigo-600 transition-colors"
          >
            <Send size={16} />
          </button>
        </div>
        <div className="text-[10px] text-center text-slate-400 mt-2">
          {hasApiKey ? "Yapay zeka hatalı bilgi üretebilir." : "Ayarlar sayfasından API anahtarınızı girin."}
        </div>
      </div>
    </div>
  );
};
