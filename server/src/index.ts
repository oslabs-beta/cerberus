/**
 * Cerberus Authentication Kit
 * A comprehensive authentication toolkit supporting passkeys and passwords
 */
// Core configuration
export { setupCerberus } from './config/setup';

// Auth middleware
export { requirePasskeyAuth } from './middlewares/requirePasskeyAuth';

// Routes (for customization)
export { default as passkeyRoutes } from './routes/passkey-routes';
export { default as authRoutes } from './routes/auth';
export { default as protectedRoutes } from './routes/protected-routes';

// Type definitions
export type { User } from './models/db';
export type { DBAuthenticatorDevice } from './models/passkeys-credential-service';
