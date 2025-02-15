import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
} from '@simplewebauthn/server';
import { isoBase64URL } from '@simplewebauthn/server/helpers';
import { rpName, rpID, origin } from '../utils/passkeys-constants';
import { credentialService } from '../models/passkeys-credential-service';
import { userService } from '../models/passkeys-user-service';
import type { GenerateRegistrationOptionsOpts } from '@simplewebauthn/server';
import type { Request, Response, NextFunction } from 'express';
import { CustomError } from '../middlewares/customError';

export const handleRegisterStart = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.log('Starting registration process with body:', req.body);
  const { email } = req.body;

  if (!email) {
    return next(new CustomError('Email empty', 400));
  }

  try {
    console.log('Fetching user for email:', email);
    let user = await userService.getUserByEmail(email);
    if (!user) {
      console.log('User not found, creating new user');
      user = await userService.createUser(email);
    }
    console.log('User found/created:', user);

    const registrationOptions: GenerateRegistrationOptionsOpts = {
      rpName,
      rpID,
      userID: new Uint8Array(Buffer.from(user.id.toString())), // Convert number to string
      userName: user.email,
      timeout: 60000,
      attestationType: 'none',
      authenticatorSelection: {
        residentKey: 'required',
        userVerification: 'preferred',
        authenticatorAttachment: 'platform',
      },
      // Support for the two most common algorithms: ES256, and RS256
      supportedAlgorithmIDs: [-7, -257],
    };

    console.log('Generating registration options:', registrationOptions);

    const options = await generateRegistrationOptions(registrationOptions);
    console.log('Generated options:', options);

    req.session.loggedInUserId = user.id;
    req.session.currentChallenge = options.challenge;

    console.log('Session data set:', {
      userId: req.session.loggedInUserId,
      challenge: req.session.currentChallenge,
      rpID,
      origin,
    });

    res.locals.options = options;
    next();
    // res.send(options);
  } catch (error) {
    console.error('Registration error details:', error);
    if (error instanceof Error) {
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }

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

  console.log('Registration finish - Session data:', {
    currentChallenge,
    loggedInUserId,
  });
  console.log('Registration finish - Request body:', body);

  if (!loggedInUserId) {
    return next(new CustomError('User ID is missing', 400));
  }

  if (!currentChallenge) {
    return next(new CustomError('Current challenge is missing', 400));
  }

  try {
    const verification = await verifyRegistrationResponse({
      response: body,
      expectedChallenge: currentChallenge,
      expectedOrigin: origin,
      expectedRPID: rpID,
      requireUserVerification: true,
    });

    console.log('Verification result:', verification);

    if (verification.verified && verification.registrationInfo) {
      const { credential } = verification.registrationInfo;

      const credentialIdBase64 = isoBase64URL.toBase64(credential.id);

      try {
        await credentialService.saveNewCredential(
          parseInt(loggedInUserId),
          credentialIdBase64,
          Buffer.from(credential.publicKey).toString('base64'),
          credential.counter,
          credential.transports || [],
          verification.registrationInfo.fmt || 'none'
        );

        res.locals.verified = true;
        next();
      } catch (error) {
        console.error('Error saving credential:', error);
        next(new CustomError('Failed to save credential', 500));
      }
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
