import { describe, it, expect, vi } from 'vitest';
import { userAuth } from '../src/middlewares/userAuth';
import { signJwt } from '../src/utils/jwt';

function mockReply() {
  const reply: any = {};
  reply.status = vi.fn(() => reply);
  reply.header = vi.fn(() => reply);
  reply.send = vi.fn((payload: unknown) => {
    reply.payload = payload;
    return reply;
  });
  return reply;
}

function mockReq(headers: Record<string, unknown>) {
  return { headers, id: 'test-trace' } as any;
}

describe('userAuth', () => {
  it('accepts a valid JWT and sets req.user', async () => {
    const secret = process.env.USER_JWT_SECRET!;
    const token = signJwt({ sub: 42, email: 'a@b.c', kyc_status: 'approved' }, secret, 3600);

    const req = mockReq({ authorization: `Bearer ${token}` });
    const reply = mockReply();

    await userAuth(req, reply);

    expect(req.user).toEqual({ id: 42, email: 'a@b.c', kyc_status: 'approved' });
    expect(reply.send).not.toHaveBeenCalled();
  });

  it('rejects a token signed with the wrong secret', async () => {
    const token = signJwt({ sub: 1, email: 'a@b.c' }, 'wrong-secret', 3600);
    const req = mockReq({ authorization: `Bearer ${token}` });
    const reply = mockReply();

    await userAuth(req, reply);

    expect(reply.status).toHaveBeenCalledWith(401);
    expect(reply.payload.error.code).toBe('UNAUTHORIZED');
  });

  it('rejects an expired token', async () => {
    const secret = process.env.USER_JWT_SECRET!;
    const token = signJwt({ sub: 1, email: 'a@b.c' }, secret, -10);
    const req = mockReq({ authorization: `Bearer ${token}` });
    const reply = mockReply();

    await userAuth(req, reply);

    expect(reply.status).toHaveBeenCalledWith(401);
    expect(reply.payload.error.code).toBe('UNAUTHORIZED');
  });

  it('rejects a missing Authorization header', async () => {
    const req = mockReq({});
    const reply = mockReply();

    await userAuth(req, reply);

    expect(reply.status).toHaveBeenCalledWith(401);
    expect(reply.payload.error.code).toBe('UNAUTHORIZED');
  });

  it('reports AUTH_NOT_CONFIGURED when USER_JWT_SECRET is unset', async () => {
    const original = process.env.USER_JWT_SECRET;
    delete process.env.USER_JWT_SECRET;
    try {
      const req = mockReq({ authorization: 'Bearer whatever' });
      const reply = mockReply();

      await userAuth(req, reply);

      expect(reply.status).toHaveBeenCalledWith(503);
      expect(reply.payload.error.code).toBe('AUTH_NOT_CONFIGURED');
    } finally {
      process.env.USER_JWT_SECRET = original;
    }
  });
});
