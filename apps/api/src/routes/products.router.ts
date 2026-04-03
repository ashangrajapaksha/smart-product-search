import { Router, Request, Response } from 'express';
import { getCategories, listProducts } from '../services/products.service';

export const productsRouter = Router();

productsRouter.get('/', async (req: Request, res: Response) => {
  const skip = Math.max(0, parseInt(String(req.query.skip ?? '0'), 10) || 0);
  const limit = Math.min(100, Math.max(1, parseInt(String(req.query.limit ?? '20'), 10) || 20));
  const category = req.query.category ? String(req.query.category) : undefined;

  const result = await listProducts(skip, limit, category);
  res.json(result);
});

productsRouter.get('/categories', async (_req: Request, res: Response) => {
  const categories = await getCategories();
  res.json(categories);
});
