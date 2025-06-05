"use client";

import { DocumentationWorkspace } from "./DocumentationWorkspace";

interface DemoClientPageProps {
  sessionId: string;
}

export function DemoClientPage({ sessionId }: DemoClientPageProps) {
  return (
    <div className="h-[calc(100vh-2rem)] p-4">
      <DocumentationWorkspace sessionId={sessionId} />
    </div>
  );
} 