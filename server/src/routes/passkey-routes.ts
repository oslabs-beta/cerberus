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
import {
  handleLoginStart,
  handleLoginFinish,
} from '@/controllers/passkey-authentication';

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
router.post(
  '/login-start',
  handleLoginStart,
  (_req: Request, res: Response) => {
    res.status(201).json({
      success: true,
      message: 'Challenge successfully created',
      user: res.locals.options,
    });
  }
);

// login starts
router.post(
  '/login-finish',
  handleLoginFinish,
  (_req: Request, res: Response) => {
    res.status(200).json({
      message: 'Successful verification',
      verification: res.locals.verified,
    });
  }
);

export default router;
