import type { SearchResponse } from '@nx-react-nestjs-ts-boilerplate/shared';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

interface SearchParams {
  limit?: number;
  perCategory?: number;
  category?: string;
}

export async function fetchSearch(
  query: string,
  signal?: AbortSignal,
  params: SearchParams = {}
): Promise<SearchResponse> {
  const qs = new URLSearchParams({ q: query });
  if (params.limit) qs.set('limit', String(params.limit));
  if (params.perCategory) qs.set('perCategory', String(params.perCategory));
  if (params.category) qs.set('category', params.category);

  const res = await fetch(`${API_BASE}/api/search?${qs}`, { signal });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Search failed (${res.status})`);
  }

  return res.json() as Promise<SearchResponse>;
}
