import type { FastifyRequest, FastifyReply } from 'fastify';
import { createErrorReply } from '../middlewares/errorHandler';
import * as userService from '../services/userService';
import * as paymentMethodService from '../services/paymentMethodService';
import * as s3Service from '../services/s3Service';
import * as idRecognitionService from '../services/idRecognitionService';
import * as paymentSvcClient from '../services/paymentSvcClient';

function formatUserResponse(user: Record<string, unknown>) {
  const { kyc_image_front, kyc_image_back, ...rest } = user;
  return rest;
}

export async function handleGetMe(req: FastifyRequest, reply: FastifyReply): Promise<void> {
  const user = await userService.findById(req.user!.id);
  if (!user) {
    return createErrorReply(reply, 'USER_NOT_FOUND', 'User not found', req.id);
  }
  return reply.send({ success: true, data: formatUserResponse(user as unknown as Record<string, unknown>) });
}

export async function handleMeKyc(req: FastifyRequest, reply: FastifyReply): Promise<void> {
  let imageFrontBuffer: Buffer | null = null;
  let imageBackBuffer: Buffer | null = null;

  for await (const part of req.parts()) {
    if (part.type === 'file') {
      const chunks: Buffer[] = [];
      for await (const chunk of part.file) {
        chunks.push(chunk);
      }
      const buffer = Buffer.concat(chunks);
      if (part.fieldname === 'image_front') {
        imageFrontBuffer = buffer;
      } else if (part.fieldname === 'image_back') {
        imageBackBuffer = buffer;
      }
    }
  }

  if (!imageFrontBuffer || !imageBackBuffer) {
    return createErrorReply(reply, 'VALIDATION_ERROR', 'Both image_front and image_back are required', req.id);
  }

  const timestamp = Date.now();
  const userId = req.user!.id;
  const frontKey = `kyc/${userId}_${timestamp}_front.jpg`;
  const backKey = `kyc/${userId}_${timestamp}_back.jpg`;

  const [frontUrl, backUrl] = await Promise.all([
    s3Service.uploadFile(imageFrontBuffer, frontKey, 'image/jpeg'),
    s3Service.uploadFile(imageBackBuffer, backKey, 'image/jpeg'),
  ]);

  try {
    const [frontData, backData] = await Promise.all([
      idRecognitionService.recognizeIdCard(imageFrontBuffer, 'front'),
      idRecognitionService.recognizeIdCard(imageBackBuffer, 'back'),
    ]);

    const idNumber = frontData.id_number;
    if (!idNumber) {
      return createErrorReply(reply, 'VALIDATION_ERROR', 'Could not extract ID number from front image', req.id);
    }

    const dob = idRecognitionService.parseIsoDate(frontData.date_of_birth);
    if (!dob) {
      return createErrorReply(reply, 'VALIDATION_ERROR', 'Could not parse date of birth from ID card', req.id);
    }

    const doe = idRecognitionService.parseIsoDate(backData.expiry_date || backData.issue_date);

    const updatedUser = await userService.updateKycData(userId, {
      id_number: idNumber,
      name: frontData.full_name || undefined,
      dob,
      sex: frontData.sex || null,
      nationality: frontData.nationality || null,
      home: frontData.home || null,
      address: frontData.address || null,
      doe: doe || null,
      kyc_image_front: frontUrl,
      kyc_image_back: backUrl,
      kyc_status: 'approved',
      kyc_verified_at: new Date(),
    });

    return reply.send({ success: true, data: formatUserResponse(updatedUser as unknown as Record<string, unknown>) });
  } catch (err) {
    if (err instanceof idRecognitionService.NotIdCardError) {
      return createErrorReply(reply, 'VALIDATION_ERROR', err.message, req.id);
    }
    if (err instanceof idRecognitionService.GeminiConfigError) {
      return createErrorReply(reply, 'AUTH_NOT_CONFIGURED', err.message, req.id);
    }
    throw err;
  }
}

export async function handleListMePaymentMethods(req: FastifyRequest, reply: FastifyReply): Promise<void> {
  const methods = await paymentMethodService.listByUserId(req.user!.id);
  return reply.send({ success: true, data: methods });
}

export async function handleAddMePaymentMethod(
  req: FastifyRequest<{ Body: paymentMethodService.CreatePaymentMethodInput }>,
  reply: FastifyReply,
): Promise<void> {
  const method = await paymentMethodService.create(req.user!.id, req.body);
  return reply.status(201).send({ success: true, data: method });
}

export async function handleUpdateMePaymentMethod(
  req: FastifyRequest<{ Params: { id: string }; Body: paymentMethodService.UpdatePaymentMethodInput }>,
  reply: FastifyReply,
): Promise<void> {
  const paymentId = Number(req.params.id);
  const existing = await paymentMethodService.findById(paymentId);
  if (!existing || existing.user_id !== req.user!.id) {
    return createErrorReply(reply, 'PAYMENT_METHOD_NOT_FOUND', 'Payment method not found', req.id);
  }
  const updated = await paymentMethodService.update(paymentId, req.body);
  return reply.send({ success: true, data: updated });
}

export async function handleDeleteMePaymentMethod(
  req: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply,
): Promise<void> {
  const paymentId = Number(req.params.id);
  const existing = await paymentMethodService.findById(paymentId);
  if (!existing || existing.user_id !== req.user!.id) {
    return createErrorReply(reply, 'PAYMENT_METHOD_NOT_FOUND', 'Payment method not found', req.id);
  }
  await paymentMethodService.remove(paymentId);
  return reply.send({ success: true, data: { id: paymentId, deleted: true } });
}

export interface MeDepositBody {
  amount: string;
  chain_id: number;
  token_address?: string;
  asset_code: string;
  payment_method_id: number;
  pay_gateway?: 'bank' | 'napas';
  callback?: string;
}

async function resolveUserPaymentMethod(
  userId: number,
  paymentMethodId: number,
  expectedType: 'BANK' | 'CRYPTO',
): Promise<paymentMethodService.PaymentMethod | { error: string }> {
  const user = await userService.findById(userId);
  if (!user) {
    return { error: 'USER_NOT_FOUND' };
  }
  const paymentMethod = await paymentMethodService.findById(paymentMethodId);
  if (!paymentMethod || paymentMethod.user_id !== userId) {
    return { error: 'PAYMENT_METHOD_NOT_FOUND' };
  }
  if (paymentMethod.type !== expectedType) {
    return { error: 'PAYMENT_METHOD_TYPE_MISMATCH' };
  }
  return paymentMethod;
}

export async function handleMeDeposit(
  req: FastifyRequest<{ Body: MeDepositBody }>,
  reply: FastifyReply,
): Promise<void> {
  const amount = Number(req.body.amount);
  if (!amount || amount <= 0) {
    return createErrorReply(reply, 'INVALID_AMOUNT', 'Amount must be a positive number', req.id);
  }

  const paymentMethod = await resolveUserPaymentMethod(req.user!.id, req.body.payment_method_id, 'CRYPTO');
  if ('error' in paymentMethod) {
    const messages: Record<string, string> = {
      USER_NOT_FOUND: 'User not found',
      PAYMENT_METHOD_NOT_FOUND: 'Payment method not found or does not belong to user',
      PAYMENT_METHOD_TYPE_MISMATCH: 'Payment method must be of type CRYPTO for deposit',
    };
    return createErrorReply(reply, paymentMethod.error, messages[paymentMethod.error] ?? paymentMethod.error, req.id);
  }
  if (!paymentMethod.wallet_address) {
    return createErrorReply(reply, 'PAYMENT_METHOD_MISSING_WALLET', 'Payment method has no wallet address configured', req.id);
  }

  const result = await paymentSvcClient.createDeposit({
    amount: req.body.amount,
    chain_id: req.body.chain_id,
    token_address: req.body.token_address,
    asset_code: req.body.asset_code,
    recipient: paymentMethod.wallet_address,
    callback: req.body.callback || '',
    user_id: String(req.user!.id),
    pay_gateway: req.body.pay_gateway,
  });

  return reply.status(result.status).send(result.body);
}

export interface MeWithdrawBody {
  amount: string;
  chain_id: number;
  token_address?: string;
  asset_code: string;
  payment_method_id: number;
  callback?: string;
}

export async function handleMeWithdraw(
  req: FastifyRequest<{ Body: MeWithdrawBody }>,
  reply: FastifyReply,
): Promise<void> {
  const amount = Number(req.body.amount);
  if (!amount || amount <= 0) {
    return createErrorReply(reply, 'INVALID_AMOUNT', 'Amount must be a positive number', req.id);
  }

  const paymentMethod = await resolveUserPaymentMethod(req.user!.id, req.body.payment_method_id, 'BANK');
  if ('error' in paymentMethod) {
    const messages: Record<string, string> = {
      USER_NOT_FOUND: 'User not found',
      PAYMENT_METHOD_NOT_FOUND: 'Payment method not found or does not belong to user',
      PAYMENT_METHOD_TYPE_MISMATCH: 'Payment method must be of type BANK for withdrawal',
    };
    return createErrorReply(reply, paymentMethod.error, messages[paymentMethod.error] ?? paymentMethod.error, req.id);
  }
  if (!paymentMethod.bank_id || !paymentMethod.bank_account || !paymentMethod.full_name) {
    return createErrorReply(reply, 'PAYMENT_METHOD_MISSING_BANK_INFO', 'Payment method is missing required bank information', req.id);
  }

  const result = await paymentSvcClient.createWithdrawal({
    amount: req.body.amount,
    chain_id: req.body.chain_id,
    token_address: req.body.token_address,
    asset_code: req.body.asset_code,
    callback: req.body.callback || '',
    user_id: String(req.user!.id),
    payment_info: {
      bank_id: String(paymentMethod.bank_id),
      full_name: paymentMethod.full_name,
      account_type: 0,
      account_number: paymentMethod.bank_account,
    },
  });

  return reply.status(result.status).send(result.body);
}

export async function handleListMeOrders(
  req: FastifyRequest<{ Querystring: { limit?: string; offset?: string; direction?: string } }>,
  reply: FastifyReply,
): Promise<void> {
  const limit = Math.min(Math.max(parseInt(req.query.limit || '20', 10) || 20, 1), 100);
  const offset = Math.max(parseInt(req.query.offset || '0', 10) || 0, 0);
  const direction = (['buy', 'sell'] as const).includes(req.query.direction as 'buy' | 'sell')
    ? (req.query.direction as 'buy' | 'sell')
    : undefined;

  const result = await paymentSvcClient.listOrders({
    userId: req.user!.id,
    limit,
    offset,
    direction,
  });

  return reply.status(result.status).send(result.body);
}

export async function handleGetMeOrder(
  req: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply,
): Promise<void> {
  const result = await paymentSvcClient.getOrder(req.params.id.trim(), req.user!.id);
  return reply.status(result.status).send(result.body);
}

export async function handleCancelMeOrder(
  req: FastifyRequest<{ Params: { id: string }; Body: { reason?: string } }>,
  reply: FastifyReply,
): Promise<void> {
  const id = req.params.id.trim();

  // Ownership gate: look the order up scoped by the authenticated user id.
  // A missing/foreign order returns 404 and the cancel is never forwarded.
  const existing = await paymentSvcClient.getOrder(id, req.user!.id);
  if (existing.status < 200 || existing.status >= 300) {
    return reply.status(existing.status).send(existing.body);
  }

  const result = await paymentSvcClient.cancelOrder(id, req.body?.reason);
  return reply.status(result.status).send(result.body);
}
