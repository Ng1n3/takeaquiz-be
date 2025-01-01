import { eq } from 'drizzle-orm';
import { DB } from '../../../db';
import { users } from '../../../db/schema';
import { AuthenticationError } from '../../../error/AuthenticationError';
import { BaseError } from '../../../error/BaseError';
import { UniqueConstraintError } from '../../../error/ValidationError';
import { comparePasswords } from '../../../utils/user.util';
import { omit } from 'lodash';

interface createUserInput {
  username: string;
  email: string;
  password: string;
}

type UserWithoutPassword = Omit<typeof users.$inferSelect, 'password'>;

export async function createUser(
  db: DB,
  input: createUserInput
): Promise<UserWithoutPassword | undefined> {
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

    return user;
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
): Promise<UserWithoutPassword | AuthenticationError> {
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
      return new AuthenticationError('User not found');
    }

    // Check password
    const issValid = await comparePasswords(password, user.password);

    if (!issValid) return new AuthenticationError('Invalid password');

    // const {password:_, ...userWIthoutPassword} = users
    return omit(user, 'password');
  } catch (error) {
    throw new AuthenticationError("error validating users's password");
  }
}
