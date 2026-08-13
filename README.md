# Notes App

**Live:** [https://notes.techiepeppers.com](https://notes.techiepeppers.com)

A notes app — create, edit, tag, search, and organize notes, with your own account so your notes are yours. React/TypeScript frontend, Express/TypeScript backend, MongoDB for storage.

## Running it locally

Needs Node 20+ and a MongoDB connection (local or a free Atlas cluster).

```bash
npm install   # one install at the root covers client, server, and shared (npm workspaces)

cp server/.env.example server/.env
cp client/.env.example client/.env
```

Fill in `server/.env` (`PORT`, `MONGODB_URI`, `CLIENT_URL`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`) and `client/.env` (`VITE_API_URL`) — see the `.env.example` files for defaults.

```bash
npm run dev --workspace=server   # http://localhost:5001
npm run dev --workspace=client   # http://localhost:5173
```

Tests: `npm test --workspace=server` / `npm test --workspace=client`. Lint: `npm run lint`.

## Stack, and why

**Frontend** — React + TypeScript on Vite, **Tailwind** for styling. **Jotai** for small bits of client state (auth session, selected note, filters); **TanStack Query** for anything server-backed (notes, tags) — it gives optimistic updates with rollback basically for free, which the brief asks for directly. **react-router** so a note gets a real, shareable `/notes/:id` URL. Content is **Markdown** (textarea + toggleable preview) rather than rich text — simpler and lower-risk for the time I had, and not a hard lock-in since content is just a string either way.

**Backend** — Node + Express + TypeScript, **MongoDB Atlas** rather than SQLite/a flat file, chosen specifically because most free hosts wipe the filesystem on redeploy and Atlas doesn't. Validation is **zod** on the server, re-checking everything the client already checks — client-side validation is UX, not the real gate.

**Auth** — email + password, both tokens in httpOnly cookies (not `localStorage`/headers). Refresh tokens rotate on every use and are stored hashed. Every notes/tags query is scoped to the logged-in user, and a note that doesn't exist vs. belongs to someone else both return the same 404 — so the API can't be used to probe another user's note IDs.

**Deploy** — frontend on Vercel, backend on Render, MongoDB Atlas. They're on different domains, so cookies use `SameSite=None; Secure` in production (`Lax` only works same-site) — locally they stay `Lax` since dev runs same-site through `localhost`.

## How it's organized

```
client/   React + TS — Vite, Tailwind, Jotai, TanStack Query, react-router
server/   Express + TS — Mongoose/MongoDB, zod validation, JWT auth
shared/   @notes/shared — types both sides import, so they can't drift apart
```

Client code is split by responsibility, not feature: `api/` (typed fetch calls only, no React), `hooks/` (the React layer on top — `useAuth` is plain async functions, `useNotes`/`useTags` are TanStack Query hooks), `store/` (Jotai atoms), `components/` (reusable, presentational only), `notes/`/`auth/` (feature folders that own data-fetching and behavior).

Search, tag filtering, sorting, and pagination for the notes list all happen server-side. Autosave debounces title/content (~800ms) and is owned entirely by the editor component; tags save immediately on add/remove since each is already one complete action.

## Trade-offs

- **Cookies over a bearer token** — started header-based, switched once the refresh token was already an httpOnly cookie anyway; deleted a lot of client complexity in exchange for leaning on `SameSite`/CORS for CSRF protection instead of a token model.
- **Mongo over SQLite** — more setup than needed, worth it for persistence across redeploys.
- **Tags are plain strings on the note**, not a separate collection — matches the brief's own response shape and avoids a join for something simple.
- **The note list ships full content, not a trimmed preview** — fine at this data size, wouldn't scale forever. A natural next step, not done yet.

## Testing

Vitest on both sides. Client: React Testing Library, a test file per component/hook/page. Server: scoped to pure logic only — validation, hashing, JWT, the notes-list query parser — not full route integration tests (skipped Supertest/an in-memory Mongo as more setup than value here). Routes themselves were verified by hand with `curl` against a real dev database as I built them, so **route handlers have no automated coverage** — a real, known gap, not an oversight.

## What's left

- Keyboard shortcuts are partial — `Ctrl+N` (new note, not `⌘N` — that's reserved by the browser itself on Mac) and `/` (search) work; delete and a few other actions are still mouse-only.
- No offline detection (`navigator.onLine` or similar).
- No forgot-password flow — register and login only, on purpose.
- No conflict handling across devices/tabs — last write wins.
- Bonus features: only auth is done (treated as core from early on, not a bonus). Trash/soft-delete, export, version history, dark mode, and E2E tests are all still open.
