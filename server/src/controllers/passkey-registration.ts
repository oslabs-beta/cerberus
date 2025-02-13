import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
} from '@simplewebauthn/server';
import { uint8ArrayToBase64 } from '../utils/passkeys-utils';
import { rpName, rpID, origin } from '../utils/passkeys-constants';
import { credentialService } from '../models/passkeys-credential-service';
import { userService } from '../models/passkeys-user-service';
import type { RegistrationResponseJSON } from '@simplewebauthn/types';
import type { Request, Response, NextFunction } from 'express';
import { CustomError } from '../middlewares/customError';

export const handleRegisterStart = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { email } = req.body;

  if (!email) {
    return next(new CustomError('Email empty', 400));
  }

  try {
    let user = await userService.getUserByEmail(email);
    if (user) {
      // frontend needs to notify user that a passkey already exists and
      // adding from the same device is not possible
      // OR ELSE, we must allow user to create a new passkey as well!
      return next(new CustomError('Email already exists', 400));
    } else {
      user = await userService.createUser(email);
    }

    const options = await generateRegistrationOptions({
      rpName,
      rpID,
      userID: user.id,
      userName: user.email,
      timeout: 60000,
      attestationType: 'direct',
      excludeCredentials: [],
      authenticatorSelection: {
        residentKey: 'preferred',
      },
      // Support for the two most common algorithms: ES256, and RS256
      supportedAlgorithmIDs: [-7, -257],
    });
    // storing user id and current challenge into this session
    req.session.loggedInUserId = user.id;
    req.session.currentChallenge = options.challenge;
    // remove this later
    // console.log(options);
    res.locals.options = options;
    next();
    // res.send(options);
  } catch (error) {
    next(
      error instanceof CustomError
        ? error
        : new CustomError('Internal Server Error', 500)
    );
  }
};

export const handleRegisterFinish = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { body } = req;
  const { currentChallenge, loggedInUserId } = req.session;

  console.log('Session data:', { currentChallenge, loggedInUserId });
  console.log('Request body:', body);

  if (!loggedInUserId) {
    return next(new CustomError('User ID is missing', 400));
  }

  if (!currentChallenge) {
    return next(new CustomError('Current challenge is missing', 400));
  }

  try {
    const verification = await verifyRegistrationResponse({
      response: body as RegistrationResponseJSON,
      expectedChallenge: currentChallenge,
      expectedOrigin: origin,
      expectedRPID: rpID,
      requireUserVerification: true,
    });

    console.log('Verification result:', verification);

    if (verification.verified && verification.registrationInfo) {
      const { credential } = verification.registrationInfo;
      const credentialID = new Uint8Array(Buffer.from(credential.id, 'base64'));
      const credentialPublicKey =
        verification.registrationInfo.credential.publicKey;
      const counter = credential.counter;

      const attestationType = verification.registrationInfo.fmt || 'none';

      await credentialService.saveNewCredential(
        parseInt(loggedInUserId),
        uint8ArrayToBase64(credentialID),
        uint8ArrayToBase64(credentialPublicKey),
        counter,
        body.response.transports,
        attestationType
      );
      res.locals.verified = true;
      next();
      // res.send({ verified: true });
    } else {
      next(new CustomError('Verification failed', 400));
    }
  } catch (error) {
    next(
      error instanceof CustomError
        ? error
        : new CustomError('Internal Server Error', 500)
    );
  } finally {
    req.session.loggedInUserId = undefined;
    req.session.currentChallenge = undefined;
  }
};
