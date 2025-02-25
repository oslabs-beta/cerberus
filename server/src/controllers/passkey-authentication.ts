import type { Request, Response, NextFunction } from 'express';
import {
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
} from '@simplewebauthn/server';
import { isoBase64URL } from '@simplewebauthn/server/helpers';
import type {
  VerifiedAuthenticationResponse,
  VerifyAuthenticationResponseOpts,
  AuthenticatorTransportFuture,
} from '@simplewebauthn/server';
import { base64ToUint8Array } from '../utils/passkeys-utils';
import { rpID, origin } from '../utils/passkeys-constants';
import {
  credentialService,
  type DBAuthenticatorDevice,
} from '../models/passkeys-credential-service';
import { userService } from '../models/passkeys-user-service';
import { CustomError } from '../middlewares/customError';

// this starts login with passkey authentication
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

    // Get user's credentials (especially credential_id and public_key)
    // from database
    const userCredentials = await credentialService.getCredentialsByUserId(
      user.id
    );

    // Format credentials for WebAuthn - this variable will tell browser which credentials are
    // allowed for authentication
    const allowCredentials = userCredentials.map((cred) => {
      // First decode from base64 to buffer
      const credentialBuffer = Buffer.from(cred.credentialID, 'base64');
      // Then encode to base64url
      const credentialId = isoBase64URL.fromBuffer(credentialBuffer);

      return {
        id: credentialId,
        type: 'public-key' as const,
        transports: cred.transports as AuthenticatorTransportFuture[], // e.g. ['usb,'nfc,'ble', etc]
      };
    });

    // this generates authentication options that will be sent to the clien (browser) to initiate
    // the WebAuthn authentication process
    const options = await generateAuthenticationOptions({
      timeout: 60000,
      allowCredentials,
      userVerification: 'preferred',
      rpID,
    });

    // stores the user's ID in the session for later use (e.g. to associate the authentication response
    // with the correct user)
    req.session.loggedInUserId = user.id;
    // grab the challenge from options and store it in req.session
    req.session.currentChallenge = options.challenge;
    req.session.authMethod = 'passkey';

    // send options to client
    res.locals.options = options;
    next();
  } catch (error) {
    console.error('Login start detailed error:', error);

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

      // Update session for authenticated state
      req.session.currentChallenge = undefined; // Clear only the challenge
      req.session.isAuthenticated = true; // Add authentication status
      req.session.lastActivity = new Date(); // Add last activity timestamp

      const user = await userService.getUserById(dbCredential.userID);

      res.locals.verified = true;
      res.locals.user = {
        id: user.id.toString(),
        email: user.email,
        created_at: user.created_at,
      };
      next();
    } else {
      next(new CustomError('Verification failed', 400));
    }
  } catch (error) {
    console.error('Login finish detailed error:', error);

    next(
      error instanceof CustomError
        ? error
        : new CustomError('Internal Server Error', 500)
    );
  }
};
