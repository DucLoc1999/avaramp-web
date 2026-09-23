import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import Fastify from 'fastify';
import { registerWebSurface } from '../src/plugins/webSurface';

describe('same-origin SPA + gateway', () => {
  let spaDir: string;
  const fetchMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    spaDir = fs.mkdtempSync(path.join(os.tmpdir(), 'spa-'));
    fs.writeFileSync(path.join(spaDir, 'index.html'), '<!doctype html><html><body><div id="root"></div></body></html>');
    process.env.SPA_DIST_DIR = spaDir;
    process.env.PAYMENT_SVC_BASE_URL = 'http://payment-svc.test';
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    delete process.env.SPA_DIST_DIR;
  });

  it('forwards /landing/* to payment_svc and mirrors the response', async () => {
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ our: { usdc: {} } }), { status: 200, headers: { 'content-type': 'application/json' } }),
    );

    const app = Fastify();
    await app.register(registerWebSurface);
    const res = await app.inject({ method: 'GET', url: '/landing/p2p-rates' });

    expect(fetchMock).toHaveBeenCalledWith(
      'http://payment-svc.test/landing/p2p-rates',
      expect.objectContaining({ method: 'GET' }),
    );
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({ our: { usdc: {} } });
    await app.close();
  });

  it('forwards unmatched /api/* and keeps the JSON error shape (never SPA HTML)', async () => {
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ success: false, error: { code: 'ORDER_NOT_FOUND' } }), {
        status: 404,
        headers: { 'content-type': 'application/json' },
      }),
    );

    const app = Fastify();
    await app.register(registerWebSurface);
    const res = await app.inject({ method: 'GET', url: '/api/unknown' });

    expect(res.statusCode).toBe(404);
    expect(res.headers['content-type']).toContain('application/json');
    expect(res.json().error.code).toBe('ORDER_NOT_FOUND');
    await app.close();
  });

  it('serves the SPA entry point for a non-API deep link', async () => {
    const app = Fastify();
    await app.register(registerWebSurface);
    const res = await app.inject({ method: 'GET', url: '/ramp' });

    expect(res.statusCode).toBe(200);
    expect(res.headers['content-type']).toContain('text/html');
    expect(res.body).toContain('id="root"');
    await app.close();
  });

  it('preserves method, body and query when forwarding', async () => {
    fetchMock.mockResolvedValue(new Response('{}', { status: 200, headers: { 'content-type': 'application/json' } }));

    const app = Fastify();
    await app.register(registerWebSurface);
    await app.inject({ method: 'POST', url: '/landing/foo?days=7', payload: { a: 1 } });

    expect(fetchMock).toHaveBeenCalledWith(
      'http://payment-svc.test/landing/foo?days=7',
      expect.objectContaining({ method: 'POST', body: JSON.stringify({ a: 1 }) }),
    );
    await app.close();
  });
});
