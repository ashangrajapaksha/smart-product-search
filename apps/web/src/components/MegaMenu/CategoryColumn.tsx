import type { SearchCategory } from '@nx-react-nestjs-ts-boilerplate/shared';
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
  const overflow = category.count - category.products.length;

  return (
    <div className="flex flex-col gap-2 min-w-0">
      {/* Column header */}
      <div className="flex items-center gap-1.5 pb-2 border-b border-gray-100">
        <span className="text-base leading-none">{icon}</span>
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
          {category.name}
        </span>
        <span className="ml-auto text-xs text-gray-300 font-medium">
          {category.count}
        </span>
      </div>

      {/* Product cards */}
      <div className="flex flex-col gap-1.5">
        {category.products.map((product) => (
          <ProductCard key={product.id} product={product} query={query} />
        ))}
      </div>

      {/* Overflow hint */}
      {overflow > 0 && (
        <p className="text-xs text-indigo-400 font-medium mt-0.5 px-1">
          +{overflow} more
        </p>
      )}
    </div>
  );
}
