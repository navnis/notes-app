const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:5001";

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

// Paths that must never trigger a refresh-and-retry themselves, to avoid recursion/loops.
const NO_REFRESH_RETRY_PATHS = ["/api/auth/me", "/api/auth/refresh", "/api/auth/login", "/api/auth/register"];

// Dedupes concurrent 401s into a single /refresh call instead of firing one per failed request.
let refreshPromise: Promise<boolean> | null = null;

async function tryRefresh(): Promise<boolean> {
  refreshPromise ??= fetch(`${API_BASE_URL}/api/auth/refresh`, {
    method: "POST",
    credentials: "include",
  })
    .then((res) => res.ok)
    .catch(() => false)
    .finally(() => {
      refreshPromise = null;
    });
  return refreshPromise;
}

async function doFetch(path: string, options: RequestInit): Promise<Response> {
  try {
    return await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      credentials: "include",
      headers: { "Content-Type": "application/json", ...options.headers },
    });
  } catch {
    throw new ApiError(0, "Couldn't reach the server. Check your connection and try again.");
  }
}

// Sends our httpOnly auth cookies on every request and normalizes failures into a catchable ApiError.
// On a 401 (expired access token), silently refreshes once via the refresh-token cookie and retries.
export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  let response = await doFetch(path, options);

  if (response.status === 401 && !NO_REFRESH_RETRY_PATHS.includes(path)) {
    const refreshed = await tryRefresh();
    if (refreshed) response = await doFetch(path, options);
  }

  const body = await response.json().catch(() => null);

  if (!response.ok) {
    throw new ApiError(response.status, body?.message ?? "Something went wrong. Please try again.");
  }

  return body as T;
}
