import { query } from '../config/database';
import type { QueryResult } from 'pg';
// import { v4 as uuidv4 } from 'uuid';

export const userService = {
  /**
   * Retrieves user by ID
   */
  async getUserById(userId: number) {
    const result: QueryResult = await query(
      'SELECT * FROM users WHERE id = $1',
      [userId]
    );
    const rows = result.rows;
    return rows[0];
  },

  /**
   * Retrieves user by Email
   */
  async getUserByEmail(email: string) {
    try {
      const result: QueryResult = await query(
        'SELECT * FROM users WHERE email = $1',
        [email]
      );
      const rows = result.rows;
      return rows[0];
    } catch (error) {
      console.error('Error fetching user by email:', error);
      return null;
    }
  },

  /**
   * Creates a new user with just an email (example)
   */
  async createUser(email: string) {
    // const id = uuidv4();
    // await query('INSERT INTO users (id, email) VALUES (?, ?)', [id, email]);
    await query('INSERT INTO users (email) VALUES ($1)', [email]);
    return { email };
  },
};
