import { AnyZodObject, TypeOf } from 'zod';

declare global {
  namespace Express {
    interface Request {
      validatedData: TypeOf<AnyZodObject>;
    }
  }
}
