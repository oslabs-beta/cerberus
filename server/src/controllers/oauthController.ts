import OauthUser from '../models/oauthUserModel';
import jwt from 'jsonwebtoken';
import fetch from 'node-fetch';
import { Request, Response } from 'express';
import dotenv from 'dotenv';
dotenv.config();

// OAuth Client Credentials
const CLIENT_ID = process.env.VITE_CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;

export const getAccessToken = async (req: Request, res: Response): Promise<void>  => {
  try {
    // User's one time use access token
    const { code } = req.query;
    if (!code) {
      res.status(400).json({ 
        error: 'OAuth Authorization Code Missing',
        details: 'A valid GitHub authorization code is required' 
      });
      return;
    }
    // Build the query string for GitHub token exchange
    // const params = `?client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}&code=${code}`;
    const params = new URLSearchParams({
      client_id: CLIENT_ID || '',
      client_secret: CLIENT_SECRET || '',
      code: code as string
    });

    // Send GitHub our applications OAuth credentials
    const response = await fetch(
      `https://github.com/login/oauth/access_token?${params}`,
      {
        method: 'POST',
        headers: { 
          'Accept': 'application/json',
          'Content-Type': 'application/x-www-form-urlencoded'
        },
      }
    );

    const data = await response.json();
    // Log the access token response to see what GitHub returned
    console.log('GitHub Access Token Response:', JSON.stringify(data, null, 2));
    // Send the same data back to the client as JSON
    if (data.error) {
      res.status(400).json({
        error: 'OAuth Authentication Failed',
        details: data.error_description
      });
      return;
    }
    res.json(data);
  } catch (err) {
    // Log any error that occurred during the fetch
    console.error('Error retrieving access token:', err);
    res.status(500).json({ error: 'Failed to fetch GitHub user data' });
  }
};

export const getUserData = async (req: Request, res: Response) => {
  const authorizationHeader = req.get('Authorization');

  if (!authorizationHeader) {
    return res.status(400).json({ error: 'Authorization header is missing' });
  }

  try {

    // Ask GitHub for the user's account information
    const response = await fetch('https://api.github.com/user', {
      method: 'GET',
      // Forward the Authorization header to GitHub
      headers: { Authorization: authorizationHeader },
    });

    const data = await response.json();

    if (response.status !== 200) {
      return res.status(response.status).json({
        error: 'Failed to Retrieve GitHub User Data',
        details: data.message || 'Unknown Error'
      });
    }

    // Log the user's GitHub profile information
    console.log('GitHub User Data:', JSON.stringify(data, null, 2));
    res.json(data);
  } catch (err) {
    // Log any error that occurred while fetching user data
    console.error('Error retrieving user data:', err);
    res.status(500).json({ error: 'Failed to fetch user data' });
  }
};

export const upsertUser = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { githubId, login, email, avatarUrl, name } = req.body;
    if (!githubId) {
      return res
        .status(400)
        .json({ error: 'Missing GitHub user ID in request body.' });
    }

    const user = await OauthUser.findOneAndUpdate(
      { githubId },
      {
        $set: {
          email,
          name: name || login,
          avatarUrl
        }
      },
      { 
        upsert: true,  // Create if not exists
        new: true,     // Return updated document
        setDefaultsOnInsert: true  // Set default values
      }
    );

    const secret = process.env.JWT_SECRET as string;

    if (!secret) {
    throw new Error('JWT_SECRET is not defined in the environment variables.');
    }

    const token = jwt.sign({ userId: user._id }, secret, {
      expiresIn: '1h',
    });

    // Set secure HTTP-only Cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 3600000, // 1 hour
    });

    return res.json({
      success: true,
      user: {
        _id: user._id,
        githubId: user.githubId,
        email: user.email,
        name: user.name,
        avatarUrl: user.avatarUrl,
      },
      token
    });
    
  } catch (err) {
    console.error('Error in /github upsert route:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
