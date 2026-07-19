import type { Request, Response, NextFunction } from "express";
import { verifyToken, type JwtPayload } from "../utils/jwt.ts";

export interface AuthenticatedRequest extends Request {
  user?: JwtPayload;
}

export async function authenticateToken(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const token = req.cookies?.token;

    if (!token) {
      return res.status(401).json({ error: "Bad Request" });
    }

    const payload = await verifyToken(token);
    req.user = payload;

    next();
  } catch (e) {
    return res.status(403).json({ error: "Forbidden" });
  }
}
