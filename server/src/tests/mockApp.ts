// server/src/tests/mockApp.ts
import express from 'express';
import authRouter from '../routes/auth.js';
import passkeyRouter from '../routes/passkey-routes.js';
import protectedRoutes from '../routes/protected-routes.js';
import { errorHandler } from '../middlewares/errorHandler.js';
import cookieParser from 'cookie-parser';

// Create a minimal Express app for testing
const app = express();

// Add necessary middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Add routes
app.use('/api/auth', authRouter);
app.use('/api/passkey', passkeyRouter);
app.use('/api/user', protectedRoutes);

// Add error handler
app.use(errorHandler);

export default app;
