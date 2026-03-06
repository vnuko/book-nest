% BookNest Frontend

This is the React (Vite + TypeScript) frontend for Book Nest. It's a small, focused UI that talks to the backend REST API to browse, search and manage your ebook collection.

Quick start

1. Install dependencies:

```bash
npm install
```

2. Generate API types (backend must be running):

```bash
npm run generate:api
# generates `src/types/api.generated.ts` from the backend OpenAPI JSON
```

3. Start dev server:

```bash
npm run dev
```

Build / preview

```bash
npm run build
npm run preview
```

Scripts you will use

| Script | Purpose |
|--:|:--|
| `dev` | Start dev server (Vite) |
| `build` | Build production assets |
| `preview` | Serve a preview of the production build |
| `generate:api` | Fetch OpenAPI JSON and generate TypeScript types |
| `typecheck` | Run TypeScript compiler checks |
| `lint` / `lint:fix` | ESLint checks and auto-fix |
| `format` | Prettier formatting |

Environment

- `VITE_API_URL` — base URL for backend API used by the frontend. Default: `http://localhost:3000`. Set this in `.env` or your deployment environment.

Project structure (essential)

```
src/
├─ api/        # API client, services that call the backend
├─ components/ # UI components (cards, common, layout)
├─ pages/      # Page-level components (routing targets)
├─ hooks/      # Reusable React hooks
├─ styles/     # Global and utility styles
└─ types/      # Generated API types and app types
```

API integration notes

- The frontend relies on generated OpenAPI types for a safer integration. Run `npm run generate:api` whenever the backend API/Swagger changes.
- Generated types live at: `src/types/api.generated.ts`.
- Note: The generate:api script assumes the backend is running on port 3000. If you're running the backend on a custom port, you'll need to temporarily modify this script or call the openapi-typescript tool manually with the correct port.

Troubleshooting & tips

- `generate:api` fails: ensure backend is running at `VITE_API_URL` and `{VITE_API_URL}/api-docs/swagger.json` is reachable.
- CORS errors: set `VITE_API_URL` correctly and add your origin to backend `CORS_ORIGINS`.
- Types out of sync: re-run `npm run generate:api` after backend changes.

Deployment

- Same origin (recommended): build the frontend and let your backend serve static assets or configure your web server to host the built files.
- Different origin: host frontend separately and set `VITE_API_URL` to the backend URL; configure CORS on the backend.

Contributing

- Keep UI logic in `src/components` and small; add tests for new behaviors.
- If you change an API contract, update the backend OpenAPI spec and then run `npm run generate:api` in the frontend.

If you'd like, I can also add a tiny example `scripts/quickstart.sh` to automate install + generate + dev start.
