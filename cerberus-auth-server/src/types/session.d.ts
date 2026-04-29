import 'express-session';

declare module 'express-session' {
  interface SessionData {
    currentChallenge?: string;
    loggedInUserId?: string;
    isAuthenticated?: boolean;
    lastActivity?: Date;
    authMethod?: 'passkey';
    oauthState?: string;
  }
}