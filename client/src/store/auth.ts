import { atom } from "jotai";

export interface AuthSession {
  email: string;
}

// Holds the logged-in session (null = logged out) — tokens live in httpOnly cookies, not here.
export const authAtom = atom<AuthSession | null>(null);

// True once the app-load session-restore attempt has finished, either way
// — lets PrivateRoute wait for that before deciding whether to redirect.
export const sessionRestoredAtom = atom<boolean>(false);
