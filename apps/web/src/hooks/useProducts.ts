import type { IProduct } from '@nx-react-nestjs-ts-boilerplate/shared';
import { useCallback, useEffect, useRef, useState } from 'react';
import { fetchProducts } from '../services/search.api';

const PAGE_SIZE = 20;

export function useProducts(category?: string | null) {
  const [products, setProducts] = useState<IProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const skipRef = useRef(0);
  const fetchingRef = useRef(false);

  const load = useCallback(async (skip: number, cat?: string | null) => {
    if (fetchingRef.current) return;
    fetchingRef.current = true;
    setLoading(true);

    const controller = new AbortController();
    try {
      const data = await fetchProducts(skip, PAGE_SIZE, controller.signal, cat ?? undefined);
      setProducts((prev) => (skip === 0 ? data.products : [...prev, ...data.products]));
      skipRef.current = skip + data.products.length;
      setHasMore(skipRef.current < data.total);
    } catch (err) {
      if ((err as Error).name !== 'AbortError') console.error(err);
    } finally {
      fetchingRef.current = false;
      setLoading(false);
    }
  }, []);

  // Reset and reload when category changes
  useEffect(() => {
    skipRef.current = 0;
    fetchingRef.current = false;
    setProducts([]);
    setHasMore(true);
    load(0, category);
  }, [category, load]);

  const loadMore = useCallback(() => {
    if (!hasMore || fetchingRef.current) return;
    load(skipRef.current, category);
  }, [hasMore, load, category]);

  return { products, loading, hasMore, loadMore };
}
