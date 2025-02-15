import {
  startRegistration,
  startAuthentication,
} from '@simplewebauthn/browser';
import type {
  PublicKeyCredentialCreationOptionsJSON,
  RegistrationResponseJSON,
} from '@simplewebauthn/types';

interface NavigatorWithUserAgentData extends Navigator {
  userAgentData?: {
    getHighEntropyValues(hints: string[]): Promise<{
      platform: string;
      [key: string]: any;
    }>;
  };
}

const getDeviceInfo = async () => {
  const deviceType = await generateFriendlyDeviceName();
  const deviceIdentifier = await getDeviceIdentifier();

  return {
    deviceIdentifier,
    deviceType,
    deviceName: deviceType, // Use the friendly name here
  };
};

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
    const registrationResponse = await startRegistration(options);
    console.log('Registration response:', registrationResponse);

    // const attestationResponse = await startRegistration(options);
    // console.log('Attestation response:', attestationResponse);

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

const login = async (email: string) => {
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

    return true; // Explicitly return success
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Passkey login failed: ${error.message}`);
    }
    throw new Error('Passkey login failed: Unknown error');
  }
};

// Helper function to generate a unique device identifier
const getDeviceIdentifier = async (): Promise<string> => {
  // This is a simple implementation. In production, you might want to use
  // more sophisticated device fingerprinting
  const fingerprint = [
    navigator.userAgent,
    navigator.language,
    window.screen.colorDepth,
    window.screen.width + 'x' + window.screen.height,
    // Get timezone offset in minutes
    new Date().getTimezoneOffset(),
    // Check if touch is supported
    'ontouchstart' in window ? 'touch' : 'no-touch',
  ].join('|');

  // Create a hash of the fingerprint
  const encoder = new TextEncoder();
  const data = encoder.encode(fingerprint);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
};

// Helper function
const generateFriendlyDeviceName = async (): Promise<string> => {
  const navigator = window.navigator as NavigatorWithUserAgentData;

  try {
    // Try to get detailed platform info
    if (navigator.userAgentData) {
      const platformInfo = await navigator.userAgentData.getHighEntropyValues([
        'platform',
        'platformVersion',
        'model',
        'mobile',
      ]);

      // Format: "iPhone 15" or "Windows PC" or "MacBook"
      let deviceName = platformInfo.model || platformInfo.platform;
      if (!platformInfo.model && platformInfo.mobile) {
        deviceName += ' Mobile';
      } else if (!platformInfo.model) {
        deviceName += ' PC';
      }

      return deviceName;
    }

    // Fallback to basic user agent parsing
    const userAgent = navigator.userAgent.toLowerCase();
    if (userAgent.includes('iphone')) return 'iPhone';
    if (userAgent.includes('ipad')) return 'iPad';
    if (userAgent.includes('macintosh')) return 'Mac';
    if (userAgent.includes('windows')) return 'Windows PC';
    if (userAgent.includes('android')) return 'Android Device';

    return 'Unknown Device';
  } catch (error) {
    console.error('Error generating device name:', error);
    return 'New Device';
  }
};

export { createPasskey, login };
