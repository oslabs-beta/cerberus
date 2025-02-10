// import userModel from '@/models/db';
import userModel from '../models/db';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
// import crypto from 'crypto';
// import nodemailer from 'nodemailer';
// import type { JwtPayload } from 'jsonwebtoken';
import type {
  Request,
  Response,
  NextFunction,
  // ErrorRequestHandler,
} from 'express';

// interface DecodedToken extends JwtPayload {
//   userId: number;
//   email?: string;
// }

interface FormBasedController {
  validateRegistration: (
    req: Request,
    res: Response,
    next: NextFunction
  ) => void;
  checkExistingUser: (
    req: Request,
    res: Response,
    next: NextFunction
  ) => Promise<void>;
  hashPassword: (
    req: Request,
    res: Response,
    next: NextFunction
  ) => Promise<void>;
  createUser: (
    req: Request,
    res: Response,
    next: NextFunction
  ) => Promise<void>;
  createMongoUser: (
    req: Request,
    res: Response,
    next: NextFunction
  ) => Promise<void>;
  rollbackSupabaseUser: (
    req: Request,
    res: Response,
    next: NextFunction
  ) => Promise<void>;
  validateLoginData: (req: Request, res: Response, next: NextFunction) => void;
  authenticateUser: (
    req: Request,
    res: Response,
    next: NextFunction
  ) => Promise<void>;
  verifyToken: (req: Request, res: Response, next: NextFunction) => void;
  // sendEmailPassReset: (
  //   req: Request,
  //   res: Response,
  //   next: NextFunction
  // ) => Promise<void>;
}

const formBasedController: FormBasedController = {
  validateRegistration: (req, res, next) => {},
  checkExistingUser: async (req, res, next) => {},
  hashPassword: async (req, res, next) => {},
  createUser: async (req, res, next) => {},
  createMongoUser: async (req, res, next) => {},
  rollbackSupabaseUser: async (req, res, next) => {},
  validateLoginData: (req, res, next) => {},
  authenticateUser: async (req, res, next) => {},
  verifyToken: (req, res, next) => {},
  // sendEmailPassReset: (req, res, next) => {},
};

// Here we have our collection of middleware functions, typically grouped around a specific topic

// validating incoming user data
formBasedController.validateRegistration = (req, _res, next) => {
  // include below fname if fname is an option
  const { email, password } = req.body;

  // Server-side validation (always validate on server even if client validates)
  // if (!fname || fname.length > 50) {
  //   return next({
  //     log: 'Invalid first name',
  //     status: 400,
  //     message: {
  //       error: 'First name is required and must be less than 50 characters',
  //     },
  //   });
  // }

  if (
    !email ||
    email.length > 255 ||
    !email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)
  ) {
    return next({
      log: 'Invalid email',
      status: 400,
      message: { error: 'Valid email is required' },
    });
  }

  if (!password || password.length < 8 || password.length > 72) {
    return next({
      log: 'Invalid password',
      status: 400,
      message: { error: 'Password must be between 8 and 72 characters' },
    });
  }

  // Check for at least one uppercase letter, one number, and one special character
  const passwordRegex =
    /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()\-_+=[\]{};:'"\\|,.<>/?])[A-Za-z\d!@#$%^&*()\-_+=[\]{};:'"\\|,.<>/?]{8,72}$/;
  if (!passwordRegex.test(password)) {
    return next({
      log: 'Invalid password',
      status: 400,
      message: {
        error:
          'Password must contain at least one uppercase letter, one number, and one special character',
      },
    });
  }

  next();
};

// Check if user already exists
formBasedController.checkExistingUser = async (req, _res, next) => {
  const { email } = req.body;

  try {
    const existingUser = await userModel.getUserByEmail(email);

    if (existingUser) {
      // need to check whether this is the appropriate response, currently this is sending the 409 message back to client, which may NOT be a best practice (bad actors thus could find out registered users)
      return next({
        log: 'User already exists',
        status: 409,
        message: { error: 'Email already registered' },
      });
    }
    next();
  } catch (error) {
    return next({
      log: 'Error checking existing user: ' + error,
      status: 500,
      message: { error: 'An error occurred while checking user existence' },
    });
  }
};

// hashing password
formBasedController.hashPassword = async (req, res, next) => {
  try {
    const saltRounds = Number(process.env.SALT_ROUNDS) || 10;
    const hashedPassword = await bcrypt.hash(req.body.password, saltRounds);
    res.locals.hashedPassword = hashedPassword;
    next();
  } catch (error) {
    return next({
      log: 'Error hashing password: ' + error,
      status: 500,
      message: { error: 'An error occurred while processing your request' },
    });
  }
};

// creates user in PostgreSQL database
formBasedController.createUser = async (req, res, next) => {
  const { fname, email } = req.body;
  const hashedPassword = res.locals.hashedPassword;

  try {
    const user = await userModel.createUser(email, hashedPassword, fname);

    // Store user data (except password) in res.locals (Is this really necessary?
    // We probably don't want to send this info back to frontend, right? CHECK)
    res.locals.user = {
      id: user.id,
      email: user.email,
      created_at: user.created_at,
    };
    next();
  } catch (error) {
    return next({
      log: 'Error creating user: ' + error,
      status: 500,
      message: { error: 'An error occurred while creating your account' },
    });
  }
};

// Validate login data
formBasedController.validateLoginData = (req, _res, next) => {
  const { email, password } = req.body;

  if (!email || !email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
    return next({
      log: 'Invalid email format',
      status: 400,
      message: { error: 'Valid email is required' },
    });
  }

  if (!password) {
    return next({
      log: 'Missing password',
      status: 400,
      message: { error: 'Password is required' },
    });
  }

  next();
};

// Authenticate user
formBasedController.authenticateUser = async (req, res, next) => {
  const { email, password } = req.body;
  let user;

  try {
    user = await userModel.getUserByEmail(email);

    if (!user) {
      return next({
        log: 'User not found',
        status: 401,
        message: { error: 'Invalid email or password' },
      });
    }

    // Compare password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);

    if (!isValidPassword) {
      return next({
        // is this valid response? CHECK!
        log: 'Invalid password',
        status: 401,
        message: { error: 'Invalid email or password' },
      });
    }

    // Record the login
    // To get the user's IP address, it seems like either req.socket.remoteAddress or req.ip works
    // another option: req.headers['x-forwarded-for']
    // might need to paste (app.set('trust proxy', true);) into server.ts to trust
    const ipAddress = req.ip || 'unknown';
    await userModel.recordLogin(user.id, ipAddress, true);

    // Generate JWT token
    // const jwtSecret = process.env.JWT_SECRET;
    const jwtSecret = process.env.JWT_SECRET as jwt.Secret;
    if (!jwtSecret) {
      return next({
        log: 'JWT secret is not defined',
        status: 500,
        message: { error: 'Internal server error' },
      });
    }

    // This creates a token with a HEADER (algorithm & token type), PAYLOAD (user data), and SIGNATURE
    // SIGNATURE is a one-way hash of the HEADER + PAYLOAD + JWT Secret stored on the server
    const tokenExpiry = process.env.JWT_EXP || '24h';
    const token = jwt.sign(
      { userId: user.id, email: user.email }, // Payload
      jwtSecret, // Secret key
      { expiresIn: tokenExpiry } as jwt.SignOptions // Options
    );

    // The point of 'decoding' the jwt token here is just to extract
    // its expiration to send it to the frontend
    const decoded = jwt.decode(token) as jwt.JwtPayload;

    // The 'exp' is in *seconds* since the Unix epoch (not ms)
    // so to transform it into JS-friendly timestamp in ms: decoded.exp * 1000
    // const expiresAt = (decoded?.exp ?? 0) * 1000;
    const expiresAt = (decoded?.exp ?? 24 * 60 * 60) * 1000;

    // Convert "24h" to milliseconds if we want to set cookie maxAge in Ms
    // or simply do: 24 * 60 * 60 * 1000
    const cookieMaxAgeMs = 24 * 60 * 60 * 1000; // 24 hours in ms

    // set cookie on res object (place the token in it) to send it back to client
    res.cookie('token', token, {
      httpOnly: true, // prevents client-side scripts from accessing this cookie (security against XSS)
      secure: process.env.NODE_ENV === 'production', // this ensures cross-site cookies are only accessible over HTTPS connections
      sameSite: 'strict', // check to see if we need this
      maxAge: cookieMaxAgeMs, // cookie's expiration
      // path: '/',                                   // default is '/', can be set as needed
    });

    // Remove sensitive data before sending
    const safeUser = {
      id: user.id,
      email: user.email,
      created_at: user.created_at,
    };

    res.locals.user = safeUser;
    res.locals.expiresAt = expiresAt; // numeric seconds since epoch

    next();
  } catch (error) {
    if (user) {
      await userModel.recordLogin(user.id, req.ip || 'unknown', false);
    }

    return next({
      log: 'Error in authenticateUser: ' + error,
      status: 500,
      message: { error: 'An error occurred during authentication' },
    });
  }
};

// Verify JWT token middleware
// formBasedController.verifyToken = (req, res, next) => {
//   const token = req.headers.authorization?.split(' ')[1]; // Bearer TOKEN

//   if (!token) {
//     return next({
//       log: 'No token provided',
//       status: 401,
//       message: { error: 'Authentication required' },
//     });
//   }

//   try {
//     const jwtSecret = process.env.JWT_SECRET;
//     if (!jwtSecret) {
//       return next({
//         log: 'JWT secret is not defined',
//         status: 500,
//         message: { error: 'Internal server error' },
//       });
//     }
//     const decoded = jwt.verify(token, jwtSecret) as DecodedToken;
//     // const decoded = jwt.verify(token, jwtSecret);
//     res.locals.userId = decoded.userId;
//     next();
//   } catch (error) {
//     return next({
//       log: 'Invalid token: ' + error,
//       status: 401,
//       message: { error: 'Invalid or expired token' },
//     });
//   }
// };

// formBasedController.sendEmailPassReset = async (req, res, next) => {
//   const { email } = req.body;

//   try {
//     const user = await userModel.getUserByEmail(email);

//     if (!user) {
//       // Still return 200 for security
//       return res.status(200).json({
//         message: "If an account exists with this email, a password reset link will be sent."
//       });
//     }
//     const resetToken = crypto.randomBytes(32).toString('hex');
//     const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour

//     await userModel.storeResetToken(user.id, resetToken, resetTokenExpiry);

//     const transporter = nodemailer.createTransport({
//       service: 'gmail',
//       auth: {
//         user: process.env.EMAIL_USER,
//         pass: process.env.EMAIL_PASS
//       }
//     });

//     const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

//     await transporter.sendMail({
//       to: email,
//       subject: 'Password Reset Request',
//       html: `
//         <p>You requested a password reset.</p>
//         <p>Click <a href="${resetUrl}">here</a> to reset your password.</p>
//         <p>This link expires in 1 hour.</p>
//       `
//     });

//     res.status(200).json({
//       message: "If an account exists with this email, a password reset link will be sent."
//     });
//   } catch (error) {
//     next({
//       log: `Error in password reset: ${error}`,
//       status: 500,
//       message: { error: 'Failed to process password reset request' }
//     });
//   }
// };

export default formBasedController;
