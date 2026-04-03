import type { SearchResultProduct } from '@nx-react-nestjs-ts-boilerplate/shared';

interface Props {
  product: SearchResultProduct;
  query: string;
}

function highlightMatch(text: string, query: string): React.ReactNode {
  const tokens = query
    .trim()
    .split(/\s+/)
    .filter((t) => t.length >= 2)
    .sort((a, b) => b.length - a.length);

  if (tokens.length === 0) return text;

  const pattern = new RegExp(
    `(${tokens.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`,
    'gi'
  );
  const parts = text.split(pattern);

  return parts.map((part, i) =>
    pattern.test(part) ? (
      <mark key={i} className="bg-yellow-100 text-yellow-900 rounded px-0.5 not-italic font-semibold">
        {part}
      </mark>
    ) : (
      part
    )
  );
}

const STAR_PATH =
  'M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z';

function StarRating({ rating }: { rating: number }) {
  return (
    <span className="flex items-center gap-0.5" aria-label={`${rating} out of 5`}>
      {Array.from({ length: 5 }).map((_, i) => {
        const fill = Math.min(Math.max(rating - i, 0), 1);
        const pct = Math.round(fill * 100);
        const gradId = `sg-${i}-${pct}`;
        return (
          <svg key={i} className="w-2.5 h-2.5 shrink-0" viewBox="0 0 20 20">
            <defs>
              <linearGradient id={gradId}>
                <stop offset={`${pct}%`} stopColor="#fbbf24" />
                <stop offset={`${pct}%`} stopColor="#e5e7eb" />
              </linearGradient>
            </defs>
            <path fill={`url(#${gradId})`} d={STAR_PATH} />
          </svg>
        );
      })}
      <span className="text-[10px] text-gray-400 ml-0.5 tabular-nums">{rating.toFixed(1)}</span>
    </span>
  );
}

export function ProductCard({ product, query }: Props) {
  const inStock = product.stock > 0;

  return (
    <div
      tabIndex={0}
      data-card
      className={`group flex flex-col gap-1 p-2.5 rounded-lg border transition-all duration-150 cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-300
        ${inStock
          ? 'border-gray-100 hover:border-indigo-200 hover:bg-indigo-50/40 hover:shadow-sm'
          : 'border-gray-100 bg-gray-50/50 opacity-55'
        }`}
    >
      {/* Name */}
      <p className="text-xs font-semibold text-gray-800 leading-snug group-hover:text-indigo-700 transition-colors line-clamp-2 min-h-[2rem]">
        {highlightMatch(product.name, query)}
      </p>

      {/* Price row: price left, stock badge right */}
      <div className="flex items-center justify-between gap-1">
        <span className="text-sm font-bold text-gray-900 tabular-nums shrink-0">
          ${product.price.toFixed(2)}
        </span>
        <span
          className={`text-[9px] font-medium px-1.5 py-0.5 rounded-full whitespace-nowrap shrink-0
            ${inStock ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-400'}`}
        >
          {inStock ? 'In stock' : 'Out of stock'}
        </span>
      </div>

      {/* Rating row */}
      <StarRating rating={product.rating} />
    </div>
  );
}
