import { createHash } from "node:crypto";

// Refresh tokens are already high-entropy JWTs, so a fast hash is enough to
// keep a DB leak from handing out directly-usable tokens — no need for
// bcrypt's deliberately slow hashing here (that's for low-entropy passwords).
export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}
