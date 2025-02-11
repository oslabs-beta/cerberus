import express, { Router } from 'express';
import type {
  Request,
  Response,
  // NextFunction,
  // ErrorRequestHandler,
} from 'express';
// import formBasedController from '../controllers/formBasedController';

const router: Router = express.Router();

// attestation begins
router.post(
  '/register-start',
  // formBasedController.validateRegistration,
  // formBasedController.checkExistingUser,
  // formBasedController.hashPassword, // hash password before storing it in our database
  // formBasedController.createUser, // stores user information in PostgreSQL database
  (_req: Request, res: Response) => {
    res.status(201).json({
      // success: true,
      // message: 'Registration successful',
      // // do we really need to send user information back to frontend? CHECK
      // user: res.locals.user,
    });
  }
);

// attestation concludes
router.post(
  '/register-finish',
  // formBasedController.validateLoginData,
  // formBasedController.authenticateUser,
  (_req: Request, res: Response) => {
    res.status(200).json({
      // message: 'Login successful',
      // user: res.locals.user,
      // expiresAt: res.locals.expiresAt, // e.g. numeric timestamp  (implement this as well so React can store this?)
    });
  }
);

// login starts
// router.post(
//   '/login-start',
//   formBasedController.sendEmailPassReset,
//   (_req: Request, res: Response) => {
//     res.status(200).json({});
//   }
// );

// login starts
// router.post(
//   '/login-finish',
//   formBasedController.sendEmailPassReset,
//   (_req: Request, res: Response) => {
//     res.status(200).json({});
//   }
// );

export default router;
