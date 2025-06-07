import { notFound } from 'next/navigation';
import Link from 'next/link';
// import { TrialBar } from '@/components/demo/TrialBar';
import { DemoClientPage } from '@/components/demo/DemoClientPage';

interface DemoPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function DemoPage({ params }: DemoPageProps) {
  const { id: sessionId } = await params;

  // Basic validation of sessionId format
  if (!sessionId || sessionId.length < 5) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-slate-900 pt-16">
      {/* Trial Information Bar - Temporarily disabled */}
      {/* <TrialBar sessionId={sessionId} /> */}

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-100 mb-4">
            🤖 Your AI Assistant is Ready!
          </h1>
          <p className="text-lg text-slate-300 mb-6">
            Documentation has been successfully processed and indexed. 
            You can ask questions about any aspect of your documentation.
          </p>
        </div>

        {/* Collection Selector and Chat Interface */}
        <DemoClientPage sessionId={sessionId} />

        {/* Session Info */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
            <h4 className="text-slate-200 font-semibold mb-2">Session Info</h4>
            <p className="text-slate-400 text-sm">ID: {sessionId}</p>
            <p className="text-slate-400 text-sm">Created: {new Date().toLocaleString('uk-UA')}</p>
          </div>
          
          <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
            <h4 className="text-slate-200 font-semibold mb-2">Status</h4>
            <p className="text-green-400 text-sm">✅ Ready for queries</p>
            <p className="text-slate-400 text-sm">Documents indexed</p>
          </div>
          
          <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
            <h4 className="text-slate-200 font-semibold mb-2">Usage</h4>
            <p className="text-slate-400 text-sm">AI Assistant Available</p>
            {/* Trial functionality temporarily disabled */}
            {/* <p className="text-slate-400 text-sm">Queries: 0 / 100</p> */}
            {/* <p className="text-slate-400 text-sm">Trial expires: 7 days</p> */}
          </div>
        </div>

        {/* Back to Home Link */}
        <div className="text-center mt-8">
          <Link
            href="/"
            className="text-blue-400 hover:text-blue-300 underline"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

// Generate metadata for the page
export async function generateMetadata({ params }: DemoPageProps) {
  const resolvedParams = await params;
  return {
    title: `AI Assistant Demo - ${resolvedParams.id}`,
    description: 'Your personal AI documentation assistant is ready to help.',
  };
} 