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

Tech stack (short)
- Backend: Node.js + Express, organized as a workspace under `backend/` — serves the API, indexing worker and file endpoints.
- Database: lightweight SQLite DB stored under `data/` by default (configurable via `.env`).
- Frontend: Node + React (Vite) in `frontend/` — a simple UI that talks to the backend API.

Important endpoints
- API root: `GET /api/*` (various resources)
- Books: `GET /api/books`, `GET /api/books/:id`, `GET /api/books/search?q=...`
- Indexing: `POST /api/indexing/start`, `GET /api/indexing/status`
- Files: `GET /api/files/books/:bookId/download/:format` (download converted/original files)
- Swagger UI (full API docs): `GET /api-docs` and JSON at `/api-docs/swagger.json` — visit that for a comprehensive list of endpoints.

Quick install & run
1. Prerequisites: Node.js >= 20 and Calibre (ebook-convert) — Calibre is required for format conversion.
2. Clone the repo and install (root uses npm workspaces):

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
npm start    # starts the backend
```

5. Tests:

```bash
npm test
```

Configuration notes
- Copy `.env.example` to `.env` and set your values (server port, paths, AI key). The example contains keys such as `GEMINI_API_KEY` (used by the agentic indexing), `CALIBRE_PATH` (path to `ebook-convert`), `SOURCE_PATH`, and `DB_PATH`.
- Source files go into `source/` by default; processed/organized ebooks are placed under `ebooks/`.

Project layout (high level)

```
./
├─ backend/        # Express API, indexing worker, swagger config
├─ frontend/       # React frontend (Vite)
├─ source/         # Drop raw ebooks here for indexing
├─ ebooks/         # Organized library output
├─ data/           # SQLite DB (booknest.db)
└─ logs/           # Application logs and batch histories
```

Next steps & tips
- Set your AI key in `.env` before running indexing (see `.env.example`).
- If you rely on format conversion, make sure `ebook-convert` from Calibre is installed and `CALIBRE_PATH` is correct.
- Visit `/api-docs` while the server is running to explore and test the API.

If you want, I can also: 1) add a short contributing section, 2) generate a minimal quickstart script, or 3) update frontend README to match — tell me which one.

License: MIT
