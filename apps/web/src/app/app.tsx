import type { IProduct } from '@nx-react-nestjs-ts-boilerplate/shared';
import { useEffect, useRef, useState } from 'react';
import { Route, Routes } from 'react-router-dom';
import { BrowseProductCard } from '../components/BrowseProductCard';
import { ProductModal } from '../components/ProductModal';
import { SearchBar } from '../components/SearchBar';
import { useProducts } from '../hooks/useProducts';
import { SearchPage } from '../pages/SearchPage';
import { fetchCategories } from '../services/search.api';

function SkeletonCard() {
  return (
    <div className="flex flex-col gap-2 p-3 rounded-xl border border-gray-100 animate-pulse">
      <div className="flex items-center justify-between gap-2">
        <div className="h-4 w-16 bg-gray-100 rounded-full" />
        <div className="h-4 w-12 bg-gray-100 rounded-full" />
      </div>
      <div className="h-4 bg-gray-100 rounded w-full" />
      <div className="h-4 bg-gray-100 rounded w-3/4" />
      <div className="flex items-center justify-between mt-auto">
        <div className="h-5 w-14 bg-gray-100 rounded" />
        <div className="h-4 w-20 bg-gray-100 rounded" />
      </div>
    </div>
  );
}

function HomePage() {
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<IProduct | null>(null);
  const { products, loading, hasMore, loadMore } = useProducts(selectedCategory);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const loadMoreRef = useRef(loadMore);
  loadMoreRef.current = loadMore;

  useEffect(() => {
    const controller = new AbortController();
    fetchCategories(controller.signal)
      .then(setCategories)
      .catch(() => {});
    return () => controller.abort();
  }, []);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => { if (entries[0].isIntersecting) loadMoreRef.current(); },
      { rootMargin: '200px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (loading || !hasMore) return;
    const el = sentinelRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight + 200) loadMore();
  }, [loading, hasMore, loadMore]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30">
      <header className="border-b border-gray-100 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-3 sm:gap-4">
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xl">🔍</span>
            <span className="hidden sm:inline font-bold text-gray-800 text-lg tracking-tight">SmartSearch</span>
          </div>
          <div className="flex-1">
            <SearchBar />
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 pb-16">
        {categories.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors
                ${selectedCategory === null
                  ? 'bg-indigo-500 text-white'
                  : 'bg-white border border-gray-200 text-gray-500 hover:border-indigo-200 hover:text-indigo-500'
                }`}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat === selectedCategory ? null : cat)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors
                  ${selectedCategory === cat
                    ? 'bg-indigo-500 text-white'
                    : 'bg-white border border-gray-200 text-gray-500 hover:border-indigo-200 hover:text-indigo-500'
                  }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {products.map((product) => (
            <BrowseProductCard key={product.id} product={product} onClick={() => setSelectedProduct(product)} />
          ))}
          {loading && Array.from({ length: 10 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>

        <div ref={sentinelRef} className="h-1" />

        {!hasMore && products.length > 0 && (
          <p className="text-center text-sm text-gray-400 mt-8">All products loaded</p>
        )}
      </main>

      {selectedProduct && (
        <ProductModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />
      )}
    </div>
  );
}

export function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/search" element={<SearchPage />} />
    </Routes>
  );
}

export default App;
