// Example usage in a model or service
// import { query } from '../config/database';

// async function createUser(email: string, passwordHash: string) {
//   const text = 'INSERT INTO users(email, password_hash) VALUES($1, $2) RETURNING *';
//   const values = [email, passwordHash];

//   try {
//     const res = await query(text, values);
//     return res.rows[0];
//   } catch (error) {
//     // Handle specific database errors
//     if (error.code === '23505') { // unique_violation
//       throw new Error('Email already exists');
//     }
//     throw error;
//   }
// }
