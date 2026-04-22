import type { Request, Response, NextFunction } from 'express';

export const authMonitoring = (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  // Only log when auth method changes
  if (req.session?.authMethod) {
    console.log('Authentication event:', {
      userId: req.session.loggedInUserId,
      method: req.session.authMethod,
      timestamp: new Date().toISOString(),
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });
  }
  next();
};
