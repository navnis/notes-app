import { atom } from "jotai";

export interface AuthSession {
  email: string;
}

// Holds the logged-in session. null means logged out. Nothing sensitive
// lives here — both the access and refresh tokens are httpOnly cookies the
// browser manages on its own, invisible to (and untouched by) this code.
export const authAtom = atom<AuthSession | null>(null);

// True once the app-load session-restore attempt has finished, either way
// — lets PrivateRoute wait for that before deciding whether to redirect.
export const sessionRestoredAtom = atom<boolean>(false);
