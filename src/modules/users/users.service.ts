import { and, eq, or, SQLWrapper } from 'drizzle-orm';
import { omit } from 'lodash';
import { DB, setupDb } from '../../db';
import { sessions, users, users } from '../../db/schema';
import { AuthenticationError } from '../../error/AuthenticationError';
import { BaseError } from '../../error/BaseError';
import { ConflictError } from '../../error/ConflictError';
import { UniqueConstraintError } from '../../error/ValidationError';
import { signJwt } from '../../utils/jwt.utils';
import { comparePasswords } from '../../utils/user.util';
import { createSession, findSession } from '../session/session.service';

interface createUserInput {
  username: string;
  email: string;
  password: string;
}

interface AuthResponse {
  user: UserWithoutPassword;
  accessToken?: string;
  refreshToken?: string;
  message?: string;
}

type UserWithoutPassword = Omit<typeof users.$inferSelect, 'password'>;

export async function createUser(
  db: DB,
  input: createUserInput
): Promise<AuthResponse> {
  try {
    const [user] = await db
      .insert(users)
      .values({
        email: input.email,
        username: input.username,
        password: input.password,
      })
      .returning({
        id: users.id,
        username: users.username,
        email: users.email,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      });

    const session = await createSession(db, user.id, 'default-agent');
    const accessToken = signJwt(
      { ...user, session: session.id },
      { expiresIn: process.env.ACCESS_TOKEN_TTL }
    );
    const refreshToken = signJwt(
      { ...user, session: session.id },
      { expiresIn: process.env.REFRESH_TOKEN_TTL }
    );

    // Save refresh token
    await db
      .update(sessions)
      .set({ refreshToken })
      .where(eq(sessions.id, session.id));

    return {
      user,
      accessToken,
      refreshToken,
      message: 'User created successfully',
    };
  } catch (error) {
    if (error instanceof BaseError) {
      throw error;
    }

    // Handle database unique constraint errors
    if (error instanceof Error && error.message.includes('unique')) {
      if (error.message.toLowerCase().includes('email')) {
        throw new UniqueConstraintError('email');
      }
      if (error.message.toLowerCase().includes('username')) {
        throw new UniqueConstraintError('username');
      }
      throw new UniqueConstraintError('field');
    }

    // Handle other errors
    throw new Error(
      'Error creating user: ' +
        (error instanceof Error ? error.message : 'Unknown error')
    );
  }
}

export async function validatePassword(
  db: DB,
  email: string,
  password: string
): Promise<UserWithoutPassword> {
  try {
    const [user] = await db
      // .query(users)
      .select({
        id: users.id,
        email: users.email,
        username: users.username,
        password: users.password,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (!user) {
      throw new AuthenticationError('User not found');
    }

    // Check password
    const issValid = await comparePasswords(password, user.password);

    if (!issValid) throw new AuthenticationError('Invalid password');

    // const {password:_, ...userWIthoutPassword} = users
    return omit(user, 'password');
  } catch (error) {
    throw new AuthenticationError("error validating users's password");
  }
}

interface findUserInput {
  email?: string;
  username?: string;
  id?: string;
}
export async function findUser(
  db: DB,
  input: findUserInput
): Promise<UserWithoutPassword | undefined> {
  try {
    const conditions: SQLWrapper[] = [];
    if (input.email) {
      conditions.push(eq(users.email, input.email));
    }
    if (input.username) {
      conditions.push(eq(users.username, input.username));
    }
    if (input.id) {
      conditions.push(eq(users.id, input.id));
    }

    if (conditions.length === 0) {
      throw new Error('No valid input provided');
    }
    const [user] = await db
      .select({
        id: users.id,
        email: users.email,
        username: users.username,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      })
      .from(users)
      .where(or(...conditions))
      .limit(1);

    return user;
  } catch (error) {
    throw new Error('Error finding user');
  }
}

interface LoginInput {
  email: string;
  password: string;
}

export async function loginUser({
  email,
  password,
}: LoginInput): Promise<AuthResponse> {
  try {
    const { db } = setupDb();
    const user = await validatePassword(db, email, password);
    if (!user) {
      throw new AuthenticationError('Invalid credentials');
    }
    // check for active session
    const activesession = await db
      .select()
      .from(sessions)
      .where(and(eq(sessions.valid, true), eq(sessions.userId, user.id)));

    if (activesession) {
      return {
        user,
        message: 'users is already logged in',
      };
    }

    const session = await createSession(db, user.id, 'default-agent');
    const accessToken = signJwt(
      { ...user, session: session.id },
      { expiresIn: process.env.ACCESS_TOKEN_TTL }
    );
    const refreshToken = signJwt(
      { ...user, session: session.id },
      { expiresIn: process.env.REFRESH_TOKEN_TTL }
    );

    // Save refresh token
    await db
      .update(sessions)
      .set({ refreshToken })
      .where(eq(sessions.id, session.id));

    return {
      user,
      accessToken,
      refreshToken,
      message: 'User logged in successfully',
    };
  } catch (error) {
    throw new AuthenticationError('Error logging in user', error.message);
  }
}

export async function LogoutUser(userId: string): Promise<string> {
  try {
    const { db } = setupDb();
    const user = findUser(db, { id: userId });
    if (!user) {
      throw new AuthenticationError('User not found');
    }
    const session = await findSession(db, userId, true);
    if (!session) {
      throw new AuthenticationError('No active session found');
    }
    await db
      .update(sessions)
      .set({ valid: false, refreshToken: null })
      .where(eq(sessions.userId, userId));
    return 'User logged out successfully';
  } catch (error) {
    throw new ConflictError('Error logging out user', error.message);
  }
}

export async function getUsers(): Promise<UserWithoutPassword[]> {
  try {
    const { db } = setupDb();
    const AllUsers = await db
      .select({
        id: users.id,
        email: users.email,
        username: users.username,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      })
      .from(users);
    return AllUsers;
  } catch (error) {
    throw new BaseError('Error getting users', error.message);
  }
}
