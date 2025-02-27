// import type { Request, Response } from "express";
// import fetch from 'node-fetch';
// import jwt from 'jsonwebtoken';
// import { query } from '../config/database.js'; 

// const issueToken = (user: any, res: Response) => {
//   const token = jwt.sign(
//     { userId: user.id },
//     process.env.JWT_SECRET!,
//     { expiresIn: '1h' }
//   );

//   res.cookie('token', token, {
//     httpOnly: true,
//     secure: process.env.NODE_ENV === 'production',
//     maxAge: 3600000,
//   });
// };

// export const githubCallback = async (req: Request, res: Response) => {
//   try {
//     const { code, state } = req.query;

//     // const savedState = sessionStorage.getItem('oauth_state');
//     // if (state !== savedState) {
//     //   return res.status(403).json({ error: 'Invalid state' });
//     // }

//     const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
//       method: 'POST',
//       headers: { Accept: 'application/json' },
//       body: new URLSearchParams({
//         client_id: process.env.GITHUB_CLIENT_ID!,
//         client_secret: process.env.GITHUB_CLIENT_SECRET!,
//         code: code as string,
//       }),
//     });
//     const tokenData = await tokenRes.json();

//     const userRes = await fetch('https://api.github.com/user', {
//       headers: { Authorization: `Bearer ${tokenData.access_token}` },
//     });
//     const profile = await userRes.json();


//     const existingUser = await query(
//       'SELECT * FROM users WHERE github_id = $1',
//       [profile.id.toString()]
//     );

//     let user;
//     if (existingUser?.rowCount && existingUser.rowCount > 0) {
//       user = existingUser.rows[0]; 
//     } else {

//       const newUser = await query(
//         'INSERT INTO users (github_id, email, name, avatar_url, provider) VALUES ($1, $2, $3, $4, $5) RETURNING *',
//         [
//           profile.id.toString(),
//           profile.email || `${profile.login}@github.com`,
//           profile.name || profile.login,
//           profile.avatar_url,
//           'github',
//         ]
//       );
//       user = newUser.rows[0];
//     }

//     issueToken(user, res);
//     res.redirect('/');
//   } catch (err) {
//     console.error('GitHub OAuth error:', err);
//     res.redirect('/login?error=github_failed');
//   }
// };

// export const googleCallback = async (req: Request, res: Response) => {
//   try {
//     const { code, state } = req.query;
//     // const savedState = sessionStorage.getItem('oauth_state');
//     // if (state !== savedState) {
//     //   return res.status(403).json({ error: 'Invalid state' });
//     // }

//     const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
//       body: new URLSearchParams({
//         code: code as string,
//         client_id: process.env.GOOGLE_CLIENT_ID!,
//         client_secret: process.env.GOOGLE_CLIENT_SECRET!,
//         redirect_uri: process.env.GOOGLE_CALLBACK_URL!,
//         grant_type: 'authorization_code',
//       }),
//     });
//     const tokenData = await tokenRes.json();

//     const userRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
//       headers: { Authorization: `Bearer ${tokenData.access_token}` },
//     });
//     const profile = await userRes.json();


//     const existingUser = await query(
//       'SELECT * FROM users WHERE google_id = $1',
//       [profile.id]
//     );

//     let user;
//     if (existingUser.rowCount > 0) {
//       user = existingUser.rows[0];
//     } else {

//       const newUser = await query(
//         'INSERT INTO users (google_id, email, name, avatar_url, provider) VALUES ($1, $2, $3, $4, $5) RETURNING *',
//         [
//           profile.id,
//           profile.email,
//           profile.name,
//           profile.picture,
//           'google',
//         ]
//       );
//       user = newUser.rows[0];
//     }

//     issueToken(user, res);
//     res.redirect('/');
//   } catch (err) {
//     console.error('Google OAuth error:', err);
//     res.redirect('/login?error=google_failed');
//   }
// };
