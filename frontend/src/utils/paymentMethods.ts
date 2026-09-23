import type {
  CreatePaymentMethodInput,
  PaymentMethod,
  UpdatePaymentMethodInput,
} from "@shared/api";
import { getSession, handleUnauthorized } from "./session";

const PATH = "/api/me/payment-methods";

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
    const message = body?.error?.message ?? `Request failed (${res.status})`;
    throw new Error(message);
  }
  return body.data as T;
}

export function listPaymentMethods(): Promise<PaymentMethod[]> {
  return request<PaymentMethod[]>(PATH);
}

export function createPaymentMethod(
  input: CreatePaymentMethodInput,
): Promise<PaymentMethod> {
  return request<PaymentMethod>(PATH, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
}

export function updatePaymentMethod(
  id: number,
  input: UpdatePaymentMethodInput,
): Promise<PaymentMethod> {
  return request<PaymentMethod>(`${PATH}/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
}

export function deletePaymentMethod(
  id: number,
): Promise<{ id: number; deleted: boolean }> {
  return request<{ id: number; deleted: boolean }>(`${PATH}/${id}`, {
    method: "DELETE",
  });
}

const EVM_ADDRESS_RE = /^0x[a-fA-F0-9]{40}$/;

export function isValidEvmAddress(address: string): boolean {
  if (!address || typeof address !== "string") return false;
  return EVM_ADDRESS_RE.test(address.trim());
}
