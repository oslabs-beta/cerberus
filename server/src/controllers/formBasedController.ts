import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
// import db from
import type {
  Request,
  Response,
  NextFunction,
  ErrorRequestHandler,
} from 'express';

const formBasedController = {};

// Here we have our collection of middleware functions, typically grouped around a specific topic

// validating incoming user data
formBasedController.validateSignupData = (req, res, next) => {
  const { fname, email, password } = req.body;

  // Server-side validation (always validate on server even if client validates)
  if (!fname || fname.length > 50) {
    return next({
      log: 'Invalid first name',
      status: 400,
      message: {
        error: 'First name is required and must be less than 50 characters',
      },
    });
  }

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

  next();
};

// Check if user already exists
formBasedController.checkExistingUser = async (req, res, next) => {
  const { email } = req.body;

  try {
    const query = 'SELECT email FROM users WHERE email = $1';
    const result = await db.query(query, [email]);

    if (result.rows.length > 0) {
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
    const saltRounds = 10;
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

// creates user in Supabase database
formBasedController.createUser = async (req, res, next) => {
  const { fname, email } = req.body;
  const hashedPassword = res.locals.hashedPassword;

  try {
    const query = `
      INSERT INTO users (
        first_name, 
        email, 
        password_hash,
        is_active,
        email_verified,
        created_at
      )
      VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
      RETURNING id, first_name, email, created_at
    `;

    const result = await db.query(query, [
      fname,
      email,
      hashedPassword,
      true, // is_active
      false, // email_verified (implement email verification later)
    ]);

    // Store user data (except password) in res.locals
    // Understand better this HERE:
    res.locals.user = result.rows[0];
    next();
  } catch (error) {
    return next({
      log: 'Error creating user: ' + error,
      status: 500,
      message: { error: 'An error occurred while creating your account' },
    });
  }
};

// middleware here creates user in MongoDB
formBasedController.createMongoUser = async (req, res, next) => {
  try {
    // At this point, res.locals.user should contain the Supabase user data
    // including the user's ID from Supabase
    const supabaseUser = res.locals.user;

    if (!supabaseUser || !supabaseUser.id) {
      throw new Error('Supabase user data missing');
    }

    // Create a new MongoDB user document
    const newMongoUser = new User({
      supabase_id: supabaseUser.id,
    });

    // Save the user to MongoDB
    const savedUser = await newMongoUser.save();

    // Add MongoDB user data to res.locals for potential use in subsequent middleware
    res.locals.mongoUser = savedUser;

    next();
  } catch (error) {
    return next({
      log: 'Error creating MongoDB user: ' + error,
      status: 500,
      message: { error: 'An error occurred while setting up your account' },
    });
  }
};

// Optional: Add a rollback function in case MongoDB user creation fails
formBasedController.rollbackSupabaseUser = async (req, res, next) => {
  try {
    // If we have a Supabase user but MongoDB creation failed
    if (res.locals.user && !res.locals.mongoUser) {
      const query = 'DELETE FROM users WHERE id = $1';
      await db.query(query, [res.locals.user.id]);

      return next({
        log: 'Rolled back Supabase user creation due to MongoDB failure',
        status: 500,
        message: { error: 'An error occurred while setting up your account' },
      });
    }
    next();
  } catch (error) {
    return next({
      log: 'Error in rollback: ' + error,
      status: 500,
      message: { error: 'A critical error occurred during account creation' },
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

  try {
    // Get user from database
    const query = 'SELECT * FROM users WHERE email = $1 AND is_active = true';
    const result = await db.query(query, [email]);

    if (result.rows.length === 0) {
      return next({
        log: 'User not found',
        status: 401,
        message: { error: 'Invalid email or password' },
      });
    }

    const user = result.rows[0];

    // Compare password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);

    if (!isValidPassword) {
      return next({
        log: 'Invalid password',
        status: 401,
        message: { error: 'Invalid email or password' },
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Remove sensitive data before sending
    const safeUser = {
      id: user.id,
      first_name: user.first_name,
      email: user.email,
      created_at: user.created_at,
    };

    // Store user data and token in res.locals
    res.locals.user = safeUser;
    res.locals.token = token;

    next();
  } catch (error) {
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
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
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
