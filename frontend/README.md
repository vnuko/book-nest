# BookNest Frontend

A React-based frontend for the BookNest ebook management system.

## Prerequisites

- Node.js 20+
- Backend running at http://localhost:3000

## Development

```bash
# Install dependencies
npm install

# Generate API types from backend
npm run generate:api

# Start development server
npm run dev
```

## Production Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

## Available Scripts

| Script | Description |
|--------|-------------|
| `dev` | Start development server |
| `build` | Build for production |
| `preview` | Preview production build |
| `lint` | Run ESLint |
| `lint:fix` | Fix ESLint errors |
| `format` | Format code with Prettier |
| `typecheck` | Run TypeScript type check |
| `generate:api` | Generate types from OpenAPI spec |

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | `http://localhost:3000` |

## Project Structure

```
src/
├── api/           # API client and services
├── components/    # React components
│   ├── cards/     # Card components
│   ├── common/    # Shared components
│   └── sections/  # Page sections
├── hooks/         # Custom React hooks
├── lib/           # Utilities and configuration
├── pages/         # Page components
├── styles/        # Global styles
├── types/         # TypeScript types
└── utils/         # Helper functions
```

## API Integration

The frontend communicates with the backend via REST API.

1. Ensure backend is running
2. Run `npm run generate:api` to generate types
3. Types are available at `src/types/api.generated.ts`

## Deployment

### Same Origin (Recommended)

Serve frontend from the same domain as backend:

```
# Backend serves frontend from /public or similar
```

### Different Origin

Configure CORS on backend and set `VITE_API_URL` in `.env.production`.
