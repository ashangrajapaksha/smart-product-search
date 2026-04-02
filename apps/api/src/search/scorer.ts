import type { IProduct } from '@nx-react-nestjs-ts-boilerplate/shared';

const WEIGHTS = {
  textScore: 0.5,
  rating: 0.25,
  stock: 0.15,
  nameMatch: 0.1,
};

const SCORE_FLOOR = 0.05;

export interface ScoredProduct extends IProduct {
  score: number;
}

export function scoreProduct(
  product: IProduct,
  rawTextScore: number,
  query: string
): number {
  // Normalise MongoDB textScore (typically 0–10+) to 0–1, cap at 1
  const textScore = Math.min(rawTextScore / 10, 1);

  const ratingScore = product.rating / 5.0;

  const stockBonus = product.stock > 0 ? 1 : 0;

  const queryLower = query.toLowerCase();
  const nameLower = product.name.toLowerCase();
  const nameMatchBonus =
    nameLower === queryLower
      ? 1
      : nameLower.startsWith(queryLower)
        ? 0.8
        : nameLower.includes(queryLower)
          ? 0.5
          : 0;

  return (
    textScore * WEIGHTS.textScore +
    ratingScore * WEIGHTS.rating +
    stockBonus * WEIGHTS.stock +
    nameMatchBonus * WEIGHTS.nameMatch
  );
}

export function applyScoreFloor<T extends { score: number }>(results: T[]): T[] {
  return results.filter((r) => r.score >= SCORE_FLOOR);
}
