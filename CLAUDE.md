# Notes App — instructions for Claude

A take-home notes app: `client/` (React + TS + Vite), `server/` (Express + TS + Mongoose/MongoDB), `shared/` (`@notes/shared`, types used by both). npm workspaces — one `npm install` at the repo root covers everything, never per-workspace.

## Git — read this before touching git at all

- **The user runs every `git commit`/`git push`/history-rewrite themselves. Never run these.** Stage files and describe the change if asked; the user writes the commit message and executes the commit. This holds even in a permission mode where tool calls don't prompt for approval — that's about not tapping "yes" on file edits, not a change to who runs git.
- Real, incremental history: small single-concern commits, never one squashed commit at the end. Work happens on feature branches, never directly on `master`/`main`.
- Commit messages are bare subject lines: no conventional-commit prefix, no body, no `Co-Authored-By` trailer. If asked for a suggested message, give a one-liner in that style.
- An earlier "yes, proceed" does not carry forward to the next commit or the next piece of work — each needs its own fresh go-ahead. Merely announcing what's next is not authorization to start building it.

## Working style

- **Ask before building broad or multi-file work.** A task-level go-ahead ("let's work on the notes APIs") is not permission to autonomously design and land an entire feature end-to-end. For anything with real breadth — new dependencies, new architectural layers, many new files — pause after forming a plan (or after the first meaningfully-sized slice) and check in. Small, contained edits within an already-agreed shape don't need this.
- When a genuinely ambiguous architectural fork comes up, stop and lay out the real trade-off honestly (including if the current approach might be over-engineered), then ask via a concrete question rather than silently defending or silently switching.
- Stay scoped to what's actually being discussed. Applying an already-confirmed stack decision to the feature being built now is in scope; pulling in unrelated future work early is not.
- Don't assert a fix works from reading the source alone when a visual/runtime claim is on the line and the user pushes back — verify against the running app before repeating the claim. That said, don't reach for browser-automation tooling (Playwright, etc.) unprompted — the dev server already runs in the background and the user reviews new UI themselves via `npm run dev`. Only install screenshot/automation tooling if explicitly asked.
- Narrate briefly what's changing and why as work progresses — the user wants to learn from the build, not just receive a finished diff.

## Tests — update them alongside code, every time

- **Any code change must be reflected in that file's test file in the same pass** — not as a follow-up, not only when asked. If a component/hook/route's behavior changes, its `*.test.ts(x)` changes too, in the same commit-worthy chunk of work.
- Every component gets its own test file as part of being built — treat "component is done" as including its test, the same way it includes lint/typecheck passing.
- Before considering any task finished, run the full test suite for whichever workspace(s) changed (`npm test --workspace=client` / `--workspace=server`) and confirm everything passes — not just the file(s) touched.
- Server-side tests are deliberately scoped to **pure logic only** — validation schemas, hashing, JWT, query-parsing helpers like `parseListNotesQuery`. Route handlers are *not* unit tested by design (Supertest/mongodb-memory-server integration tests were explicitly ruled out as too unpredictable time-wise); routes get verified by manual `curl` smoke tests against the real dev database instead. Don't add route-level test files expecting to hit this convention — it's a discussed trade-off, not a gap to close reflexively.
- A short-lived `tsx` script used to smoke-test/clean up test data **must live inside `server/`**, not `/tmp` or a scratch directory — module resolution for `node_modules` breaks outside the workspace.

## Comments

Keep in-code comments short: **one line in most cases, two lines as a hard maximum, never three or more** — for both `//` runs and `/* */`/JSDoc blocks, in both `client/` and `server/`. When a comment wants to explain more than fits in two lines, compress to the single most important "why" and drop the rest.

## Frontend conventions

- **Three-folder split by responsibility, not by feature**: `client/src/api/` — typed `fetch` wrappers only, one file per backend resource, no React. `client/src/hooks/` — the React-facing layer (`useAuth` is plain async functions by design, not react-query; `useNotes`/`useTags` are react-query hooks). `client/src/store/` — Jotai atoms, one file per domain, never colocated inside a feature folder.
- `client/src/components/` is reusable, presentational-only primitives — no API calls, all data via props. Feature-specific components that own data-fetching/state live in their own `client/src/<feature>/` folder (`notes/`, `auth/`).
- Each component gets its own folder: `Component.tsx`, `index.ts`, `Component.test.tsx`, plus `Component.constants.ts`/`Component.utils.ts` for standalone data/logic that doesn't need the component's live refs, and `Component.variants.ts` for `class-variance-authority` (co-exporting a plain function from the component file breaks Fast Refresh).
- There's a top-level barrel (`client/src/components/index.ts`) — components are imported via `@/components`. This is a known, deliberately accepted trade-off against tree-shaking; don't "fix" it unilaterally.
- Apply `useCallback`/`useMemo`/`memo` where they're actually warranted, not indiscriminately.
- A component that displays live save/sync status owns the mutation that drives it, rather than the parent orchestrating it and passing a boolean down.
- Every component must be responsive from the start — don't wait to be asked as a follow-up pass.
- Default to hand-authoring against native HTML/CSS; only reach for a Radix package directly (never a component-generator CLI) when a genuinely complex, hard-to-get-right-by-hand case shows up, and flag that explicitly rather than deciding unilaterally.

## Backend conventions

- Every route: `requireAuth` first, then the Mongoose query itself scoped by owner (`findOne({ _id, userId })`, never a bare `findById`/`find` without a userId filter). A lookup that comes back empty returns the same generic 404 whether the resource doesn't exist or belongs to another user — never a 403, so a request can't be used to probe another user's IDs.
- Each route handler wraps its body in an explicit `try/catch`; `AppError` is thrown for expected conditions, and the shared `handleRouteError(error, res, context)` helper handles zod errors → 400, `AppError` → its own status, anything else → log + generic 500.
- **Raw Mongoose `aggregate()` pipelines skip auto-casting** — unlike `find()`/`findOne()`, a `$match` against an `ObjectId`-typed field needs an explicit `new Types.ObjectId(...)` cast, or it silently matches nothing.
- When clamping/defaulting a numeric query param, check `=== undefined` explicitly rather than `Number(x) || fallback` — the latter conflates an explicit `0` with "absent."

## Platform quirks worth not rediscovering

- **`Cmd+N` is reserved by the browser itself on Mac** (opens a new browser window) and never reaches page JavaScript — `event.preventDefault()` cannot intercept it. Any "new note"/similar shortcut should listen for `Ctrl+N` only (works on both Mac and Windows/Linux in-browser) and the displayed shortcut badge should say `Ctrl+N`, not `⌘N`.
- macOS's AirPlay Receiver squats on port 5000 by default, intercepting requests silently without `EADDRINUSE` — this project's server defaults to port `5001` instead.
- A `useEffect` that sets up a browser API (e.g. `IntersectionObserver`) using a callback prop should read that callback through a `ref` updated every render, rather than depending on the callback directly — react-query mutation/query functions (like `fetchNextPage`) aren't guaranteed to keep a stable reference across unrelated parent re-renders, and depending on them directly can tear down and re-trigger the effect unexpectedly.
