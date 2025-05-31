"use client";

interface ExampleQueriesProps {
  onSelectQuery: (query: string) => void;
  disabled?: boolean;
}

export function ExampleQueries({ onSelectQuery, disabled }: ExampleQueriesProps) {
  const exampleQueries = [
    "Покажи приклад використання generateText з OpenAI",
    "Як налаштувати streaming в AI SDK?",
    "Які провайдери підтримує AI SDK?",
    "Розкажи про embeddings та їх використання",
    "Покажи приклад чат-бота з інструментами"
  ];

  return (
    <div className="mb-6">
      <p className="text-sm text-slate-400 mb-3">
        💡 Спробуйте ці приклади або задайте власне запитання:
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