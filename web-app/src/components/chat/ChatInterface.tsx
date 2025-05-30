'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, ChatState } from '@/lib/types';
import { MessageBubble } from './MessageBubble';
import { QueryInput } from './QueryInput';
import { Card } from '@/components/ui/Card';
import { Bot, Sparkles } from 'lucide-react';

interface ChatInterfaceProps {
  className?: string;
}

export function ChatInterface({ className }: ChatInterfaceProps) {
  const [chatState, setChatState] = useState<ChatState>({
    messages: [],
    isLoading: false,
    error: null,
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatState.messages]);

  const handleSendMessage = async (content: string) => {
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content,
      timestamp: new Date(),
    };

    setChatState(prev => ({
      ...prev,
      messages: [...prev.messages, userMessage],
      isLoading: true,
      error: null,
    }));

    try {
      // Create streaming assistant message
      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: '',
        timestamp: new Date(),
        isStreaming: true,
      };

      setChatState(prev => ({
        ...prev,
        messages: [...prev.messages, assistantMessage],
      }));

      // Call API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: content }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Update assistant message with response
      setChatState(prev => ({
        ...prev,
        messages: prev.messages.map(msg => 
          msg.id === assistantMessage.id 
            ? {
                ...msg,
                content: data.content,
                sources: data.sources,
                isStreaming: false,
              }
            : msg
        ),
        isLoading: false,
      }));

    } catch (error) {
      console.error('Error sending message:', error);
      setChatState(prev => ({
        ...prev,
        messages: prev.messages.filter(msg => msg.id !== `assistant-${userMessage.id.split('-')[1]}`),
        isLoading: false,
        error: error instanceof Error ? error.message : 'Виникла помилка при обробці запиту',
      }));
    }
  };

  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center h-full text-center p-8">
      <div className="bg-blue-100 rounded-full p-6 mb-6">
        <Bot size={48} className="text-blue-600" />
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">
        Вітаємо в AI Помічнику з документації!
      </h3>
      <p className="text-gray-600 mb-6 max-w-md">
        Задавайте питання про технічну документацію, і я знайду найрелевантніші відповіді з посиланнями на джерела.
      </p>
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Sparkles size={16} className="text-yellow-500" />
        <span>Підтримую запити українською та англійською мовами</span>
      </div>
    </div>
  );

  return (
    <Card className={`flex flex-col h-full ${className}`}>
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 rounded-full p-2">
            <Bot size={20} className="text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">AI Documentation Assistant</h3>
            <p className="text-sm text-gray-500">
              {chatState.messages.length === 0 
                ? "Готовий допомогти з документацією" 
                : `${chatState.messages.filter(m => m.role === 'user').length} запитань`
              }
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-green-500"></div>
          <span className="text-xs text-gray-500">Онлайн</span>
        </div>
      </div>

      {/* Messages Area */}
      <div 
        ref={scrollAreaRef}
        className="flex-1 overflow-y-auto"
      >
        {chatState.messages.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="space-y-0">
            {chatState.messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}

        {/* Error State */}
        {chatState.error && (
          <div className="px-4 py-2">
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-800">
                ❌ Помилка: {chatState.error}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <QueryInput 
        onSendMessage={handleSendMessage}
        isLoading={chatState.isLoading}
      />
    </Card>
  );
} 