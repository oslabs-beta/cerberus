import express from 'express';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import authRouter from './routes/auth';
// import registerRoute from './routes/registerRoute';
// import loginRoute from './routes/loginRoute';
// import forgotPasswordRoute from './routes/forgotPasswordRoute';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config();

const PORT = process.env.PORT || 3000;

const app = express();

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
// app.use('/api/auth', authRouter);

// catch-all route handler for any requests to an unknown route
app.use((_req, res) => {
  res.status(404).send('Not found');
});

/**
 * configure express global error handler
 * @see https://expressjs.com/en/guide/error-handling.html#writing-error-handlers
//  */

// app.use(
//   (err: Error, _req: Request, res: Response, next: NextFunction): void => {
//     const defaultErr = {
//       log: 'Express error handler caught unknown middleware error',
//       status: 500,
//       message: { err: 'An error occurred' },
//     };

//     const errorObj = Object.assign({}, defaultErr, {
//       message: { err: err.message },
//       status: res.statusCode,
//     });
//     console.log(errorObj.log);

//     return res.status(errorObj.status).json(errorObj.message);
//   }
// );

/**
 * start server
 */
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
