import { verifyPartner } from './paymentSvcClient';

export interface PartnerAuthContext {
  id: string;
  name: string;
  fee_buy: number;
  fee_sell: number;
}

function toNumber(value: unknown): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

/**
 * Validate a Partner-App-Key by calling payment_svc's `/api/partners/verify`.
 * web-be does not own partners and does not read payment_svc's database; the
 * key is validated by the service that owns it.
 */
export async function findPartnerByKey(key: string): Promise<PartnerAuthContext | undefined> {
  const res = await verifyPartner(key);
  if (res.status !== 200) {
    return undefined;
  }

  const data = (res.body as { data?: Record<string, unknown> | null } | null)?.data;
  if (!data) {
    return undefined;
  }

  return {
    id: String(data.id ?? ''),
    name: String(data.name ?? ''),
    fee_buy: toNumber(data.fee_buy),
    fee_sell: toNumber(data.fee_sell),
  };
}
