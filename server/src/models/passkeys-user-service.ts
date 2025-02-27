import { query } from '../config/database.js';
import type { QueryResult } from 'pg';

interface LoginHistory {
  id: number;
  login_timestamp: Date;
  ip_address: string;
  success: boolean;
}

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
    const result: QueryResult = await query(
      'INSERT INTO users (email) VALUES ($1) RETURNING *',
      [email]
    );
    const rows = result.rows;
    return rows[0];
    // return { email };
  },

  /**
   * Get user's login history
   */
  async getLoginHistory(
    userId: number,
    limit: number = 10
  ): Promise<LoginHistory[]> {
    const result: QueryResult = await query(
      `SELECT id, login_timestamp, ip_address, success
       FROM login_history
       WHERE user_id = $1
       ORDER BY login_timestamp DESC
       LIMIT $2`,
      [userId, limit]
    );
    return result.rows;
  },

  /**
   * Record a login attempt
   */
  async recordLogin(
    userId: number,
    ipAddress: string,
    success: boolean = true
  ): Promise<void> {
    await query(
      `INSERT INTO login_history (user_id, ip_address, success, login_timestamp)
       VALUES ($1, $2, $3, CURRENT_TIMESTAMP)`,
      [userId, ipAddress, success]
    );
  },
};
