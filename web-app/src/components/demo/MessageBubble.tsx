"use client";

import { useState } from "react";
import { User, Bot, Copy, Check } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Message } from "./ChatInterface";
import { SourceCards } from "./SourceCards";
import { useTranslationSafe } from "../../hooks/useTranslationSafe";

interface MessageBubbleProps {
  message: Message;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const { t } = useTranslationSafe();
  const [copiedStates, setCopiedStates] = useState<{ [key: string]: boolean }>({});

  const handleCopy = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedStates(prev => ({ ...prev, [key]: true }));
      setTimeout(() => {
        setCopiedStates(prev => ({ ...prev, [key]: false }));
      }, 2000);
    } catch (error) {
      console.error('Failed to copy text:', error);
    }
  };

  const isUser = message.type === 'user';

  return (
    <div className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'} max-w-4xl ${isUser ? 'ml-auto' : 'mr-auto'}`}>
      {/* Avatar */}
      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
        isUser ? 'bg-blue-600' : 'bg-slate-600'
      }`}>
        {isUser ? (
          <User className="w-5 h-5 text-white" />
        ) : (
          <Bot className="w-5 h-5 text-white" />
        )}
      </div>

      {/* Message Content */}
      <div className={`flex-1 ${isUser ? 'max-w-xl' : 'max-w-3xl'}`}>
        <div className={`rounded-lg px-4 py-3 relative group ${
          isUser 
            ? 'bg-blue-700 text-white' 
            : 'bg-slate-700 text-slate-100'
        }`}>
          
          {/* Copy button for entire message */}
          <button
            onClick={() => handleCopy(message.content, `message-${message.id}`)}
            className={`absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-black/20 ${
              isUser ? 'text-blue-200 hover:text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
            aria-label={t('chat.copyMessage')}
          >
            {copiedStates[`message-${message.id}`] ? (
              <Check className="w-4 h-4" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </button>

          {/* Message content */}
          {isUser ? (
            // User messages - simple text
            <div className="whitespace-pre-wrap">{message.content}</div>
          ) : (
            // AI messages - with Markdown support
            <div className="prose prose-invert prose-sm max-w-none">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  // Custom code block component
                  code(props) {
                    const { children, className, ...rest } = props;
                    const match = /language-(\w+)/.exec(className || '');
                    const codeText = String(children).replace(/\n$/, '');
                    const codeId = `code-${message.id}-${Math.random()}`;
                    const isInline = !match;
                    
                    if (!isInline && match) {
                      return (
                        <div className="relative my-4">
                          <div className="bg-slate-900 rounded-md border border-slate-600">
                            {/* Code header */}
                            <div className="flex items-center justify-between px-4 py-2 border-b border-slate-600 bg-slate-800 rounded-t-md">
                              <span className="text-xs text-slate-400 font-medium">
                                {match[1]}
                              </span>
                              <button
                                onClick={() => handleCopy(codeText, codeId)}
                                className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-200 transition-colors"
                              >
                                {copiedStates[codeId] ? (
                                  <><Check className="w-3 h-3" /> {t('common.copied')}</>
                                ) : (
                                  <><Copy className="w-3 h-3" /> {t('common.copy')}</>
                                )}
                              </button>
                            </div>
                            {/* Code content */}
                            <pre className="p-4 overflow-x-auto">
                              <code className="text-slate-200 font-mono text-sm" {...rest}>
                                {children}
                              </code>
                            </pre>
                          </div>
                        </div>
                      );
                    }
                    
                    // Inline code
                    return (
                      <code 
                        className="bg-slate-800 text-blue-300 px-1 py-0.5 rounded text-sm font-mono" 
                        {...rest}
                      >
                        {children}
                      </code>
                    );
                  },
                  // Custom styling for other elements
                  p: ({ children }) => <p className="mb-3 last:mb-0">{children}</p>,
                  ul: ({ children }) => <ul className="mb-3 list-disc list-inside space-y-1">{children}</ul>,
                  ol: ({ children }) => <ol className="mb-3 list-decimal list-inside space-y-1">{children}</ol>,
                  li: ({ children }) => <li className="text-slate-200">{children}</li>,
                  strong: ({ children }) => <strong className="font-semibold text-slate-100">{children}</strong>,
                  em: ({ children }) => <em className="italic text-slate-200">{children}</em>,
                  h1: ({ children }) => <h1 className="text-xl font-bold mb-2 text-slate-100">{children}</h1>,
                  h2: ({ children }) => <h2 className="text-lg font-semibold mb-2 text-slate-100">{children}</h2>,
                  h3: ({ children }) => <h3 className="text-base font-medium mb-2 text-slate-100">{children}</h3>,
                  blockquote: ({ children }) => (
                    <blockquote className="border-l-4 border-blue-500 pl-4 my-3 text-slate-300 italic">
                      {children}
                    </blockquote>
                  ),
                  a: ({ href, children }) => (
                    <a 
                      href={href} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300 underline"
                    >
                      {children}
                    </a>
                  ),
                }}
              >
                {message.content}
              </ReactMarkdown>
            </div>
          )}
        </div>

        {/* Source cards for AI messages */}
        {!isUser && message.sources && message.sources.length > 0 && (
          <div className="mt-3">
            <SourceCards sources={message.sources} />
          </div>
        )}

        {/* Timestamp */}
        <div className={`mt-1 text-xs text-slate-500 ${isUser ? 'text-right' : 'text-left'}`}>
          {message.timestamp.toLocaleTimeString('uk-UA', { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </div>
      </div>
    </div>
  );
} 