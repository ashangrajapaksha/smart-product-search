import type { SearchResponse } from '@nx-react-nestjs-ts-boilerplate/shared';
import { CategoryColumn } from './CategoryColumn';

interface Props {
  id?: string;
  data: SearchResponse;
  query: string;
  loading: boolean;
  onClose: () => void;
  onViewAll: () => void;
  onReturnFocus: () => void;
}

function SkeletonCard() {
  return (
    <div className="flex flex-col gap-2 p-3 rounded-lg border border-gray-100 animate-pulse">
      <div className="h-3.5 bg-gray-100 rounded w-3/4" />
      <div className="h-2.5 bg-gray-100 rounded w-full" />
      <div className="h-2.5 bg-gray-100 rounded w-2/3" />
      <div className="flex justify-between mt-1">
        <div className="h-3 bg-gray-100 rounded w-12" />
        <div className="h-3 bg-gray-100 rounded w-16" />
      </div>
    </div>
  );
}

function SkeletonColumn() {
  return (
    <div className="flex flex-col gap-2 min-w-0">
      <div className="flex items-center gap-1.5 pb-2 border-b border-gray-100 animate-pulse">
        <div className="h-3 bg-gray-100 rounded w-20" />
      </div>
      <SkeletonCard />
      <SkeletonCard />
    </div>
  );
}

export function MegaMenu({ id, data, query, loading, onClose, onViewAll, onReturnFocus }: Props) {
  const hasResults = data.categories.length > 0;

  function handleKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
    e.preventDefault();
    const cards = Array.from(
      e.currentTarget.querySelectorAll<HTMLElement>('[data-card]')
    );
    const idx = cards.indexOf(document.activeElement as HTMLElement);
    if (e.key === 'ArrowDown') {
      (cards[idx + 1] ?? cards[0])?.focus();
    } else {
      if (idx <= 0) onReturnFocus();
      else cards[idx - 1]?.focus();
    }
  }

  return (
    <div
      id={id}
      className="absolute top-full left-0 right-0 mt-1.5 bg-white rounded-2xl shadow-2xl shadow-gray-200/80 border border-gray-100 z-50 overflow-hidden"
      role="dialog"
      aria-label="Search results"
      onKeyDown={handleKeyDown}
    >
      {/* No pt on the scroll container — top padding lives inside the sticky
           header so items have nowhere to scroll above the stuck header */}
      <div className="px-4 pb-4 overflow-auto max-h-[70vh]">
        {loading ? (
          <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))' }}>
            <SkeletonColumn />
            <SkeletonColumn />
            <SkeletonColumn />
          </div>
        ) : hasResults ? (
          <div
            className="grid gap-3"
            style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))' }}
          >
            {data.categories.map((cat) => (
              <CategoryColumn key={cat.name} category={cat} query={query} />
            ))}
          </div>
        ) : (
          <div className="py-8 text-center">
            <p className="text-2xl mb-2">🔍</p>
            <p className="text-sm font-medium text-gray-500">
              No results for <span className="text-gray-700">&ldquo;{query}&rdquo;</span>
            </p>
            <p className="text-xs text-gray-400 mt-1">Try a different spelling or broader term</p>
          </div>
        )}
      </div>

      {/* Footer */}
      {hasResults && !loading && (
        <div className="flex items-center justify-between px-4 py-2.5 bg-gray-50/80 border-t border-gray-100">
          <span className="text-xs text-gray-400">
            {data.total} result{data.total !== 1 ? 's' : ''} for &ldquo;{query}&rdquo;
          </span>
          <button
            className="text-xs font-medium text-indigo-500 hover:text-indigo-700 transition-colors"
            onMouseDown={(e) => e.preventDefault()}
            onClick={onViewAll}
          >
            View all →
          </button>
        </div>
      )}
    </div>
  );
}
