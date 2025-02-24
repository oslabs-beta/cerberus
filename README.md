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

## Database Setup

## Session Management

### Passkey-Based Authentication

Passkey authentication uses the 'express-session' module adn Redis to manage sessions.

Since passkeys are already cryptographically secure credentials, there is no need for additional token-based verification (like we use in password-based authentication, see below).

The way we set up, 'express-session' uses Redis, which is in-memory storage, to keep track of the sessions.

So, when a user 

// Simplified view of what's happening in memory
const sessionStore = {
  "session1_id": {
    loggedInUserId: "123",
    currentChallenge: "abc...",
    // other session data
  },
  "session2_id": {
    // another user's session data
  }
}

Meanwhile, the client receives a session cookie (connect.sid) that contains:

connect.sid=s%3A[SESSION_ID].[SIGNATURE]
- The s%3A is just URL encoding for s:
- [SESSION_ID] is a random string (like "abc123")
- [SIGNATURE] is an HMAC signature of the session ID using your SESSION_SECRET

Together with our environment variable SESSION_SECRET, the information in MemoryStore, and the signature in the session cookie, the following allows the server to verify a session:

// Pseudocode of what happens inside express-session
function signSessionId(sessionId, secret) {
  return crypto
    .createHmac('sha256', secret)
    .update(sessionId)
    .digest('base64');
}

// When creating a session
const sessionId = generateRandomId();
const signature = signSessionId(sessionId, process.env.SESSION_SECRET);
const cookie = `${sessionId}.${signature}`;

// When verifying a session
function verifySession(cookie, secret) {
  const [sessionId, providedSignature] = cookie.split('.');
  const expectedSignature = signSessionId(sessionId, secret);
  return providedSignature === expectedSignature;
}

Flow in the application:

// 1. User makes first request
// Server creates new session
req.session.currentChallenge = 'xyz789';

// 2. User receives cookie:
// connect.sid=s%3Aabc123.signature123

// 3. User makes next request with cookie
// Server:
// a. Extracts session ID
// b. Verifies signature using SESSION_SECRET
// c. Looks up session data in store
// d. Attaches data to req.session
console.log(req.session.currentChallenge); // 'xyz789'



### Password-Based Authentication

When a registered user logs in, the server issues 2 JWT tokens--an access token, short-lived for 15 minutes, and a refresh token, long-lived for 7 days--that are sent each on a separate cookie to the client.

The refresh token is stored in our database, and this stored token is used to validate an user whose (short lived) access token has already expired (but refresh token has not). Once this user is validated, a new access token is issued by the server that is sent to the client to renew his access.

If an access token is stolen (through XSS or network interception), it can only be misused for 15 minutes (of course, this short time span can be modified), thus limiting the window of opportunity for attackers. Even if compromised, the access token can't modify the refresh token flow because they're separate.

The point of issuing short term access tokens is that we can revoke access (in case we detect suspicious activity) by invalidating refresh tokens at any time, and forcing re-authentication.

Each token is stored in HTTP-only cookie.

During normal operation, you ought to implement the below to the frontend of your code:

// Frontend API calls include credentials
const response = await fetch('/api/some-endpoint', {
credentials: 'include' // Sends cookies automatically
});

When access token expires:

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

In summary, the server handles session management by:

- validating refresh tokens
- issuing new access tokens
- optionally rotating refresh tokens
- updating database with refresh tokens and access
- setting new cookies that securely store the tokens

If a refresh token is invalid/expired:

- clear cookies
- forces user to login again

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
