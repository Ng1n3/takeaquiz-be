import express from 'express';
import { validateRequest } from '../../middleware/validateResource';
import { asyncHandler } from '../../utils/asyncHandlers';
import { createUserHandler } from './users.controller';
import { createUserSchema } from './users.schema';

const router = express.Router();

export async function userRouter() {
  router.post(
    '/users',
    validateRequest(createUserSchema),
    asyncHandler(createUserHandler)
  );

  return router;
}
