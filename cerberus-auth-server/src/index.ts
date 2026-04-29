// Core configuration
export { setupCerberus } from './config/setup';

// Auth middleware
export { requirePasskeyAuth } from './middlewares/requirePasskeyAuth';

// Routes
export { default as passkeyRoutes } from './routes/passkey-routes';
export { default as authRoutes } from './routes/auth';
export { default as protectedRoutes } from './routes/protected-routes';

// Types
export type { User } from './models/db';
export type { DBAuthenticatorDevice } from './models/passkeys-credential-service';