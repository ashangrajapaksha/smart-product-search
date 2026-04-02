import type { SearchResponse } from '@nx-react-nestjs-ts-boilerplate/shared';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export async function fetchSearch(
  query: string,
  signal?: AbortSignal
): Promise<SearchResponse> {
  const url = `${API_BASE}/api/search?q=${encodeURIComponent(query)}`;
  const res = await fetch(url, { signal });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Search failed (${res.status})`);
  }

  return res.json() as Promise<SearchResponse>;
}
