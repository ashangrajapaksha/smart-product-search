import type { IProduct } from '@nx-react-nestjs-ts-boilerplate/shared';

const WEIGHTS = {
  textScore: 0.50, // MongoDB relevance (normalised relative to result set max)
  rating:    0.20, // product rating 0–1
  stock:     0.15, // in-stock bonus
  nameMatch: 0.10, // query tokens found in product name
  tagMatch:  0.05, // query tokens found in tags
};

const SCORE_FLOOR = 0.05;

export interface ScoredProduct extends IProduct {
  score: number;
}

/**
 * @param normalizedTextScore — textScore already divided by the max in the
 *   result set, so it is 0–1 and preserves relative ordering from MongoDB.
 */
export function scoreProduct(
  product: IProduct,
  normalizedTextScore: number,
  query: string
): number {
  const ratingScore = product.rating / 5.0;

  const stockBonus = product.stock > 0 ? 1 : 0;

  const queryTokens = query
    .toLowerCase()
    .split(/\s+/)
    .filter((t) => t.length >= 2);

  const nameLower = product.name.toLowerCase();

  // Name match: how many query tokens appear in the product name
  const nameMatchBonus =
    nameLower === query.toLowerCase()
      ? 1.0
      : queryTokens.every((t) => nameLower.includes(t))
        ? 0.8
        : queryTokens.some((t) => nameLower.includes(t))
          ? 0.4
          : 0;

  // Tag match: any query token found in the product's tags
  const tagMatchBonus = queryTokens.some((t) =>
    product.tags.some((tag) => tag.toLowerCase().includes(t))
  )
    ? 1.0
    : 0;

  return (
    normalizedTextScore * WEIGHTS.textScore +
    ratingScore        * WEIGHTS.rating +
    stockBonus         * WEIGHTS.stock +
    nameMatchBonus     * WEIGHTS.nameMatch +
    tagMatchBonus      * WEIGHTS.tagMatch
  );
}

export function applyScoreFloor<T extends { score: number }>(results: T[]): T[] {
  return results.filter((r) => r.score >= SCORE_FLOOR);
}
