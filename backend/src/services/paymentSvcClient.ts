export interface PaymentSvcResponse {
  status: number;
  body: unknown;
}

export interface CreateDepositPayload {
  amount: string;
  chain_id: number;
  token_address?: string;
  asset_code: string;
  recipient: string;
  callback: string;
  user_id: string;
}

export interface CreateWithdrawalPayload {
  amount: string;
  chain_id: number;
  token_address?: string;
  asset_code: string;
  callback: string;
  user_id: string;
  payment_info: {
    bank_id: string;
    full_name: string;
    account_type: number;
    account_number: string;
  };
}

export interface ListOrdersParams {
  userId: number;
  limit: number;
  offset: number;
  direction?: 'buy' | 'sell';
}

const REQUEST_TIMEOUT_MS = Number(process.env.PAYMENT_SVC_TIMEOUT_MS) || 15000;

function baseUrl(): string {
  return (process.env.PAYMENT_SVC_BASE_URL || 'http://localhost:3000').replace(/\/+$/, '');
}

function partnerKey(): string {
  return process.env.PAYMENT_SVC_PARTNER_APP_KEY || process.env.PARTNER_APP_KEY || '';
}

async function request(
  path: string,
  init: { method: string; body?: unknown; partnerKey?: string | null; headers?: Record<string, string> },
): Promise<PaymentSvcResponse> {
  const headers: Record<string, string> = { ...(init.headers ?? {}) };
  const key = init.partnerKey === undefined ? partnerKey() : init.partnerKey;
  if (key) {
    headers['partner-app-key'] = key;
  }
  if (init.body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }

  let res: Response;
  try {
    res = await fetch(`${baseUrl()}${path}`, {
      method: init.method,
      headers,
      body: init.body !== undefined ? JSON.stringify(init.body) : undefined,
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return {
      status: 502,
      body: {
        success: false,
        error: {
          code: 'PAYMENT_SVC_UNAVAILABLE',
          message: `payment_svc request failed: ${message}`,
          retriable: true,
          trace_id: '',
        },
      },
    };
  }

  const body = await res.json().catch(() => ({
    success: false,
    error: {
      code: 'PAYMENT_SVC_INVALID_RESPONSE',
      message: 'payment_svc returned a non-JSON response',
      retriable: true,
      trace_id: '',
    },
  }));

  return { status: res.status, body };
}

/**
 * Validate a caller-supplied Partner-App-Key against payment_svc and return the
 * resolved partner context. Avoids web-be needing direct read access to
 * payment_svc's `partners` table.
 */
export async function verifyPartner(key: string): Promise<PaymentSvcResponse> {
  return request('/api/partners/verify', { method: 'GET', partnerKey: key });
}

export async function createDeposit(payload: CreateDepositPayload): Promise<PaymentSvcResponse> {
  return request('/api/orders/deposit', { method: 'POST', body: payload });
}

export async function createWithdrawal(payload: CreateWithdrawalPayload): Promise<PaymentSvcResponse> {
  return request('/api/orders/withdrawal', { method: 'POST', body: payload });
}

export async function listOrders(params: ListOrdersParams): Promise<PaymentSvcResponse> {
  const query = new URLSearchParams({
    user_id: String(params.userId),
    limit: String(params.limit),
    offset: String(params.offset),
  });
  if (params.direction) query.set('direction', params.direction);
  return request(`/api/orders?${query.toString()}`, { method: 'GET' });
}

export async function getOrder(idOrCode: string, userId: number): Promise<PaymentSvcResponse> {
  const query = new URLSearchParams({ user_id: String(userId) });
  return request(`/api/orders/${encodeURIComponent(idOrCode)}?${query.toString()}`, { method: 'GET' });
}

/**
 * Cancel an order on payment_svc using the server-side partner key. Callers must
 * verify ownership (via getOrder with the resolved user id) before invoking this.
 */
export async function cancelOrder(idOrCode: string, reason?: string): Promise<PaymentSvcResponse> {
  return request(`/api/orders/${encodeURIComponent(idOrCode)}/cancel`, {
    method: 'POST',
    body: reason ? { reason } : {},
  });
}

/**
 * Forward an arbitrary path (including its query string) to payment_svc without
 * the partner key. Used by the same-origin gateway for `/landing/*` reads and
 * unmatched `/api/*` paths originating from the browser.
 */
export async function forward(
  rawPath: string,
  init: { method: string; body?: unknown },
): Promise<PaymentSvcResponse> {
  return request(rawPath, { method: init.method, body: init.body, partnerKey: null });
}
