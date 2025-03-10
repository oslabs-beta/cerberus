import { vi } from 'vitest';

// Mock Redis client
vi.mock('../server', () => {
  return {
    default: {},
    redisClient: {
      connect: vi.fn().mockResolvedValue(undefined),
      on: vi.fn(),
      // Add other Redis methods you need
    },
  };
});

// Mock the database service
vi.mock('../models/passkeys-user-service', () => ({
  userService: {
    getUserByEmail: vi.fn(),
    createUser: vi.fn(),
  },
}));

// Mock the controller methods
vi.mock('../controllers/formBasedController', () => ({
  default: {
    validateRegistration: vi.fn((_req, _res, next) => next()),
    checkExistingUser: vi.fn((_req, _res, next) => next()),
    hashPassword: vi.fn((_req, _res, next) => next()),
    createUser: vi.fn((req, res, next) => {
      res.locals.user = {
        id: 1,
        email: req.body.email,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
      };
      next();
    }),
    validateLoginData: vi.fn((_req, _res, next) => next()),
    authenticateUser: vi.fn((req, res, next) => {
      res.locals.user = {
        id: 1,
        email: req.body.email,
      };
      res.locals.expiresAt = Date.now() + 3600000; // 1 hour from now
      next();
    }),
    validateEmail: vi.fn((_req, _res, next) => next()),
    sendPasswordResetEmail: vi.fn((_req, _res, next) => next()),
    validateResetToken: vi.fn((_req, _res, next) => next()),
    resetPassword: vi.fn((_req, _res, next) => next()),
    validateRefreshToken: vi.fn((_req, res, next) => {
      res.locals.tokenPayload = {
        userId: 1,
        email: 'test@example.com',
      };
      next();
    }),
    issueNewTokens: vi.fn((_req, res, next) => {
      res.locals.expiresAt = Date.now() + 900000; // 15 minutes
      res.locals.success = true;
      next();
    }),
  },
}));
