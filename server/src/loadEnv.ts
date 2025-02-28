import dotenv from 'dotenv';
import { join } from 'path';
import fs from 'fs';

// Load environment variables based on NODE_ENV
const envFile = process.env.NODE_ENV ? `.env.${process.env.NODE_ENV}` : '.env';
const path = join(process.cwd(), envFile);

// Log information about the environment loading
console.log(`Environment: ${process.env.NODE_ENV || 'default'}`);
console.log(`Looking for environment file: ${path}`);
console.log(`File exists: ${fs.existsSync(path)}`);

// Load the environment file
const result = dotenv.config({ path });

if (result.error) {
  console.error(`Error loading environment: ${result.error.message}`);
} else {
  console.log('Environment variables loaded successfully');

  // Verify critical variables
  const criticalVars = ['JWT_SECRET', 'SESSION_SECRET', 'REFRESH_TOKEN_SECRET'];
  const missing = criticalVars.filter((v) => !process.env[v]);

  if (missing.length > 0) {
    console.error(
      `Missing critical environment variables: ${missing.join(', ')}`
    );
    process.exit(1); // Exit with error
  }
}

export default result;
