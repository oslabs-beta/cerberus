// Mock Redis client for testing

import { vi } from 'vitest';

export const mockRedisClient = {
  connect: vi.fn().mockResolvedValue(undefined),
  on: vi.fn(),
  set: vi.fn().mockResolvedValue('OK'),
  get: vi.fn().mockResolvedValue(null),
  del: vi.fn().mockResolvedValue(1),
};

export default mockRedisClient;
