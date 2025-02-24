// need to incorporate this into frontend

import { createPasskey, login as passkeyLogin } from './passkeyService';

interface AuthResponse {
  success: boolean;
  user?: {
    id: number;
    email: string;
    created_at: Date;
  };
  error?: string;
}

interface LoginCredentials {
  email: string;
  password?: string;
}

export class AuthenticationService {
  private static instance: AuthenticationService;

  private constructor() {}

  // Singleton pattern to ensure only one instance exists
  public static getInstance(): AuthenticationService {
    if (!AuthenticationService.instance) {
      AuthenticationService.instance = new AuthenticationService();
    }
    return AuthenticationService.instance;
  }

  // Attempt password-based login
  private async attemptPasswordLogin(
    credentials: LoginCredentials
  ): Promise<AuthResponse> {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
        credentials: 'include', // Important for cookie handling
      });

      if (!response.ok) {
        throw new Error('Password login failed');
      }

      const data = await response.json();
      return {
        success: true,
        user: data.user,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Password login failed',
      };
    }
  }

  // Attempt passkey-based login
  private async attemptPasskeyLogin(email: string): Promise<AuthResponse> {
    try {
      const success = await passkeyLogin(email);

      if (!success) {
        throw new Error('Passkey login failed');
      }

      return {
        success: true,
        // Note: You might need to fetch user details separately after passkey login
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Passkey login failed',
      };
    }
  }

  // Main login method that coordinates between authentication methods
  public async login(credentials: LoginCredentials): Promise<AuthResponse> {
    // If password is provided, try password login first
    if (credentials.password) {
      const passwordResult = await this.attemptPasswordLogin(credentials);
      if (passwordResult.success) {
        return passwordResult;
      }
    }

    // If password login fails or no password provided, try passkey
    const passkeyResult = await this.attemptPasskeyLogin(credentials.email);
    return passkeyResult;
  }

  // Register new user with passkey
  public async registerPasskey(email: string): Promise<AuthResponse> {
    try {
      const success = await createPasskey(email);
      return {
        success,
        error: success ? undefined : 'Passkey registration failed',
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Passkey registration failed',
      };
    }
  }

  // Register new user with password
  public async registerPassword(
    credentials: LoginCredentials
  ): Promise<AuthResponse> {
    try {
      if (!credentials.password) {
        throw new Error('Password is required for registration');
      }

      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        throw new Error('Password registration failed');
      }

      const data = await response.json();
      return {
        success: true,
        user: data.user,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Password registration failed',
      };
    }
  }

  // Logout user
  public async logout(): Promise<void> {
    // Clear any stored authentication state
    // You might need to add more cleanup logic here
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
  }
}

export const authService = AuthenticationService.getInstance();
