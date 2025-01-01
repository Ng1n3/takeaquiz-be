import bcrypt from 'bcrypt';
const SALT = process.env.WORK_SALT_FACTOR!;

export const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(parseInt(SALT));
  return bcrypt.hash(password, salt);
};

export const comparePasswords = async (
  password: string,
  hashedPassword: string
): Promise<boolean> => {
  return bcrypt.compare(password, hashedPassword);
};
