import { Router, type Response } from "express";
import type { HydratedDocument } from "mongoose";
import { UserModel, type User } from "../models/User.js";
import { hashPassword, comparePassword } from "../utils/password.js";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../utils/jwt.js";
import { hashToken } from "../utils/tokenHash.js";
import { handleRouteError } from "../utils/handleRouteError.js";
import { loginSchema, registerSchema } from "../validation/authSchemas.js";
import { requireAuth, type AuthedRequest } from "../middleware/requireAuth.js";
import { AppError } from "../utils/AppError.js";
import {
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
  accessTokenCookieOptions,
  refreshTokenCookieOptions,
} from "../config/cookies.js";

const router = Router();

// Signs a fresh access+refresh pair, persists the refresh token's hash on
// the user, and sets both as httpOnly cookies — shared by register/login/refresh.
async function issueTokens(res: Response, user: HydratedDocument<User>) {
  const accessToken = signAccessToken(user.id);
  const refreshToken = signRefreshToken(user.id);
  user.refreshTokenHash = hashToken(refreshToken);
  await user.save();

  res.cookie(ACCESS_TOKEN_COOKIE, accessToken, accessTokenCookieOptions);
  res.cookie(REFRESH_TOKEN_COOKIE, refreshToken, refreshTokenCookieOptions);
}

function clearAuthCookies(res: Response) {
  res.clearCookie(ACCESS_TOKEN_COOKIE, accessTokenCookieOptions);
  res.clearCookie(REFRESH_TOKEN_COOKIE, refreshTokenCookieOptions);
}

router.post("/register", async (req, res) => {
  try {
    const { email, password } = registerSchema.parse(req.body);

    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      throw new AppError(409, "An account with this email already exists.");
    }

    const passwordHash = await hashPassword(password);
    const user = await UserModel.create({ email, passwordHash });

    await issueTokens(res, user);
    res.status(201).json({ user: { id: user.id, email: user.email } });
  } catch (error) {
    handleRouteError(error, res, "Register");
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = loginSchema.parse(req.body);

    const user = await UserModel.findOne({ email });
    if (!user || !(await comparePassword(password, user.passwordHash))) {
      throw new AppError(401, "Invalid email or password.");
    }

    await issueTokens(res, user);
    res.json({ user: { id: user.id, email: user.email } });
  } catch (error) {
    handleRouteError(error, res, "Login");
  }
});

router.post("/refresh", async (req, res) => {
  try {
    const token: unknown = req.cookies?.[REFRESH_TOKEN_COOKIE];
    if (typeof token !== "string") {
      throw new AppError(401, "Not authenticated.");
    }

    const payload = verifyRefreshToken(token);
    const user = await UserModel.findById(payload.sub);
    if (!user || user.refreshTokenHash !== hashToken(token)) {
      throw new AppError(401, "Session expired. Please log in again.");
    }

    await issueTokens(res, user);
    res.json({ user: { id: user.id, email: user.email } });
  } catch (error) {
    clearAuthCookies(res);
    if (error instanceof AppError) {
      res.status(error.status).json({ message: error.message });
      return;
    }
    // Includes jsonwebtoken's own verify errors (expired/malformed token) —
    // an expected outcome here, not a server bug, so no console.error/500.
    res.status(401).json({ message: "Session expired. Please log in again." });
  }
});

router.post("/logout", async (req, res) => {
  try {
    const token: unknown = req.cookies?.[REFRESH_TOKEN_COOKIE];
    if (typeof token === "string") {
      try {
        const payload = verifyRefreshToken(token);
        await UserModel.findByIdAndUpdate(payload.sub, { refreshTokenHash: null });
      } catch {
        // Token already invalid/expired — nothing to revoke, still clear the cookies below.
      }
    }
    clearAuthCookies(res);
    res.status(204).send();
  } catch (error) {
    handleRouteError(error, res, "Logout");
  }
});

router.get("/me", requireAuth, async (req, res) => {
  try {
    const user = await UserModel.findById((req as AuthedRequest).userId);
    if (!user) {
      throw new AppError(401, "Not authenticated.");
    }
    res.json({ user: { id: user.id, email: user.email } });
  } catch (error) {
    handleRouteError(error, res, "Fetching current user");
  }
});

export default router;
