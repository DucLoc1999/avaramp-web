import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../src/services/partnerService', () => ({
  findPartnerByKey: vi.fn(),
}));

import { partnerAuth } from '../src/middlewares/partnerAuth';
import { findPartnerByKey } from '../src/services/partnerService';

const findPartnerByKeyMock = vi.mocked(findPartnerByKey);

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

describe('partnerAuth', () => {
  beforeEach(() => {
    findPartnerByKeyMock.mockReset();
  });

  it('accepts an active partner key and sets req.partner', async () => {
    findPartnerByKeyMock.mockResolvedValue({
      id: 'p1',
      name: 'acme',
      fee_buy: 1,
      fee_sell: 2,
    });

    const req = mockReq({ 'partner-app-key': 'good-key' });
    const reply = mockReply();

    await partnerAuth(req, reply);

    expect(findPartnerByKeyMock).toHaveBeenCalledWith('good-key');
    expect(req.partner).toEqual({ id: 'p1', name: 'acme', fee_buy: 1, fee_sell: 2 });
    expect(reply.send).not.toHaveBeenCalled();
  });

  it('rejects a missing partner key header', async () => {
    const req = mockReq({});
    const reply = mockReply();

    await partnerAuth(req, reply);

    expect(reply.status).toHaveBeenCalledWith(401);
    expect(reply.payload.error.code).toBe('UNAUTHORIZED');
    expect(reply.payload.error.message).toBe('Invalid partner key');
  });

  it('rejects an unknown or inactive partner key', async () => {
    findPartnerByKeyMock.mockResolvedValue(undefined);

    const req = mockReq({ 'partner-app-key': 'bad-key' });
    const reply = mockReply();

    await partnerAuth(req, reply);

    expect(reply.status).toHaveBeenCalledWith(401);
    expect(reply.payload.error.code).toBe('UNAUTHORIZED');
  });
});
