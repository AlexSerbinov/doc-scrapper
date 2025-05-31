"use client";

import { useState } from "react";
import { MessageList } from "./MessageList";
import { QueryInputArea } from "./QueryInputArea";
import { ExampleQueries } from "./ExampleQueries";

// Updated Message interface to match new UI components
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
  sessionId: string;
  selectedCollection?: string;
}

export function ChatInterface({ sessionId, selectedCollection }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: "Вітаю! Я ваш AI-помічник для документації. Ставте будь-які запитання про вашу документацію - я знайду найбільш релевантну інформацію та надам детальні відповіді з посиланнями на джерела.",
      type: 'ai',
      timestamp: new Date(),
      sources: []
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async (message: string) => {
    if (!message.trim() || isLoading) return;
    
    const userMessage: Message = {
      id: Date.now().toString(),
      content: message.trim(),
      type: 'user',
      timestamp: new Date(),
    };
    
    // Add user message to chat
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    
    try {
      const requestBody: { message: string; trialId: string; collectionName?: string } = {
        message: message.trim(),
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
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.content,
        type: 'ai',
        timestamp: new Date(),
        sources: data.sources || []
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: 'Вибачте, сталася помилка під час обробки вашого запиту. Спробуйте ще раз.',
        type: 'ai',
        timestamp: new Date(),
        sources: []
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-slate-800/70 backdrop-blur-sm rounded-lg shadow-xl border border-slate-700/50">
      {/* Chat Header */}
      <div className="border-b border-slate-700/50 p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
            <span className="text-white font-semibold">AI</span>
          </div>
          <div>
            <h3 className="text-slate-100 font-semibold">Documentation Assistant</h3>
            <p className="text-slate-400 text-sm">
              {selectedCollection 
                ? `Активна колекція: ${selectedCollection.split('-')[0]}`
                : 'Ready to help with your documentation'
              }
            </p>
          </div>
        </div>
      </div>

      {/* Chat Messages Area */}
      <div className="p-4 h-96 overflow-y-auto">
        <MessageList messages={messages} isLoading={isLoading} />

        {/* Example queries as clickable suggestions (only show when no messages yet) */}
        {messages.length === 1 && !isLoading && (
          <div className="mt-4">
            <ExampleQueries 
              onSelectQuery={handleSendMessage}
              disabled={isLoading}
            />
          </div>
        )}
      </div>

      {/* Chat Input */}
      <div className="border-t border-slate-700/50 p-4">
        <QueryInputArea
          onSendMessage={handleSendMessage}
          disabled={isLoading}
        />
      </div>
    </div>
  );
} 