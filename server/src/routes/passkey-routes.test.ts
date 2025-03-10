import { describe, it, expect, beforeEach, vi } from 'vitest';
import supertest from 'supertest';
import app from '../server.js';
import { userService } from '../models/passkeys-user-service.js';

// Create a supertest instance
const request = supertest(app);

describe('Authentication Endpoints', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    vi.clearAllMocks();
  });

  describe('User Registration', () => {
    it('should register a new user successfully', async () => {
      // Mock the userService functions
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        created_at: new Date(),
      };

      vi.mocked(userService.getUserByEmail).mockResolvedValue(null);
      vi.mocked(userService.createUser).mockResolvedValue(mockUser);

      const response = await request
        .post('/api/passkey/register-start')
        .send({ email: 'test@example.com' });

      expect(response.status).toBe(201);
      expect(userService.getUserByEmail).toHaveBeenCalledWith(
        'test@example.com'
      );
      expect(userService.createUser).toHaveBeenCalledWith('test@example.com');
    });

    it('should handle registration with existing email', async () => {
      const existingUser = {
        id: 1,
        email: 'existing@example.com',
        created_at: new Date(),
      };

      vi.mocked(userService.getUserByEmail).mockResolvedValue(existingUser);

      const response = await request
        .post('/api/passkey/register-start')
        .send({ email: 'existing@example.com' });

      expect(response.status).toBe(201); // Still returns 201 as it will generate registration options
      expect(userService.getUserByEmail).toHaveBeenCalledWith(
        'existing@example.com'
      );
      expect(userService.createUser).not.toHaveBeenCalled();
    });

    it('should handle registration with invalid email', async () => {
      const response = await request
        .post('/api/passkey/register-start')
        .send({ email: 'invalid-email' });

      expect(response.status).toBe(400);
    });
  });

  describe('User Login', () => {
    it('should start login process for existing user', async () => {
      const existingUser = {
        id: 1,
        email: 'test@example.com',
        created_at: new Date(),
      };

      vi.mocked(userService.getUserByEmail).mockResolvedValue(existingUser);

      const response = await request
        .post('/api/passkey/login-start')
        .send({ email: 'test@example.com' });

      expect(response.status).toBe(201);
      expect(userService.getUserByEmail).toHaveBeenCalledWith(
        'test@example.com'
      );
    });

    it('should handle login attempt with non-existent user', async () => {
      vi.mocked(userService.getUserByEmail).mockResolvedValue(null);

      const response = await request
        .post('/api/passkey/login-start')
        .send({ email: 'nonexistent@example.com' });

      expect(response.status).toBe(404);
      expect(userService.getUserByEmail).toHaveBeenCalledWith(
        'nonexistent@example.com'
      );
    });
  });
});
