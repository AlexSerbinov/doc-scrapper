import { TrialInfoBar } from "@/components/demo/TrialInfoBar";
import { ChatInterface } from "@/components/demo/ChatInterface";

interface DemoPageProps {
  params: Promise<{ id: string }>;
}

export default async function DemoPage({ params }: DemoPageProps) {
  const { id } = await params;

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col">
      {/* Trial Information Bar */}
      <TrialInfoBar trialId={id} />

      {/* Main Chat Interface */}
      <div className="flex-1 flex flex-col min-h-0">
        <ChatInterface trialId={id} />
      </div>
    </div>
  );
} 