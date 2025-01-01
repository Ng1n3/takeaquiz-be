import { update } from 'lodash';
import { DB } from '../../../db';
import { users } from '../../../db/schema';
import { BaseError } from '../../../error/BaseError';
import { UniqueConstraintError } from '../../../error/ValidationError';

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
