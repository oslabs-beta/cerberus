import 'express-session';

declare module 'express-session' {
  interface SessionData {
    oauthState?: string;
    // Add any other custom session properties here
  }
}
