import type { NextFunction, Request, Response } from 'express';

interface ErrorMessage {
  error: string;
}

interface CustomError extends Error {
  log?: string;
  status?: number;
  customMessage?: ErrorMessage;
  code?: string | number;
}

export const errorHandler = (
  err: CustomError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  if (err.status !== 401) {
    console.error('Express error handler caught unknown middleware error');
    console.error('Detailed error:', err);
  }

  // Send appropriate response
  const statusCode = err.status || 500;
  const message = err.message || 'An unexpected error occurred';

  res.status(statusCode).json({
    error: message,
  });
};
