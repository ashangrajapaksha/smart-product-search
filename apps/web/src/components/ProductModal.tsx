import type { IProduct } from '@nx-react-nestjs-ts-boilerplate/shared';
import { useEffect } from 'react';

const STAR_PATH =
  'M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z';

function StarRating({ rating }: { rating: number }) {
  return (
    <span className="flex items-center gap-1" aria-label={`${rating} out of 5`}>
      {Array.from({ length: 5 }).map((_, i) => {
        const fill = Math.min(Math.max(rating - i, 0), 1);
        const pct = Math.round(fill * 100);
        const gradId = `modal-sg-${i}-${pct}`;
        return (
          <svg key={i} className="w-4 h-4 shrink-0" viewBox="0 0 20 20">
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
      <span className="text-sm text-gray-500 ml-1">{rating.toFixed(1)}</span>
    </span>
  );
}

interface Props {
  product: IProduct;
  onClose: () => void;
}

export function ProductModal({ product, onClose }: Props) {
  const inStock = product.stock > 0;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 p-5 border-b border-gray-100">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-500 w-fit">
              {product.category}
            </span>
            <h2 className="text-lg font-bold text-gray-900 leading-snug">{product.name}</h2>
          </div>
          <button
            onClick={onClose}
            className="shrink-0 text-gray-400 hover:text-gray-600 transition-colors mt-1"
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="p-5 flex flex-col gap-5">
          {/* Price + stock */}
          <div className="flex items-center justify-between">
            <span className="text-3xl font-bold text-gray-900">${product.price.toFixed(2)}</span>
            <span className={`text-sm font-medium px-3 py-1 rounded-full
              ${inStock ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-400'}`}>
              {inStock ? `In stock (${product.stock})` : 'Out of stock'}
            </span>
          </div>

          {/* Rating */}
          <StarRating rating={product.rating} />

          {/* Description */}
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Description</p>
            <p className="text-sm text-gray-600 leading-relaxed">{product.description}</p>
          </div>

          {/* Tags */}
          {product.tags.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Tags</p>
              <div className="flex flex-wrap gap-1.5">
                {product.tags.map((tag) => (
                  <span key={tag} className="px-2 py-0.5 bg-gray-100 text-gray-500 text-xs rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
