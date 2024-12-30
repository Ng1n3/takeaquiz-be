import jwt from 'jsonwebtoken';
import { config } from '../config';
import { AuthenticationError } from '../error/AuthenticationError';

const privateKey = config.PRIVATE_KEY;
const publicKey = config.PUBLIC_KEY;

export function signJwt(object: Object, options?: jwt.SignOptions | undefined) {
  return jwt.sign(object, privateKey, {
    ...(options && options),
    algorithm: 'RS256',
  });
}

export function verifyJwt(token: string) {
  try {
    const decoded = jwt.verify(token, publicKey);
    return {
      valid: true,
      expired: false,
      decoded,
    };
  } catch (error: any) {
    // return {
    //   valid: false,
    //   expired: error.message === 'jwt expired',
    //   decode: null,
    // };
    if (error.name === 'TokenExpiredError') {
      throw new AuthenticationError('JWT has expired', {
        reason: error.message,
      });
    }

    if (error.name === 'JsonWebTokenError') {
      throw new AuthenticationError('JWT is invalid', {
        reason: error.message,
      });
    }

    // For unexpected errors, rethrow as a generic AuthenticationError
    throw new AuthenticationError('Failed to verify JWT', {
      reason: error.message,
    });
  }
}
