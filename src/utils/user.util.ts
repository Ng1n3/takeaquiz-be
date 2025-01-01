const SALT = process.env.WORK_SALT_FACTOR!;

export const hashPassword = async (password: string): Promise<string> => {
  return await Bun.password.hash(password, {
    algorithm: 'bcrypt',
    cost: parseInt(SALT),
  });
};

export const comparePasswords = async (
  password: string,
  hashedPassword: string
): Promise<boolean> => {
  return await Bun.password.verify(password, hashedPassword);
};
