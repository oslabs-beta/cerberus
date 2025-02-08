import express from 'express';
import {
  getAccessToken,
  getUserData,
  upsertUser,
} from '../controllers/oauthController.ts';

const router = express.Router();

// 1) Exchange code for an access token
router.get('/github/access-token', getAccessToken);

// 2) Get user data from GitHub using the token
router.get('/github/userdata', getUserData);

// 3) Upsert user in local DB
router.post('/github', upsertUser);

export default router;