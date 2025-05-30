import React from 'react';
import { Button } from '@/components/ui/Button';
import { Bot, Sparkles, ArrowRight, Search } from 'lucide-react';

interface HeroSectionProps {
  onGetStarted?: () => void;
}

export function HeroSection({ onGetStarted }: HeroSectionProps) {
  const handleGetStarted = () => {
    if (onGetStarted) {
      onGetStarted();
    } else {
      // Scroll to chat section
      const chatSection = document.getElementById('chat-section');
      chatSection?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const exampleQueries = [
    "Як використовувати AI SDK для streaming?",
    "Що таке Computer Use в AI?",
    "Покажи приклад embeddings",
    "Як налаштувати chat completion?"
  ];

  // Background pattern URL
  const backgroundPattern = "data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23e0e7ff' fill-opacity='0.3'%3E%3Ccircle cx='7' cy='7' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E";

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Background decoration */}
      <div 
        className="absolute inset-0 opacity-30"
        style={{ backgroundImage: `url("${backgroundPattern}")` }}
      ></div>
      
      <div className="relative container mx-auto px-4 py-20 lg:py-28">
        <div className="text-center max-w-4xl mx-auto">
          
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 rounded-full px-4 py-2 text-sm font-medium mb-6">
            <Sparkles size={16} />
            <span>AI-Powered Documentation Assistant</span>
          </div>

          {/* Main Heading */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
            Знайдіть відповіді у{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              документації
            </span>{' '}
            миттєво
          </h1>

          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            Інтелігентний пошук по технічній документації з автоматичними посиланнями 
            на джерела. Задавайте питання природною мовою та отримуйте точні відповіді.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button 
              size="lg" 
              onClick={handleGetStarted}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg"
            >
              <Bot size={20} className="mr-2" />
              Розпочати чат
              <ArrowRight size={20} className="ml-2" />
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => window.open('https://github.com/AlexSerbinov/doc-scrapper', '_blank')}
              className="px-8 py-4 text-lg"
            >
              <Search size={20} className="mr-2" />
              Дивитись код
            </Button>
          </div>

          {/* Example Queries */}
          <div className="max-w-2xl mx-auto">
            <p className="text-sm text-gray-500 mb-4 font-medium">
              💡 Спробуйте запитати:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {exampleQueries.map((query, index) => (
                <div
                  key={index}
                  className="bg-white rounded-lg border border-gray-200 p-3 text-sm text-gray-700 hover:border-blue-300 hover:shadow-sm transition-all cursor-pointer"
                  onClick={() => {
                    // Copy to clipboard or focus chat input
                    navigator.clipboard.writeText(query);
                    handleGetStarted();
                  }}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                    <span>&ldquo;{query}&rdquo;</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Features Preview */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="text-center p-6">
              <div className="bg-blue-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                <Search size={24} className="text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Семантичний пошук</h3>
              <p className="text-sm text-gray-600">Знаходимо релевантний контент навіть при неточних запитах</p>
            </div>

            <div className="text-center p-6">
              <div className="bg-green-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                <ArrowRight size={24} className="text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Автоматичні посилання</h3>
              <p className="text-sm text-gray-600">Прямі переходи до оригінальних сторінок документації</p>
            </div>

            <div className="text-center p-6">
              <div className="bg-purple-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                <Bot size={24} className="text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">AI асистент</h3>
              <p className="text-sm text-gray-600">GPT-4 аналізує контекст та дає структуровані відповіді</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
} 