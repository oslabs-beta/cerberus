/**
 * Cerberus Authentication Kit
 * A comprehensive authentication toolkit supporting passkeys and passwords
 */
// Core configuration
export { setupCerberus } from './config/setup.js';

// Auth middleware
export { requirePasskeyAuth } from './middlewares/requirePasskeyAuth.js';

// Routes (for customization)
export { default as passkeyRoutes } from './routes/passkey-routes.js';
export { default as authRoutes } from './routes/auth.js';
export { default as protectedRoutes } from './routes/protected-routes.js';

// Type definitions
export type { User } from './models/db.js';
export type { DBAuthenticatorDevice } from './models/passkeys-credential-service.js';
