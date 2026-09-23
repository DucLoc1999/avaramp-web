process.env.NODE_ENV = 'test';
import { afterEach, vi } from 'vitest';

process.env.USER_JWT_SECRET ??= 'test-user-jwt-secret';
process.env.USER_JWT_EXPIRES_SEC ??= '86400';

afterEach(() => {
  vi.clearAllMocks();
});
