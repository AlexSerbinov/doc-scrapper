"use client";

import React, { useState } from 'react';
import { EnhancedProcessingModal } from './layout/EnhancedProcessingModal';

export function DocumentationForm() {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [sessionData, setSessionData] = useState<{
    sessionId: string;
    collectionName: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!url.trim()) {
      alert('Будь ласка, введіть URL документації');
      return;
    }

    // Basic URL validation
    try {
      new URL(url);
    } catch {
      alert('Будь ласка, введіть валідний URL');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/scrape', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      const data = await response.json();

      if (data.success) {
        // Set session data and show modal
        setSessionData({
          sessionId: data.sessionId,
          collectionName: data.collectionName
        });
        setShowModal(true);
      } else {
        alert(`Помилка: ${data.error}`);
      }
    } catch (error) {
      console.error('Scraping error:', error);
      alert('Помилка при відправці запиту. Перевірте підключення до інтернету.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSessionData(null);
    setUrl(''); // Clear URL after modal closes
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label 
            htmlFor="documentation-url" 
            className="block text-sm font-medium text-gray-300 mb-2"
          >
            URL документації
          </label>
          <input
            id="documentation-url"
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://docs.example.com"
            disabled={isLoading}
            className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
          />
          <p className="mt-2 text-xs text-gray-400">
            Введіть URL головної сторінки документації. Ми автоматично знайдемо всі пов&apos;язані сторінки.
          </p>
        </div>
        
        <button 
          type="submit" 
          disabled={isLoading || !url.trim()}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center"
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Запускаю AI-помічника...
            </>
          ) : (
            '🚀 Створити AI-Помічника'
          )}
        </button>
        
        <p className="text-xs text-gray-500 text-center">
          Процес займає 1-3 хвилини залежно від розміру документації
        </p>
      </form>

      {/* Enhanced Processing Modal */}
      {showModal && sessionData && (
        <EnhancedProcessingModal
          isOpen={showModal}
          onClose={handleCloseModal}
          url={url}
          sessionId={sessionData.sessionId}
          collectionName={sessionData.collectionName}
        />
      )}
    </>
  );
} 