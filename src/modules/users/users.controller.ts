import { Request, Response } from 'express';
import { setupDb } from '../../db';
import { AuthenticationError } from '../../error/AuthenticationError';
import { ConflictError } from '../../error/ConflictError';
import {
  CreateUserInput,
  LoginUserInput,
  LogoutUserInput,
} from './users.schema';
import { createUser, getUsers, loginUser, LogoutUser } from './users.service';
import { BaseError } from '../../error/BaseError';

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
    console.log("Hi I'm fucking hit!");
    if (!user) throw new AuthenticationError('Invalid credentials');
    return res.status(200).send(user);
  } catch (error) {
    return new AuthenticationError(error.message);
  }
}

export async function logoutUserHandler(
  req: Request<{}, {}, LogoutUserInput['body']>,
  res: Response
) {
  try {
    await LogoutUser(req.body.userId);
    return res.status(200).send({ message: 'User logged out' });
  } catch (error) {
    throw new ConflictError(error.message);
  }
}

export async function getUsersHandler(req: Request, res: Response) {
  try {
    const users = await getUsers()
    res.status(200).send(users)
  } catch (error) {
    throw new BaseError('Error fetching users', error.message)
  }
}
