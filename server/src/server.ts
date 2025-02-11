import express from 'express';
import type { Express } from 'express';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import authRouter from './routes/auth';
import passkeyRouter from './routes/passkey-routes';
import session from 'express-session';
import { errorHandler } from './middlewares/errorHandler';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config();

const PORT = process.env.PORT || 3000;

if (!process.env.SESSION_SECRET) {
  throw new Error('SESSION_SECRET environment variable is not set');
}

const app: Express = express();

declare module 'express-session' {
  interface SessionData {
    currentChallenge?: string;
    loggedInUserId?: string;
  }
}

// Trust the proxy (to correctly get user's IP address after deployed behind a proxy)
app.set('trust proxy', true);

/**
 * Automatically parse urlencoded body content and form data from incoming requests and place it
 * in req.body
 */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// The following sets up a session-management cookie (connect.sid)
// It stores a session ID (connect.sid by default) that the server uses to
// look up session data stored on the server (e.g., in memory, Redis, or a database).
// The session data is stored on the server, so the cookie itself only contains the session ID.
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    saveUninitialized: true,
    resave: false,
    cookie: {
      maxAge: parseInt(process.env.COOKIE_AGE || '86400000', 10), // defaults to 24 hours
      httpOnly: true, // Ensure to not expose session cookies to clientside scripts
    },
  })
);

// Serve static files
app.use(express.static(join(__dirname, '../public')));
app.use('/assets', express.static(join(__dirname, 'assets')));
app.use(express.static(join(__dirname, '../../client/dist')));

/************************************************************************************
 *                               Register all routes
 ***********************************************************************************/

// Form-based authentication routes
app.use('/api/auth', authRouter);

// Passkeys-based authentication routes
app.use('/api/passkey', passkeyRouter);

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
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
