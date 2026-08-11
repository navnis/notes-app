// Stub until real auth (backend + client state) exists. Swap the
// implementation here once that's built — nothing that consumes this
// hook should need to change.
export function useAuth() {
  return { isAuthenticated: false };
}
