import React from 'react';
import { ChatMessage } from '@/lib/types';
import { cn, formatTime } from '@/lib/utils';
import { User, Bot, Copy, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

interface MessageBubbleProps {
  message: ChatMessage;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user';
  const isStreaming = message.isStreaming;

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(message.content);
  };

  return (
    <div className={cn(
      "flex w-full gap-3 px-4 py-6",
      isUser ? "flex-row-reverse" : "flex-row"
    )}>
      {/* Avatar */}
      <div className={cn(
        "flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-full",
        isUser 
          ? "bg-blue-600 text-white" 
          : "bg-gray-100 text-gray-600"
      )}>
        {isUser ? <User size={16} /> : <Bot size={16} />}
      </div>

      {/* Message Content */}
      <div className={cn(
        "flex flex-col space-y-2 max-w-[80%]",
        isUser ? "items-end" : "items-start"
      )}>
        {/* Message Bubble */}
        <div className={cn(
          "rounded-2xl px-4 py-3 text-sm",
          isUser 
            ? "bg-blue-600 text-white" 
            : "bg-gray-100 text-gray-900"
        )}>
          {/* Typing indicator for streaming */}
          {isStreaming && message.content === '' ? (
            <div className="flex items-center space-x-1">
              <div className="flex space-x-1">
                <div className="h-2 w-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="h-2 w-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="h-2 w-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          ) : (
            <div className="whitespace-pre-wrap">{message.content}</div>
          )}
        </div>

        {/* Sources */}
        {message.sources && message.sources.length > 0 && (
          <div className="space-y-2 w-full max-w-md">
            <div className="text-xs text-gray-500 font-medium">Джерела:</div>
            <div className="space-y-2">
              {message.sources.map((source, index) => (
                <Card key={index} className="p-3 bg-gray-50">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm text-gray-900 truncate">
                        {source.title}
                      </div>
                      <div className="text-xs text-gray-600 mt-1 line-clamp-2">
                        {source.excerpt}
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        Релевантність: {(source.score * 100).toFixed(1)}%
                      </div>
                    </div>
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      className="h-8 w-8 shrink-0"
                      onClick={() => window.open(source.url, '_blank')}
                    >
                      <ExternalLink size={14} />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Timestamp and Actions */}
        <div className={cn(
          "flex items-center gap-2 text-xs text-gray-500",
          isUser ? "flex-row-reverse" : "flex-row"
        )}>
          <span>{formatTime(message.timestamp)}</span>
          {!isUser && !isStreaming && (
            <Button 
              size="sm" 
              variant="ghost" 
              onClick={copyToClipboard}
              className="h-6 px-2"
            >
              <Copy size={12} />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
} 