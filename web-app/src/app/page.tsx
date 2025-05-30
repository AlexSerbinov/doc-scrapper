'use client';

import React, { useRef } from 'react';
import { HeroSection } from '@/components/features/HeroSection';
import { ChatInterface } from '@/components/chat/ChatInterface';
import { StatsSection } from '@/components/features/StatsSection';

export default function HomePage() {
  const chatSectionRef = useRef<HTMLDivElement>(null);

  const scrollToChat = () => {
    chatSectionRef.current?.scrollIntoView({ 
      behavior: 'smooth',
      block: 'start'
    });
  };

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <HeroSection onGetStarted={scrollToChat} />
      
      {/* Chat Section */}
      <section 
        id="chat-section"
        ref={chatSectionRef}
        className="py-12 bg-white"
      >
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              AI Помічник з документації
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Задавайте питання про технічну документацію та отримуйте відповіді 
              з автоматичними посиланнями на джерела
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <ChatInterface className="h-[600px] shadow-lg" />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <StatsSection />

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-400">
            © 2024 Doc Scrapper. Створено з ❤️ для розробників.
          </p>
          <div className="mt-4 flex justify-center gap-6">
            <a 
              href="https://github.com/AlexSerbinov/doc-scrapper" 
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-white transition-colors"
            >
              GitHub
            </a>
            <a 
              href="#" 
              className="text-gray-400 hover:text-white transition-colors"
            >
              Документація
            </a>
            <a 
              href="#" 
              className="text-gray-400 hover:text-white transition-colors"
            >
              API
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
} 