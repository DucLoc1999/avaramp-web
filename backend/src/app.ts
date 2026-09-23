import 'dotenv/config';
import Fastify, { type FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import multipart from '@fastify/multipart';
import { authRoutes } from './routes/authRoutes';
import { meRoutes } from './routes/meRoutes';
import { userRoutes } from './routes/userRoutes';
import { errorHandler } from './middlewares/errorHandler';
import { registerWebSurface } from './plugins/webSurface';
import db from './db';
import { runMigrations } from './utils/migrationRunner';
import { testConnection } from './config/database';
import { logger } from './config/logger';

export async function buildApp(): Promise<FastifyInstance> {
  const app = Fastify({ logger: true });

  const allowedOrigins = process.env.FRONTEND_ORIGIN
    ? [process.env.FRONTEND_ORIGIN]
    : ([] as string[]);

  await app.register(cors, {
    origin: allowedOrigins.length > 0 ? allowedOrigins : true,
    methods: ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'partner-app-key'],
    credentials: true,
  });

  await app.register(multipart, {
    limits: {
      fileSize: 10 * 1024 * 1024,
    },
  });

  await app.register(swagger, {
    openapi: {
      info: {
        title: 'AvaRamp web channel backend API',
        description: 'AvaRamp web channel backend: Google auth, user profile, KYC ID recognition, payment methods, SPA serving, order partner-agent routes and the payment_svc gateway',
        version: '1.0.0',
      },
      components: {
        securitySchemes: {
          BearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
          PartnerAppKey: { type: 'apiKey', in: 'header', name: 'partner-app-key', description: 'Partner App Key for client authentication' },
        },
      },
    },
  });

  await app.register(swaggerUi, { routePrefix: '/docs' });

  await app.register(errorHandler);

  app.get('/health', async () => ({ status: 'ok' }));

  await app.register(authRoutes, { prefix: '/api/auth' });
  await app.register(meRoutes, { prefix: '/api/me' });
  await app.register(userRoutes, { prefix: '/api/users' });

  await registerWebSurface(app);

  app.addHook('onReady', async () => {
    try {
      await runMigrations();
      await testConnection(db);
      logger.info('Database connection verified');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error({ error: errorMessage }, 'Failed to connect to database');
      throw error;
    }
  });

  return app;
}
