// server/src/routes/auth.test.ts
import { describe, it, expect, beforeEach, afterAll, vi } from 'vitest';
import request from 'supertest';
import formBasedController from '../controllers/formBasedController.js';
import app from '../tests/mockApp.js';

describe('Authentication Routes', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    vi.clearAllMocks();
  });

  afterAll(() => {
    // Clean up any resources if needed
    vi.restoreAllMocks();
  });

  describe('POST /register', () => {
    const validRegistrationData = {
      email: 'test@example.com',
      password: 'Password123!',
    };

    it('should successfully register a new user', async () => {
      const response = await request(app)
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

      const response = await request(app)
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

      const response = await request(app)
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
      const response = await request(app)
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

      const response = await request(app)
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

      const response = await request(app)
        .post('/api/auth/login')
        .send(invalidData);

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Invalid login data');
      expect(formBasedController.authenticateUser).not.toHaveBeenCalled();
    });
  });

  describe('POST /refresh-token', () => {
    it('should issue new tokens with valid refresh token', async () => {
      const response = await request(app)
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

      const response = await request(app)
        .post('/api/auth/refresh-token')
        .set('Cookie', ['refreshToken=invalid_refresh_token']);

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Please login again');
      expect(formBasedController.issueNewTokens).not.toHaveBeenCalled();
    });
  });
});
