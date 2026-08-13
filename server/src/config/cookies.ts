import type { CookieOptions } from "express";

export const ACCESS_TOKEN_COOKIE = "accessToken";
export const REFRESH_TOKEN_COOKIE = "refreshToken";

// Prod FE/BE are on different domains — SameSite=None is required for the
// cookie to be sent on cross-site fetch calls, and None requires Secure.
const isProduction = process.env.NODE_ENV === "production";

export const accessTokenCookieOptions: CookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? "none" : "lax",
  path: "/", // sent on every request, not just /api/auth
  maxAge: 60 * 60 * 1000, // 1 hour, matches ACCESS_TOKEN_TTL in utils/jwt.ts
};

export const refreshTokenCookieOptions: CookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? "none" : "lax",
  path: "/api/auth",
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days, matches REFRESH_TOKEN_TTL in utils/jwt.ts
};
