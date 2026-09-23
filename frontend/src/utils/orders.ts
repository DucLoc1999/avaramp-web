import type {
  CreateDepositInput,
  CreateWithdrawInput,
  Order,
} from "@shared/api";
import { getSession, handleUnauthorized } from "./session";

const ME_ORDERS_PATH = "/api/me/orders";

class UnauthorizedError extends Error {}

function authHeaders(): Record<string, string> {
  const session = getSession();
  return session?.token ? { Authorization: `Bearer ${session.token}` } : {};
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const baseUrl = import.meta.env.VITE_BASE_URL as string;
  const res = await fetch(`${baseUrl}${path}`, {
    ...init,
    headers: {
      ...authHeaders(),
      ...(init?.headers ?? {}),
    },
  });

  if (res.status === 401) {
    handleUnauthorized();
    throw new UnauthorizedError("Unauthorized");
  }

  const body = await res.json().catch(() => null);
  if (!res.ok || !body?.success) {
    const code = body?.error?.code;
    const message = body?.error?.message ?? `Request failed (${res.status})`;
    const err = new Error(message) as Error & { code?: string };
    if (code) err.code = code;
    throw err;
  }
  return body.data as T;
}

export function createDepositOrder(input: CreateDepositInput): Promise<Order> {
  return request<Order>(`${ME_ORDERS_PATH}/deposit`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
}

export function createWithdrawOrder(input: CreateWithdrawInput): Promise<Order> {
  return request<Order>(`${ME_ORDERS_PATH}/withdraw`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
}

export function getOrder(idOrCode: string | number): Promise<Order> {
  return request<Order>(`${ME_ORDERS_PATH}/${idOrCode}`);
}

// Cancel is performed by the channel backend on the user's behalf using the
// user's Bearer token. The partner key is held server-side and never ships in
// the browser bundle.
export async function cancelOrder(
  idOrCode: string | number,
  reason?: string,
): Promise<{ cancelled: boolean; code?: string; message?: string }> {
  const baseUrl = import.meta.env.VITE_BASE_URL as string;

  const res = await fetch(
    `${baseUrl}${ME_ORDERS_PATH}/${idOrCode}/cancel`,
    {
      method: "POST",
      headers: {
        ...authHeaders(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify(reason ? { reason } : {}),
    },
  );

  const body = await res.json().catch(() => null);
  if (!res.ok || !body?.success) {
    return {
      cancelled: false,
      code: body?.error?.code,
      message: body?.error?.message ?? `Cancel failed (${res.status})`,
    };
  }
  return { cancelled: true };
}
