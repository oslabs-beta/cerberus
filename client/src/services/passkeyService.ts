import {
  startRegistration,
  startAuthentication,
} from '@simplewebauthn/browser';
// import type { PublicKeyCredentialCreationOptionsJSON } from '@simplewebauthn/types';
import { LoginResponse } from '../hooks/types';

const createPasskey = async (email: string) => {
  try {
    const startResponse = await fetch('/api/passkey/register-start', {
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
    // Parse the full response first
    const fullResponse = await startResponse.json();
    console.log('Registration options received:', fullResponse);

    // Extract the relevant fields
    const { serverChallenge, userId, ...options } = fullResponse;

    // Start the registration process
    const registrationResponse = await startRegistration({
      optionsJSON: options,
    });

    console.log('WebAuthn registration response:', registrationResponse);

    // Create the final payload including both the WebAuthn response and our userId
    const finishPayload = {
      ...registrationResponse,
      userId: userId,
      serverChallenge,
    };

    console.log('Sending registration finish payload:', finishPayload);

    // Send attestationResponse back to server for verification and storage.
    const finishResponse = await fetch('/api/passkey/register-finish', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(finishPayload),
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
    console.log('Starting login process for email:', email);

    // Get login options from server. Here, we also receive the challenge.
    const response = await fetch('/api/passkey/login-start', {
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
    // Parse full response
    const fullResponse = await response.json();
    console.log('Login options received:', fullResponse);

    // Extract metadata and WebAuthn options
    const { serverChallenge, userId, ...options } = fullResponse;

    try {
      // This triggers the browser to display the passkey / WebAuthn modal (e.g. Face ID, Touch ID, Windows Hello).
      // A new assertionResponse is created. This also means that the challenge has been signed.
      console.log('Starting WebAuthn authentication');
      const assertionResponse = await startAuthentication(options);
      console.log('Authentication response received:', assertionResponse);

      // Add user ID and challenge to the payload for redundancy
      const finalPayload = {
        ...assertionResponse,
        userId: userId,
        serverChallenge: serverChallenge,
      };

      console.log('Sending login verification request');

      // Send assertionResponse back to server for verification.
      const verificationResponse = await fetch('/api/passkey/login-finish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(finalPayload),
        credentials: 'include',
      });

      if (!verificationResponse.ok) {
        const errorText = await verificationResponse.text();
        console.error('Login verification failed:', errorText);
        throw new Error(`Login verification failed: ${errorText}`);
      }

      // Parse the complete response
      const loginData = await verificationResponse.json();
      console.log('Login verification result:', loginData);

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
