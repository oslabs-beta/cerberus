# Cerberus Authentication Toolkit

A comprehensive authentication toolkit supporting both traditional password-based authentication and modern passkeys (WebAuthn).

reference: https://github.com/CodesmithLLC/PRO-README?tab=readme-ov-file

https://docs.github.com/en/get-started/writing-on-github/getting-started-with-writing-and-formatting-on-github/basic-writing-and-formatting-syntax

https://docs.github.com/en/get-started/writing-on-github/working-with-advanced-formatting/creating-and-highlighting-code-blocks

## Features

- Dual authentication methods: Passkey (WebAuthn) and traditional passwords
- Session management with Redis
- JWT support for API authentication
- Password reset functionality
- Express-based middleware
- TypeScript support
- Rate limiting and security headers

## About

Cerberus is an authentication toolkit for developers to offer users to authenticate with either password or passkeys.

(link to website)

## Product Description

Cerberus is an open-source authentication toolkit that simplifies implementing secure user authentication in your web applications.

Developers often struggle to find a free and easy-to-use open source passkey authentication solution. This is our endeavor and, because we know many users don't know or understand passkeys yet, we included traditional password-based authentication within Cerberus.

The toolkit consists of React components for the authentication forms (sign-up, login, password-recovery), a landing page, and the dashboard your users have access to once they’ve been authenticated.

Besides these frontend components and integrated functionality, you get all the routing and middleware for the authentication workflow, as well as full PostgreSQL database setup.

## Get Started

The easiest way to get started is by forking this repository and working from the existing codebase.

```bash
npm install cerberus-auth
```

### Quick Start

```javascript
// Basic setup example
import { setupCerberus } from 'cerberus-auth';

const app = express();
setupCerberus(app, {
  redisUrl: process.env.REDIS_URL,
  sessionSecret: process.env.SESSION_SECRET,
  jwtSecret: process.env.JWT_SECRET,
  rpName: 'Your App Name',
  rpID: 'your-domain.com',
});

// Now you can use the authentication routes
// GET /api/auth/login, /api/passkey/register-start, etc.
```

See the Database Setup Instructions section below on specifics concerning the database as well as environment variables needed.

### Installing and Running Redis

Cerberus uses Redis to manage sessions when users authenticate via passkey.

Here are the instructions to install and run Redis:

For macOS Users

1. Install Redis:

- The easiest way to install Redis on macOS is using Homebrew. If you don't have Homebrew installed, follow the instructions at [brew.sh](https://brew.sh/).
- Once Homebrew is installed, run the following command in your terminal:

  `brew install redis`

2. Start Redis:

- To start the Redis server, run:

  `brew services start redis`

- Alternatively, you can run Redis manually with:

  `redis-server`

3. Verify Redis is Running:

- Open a new terminal window and run:

  `redis-cli ping`

- If Redis is running, you should see `PONG` as the response.

4. Stop Redis:

- To stop the Redis server, run:

  `brew services stop redis`

For Windows Users

1. Install Redis:

- Redis is not natively supported on Windows, but you can use the Windows Subsystem for Linux (WSL) or download a precompiled version of Redis for Windows.
- Option 1: Using WSL:

  - Install WSL by following the official guide: [Install WSL](https://learn.microsoft.com/en-us/windows/wsl/install).
  - Once WSL is set up, install Redis using the package manager for your Linux distribution (e.g., `apt` for Ubuntu):

  ````sudo apt updated
  sudo apt install redis-server ```

  ````

- Option 2: Precompiled Redis for Windows:
  - Download the latest release of Redis for Windows from [Microsoft Archive](https://github.com/microsoftarchive/redis/releases).
  - Extract the ZIP file and navigate to the extracted folder.

2. Start Redis:

- If using WSL:

  - Start the Redis server with:

  `sudo service redis-server start`

- If using the precompiled version:
  - Open the extracted folder and run `redis-server.exe`.

3. Verify Redis is Running:

- Open a terminal (or WSL terminal) and run:

  `redis-cli ping`

- If Redis is running, you should see `PONG` as the response.

4. Stop Redis:

- If using WSL:

  - Stop the Redis server with:

    `sudo service redis-server stop`

- If using the precompiled version:
  - Close the `redis-server.exe` window or use `Ctrl + C` in the terminal.

## Session Management

### Passkey-Based Authentication

Passkey authentication uses the 'express-session' module adn Redis to manage sessions.

Since passkeys are already cryptographically secure credentials, there is no need for additional token-based verification (like we use in password-based authentication, see below).

The way we set up, 'express-session' uses Redis, which is in-memory storage, to keep track of the sessions.

So, when a user is authenticated with his/her passkey, a session is initialized through the below command:
req.session.loggedInUserId = user.id;

Thus, a session lasts until:

- cookie expiration (maxAge)
- Redis TLL expires
- server explicitly destroys session
- browser deletes cookie

Here would be a typical session flow:

```javascript // When user logs in with passkey
export const handleLoginFinish = async (req, res, next) => {
  try {
    // 1. Generate session ID (handled by express-session)
    // 2. Store data in Redis
    req.session.loggedInUserId = user.id;
    req.session.authMethod = 'passkey';

    // Redis now has:
    // KEY: "cerberus:session:abc123"
    // VALUE: {
    //   loggedInUserId: "user_123",
    //   authMethod: "passkey"
    // }

    // 3. Browser gets cookie:
    // Name: sessionId
    // Value: abc123.signature789
    // MaxAge: 24 hours

    // 4. On next request:
    // - Browser sends cookie
    // - Server verifies cookie's signature with SESSION_SECRET
    // - If the signature is valid, the server gets user and session data from Redis store and validates the session - otherwise, the user is redirected to login form

    next();
  } catch (error) {
    next(error);
  }
};

// To manually end session:
req.session.destroy((err) => {
  if (err) console.error('Session destruction error:', err);
  res.clearCookie('sessionId'); // Clear browser cookie
});
```

The path '/api/user' has been set for protected routes, so future fetch requests should utilize that path so the requiredPasskeyAuth middleware is invoked to validate the cookie based on SESSION_SECRET.

Add more protected routes in protected-routes.ts.

Sample fetch requests can be found in userApiService.ts.

### Password-Based Authentication

When a registered user logs in, the server issues 2 JWT tokens--an access token, short-lived for 15 minutes, and a refresh token, long-lived for 7 days--that are sent each on a separate cookie to the client.

The refresh token is stored in our database, and this stored token is used to validate an user whose (short lived) access token has already expired (but refresh token has not). Once this user is validated, a new access token is issued by the server that is sent to the client to renew his access.

If an access token is stolen (through XSS or network interception), it can only be misused for 15 minutes (of course, this short time span can be modified), thus limiting the window of opportunity for attackers. Even if compromised, the access token can't modify the refresh token flow because they're separate.

The point of issuing short term access tokens is that we can revoke access (in case we detect suspicious activity) by invalidating refresh tokens at any time, and forcing re-authentication.

Each token is stored in HTTP-only cookie.

During normal operation, you ought to implement the below to the frontend of your code:

```javascript
// Frontend API calls include credentials
const response = await fetch('/api/some-endpoint', {
  credentials: 'include', // Sends cookies automatically
});
```

When access token expires:

```javascript
// Frontend detects 401 response
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      try {
        // Try to get new tokens using refresh token
        await fetch('/api/auth/refresh-token', {
          method: 'POST',
          credentials: 'include',
        });

        // Retry original request
        return api(error.config);
      } catch (refreshError) {
        // Refresh failed - redirect to login
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);
```

In summary, the server handles session management by:

- validating refresh tokens
- issuing new access tokens
- optionally rotating refresh tokens
- updating database with refresh tokens and access
- setting new cookies that securely store the tokens

If a refresh token is invalid/expired:

- clear cookies
- forces user to login again

## Database Setup Instructions

### Prerequisites:

- PostgreSQL (version 12 or higher recommended)
- Node.js (version 16 or higher)
- npm (version 7 or higher)

### Setting up the database

Using the Setup Script (Recommended)

We provide a convenient setup script that handles database creation and schema initialization.

For macOS/Linux:

1. Make the script executable:

   `chmod +x server/db/setup.sh`

2. Run the script:

   `./server/db/setup.sh`

3. If database isn't showing up in pgAdmin:
   Right click on database and press refresh

For Windows:

1. Using Git Bash or WSL (recommended):

   `bash server/db/setup.sh`

2. Using Command Prompt (alternative method):

```
cd server\db
setup.sh
```

Manual Setup

For macOS/Linux:

1. Install PostgreSQL if you haven't already:

```
brew install postgresql@14
brew services start postgresql@14
```

2. Create a database:

```
psql postgres -c "CREATE DATABASE auth_db;"
```

3. Run the type definitions:

```
psql auth_db -f server/db/schema/types.sql
```

4. Run the schema script:

```
psql auth_db -f server/db/schema/auth.sql
```

For Windows:

1. Install PostgreSQL from the official website
2. Open Command Prompt as administrator and navigate to your PostgreSQL bin directory:

```
cd "C:\Program Files\PostgreSQL\14\bin"
```

3. Create a database:

```
psql -U postgres -c "CREATE DATABASE auth_db;"
```

4. Run the type definitions and schema script:

```
psql -U postgres -d auth_db -f "C:\path\to\your\project\server\db\schema\types.sql"
psql -U postgres -d auth_db -f "C:\path\to\your\project\server\db\schema\auth.sql"
```

## Environment Configuration

This project uses environment-specific configuration files.

1. Copy the example files to create your local environment files:

```cp .env.development.example .env.development
cp .env.production.example .env.production
cp .env.test.example .env.test
```

2. Edit each file to add your specific configuration values

3. Generate secure random strings for secrets:

For this you can run on the terminal: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`

- Make sure to generate new secrets for production

### Starting the Application

1. Install dependencies:
   `npm install`
2. Start the development server:
   `npm run dev`

This should start both the client and server simultaneously using concurrently.

## Development Email Testing

For email testing, the toolkit is set to use MailHog, thus you'll need to:
`brew update && brew install mailhog` (on a Mac)

MailHog doesn't actually send emails, it's just for testing purposes.
For production you may consider using SendGrid, Mailgun, Amazon SES, Postmark, Twilio SendGrid - these services invest in infrastructure, anti-spam measures, customer support to handle large email volumes, provide analytics and tracking (e.g., open rates, delivery status), built-in security features (e.g., encryption, SPF/DKIM/DMARC support), and compliance with regulations (e.g., GDPR, CAN-SPAM).

- Open-Source SMTP Servers: Postfix, Exim, Sendmail.

When testing email features (password reset, etc.):

1. Start MailHog:
   ```
   bash mailhog
   ```
2. Access the MailHog web interface at http://localhost:8025

- All emails sent by the application will be captured there

3. To stop: Press Ctrl+C in the terminal where it's running

## Contributors

- [Fabiano Santin](https://github.com/fsantin1985)
- [Molly Josephson](https://github.com/mjosephson5)
- [Gabriel Davis](https://github.com/duimaurisfootball)
- [Boyu Hu](https://github.com/BoyuHu514)

## Feedback and Contributions

Contributions are welcome! Please feel free to submit a Pull Request.

## Contacts

## FAQ

## Links

- [Medium article]()
