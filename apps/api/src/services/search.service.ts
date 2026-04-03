import type {
  SearchResponse,
  SearchCategory,
  SearchResultProduct,
  IProduct,
} from '@nx-react-nestjs-ts-boilerplate/shared';
import { Product } from '../models/product.model';
import { fuzzySearch } from '../utils/search/fuzzy';
import { scoreProduct, applyScoreFloor } from '../utils/search/scorer';
import { extractHighlight } from '../utils/search/highlight';

const MAX_CATEGORIES = 5;
const MAX_PER_CATEGORY = 3;
const DEFAULT_LIMIT = 15;

interface RawCandidate extends IProduct {
  textScore: number;
}

export async function searchProducts(
  query: string,
  limit = DEFAULT_LIMIT,
  perCategory = MAX_PER_CATEGORY,
  category?: string
): Promise<SearchResponse> {
  const q = query.trim();

  // Pass 1 — MongoDB $text search using the weighted text index
  const pass1 = await Product.find(
    { $text: { $search: q } },
    {
      _id: 0,
      id: 1,
      name: 1,
      description: 1,
      category: 1,
      tags: 1,
      price: 1,
      stock: 1,
      rating: 1,
      textScore: { $meta: 'textScore' },
    }
  ).lean<RawCandidate[]>();

  let candidates: Array<IProduct & { score: number }>;

  if (pass1.length > 0) {
    // Normalise textScore relative to the highest score in this result set so
    // that the full 0–1 range is used and relative ordering is preserved.
    const maxTextScore = Math.max(...pass1.map((p) => p.textScore), 1);
    candidates = pass1.map((p) => ({
      ...p,
      score: scoreProduct(p, p.textScore / maxTextScore, q),
    }));
  } else {
    // Pass 2 — Levenshtein fallback (only when $text returns nothing)
    // fuzzy score is already 0–1, pass it directly as the normalised textScore
    const fuzzyResults = await fuzzySearch(q);
    candidates = fuzzyResults.map((p) => ({
      ...p,
      score: scoreProduct(p, p.score, q),
    }));
  }

  let sorted = applyScoreFloor(candidates)
    .sort((a, b) => b.score - a.score);

  // When a category filter is provided, restrict to that category only
  if (category) {
    sorted = sorted.filter((p) => p.category === category);
  }

  sorted = sorted.slice(0, limit);

  const withHighlights: SearchResultProduct[] = sorted.map((p) => ({
    id: p.id,
    name: p.name,
    category: p.category,
    tags: p.tags,
    price: p.price,
    stock: p.stock,
    rating: p.rating,
    score: Math.round(p.score * 1000) / 1000,
    highlight: extractHighlight(p.description, q),
  }));

  // Group by category, cap columns and products per column
  const categoryMap = new Map<string, SearchResultProduct[]>();
  for (const p of withHighlights) {
    if (!categoryMap.has(p.category)) categoryMap.set(p.category, []);
    categoryMap.get(p.category)!.push(p);
  }

  const perCategoryCap = perCategory;
  const categoryCap = category ? Infinity : MAX_CATEGORIES;

  const categories: SearchCategory[] = Array.from(categoryMap.entries())
    .map(([name, products]) => ({
      name,
      count: products.length,
      products: products.slice(0, perCategoryCap),
    }))
    .slice(0, categoryCap);

  return { query: q, total: sorted.length, categories };
}
