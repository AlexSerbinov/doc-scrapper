"use client";

import { useState } from "react";
import { MessageList } from "./MessageList";
import { QueryInputArea } from "./QueryInputArea";
import { ExampleQueries } from "./ExampleQueries";

export interface Message {
  id: string;
  content: string;
  type: 'user' | 'ai';
  timestamp: Date;
  sources?: {
    title: string;
    url: string;
    excerpt?: string;
  }[];
}

interface ChatInterfaceProps {
  trialId: string;
}

export function ChatInterface({ trialId }: ChatInterfaceProps) {
  // TODO: Use trialId for API calls and analytics
  console.log('Trial ID:', trialId); // Temporary to satisfy linter
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: "Вітаю! Я ваш AI-помічник для документації. Ставте будь-які запитання про вашу документацію - я знайду найбільш релевантну інформацію та надам детальні відповіді з посиланнями на джерела.",
      type: 'ai',
      timestamp: new Date(),
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async (content: string) => {
    // Додаємо повідомлення користувача
    const userMessage: Message = {
      id: Date.now().toString(),
      content,
      type: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // Відправляємо запит до нашого API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          message: content,
          trialId 
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Створюємо повідомлення AI з даних API
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.content || 'Вибачте, не вдалося отримати відповідь.',
        type: 'ai',
        timestamp: new Date(),
        sources: data.sources || []
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Показуємо повідомлення про помилку
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: 'Вибачте, сталася помилка при обробці вашого запиту. Перевірте підключення та спробуйте знову.',
        type: 'ai',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Messages Area */}
      <div className="flex-1 overflow-hidden">
        <MessageList 
          messages={messages} 
          isLoading={isLoading}
        />
      </div>

      {/* Example Queries - показуємо тільки якщо є тільки початкове повідомлення */}
      {messages.length === 1 && (
        <div className="px-4 pb-4">
          <div className="max-w-4xl mx-auto">
            <ExampleQueries 
              onSelectQuery={handleSendMessage}
              disabled={isLoading}
            />
          </div>
        </div>
      )}

      {/* Input Area */}
      <QueryInputArea 
        onSendMessage={handleSendMessage}
        disabled={isLoading}
      />
    </div>
  );
} 