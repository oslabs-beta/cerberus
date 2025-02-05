import express, { Router } from 'express';
// import { Router } from 'express';
import type {
  Request,
  Response,
  // NextFunction,
  // ErrorRequestHandler,
} from 'express';
import formBasedController from '@/controllers/formBasedController';

const router: Router = express.Router();

router.post(
  '/register',
  formBasedController.validateRegistration,
  formBasedController.checkExistingUser,
  formBasedController.hashPassword, // hash password in order to store in the our database
  formBasedController.createUser, // creates user in PostgreSQL database
  (_req: Request, res: Response) => {
    res.status(200).json({
      success: true,
      message: 'Registration successful',
      user: res.locals.user,
    });
  }
);

// login route
// router.post(
//   '/login',
//   formBasedController.validateLoginData,
//   formBasedController.authenticateUser,
//   (_req: Request, res: Response) => {
//     res.status(200).json({
//       message: 'Login successful',
//       token: res.locals.token,
//       user: res.locals.user,
//     });
//   }
// );
// router.post('/forgot-password', ...);

export default router;
