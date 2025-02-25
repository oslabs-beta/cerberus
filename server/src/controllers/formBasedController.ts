// Handles password-based authentication

import userModel from '../models/db';
import bcrypt from 'bcrypt';
import nodemailer from 'nodemailer';
import crypto from 'crypto';
import type { Request, Response, NextFunction } from 'express';
import { tokenService } from '../services/tokenService';

interface FormBasedController {
  validateRegistration: (
    req: Request,
    res: Response,
    next: NextFunction
  ) => void;
  checkExistingUser: (
    req: Request,
    res: Response,
    next: NextFunction
  ) => Promise<void>;
  hashPassword: (
    req: Request,
    res: Response,
    next: NextFunction
  ) => Promise<void>;
  createUser: (
    req: Request,
    res: Response,
    next: NextFunction
  ) => Promise<void>;
  createMongoUser: (
    req: Request,
    res: Response,
    next: NextFunction
  ) => Promise<void>;
  rollbackSupabaseUser: (
    req: Request,
    res: Response,
    next: NextFunction
  ) => Promise<void>;
  validateLoginData: (req: Request, res: Response, next: NextFunction) => void;
  authenticateUser: (
    req: Request,
    res: Response,
    next: NextFunction
  ) => Promise<void>;
  verifyToken: (req: Request, res: Response, next: NextFunction) => void;
  validateEmail: (req: Request, res: Response, next: NextFunction) => void;
  sendPasswordResetEmail: (
    req: Request,
    res: Response,
    next: NextFunction
  ) => Promise<void>;
  validateResetToken: (
    req: Request,
    res: Response,
    next: NextFunction
  ) => Promise<void>;
  resetPassword: (
    req: Request,
    res: Response,
    next: NextFunction
  ) => Promise<void>;
  validateRefreshToken: (
    req: Request,
    res: Response,
    next: NextFunction
  ) => Promise<void>;
  issueNewTokens: (
    req: Request,
    res: Response,
    next: NextFunction
  ) => Promise<void>;
}

const formBasedController: FormBasedController = {
  validateRegistration: (_req, _res, _next) => {},
  checkExistingUser: async (_req, _res, _next) => {},
  hashPassword: async (_req, _res, _next) => {},
  createUser: async (_req, _res, _next) => {},
  createMongoUser: async (_req, _res, _next) => {},
  rollbackSupabaseUser: async (_req, _res, _next) => {},
  validateLoginData: (_req, _res, _next) => {},
  authenticateUser: async (_req, _res, _next) => {},
  verifyToken: (_req, _res, _next) => {},
  validateEmail: (_req, _res, _next) => {},
  sendPasswordResetEmail: async (_req, _res, _next) => {},
  validateResetToken: async (_req, _res, _next) => {},
  resetPassword: async (_req, _res, _next) => {},
  validateRefreshToken: async (_req, _res, _next) => {},
  issueNewTokens: async (_req, _res, _next) => {},
};

// validating incoming user data
formBasedController.validateRegistration = (req, _res, next) => {
  const { email, password } = req.body;

  if (
    !email ||
    email.length > 255 ||
    !email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)
  ) {
    return next({
      log: 'Invalid email',
      status: 400,
      message: { error: 'Valid email is required' },
    });
  }

  if (!password || password.length < 8 || password.length > 72) {
    return next({
      log: 'Invalid password',
      status: 400,
      message: { error: 'Password must be between 8 and 72 characters' },
    });
  }

  // Check that password contains at least one uppercase letter,
  // one number, and one special character
  const passwordRegex =
    /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()\-_+=[\]{};:'"\\|,.<>/?])[A-Za-z\d!@#$%^&*()\-_+=[\]{};:'"\\|,.<>/?]{8,72}$/;
  if (!passwordRegex.test(password)) {
    return next({
      log: 'Invalid password',
      status: 400,
      message: {
        error:
          'Password must contain at least one uppercase letter, one number, and one special character',
      },
    });
  }

  next();
};

// Check if user already exists
formBasedController.checkExistingUser = async (req, res, next) => {
  const { email } = req.body;

  try {
    const existingUser = await userModel.getUserByEmail(email);

    // User exists and already has a password
    if (existingUser && existingUser.password_hash) {
      return next({
        log: 'User already exists',
        status: 409,
        message: { error: 'Email already registered' },
      });
    }

    // Case when the user already exists because he registered via passkey
    // (but doesn't yet have a stored hashed password)
    if (existingUser) {
      res.locals.existingUser = existingUser;
    }
    next();
  } catch (error) {
    return next({
      log: 'Error checking existing user: ' + error,
      status: 500,
      message: { error: 'An error occurred while checking user existence' },
    });
  }
};

// hashing password
formBasedController.hashPassword = async (req, res, next) => {
  try {
    const saltRounds = Number(process.env.SALT_ROUNDS) || 10;
    const hashedPassword = await bcrypt.hash(req.body.password, saltRounds);
    res.locals.hashedPassword = hashedPassword;
    next();
  } catch (error) {
    return next({
      log: 'Error hashing password: ' + error,
      status: 500,
      message: { error: 'An error occurred while processing your request' },
    });
  }
};

// creates user in PostgreSQL database
formBasedController.createUser = async (req, res, next) => {
  const { fname, email } = req.body;
  const hashedPassword = res.locals.hashedPassword;

  try {
    let user;

    if (res.locals.existingUser) {
      // Update existing passkey-only user with password
      user = await userModel.updateUserPassword(
        res.locals.existingUser.id,
        hashedPassword
      );
    } else {
      // create new user
      user = await userModel.createUser(email, hashedPassword, fname);
    }

    res.locals.user = {
      email: user.email,
    };
    next();
  } catch (error) {
    return next({
      log: 'Error creating user: ' + error,
      status: 500,
      message: { error: 'An error occurred while creating your account' },
    });
  }
};

// Validate login data
formBasedController.validateLoginData = (req, _res, next) => {
  const { email, password } = req.body;

  if (!email || !email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
    return next({
      log: 'Invalid email format',
      status: 400,
      message: { error: 'Valid email is required' },
    });
  }

  if (!password) {
    return next({
      log: 'Missing password',
      status: 400,
      message: { error: 'Password is required' },
    });
  }

  next();
};

// Authenticate user
formBasedController.authenticateUser = async (req, res, next) => {
  const { email, password } = req.body;
  let user;

  try {
    user = await userModel.getUserByEmail(email);

    if (!user) {
      return next({
        log: 'User not found',
        status: 401,
        message: { error: 'Invalid email or password' },
      });
    }

    // Compare password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);

    if (!isValidPassword) {
      return next({
        log: 'Invalid password',
        status: 401,
        message: { error: 'Invalid email or password' },
      });
    }

    // Record the login
    // To get the user's IP address, either req.socket.remoteAddress or req.ip works
    // another option: req.headers['x-forwarded-for']
    // might need to paste (app.set('trust proxy', true);) into server.ts to trust
    const ipAddress = req.ip || 'unknown';
    await userModel.recordLogin(user.id, ipAddress, true);

    // Generate JWT token using service
    // const { token, expiresAt } = tokenService.generateAuthToken({
    //   userId: user.id,
    //   email: user.email,
    // });
    const tokens = tokenService.generateTokens({
      userId: user.id,
      email: user.email,
    });

    // Store refresh token
    await tokenService.storeRefreshToken(user.id, tokens.refreshToken);

    // set cookie
    // res.cookie('token', token, {
    //   httpOnly: true, // prevents client-side scripts from accessing this cookie (security against XSS)
    //   secure: process.env.NODE_ENV === 'production', // this ensures cross-site cookies are only accessible over HTTPS connections
    //   sameSite: 'strict', // check to see if we need this
    //   maxAge: Number(process.env.COOKIE_AGE) || 24 * 60 * 60 * 1000, // cookie's expiration
    // });

    res.cookie('accessToken', tokens.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Add session ID to response for frontend tracking
    const sessionId = crypto.randomBytes(16).toString('hex');
    res.locals.sessionId = sessionId;

    // set response data
    res.locals.user = {
      id: user.id,
      email: user.email,
      created_at: user.created_at,
    };

    res.locals.expiresAt = tokens.accessTokenExpiresAt;

    next();
  } catch (error) {
    if (user) {
      await userModel.recordLogin(user.id, req.ip || 'unknown', false);
    }

    return next({
      log: 'Error in authenticateUser: ' + error,
      status: 500,
      message: { error: 'An error occurred during authentication' },
    });
  }
};

// Validate email middleware
formBasedController.validateEmail = (req, _res, next) => {
  const { email } = req.body;

  if (!email || !email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
    return next({
      log: 'Invalid email format',
      status: 400,
      message: { error: 'Valid email is required' },
    });
  }

  next();
};

// Password-reset email middleware
formBasedController.sendPasswordResetEmail = async (req, _res, next) => {
  const { email } = req.body;

  try {
    // Check if user exists
    const user = await userModel.getUserByEmail(email);

    if (!user) {
      // Don't reveal whether user exists, just end successfully
      return next();
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now

    // Save token in database
    await userModel.saveResetToken(user.id, resetToken, resetTokenExpiry);

    // Create email transport - configured for MailHog
    const transporter = nodemailer.createTransport({
      service: 'localhost',
      port: 1025, // MailHog SMTP port
      secure: false,
      ignoreTLS: true, // since we're running locally
      // auth: {
      //   user: process.env.EMAIL_USER,
      //   pass: process.env.EMAIL_APP_PASSWORD, // will need to fill this out during production
      // },
    });

    // Create reset URL
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

    // Send email
    await transporter.sendMail({
      // from: process.env.EMAIL_USER,
      from: 'development@localhost',
      to: email,
      subject: 'Password Reset Request',
      html: `
        <h1>Password Reset Request</h1>
        <p>You requested to reset your password. Click the link below to reset it:</p>
        <a href="${resetUrl}">Reset Password</a>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request this, please ignore this email.</p>
      `,
    });

    next();
  } catch (error) {
    return next({
      log: 'Error in sendPasswordResetEmail: ' + error,
      status: 500,
      message: { error: 'Failed to process password reset request' },
    });
  }
};

// Validate reset token middleware
formBasedController.validateResetToken = async (req, res, next) => {
  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    return next({
      log: 'Missing token or new password',
      status: 400,
      message: { error: 'Token and new password are required' },
    });
  }

  try {
    const resetRequest = await userModel.getResetToken(token);

    if (
      !resetRequest ||
      !resetRequest.is_valid ||
      new Date() > resetRequest.expires_at
    ) {
      return next({
        log: 'Invalid or expired reset token',
        status: 400,
        message: { error: 'Invalid or expired reset token' },
      });
    }

    res.locals.userId = resetRequest.user_id;
    next();
  } catch (error) {
    return next({
      log: 'Error validating reset token: ' + error,
      status: 500,
      message: { error: 'Failed to validate reset token' },
    });
  }
};

// Reset password middleware
formBasedController.resetPassword = async (_req, res, next) => {
  const userId = res.locals.userId;
  const hashedPassword = res.locals.hashedPassword;

  try {
    await userModel.updatePassword(userId, hashedPassword);
    await userModel.invalidateResetToken(userId);
    next();
  } catch (error) {
    return next({
      log: 'Error resetting password: ' + error,
      status: 500,
      message: { error: 'Failed to reset password' },
    });
  }
};

// Validate refresh token from cookie
formBasedController.validateRefreshToken = async (req, res, next) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return next({
        log: 'No refresh token provided',
        status: 401,
        message: { error: 'Authentication required' },
      });
    }

    // Verify token and check if it exists in database
    const payload = await tokenService.verifyRefreshToken(refreshToken);

    if (!payload) {
      // Clear both cookies if refresh token is invalid
      res.clearCookie('accessToken');
      res.clearCookie('refreshToken');

      return next({
        log: 'Invalid refresh token',
        status: 401,
        message: { error: 'Please login again' },
      });
    }

    // Store payload for next middleware
    res.locals.tokenPayload = payload;
    next();
  } catch (error) {
    next(error);
  }
};

// Issue new access and refresh tokens
formBasedController.issueNewTokens = async (req, res, next) => {
  try {
    const { userId, email } = res.locals.tokenPayload;

    // Generate new tokens
    const tokens = tokenService.generateTokens({ userId, email });

    // Store new refresh token
    await tokenService.storeRefreshToken(userId, tokens.refreshToken);

    // Revoke old refresh token
    await tokenService.revokeRefreshToken(req.cookies.refreshToken);

    // Set new cookies
    res.cookie('accessToken', tokens.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Send response
    res.json({
      success: true,
      expiresAt: tokens.accessTokenExpiresAt,
    });
  } catch (error) {
    next(error);
  }
};

export default formBasedController;
