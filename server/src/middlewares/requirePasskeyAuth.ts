import type { Request, Response, NextFunction } from 'express';
import { CustomError } from '../middlewares/customError.js';
import jwt from 'jsonwebtoken';
import type { JwtPayload } from 'jsonwebtoken';

interface TokenPayload extends JwtPayload {
  userId: string | number;
  email?: string;
  // Add any other properties token contains
}

export const requirePasskeyAuth = (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  // First check session-based auth (passkeys)
  if (req.session.isAuthenticated && req.session.loggedInUserId) {
    // Update last activity
    req.session.lastActivity = new Date();
    return next();
  }

  // If not session authenticated, check for token-based auth
  const accessToken = req.cookies?.accessToken;

  if (accessToken) {
    try {
      // Verify the token
      const decoded = jwt.verify(
        accessToken,
        process.env.JWT_SECRET!
      ) as TokenPayload;

      // Store the user ID in the session temporarily
      req.session.loggedInUserId = decoded.userId.toString();

      return next();
    } catch (error) {
      // Token error, fall through to authentication required error
      console.error(error);
    }
  }

  // If we get here, neither authentication method succeeded
  return next(new CustomError('Authentication required', 401));
};
