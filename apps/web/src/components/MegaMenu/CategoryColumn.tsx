import { useState } from 'react';
import type { SearchCategory, SearchResultProduct } from '@nx-react-nestjs-ts-boilerplate/shared';
import { fetchSearch } from '../../services/search.api';
import { ProductCard } from './ProductCard';

const CATEGORY_ICONS: Record<string, string> = {
  Electronics: '⚡',
  Clothing: '👕',
  Home: '🏠',
  Sports: '🏃',
  Beauty: '✨',
  Books: '📚',
};

interface Props {
  category: SearchCategory;
  query: string;
}

export function CategoryColumn({ category, query }: Props) {
  const icon = CATEGORY_ICONS[category.name] ?? '📦';
  const [products, setProducts] = useState<SearchResultProduct[]>(category.products);
  const [expanded, setExpanded] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const overflow = category.count - category.products.length;

  async function handleShowMore() {
    setLoadingMore(true);
    try {
      const data = await fetchSearch(query, undefined, {
        category: category.name,
        perCategory: 50,
        limit: 50,
      });
      setProducts(data.categories[0]?.products ?? products);
      setExpanded(true);
    } finally {
      setLoadingMore(false);
    }
  }

  return (
    <div className="flex flex-col gap-2 min-w-0">
      {/* Column header */}
      <div className="flex items-center gap-1.5 pb-2 border-b border-gray-100">
        <span className="text-base leading-none">{icon}</span>
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
          {category.name}
        </span>
        <span className="ml-auto text-xs text-gray-300 font-medium">{category.count}</span>
      </div>

      {/* Product cards */}
      <div className="flex flex-col gap-1.5">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} query={query} />
        ))}
      </div>

      {/* Show more / collapse */}
      {!expanded && overflow > 0 && (
        <button
          onClick={handleShowMore}
          disabled={loadingMore}
          className="text-xs text-indigo-500 hover:text-indigo-700 font-medium mt-0.5 px-1 text-left transition-colors disabled:opacity-50"
        >
          {loadingMore ? 'Loading…' : `+${overflow} more`}
        </button>
      )}
      {expanded && (
        <button
          onClick={() => { setProducts(category.products); setExpanded(false); }}
          className="text-xs text-gray-400 hover:text-gray-600 font-medium mt-0.5 px-1 text-left transition-colors"
        >
          Show less ↑
        </button>
      )}
    </div>
  );
}
