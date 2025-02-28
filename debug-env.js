import dotenv from 'dotenv';
import { join } from 'path';
import fs from 'fs';

const envFile = '.env.production';
const path = join(process.cwd(), envFile);

console.log(`Checking if file exists: ${path}`);
console.log(`File exists: ${fs.existsSync(path)}`);

if (fs.existsSync(path)) {
  console.log(`File contents: ${fs.readFileSync(path, 'utf8')}`);
}

const result = dotenv.config({ path });
console.log('Dotenv result:', result);
console.log('JWT_SECRET:', process.env.JWT_SECRET);
console.log('All env variables:', Object.keys(process.env));
