export const rpName: string = process.env.RPNAME!;
export const rpID: string = process.env.RPID!;
export const origin: string =
  process.env.NODE_ENV === 'production'
    ? `http://${rpID}:${process.env.PORT || 3000}` // Production: use Express port
    : `http://${rpID}:${process.env.VITE_PORT || 5173}`; // Development: use Vite port
