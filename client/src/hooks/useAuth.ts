import { useCallback } from "react";
import { useAtom } from "jotai";
import { loginRequest, logoutRequest, meRequest, refreshRequest, registerRequest } from "@/auth/authApi";
import { toast } from "@/components";
import { ApiError } from "@/lib/api";
import { authAtom, sessionRestoredAtom } from "@/store/auth";

export function useAuth() {
  const [session, setSession] = useAtom(authAtom);
  const [isSessionRestored, setSessionRestored] = useAtom(sessionRestoredAtom);

  async function login(email: string, password: string) {
    try {
      const { user } = await loginRequest(email, password);
      setSession({ email: user.email });
    } catch (error) {
      throw error instanceof ApiError ? error : new Error("Something went wrong. Please try again.");
    }
  }

  async function register(email: string, password: string, confirmPassword: string) {
    try {
      const { user } = await registerRequest(email, password, confirmPassword);
      setSession({ email: user.email });
    } catch (error) {
      throw error instanceof ApiError ? error : new Error("Something went wrong. Please try again.");
    }
  }

  function logout() {
    // Clear the local session immediately rather than waiting on the
    // network — the user is logged out client-side either way. The request
    // just best-effort clears the httpOnly cookies server-side in the background.
    setSession(null);
    logoutRequest().catch((error: unknown) => {
      console.error("Failed to revoke session on the server:", error);
      toast.error("Couldn't fully sign out on the server, but you're signed out here.");
    });
  }

  // Called once on app load. Both tokens live in httpOnly cookies the
  // browser sends automatically — there's nothing for the client to check
  // locally, so this asks the server: first /me (cheap — valid only if the
  // access-token cookie is still good), and only if that fails, /refresh
  // (mints a new access-token cookie from the longer-lived refresh one).
  // Neither succeeding is an expected outcome for a logged-out visitor, not
  // an error — stays quiet either way.
  const restoreSession = useCallback(async () => {
    try {
      const { user } = await meRequest();
      setSession({ email: user.email });
    } catch {
      try {
        const { user } = await refreshRequest();
        setSession({ email: user.email });
      } catch {
        setSession(null);
      }
    } finally {
      setSessionRestored(true);
    }
  }, [setSession, setSessionRestored]);

  return {
    isAuthenticated: session !== null,
    isSessionRestored,
    email: session?.email ?? null,
    login,
    register,
    logout,
    restoreSession,
  };
}
