import { CorsOptions } from 'cors';

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

// Allows root domain and all subdomains
function buildOriginMatcher(frontendUrl: string): CorsOptions['origin'] {
  const url = new URL(frontendUrl);
  const hostname = url.hostname;
  const protocol = url.protocol;

  return (origin, callback) => {
    if (!origin) return callback(null, true);
    try {
      const originUrl = new URL(origin);
      const isAllowed =
        originUrl.hostname === hostname || originUrl.hostname.endsWith(`.${hostname}`);
      if (isAllowed && originUrl.protocol === protocol) return callback(null, true);
      return callback(new Error(`CORS: origin ${origin} not allowed`));
    } catch {
      return callback(new Error(`CORS: invalid origin ${origin}`));
    }
  };
}

export const corsOptions: CorsOptions = {
  origin: buildOriginMatcher(FRONTEND_URL),
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400,
  credentials: true,
};
