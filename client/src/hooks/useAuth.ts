import { useCallback } from "react";
import { useAtom } from "jotai";
import { loginRequest, logoutRequest, meRequest, refreshRequest, registerRequest } from "@/api/auth";
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
    // Clear the local session immediately; the server-side cookie revoke happens best-effort in the background.
    setSession(null);
    logoutRequest().catch((error: unknown) => {
      console.error("Failed to revoke session on the server:", error);
      toast.error("Couldn't fully sign out on the server, but you're signed out here.");
    });
  }

  // Called once on app load: tries /me first (cheap), falls back to /refresh — neither succeeding is fine, not an error.
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
