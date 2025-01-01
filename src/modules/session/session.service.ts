import { eq } from 'drizzle-orm';
import { get } from 'lodash';
import { DB } from '../../db';
import { sessions } from '../../db/schema';
import { AuthenticationError } from '../../error/AuthenticationError';
import { signJwt, verifyJwt } from '../../utils/jwt.utils';
import { findUser } from './users/users.service';

export async function createSession(db: DB, userId: string, userAgent: string) {
  try {
    const [session] = await db
      .insert(sessions)
      .values({ userId, userAgent, valid: true })
      .returning();

    return session;
  } catch (error) {
    throw new AuthenticationError('Error creating session');
  }
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
