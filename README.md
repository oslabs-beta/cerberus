# Cerberus Authentication Toolkit

reference: https://github.com/CodesmithLLC/PRO-README?tab=readme-ov-file

## About

## Product Description

Cerberus is an open-source authentication toolkit that simplifies implementing secure user authentication in your web applications.

With support for both traditional password-based authentication and modern passkeys, Cerberus provides a flexible and secure solution for your authentication needs.

The toolkit consists of React components for the authentication forms (sign-up, login, password-recovery), a landing page, and the dashboard your users have access to once they’ve been authenticated.

Besides these frontend components and integrated functionality, you get all the routing and middleware for the authentication workflow, as well as full PostgreSQL database setup.

## Get Started

The easiest way to get started is by forking this repository and working from the existing codebase.

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

```
// When user logs in with passkey
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
    // - Server verifies signature with SESSION_SECRET
    // - If valid, gets data from Redis using session ID

    next();

} catch (error) {
next(error);
}
};
```

// To manually end session:
req.session.destroy((err) => {
if (err) console.error('Session destruction error:', err);
res.clearCookie('sessionId'); // Clear browser cookie
});

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

```
// Frontend API calls include credentials
const response = await fetch('/api/some-endpoint', {
credentials: 'include' // Sends cookies automatically
});
```

When access token expires:

```
// Frontend detects 401 response
api.interceptors.response.use(
(response) => response,
async (error) => {
if (error.response?.status === 401) {
try {
// Try to get new tokens using refresh token
await fetch('/api/auth/refresh-token', {
method: 'POST',
credentials: 'include'
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

## Database Setup

1. Install and Start PostgreSQL

- Ensure PostgreSQL is installed on your system. You can download it from the official PostgreSQL website.
  or ` brew install postgresql@14` (on Mac)
- ` brew services start postgresql@14`

2. Create a Database

- Create a new database for the project:

```
createdb your_database_name
```

3. Run the Schema Script

- Run the auth.sql script to set up the necessary tables and relationships:

```
psql -d your_database_name -f server/src/migrations/auth.sql
```

4. Configure Database Connection

- Update your project's configuration file or environment variables with the database connection details:

DB_HOST=localhost
DB_PORT=5432
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=your_database_name

5. Start the Application

- Once the database is set up and configured, you can start the application.

6. Optional: Automate Database Setup

- If your project uses a migration tool (like sequelize-cli, Alembic, or Flyway), you can automate the database setup process by adding the auth.sql script as an initial migration.

- For example, in a Node.js project using sequelize-cli, you can create a migration file and include the SQL commands from auth.sql.

7. Test the Setup

- After setting up the database, run your application and ensure it can connect to the database and perform necessary operations.

## Development Email Testing

For email testing, the toolkit is set to use MailHog, thus you'll need to:
`brew update && brew install mailhog` (on a Mac)

\*MailHog doesn't actually send emails, it's just for testing purposes.
For production you may consider using SendGrid, Mailgun, Amazon SES, Postmark, Twilio SendGrid - these services invest in infrastructure, anti-spam measures, customer support to handle large email volumes, provide analytics and tracking (e.g., open rates, delivery status), built-in security features (e.g., encryption, SPF/DKIM/DMARC support), and compliance with regulations (e.g., GDPR, CAN-SPAM).

- Open-Source SMTP Servers: Postfix, Exim, Sendmail.

When testing email features (password reset, etc.):

1. Start MailHog:
   ```bash
   mailhog
   ```
2. Access the MailHog web interface at http://localhost:8025

- All emails sent by the application will be captured there

3. To stop: Press Ctrl+C in the terminal where it's running

## Contributors

- Fabiano Santin
- Molly Josephson
- Gabriel Davis
- Boyu Hu

## Feedback and Contributions

## License

## Contacts
