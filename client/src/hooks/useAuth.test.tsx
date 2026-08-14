import { act, renderHook } from "@testing-library/react";
import { createStore, Provider } from "jotai";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { meRequest, refreshRequest } from "@/api/auth";
import { authAtom, sessionRestoredAtom } from "@/store/auth";
import { useAuth } from "./useAuth";

vi.mock("@/api/auth", () => ({
  loginRequest: vi.fn(),
  registerRequest: vi.fn(),
  logoutRequest: vi.fn(),
  meRequest: vi.fn(),
  refreshRequest: vi.fn(),
}));

const mockedMeRequest = vi.mocked(meRequest);
const mockedRefreshRequest = vi.mocked(refreshRequest);

function renderUseAuth() {
  const store = createStore();
  function wrapper({ children }: { children: ReactNode }) {
    return <Provider store={store}>{children}</Provider>;
  }
  const { result } = renderHook(() => useAuth(), { wrapper });
  return { store, result };
}

describe("useAuth restoreSession", () => {
  it("restores the session from a still-valid access-token cookie via /me, without falling back to /refresh", async () => {
    mockedMeRequest.mockResolvedValueOnce({ user: { id: "1", name: "Rahul", email: "user@example.com" } });
    const { store, result } = renderUseAuth();

    await act(async () => {
      await result.current.restoreSession();
    });

    expect(store.get(authAtom)).toEqual({ name: "Rahul", email: "user@example.com" });
    expect(store.get(sessionRestoredAtom)).toBe(true);
    expect(mockedRefreshRequest).not.toHaveBeenCalled();
  });

  it("falls back to /refresh when the access-token cookie is expired or missing", async () => {
    mockedMeRequest.mockRejectedValueOnce(new Error("no access token"));
    mockedRefreshRequest.mockResolvedValueOnce({
      user: { id: "1", name: "Rahul", email: "user@example.com" },
    });
    const { store, result } = renderUseAuth();

    await act(async () => {
      await result.current.restoreSession();
    });

    expect(store.get(authAtom)).toEqual({ name: "Rahul", email: "user@example.com" });
    expect(store.get(sessionRestoredAtom)).toBe(true);
  });

  it("stays logged out but still marks the session as restored when neither cookie is valid", async () => {
    mockedMeRequest.mockRejectedValueOnce(new Error("no access token"));
    mockedRefreshRequest.mockRejectedValueOnce(new Error("no refresh token"));
    const { store, result } = renderUseAuth();

    await act(async () => {
      await result.current.restoreSession();
    });

    expect(store.get(authAtom)).toBeNull();
    expect(store.get(sessionRestoredAtom)).toBe(true);
  });
});
