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

export const loginUserSchema = object({
  body: object({
    email: string({
      required_error: 'Email is required',
    }).email('Not a valid Email'),
    password: string({
      required_error: 'password is required',
    }),
  }),
});

export const logoutUserSchema = object({
  body: object({
    userId: string({
      required_error: 'userId is required',
    }),
  }),
});

export type CreateUserInput = TypeOf<typeof createUserSchema>;
export type LoginUserInput = TypeOf<typeof loginUserSchema>;
export type LogoutUserInput = TypeOf<typeof logoutUserSchema>;
