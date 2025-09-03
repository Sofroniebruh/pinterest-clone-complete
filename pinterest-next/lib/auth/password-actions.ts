import bcrypt from 'bcrypt';

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export async function checkPassword(passwordProvided: string, originalPassword: string) {
  return bcrypt.compare(passwordProvided, originalPassword);
}