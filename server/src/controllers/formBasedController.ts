// import userModel from '@/models/db';
import userModel from '../models/db';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import type { JwtPayload } from 'jsonwebtoken';
import type {
  Request,
  Response,
  NextFunction,
  // ErrorRequestHandler,
} from 'express';

interface DecodedToken extends JwtPayload {
  userId: number;
  email?: string;
}

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
formBasedController.checkExistingUser = async (req, res, next) => {
  const { email } = req.body;

  try {
    const existingUser = await userModel.getUserByEmail(email);

    if (existingUser) {
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

// hash password
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

    // Store user data (except password) in res.locals
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
formBasedController.validateLoginData = (req, res, next) => {
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
        log: 'Invalid password',
        status: 401,
        message: { error: 'Invalid email or password' },
      });
    }

    // Record the login
    const ipAddress = req.ip || 'unknown';
    await userModel.recordLogin(user.id, ipAddress, true);

    // Generate JWT token
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      return next({
        log: 'JWT secret is not defined',
        status: 500,
        message: { error: 'Internal server error' },
      });
    }

    const token = jwt.sign({ userId: user.id, email: user.email }, jwtSecret, {
      expiresIn: '24h',
    });

    // Remove sensitive data before sending
    const safeUser = {
      id: user.id,
      email: user.email,
      created_at: user.created_at,
    };

    res.locals.user = safeUser;
    res.locals.token = token;

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
formBasedController.verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return next({
      log: 'No token provided',
      status: 401,
      message: { error: 'Authentication required' },
    });
  }

  try {
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      return next({
        log: 'JWT secret is not defined',
        status: 500,
        message: { error: 'Internal server error' },
      });
    }
    const decoded = jwt.verify(token, jwtSecret) as DecodedToken;
    // const decoded = jwt.verify(token, jwtSecret);
    res.locals.userId = decoded.userId;
    next();
  } catch (error) {
    return next({
      log: 'Invalid token: ' + error,
      status: 401,
      message: { error: 'Invalid or expired token' },
    });
  }
};

export default formBasedController;
