import { Pool, PoolConfig } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// Define interface
interface DatabaseConfig extends PoolConfig {
  user: string;
  password: string;
  host: string;
  port: number;
  database: string;
}

// Create configuration object
const dbConfig: DatabaseConfig = {
  user: process.env.DB_USER || '',
  password: process.env.DB_PASSWORD || '',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'auth_db',
  // for security and performance
  ssl: process.env.NODE_ENV === 'production',
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000,
};

// Create the pool
const pool = new Pool(dbConfig);

// Test the connection
pool.on('connect', () => {
  console.log('Database connected successfully');
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

// Export query helper function
export const query = async (text: string, params?: (string | number)[]) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('Executed query', { text, duration, rows: res.rowCount });
    return res;
  } catch (error) {
    console.error('Error executing query', { text, error });
    throw error;
  }
};

// Export pool for transactions or when you need direct access
export const getPool = () => pool;

export default {
  query,
  getPool,
};
