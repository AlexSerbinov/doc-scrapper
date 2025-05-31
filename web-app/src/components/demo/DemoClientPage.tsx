"use client";

import { useState } from "react";
import { CollectionSelector } from "./CollectionSelector";
import { ChatInterface } from "./ChatInterface";
import { ConsolidationButton } from "../ConsolidationButton";

interface DemoClientPageProps {
  sessionId: string;
}

export function DemoClientPage({ sessionId }: DemoClientPageProps) {
  const [selectedCollection, setSelectedCollection] = useState<string>('');

  const handleCollectionChange = (collectionName: string) => {
    setSelectedCollection(collectionName);
    console.log('Collection changed to:', collectionName);
  };

  return (
    <div className="space-y-6">
      {/* Collection Selector and Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start">
        <div className="flex-1">
          <CollectionSelector 
            sessionId={sessionId} 
            onCollectionChange={handleCollectionChange}
          />
        </div>
        
        {/* Consolidation Button */}
        {selectedCollection && (
          <div className="flex-shrink-0">
            <ConsolidationButton 
              collectionName={selectedCollection}
              projectName={selectedCollection.split('-').map(word => 
                word.charAt(0).toUpperCase() + word.slice(1)
              ).join(' ')}
              variant="outlined"
              size="md"
            />
          </div>
        )}
      </div>

      {/* Information Panel */}
      {selectedCollection && (
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-white text-sm font-bold">ℹ️</span>
            </div>
            <div>
              <h3 className="text-slate-200 font-medium mb-1">
                📚 Корисна Інформація
              </h3>
              <p className="text-slate-400 text-sm mb-2">
                Ви можете отримати всю документацію в одному файлі для використання з великими мовними моделями.
              </p>
              <div className="text-xs text-slate-500">
                💡 Клацніть &ldquo;Консолідована Документація&rdquo; щоб згенерувати файл для ChatGPT, Claude, або Gemini
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Chat Interface */}
      <ChatInterface 
        sessionId={sessionId} 
        selectedCollection={selectedCollection}
      />
    </div>
  );
} 