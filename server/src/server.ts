import express, { Express } from 'express';
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

// app.use(
//   session({
//     // @ts-ignore
//     secret: process.env.SESSION_SECRET,
//     saveUninitialized: true,
//     resave: false,
//     cookie: {
//       maxAge: process.env.COOKIE_AGE,
//       httpOnly: true, // Ensure to not expose session cookies to clientside scripts
//     },
//   })
// );

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
