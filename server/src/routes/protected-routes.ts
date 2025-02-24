// src/routes/protected-routes.ts
import express from 'express';
import { requirePasskeyAuth } from '../middlewares/requirePasskeyAuth';
import { userService } from '../models/passkeys-user-service';

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

export default router;
