import express from 'express';
import { requireuser } from '../../middleware/requireUser';
import { asyncHandler } from '../../utils/asyncHandlers';
import { reIssueAccessToken } from './session.service';

export async function sessionRouter() {
  const router = express();
  router.post('/issueToken', requireuser, asyncHandler(reIssueAccessToken));
  return router;
}
