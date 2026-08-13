import type { NextFunction, Request, Response } from "express";
import { ACCESS_TOKEN_COOKIE } from "../config/cookies.js";
import { verifyAccessToken } from "../utils/jwt.js";

export interface AuthedRequest extends Request {
  userId: string;
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token: unknown = req.cookies?.[ACCESS_TOKEN_COOKIE];

  if (typeof token !== "string") {
    res.status(401).json({ message: "Not authenticated." });
    return;
  }

  try {
    const payload = verifyAccessToken(token);
    (req as AuthedRequest).userId = payload.sub;
    next();
  } catch {
    res.status(401).json({ message: "Session expired. Please log in again." });
  }
}
