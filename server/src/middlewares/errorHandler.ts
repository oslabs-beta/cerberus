// middlewares/errorHandler.ts
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
  const defaultErr: CustomError = {
    name: 'ServerError',
    message: 'An error occurred',
    log: 'Express error handler caught unknown middleware error',
    status: 500,
    customMessage: { error: 'An error occurred' },
  };

  console.error('Detailed error:', {
    message: err.message,
    stack: err.stack,
    name: err.name,
    // If using CustomError class
    code: err.code,
    status: err.status,
  });
  // Define a default error structure

  // Merge the incoming error with our default
  const errorObj = { ...defaultErr, ...err };

  // Log the error
  console.error(errorObj.log);

  // Return the response
  // return res.status(errorObj.status || 500).json(errorObj.message);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
  });
};
