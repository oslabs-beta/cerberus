import {
  startRegistration,
  startAuthentication,
} from '@simplewebauthn/browser';

const createPasskey = async (email: string) => {
  try {
    const response = await fetch('/api/passkey/register-start', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });
    console.log(response);

    if (!response.ok) {
      throw new Error('Failed to create passkey');
    }
    // convert registration options to JSON
    const options = await response.json();
    console.log('Registration options returned by server:', options);

    const attestationResponse = await startRegistration(options);
    console.log('Attestation response:', attestationResponse);

    // Send attestationResponse back to server for verification and storage.
    const verificationResponse = await fetch('/api/passkey/register-finish', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(attestationResponse),
    });
    if (verificationResponse.ok) {
      alert('Registration successful');
    } else {
      alert('Registration failed');
    }
  } catch (error) {
    console.error('Error creating passkey:', error);
    throw error;
  }
};

const login = async (email: string) => {
  // Retrieve the username from the input field
  // const email = document.getElementById('username').value;

  try {
    // Get login options from your server. Here, we also receive the challenge.
    const response = await fetch('/api/passkey/login-start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      // body: JSON.stringify({email: email})
      body: JSON.stringify({ email }),
    });
    // Check if the login options are ok.
    if (!response.ok) {
      throw new Error('Failed to get login options from server');
    }
    // Convert the login options to JSON.
    const options = await response.json();
    console.log(options);

    // This triggers the browser to display the passkey / WebAuthn modal (e.g. Face ID, Touch ID, Windows Hello).
    // A new assertionResponse is created. This also means that the challenge has been signed.
    const assertionResponse = await startAuthentication(options);

    // Send assertionResponse back to server for verification.
    const verificationResponse = await fetch('/api/passkey/login-finish', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(assertionResponse),
    });

    if (verificationResponse.ok) {
      alert('Login successful');
    } else {
      alert('Login failed');
    }
  } catch (error) {
    if (error instanceof Error) {
      alert('Error: ' + error.message);
    } else {
      alert('Error: ' + error);
    }
  }
};

export { createPasskey, login };
