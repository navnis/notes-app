# Notes App

**Live:** [https://notes.techiepeppers.com](https://notes.techiepeppers.com)

A notes app — create, edit, tag, search, favorite, pin, and organize notes, with your own account so your notes are yours. React/TypeScript frontend, Express/TypeScript backend, MongoDB for storage. Also shows an offline-detected banner and disables editing while offline, and supports a handful of keyboard shortcuts (Ctrl+N, /, Ctrl+P) with a shortcuts modal.

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

## Stack

**Frontend** — React + TypeScript on Vite, Tailwind, Jotai (client state), TanStack Query (server data), react-router, Markdown content.

**Backend** — Node + Express + TypeScript, MongoDB Atlas, zod validation.

**Auth** — email + password, httpOnly cookies, rotating refresh tokens, per-user data scoping.

**Deploy** — frontend on Vercel, backend on Render, MongoDB Atlas.

## How it's organized

```
client/   React + TS — Vite, Tailwind, Jotai, TanStack Query, react-router
server/   Express + TS — Mongoose/MongoDB, zod validation, JWT auth
shared/   @notes/shared — types both sides import, so they can't drift apart
```

Client code is split by responsibility, not feature: `api/` (typed fetch calls), `hooks/` (React layer), `store/` (Jotai atoms), `components/` (reusable, presentational), `notes/`/`auth/` (feature folders).

Search, tag filtering, sorting, and pagination happen server-side. Autosave debounces title/content; tags, favorites, and pins save immediately.

## Trade-offs

- Cookies over a bearer token.
- Mongo over SQLite.
- Tags are plain strings on the note, not a separate collection.
- The note list ships full content, not a trimmed preview.

## Testing

Vitest on both sides. Client: React Testing Library, a test file per component/hook/page. Server: pure logic only (validation, hashing, JWT, query parsing) — no route integration tests; routes were verified by hand with `curl`.

## What's left

- No forgot-password flow.
- No conflict handling across devices/tabs.
- Trash/soft-delete, export, version history, dark mode, and E2E tests are still open.
