import express from 'express';
import { githubCallback, googleCallback } from '../controllers/oauthController';

const router = express.Router();

// GitHub OAuth
router.get('/github', (req, res) => {
  const state = crypto.randomUUID();
  req.session.oauthState = state;
  res.redirect(`https://github.com/login/oauth/authorize?
    client_id=${process.env.GITHUB_CLIENT_ID}&
    state=${state}`);
});

router.get('/github/callback', githubCallback);

// Google OAuth
router.get('/google', (req, res) => {
  const state = crypto.randomUUID();
  req.session.oauthState = state;
  res.redirect(`https://accounts.google.com/o/oauth2/v2/auth?
    client_id=${process.env.GOOGLE_CLIENT_ID}&
    redirect_uri=${process.env.GOOGLE_CALLBACK_URL}&
    state=${state}&
    scope=email profile`);
});

router.get('/google/callback', googleCallback);

export default router;