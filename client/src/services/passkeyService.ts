import {
  startRegistration,
  startAuthentication,
} from '@simplewebauthn/browser';
import type { PublicKeyCredentialCreationOptionsJSON } from '@simplewebauthn/types';
import { LoginResponse } from '../hooks/types';

const createPasskey = async (email: string) => {
  try {
    console.log('Starting passkey creation for email:', email);

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
    // convert registration options to JSON
    const options: PublicKeyCredentialCreationOptionsJSON =
      await startResponse.json();
    console.log('Registration options returned by server:', options);

    // Start the registration process
    const registrationResponse = await startRegistration({
      optionsJSON: options,
    });
    // const registrationResponse = await startRegistration(options);
    console.log('Registration response:', registrationResponse);

    // Send attestationResponse back to server for verification and storage.
    const finishResponse = await fetch('/api/passkey/register-finish', {
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
    console.log('Registration verification result:', verificationResult);
    return verificationResult.verified;
  } catch (error) {
    console.error('Passkey creation error:', error);
    throw error;
  }
};

const login = async (email: string): Promise<LoginResponse> => {
  try {
    console.log('Sending login-start request for email:', email);
    // Get login options from your server. Here, we also receive the challenge.
    const response = await fetch('/api/passkey/login-start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
      credentials: 'include', // Important for session handling
    });

    console.log('Response status:', response.status);
    // Check if the login options are ok.
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Login start failed:', errorText);
      throw new Error(`Failed to get login options: ${errorText}`);
    }
    // Convert the login options to JSON.
    const options = await response.json();
    console.log('Received authentication options:', options);

    // This triggers the browser to display the passkey / WebAuthn modal (e.g. Face ID, Touch ID, Windows Hello).
    // A new assertionResponse is created. This also means that the challenge has been signed.
    const assertionResponse = await startAuthentication(options);
    console.log('Got assertion response:', assertionResponse);

    // Send assertionResponse back to server for verification.
    const verificationResponse = await fetch('/api/passkey/login-finish', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(assertionResponse),
      credentials: 'include',
    });

    console.log('VerificationResponse is equal to: ', verificationResponse);

    if (!verificationResponse.ok) {
      const errorText = await verificationResponse.text();
      throw new Error(`Login verification failed: ${errorText}`);
    }

    // Parse the complete response
    const loginData = await verificationResponse.json();

    if (!loginData.verification) {
      throw new Error('Login verification failed');
    }

    return {
      verification: loginData.verification,
      user: loginData.user,
      token: loginData.token,
    };
    // return true; // Explicitly return success
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Passkey login failed: ${error.message}`);
    }
    throw new Error('Passkey login failed: Unknown error');
  }
};

export { createPasskey, login };
