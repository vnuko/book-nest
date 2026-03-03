# Backend README Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Create a concise, developer-focused `backend/README.md` that documents the backend architecture, how to run it, important files, and how indexing and the API interact.

**Architecture:** The backend is a Node.js (TypeScript) Express app. It has two main responsibilities: serving the REST API and performing indexing (crawler + agents + batch processor). The indexer is exposed/controlled via API endpoints.

**Tech Stack:** Node 20+, TypeScript, Express, better-sqlite3, jest for tests, swagger-jsdoc for API docs.

### Tasks

Task 1: Draft README content
- Files: Create `backend/README.md`
- Contents: short overview, two main parts (API, Indexer), run instructions, env note, important folders, key modules, testing, troubleshooting, and developer tips.

Task 2: Add quick commands
- Include exact commands: `npm run dev`, `npm run build`, `npm run test:unit`, `npm run test:integration`, `npm run lint`.

Task 3: Note env variables
- Reference top-level `.env.example` and highlight backend-specific keys (SOURCE_PATH, EBOOKS_PATH, CALIBRE_PATH, GEMINI_API_KEY, DB_PATH).

Task 4: Save plan and create README
- After review, create `backend/README.md` with drafted content.

### Verification
- Open `backend/README.md` and ensure it reflects the codebase structure under `backend/src/` and the indexer modules (`crawler`, `batchProcessor`, `agents`, `fileOrganizer`).
