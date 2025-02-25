import express from 'express';
import type { Express } from 'express';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import authRouter from './routes/auth';
import passkeyRouter from './routes/passkey-routes';
import session from 'express-session';
import chatRoutes from './routes/chatRoutes'
import { createClient } from 'redis';
import { RedisStore } from 'connect-redis';
import { errorHandler } from './middlewares/errorHandler';
import cookieParser from 'cookie-parser';
import oauthRouter from './routes/oauthRoutes'
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import protectedRoutes from './routes/protected-routes';
import { authMonitoring } from './middlewares/authMonitoring';
import cookieParser from 'cookie-parser';
import cors from 'cors';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// CORS configuration
const corsOptions = {
  origin:
    process.env.NODE_ENV === 'production'
      ? process.env.FRONTEND_URL
      : ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true, // Important for cookies
  optionsSuccessStatus: 200,
};

// Load environment variables
dotenv.config();

const PORT = process.env.PORT || 3000;

// const app = express();
if (!process.env.SESSION_SECRET) {
  throw new Error('SESSION_SECRET environment variable is not set');
}

const app: Express = express();

// Initialize Redis client
const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
});

// Redis error handling
redisClient.on('error', (err) => console.log('Redis Client Error', err));
redisClient.on('connect', () => console.log('Redis Client Connected'));

// Connect to Redis
await redisClient.connect();

// Initialize store
const redisStore = new RedisStore({
  client: redisClient,
  prefix: 'cerberus:', // Optional prefix for Redis keys
});

declare module 'express-session' {
  interface SessionData {
    currentChallenge?: string;
    loggedInUserId?: string;
    isAuthenticated?: boolean;
    lastActivity?: Date;
    authMethod?: 'passkey';
  }
}

app.use(cors(corsOptions));

// Trust the proxy (to correctly get user's IP address after deployed behind a proxy)
// app.set('trust proxy', true);
// app.set('trust proxy', '127.0.0.1');
// or if you're behind a single proxy:
// app.set('trust proxy', 1);
app.set('trust proxy', function (ip: string) {
  // Only trust requests from localhost or your proxy's IP
  return ip === '127.0.0.1' || ip === 'your-proxy-ip';
});

// Security middleware
app.use(helmet()); // Adds security headers

// Global rate limiter for all routes
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});
app.use(globalLimiter);
/**
 * Automatically parse urlencoded body content and form data from incoming requests and place it
 * in req.body
 */
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// The following sets up a session-management cookie (connect.sid) with Redis store
// It stores a session ID (connect.sid by default) that the server uses to
// look up session data stored on the memory (Redis) of the server
// Session middleware with Redis store
app.use(
  session({
    store: redisStore,
    secret: process.env.SESSION_SECRET!,
    name: 'sessionId', // Custom cookie name
    saveUninitialized: false, // session starts when we explicitly store data (in passkey workflow, in our case)
    resave: false, // Don't save session if unmodified
    cookie: {
      maxAge: parseInt(process.env.COOKIE_AGE || '86400000', 10),
      httpOnly: true, // Prevent client-side access to cookie
      secure: process.env.NODE_ENV === 'production', // Require HTTPS in production
      sameSite: 'strict', // CSRF protection
    },
  })
);

// this logs every time a session changes - see authMonitoring.ts
app.use(authMonitoring);

// Serve static files
app.use(express.static(join(__dirname, '../public')));
app.use('/assets', express.static(join(__dirname, 'assets')));
app.use(express.static(join(__dirname, '../../client/dist')));
/************************************************************************************
 *                               Register all routes
 ***********************************************************************************/

// Password-based authentication routes
app.use('/api/auth', authRouter);
// oauth authentication routes
app.use('/api/oauth', oauthRouter)
// Passkeys-based authentication routes
app.use('/api/passkey', passkeyRouter);

// Protected routes for passkey authentication - all routes here require authentication
app.use('/api/user', protectedRoutes);
// chatgpt routes
app.use('/api/chatbot', chatRoutes);

/************************************************************************************
 *                               Catch-all route handler
 ***********************************************************************************/

// catch-all route handler for any requests to an unknown route
app.use((_req, res) => {
  res.status(404).send('Not found');
});

/************************************************************************************
 *                               Global error handler
 ***********************************************************************************/

/**
 * configure express global error handler
 * @see https://expressjs.com/en/guide/error-handling.html#writing-error-handlers
//  */

// 2) Global error handler
app.use(errorHandler);

/**
 * start server
 */
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

export default app;
