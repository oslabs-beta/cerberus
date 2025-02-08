import jwt from 'jsonwebtoken';
import type { Request, Response, NextFunction } from 'express';
import type { JwtPayload } from 'jsonwebtoken';

// interface DecodedUser {
//   userId: number;
//   email?: string;
//   iat?: number;
//   exp?: number;
// }

interface DecodedToken extends JwtPayload {
  userId: number;
  email?: string;
  iat?: number;
  exp?: number;
}

// Extend the Express Request to hold `user`:
interface CustomRequest extends Request {
  user?: DecodedToken;
}

const cookieJwtAuth = (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  const token = req.cookies?.token;

  if (!token) {
    return res.status(401).redirect('/');
  }

  try {
    // verify the token: if invalid or expirted, this throws an error
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as DecodedToken;
    req.user = decoded; // this is info about the user (JWT payload) to help the frontend keep track of
    return next();
  } catch (error) {
    console.error(error);
    // If token is invalid, clear the cookie and redirect
    res.clearCookie('token');
    return res.redirect('/');
  }
};

export default cookieJwtAuth;
