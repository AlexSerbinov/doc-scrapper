import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Send, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface QueryInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  placeholder?: string;
}

export function QueryInput({ 
  onSendMessage, 
  isLoading, 
  placeholder = "Задайте запитання про документацію..." 
}: QueryInputProps) {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSendMessage(input.trim());
      setInput('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [input]);

  // Quick action buttons
  const quickActions = [
    "Як використовувати AI SDK?",
    "Покажи приклад streaming",
    "Що таке Computer Use?",
    "Як налаштувати embeddings?"
  ];

  return (
    <div className="border-t border-gray-200 bg-white p-4">
      {/* Quick Actions */}
      {input === '' && (
        <div className="mb-4">
          <div className="text-xs text-gray-500 mb-2">Швидкі запити:</div>
          <div className="flex flex-wrap gap-2">
            {quickActions.map((action, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => setInput(action)}
                className="text-xs"
              >
                {action}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            rows={1}
            disabled={isLoading}
            className={cn(
              "w-full resize-none rounded-lg border border-gray-300 bg-white px-4 py-3 pr-12 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50",
              "min-h-[48px] max-h-32"
            )}
          />
          
          {/* Send Button */}
          <div className="absolute bottom-2 right-2">
            <Button
              type="submit"
              size="icon"
              disabled={!input.trim() || isLoading}
              className="h-8 w-8"
            >
              {isLoading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Send size={16} />
              )}
            </Button>
          </div>
        </div>
      </form>

      {/* Helper text */}
      <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
        <span>Натисніть Enter для відправки, Shift+Enter для нового рядка</span>
        <span className="flex items-center gap-1">
          <div className="h-2 w-2 rounded-full bg-green-500"></div>
          RAG система активна
        </span>
      </div>
    </div>
  );
} 