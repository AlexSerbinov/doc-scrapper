"use client";

import { ExternalLink, FileText } from "lucide-react";

interface Source {
  title: string;
  url: string;
  excerpt?: string;
}

interface SourceCardsProps {
  sources: Source[];
}

export function SourceCards({ sources }: SourceCardsProps) {
  const truncateText = (text: string, maxLength: number = 150) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
  };

  const extractDomain = (url: string) => {
    try {
      const domain = new URL(url).hostname;
      return domain.replace('www.', '');
    } catch {
      return 'Unknown source';
    }
  };

  return (
    <div>
      <div className="text-xs text-slate-400 mb-2 font-medium">
        Джерела ({sources.length}):
      </div>
      
      <div className="grid gap-2 md:grid-cols-2">
        {sources.map((source, index) => (
          <a
            key={index}
            href={source.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group block bg-slate-800 hover:bg-slate-750 border border-slate-600 hover:border-slate-500 rounded-lg p-3 transition-all duration-200"
          >
            <div className="flex items-start gap-3">
              {/* Icon */}
              <div className="flex-shrink-0 w-8 h-8 bg-slate-700 rounded-md flex items-center justify-center group-hover:bg-slate-600 transition-colors">
                <FileText className="w-4 h-4 text-slate-400 group-hover:text-slate-300" />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                {/* Title with external link */}
                <div className="flex items-start justify-between gap-2">
                  <h4 className="text-sm font-medium text-slate-200 group-hover:text-white transition-colors line-clamp-2">
                    {source.title}
                  </h4>
                  <ExternalLink className="w-3 h-3 text-slate-500 group-hover:text-slate-400 flex-shrink-0 mt-0.5" />
                </div>

                {/* Domain */}
                <div className="text-xs text-slate-500 mt-1">
                  {extractDomain(source.url)}
                </div>

                {/* Excerpt */}
                {source.excerpt && (
                  <p className="text-xs text-slate-400 mt-2 line-clamp-3">
                    {truncateText(source.excerpt)}
                  </p>
                )}
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
} 