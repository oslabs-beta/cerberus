import dotenv from 'dotenv';
import pkg from 'pg';

const { Pool } = pkg;
dotenv.config();


const dbConfig = {
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }, 
  max: 20, 
  idleTimeoutMillis: 30000, 
};


const pool = new Pool(dbConfig);


pool.on('connect', () => {
  console.log('✅ Database connected successfully');
});

pool.on('error', (err) => {
  console.error('❌ Unexpected database error:', err);
  process.exit(-1);
});


const query = async (
  text: string,
  params?: (string | number | boolean | string[] | unknown)[]
) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('✅ Executed query', { text, duration, rows: res.rowCount });
    return res;
  } catch (error) {
    console.error('❌ Error executing query', { text, error });
    throw error;
  }
};


export { pool, query };
