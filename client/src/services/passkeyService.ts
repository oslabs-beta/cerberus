import {
  startRegistration,
  startAuthentication,
} from '@simplewebauthn/browser';
import type { PublicKeyCredentialCreationOptionsJSON } from '@simplewebauthn/types';
import { LoginResponse } from '../hooks/types';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

const createPasskey = async (email: string) => {
  try {
    const startResponse = await fetch(`${API_BASE_URL}/api/passkey/register-start`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
      credentials: 'include', // Important for session cookies
    });

    if (!startResponse.ok) {
      const errorText = await startResponse.text();
      console.error('Registration start failed:', {
        status: startResponse.status,
        statusText: startResponse.statusText,
        error: errorText,
      });
      throw new Error(`Failed to start registration: ${errorText}`);
    }
    // convert registration options to JSON
    const options: PublicKeyCredentialCreationOptionsJSON = await startResponse.json();

    // Start the registration process
    const registrationResponse = await startRegistration({
      optionsJSON: options,
    });

    // Send attestationResponse back to server for verification and storage.
    const finishResponse = await fetch(`${API_BASE_URL}/api/passkey/register-finish`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(registrationResponse),
      credentials: 'include', // Important for session cookies
    });
    
    if (!finishResponse.ok) {
      const errorText = await finishResponse.text();
      console.error('Registration finish failed:', {
        status: finishResponse.status,
        statusText: finishResponse.statusText,
        error: errorText,
      });
      throw new Error(`Registration verification failed: ${errorText}`);
    }

    const verificationResult = await finishResponse.json();
    return verificationResult.verified;
  } catch (error) {
    console.error('Passkey creation error:', error);
    throw error;
  }
};

const login = async (email: string): Promise<LoginResponse> => {
  try {
    // Get login options from server. Here, we also receive the challenge.
    const response = await fetch(`${API_BASE_URL}/api/passkey/login-start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
      credentials: 'include', // Important for session handling
    });

    // Check if the login options are ok.
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Login start failed:', errorText);
      throw new Error(`Failed to get login options: ${errorText}`);
    }

    // Convert the login options to JSON.
    const options = await response.json();

    try {
      // This triggers the browser to display the passkey / WebAuthn modal (e.g. Face ID, Touch ID, Windows Hello).
      // A new assertionResponse is created. This also means that the challenge has been signed.
      const assertionResponse = await startAuthentication(options);

      // Send assertionResponse back to server for verification.
      const verificationResponse = await fetch(`${API_BASE_URL}/api/passkey/login-finish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(assertionResponse),
        credentials: 'include',
      });

      if (!verificationResponse.ok) {
        const errorText = await verificationResponse.text();
        throw new Error(`Login verification failed: ${errorText}`);
      }

      // Parse the complete response
      const loginData = await verificationResponse.json();
      console.log('Full login response data:', loginData);

      if (!loginData.verification) {
        throw new Error('Login verification failed');
      }

      if (!loginData.user || !loginData.user.id) {
        console.error(
          'User data is missing or malformed in the response:',
          loginData
        );
        // Create a fallback user with minimal data if needed
        const fallbackUser = {
          id: String(Date.now()), // temporary ID
          email: email,
        };

        return {
          verification: loginData.verification,
          user: fallbackUser,
        };
      }

      return {
        verification: loginData.verification,
        user: {
          id: String(loginData.user.id),
          email: loginData.user.email,
        },
      };
    } catch (authError) {
      // Handle WebAuthn-specific errors (like user cancellation)
      console.error('Authentication error:', authError);
      const errorMessage =
        authError instanceof Error ? authError.message : 'Unknown error';
      throw new Error(`Passkey login failed: ${errorMessage}`);
    }
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Passkey login failed: ${error.message}`);
    }
    throw new Error('Passkey login failed: Unknown error');
  }
};

export { createPasskey, login };
