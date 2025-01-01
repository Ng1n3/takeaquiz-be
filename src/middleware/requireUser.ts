
import { NextFunction, Response, Request } from "express";
import { ForbiddenError } from "../error/AuthenticationError";

export const requireuser = (req: Request, res: Response, next: NextFunction) => {
  const user = res.locals.user;

  if(!user) {
    return new ForbiddenError('User not found');
  }

  return next()
}