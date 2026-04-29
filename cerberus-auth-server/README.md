# cerberus-auth-server

A plug-and-play authentication server toolkit for Express applications. Supports both passkey (WebAuthn) and traditional password-based authentication out of the box.

## Features

- Passkey / WebAuthn authentication
- Password-based authentication with bcrypt hashing
- JWT access and refresh token management
- Redis session management
- Rate limiting and security headers via Helmet
- Login history tracking
- Password reset flow with email support
- PostgreSQL database integration

## Prerequisites

Before installing, make sure you have the following running:

- Node.js v18+
- PostgreSQL
- Redis

## Installation

```bash
npm install cerberus-auth-server
```

## Database Setup

Cerberus uses PostgreSQL. You will need to set up your database schema before using this package. Copy and run the SQL from our [GitHub repository](https://github.com/oslabs-beta/cerberus) found at `server/db/schema/`.

## Environment Variables

Create a `.env` file in your project root with the following:

```bash
DB_HOST=localhost
DB_PORT=5432
DB_USER=your_db_username
DB_PASSWORD=your_db_password
DB_NAME=auth_db

SESSION_SECRET=your_session_secret
JWT_SECRET=your_jwt_secret
REFRESH_TOKEN_SECRET=your_refresh_token_secret

REDIS_URL=redis://localhost:6379
NODE_ENV=development
PORT=3000
```

## Usage

```javascript
import express from 'express';
import { setupCerberus } from 'cerberus-auth-server';

const app = express();

await setupCerberus(app, {
  sessionSecret: process.env.SESSION_SECRET,
  jwtSecret: process.env.JWT_SECRET,
  rpName: 'Your App Name',
  rpID: 'yourdomain.com',
  origin: 'https://yourdomain.com',
  redisUrl: process.env.REDIS_URL,
});

app.listen(3000, () => {
  console.log('Server running with Cerberus authentication');
});
```

## API Routes

Once `setupCerberus` is called, the following routes are automatically mounted:

### Password Authentication
| Method | Route | Description |
|--------|-------|-------------|
| POST | /api/auth/register | Register a new user |
| POST | /api/auth/login | Login with email and password |
| POST | /api/auth/forgot-password | Request a password reset email |
| POST | /api/auth/reset-password | Reset password with token |
| POST | /api/auth/refresh-token | Issue new access token |

### Passkey Authentication
| Method | Route | Description |
|--------|-------|-------------|
| POST | /api/passkey/register-start | Begin passkey registration |
| POST | /api/passkey/register-finish | Complete passkey registration |
| POST | /api/passkey/login-start | Begin passkey login |
| POST | /api/passkey/login-finish | Complete passkey login |

### Protected Routes
| Method | Route | Description |
|--------|-------|-------------|
| GET | /api/user/me | Get current authenticated user |
| GET | /api/user/profile | Get user profile |
| GET | /api/user/login-history | Get login history |
| POST | /api/user/logout | Logout current user |

## Configuration Options

| Option | Type | Required | Default | Description |
|--------|------|----------|---------|-------------|
| sessionSecret | string | Yes | - | Secret for session encryption |
| jwtSecret | string | Yes | - | Secret for JWT signing |
| rpName | string | Yes | - | Relying party name for WebAuthn |
| rpID | string | Yes | - | Your domain name for WebAuthn |
| origin | string | No | https://rpID | Your app's origin URL |
| redisUrl | string | No | redis://localhost:6379 | Redis connection URL |
| cookieAge | number | No | 86400000 | Session cookie age in ms |
| apiPrefix | string | No | /api | Prefix for all mounted routes |

## Protecting Your Own Routes

```javascript
import { requirePasskeyAuth } from 'cerberus-auth-server';

app.get('/my-protected-route', requirePasskeyAuth, (req, res) => {
  res.json({ message: 'You are authenticated!' });
});
```

## Pair With the Frontend Package

This package works seamlessly with:

```bash
npm install cerberus-auth-react
```

Which provides ready-made React components for login, signup, and passkey flows.

## License

MIT

## Contributors

- [Fabiano Santin](https://github.com/fsantin1985)
- [Molly Josephson](https://github.com/mjosephson5)
- [Gabriel Davis](https://github.com/duimaurisfootball)
- [Boyu Hu](https://github.com/BoyuHu514)

## Sponsored by

[OSLabs](https://www.opensourcelabs.io/)