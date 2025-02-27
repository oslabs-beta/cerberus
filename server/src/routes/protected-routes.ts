// src/routes/protected-routes.ts
import express from 'express';
import { requirePasskeyAuth } from '../middlewares/requirePasskeyAuth.js';
import { userService } from '../models/passkeys-user-service.js';
import { redisClient } from '../server.js';

const router = express.Router();

// Get user profile data
router.get('/profile', requirePasskeyAuth, async (req, res, next) => {
  try {
    const userId = parseInt(req.session.loggedInUserId!, 10); // Convert string to number
    const user = await userService.getUserById(userId);
    res.json({
      email: user.email,
      createdAt: user.created_at,
    });
  } catch (error) {
    next(error);
  }
});

// Get user's login history
router.get('/login-history', requirePasskeyAuth, async (req, res, next) => {
  try {
    const userId = parseInt(req.session.loggedInUserId!, 10);
    const loginHistory = await userService.getLoginHistory(userId);
    res.json(loginHistory);
  } catch (error) {
    next(error);
  }
});

// this validates user's session
router.get('/me', requirePasskeyAuth, async (req, res, next) => {
  try {
    const userId = parseInt(req.session.loggedInUserId!, 10);
    const user = await userService.getUserById(userId);

    res.json({
      id: user.id.toString(),
      email: user.email,
      createdAt: user.created_at,
    });
  } catch (error) {
    next(error);
  }
});

// Add this to protected-routes.ts
router.post('/logout', requirePasskeyAuth, (req, res) => {
  const sessionID = req.sessionID;

  // Clear session
  req.session.destroy((err) => {
    if (err) {
      console.error('Session destruction error:', err);
      return res.status(500).json({ message: 'Error during logout' });
    }

    redisClient.del(`cerberus:${sessionID}`);
  });

  // Clear session cookie with matching options
  res.clearCookie('sessionId', {
    path: '/',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  });

  // Clear auth cookies with matching options
  res.clearCookie('accessToken', {
    path: '/',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  });

  res.clearCookie('refreshToken', {
    path: '/',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  });

  res.status(200).json({ message: 'Logged out successfully' });
});

export default router;
