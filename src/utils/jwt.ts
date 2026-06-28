import { jwtVerify, SignJWT, type JWTPayload } from "jose";
import { createSecretKey } from "crypto";
import env from "../../env.ts";

export interface JwtPayload {
  id: string;
  email: string;
  username: string;
}

export function generateToken(payload: JwtPayload & JWTPayload) {
  const secretKey = createSecretKey(env.JWT_SECRET, "utf-8");

  return new SignJWT(payload)
    .setProtectedHeader({
      alg: "HS256",
    })
    .setIssuedAt()
    .setExpirationTime(env.JWT_EXPIRES_IN || "7d")
    .sign(secretKey);
}

export async function verifyToken(token: string): Promise<JwtPayload> {
  const secretKey = createSecretKey(env.JWT_SECRET, "utf-8");
  const { payload } = await jwtVerify(token, secretKey);

  return payload as unknown as JwtPayload;
}
