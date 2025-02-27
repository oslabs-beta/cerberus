// PostgreSQL queries used during password-based authentication

import { query } from '../config/database.js';
import type { QueryResult } from 'pg';

export interface User {
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

    columns.push('created_at');
    placeholders.push('CURRENT_TIMESTAMP');

    const text = `
        INSERT INTO users (${columns.join(', ')})
        VALUES (${placeholders.join(', ')})
        RETURNING id, email, first_name, is_active, email_verified, created_at
      `;

    try {
      const res: QueryResult<User> = await query(text, values);
      return res.rows[0];
    } catch (error: unknown) {
      // 23505 is the 'unique_violation' error in Postgres
      if (
        error &&
        typeof error === 'object' &&
        'code' in error &&
        error.code === '23505'
      ) {
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

  async updateUserPassword(
    userId: number,
    passwordHash: string
  ): Promise<User> {
    const text = `
      UPDATE users 
      SET password_hash = $1,
          last_updated = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING id, email, created_at
    `;
    const values = [passwordHash, userId];

    try {
      const res: QueryResult<User> = await query(text, values);
      return res.rows[0];
    } catch (error) {
      console.error('Database error in updateUserPassword:', error);
      throw new Error('Error updating user password');
    }
  },

  // token for password reset
  async saveResetToken(
    userId: number,
    token: string,
    expiryDate: Date
  ): Promise<void> {
    const text = `
      INSERT INTO password_reset_tokens (user_id, token, expires_at)
      VALUES ($1, $2, $3)
    `;
    const values = [userId, token, expiryDate];

    try {
      await query(text, values);
    } catch (error) {
      console.error('Database error in saveResetToken:', error);
      throw new Error('Error saving reset token');
    }
  },
  // token for password reset
  async getResetToken(token: string) {
    const text = `
      SELECT user_id, expires_at, is_valid
      FROM password_reset_tokens
      WHERE token = $1 AND is_valid = true
    `;
    const values = [token];

    try {
      const result = await query(text, values);
      return result.rows[0];
    } catch (error) {
      console.error('Database error in getResetToken:', error);
      throw new Error('Error fetching reset token');
    }
  },
  // token for password reset
  async invalidateResetToken(userId: number): Promise<void> {
    const text = `
      UPDATE password_reset_tokens
      SET is_valid = false
      WHERE user_id = $1
    `;
    const values = [userId];

    try {
      await query(text, values);
    } catch (error) {
      console.error('Database error in invalidateResetToken:', error);
      throw new Error('Error invalidating reset token');
    }
  },

  async updatePassword(userId: number, newPasswordHash: string): Promise<void> {
    const text = `
      UPDATE users
      SET password_hash = $1,
          last_updated = CURRENT_TIMESTAMP
      WHERE id = $2
    `;
    const values = [newPasswordHash, userId];

    try {
      await query(text, values);
    } catch (error) {
      console.error('Database error in updatePassword:', error);
      throw new Error('Error updating password');
    }
  },
};

export default userModel;
