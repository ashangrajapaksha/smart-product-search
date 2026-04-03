interface Props {
  history: string[];
  onSelect: (q: string) => void;
  onClear: () => void;
}

export function SearchHistory({ history, onSelect, onClear }: Props) {
  return (
    <div className="absolute top-full left-0 right-0 mt-1.5 bg-white rounded-2xl shadow-2xl shadow-gray-200/80 border border-gray-100 z-50 overflow-hidden">
      <div className="px-2 py-2">
        {history.map((q) => (
          <button
            key={q}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => onSelect(q)}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors group"
          >
            <svg className="w-4 h-4 text-gray-300 group-hover:text-indigo-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="truncate">{q}</span>
          </button>
        ))}
      </div>
      <div className="px-4 py-2 border-t border-gray-100 flex justify-end">
        <button
          onMouseDown={(e) => e.preventDefault()}
          onClick={onClear}
          className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
        >
          Clear all
        </button>
      </div>
    </div>
  );
}
