"use client";

import { ArrowRight } from "lucide-react";
import { useState } from "react";

export function HeroSection() {
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;
    
    setIsLoading(true);
    // TODO: Додати обробку форми пізніше
    console.log("URL submitted:", url);
    
    // Simulate processing
    setTimeout(() => {
      setIsLoading(false);
    }, 3000);
  };

  return (
    <section className="min-h-screen bg-slate-900 pt-16 flex items-center justify-center px-4">
      <div className="max-w-4xl mx-auto text-center">
        {/* Заголовок */}
        <h1 className="text-5xl md:text-6xl font-bold text-slate-50 mb-6">
          Розблокуйте Силу Вашої Документації з{" "}
          <span className="text-blue-400">AI</span>
        </h1>

        {/* Підзаголовок */}
        <p className="text-xl md:text-2xl text-slate-300 mb-12 max-w-3xl mx-auto">
          Миттєво перетворіть вашу онлайн-документацію на інтерактивного AI-помічника. 
          Отримуйте відповіді, а не просто результати пошуку.
        </p>

        {/* Форма Активації Тріалу */}
        <div className="max-w-2xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Label для поля URL */}
            <label 
              htmlFor="documentation-url" 
              className="block text-slate-200 text-lg mb-2"
            >
              Вставте посилання на вашу публічну документацію:
            </label>

            {/* Текстове поле для URL */}
            <div className="flex flex-col sm:flex-row gap-4">
              <input
                id="documentation-url"
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://docs.example.com"
                className="flex-1 w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-md text-slate-100 placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-colors"
                required
              />
              
              {/* Кнопка CTA */}
              <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white font-semibold rounded-md transition-colors flex items-center justify-center space-x-2 whitespace-nowrap"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Обробка...</span>
                  </>
                ) : (
                  <>
                    <span>Побачити на Вашій Документації</span>
                    <ArrowRight className="h-5 w-5" />
                  </>
                )}
              </button>
            </div>

            {/* Примітка під кнопкою */}
            <p className="text-sm text-slate-400 mt-4">
              Безкоштовний тріал на 7 днів. 100 запитів. Кредитна картка не потрібна.
            </p>
          </form>
        </div>
      </div>
    </section>
  );
} 