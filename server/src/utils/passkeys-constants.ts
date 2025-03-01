export const rpName: string = process.env.RPNAME!;
export const rpID: string = process.env.RPID!;
// export const origin: string =
//   process.env.NODE_ENV === 'production'
//     ? `http://${rpID}:${process.env.PORT || 3000}` // Production: use Express port
//     : `http://${rpID}:${process.env.VITE_PORT || 5173}`; // Development: use Vite port
// Determine the appropriate origin based on environment
// Determine the appropriate origin based on environment
export const origin: string = (() => {
  // Special case for local development with WebAuthn
  if (
    process.env.NODE_ENV === 'development' &&
    process.env.RPID === 'localhost'
  ) {
    // When using localhost in development, always use this format to match browser expectations
    return `http://localhost:${process.env.PORT || '3000'}`;
  }

  // Check environment
  const isDev = process.env.NODE_ENV === 'development';

  // Base URL with hostname
  const hostname = rpID;

  // Determine port
  let port: string | null = null;
  if (isDev) {
    // For development, try VITE_PORT first (local development), then fall back to PORT (Docker)
    port = process.env.VITE_PORT || process.env.PORT || '3000';
  } else {
    // For production, use PORT if specified, otherwise no port in URL
    port = process.env.PORT || null;
  }

  // Construct the URL
  const protocol = isDev ? 'http' : 'https';
  const portSuffix = port ? `:${port}` : '';

  return `${protocol}://${hostname}${portSuffix}`;
})();
