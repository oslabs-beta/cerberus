// server/src/tests/mockApp.ts
import express from 'express';
import http from 'http';
// import type { AddressInfo } from 'net';
import authRouter from '../routes/auth.js';
import passkeyRouter from '../routes/passkey-routes.js';
import protectedRoutes from '../routes/protected-routes.js';
import { errorHandler } from '../middlewares/errorHandler.js';
import cookieParser from 'cookie-parser';
import cors from 'cors';

// Extend the Express application type to include the address method
interface ServerAddressInfo {
  port: number;
  address: string;
}

interface TestableExpressApp extends express.Express {
  address(): ServerAddressInfo;
}

// Create a minimal Express app for testing
const app = express() as TestableExpressApp;

// Create a server using the app
const server = http.createServer(app);

// Add necessary middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Add routes
app.use('/api/auth', authRouter);
app.use('/api/passkey', passkeyRouter);
app.use('/api/user', protectedRoutes);

// Add error handler
app.use(errorHandler);

// Add address method to the app
app.address = function () {
  const addr = server.address();

  // Handle potential null or string return from server.address()
  if (addr === null) {
    return { port: 0, address: '127.0.0.1' };
  }

  // If it's an AddressInfo object
  if (typeof addr === 'object' && 'port' in addr && 'address' in addr) {
    return {
      port: addr.port,
      address: addr.address,
    };
  }

  // Fallback if something unexpected happens
  return { port: 0, address: '127.0.0.1' };
};

export default app;
export { server };
