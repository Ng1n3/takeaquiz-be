import express from 'express';
import { requireuser } from '../../middleware/requireUser';
import { validateResources } from '../../middleware/validateResources';
import { asyncHandler } from '../../utils/asyncHandlers';
import {
  createUserHandler,
  getUsersHandler,
  loginUserHandler,
  logoutUserHandler,
} from './users.controller';
import {
  createUserSchema,
  loginUserSchema,
  logoutUserSchema,
} from './users.schema';

export function userRouter() {
  const router = express.Router();
  router.get('/users', requireuser, asyncHandler(getUsersHandler));
  router.post(
    '/users',
    validateResources(createUserSchema),
    asyncHandler(createUserHandler)
  );

  router.post(
    '/user/login',
    validateResources(loginUserSchema),
    asyncHandler(loginUserHandler)
  );

  router.post('/user/logout', [
    requireuser,
    validateResources(logoutUserSchema),
    asyncHandler(logoutUserHandler),
  ]);

  return router;
}
