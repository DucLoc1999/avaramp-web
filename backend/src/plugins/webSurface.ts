import fs from 'node:fs';
import path from 'node:path';
import fastifyStatic from '@fastify/static';
import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { forward } from '../services/paymentSvcClient';
import { createErrorReply } from '../middlewares/errorHandler';

const FORWARD_PREFIXES = ['/api', '/landing'];
const BODY_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

export function spaDistDir(): string {
  return path.resolve(process.cwd(), process.env.SPA_DIST_DIR || '../dist/spa');
}

function isForwardPath(pathname: string): boolean {
  return FORWARD_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

/**
 * Serve the built SPA on the same origin and gateway everything the web channel
 * backend does not own to payment_svc.
 *
 * Registration order matters: this runs after all local routes, so local user
 * routes are matched first. `@fastify/static` serves real assets and falls
 * through to this not-found handler on a miss; `/api/*` 404s are therefore
 * forwarded (and mirrored as JSON) rather than ever returning the SPA HTML.
 */
export async function registerWebSurface(app: FastifyInstance): Promise<void> {
  const root = spaDistDir();
  fs.mkdirSync(root, { recursive: true });

  await app.register(fastifyStatic, {
    root,
    prefix: '/',
    index: ['index.html'],
    wildcard: true,
  });

  app.setNotFoundHandler(async (req: FastifyRequest, reply: FastifyReply) => {
    const url = req.raw.url || req.url || '/';
    const pathname = url.split('?')[0];

    if (isForwardPath(pathname)) {
      const result = await forward(url, {
        method: req.method,
        body: BODY_METHODS.has(req.method) ? req.body : undefined,
      });
      return reply.status(result.status).send(result.body);
    }

    if (req.method !== 'GET' && req.method !== 'HEAD') {
      return createErrorReply(reply, 'NOT_FOUND', 'Route not found', req.id);
    }

    const indexPath = path.join(root, 'index.html');
    if (!fs.existsSync(indexPath)) {
      return createErrorReply(reply, 'SPA_NOT_BUILT', 'SPA bundle not found. Run `npm run build`.', req.id);
    }

    return reply.sendFile('index.html');
  });
}
