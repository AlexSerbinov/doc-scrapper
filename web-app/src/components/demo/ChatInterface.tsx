"use client";

import { useState } from "react";

interface ChatInterfaceProps {
  sessionId: string;
  selectedCollection?: string;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  sources?: Array<{
    title: string;
    url: string;
    excerpt: string;
  }>;
}

export function ChatInterface({ sessionId, selectedCollection }: ChatInterfaceProps) {
  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: 'Привіт! Я ваш AI-помічник з документації. Ставте запитання про будь-які аспекти вашої документації, і я надам детальні відповіді з посиланнями на джерела.'
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSampleQuery = (query: string) => {
    setInputValue(query);
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;
    
    const userMessage = inputValue.trim();
    setInputValue("");
    
    // Add user message to chat
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);
    
    try {
      const requestBody: { message: string; trialId: string; collectionName?: string } = {
        message: userMessage,
        trialId: sessionId, // Use sessionId as trialId for now
      };

      // Add collection name if provided
      if (selectedCollection) {
        requestBody.collectionName = selectedCollection;
      }

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Add assistant response to chat
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.content,
        sources: data.sources || []
      }]);
      
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Вибачте, сталася помилка під час обробки вашого запиту. Спробуйте ще раз.',
        sources: []
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const sampleQueries = [
    "Як почати роботу?",
    "Покажи основні функції",
    "Де знайти приклади коду?",
    "Які є обмеження?",
    "Як налаштувати інтеграцію?"
  ];

  return (
    <div className="bg-slate-800 rounded-lg shadow-xl border border-slate-700">
      {/* Chat Header */}
      <div className="border-b border-slate-700 p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
            <span className="text-white font-semibold">AI</span>
          </div>
          <div>
            <h3 className="text-slate-100 font-semibold">Documentation Assistant</h3>
            <p className="text-slate-400 text-sm">Ready to help with your documentation</p>
          </div>
        </div>
      </div>

      {/* Chat Messages Area */}
      <div className="p-4 h-96 overflow-y-auto">
        {messages.map((message, index) => (
          <div key={index} className="flex items-start gap-3 mb-4">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
              message.role === 'user' ? 'bg-green-600' : 'bg-blue-600'
            }`}>
              <span className="text-white text-sm font-semibold">
                {message.role === 'user' ? 'U' : 'AI'}
              </span>
            </div>
            <div className="flex-1">
              <div className="bg-slate-700 rounded-lg p-3 max-w-xl">
                <p className="text-slate-100 whitespace-pre-wrap">{message.content}</p>
                
                {/* Sources */}
                {message.sources && message.sources.length > 0 && (
                  <div className="mt-3 border-t border-slate-600 pt-3">
                    <p className="text-xs text-slate-400 mb-2">Джерела:</p>
                    <div className="space-y-2">
                      {message.sources.map((source, sourceIndex) => (
                        <div key={sourceIndex} className="text-xs">
                          <div className="text-blue-300 font-medium">{source.title}</div>
                          <div className="text-slate-400">{source.excerpt}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
        
        {/* Loading indicator */}
        {isLoading && (
          <div className="flex items-start gap-3 mb-4">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white text-sm font-semibold">AI</span>
            </div>
            <div className="bg-slate-700 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                <span className="text-slate-300 text-sm ml-2">Думаю...</span>
              </div>
            </div>
          </div>
        )}

        {/* Example queries as clickable suggestions (only show when no messages yet) */}
        {messages.length === 1 && (
          <div className="space-y-2 mb-4">
            <p className="text-slate-400 text-sm">Приклади запитань:</p>
            <div className="flex flex-wrap gap-2">
              {sampleQueries.map((query, index) => (
                <button
                  key={index}
                  className="bg-slate-700 hover:bg-slate-600 text-slate-200 px-3 py-1 rounded-full text-sm transition-colors"
                  onClick={() => handleSampleQuery(query)}
                  disabled={isLoading}
                >
                  {query}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Chat Input */}
      <div className="border-t border-slate-700 p-4">
        <div className="flex gap-3">
          <textarea
            placeholder="Запитайте щось про вашу документацію..."
            className="flex-1 bg-slate-700 text-slate-100 border border-slate-600 rounded-md p-3 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={2}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isLoading}
          />
          <button
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white px-4 py-2 rounded-md transition-colors flex items-center justify-center"
            onClick={handleSendMessage}
            disabled={isLoading || !inputValue.trim()}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
        <p className="text-slate-500 text-xs mt-2">
          💡 Натисніть Enter для відправки, Shift+Enter для нового рядка.
        </p>
      </div>
    </div>
  );
} 