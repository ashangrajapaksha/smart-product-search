import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { Application } from 'express';
import helmet from 'helmet';
import { corsOptions } from './config/cors.config';
import { healthRouter } from './routes/health.router';
import { searchRouter } from './routes/search.router';

export function createApp(): Application {
  const app = express();

  app.use(helmet()); // security headers
  app.use(cors(corsOptions)); //cross-origin request control
  app.use(express.json()); // parses JSON request body
  app.use(express.urlencoded({ extended: true })); // parses HTML form data
  app.use(cookieParser(process.env.COOKIE_SECRET || 'change-me-in-production')); //parses signed cookies

  app.use('/api/health', healthRouter);
  app.use('/api/search', searchRouter);

  return app;
}
