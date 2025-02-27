import type { Request, Response, NextFunction } from 'express';
import { CustomError } from '../middlewares/customError.js';
import jwt from 'jsonwebtoken';
import type { JwtPayload } from 'jsonwebtoken';

interface TokenPayload extends JwtPayload {
  userId: string | number;
  email?: string;
}

export const requirePasskeyAuth = (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  console.log("🔍 Checking authentication...");
  console.log("🔹 Session Data:", req.session);

  // **1️⃣ Check session-based authentication (Passkey login)**
  if (req.session?.isAuthenticated && req.session?.loggedInUserId) {
    console.log("✅ Session-based authentication success!");
    req.session.lastActivity = new Date();
    return next();
  }

  // **2️⃣ Check JWT token authentication**
  const accessToken = req.cookies?.accessToken;
  console.log("🔹 Access Token:", accessToken ? "Exists" : "Not Found");

  if (accessToken) {
    try {
      // Verify the JWT token
      const decoded = jwt.verify(
        accessToken,
        process.env.JWT_SECRET!
      ) as TokenPayload;

      console.log("✅ JWT Authentication success!", decoded);

      // Store user ID in session
      req.session.loggedInUserId = decoded.userId.toString();
      return next();
    } catch (error) {
      console.error("❌ JWT verification failed:", error);
    }
  }

  // **3️⃣ If both authentication methods fail, return 401 Unauthorized**
  console.warn("❌ Authentication failed: No valid session or token.");
  return next(new CustomError('Authentication required', 401));
};
