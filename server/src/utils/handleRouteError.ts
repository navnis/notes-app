import type { Response } from "express";
import { z } from "zod";
import { AppError } from "./AppError.js";

// Shared catch-block logic for auth routes: each route still has its own
// explicit try/catch, this just avoids repeating the same three branches
// (validation error / known AppError / unexpected error) in every one.
export function handleRouteError(error: unknown, res: Response, context: string): void {
  if (error instanceof z.ZodError) {
    res.status(400).json({ message: error.issues[0]?.message ?? "Invalid request." });
    return;
  }
  if (error instanceof AppError) {
    res.status(error.status).json({ message: error.message });
    return;
  }
  console.error(`${context} failed:`, error);
  res.status(500).json({ message: "Something went wrong. Please try again." });
}
