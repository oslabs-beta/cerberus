// db.ts - This is your model layer
// import { query } from '@/config/database';
import { query } from '../config/database';
import type { QueryResult } from 'pg';

interface User {
  id: number;
  email: string;
  password_hash: string;
  first_name: string;
  is_active: boolean;
  email_verified: boolean;
  created_at: Date;
}

interface LoginHistory {
  id: number;
  user_id: number;
  login_timestamp: Date;
  ip_address: string;
  success: boolean;
}

export const userModel = {
  // Create a new user
  async createUser(
    email: string,
    passwordHash: string,
    firstName?: string, // firstName is optional
    isActive: boolean = true,
    emailVerified: boolean = false
  ): Promise<User> {
    /**
     * We’ll build arrays of columns, placeholders, and values
     * in one pass. Then we handle `created_at` as CURRENT_TIMESTAMP
     * without needing a placeholder for it.
     */
    const columns: string[] = [
      'email',
      'password_hash',
      'is_active',
      'email_verified',
    ];
    const placeholders: string[] = ['$1', '$2', '$3', '$4'];
    const values: (string | number)[] = [
      email,
      passwordHash,
      Number(isActive),
      Number(emailVerified),
    ];

    // If firstName is provided, append it at the end
    if (firstName) {
      columns.push('first_name');
      placeholders.push(`$${placeholders.length + 1}`); // e.g. $5
      values.push(firstName);
    }

    // We always set created_at to CURRENT_TIMESTAMP
    columns.push('created_at');
    placeholders.push('CURRENT_TIMESTAMP');
    // No value needed for created_at

    const text = `
        INSERT INTO users (${columns.join(', ')})
        VALUES (${placeholders.join(', ')})
        RETURNING id, email, first_name, is_active, email_verified, created_at
      `;

    try {
      const res: QueryResult<User> = await query(text, values);
      return res.rows[0];
    } catch (error: any) {
      // 23505 is the 'unique_violation' error in Postgres
      if (error.code === '23505') {
        throw new Error('Email already exists');
      }
      console.error('Database error in createUser:', error);
      throw new Error('Error creating user');
    }
  },

  // Get user by email - used for checking existing users and login
  async getUserByEmail(email: string): Promise<User | null> {
    const text = `
      SELECT id, email, password_hash, first_name, is_active, email_verified, created_at 
      FROM users 
      WHERE email = $1 AND is_active = true
    `;
    const values = [email];

    try {
      const res: QueryResult<User> = await query(text, values);
      return res.rows[0] || null;
    } catch (error) {
      // Log the error for debugging but throw a generic error for security
      console.error('Database error in getUserByEmail:', error);
      throw new Error('Error fetching user');
    }
  },
  // Record login history
  async recordLogin(
    userId: number,
    ipAddress: string,
    success: boolean = true
  ): Promise<void> {
    const text = `
      INSERT INTO login_history (
        user_id, 
        ip_address,
        success, 
        login_timestamp
      ) 
      VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
    `;
    const values = [userId, ipAddress, success];

    try {
      await query(text, values);
    } catch (error) {
      // Log the error but don't throw - login history is non-critical
      console.error('Database error in recordLogin:', error);
      // Optionally notify monitoring system about the failure
    }
  },

  // Get user's login history
  async getLoginHistory(
    userId: number,
    limit: number = 10
  ): Promise<LoginHistory[]> {
    const text = `
      SELECT id, user_id, login_timestamp, ip_address 
      FROM login_history 
      WHERE user_id = $1 
      ORDER BY login_timestamp DESC 
      LIMIT $2
    `;
    const values = [userId, limit];

    try {
      const res: QueryResult<LoginHistory> = await query(text, values);
      return res.rows;
    } catch (error) {
      console.error('Database error in getLoginHistory:', error);
      throw new Error('Error fetching login history');
    }
  },
};

export default userModel;
