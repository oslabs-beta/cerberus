import type { Request, Response, NextFunction } from 'express';
import { CustomError } from '../middlewares/customError';

export const requirePasskeyAuth = (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  if (!req.session.isAuthenticated || !req.session.loggedInUserId) {
    return next(new CustomError('Authentication required', 401));
  }

  // Update last activity
  req.session.lastActivity = new Date();

  next();
};
