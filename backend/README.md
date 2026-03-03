# Backend — Book Nest

This document describes the backend component of Book Nest. It's aimed at developers who will run, maintain or extend the API and the indexing worker.

Overview
- The backend has two main responsibilities:
  1. API: an Express-based REST API exposing books, authors, series, files and indexing endpoints (see `/api/*`).
  2. Indexing: a file crawler + batch processor that uses AI agents to resolve names, metadata and images, organize files and optionally convert formats via Calibre. Indexing is triggered and monitored via the API.

Quick start
- From the repo root (workspaces are configured):

```bash
# Install dependencies
npm install

# Start the backend in dev mode (with tsx watch)
npm run dev:backend

# Or from backend/ directly
cd backend
npm run dev
```

- Build / production

```bash
cd backend
npm run build
npm start
```

Verify your environment (quick checklist)

- Node.js >= 20: `node -v` — make sure the version meets the requirement.
- Calibre installed and `ebook-convert` available: `which ebook-convert` or `ebook-convert --version` (required for format conversion).
- Writable directories: ensure `backend/source`, `backend/ebooks`, `backend/data`, and `backend/logs` are writable by the running user.
- `.env` present and configured: `cp .env.example .env` and set `GEMINI_API_KEY`, `CALIBRE_PATH`, `DB_PATH` as needed.

Calibre installation (common platforms)

- macOS (Homebrew): `brew install --cask calibre` and verify with `which ebook-convert`.
- Debian/Ubuntu: install Calibre from the official site or your distro package; verify `ebook-convert` is on your PATH.
- Windows: install Calibre via the official installer and set `CALIBRE_PATH` in `.env` to the absolute path of `ebook-convert.exe` (e.g. `C:\\Program Files\\Calibre2\\ebook-convert.exe`).

Run backend or frontend individually

- Backend only: from repo root `npm run dev:backend` or from `backend/` run `npm run dev`.
- Frontend only: from repo root `npm run dev:frontend` or from `frontend/` run `npm run dev`.

Key scripts (backend/package.json)
- `dev` – `tsx watch src/index.ts` (dev server with hot reload)
- `build` – `tsc` (compile TypeScript)
- `start` – `node dist/index.js` (run compiled app)
- `test` / `test:unit` / `test:integration` – run Jest tests
- `lint` / `format` – code style checks

Environment
- Backend reads environment from the root `.env` (copy `.env.example` to `.env`). Important backend-related envs:
  - `SOURCE_PATH` (default `./source`) — raw ebooks to be indexed (under `backend/`)
  - `EBOOKS_PATH` (default `./ebooks`) — organized library output
  - `DB_PATH` — SQLite file path (ensure directory exists & writable)
  - `CALIBRE_PATH` — path to `ebook-convert` for format conversion (required for conversions)
  - `GEMINI_API_KEY` / `GEMINI_MODEL` — AI credentials used by indexing agents

Where files live
- All runtime data lives under `backend/` by default (see `backend/source`, `backend/ebooks`, `backend/data`, `backend/logs`). Ensure the backend process can read/write those directories.

Important modules and architecture
- `src/index.ts` – app entry, Express setup, swagger docs mount and route composition.
- `src/api/` – Express routes and controllers (books, authors, series, files, indexing, search, overview).
- `src/indexer/` – indexing surface: `crawler`, `fileOrganizer`, `batchProcessor`, and `agents` (name, image, metadata).
- `src/services/` – implementations for AI (`aiService.ts`), image search, Calibre conversions and helpers.
- `src/db/` – repository layer for books, authors, series, files and batch records (uses better-sqlite3).
- `src/utils/` – logger, hasher, slugify, retry, and path utilities.

How indexing works (5 steps)

1. Trigger & batch setup
- Indexing is started via `POST /api/indexing/start` (or resumed automatically if a previous batch failed). The system uses the crawler to scan `SOURCE_PATH` for supported ebook files, detects formats, and computes SHA‑256 hashes. Files already present in the DB (matching sha256) are filtered out so only new content is processed.

2. Name resolution
- The name resolver agent analyzes filenames and file contents to extract and normalize author, title and series information. It returns normalized names and slugs which are used as canonical identifiers and to drive folder layout and DB keys.

3. Images & persistence
- The image resolver agent fetches suitable author and book cover images. The backend then persists authors, series, books and file records into the SQLite DB (batch-tracked). Source files are copied into the organized library under `EBOOKS_PATH/{author}/{book}/`. Successfully processed source files are moved to the configured `PROCESSED_PATH`. Batch state and item status are recorded so processing can be resumed or inspected.

4. Metadata enrichment
- The metadata resolver agent enriches persisted records with descriptions, language hints and other metadata (non-blocking). Failures in enrichment are logged but do not abort the batch; enrichment can be re-run or corrected later.

5. Format conversion
- When configured and Calibre is available, the file organizer invokes `calibreService` to convert the best source format into additional target formats. Successful conversions are added as new file records in the DB; conversion failures are logged and treated as non-fatal.

Notes
- Processing is done in batches (configurable via `BATCH_SIZE`). Each batch is tracked in the DB with per-item statuses so the system can resume failed batches and provide progress via the `GET /api/indexing/status` endpoint.

Swagger & API docs
- Interactive docs are available at `/api-docs` when the backend is running. The JSON spec is at `/api-docs/swagger.json`.
- If you change API routes/schemas, regenerate the frontend types using the frontend `generate:api` script against that JSON.

Testing
- Unit tests: `npm run test:unit` (backend workspace)
- Integration tests: `npm run test:integration` (these start a test server and exercise routes/indexing flows)
- The repository includes Jest config and test helpers under `tests/`.

Developer tips
- To debug indexing locally, lower `BATCH_SIZE` in `.env` and use `AGENT_TIMEOUT` to avoid timeouts while inspecting.
- Check logs in `backend/logs` for batch histories (`batch-*.log`) and `app.log` for runtime messages.
- Keep `GEMINI_API_KEY` secret — do not commit `.env` to git.
- When adding new agents, add tests under `tests/unit` and integration scenarios in `tests/integration`.

Troubleshooting
- Calibre not found: verify `CALIBRE_PATH` and run `which ebook-convert`.
- DB permission/creation issues: ensure `DB_PATH` parent directory exists and is writable.
- If Swagger fails to load, check the runtime logs for swagger compilation errors.

Further reading
- See `backend/src/indexer` for implementation details of the crawler and agents.
- See `backend/src/services/aiService.ts` for how AI calls are wrapped and retried.

License: MIT
