"use client";

import { useState } from 'react';
import { Copy, FileText, Eye, Download, Loader2, CheckCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import type { Components } from 'react-markdown';
import { useTranslationSafe } from '../hooks/useTranslationSafe';

interface ConsolidatedDocsViewerProps {
  collectionName: string;
  projectName?: string;
  onClose?: () => void;
  embedded?: boolean; // New prop to indicate if it's embedded in a tab
}

interface ConsolidationData {
  markdown: string;
  stats: {
    totalFiles: number;
    totalSize: number;
    estimatedTokens: number;
  };
  message: string;
}

export function ConsolidatedDocsViewer({ 
  collectionName, 
  projectName, 
  onClose,
  embedded = false 
}: ConsolidatedDocsViewerProps) {
  const { t } = useTranslationSafe();
  const [data, setData] = useState<ConsolidationData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'rendered' | 'raw'>('rendered');
  const [copySuccess, setCopySuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/consolidate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          collectionName,
          projectName
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate consolidated documentation');
      }

      const result = await response.json();
      setData(result);
    } catch (error: unknown) {
      console.error('Error generating consolidated docs:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!data?.markdown) return;

    try {
      await navigator.clipboard.writeText(data.markdown);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  const handleDownload = () => {
    if (!data?.markdown) return;

    const blob = new Blob([data.markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `consolidated-docs-${collectionName}-${new Date().toISOString().split('T')[0]}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(num);
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (!data && !isLoading && !error) {
    const containerClass = embedded 
      ? "p-6" 
      : "bg-slate-900 rounded-lg border border-slate-700 p-6";
      
    return (
      <div className={containerClass}>
        <div className="text-center">
          <FileText className="w-12 h-12 text-blue-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-slate-100 mb-2">
            📚 {t('consolidatedDocs.title')}
          </h3>
          <p className="text-slate-300 mb-6 max-w-md mx-auto">
            {t('consolidatedDocs.subtitle')}
          </p>
          
          <div className="bg-slate-800 rounded-lg p-4 mb-6">
            <h4 className="text-sm font-medium text-slate-200 mb-2">🎯 {t('consolidatedDocs.perfectFor')}</h4>
            <div className="text-sm text-slate-400 space-y-1">
              <div>🤖 {t('consolidatedDocs.llmList.gemini')}</div>
              <div>🤖 {t('consolidatedDocs.llmList.chatgpt')}</div>
              <div>🤖 {t('consolidatedDocs.llmList.claude')}</div>
              <div>🤖 {t('consolidatedDocs.llmList.other')}</div>
            </div>
          </div>

          <button
            onClick={handleGenerate}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            {t('consolidatedDocs.generateButton')}
          </button>
        </div>
      </div>
    );
  }

  const containerClass = embedded 
    ? "flex flex-col max-h-full" 
    : "bg-slate-900 rounded-lg border border-slate-700 flex flex-col max-h-full";

  return (
    <div className={containerClass}>
      {/* Header */}
      <div className="bg-slate-800 border-b border-slate-700 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileText className="w-5 h-5 text-blue-400" />
            <div>
              <h3 className="text-lg font-semibold text-slate-100">
                {t('consolidatedDocs.title')}
              </h3>
              <p className="text-sm text-slate-400">
                {projectName || collectionName}
              </p>
            </div>
          </div>
          
          {onClose && (
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-200 transition-colors"
            >
              ✕
            </button>
          )}
        </div>

        {/* Stats */}
        {data && (
          <div className="mt-4 grid grid-cols-3 gap-4 text-center">
            <div className="bg-slate-700 rounded-lg p-3">
              <div className="text-xl font-bold text-blue-400">
                {formatNumber(data.stats.totalFiles)}
              </div>
              <div className="text-xs text-slate-400">{t('common.files')}</div>
            </div>
            <div className="bg-slate-700 rounded-lg p-3">
              <div className="text-xl font-bold text-green-400">
                {formatBytes(data.stats.totalSize)}
              </div>
              <div className="text-xs text-slate-400">{t('common.size')}</div>
            </div>
            <div className="bg-slate-700 rounded-lg p-3">
              <div className="text-xl font-bold text-purple-400">
                ~{formatNumber(data.stats.estimatedTokens)}
              </div>
              <div className="text-xs text-slate-400">{t('common.tokens')}</div>
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      {data && (
        <div className="bg-slate-800 border-b border-slate-700 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode('rendered')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'rendered'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                <Eye className="w-4 h-4 inline mr-1" />
                {t('consolidatedDocs.viewModes.rendered')}
              </button>
              <button
                onClick={() => setViewMode('raw')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'raw'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                <FileText className="w-4 h-4 inline mr-1" />
                {t('consolidatedDocs.viewModes.raw')}
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                {copySuccess ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
                {copySuccess ? t('common.copied') : t('common.copy')}
              </button>
              <button
                onClick={handleDownload}
                className="flex items-center gap-2 bg-slate-600 hover:bg-slate-500 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                <Download className="w-4 h-4" />
                {t('common.download')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="p-6 flex-1 overflow-auto">
        {isLoading && (
          <div className="text-center py-12">
            <Loader2 className="w-8 h-8 text-blue-400 animate-spin mx-auto mb-4" />
            <p className="text-slate-300">{t('consolidatedDocs.generating')}</p>
          </div>
        )}

        {error && (
          <div className="bg-red-900/20 border border-red-700 rounded-lg p-4 text-red-200">
            <h4 className="font-medium mb-2">{t('common.error')}</h4>
            <p className="text-sm">{error}</p>
            <button
              onClick={handleGenerate}
              className="mt-3 text-sm bg-red-600 hover:bg-red-700 px-3 py-1 rounded transition-colors"
            >
              {t('common.refresh')}
            </button>
          </div>
        )}

        {data && (
          <div className="space-y-4">
            {viewMode === 'rendered' ? (
              <div className="prose prose-invert max-w-none">
                <ReactMarkdown
                  components={{
                    code({ className, children }) {
                      const match = /language-(\w+)/.exec(className || '');
                      const inline = !className;
                      return !inline && match ? (
                        <SyntaxHighlighter
                          language={match[1]}
                          PreTag="div"
                          className="bg-slate-800 rounded p-3 overflow-auto text-sm"
                        >
                          {String(children).replace(/\n$/, '')}
                        </SyntaxHighlighter>
                      ) : (
                        <code className={`${className} bg-slate-700 px-1 py-0.5 rounded text-sm`}>
                          {children}
                        </code>
                      );
                    }
                  } as Components}
                >
                  {data.markdown}
                </ReactMarkdown>
              </div>
            ) : (
              <div className="bg-slate-800 rounded-lg overflow-hidden">
                <pre className="p-4 text-sm text-slate-300 overflow-auto whitespace-pre-wrap">
                  {data.markdown}
                </pre>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 