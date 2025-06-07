"use client";

import { useState } from "react";
import { MessageList } from "./MessageList";
import { QueryInputArea } from "./QueryInputArea";
import { ExampleQueries } from "./ExampleQueries";
import { useTranslationSafe } from "../../hooks/useTranslationSafe";

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
  const { t } = useTranslationSafe();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: t('chat.welcomeMessage'),
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
        content: t('chat.errorMessage'),
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
    <div className="h-full flex flex-col">
      {/* Chat Header */}
      <div className="flex-shrink-0 border-b border-slate-700/50 p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
            <span className="text-white font-semibold">AI</span>
          </div>
          <div>
            <h3 className="text-slate-100 font-semibold">{t('chat.assistant')}</h3>
            <p className="text-slate-400 text-sm">
              {selectedCollection 
                ? t('chat.activeCollection', { collection: selectedCollection.split('-')[0] })
                : t('chat.readyToHelp')
              }
            </p>
          </div>
        </div>
      </div>

      {/* Chat Messages Area */}
      <div className="flex-1 overflow-y-auto p-4">
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
      <div className="flex-shrink-0 border-t border-slate-700/50 p-4">
        <QueryInputArea
          onSendMessage={handleSendMessage}
          disabled={isLoading}
        />
      </div>
    </div>
  );
} 