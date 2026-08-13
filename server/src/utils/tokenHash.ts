import { createHash } from "node:crypto";

// Refresh tokens are already high-entropy, so a fast hash is enough (unlike passwords, no need for bcrypt).
export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}
