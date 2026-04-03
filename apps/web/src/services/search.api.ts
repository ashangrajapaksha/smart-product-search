import type { ProductListResponse, SearchResponse } from '@nx-react-nestjs-ts-boilerplate/shared';

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

export async function fetchProducts(
  skip: number,
  limit: number,
  signal?: AbortSignal,
  category?: string
): Promise<ProductListResponse> {
  const qs = new URLSearchParams({ skip: String(skip), limit: String(limit) });
  if (category) qs.set('category', category);
  const res = await fetch(`${API_BASE}/api/products?${qs}`, { signal });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Failed to fetch products (${res.status})`);
  }

  return res.json() as Promise<ProductListResponse>;
}

export async function fetchCategories(signal?: AbortSignal): Promise<string[]> {
  const res = await fetch(`${API_BASE}/api/products/categories`, { signal });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Failed to fetch categories (${res.status})`);
  }

  return res.json() as Promise<string[]>;
}
