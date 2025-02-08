import express from 'express';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import authRouter from './routes/auth';
import { errorHandler } from './middlewares/errorHandler';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config();

const PORT = process.env.PORT || 3000;

const app = express();
// Trust the proxy (to correctly get user's IP address after deployed behind a proxy)
app.set('trust proxy', true);

/**
 * Automatically parse urlencoded body content and form data from incoming requests and place it
 * in req.body
 */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(join(__dirname, '../public')));
app.use('/assets', express.static(join(__dirname, 'assets')));
app.use(express.static(join(__dirname, '../../client/dist')));

// Form-based authentication routes
app.use('/api/auth', authRouter);

// catch-all route handler for any requests to an unknown route
app.use((_req, res) => {
  res.status(404).send('Not found');
});

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
