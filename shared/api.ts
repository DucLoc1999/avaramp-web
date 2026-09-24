export interface P2PRate {
  bestBuyPrice: number | null;
  bestSellPrice: number | null;
}

export interface P2PExchangeRates {
  usdt: P2PRate;
  avax: P2PRate;
}

export interface OurRate {
  buy: number;
  sell: number;
  fee_rate_buy: number;
  fee_rate_sell: number;
  min_fee_vnd: number;
  created_at: string;
}

export interface OurRates {
  usdt: OurRate;
  avax: OurRate;
}

export interface AllRatesResponse {
  binance: P2PExchangeRates;
  okx: P2PExchangeRates;
  bybit: P2PExchangeRates;
  our: OurRates;
}

export interface P2PHistoryPoint {
  created_at: number;
  buy: number | null;
  sell: number | null;
}

export interface AllHistoryResponse {
  binance: P2PHistoryPoint[];
  okx: P2PHistoryPoint[];
  bybit: P2PHistoryPoint[];
  our: P2PHistoryPoint[];
}

export type PaymentMethodType = "BANK" | "CRYPTO";

export interface PaymentMethod {
  id: number;
  user_id: number;
  type: PaymentMethodType;
  wallet_address: string | null;
  bank_id: number | null;
  full_name: string | null;
  bank_account: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreatePaymentMethodInput {
  type: PaymentMethodType;
  wallet_address?: string | null;
  bank_id?: number | null;
  full_name?: string | null;
  bank_account?: string | null;
}

export interface UpdatePaymentMethodInput {
  wallet_address?: string | null;
  bank_id?: number | null;
  full_name?: string | null;
  bank_account?: string | null;
}

export const OrderState = {
  CREATED: 1,
  PROCESSING: 2,
  COMPLETED: 3,
  FAILED: 4,
  CANCELLED: 5,
} as const;

export type OrderStateValue = (typeof OrderState)[keyof typeof OrderState];

export interface OrderBankInfo {
  bankId?: string | null;
  bankName?: string | null;
  bankAccountName?: string | null;
  bankAccountNumber?: string | null;
  transferContent?: string | null;
  vaAmount?: number | null;
}

export interface OrderResponseBody {
  qr_link?: string | null;
  qr_code?: string | null;
  bankInfo?: OrderBankInfo | null;
}

export interface OrderPayData {
  address?: string | null;
  qr_link?: string | null;
  qr_code?: string | null;
}

export interface Order {
  id: number;
  payment_code: string;
  state: number;
  processing_state?: number | null;
  amount: string;
  currency: string;
  net_vnd?: number | null;
  total_fee_vnd?: number | null;
  rate?: number | null;
  created_at?: string | null;
  body?: OrderResponseBody | null;
  pay_data?: OrderPayData | null;
}

export interface CreateDepositInput {
  amount: string;
  chain_id: number;
  token_address?: string;
  asset_code: string;
  payment_method_id: number;
}

export interface CreateWithdrawInput {
  amount: string;
  chain_id: number;
  token_address?: string;
  asset_code: string;
  payment_method_id: number;
}
