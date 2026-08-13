# Notes App

A notes app — create, edit, tag, search, and organize notes, with your own account so your notes are yours. Built as a take-home project: React/TypeScript on the frontend, Express/TypeScript on the backend, MongoDB for storage.

## Getting it running

You'll need Node 20+ and a MongoDB connection (local, or a free Atlas cluster works fine).

```bash
# one install at the root covers client, server, and the shared package (npm workspaces)
npm install

cp server/.env.example server/.env
cp client/.env.example client/.env
```

Fill in `server/.env`:
```
PORT=5001
MONGODB_URI=mongodb://localhost:27017/notes-app
CLIENT_URL=http://localhost:5173
JWT_ACCESS_SECRET=change-me
JWT_REFRESH_SECRET=change-me-too
```

And `client/.env`:
```
VITE_API_URL=http://localhost:5001
```

Then, in two terminals:
```bash
npm run dev --workspace=server   # http://localhost:5001
npm run dev --workspace=client   # http://localhost:5173
```

Tests:
```bash
npm test --workspace=server
npm test --workspace=client
```

Lint (one config for the whole monorepo):
```bash
npm run lint
```

## Tech stack, and why

**Frontend:** React + TypeScript on Vite, styled with **Tailwind** — utility classes directly in the component, no separate stylesheet to keep in sync. State is split by kind: **Jotai** for small bits of client/UI state (the auth session, the selected note, active filters), and **TanStack Query** for anything that comes from the server (notes, tags). I leaned on TanStack Query specifically because the brief asks for optimistic updates with rollback on failure, and that's basically what it's built for — I'd have had to hand-roll a worse version of it otherwise. Routing is **react-router**, mainly so a single note gets a real, shareable URL (`/notes/:id`) instead of living only in in-memory state.

For content, I went with **Markdown** — a plain textarea plus a toggleable rendered preview — rather than a rich text editor. I did consider something like Tiptap, but for the time I had, a full rich-text setup felt like a lot of surface area (schema, toolbar, serialization) for a feature that markdown already covers reasonably well.

**Backend:** Node + Express + TypeScript, with **MongoDB Atlas** for storage rather than SQLite or a flat file, even though the brief says either is fine. The reason is purely about where this ends up living: I want to actually deploy this, and most free hosting tiers wipe the filesystem on every redeploy, which would nuke a SQLite file or JSON store. Atlas's free tier persists properly, so it was the safer call for something meant to stay live.

Validation is **zod**, on the server, re-checking everything the client already validates — client-side checks are just UX, they can't be trusted as the real gate.

**Testing:** Vitest on both sides. More on the actual approach below.

## How it's put together

```
client/   React + TS — Vite, Tailwind, Jotai, TanStack Query, react-router
server/   Express + TS — Mongoose/MongoDB, zod validation, JWT auth
shared/   @notes/shared — types both sides import, so they can't quietly drift apart
```

On the client, I split things into three folders by responsibility rather than by feature, because that made it much easier to find things as the app grew:
- `api/` — just typed `fetch` calls, one file per backend resource. No React in here at all.
- `hooks/` — the React-facing layer on top of `api/`. `useAuth` is plain async functions; `useNotes`/`useTags` are TanStack Query hooks.
- `store/` — Jotai atoms, one file per domain of state.
- `components/` — reusable, presentational-only pieces (Button, Input, Modal, Tag, Select, …), each with its own folder and its own test file.
- `notes/` and `auth/` — feature folders that actually own data-fetching and behavior (Sidebar, NoteEditor, NoteList, the logout button, etc.).

**Auth:** email + password. Both the access token (short-lived) and refresh token (longer-lived) sit in httpOnly cookies rather than anywhere JavaScript can touch them. Refresh tokens rotate on every use and are stored as a hash, not plaintext, so a leaked one can be noticed and invalidated. Every notes/tags request has to carry a valid session, and every database query is scoped to that user — never just "find by id" — so there's no way to read or edit someone else's note. If a note doesn't exist *or* it belongs to another user, the API responds with the same generic 404 either way, so you can't use the API to fish for whether a given ID exists under someone else's account.

**Notes list:** search (title + content), tag filtering, and sorting all happen server-side, along with pagination. The client fetches it via `useInfiniteQuery` and loads more as you scroll, using an `IntersectionObserver` rather than a "load more" button.

**Autosave:** the editor owns its own save state and debounces title/content edits (~800ms) before saving, instead of the parent page managing that. Tags save immediately on add/remove with no debounce, since adding a tag is already one complete action, not something you're still mid-typing.

## Trade-offs worth knowing about

- **Cookies over a bearer token.** I originally built this with the client reading the access token and attaching it to requests manually, which meant persisting it somewhere across reloads and decoding its expiry myself. Once the refresh token was already sitting in an httpOnly cookie for security reasons anyway, doing the same for the access token let me delete a fair amount of that client-side complexity. The trade-off is relying on `SameSite=Lax` and CORS config for CSRF protection instead of a token model — I think it's the right call here, but it's worth naming as a real choice, not a default.
- **Mongo over SQLite.** More setup than the brief needed, chosen purely so the app survives redeploys once it's actually hosted somewhere.
- **No `GET /notes/:id`.** The frontend never actually needs it — the list endpoint already returns full note content, and the editor gets a note as a prop rather than fetching it individually — so I didn't build it to avoid shipping dead code. That said, this is a real gap against the brief's documented API, and I've flagged it below rather than pretending it's not missing.
- **Tags are just strings on the note**, not a separate collection. The brief's own response shape (`tags: ["string"]`) points that way, and it sidesteps a join for something that's genuinely simple. `GET /tags` computes distinct names and counts on read.
- **Markdown over rich text**, as covered above — a simpler, lower-risk choice given the time available, and not a hard lock-in since content is just a string either way.

## How I tested this

- **Client:** Vitest + React Testing Library, with a test file alongside each component, hook, and page — covering rendering, interaction, and the auth/session flow.
- **Server:** Vitest, but scoped to pure logic only — validation schemas, password hashing, JWT signing/verifying, refresh-token hashing, and the query-parsing logic behind the notes list (search/sort/pagination has real branching worth testing directly). I deliberately skipped route-level integration tests (Supertest + an in-memory Mongo, or similar) — they felt like they'd cost more time than they'd save here. Instead, I smoke-tested the actual routes by hand with `curl` against a real dev database as I built them.
- The honest gap from that choice: **route handlers themselves have no automated test coverage.** It's a reasonable trade for the time box, but it's a real one, not something I'd claim otherwise.

## What's left / what I haven't done yet

Went through the brief line by line against what's actually built:

**Backend**
- [ ] `GET /notes/:id` isn't really implemented — there's a `GET /:id` in the router, but it's a leftover stub: no auth check, no ownership scoping, no input validation, no try/catch. It doesn't match how every other route in that file works and needs to either be fixed properly or removed.
- [ ] Error responses aren't fully consistent yet — most routes share one error-handling helper, but that same stub route returns a different shape.

**Frontend**
- [ ] Keyboard shortcuts — not built at all (new note, jump to search, delete, etc. all still mouse-only).
- [ ] Offline detection — not built. Nothing in the client currently checks `navigator.onLine` or reacts to connectivity loss.
- [ ] Loading/empty/error states exist for the main note list (a spinner, an empty-state component, error toasts), but I haven't done a full pass checking every view handles all four states consistently.

**Deliverables**
- [ ] Not deployed yet — no Vercel/Render/Railway config in the repo, nothing live. Runs locally only right now.
- [ ] This README didn't exist until now.
- [ ] Bonus features: only auth is done (and honestly that was treated as core, not a bonus, from early on). Soft delete/trash, export to Markdown/JSON, version history, dark mode, multi-device conflict handling, and E2E tests are all still open.

**Bonus features attempted:** authentication with user-specific notes, fully built — register, login, logout, session restore on reload, and every note scoped to its owner. Nothing else from the bonus list attempted yet.

## Known issues

- No forgot-password / reset flow — just register and login, on purpose.
- No conflict handling across devices/tabs — last write wins, no version check on update.
- `GET /notes/:id` is a stub with real bugs, not a finished endpoint (see above).
- Not deployed — local only for now.
