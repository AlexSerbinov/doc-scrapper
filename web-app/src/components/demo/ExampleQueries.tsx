"use client";

import { useTranslationSafe } from "../../hooks/useTranslationSafe";

interface ExampleQueriesProps {
  onSelectQuery: (query: string) => void;
  disabled?: boolean;
}

export function ExampleQueries({ onSelectQuery, disabled }: ExampleQueriesProps) {
  const { t, getTranslationArray } = useTranslationSafe();

  // Get example queries array from translations
  const exampleQueries = getTranslationArray('chat.exampleQueries.examples');

  return (
    <div className="mb-6">
      <p className="text-sm text-slate-400 mb-3">
        {t('chat.exampleQueries.title')}
      </p>
      <div className="flex flex-wrap gap-2">
        {exampleQueries.map((query, index) => (
          <button
            key={index}
            onClick={() => onSelectQuery(query)}
            disabled={disabled}
            className="px-3 py-2 text-sm bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 disabled:text-slate-500 text-slate-200 rounded-md transition-colors cursor-pointer disabled:cursor-not-allowed"
          >
            {query}
          </button>
        ))}
      </div>
    </div>
  );
} 