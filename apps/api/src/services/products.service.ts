import type { ProductListResponse } from '@nx-react-nestjs-ts-boilerplate/shared';
import { Product } from '../models/product.model';

export async function listProducts(
  skip: number,
  limit: number,
  category?: string
): Promise<ProductListResponse> {
  const filter = category ? { category } : {};
  const [products, total] = await Promise.all([
    Product.find(filter).sort({ rating: -1 }).skip(skip).limit(limit).lean(),
    Product.countDocuments(filter),
  ]);
  return { total, products: products as ProductListResponse['products'] };
}

export async function getCategories(): Promise<string[]> {
  const categories = await Product.distinct('category');
  return (categories as string[]).sort();
}
