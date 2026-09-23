import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../src/services/userService', () => ({
  findById: vi.fn(),
}));

vi.mock('../src/services/paymentMethodService', () => ({
  findById: vi.fn(),
}));

vi.mock('../src/services/paymentSvcClient', () => ({
  createDeposit: vi.fn(),
  createWithdrawal: vi.fn(),
  listOrders: vi.fn(),
  getOrder: vi.fn(),
  cancelOrder: vi.fn(),
}));

import { handleMeDeposit, handleMeWithdraw, handleGetMeOrder, handleCancelMeOrder } from '../src/controllers/meController';
import * as userService from '../src/services/userService';
import * as paymentMethodService from '../src/services/paymentMethodService';
import * as paymentSvcClient from '../src/services/paymentSvcClient';

const findByIdUser = vi.mocked(userService.findById);
const findByIdPayment = vi.mocked(paymentMethodService.findById);
const createDeposit = vi.mocked(paymentSvcClient.createDeposit);
const createWithdrawal = vi.mocked(paymentSvcClient.createWithdrawal);
const getOrder = vi.mocked(paymentSvcClient.getOrder);
const cancelOrder = vi.mocked(paymentSvcClient.cancelOrder);

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

function mockReq(overrides: Record<string, unknown>) {
  return { user: { id: 1, email: 'u@x.io', kyc_status: 'approved' }, id: 'test-trace', ...overrides } as any;
}

describe('me orders proxy', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('rejects a payment method that belongs to another user', async () => {
    findByIdUser.mockResolvedValue({ id: 1 } as any);
    findByIdPayment.mockResolvedValue({ id: 7, user_id: 999, type: 'CRYPTO', wallet_address: '0xabc' } as any);

    const req = mockReq({
      body: { amount: '100', chain_id: 43114, asset_code: 'USDT', payment_method_id: 7 },
    });
    const reply = mockReply();

    await handleMeDeposit(req, reply);

    expect(reply.status).toHaveBeenCalledWith(404);
    expect(reply.payload.error.code).toBe('PAYMENT_METHOD_NOT_FOUND');
    expect(createDeposit).not.toHaveBeenCalled();
  });

  it('forwards the resolved recipient and user_id to payment_svc on a valid CRYPTO deposit', async () => {
    findByIdUser.mockResolvedValue({ id: 1 } as any);
    findByIdPayment.mockResolvedValue({ id: 7, user_id: 1, type: 'CRYPTO', wallet_address: '0xWallet' } as any);
    createDeposit.mockResolvedValue({ status: 200, body: { success: true, data: { id: '1' } } });

    const req = mockReq({
      body: { amount: '100', chain_id: 43114, asset_code: 'USDT', payment_method_id: 7, pay_gateway: 'bank' },
    });
    const reply = mockReply();

    await handleMeDeposit(req, reply);

    expect(createDeposit).toHaveBeenCalledWith({
      amount: '100',
      chain_id: 43114,
      token_address: undefined,
      asset_code: 'USDT',
      recipient: '0xWallet',
      callback: '',
      user_id: '1',
      pay_gateway: 'bank',
    });
    expect(reply.status).toHaveBeenCalledWith(200);
    expect(reply.payload).toEqual({ success: true, data: { id: '1' } });
  });

  it('derives payment_info from a BANK payment method on withdraw', async () => {
    findByIdUser.mockResolvedValue({ id: 1 } as any);
    findByIdPayment.mockResolvedValue({
      id: 9,
      user_id: 1,
      type: 'BANK',
      bank_id: 970422,
      full_name: 'NGUYEN VAN A',
      bank_account: '123456789',
    } as any);
    createWithdrawal.mockResolvedValue({ status: 200, body: { success: true, data: { id: '2' } } });

    const req = mockReq({
      body: { amount: '50', chain_id: 43114, asset_code: 'USDT', payment_method_id: 9 },
    });
    const reply = mockReply();

    await handleMeWithdraw(req, reply);

    expect(createWithdrawal).toHaveBeenCalledWith({
      amount: '50',
      chain_id: 43114,
      token_address: undefined,
      asset_code: 'USDT',
      callback: '',
      user_id: '1',
      payment_info: {
        bank_id: '970422',
        full_name: 'NGUYEN VAN A',
        account_type: 0,
        account_number: '123456789',
      },
    });
    expect(reply.status).toHaveBeenCalledWith(200);
  });

  it('scopes get-own-order by user_id and mirrors the upstream status', async () => {
    getOrder.mockResolvedValue({ status: 404, body: { success: false, error: { code: 'ORDER_NOT_FOUND' } } });

    const req = mockReq({ params: { id: 'DHA1B2C3D4' } });
    const reply = mockReply();

    await handleGetMeOrder(req, reply);

    expect(getOrder).toHaveBeenCalledWith('DHA1B2C3D4', 1);
    expect(reply.status).toHaveBeenCalledWith(404);
    expect(reply.payload.error.code).toBe('ORDER_NOT_FOUND');
  });

  it('does not forward a cancel for an order that is not owned by the user', async () => {
    getOrder.mockResolvedValue({ status: 404, body: { success: false, error: { code: 'ORDER_NOT_FOUND' } } });

    const req = mockReq({ params: { id: 'DHA1B2C3D4' }, body: {} });
    const reply = mockReply();

    await handleCancelMeOrder(req, reply);

    expect(getOrder).toHaveBeenCalledWith('DHA1B2C3D4', 1);
    expect(cancelOrder).not.toHaveBeenCalled();
    expect(reply.status).toHaveBeenCalledWith(404);
    expect(reply.payload.error.code).toBe('ORDER_NOT_FOUND');
  });

  it('forwards a cancel with the server-side partner key after the ownership check passes', async () => {
    getOrder.mockResolvedValue({ status: 200, body: { success: true, data: { id: 1 } } });
    cancelOrder.mockResolvedValue({ status: 200, body: { success: true, data: { id: 1, state: 5 } } });

    const req = mockReq({ params: { id: '1' }, body: { reason: 'user changed mind' } });
    const reply = mockReply();

    await handleCancelMeOrder(req, reply);

    expect(getOrder).toHaveBeenCalledWith('1', 1);
    expect(cancelOrder).toHaveBeenCalledWith('1', 'user changed mind');
    expect(reply.status).toHaveBeenCalledWith(200);
    expect(reply.payload).toEqual({ success: true, data: { id: 1, state: 5 } });
  });
});
