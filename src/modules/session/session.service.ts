import { DB } from '../../db';
import { sessions } from '../../db/schema';
import { AuthenticationError } from '../../error/AuthenticationError';

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


