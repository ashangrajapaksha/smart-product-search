import { connectDatabase } from './database';
import { createApp } from './app';

const PORT = process.env.PORT ? Number(process.env.PORT) : 8000;

async function bootstrap() {
  await connectDatabase();

  const app = createApp();

  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at http://localhost:${PORT}/api`);
  });

  server.on('error', console.error);

  process.on('SIGTERM', () => {
    server.close(() => {
      console.log('Server closed');
      process.exit(0);
    });
  });
}

bootstrap();
