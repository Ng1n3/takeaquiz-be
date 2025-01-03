import { Request, Response } from 'express';
import { setupDb } from '../../db';
import { AuthenticationError } from '../../error/AuthenticationError';
import { ConflictError } from '../../error/ConflictError';
import { CreateUserInput, LoginUserInput } from './users.schema';
import { createUser, loginUser } from './users.service';

export async function createUserHandler(
  req: Request<{}, {}, CreateUserInput['body']>,
  res: Response
) {
  try {
    const { db } = setupDb();
    const { email, username, password } = req.body;
    const result = await createUser(db, { email, username, password });
    return res.status(201).send(result);
  } catch (error) {
    return new ConflictError(error.message);
  }
}

export async function loginUserHandler(
  req: Request<{}, {}, LoginUserInput['body']>,
  res: Response
) {
  try {
    const { email, password } = req.body;
    const user = await loginUser({ email, password });
    if (!user) throw new AuthenticationError('Invalid credentials');
    return res.status(200).send(user);
  } catch (error) {
    return new AuthenticationError(error.message);
  }
}

1