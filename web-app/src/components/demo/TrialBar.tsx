"use client";

interface TrialBarProps {
  sessionId: string;
}

export function TrialBar({ sessionId }: TrialBarProps) {
  // Temporarily disabled trial bar functionality
  // TODO: Re-enable when implementing subscription system
  // Keep sessionId parameter for future use
  console.log('TrialBar temporarily disabled for session:', sessionId);
  return null;

  /*
  return (
    <div className="bg-blue-800 text-white p-3 border-b border-blue-700">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="text-sm">
            🎯 <strong>Тріальна версія</strong> для Session: {sessionId}
          </span>
          <span className="text-blue-200 text-sm">
            Залишилось: <strong>7 днів</strong>
          </span>
          <span className="text-blue-200 text-sm">
            Запитів: <strong>0 / 100</strong>
          </span>
        </div>
        <button 
          onClick={() => console.log('Upgrade clicked for session:', sessionId)}
          className="bg-green-500 hover:bg-green-600 text-white font-semibold px-4 py-2 rounded-md text-sm transition-colors"
        >
          Розблокувати Повний Доступ
        </button>
      </div>
    </div>
  );
  */
} 