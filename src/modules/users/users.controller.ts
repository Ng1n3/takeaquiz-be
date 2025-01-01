import { Request, Response } from 'express';
import { setupDb } from '../../db';
import { CreateUserInput } from './users.schema';
import { createUser } from './users.service';

export async function createUserHandler(
  req: Request<{}, {}, CreateUserInput['body']>,
  res: Response
) {
  try {
    const { db } = setupDb();
    const { email, username, password } = req.body;
    const user = await createUser(db, { email, username, password });
    return res.status(201).send(user);
  } catch (error) {
    return res.status(409).send(error.message);
  }
}
