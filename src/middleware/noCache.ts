import type { Request, Response, NextFunction } from "express";

export function noCache(req: Request, res: Response, next: NextFunction) {
  res.set("Cache-Control", "no-store");
  next();
}
