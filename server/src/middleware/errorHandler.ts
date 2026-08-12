import type { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/AppError.js";

// Last-resort safety net — every route handler is expected to try/catch its
// own logic and respond directly, but this catches anything that still
// slips through (e.g. an unexpected thrown error) via next(error).
export function errorHandler(
  error: unknown,
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction,
) {
  if (error instanceof AppError) {
    res.status(error.status).json({ message: error.message });
    return;
  }

  console.error(error);
  res.status(500).json({ message: "Something went wrong. Please try again." });
}
