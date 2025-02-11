import express, { Router } from 'express';
import type {
  Request,
  Response,
  // NextFunction,
  // ErrorRequestHandler,
} from 'express';
import {
  handleRegisterFinish,
  handleRegisterStart,
} from '../controllers/passkey-registration';

const router: Router = express.Router();

// attestation begins
router.post(
  '/register-start',
  handleRegisterStart,
  (_req: Request, res: Response) => {
    res.status(201).json({
      success: true,
      message: 'Challenge successfully created',
      user: res.locals.options,
    });
  }
);

// attestation concludes
router.post(
  '/register-finish',
  handleRegisterFinish,
  (_req: Request, res: Response) => {
    res.status(200).json({
      message: 'Passkey created successful',
      verification: res.locals.verified,
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
