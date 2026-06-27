import bcrypt from "bcrypt";
import env from "../../env.ts";

export async function hashPassword(password: string) {
  return bcrypt.hash(password, env.BCRYPT_ROUNDS);
}

export async function comparePasswords(
  password: string,
  hashedPassword: string,
) {
  return bcrypt.compare(password, hashedPassword);
}
