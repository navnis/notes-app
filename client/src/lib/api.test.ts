import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { apiFetch, ApiError } from "./api";

function jsonResponse(status: number, body: unknown) {
  return { status, ok: status >= 200 && status < 300, json: () => Promise.resolve(body) } as Response;
}

describe("apiFetch", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns the parsed body on success", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse(200, { ok: true }));
    await expect(apiFetch("/api/notes")).resolves.toEqual({ ok: true });
  });

  it("refreshes once and retries the original request after a 401", async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce(jsonResponse(401, { message: "Not authenticated." }))
      .mockResolvedValueOnce(jsonResponse(200, {}))
      .mockResolvedValueOnce(jsonResponse(200, { note: "created" }));

    await expect(apiFetch("/api/notes")).resolves.toEqual({ note: "created" });
    expect(fetch).toHaveBeenCalledTimes(3);
    expect(vi.mocked(fetch).mock.calls[1][0]).toContain("/api/auth/refresh");
  });

  it("throws without retrying when refresh itself also fails", async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce(jsonResponse(401, { message: "Not authenticated." }))
      .mockResolvedValueOnce(jsonResponse(401, {}));

    await expect(apiFetch("/api/notes")).rejects.toBeInstanceOf(ApiError);
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it("does not attempt a refresh-retry for the me/refresh/login/register endpoints themselves", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse(401, { message: "Invalid credentials." }));
    await expect(apiFetch("/api/auth/login")).rejects.toBeInstanceOf(ApiError);
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it("dedupes concurrent 401s into a single refresh call", async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce(jsonResponse(401, {}))
      .mockResolvedValueOnce(jsonResponse(401, {}))
      .mockResolvedValueOnce(jsonResponse(200, {}))
      .mockResolvedValueOnce(jsonResponse(200, { a: 1 }))
      .mockResolvedValueOnce(jsonResponse(200, { b: 1 }));

    const [a, b] = await Promise.all([apiFetch("/api/notes/a"), apiFetch("/api/notes/b")]);
    expect(a).toEqual({ a: 1 });
    expect(b).toEqual({ b: 1 });
    const refreshCalls = vi.mocked(fetch).mock.calls.filter((call) => String(call[0]).includes("/api/auth/refresh"));
    expect(refreshCalls).toHaveLength(1);
  });
});
