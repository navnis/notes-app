import type { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/AppError.js";

// Last-resort safety net for anything that slips past a route's own try/catch.
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
