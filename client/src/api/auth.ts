import { apiFetch } from "@/lib/api";

export interface AuthUser {
  id: string;
  email: string;
}

export interface AuthResponse {
  user: AuthUser;
}

export function registerRequest(
  email: string,
  password: string,
  confirmPassword: string,
): Promise<AuthResponse> {
  return apiFetch<AuthResponse>("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({ email, password, confirmPassword }),
  });
}

export function loginRequest(email: string, password: string): Promise<AuthResponse> {
  return apiFetch<AuthResponse>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export function logoutRequest(): Promise<void> {
  return apiFetch<void>("/api/auth/logout", { method: "POST" });
}

// Checks the still-set access-token cookie and returns the current user —
// the first thing tried on app load, before falling back to refreshRequest.
export function meRequest(): Promise<AuthResponse> {
  return apiFetch<AuthResponse>("/api/auth/me", { method: "GET" });
}

// Exchanges the httpOnly refresh-token cookie (sent automatically) for a
// fresh access-token cookie — the fallback when meRequest fails on app load.
export function refreshRequest(): Promise<AuthResponse> {
  return apiFetch<AuthResponse>("/api/auth/refresh", { method: "POST" });
}
