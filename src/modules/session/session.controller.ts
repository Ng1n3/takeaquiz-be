import { eq } from 'drizzle-orm';
import { Request, Response } from 'express';
import { db } from '../../db/connection';
import { sessions } from '../../db/schema';
import { AuthenticationError } from '../../error/AuthenticationError';
import { signJwt } from '../../utils/jwt.utils';
import { validatePassword } from '../users/users.service';
import { createSession, findSession, updateSession } from './session.service';

export const createSessionHandler = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const user = await validatePassword(db, email, password);
  if (!user) return new AuthenticationError('Invalid credentials');

  const session = await createSession(db, user.id, req.get('user-agent') || '');

  const accessToken = signJwt(
    { ...user, session: session.id },
    { expiresIn: process.env.ACCESS_TOKEN_TTL }
  );

  const refreshToken = signJwt(
    { ...user, session: session.id },
    { expiresIn: process.env.REFRESH_TOKEN_TTL }
  );

  //save rrefresh TOken to DB
  await db
    .update(sessions)
    .set({ refreshToken })
    .where(eq(sessions.id, session.id));

  res.status(201).send({ accessToken, refreshToken });
};

export async function getSessionHandler(req: Request, res: Response) {
  const userId = res.locals.user.id;
  const valid = true;
  const sessions = await findSession(db, userId, valid);
  res.status(200).send(sessions);
}

export async function deleteSessionHandler(req: Request, res: Response) {
  const sessionId = res.locals.user.session;
  await updateSession(db, sessionId, false);
}
