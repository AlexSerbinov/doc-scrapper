"use client";

import { useState, useRef, KeyboardEvent } from "react";
import { Send, Loader } from "lucide-react";

interface QueryInputAreaProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
}

export function QueryInputArea({ onSendMessage, disabled = false }: QueryInputAreaProps) {
  const [query, setQuery] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = () => {
    const trimmedQuery = query.trim();
    if (!trimmedQuery || disabled) return;

    onSendMessage(trimmedQuery);
    setQuery("");
    
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setQuery(e.target.value);
    
    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  };

  const exampleQueries = [
    "Як використати generateText функцію?",
    "Покажи приклад налаштування OpenAI провайдера",
    "Що таке tool calling в AI SDK?",
    "Як налаштувати streaming відповіді?"
  ];

  return (
    <div className="bg-slate-800 border-t border-slate-700 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Example queries - показуємо тільки якщо немає повідомлень */}
        {query === "" && (
          <div className="mb-4">
            <p className="text-slate-400 text-sm mb-2">Приклади запитів:</p>
            <div className="flex flex-wrap gap-2">
              {exampleQueries.map((example, index) => (
                <button
                  key={index}
                  onClick={() => setQuery(example)}
                  disabled={disabled}
                  className="text-sm bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 disabled:text-slate-500 text-slate-200 px-3 py-1 rounded-full transition-colors"
                >
                  {example}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input area */}
        <div className="relative">
          <div className="flex gap-3 items-end">
            {/* Textarea */}
            <div className="flex-1 relative">
              <textarea
                ref={textareaRef}
                value={query}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder="Запитайте щось про вашу документацію..."
                disabled={disabled}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 pr-12 text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-slate-800 disabled:text-slate-500 resize-none min-h-[48px] max-h-[200px]"
                rows={1}
              />
              
              {/* Character count */}
              <div className="absolute bottom-1 right-1 text-xs text-slate-500">
                {query.length}/500
              </div>
            </div>

            {/* Send button */}
            <button
              onClick={handleSubmit}
              disabled={disabled || !query.trim()}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 disabled:cursor-not-allowed text-white p-3 rounded-lg transition-colors flex items-center justify-center min-w-[48px]"
              aria-label="Відправити повідомлення"
            >
              {disabled ? (
                <Loader className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </div>

          {/* Help text */}
          <div className="mt-2 text-xs text-slate-500 flex items-center justify-between">
            <span>
              Натисніть Enter для відправки, Shift+Enter для нового рядка
            </span>
            {disabled && (
              <span className="text-yellow-400 flex items-center gap-1">
                <Loader className="w-3 h-3 animate-spin" />
                AI генерує відповідь...
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 