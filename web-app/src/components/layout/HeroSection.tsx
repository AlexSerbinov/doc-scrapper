"use client";

import { ArrowRight } from "lucide-react";
import { useState } from "react";
import { ProcessingModal } from "./ProcessingModal";

export function HeroSection() {
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showProcessingModal, setShowProcessingModal] = useState(false);
  const [submittedUrl, setSubmittedUrl] = useState("");
  const [sessionId, setSessionId] = useState("");
  const [collectionName, setCollectionName] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;
    
    setIsLoading(true);
    
    // Валідація URL
    try {
      new URL(url);
    } catch {
      alert("Будь ласка, введіть правильний URL (наприклад, https://docs.example.com)");
      setIsLoading(false);
      return;
    }

    try {
      // Викликаємо реальний API для початку scraping'у
      const response = await fetch('/api/scrape', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to start scraping');
      }

      if (result.success) {
        setSubmittedUrl(url);
        setSessionId(result.sessionId);
        setCollectionName(result.collectionName);
        setShowProcessingModal(true);
        console.log('Scraping started:', result);
      } else {
        throw new Error(result.message || 'Unknown error');
      }

    } catch (error) {
      console.error('Error starting scraping:', error);
      alert(`Помилка запуску обробки: ${error instanceof Error ? error.message : 'Невідома помилка'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleModalClose = () => {
    setShowProcessingModal(false);
    setUrl(""); // Очистити форму
    setSessionId("");
    setCollectionName("");
  };

  return (
    <>
      <section 
        id="hero" 
        className="relative min-h-screen bg-gradient-radial from-indigo-900 via-slate-900 to-black pt-20 flex items-center justify-center overflow-hidden"
      >
        {/* Космічний пил - CSS версія */}
        <div className="absolute inset-0 cosmic-background">
          <div className="cosmic-stars"></div>
          <div className="cosmic-stars cosmic-stars-2"></div>
          <div className="cosmic-stars cosmic-stars-3"></div>
        </div>

        <div className="relative z-10 max-w-4xl mx-auto text-center w-full px-4 sm:px-6 lg:px-8">
          {/* Заголовок */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-slate-100 mb-6 leading-tight">
            Розблокуйте Силу Вашої{" "}
            <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              Документації з AI
            </span>
          </h1>

          {/* Підзаголовок */}
          <p className="text-base sm:text-lg md:text-xl text-slate-300 mb-8 max-w-2xl mx-auto leading-relaxed">
            Миттєво перетворіть вашу онлайн-документацію на інтерактивного AI-помічника. 
            Отримуйте відповіді, а не просто результати пошуку.
          </p>

          {/* Форма активації тріалу */}
          <div className="max-w-xl mx-auto mb-8">
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://docs.yourproject.com"
                  className="w-full px-4 sm:px-6 py-3 sm:py-4 bg-slate-800/70 backdrop-blur-sm border border-slate-700 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base sm:text-lg"
                  required
                  disabled={isLoading}
                />
              </div>
              <button
                type="submit"
                disabled={isLoading || !url.trim()}
                className="px-6 sm:px-8 py-3 sm:py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 min-w-[180px] sm:min-w-[200px] text-base sm:text-lg"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Запускаємо...
                  </>
                ) : (
                  <>
                    Почати Безкоштовно
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Додаткова інформація */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 text-slate-400 text-sm">
            <div className="flex items-center gap-2">
              ✨ 7 днів безкоштовно
            </div>
            <div className="flex items-center gap-2">
              🚀 Готовий за 5 хвилин
            </div>
            <div className="flex items-center gap-2">
              💳 Картка не потрібна
            </div>
          </div>

          {/* Приклади сумісності */}
          <div className="mt-12 sm:mt-16">
            <p className="text-slate-500 text-sm mb-4">
              Працює з усіма популярними платформами документації:
            </p>
            <div className="flex flex-wrap justify-center gap-3 sm:gap-6 text-slate-400 text-sm">
              <span className="bg-slate-800/50 backdrop-blur-sm px-3 py-1 rounded">GitBook</span>
              <span className="bg-slate-800/50 backdrop-blur-sm px-3 py-1 rounded">Notion</span>
              <span className="bg-slate-800/50 backdrop-blur-sm px-3 py-1 rounded">Confluence</span>
              <span className="bg-slate-800/50 backdrop-blur-sm px-3 py-1 rounded">GitLab Pages</span>
              <span className="bg-slate-800/50 backdrop-blur-sm px-3 py-1 rounded">Sphinx</span>
              <span className="bg-slate-800/50 backdrop-blur-sm px-3 py-1 rounded">MkDocs</span>
            </div>
          </div>
        </div>
      </section>

      {/* Processing Modal */}
      <ProcessingModal
        isOpen={showProcessingModal}
        onClose={handleModalClose}
        url={submittedUrl}
        sessionId={sessionId}
        collectionName={collectionName}
      />
    </>
  );
} 