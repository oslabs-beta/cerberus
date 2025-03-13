import express, { Router } from 'express';
import type { Request, Response } from 'express';
import formBasedController from '../controllers/formBasedController';
import nodemailer from 'nodemailer';
import rateLimit from 'express-rate-limit';

const router: Router = express.Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Too many login attempts, please try again after 15 minutes',
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Don't count successful logins against the limit
});

router.post(
  '/register',
  loginLimiter,
  formBasedController.validateRegistration,
  formBasedController.checkExistingUser,
  formBasedController.hashPassword, // hash password before storing it in our database
  formBasedController.createUser, // stores user information in PostgreSQL database
  (_req: Request, res: Response) => {
    res.status(201).json({
      success: true,
      message: 'Registration successful',
      user: res.locals.user,
    });
  }
);

// login route
router.post(
  '/login',
  formBasedController.validateLoginData,
  formBasedController.authenticateUser,
  (_req: Request, res: Response) => {
    res.status(200).json({
      message: 'Login successful',
      user: res.locals.user,
      expiresAt: res.locals.expiresAt,
      sessionId: res.locals.sessionId,
    });
  }
);

router.post(
  '/forgot-password',
  formBasedController.validateEmail,
  formBasedController.sendPasswordResetEmail,
  (_req: Request, res: Response) => {
    // Always return the same message whether user exists or not (security best practice)
    res.status(200).json({
      message:
        'If an account exists with this email, a password reset link will be sent.',
    });
  }
);

// Route to handle the actual password reset
router.post(
  '/reset-password',
  formBasedController.validateResetToken,
  formBasedController.hashPassword,
  formBasedController.resetPassword,
  (_req: Request, res: Response) => {
    res.status(200).json({
      message: 'Password successfully reset',
    });
  }
);

// for testing sending emails with MailHog -
// MAKE SURE MAILHOG is running before sending POST request to /test-email
// then go to http://localhost:8025 to vizualize it
router.post('/test-email', async (_req, res) => {
  const transporter = nodemailer.createTransport({
    host: 'localhost',
    port: 1025,
    secure: false,
    ignoreTLS: true,
  });

  try {
    await transporter.sendMail({
      from: 'test@localhost',
      to: 'test@example.com',
      subject: 'Test Email',
      text: 'If you see this in MailHog, everything is working!',
    });
    res.json({ message: 'Test email sent to MailHog' });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to send test email',
      details: (error as Error).message,
    });
  }
});

router.post(
  '/refresh-token',
  formBasedController.validateRefreshToken,
  formBasedController.issueNewTokens,
  (_req: Request, res: Response) => {
    res.status(200).json({
      success: true,
      expiresAt: res.locals.expiresAt,
    });
  }
);

export default router;
