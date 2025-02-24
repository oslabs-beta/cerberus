export const rpName: string = 'Cerberus'; // Relying Party (RP), typically our website or application
export const rpID: string = 'localhost'; // domain or hostname - browser ensures the credential can only
// be used for this domain, example: "example.com"
export const origin: string = `http://${rpID}:${process.env.VITE_PORT}`;
