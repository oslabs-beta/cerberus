import { describe, it, expect, beforeEach, vi } from 'vitest';
import supertest from 'supertest';
import app from '../server.js';
import formBasedController from '../controllers/formBasedController.js';

// Create a supertest instance
const request = supertest(app);

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

describe('Authentication Routes', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    vi.clearAllMocks();
  });

  describe('POST /register', () => {
    const validRegistrationData = {
      email: 'test@example.com',
      password: 'Password123!',
      // firstName: 'John',
      // lastName: 'Doe',
    };

    it('should successfully register a new user', async () => {
      const response = await request
        .post('/api/auth/register')
        .send(validRegistrationData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Registration successful');
      expect(response.body.user).toBeDefined();

      // Verify all middleware was called
      expect(formBasedController.validateRegistration).toHaveBeenCalled();
      expect(formBasedController.checkExistingUser).toHaveBeenCalled();
      expect(formBasedController.hashPassword).toHaveBeenCalled();
      expect(formBasedController.createUser).toHaveBeenCalled();
    });

    it('should handle invalid email format', async () => {
      const invalidData = {
        ...validRegistrationData,
        email: 'invalid-email',
      };

      // Mock validation failure
      vi.mocked(
        formBasedController.validateRegistration
      ).mockImplementationOnce((_req, res, _next) => {
        res.status(400).json({ error: 'Invalid email format' });
      });

      const response = await request
        .post('/api/auth/register')
        .send(invalidData);

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Invalid email format');
      expect(formBasedController.checkExistingUser).not.toHaveBeenCalled();
    });

    it('should handle existing user registration', async () => {
      // Mock existing user check failure
      vi.mocked(formBasedController.checkExistingUser).mockImplementationOnce(
        async (_req, res, _next) => {
          res.status(409).json({ error: 'User already exists' });
        }
      );

      const response = await request
        .post('/api/auth/register')
        .send(validRegistrationData);

      expect(response.status).toBe(409);
      expect(response.body.error).toBe('User already exists');
      expect(formBasedController.hashPassword).not.toHaveBeenCalled();
    });
  });

  describe('POST /login', () => {
    const validLoginData = {
      email: 'test@example.com',
      password: 'Password123!',
    };

    it('should successfully log in a user', async () => {
      const response = await request
        .post('/api/auth/login')
        .send(validLoginData);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Login successful');
      expect(response.body.user).toBeDefined();
      expect(response.body.expiresAt).toBeDefined();

      // Verify middleware was called
      expect(formBasedController.validateLoginData).toHaveBeenCalled();
      expect(formBasedController.authenticateUser).toHaveBeenCalled();
    });

    it('should handle invalid login credentials', async () => {
      // Mock authentication failure
      vi.mocked(formBasedController.authenticateUser).mockImplementationOnce(
        async (_req, res, _next) => {
          res.status(401).json({ error: 'Invalid credentials' });
        }
      );

      const response = await request
        .post('/api/auth/login')
        .send(validLoginData);

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Invalid credentials');
    });

    it('should handle invalid login data format', async () => {
      const invalidData = {
        email: 'invalid-email',
        password: '',
      };

      // Mock validation failure
      vi.mocked(formBasedController.validateLoginData).mockImplementationOnce(
        (_req, res, _next) => {
          res.status(400).json({ error: 'Invalid login data' });
        }
      );

      const response = await request.post('/api/auth/login').send(invalidData);

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Invalid login data');
      expect(formBasedController.authenticateUser).not.toHaveBeenCalled();
    });
  });

  describe('POST /refresh-token', () => {
    it('should issue new tokens with valid refresh token', async () => {
      const response = await request
        .post('/api/auth/refresh-token')
        .set('Cookie', ['refreshToken=valid_refresh_token']);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.expiresAt).toBeDefined();
      expect(formBasedController.validateRefreshToken).toHaveBeenCalled();
      expect(formBasedController.issueNewTokens).toHaveBeenCalled();
    });

    it('should handle invalid refresh token', async () => {
      // Mock validation failure
      vi.mocked(
        formBasedController.validateRefreshToken
      ).mockImplementationOnce(async (_req, res, _next) => {
        res.status(401).json({ error: 'Please login again' });
      });

      const response = await request
        .post('/api/auth/refresh-token')
        .set('Cookie', ['refreshToken=invalid_refresh_token']);

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Please login again');
      expect(formBasedController.issueNewTokens).not.toHaveBeenCalled();
    });
  });
});
