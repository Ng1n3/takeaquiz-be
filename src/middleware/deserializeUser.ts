import { Request,Response,NextFunction } from 'express';
import { get } from 'lodash';
import { verifyJwt } from '../utils/jwt.utils';
import { reIssueAccessToken } from '../modules/session/session.service';
import { setupDb } from '../db';

export const deserializeUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const accessToken = get(req, 'headers.authorization', '').replace(
    /^Bearer\s/,
    ''
  );
  let refreshToken = get(req, 'headers.x-refresh');

  if (Array.isArray(refreshToken)) {
    refreshToken = refreshToken[0]; // Use the first token if it's an array
  }

  if (!accessToken) return next();

  const { decoded, expired } = verifyJwt(accessToken);

  if (decoded) {
    res.locals.user = decoded;
    return next();
  }

  if (expired && refreshToken) {
    try {
      const { db } = setupDb();
      const newAccessToken = await reIssueAccessToken(db, { refreshToken });

      if (newAccessToken) {
        res.setHeader('x-access-token', newAccessToken);
        const result = verifyJwt(newAccessToken);
        res.locals.user = result.decoded;
      }
    } catch (error) {
      console.error('Error reissuing access token:', error);
      // Optionally handle the error (e.g., return a 401 Unauthorized response)
    }
  }
  return next()
};