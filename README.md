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

Next steps & tips
- Set your AI key in `.env` before running indexing (see `.env.example`).
- If you rely on format conversion, make sure `ebook-convert` from Calibre is installed and `CALIBRE_PATH` is correct.
- Visit `/api-docs` while the server is running to explore and test the API.

License: MIT
