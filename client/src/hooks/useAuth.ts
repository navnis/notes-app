// Stub until real auth (backend + client state) exists. Swap the
// implementation here once that's built — nothing that consumes this
// hook should need to change.
//
// Temporarily true so the protected routes are reachable while we
// build/review components — flip back to false once real auth lands.
export function useAuth() {
  return { isAuthenticated: true };
}
