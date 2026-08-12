// Test-only JWT secrets, so utils/jwt.ts's fail-fast env check passes
// without depending on a real .env file. A real .env (if loaded) wins.
process.env.JWT_ACCESS_SECRET ??= "test-access-secret";
process.env.JWT_REFRESH_SECRET ??= "test-refresh-secret";
