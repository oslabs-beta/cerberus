export const rpName: string = process.env.RPNAME || 'Cerberus';
export const rpID: string = process.env.RPID || 'localhost';

// The most important fix - make sure the origin matches what the browser is using
export const origin: string =
  process.env.NODE_ENV === 'local.development'
    ? 'http://localhost:5173' // Local development runs on Vite's port
    : process.env.NODE_ENV === 'production'
    ? `https://${rpID}`
    : `http://localhost:${process.env.PORT || '3000'}`;

console.log('WebAuthn Configuration:', { rpName, rpID, origin });
