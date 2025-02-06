// middlewares/errorHandler.ts
import type { Request, Response } from 'express';

interface ErrorMessage {
  error: string;
}

interface CustomError extends Error {
  log?: string;
  status?: number;
  customMessage?: ErrorMessage;
}

export const errorHandler = (
  err: CustomError,
  _req: Request,
  res: Response
): Response => {
  // Define a default error structure
  const defaultErr: CustomError = {
    name: 'ServerError',
    message: 'An error occurred',
    log: 'Express error handler caught unknown middleware error',
    status: 500,
    customMessage: { error: 'An error occurred' },
  };

  // Merge the incoming error with our default
  const errorObj = { ...defaultErr, ...err };

  // Log the error
  console.error(errorObj.log);

  // Return the response
  return res.status(errorObj.status || 500).json(errorObj.message);
};
