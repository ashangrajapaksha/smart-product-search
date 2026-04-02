import { Router, Request, Response } from 'express';
import { searchProducts } from './search.service';

export const searchRouter = Router();

searchRouter.get('/', async (req: Request, res: Response) => {
  const q = (req.query.q as string | undefined)?.trim();
  const limit = Math.min(parseInt((req.query.limit as string) || '15', 10), 100);
  const perCategory = Math.min(parseInt((req.query.perCategory as string) || '3', 10), 50);
  const category = (req.query.category as string | undefined)?.trim() || undefined;

  if (!q || q.length === 0) {
    res.json({ query: '', total: 0, categories: [] });
    return;
  }

  if (q.length < 2) {
    res.status(400).json({ error: 'Query must be at least 2 characters', code: 400 });
    return;
  }

  try {
    const result = await searchProducts(q, limit, perCategory, category);
    res.json(result);
  } catch (err) {
    console.error('Search error:', err);
    res.status(500).json({ error: 'Search failed', code: 500 });
  }
});
