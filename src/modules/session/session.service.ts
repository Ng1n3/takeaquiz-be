import { get } from 'lodash';
import { DB } from '../../db';
import { sessions } from '../../db/schema';
import { AuthenticationError } from '../../error/AuthenticationError';
import { verifyJwt } from '../../utils/jwt.utils';

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

export async function reIssueAccessToken(db: DB, {refreshToken}: {refreshToken: string}) {
  const {decoded} = verifyJwt(refreshToken)

  if(!decoded || !get(decoded, 'session')) return new AuthenticationError("no session found")

  const session = await db.query.sessions.findFirst({where:})
}
