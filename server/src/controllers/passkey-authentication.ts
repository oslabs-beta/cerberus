// check if passkeys are already stored on the device (allowing multiple passkeys per account could lead to major user confusion)
// Allow users to add only 1 passkey per device?
import type { Request, Response, NextFunction } from 'express';
import {
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
} from '@simplewebauthn/server';
import { base64ToUint8Array } from '../utils/passkeys-utils';
import { rpID, origin } from '../utils/passkeys-constants';
import {
  credentialService,
  type DBAuthenticatorDevice,
} from '../models/passkeys-credential-service';
import { userService } from '../models/passkeys-user-service';
import { isoBase64URL } from '@simplewebauthn/server/helpers';
import type {
  VerifiedAuthenticationResponse,
  VerifyAuthenticationResponseOpts,
  AuthenticatorTransportFuture,
} from '@simplewebauthn/server';
import { CustomError } from '../middlewares/customError';

export const handleLoginStart = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { email } = req.body;
  try {
    const user = await userService.getUserByEmail(email);
    if (!user) {
      // offer user to create a new account here
      return next(new CustomError('User not found', 404));
    }

    req.session.loggedInUserId = user.id;

    // [allowCredentials](/glossary/allowcredentials) is purposely for this demo left empty. This causes all existing local credentials
    // to be displayed for the service instead only the ones the username has registered.
    const options = await generateAuthenticationOptions({
      timeout: 60000,
      allowCredentials: [],
      userVerification: 'required',
      rpID,
    });

    req.session.currentChallenge = options.challenge;
    res.locals.options = options;
    next();
  } catch (error) {
    next(
      error instanceof CustomError
        ? error
        : new CustomError('Internal Server Error', 500)
    );
  }
};

export const handleLoginFinish = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { body } = req;
  const { currentChallenge, loggedInUserId } = req.session;

  if (!loggedInUserId) {
    return next(new CustomError('User ID is missing', 400));
  }

  if (!currentChallenge) {
    return next(new CustomError('Current challenge is missing', 400));
  }

  try {
    const credentialID = isoBase64URL.toBase64(body.rawId);
    // const bodyCredIDBuffer = isoBase64URL.toBuffer(body.rawId);
    const dbCredential: DBAuthenticatorDevice | null =
      await credentialService.getCredentialByCredentialId(credentialID);
    if (!dbCredential) {
      return next(
        new CustomError('Credential not registered with this site', 404)
      );
    }

    const user = await userService.getUserById(dbCredential.userID);
    if (!user) {
      return next(new CustomError('User not found', 404));
    }

    // Convert from base64 stored in DB to a Buffer (or Uint8Array)
    const credentialPublicKeyBuffer = base64ToUint8Array(
      dbCredential.credentialPublicKey
    );
    // const credentialIDBuffer = base64ToUint8Array(dbCredential.credentialID);

    const validTransports = dbCredential.transports.filter(
      (transport): transport is AuthenticatorTransportFuture =>
        ['usb', 'nfc', 'ble', 'internal', 'hybrid'].includes(transport)
    );

    // Compose "authenticator" object in the shape @simplewebauthn/server expects
    const opts: VerifyAuthenticationResponseOpts = {
      response: body,
      expectedChallenge: currentChallenge,
      expectedOrigin: origin,
      expectedRPID: rpID,
      credential: {
        id: credentialID,
        publicKey: credentialPublicKeyBuffer,
        counter: dbCredential.counter,
        transports: validTransports,
      },
    };
    const verification: VerifiedAuthenticationResponse =
      await verifyAuthenticationResponse(opts);
    const { verified, authenticationInfo } = verification;

    if (verified) {
      await credentialService.updateCredentialCounter(
        credentialID, // or bodyCredIDBuffer re-encoded, as you prefer
        authenticationInfo.newCounter
      );
      res.locals.verified = true;
      next();
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
    req.session.currentChallenge = undefined;
    req.session.loggedInUserId = undefined;
  }
};
