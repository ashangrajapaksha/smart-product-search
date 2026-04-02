import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { Application } from 'express';
import helmet from 'helmet';
import { corsOptions } from './config/cors.config';
import { healthRouter } from './routes/health.router';
import { searchRouter } from './search/search.router';

export function createApp(): Application {
  const app = express();

  app.use(helmet());
  app.use(cors(corsOptions));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser(process.env.COOKIE_SECRET || 'change-me-in-production'));

  app.use('/api/health', healthRouter);
  app.use('/api/search', searchRouter);

  return app;
}
