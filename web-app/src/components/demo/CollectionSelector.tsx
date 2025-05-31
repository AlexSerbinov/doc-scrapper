"use client";

import { useState, useEffect } from "react";

interface Collection {
  name: string;
  count: number;
}

interface CollectionsData {
  collections: Collection[];
  groupedCollections: Record<string, Collection[]>;
  currentCollection: string;
}

interface CollectionSelectorProps {
  sessionId: string;
  onCollectionChange?: (collectionName: string) => void;
}

export function CollectionSelector({ sessionId, onCollectionChange }: CollectionSelectorProps) {
  const [collectionsData, setCollectionsData] = useState<CollectionsData | null>(null);
  const [selectedCollection, setSelectedCollection] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    fetchCollections();
  }, []);

  const fetchCollections = async () => {
    try {
      const response = await fetch('/api/collections');
      if (response.ok) {
        const data = await response.json();
        setCollectionsData(data);
        setSelectedCollection(data.currentCollection || '');
      }
    } catch (error) {
      console.error('Failed to fetch collections:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCollectionSelect = (collectionName: string) => {
    setSelectedCollection(collectionName);
    setIsExpanded(false);
    onCollectionChange?.(collectionName);
    console.log('Selected collection:', collectionName, 'for session:', sessionId);
  };

  if (isLoading) {
    return (
      <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-400 rounded-full animate-pulse"></div>
          <span className="text-slate-300">Завантажую колекції...</span>
        </div>
      </div>
    );
  }

  if (!collectionsData || collectionsData.collections.length === 0) {
    return (
      <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
        <div className="text-slate-400 text-sm">
          📚 Колекції документації ще не завантажені
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-800 rounded-lg border border-slate-700">
      {/* Header */}
      <div className="p-4 border-b border-slate-700">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between text-left"
        >
          <div>
            <h4 className="text-slate-200 font-semibold">📚 Колекції документації</h4>
            <p className="text-slate-400 text-sm">
              Активна: {selectedCollection || 'Не вибрано'} ({collectionsData.collections.find(c => c.name === selectedCollection)?.count || 0} docs)
            </p>
          </div>
          <svg 
            className={`w-5 h-5 text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {/* Expandable Collections List */}
      {isExpanded && (
        <div className="p-4 max-h-64 overflow-y-auto">
          {Object.entries(collectionsData.groupedCollections).map(([projectName, collections]) => (
            <div key={projectName} className="mb-4">
              <h5 className="text-slate-300 font-medium mb-2 text-sm uppercase tracking-wide">
                {projectName}
              </h5>
              <div className="space-y-1">
                {collections.map((collection) => (
                  <button
                    key={collection.name}
                    onClick={() => handleCollectionSelect(collection.name)}
                    className={`w-full text-left p-2 rounded text-sm transition-colors ${
                      selectedCollection === collection.name
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-700 hover:bg-slate-600 text-slate-200'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span>{collection.name}</span>
                      <span className="text-xs opacity-70">{collection.count} docs</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))}

          {/* Refresh Button */}
          <div className="mt-4 pt-4 border-t border-slate-700">
            <button
              onClick={fetchCollections}
              className="w-full bg-slate-700 hover:bg-slate-600 text-slate-200 p-2 rounded text-sm transition-colors"
            >
              🔄 Оновити список
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 