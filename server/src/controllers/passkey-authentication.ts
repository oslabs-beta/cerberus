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
import { base64ToUint8Array } from '../utils/passkeys-utils.js';
import { rpID, origin } from '../utils/passkeys-constants.js';
import {
  credentialService,
  type DBAuthenticatorDevice,
} from '../models/passkeys-credential-service.js';
import { userService } from '../models/passkeys-user-service.js';
import { CustomError } from '../middlewares/customError.js';

// this starts login with passkey authentication
export const handleLoginStart = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { email } = req.body;

  try {
    console.log('Login attempt with email:', email);

    const user = await userService.getUserByEmail(email);
    console.log('User found in database:', user ? 'Yes' : 'No');

    if (!user) {
      // offer user to create a new account here
      return next(
        new CustomError(
          'User not found. Please register first before attempting to login.',
          404
        )
      );
    }

    // Get user's credentials (especially credential_id and public_key)
    // from database
    const userCredentials = await credentialService.getCredentialsByUserId(
      user.id
    );

    console.log(
      `Found ${userCredentials.length} credentials for user ID ${user.id}`
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
    req.session.loggedInUserId = user.id.toString();
    // grab the challenge from options and store it in req.session
    req.session.currentChallenge = options.challenge;
    req.session.authMethod = 'passkey';

    // Also store in response locals for redundancy
    res.locals.options = options;
    res.locals.userId = user.id;
    res.locals.challenge = options.challenge;

    // Ensure session is saved before responding
    await new Promise<void>((resolve, reject) => {
      req.session.save((err) => {
        if (err) {
          console.error('Session save error in login start:', err);
          reject(err);
        } else {
          console.log(
            'Session saved successfully in login start with challenge:',
            options.challenge
          );
          console.log('Session user ID saved:', user.id.toString());
          resolve();
        }
      });
    });
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
  console.log(
    'Full request body in loginFinish:',
    JSON.stringify(body, null, 2)
  );

  // Try to get data from session
  const sessionChallenge = req.session.currentChallenge;
  const sessionUserId = req.session.loggedInUserId;

  // Try to get data from body (fallback)
  const { userId: bodyUserId, serverChallenge: bodyChallenge } = body;

  // Use either the session or body values, prioritizing session
  const userIdToUse = sessionUserId || bodyUserId;
  const challengeToUse = sessionChallenge || bodyChallenge;

  // Log all data for debugging
  console.log('Login finish session and body data:', {
    sessionID: req.sessionID,
    sessionChallenge: sessionChallenge || 'missing',
    sessionUserId: sessionUserId || 'missing',
    bodyChallenge: bodyChallenge || 'missing',
    bodyUserId: bodyUserId || 'missing',
    userIdToUse: userIdToUse || 'missing',
    challengeToUse: challengeToUse || 'missing',
  });

  // const { currentChallenge, loggedInUserId } = req.session;

  if (!userIdToUse) {
    return next(
      new CustomError(
        'User ID is missing from both session and request body',
        400
      )
    );
  }

  if (!challengeToUse) {
    return next(
      new CustomError(
        'Challenge is missing from both session and request body',
        400
      )
    );
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
      expectedChallenge: challengeToUse,
      expectedOrigin:
        process.env.NODE_ENV === 'production'
          ? `http://${rpID}:${process.env.PORT || 3000}`
          : origin,
      expectedRPID: rpID,
      credential: {
        id: credentialID,
        publicKey: credentialPublicKeyBuffer,
        counter: dbCredential.counter,
        transports: validTransports,
      },
    };

    console.log('Verifying authentication with options:', {
      expectedChallenge: challengeToUse,
      expectedOrigin: origin,
      expectedRPID: rpID,
      credentialId: credentialID,
      hasPublicKey: !!credentialPublicKeyBuffer,
      counter: dbCredential.counter,
      transports: validTransports,
    });

    const verification: VerifiedAuthenticationResponse =
      await verifyAuthenticationResponse(opts);

    // const { verified, authenticationInfo } = verification;
    const { verified } = verification;

    // if (verified) {
    //   await credentialService.updateCredentialCounter(
    //     credentialID, // or bodyCredIDBuffer re-encoded, as you prefer
    //     authenticationInfo.newCounter
    //   );

    //   // Update session
    //   req.session.loggedInUserId = user.id.toString();
    //   req.session.isAuthenticated = true;
    //   req.session.lastActivity = new Date();
    //   req.session.currentChallenge = undefined; // Clear challenge

    //   // Ensure session is saved
    //   await new Promise<void>((resolve) => {
    //     req.session.save((err) => {
    //       if (err) {
    //         console.error('Error saving session after successful login:', err);
    //       } else {
    //         console.log('Session updated successfully after login');
    //       }
    //       resolve();
    //     });
    //   });
    if (verified) {
      // Set up session
      req.session.loggedInUserId = user.id.toString();
      req.session.isAuthenticated = true;
      req.session.lastActivity = new Date();
      req.session.currentChallenge = undefined; // Clear challenge

      // Force session save before continuing
      await new Promise<void>((resolve, reject) => {
        req.session.save((err) => {
          if (err) {
            console.error('Error saving session:', err);
            reject(err);
          } else {
            console.log('Session saved with userId:', user.id.toString());
            resolve();
          }
        });
      });
      res.locals.verified = true;
      res.locals.user = {
        id: user.id.toString(),
        email: user.email,
        created_at: user.created_at,
      };
      next();
    } else {
      next(new CustomError('Authentication verification failed', 400));
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
