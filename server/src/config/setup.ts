import express from 'express';
import session from 'express-session';
import { createClient } from 'redis';
import { RedisStore } from 'connect-redis';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';

import authRouter from '../routes/auth';
import passkeyRouter from '../routes/passkey-routes';
import protectedRoutes from '../routes/protected-routes';
import { errorHandler } from '../middlewares/errorHandler';
import { authMonitoring } from '../middlewares/authMonitoring';

export interface CerberusOptions {
  redisUrl?: string;
  sessionSecret: string;
  jwtSecret: string;
  rpName: string;
  rpID: string;
  origin?: string;
  cookieAge?: number;
  apiPrefix?: string;
}

export const setupCerberus = async (
  app: express.Express,
  options: CerberusOptions
) => {
  // Set constants
  process.env.JWT_SECRET = options.jwtSecret;
  process.env.RP_NAME = options.rpName;
  process.env.RP_ID = options.rpID;
  process.env.ORIGIN = options.origin || `https://${options.rpID}`;

  // Setup middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());
  app.use(helmet());

  // Rate limiting
  const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
  });
  app.use(globalLimiter);

  // Redis setup
  const redisClient = createClient({
    url: options.redisUrl || 'redis://localhost:6379',
  });

  redisClient.on('error', (err) => console.log('Redis Client Error', err));
  await redisClient.connect();

  // Session store
  const redisStore = new RedisStore({
    client: redisClient,
    prefix: 'cerberus:',
  });

  // Session middleware
  app.use(
    session({
      store: redisStore,
      secret: options.sessionSecret,
      name: 'sessionId',
      saveUninitialized: false,
      resave: false,
      cookie: {
        maxAge: options.cookieAge || 86400000, // 24 hours
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
      },
    })
  );

  app.use(authMonitoring);

  // Mount routes
  const prefix = options.apiPrefix || '/api';
  app.use(`${prefix}/auth`, authRouter);
  app.use(`${prefix}/passkey`, passkeyRouter);
  app.use(`${prefix}/user`, protectedRoutes);

  // Error handling
  app.use(errorHandler);

  return {
    redisClient,
    redisStore,
  };
};
