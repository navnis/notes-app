import { Schema, model } from "mongoose";

export interface User {
  email: string;
  passwordHash: string;
  // Hash of the current valid refresh token, so a stolen/reused one can be
  // detected and revoked. null once logged out.
  refreshTokenHash: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<User>(
  {
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    passwordHash: { type: String, required: true },
    refreshTokenHash: { type: String, default: null },
  },
  { timestamps: true },
);

export const UserModel = model<User>("User", userSchema);
