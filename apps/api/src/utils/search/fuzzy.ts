import { Product } from '../../models/product.model';
import type { IProduct } from '@nx-react-nestjs-ts-boilerplate/shared';

function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  );
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] =
        a[i - 1] === b[j - 1]
          ? dp[i - 1][j - 1]
          : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[m][n];
}

function minEditDistance(queryTokens: string[], candidates: string[]): number {
  let min = Infinity;
  for (const q of queryTokens) {
    for (const c of candidates) {
      const dist = levenshtein(q, c);
      if (dist < min) min = dist;
    }
  }
  return min;
}

export async function fuzzySearch(query: string): Promise<Array<IProduct & { score: number }>> {
  const queryTokens = query
    .toLowerCase()
    .split(/\s+/)
    .filter((t) => t.length >= 2);

  if (queryTokens.length === 0) return [];

  const all = await Product.find().lean<IProduct[]>();

  const MAX_EDIT_DISTANCE = 2;

  const scored = all
    .map((product) => {
      const nameTokens = product.name.toLowerCase().split(/\s+/);
      const tagTokens = product.tags.map((t) => t.toLowerCase());
      const candidates = [...nameTokens, ...tagTokens];
      const dist = minEditDistance(queryTokens, candidates);
      return { ...product, _dist: dist };
    })
    .filter((p) => p._dist <= MAX_EDIT_DISTANCE)
    .map(({ _dist, ...p }) => ({
      ...p,
      // Invert distance into a 0–1 score: dist 0 → 1.0, dist 1 → 0.6, dist 2 → 0.2
      score: Math.max(0, 1 - _dist * 0.4),
    }));

  return scored;
}
