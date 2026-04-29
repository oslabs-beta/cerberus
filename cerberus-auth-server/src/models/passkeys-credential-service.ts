import { query } from '../config/database';
import type { QueryResult } from 'pg';

/**
 * Example local type that matches what we're returning from the DB
 */
export interface DBAuthenticatorDevice {
  userID: number;
  credentialID: string;
  credentialPublicKey: string;
  counter: number;
  transports: string[];
  attestationType: string;
  friendlyName?: string;
}

export const credentialService = {
  async generateUniqueFriendlyName(
    userId: number,
    baseName: string
  ): Promise<string> {
    // Get count of existing credentials with similar names
    const result = await query(
      `SELECT COUNT(*) as count 
       FROM credentials 
       WHERE user_id = $1 
       AND friendly_name LIKE $2 
       AND deleted_at IS NULL`,
      [userId, `${baseName}%`]
    );

    const count = parseInt(result.rows[0].count);

    // If no existing credentials with this base name, use it as is
    if (count === 0) {
      return baseName;
    }

    // Otherwise, append a number
    return `${baseName} (${count + 1})`;
  },
  /**
   * Save a new credential to the 'credentials' table
   */
  async saveNewCredential(
    userId: number,
    credentialId: string,
    publicKey: string,
    counter: number,
    transports: string[], // store as an actual array if using a TEXT[] column
    attestationType: string = 'none'
  ): Promise<void> {
    try {
      await query('BEGIN');

      const credentialResult = await query(
        `INSERT INTO credentials 
         (user_id, credential_id, public_key, signature_count, transports, attestation_type) 
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id`,
        [
          userId,
          credentialId, // Use the raw credential ID
          publicKey,
          counter,
          transports, // PostgreSQL will handle the array correctly
          attestationType,
        ]
      );

      await query('COMMIT');
      return credentialResult.rows[0].id;
    } catch (error) {
      await query('ROLLBACK');
      console.error('Error saving new credential:', error);
      console.error('Failed values:', {
        userId,
        credentialId,
        publicKeyLength: publicKey.length,
        counter,
        transports,
        attestationType,
      });
      throw error;
    }
  },

  /**
   * Retrieve a credential by 'credential_id'
   */
  async getCredentialByCredentialId(
    credentialId: string
  ): Promise<DBAuthenticatorDevice | null> {
    try {
      const result: QueryResult = await query(
        `SELECT user_id,
                credential_id,
                public_key,
                signature_count,
                transports,
                attestation_type
         FROM credentials
         WHERE credential_id = $1
         LIMIT 1`,
        [credentialId]
      );

      if (result.rows.length === 0) {
        return null;
      }

      const row = result.rows[0];

      // Ensure transports is an array
      let transports: string[] = [];
      if (row.transports) {
        // If it's a string (comma-separated), split it
        if (typeof row.transports === 'string') {
          transports = row.transports
            .split(',')
            .map((t: string): string => t.trim());
        }
        // If it's already an array, use it
        else if (Array.isArray(row.transports)) {
          transports = row.transports;
        }
      }
      return {
        userID: row.user_id,
        credentialID: row.credential_id,
        credentialPublicKey: row.public_key,
        counter: row.signature_count,
        // If 'transports' is truly TEXT[], the driver should parse it as a JS array
        transports: transports,
        attestationType: row.attestation_type,
      };
    } catch (error) {
      console.error('Error retrieving credential:', error);
      throw error;
    }
  },

  /**
   * Update the credential's signature_count (a.k.a. counter)
   */
  async updateCredentialCounter(
    credentialId: string,
    newCounter: number
  ): Promise<void> {
    try {
      await query(
        `UPDATE credentials
         SET signature_count = $1
         WHERE credential_id = $2`,
        [newCounter, credentialId]
      );
    } catch (error) {
      console.error('Error updating credential counter:', error);
      throw error;
    }
  },

  async getCredentialsByUserId(
    userId: number
  ): Promise<DBAuthenticatorDevice[]> {
    try {
      const result = await query(
        `SELECT * FROM credentials WHERE user_id = $1 AND deleted_at IS NULL`,
        [userId]
      );

      return result.rows.map((row) => ({
        userID: row.user_id,
        credentialID: row.credential_id,
        credentialPublicKey: row.public_key,
        counter: row.signature_count,
        transports: Array.isArray(row.transports)
          ? row.transports
          : typeof row.transports === 'string'
          ? row.transports.replace(/[{}]/g, '').split(',')
          : [],
        attestationType: row.attestation_type,
      }));
    } catch (error) {
      console.error('Error retrieving credentials:', error);
      throw error;
    }
  },

  async getCredentialsByDevice(
    userId: number,
    deviceIdentifier: string
  ): Promise<DBAuthenticatorDevice[]> {
    try {
      const result = await query(
        `SELECT c.* 
         FROM credentials c
         JOIN devices d ON c.id = d.credential_id
         WHERE c.user_id = $1 AND d.device_identifier = $2`,
        [userId, deviceIdentifier]
      );
      return result.rows.map((row) => ({
        userID: row.user_id,
        credentialID: row.credential_id,
        credentialPublicKey: row.public_key,
        counter: row.signature_count,
        transports: Array.isArray(row.transports)
          ? row.transports
          : row.transports.split(','),
        attestationType: row.attestation_type,
      }));
    } catch (error) {
      console.error('Error retrieving credentials by device:', error);
      throw error;
    }
  },

  // Add a new method to get all passkeys for a user with friendly names
  async getPasskeysWithNames(userId: number): Promise<
    Array<{
      credentialId: string;
      friendlyName: string;
      lastUsed: Date;
    }>
  > {
    const result = await query(
      `SELECT credential_id, friendly_name, last_used_date 
       FROM credentials 
       WHERE user_id = $1 AND deleted_at IS NULL
       ORDER BY last_used_date DESC NULLS LAST`,
      [userId]
    );

    return result.rows.map((row) => ({
      credentialId: row.credential_id,
      friendlyName: row.friendly_name,
      lastUsed: row.last_used_date,
    }));
  },
};
