"use client";

import { useState } from "react";
import { CollectionSelector } from "./CollectionSelector";
import { ChatInterface } from "./ChatInterface";

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
      {/* Collection Selector */}
      <CollectionSelector 
        sessionId={sessionId} 
        onCollectionChange={handleCollectionChange}
      />

      {/* Chat Interface */}
      <ChatInterface 
        sessionId={sessionId} 
        selectedCollection={selectedCollection}
      />
    </div>
  );
} 