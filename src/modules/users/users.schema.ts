import { object, string, TypeOf } from 'zod';

export const createUserSchema = object({
  body: object({
    username: string({
      required_error: 'Username is required',
    }).min(5, 'Username must be at least 5 characters'),
    email: string({
      required_error: 'Email is required',
    }).email('Not a valid email'),
    password: string({
      required_error: 'Password is required',
    }).min(6, 'Password must be at least 6 characters'),
  }),
});

export type CreateUserInput = TypeOf<typeof createUserSchema>;
