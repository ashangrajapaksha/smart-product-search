import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
// useNavigate kept for back-to-search button and no-results navigation
import type { SearchResponse } from '@nx-react-nestjs-ts-boilerplate/shared';
import { fetchSearch } from '../services/search.api';
import { ProductCard } from '../components/MegaMenu/ProductCard';
import { SearchBar } from '../components/SearchBar';

const CATEGORY_ICONS: Record<string, string> = {
  Electronics: '⚡',
  Clothing: '👕',
  Home: '🏠',
  Sports: '🏃',
  Beauty: '✨',
  Books: '📚',
};

export function SearchPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get('q') ?? '';

  const [data, setData] = useState<SearchResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!query.trim()) return;
    const controller = new AbortController();
    setLoading(true);
    setError(null);

    fetchSearch(query, controller.signal, { limit: 100, perCategory: 50 })
      .then(setData)
      .catch((err) => {
        if (err?.name !== 'AbortError') setError(err.message ?? 'Search failed');
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [query]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30">
      {/* Header */}
      <header className="border-b border-gray-100 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center gap-4">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 shrink-0 hover:opacity-70 transition-opacity"
          >
            <span className="text-xl">🔍</span>
            <span className="font-bold text-gray-800 text-lg tracking-tight">SmartSearch</span>
          </button>

          <div className="flex-1">
            <SearchBar defaultQuery={query} />
          </div>

          <button
            onClick={() => navigate('/')}
            className="shrink-0 flex items-center justify-center w-8 h-8 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            aria-label="Close search results"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </header>

      {/* Results */}
      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Summary bar */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-gray-500">
            {loading
              ? 'Searching…'
              : data
                ? `${data.total} result${data.total !== 1 ? 's' : ''} for `
                : null}
            {!loading && data && (
              <span className="font-semibold text-gray-800">&ldquo;{query}&rdquo;</span>
            )}
          </p>
        </div>

        {error && (
          <p className="text-sm text-red-500">{error}</p>
        )}

        {/* Loading skeleton */}
        {loading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="flex flex-col gap-2 p-3 rounded-xl border border-gray-100 animate-pulse">
                <div className="h-4 bg-gray-100 rounded w-3/4" />
                <div className="h-3 bg-gray-100 rounded w-1/2" />
                <div className="h-3 bg-gray-100 rounded w-2/3" />
              </div>
            ))}
          </div>
        )}

        {/* Results grouped by category */}
        {!loading && data && data.categories.length > 0 && (
          <div className="flex flex-col gap-10">
            {data.categories.map((cat) => (
              <section key={cat.name}>
                {/* Category heading */}
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-lg">{CATEGORY_ICONS[cat.name] ?? '📦'}</span>
                  <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wider">
                    {cat.name}
                  </h2>
                  <span className="text-xs text-gray-300 font-medium">{cat.count}</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                  {cat.products.map((product) => (
                    <ProductCard key={product.id} product={product} query={query} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}

        {/* No results */}
        {!loading && data && data.categories.length === 0 && (
          <div className="py-20 text-center">
            <p className="text-4xl mb-3">🔍</p>
            <p className="text-base font-medium text-gray-500">
              No results for <span className="text-gray-800">&ldquo;{query}&rdquo;</span>
            </p>
            <p className="text-sm text-gray-400 mt-1">Try a different spelling or broader term</p>
            <button
              onClick={() => navigate('/')}
              className="mt-6 text-sm text-indigo-500 hover:text-indigo-700 font-medium transition-colors"
            >
              ← Back to search
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
