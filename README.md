# Book Nest

You have a huge collection of eBooks scattered across your hard drive — multiple folders, different formats, different places and folder trees. Book Nest solves two main problems: it indexes those books into a searchable, consistent library, and it provides a friendly API + React frontend to manage and browse your collection.

AI-powered, agentic indexing
Book Nest uses agentic indexing powered by Gemini AI during the indexing process. Agents analyze filenames and file contents to recognize titles, authors and series, fetch cover images and metadata, and normalize entries in the database. This AI-driven step makes indexing resilient across mixed formats and messy filenames.

What Book Nest gives you
- Index and normalize your ebooks (filename hashing, AI metadata resolution, organized output folders, format conversion via Calibre).
- An AI-powered REST API and a React frontend to search, view, download and manage books, authors and series.

Quick install & run
1. Prerequisites: Node.js >= 20 and Calibre (ebook-convert) — Calibre is required for format conversion.
2. Install and set up the repo:

```bash
npm install
cp .env.example .env
```

3. Development (runs backend and frontend):

```bash
npm run dev
```

4. Build / production:

```bash
npm run build
npm start
```

5. Tests:

```bash
npm test
```

Tech stack (short)
- Backend: Node.js + Express, organized as a workspace under `backend/` — serves the API, indexing worker and file endpoints.
- Database: lightweight SQLite DB stored under `data/` by default (configurable via `.env`).
- Frontend: Node + React (Vite) in `frontend/` — a UI that talks to the backend API.

Important endpoints
- API root: `GET /api/*` (various resources)
- Books: `GET /api/books`, `GET /api/books/:id`, `GET /api/books/search?q=...`
- Indexing: `POST /api/indexing/start`, `GET /api/indexing/status`
- Files: `GET /api/files/books/:bookId/download/:format` (download converted/original files)
- Swagger UI (full API docs): `GET /api-docs` and JSON at `/api-docs/swagger.json` — visit that for a comprehensive list of endpoints.

Configuration notes

- Copy `.env.example` to `.env` and set values appropriate for your machine and environment. After editing, restart the server so changes take effect.
- The example `.env` contains commonly used settings. Important values you should review and set:

```env
# Server
PORT=3000
NODE_ENV=development

# API URL (used by frontend)
VITE_API_URL=http://localhost:3000

# CORS (comma-separated origins)
CORS_ORIGINS=http://localhost:5173,http://localhost:3000

# Logging
LOG_LEVEL=DEVELOPMENT

# Paths
SOURCE_PATH=./source
EBOOKS_PATH=./ebooks
LOGS_PATH=./logs
DB_PATH=./data/booknest.db
PROCESSED_PATH=./source/processed

# Gemini AI
GEMINI_API_KEY=your-gemini-api-key
GEMINI_MODEL=gemini-2.5-flash-lite
BATCH_SIZE=25
AGENT_TIMEOUT=60000

# Retry
MAX_RETRIES=5
RETRY_BASE_DELAY=10000

# Calibre
CALIBRE_PATH=/usr/bin/ebook-convert
```

Per-variable explanations

- `PORT` — TCP port the backend server listens on. Default `3000`. Use a different port if 3000 is in use or when running multiple services on one host (e.g., `PORT=8080`).
- `NODE_ENV` — runtime environment. Use `development` while developing and `production` in deployed environments; some logging and error-handling change based on this.
- `VITE_API_URL` — frontend base URL for API requests (used by the React/Vite app). When running locally use `http://localhost:3000`; in production set to your public API URL.
- `CORS_ORIGINS` — comma-separated list of allowed origins for cross-origin requests (frontend dev port(s) and any other web UI). Example: `http://localhost:5173,http://localhost:3000`.
- `LOG_LEVEL` — verbosity for application logs. Common values: `DEBUG`, `INFO`, `WARN`, `ERROR`, `DEVELOPMENT`. Pick higher verbosity during development and lower in production.
- `SOURCE_PATH` — folder where you place raw/unorganized ebooks to be indexed (relative or absolute path). Default `./source`.
- `EBOOKS_PATH` — destination folder where Book Nest will organize processed ebooks (authors/series subfolders). Default `./ebooks`.
- `LOGS_PATH` — folder for application and indexing logs. Default `./logs`.
- `DB_PATH` — path to the SQLite database file. Default `./data/booknest.db`. Make sure the containing directory exists and is writable by the app.
- `PROCESSED_PATH` — optional path inside/near `SOURCE_PATH` where files moved after successful processing (default `./source/processed`).
- `GEMINI_API_KEY` — API key used by the Gemini AI agents (sensitive). Keep secret and do NOT commit into git. If you don't have a key you can still run the app but indexing that relies on Gemini will fail.
- `GEMINI_MODEL` — the AI model identifier used for agentic indexing (default `gemini-2.5-flash-lite`). Change only if you have other supported models.
- `BATCH_SIZE` — how many books are processed per indexing batch. Default `25`. Lower for less resource usage or to reduce per-batch failure cost; increase for throughput if you have a robust machine.
- `AGENT_TIMEOUT` — time (milliseconds) the AI agent calls can run before timing out (default `60000` = 60s). Raise for slower networks or large files.
- `MAX_RETRIES` — number of times the system retries transient failures (e.g., network errors when calling AI services). Default `5`.
- `RETRY_BASE_DELAY` — base delay (ms) used for exponential backoff between retries. Default `10000` (10s). Combined with `MAX_RETRIES` this controls retry behavior.
- `CALIBRE_PATH` — absolute path to Calibre's `ebook-convert` binary used for format conversion (e.g., `ebook -> mobi/pdf`). This tool is required if you want Book Nest to convert file formats. On many systems it is `/usr/bin/ebook-convert` but verify on your machine (run `which ebook-convert`).

Notes & suggestions

- Use absolute paths for `CALIBRE_PATH`, `DB_PATH`, and other file paths in production to avoid surprises.
- Keep `GEMINI_API_KEY` out of source control. Use environment management or secret stores for deployments.
- For initial testing set `BATCH_SIZE=5` to iterate quickly and avoid long running indexing runs.
- After any `.env` change restart the backend. In dev the workspace `npm run dev` may hot-reload; otherwise restart the server.

Project layout (high level)

```
./
├─ backend/        # Express API, indexing worker, swagger & runtime configs
│  ├─ source/      # Drop raw ebooks here for indexing (backend manages this)
│  ├─ ebooks/      # Organized library output (created/managed by backend)
│  ├─ data/        # SQLite DB (booknest.db) and DB files
│  └─ logs/        # Application and indexing logs
├─ frontend/       # React frontend (Vite)
└─ docs/           # Design notes, plans and documentation
```

Verify your environment (quick checklist)

- Node.js >= 20: `node -v`
- Calibre installed and `ebook-convert` available: `which ebook-convert` or `ebook-convert --version` (required for format conversion)
- Writable directories: ensure `backend/source`, `backend/ebooks`, `backend/data`, and `backend/logs` are writable by the running user
- `.env` present and configured: `cp .env.example .env` and set `GEMINI_API_KEY`, `CALIBRE_PATH`, `DB_PATH` as needed
- Start the server and visit the Swagger UI: `http://localhost:3000/api-docs`

Calibre installation (common platforms)

- macOS (Homebrew): `brew install --cask calibre` and verify `which ebook-convert`
- Debian/Ubuntu: install Calibre from the official package or download from https://calibre-ebook.com; verify `ebook-convert` is on your PATH
- Windows: use the Calibre installer and set `CALIBRE_PATH` in `.env` to the absolute path of `ebook-convert.exe`

Run backend or frontend individually

- Backend only: `npm run dev:backend` (or from `backend/` run `npm run dev` in that workspace)
- Frontend only: `npm run dev:frontend` (or from `frontend/` run `npm run dev`)

Database and migrations

- The project uses SQLite by default. On first run the application will create the database file at `DB_PATH` if it doesn't exist. Ensure the directory exists and is writable.
- If you use another DB backend or migrations, document steps here. (Currently no manual migration steps are required.)

Quick API examples (curl)

- Start indexing: `curl -X POST http://localhost:3000/api/indexing/start`
- Indexing status: `curl http://localhost:3000/api/indexing/status`
- Search books: `curl "http://localhost:3000/api/books/search?q=term"`

Swagger & generating client types

- Open the interactive docs at `http://localhost:3000/api-docs`.
- Frontend helper: the `frontend/package.json` contains a `generate:api` script that calls `openapi-typescript` against `http://localhost:3000/api-docs/swagger.json` to generate TypeScript types. Run it after starting the backend if you change the API.

Troubleshooting & tips

- If Calibre conversions fail, verify `CALIBRE_PATH` and try running `ebook-convert` manually on a sample file.
- If AI calls time out, increase `AGENT_TIMEOUT` or lower `BATCH_SIZE` while debugging.
- Permission errors: ensure the backend user can read/write the configured paths (`SOURCE_PATH`, `EBOOKS_PATH`, `DB_PATH`, `LOGS_PATH`).

Production & security notes

- Do NOT commit `.env` or any secrets. Use secret stores or environment mechanisms in production.
- The default API is unauthenticated (if that is the case for your deployment). If you expose the server publicly, add authentication, CORS restrictions, and place the app behind a reverse proxy (nginx) with TLS.
- Use absolute paths for persistence (`DB_PATH`, `CALIBRE_PATH`) and back up the SQLite file regularly.

Contributing & CI checklist

- Run tests and lint locally: `npm test` and `npm run lint` (workspace aware). Add new tests for new features.
- If you change API routes or schemas, regenerate the API types used by the frontend (`npm run --workspace=@book-nest/frontend generate:api`).
- PR checklist: run tests, lint, and verify Swagger UI still loads.

Known limitations

- Indexing quality depends on AI model quality — metadata mismatches can occur and should be validated by users.
- Large libraries will take time; consider running indexing on a machine with enough CPU/RAM and tune `BATCH_SIZE`.

License: MIT
