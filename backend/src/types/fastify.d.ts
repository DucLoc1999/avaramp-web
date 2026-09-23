import 'fastify';

declare module 'fastify' {
  interface FastifyRequest {
    user?: { id: number; email: string; kyc_status: string };
    partner?: { id: string; name: string; fee_buy: number; fee_sell: number };
  }
}
