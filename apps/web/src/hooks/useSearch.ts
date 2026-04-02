import { useState, useEffect, useRef } from 'react';
import type { SearchResponse } from '@nx-react-nestjs-ts-boilerplate/shared';
import { fetchSearch } from '../services/search.api';

const DEBOUNCE_MS = 300;

interface UseSearchResult {
  data: SearchResponse | null;
  loading: boolean;
  error: string | null;
}

export function useSearch(query: string): UseSearchResult {
  const [data, setData] = useState<SearchResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const trimmed = query.trim();

    if (trimmed.length < 2) {
      setData(null);
      setError(null);
      setLoading(false);
      return;
    }

    const timer = setTimeout(async () => {
      abortRef.current?.abort();
      abortRef.current = new AbortController();

      setLoading(true);
      setError(null);

      try {
        const result = await fetchSearch(trimmed, abortRef.current.signal);
        setData(result);
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') return;
        setError(err instanceof Error ? err.message : 'Search failed');
      } finally {
        setLoading(false);
      }
    }, DEBOUNCE_MS);

    return () => {
      clearTimeout(timer);
      abortRef.current?.abort();
    };
  }, [query]);

  return { data, loading, error };
}
