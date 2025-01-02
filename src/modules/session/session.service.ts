import { and, eq } from 'drizzle-orm';
import { get } from 'lodash';
import { DB } from '../../db';
import { sessions } from '../../db/schema';
import { AuthenticationError } from '../../error/AuthenticationError';
import { hashRefreshToken, signJwt, verifyJwt } from '../../utils/jwt.utils';
import { findUser } from '../users/users.service';

export async function createSession(db: DB, userId: string, userAgent: string) {
  try {
    // check if there is an existing session for this user
    const existingSession = await db
      .select({ id: sessions.id })
      .from(sessions)
      .where(and(eq(sessions.userId, userId), eq(sessions.valid, true)))
      .limit(1);

    if (existingSession.length > 0) {
      await db
        .update(sessions)
        .set({ valid: false })
        .where(eq(sessions.userId, userId))
        .returning();
      // return new AuthenticationError('Existing session invalidated');
    }

    const [session] = await db
      .insert(sessions)
      .values({ userId, userAgent, valid: true })
      .returning();

    if (!session) {
      throw new AuthenticationError('Error creating session');
    }

    return session;
  } catch (error) {
    throw new AuthenticationError('Error creating session');
  }
}

export async function findSession(db: DB, userId: string, valid: boolean) {
  const session = await db
    .select({ id: sessions.id, userId: sessions.userId, valid: sessions.valid })
    .from(sessions)
    .where(and(eq(sessions.userId, userId), eq(sessions.valid, valid)))
    .limit(1);

  return session.length > 0 ? session[0] : null;
}

export async function updateSession(db: DB, sessionId: string, valid: boolean) {
  const [session] = await db
    .update(sessions)
    .set({ valid })
    .where(eq(sessions.id, sessionId))
    .returning();

  return session;
}

export async function reIssueAccessToken(
  db: DB,
  { refreshToken }: { refreshToken: string }
) {
  const { decoded } = verifyJwt(refreshToken);

  if (!decoded) {
    throw new AuthenticationError('Invalid refresh token');
  }

  const sessionId: string | undefined = get(decoded, 'session');
  if (!sessionId) {
    throw new AuthenticationError('Session ID not found in token');
  }

  const session = await db
    .select({ id: sessions.id, userId: sessions.userId, valid: sessions.valid })
    .from(sessions)
    .where(eq(sessions.id, sessionId))
    .limit(1);

  if (session.length === 0 || !session[0].valid) {
    throw new AuthenticationError('Invalid session');
  }

  const user = await findUser(db, { id: session[0].userId! });

  if (!user) {
    throw new AuthenticationError('User not found');
  }

  const accessToken = signJwt(
    { ...user, session: session[0].id },
    { expiresIn: process.env.ACCESS_TOKEN_TTL }
  );

  return accessToken;
}
