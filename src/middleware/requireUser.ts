
import { NextFunction, Response, Request } from "express";
import { ForbiddenError } from "../error/AuthenticationError";

export const requireuser = (req: Request, res: Response, next: NextFunction) => {
  const user = res.locals.user;
  console.log("user", user);

  if(!user) {
    throw new ForbiddenError('User not found');
  }

  return next()
}