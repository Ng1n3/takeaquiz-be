import jwt from 'jsonwebtoken';
import { config } from '../config';
import { AuthenticationError } from '../error/AuthenticationError';
import { BaseError } from '../error/BaseError';

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
const SALT = process.env.WORK_SALT_FACTOR!;

export async function hashRefreshToken(token: string): Promise<string> {
  try {
    return await Bun.password.hash(token, {
      algorithm: 'bcrypt',
      cost: parseInt(SALT),
    });
  } catch (error) {
    throw new BaseError('Error hashing token', error.message);
  }
}
