import type { Response } from "express";
import { z } from "zod";
import { AppError } from "./AppError.js";

// Shared catch-block logic: validation error / known AppError / unexpected error, in one place.
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
