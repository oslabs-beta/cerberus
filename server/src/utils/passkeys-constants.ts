export const rpName: string = 'Cerberus'; // Relying Party (RP), typically our website or application
export const rpID: string = 'localhost'; // domain or hostname - browser ensures the credential can only
// be used for this domain, example: "example.com"
export const origin: string =
  process.env.NODE_ENV === 'production'
    ? `http://${rpID}:${process.env.PORT || 3000}` // Production: use Express port
    : `http://${rpID}:${process.env.VITE_PORT || 5173}`; // Development: use Vite port
