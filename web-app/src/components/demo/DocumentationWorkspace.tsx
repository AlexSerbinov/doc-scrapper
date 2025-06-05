"use client";

import { useState } from "react";
import { MessageSquare, FileText } from "lucide-react";
import { ChatInterface } from "./ChatInterface";
import { ConsolidatedDocsViewer } from "../ConsolidatedDocsViewer";
import { CollectionSelector } from "./CollectionSelector";

interface DocumentationWorkspaceProps {
  sessionId: string;
}

type TabType = 'chat' | 'docs' | 'settings';

export function DocumentationWorkspace({ sessionId }: DocumentationWorkspaceProps) {
  const [activeTab, setActiveTab] = useState<TabType>('chat');
  const [selectedCollection, setSelectedCollection] = useState<string>('');

  const handleCollectionChange = (collectionName: string) => {
    setSelectedCollection(collectionName);
    console.log('Collection changed to:', collectionName);
  };

  const tabs = [
    {
      id: 'chat' as TabType,
      label: 'AI Чат',
      icon: MessageSquare,
      description: 'Поставте питання до вашої документації'
    },
    {
      id: 'docs' as TabType,
      label: 'Консолідовані Документи',
      icon: FileText,
      description: 'Перегляд та експорт об\'єднаної документації'
    }
  ];

  return (
    <div className="h-full flex flex-col bg-slate-900 rounded-lg border border-slate-700 overflow-hidden">
      {/* Header with Collection Selector */}
      <div className="bg-slate-800 border-b border-slate-700 p-4">
        <div className="flex flex-col sm:flex-row gap-4 items-start">
          <div className="flex-1">
            <CollectionSelector 
              sessionId={sessionId} 
              onCollectionChange={handleCollectionChange}
            />
          </div>
          
          {/* Status Indicator */}
          {selectedCollection && (
            <div className="flex items-center gap-2 text-sm text-green-400">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              Готово до роботи
            </div>
          )}
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-slate-800 border-b border-slate-700">
        <div className="flex">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-3 text-sm font-medium transition-colors relative ${
                activeTab === tab.id
                  ? 'text-blue-400 bg-slate-700/50'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/30'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
              
              {/* Active tab indicator */}
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-400"></div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-hidden">
        {!selectedCollection ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center text-slate-400">
              <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">Оберіть колекцію документації</h3>
              <p className="text-sm">Спочатку оберіть колекцію документації для роботи</p>
            </div>
          </div>
        ) : (
          <>
            {activeTab === 'chat' && (
              <div className="h-full overflow-hidden">
                <ChatInterface 
                  sessionId={sessionId} 
                  selectedCollection={selectedCollection}
                />
              </div>
            )}
            
            {activeTab === 'docs' && (
              <div className="h-full overflow-auto">
                <ConsolidatedDocsViewer
                  collectionName={selectedCollection}
                  projectName={selectedCollection.split('-').map(word => 
                    word.charAt(0).toUpperCase() + word.slice(1)
                  ).join(' ')}
                  embedded={true}
                />
              </div>
            )}
          </>
        )}
      </div>

      {/* Footer with helpful tips */}
      {selectedCollection && (
        <div className="bg-slate-800/50 border-t border-slate-700 p-3">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            {activeTab === 'chat' && (
              <>
                <MessageSquare className="w-3 h-3" />
                Підказка: Ставте конкретні питання для кращих результатів
              </>
            )}
            {activeTab === 'docs' && (
              <>
                <FileText className="w-3 h-3" />
                Підказка: Використовуйте консолідовані документи з ChatGPT, Claude або Gemini
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
