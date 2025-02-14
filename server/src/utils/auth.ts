import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as GitHubStrategy } from 'passport-github2';
import passport from 'passport';
import dotenv from 'dotenv';
import { pool } from '../models/db';

dotenv.config();

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: '/api/auth/google/callback',
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;
        const res = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

        if (res.rows.length === 0) {
          const newUser = await pool.query(
            'INSERT INTO users (name, email, provider) VALUES ($1, $2, $3) RETURNING *',
            [profile.displayName, email, 'google']
          );
          return done(null, newUser.rows[0]);
        }
        return done(null, res.rows[0]);
      } catch (err) {
        return done(err);
      }
    }
  )
);

passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      callbackURL: '/api/auth/github/callback',
      scope: ['user:email'],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;
        const res = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

        if (res.rows.length === 0) {
          const newUser = await pool.query(
            'INSERT INTO users (name, email, provider) VALUES ($1, $2, $3) RETURNING *',
            [profile.displayName, email, 'github']
          );
          return done(null, newUser.rows[0]);
        }
        return done(null, res.rows[0]);
      } catch (err) {
        return done(err);
      }
    }
  )
);

passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  const res = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
  done(null, res.rows[0]);
});
