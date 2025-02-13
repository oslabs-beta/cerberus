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
}

export const credentialService = {
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
      await query(
        `INSERT INTO credentials 
         (user_id, credential_id, public_key, signature_count, transports, attestation_type) 
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [userId, credentialId, publicKey, counter, transports, attestationType]
      );
    } catch (error) {
      console.error('Error saving new credential:', error);
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
                transports
         FROM credentials
         WHERE credential_id = $1
         LIMIT 1`,
        [credentialId]
      );

      if (result.rows.length === 0) {
        return null;
      }

      const row = result.rows[0];
      return {
        userID: row.user_id,
        credentialID: row.credential_id,
        credentialPublicKey: row.public_key,
        counter: row.signature_count,
        // If 'transports' is truly TEXT[], the driver should parse it as a JS array
        transports: row.transports || [],
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
};
