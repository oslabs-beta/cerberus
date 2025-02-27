import jwt from 'jsonwebtoken';
import type { JwtPayload, Secret } from 'jsonwebtoken';
import type { StringValue } from 'ms';
import { query } from '../config/database.js';

interface TokenPayload {
  userId: number;
  email: string;
}

interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAt: number;
  refreshTokenExpiresAt: number;
}

class TokenService {
  private accessTokenSecret: Secret;
  private refreshTokenSecret: Secret;
  private accessTokenExpiry: StringValue;
  private refreshTokenExpiry: StringValue;

  constructor() {
    // Access token config
    const accessSecret = process.env.JWT_SECRET;
    if (!accessSecret) {
      throw new Error('JWT_SECRET must be defined');
    }
    this.accessTokenSecret = accessSecret;
    this.accessTokenExpiry = (process.env.JWT_EXP || '15m') as StringValue;

    // Refresh token config
    const refreshSecret = process.env.REFRESH_TOKEN_SECRET;
    if (!refreshSecret) {
      throw new Error('REFRESH_TOKEN_SECRET must be defined');
    }
    this.refreshTokenSecret = refreshSecret;
    this.refreshTokenExpiry = '7d';
  }

  generateTokens(payload: TokenPayload): TokenResponse {
    // Generate access token
    const accessToken = jwt.sign(payload, this.accessTokenSecret, {
      expiresIn: this.accessTokenExpiry,
    });

    // Generate refresh token
    const refreshToken = jwt.sign(
      { userId: payload.userId },
      this.refreshTokenSecret,
      { expiresIn: this.refreshTokenExpiry }
    );

    // Decode tokens to get expiration times
    const decodedAccess = jwt.decode(accessToken) as JwtPayload;
    const decodedRefresh = jwt.decode(refreshToken) as JwtPayload;

    return {
      accessToken,
      refreshToken,
      accessTokenExpiresAt: (decodedAccess?.exp ?? 0) * 1000,
      refreshTokenExpiresAt: (decodedRefresh?.exp ?? 0) * 1000,
    };
  }

  async storeRefreshToken(userId: number, refreshToken: string): Promise<void> {
    try {
      await query(
        `INSERT INTO refresh_tokens (user_id, token, expires_at)
         VALUES ($1, $2, NOW() + INTERVAL '7 days')`,
        [userId, refreshToken]
      );
    } catch (error) {
      console.error('Error storing refresh token:', error);
      throw new Error('Failed to store refresh token');
    }
  }

  async verifyRefreshToken(token: string): Promise<TokenPayload | null> {
    try {
      // Verify the token is valid
      const decoded = jwt.verify(token, this.refreshTokenSecret) as JwtPayload;

      // Check if token exists in database and is not revoked
      const result = await query(
        `SELECT user_id, is_revoked 
         FROM refresh_tokens 
         WHERE token = $1 AND expires_at > NOW()`,
        [token]
      );

      if (!result.rows[0] || result.rows[0].is_revoked) {
        return null;
      }

      return {
        userId: decoded.userId,
        email: decoded.email,
      };
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  async revokeRefreshToken(token: string): Promise<void> {
    try {
      await query(
        `UPDATE refresh_tokens 
         SET is_revoked = true 
         WHERE token = $1`,
        [token]
      );
    } catch (error) {
      console.error('Error revoking refresh token:', error);
      throw new Error('Failed to revoke refresh token');
    }
  }

  async revokeAllUserTokens(userId: number): Promise<void> {
    try {
      await query(
        `UPDATE refresh_tokens 
         SET is_revoked = true 
         WHERE user_id = $1`,
        [userId]
      );
    } catch (error) {
      console.error('Error revoking user tokens:', error);
      throw new Error('Failed to revoke user tokens');
    }
  }
}

export const tokenService = new TokenService();
