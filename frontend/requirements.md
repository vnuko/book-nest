# BookNest Frontend Requirements

## Project Overview

A React-based frontend for the BookNest ebook management system, consuming the backend REST API. The frontend should follow the visual design and structure of the existing template while implementing modern React best practices.

---

## 1. Technology Stack

### Core Dependencies (Required)
| Package | Version | Purpose |
|---------|---------|---------|
| `react` | ^18.x | UI library |
| `react-dom` | ^18.x | React DOM rendering |
| `react-router-dom` | ^6.x | Client-side routing |
| `bootstrap` | ^5.3.x | CSS framework (via CDN or npm) |

### Development Dependencies
| Package | Version | Purpose |
|---------|---------|---------|
| `vite` | ^5.x | Build tool & dev server |
| `typescript` | ^5.x | Type safety |
| `@types/react` | ^18.x | React type definitions |
| `@types/react-dom` | ^18.x | React DOM type definitions |
| `openapi-typescript` | ^6.7.0 | Generate TypeScript from OpenAPI spec |
| `eslint` | ^9.x | Code linting |
| `prettier` | ^3.x | Code formatting |

### Optional (Recommended)
| Package | Purpose |
|---------|---------|
| `@tanstack/react-query` | Server state management, caching, deduplication |
| `react-icons` | SVG icons (alternative: inline SVGs) |

---

## 2. Project Structure

```
frontend/
├── public/
│   └── vite.svg
├── src/
│   ├── api/                    # API client configuration
│   │   ├── client.ts           # Fetch wrapper with base URL
│   │   └── index.ts            # API exports
│   ├── components/
│   │   ├── common/             # Reusable UI components
│   │   │   ├── Layout/
│   │   │   │   ├── Layout.tsx
│   │   │   │   ├── Layout.module.css
│   │   │   │   └── index.ts
│   │   │   ├── Sidebar/
│   │   │   ├── TopBar/
│   │   │   ├── SearchBar/
│   │   │   └── LoadingSpinner/
│   │   ├── cards/              # Card components
│   │   │   ├── AuthorCard/
│   │   │   ├── BookCard/
│   │   │   └── SeriesCard/
│   │   └── sections/           # Page sections
│   │       ├── HorizontalScroll/
│   │       └── DownloadSection/
│   ├── hooks/                  # Custom React hooks
│   │   ├── useAuthors.ts
│   │   ├── useBooks.ts
│   │   ├── useSeries.ts
│   │   └── useSearch.ts
│   ├── pages/                  # Route pages
│   │   ├── OverviewPage/
│   │   ├── BooksPage/
│   │   ├── BookDetailPage/
│   │   ├── AuthorsPage/
│   │   ├── AuthorDetailPage/
│   │   ├── SeriesPage/
│   │   └── SeriesDetailPage/
│   ├── types/                  # TypeScript types
│   │   ├── api.generated.ts    # Auto-generated from OpenAPI
│   │   └── index.ts            # Manual type exports
│   ├── utils/                  # Utility functions
│   │   ├── formatters.ts
│   │   └── routes.ts
│   ├── styles/
│   │   ├── variables.css       # CSS custom properties
│   │   └── global.css          # Global styles
│   ├── App.tsx
│   ├── main.tsx
│   └── vite-env.d.ts
├── package.json
├── tsconfig.json
├── vite.config.ts
└── requirements.md
```

---

## 3. API Integration

### 3.1 Backend OpenAPI Spec

The backend exposes OpenAPI spec at:
- **Swagger UI**: `http://localhost:3000/api-docs`
- **JSON Spec**: `http://localhost:3000/api-docs/swagger.json`

### 3.2 Frontend Type Generation (Required)

The frontend generates TypeScript types directly from the backend's running OpenAPI spec.

**Add to `frontend/package.json`:**

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "lint": "eslint src/",
    "generate:api": "openapi-typescript http://localhost:3000/api-docs/swagger.json -o src/types/api.generated.ts"
  },
  "devDependencies": {
    "openapi-typescript": "^6.7.0"
  }
}
```

**Run `npm run generate:api`** to generate TypeScript types from the OpenAPI spec.

**Workflow:**
1. Start backend: `cd backend && npm run dev`
2. Generate types: `cd frontend && npm run generate:api`
3. Start frontend: `npm run dev`

### 3.3 Using Generated Types

The generated `src/types/api.generated.ts` provides typed interfaces for all API responses:

```typescript
import type { components } from './types/api.generated';

type Book = components['schemas']['Book'];
type Author = components['schemas']['Author'];
type Series = components['schemas']['Series'];
type BookListResponse = components['schemas']['BookListResponse'];
type Pagination = components['schemas']['Pagination'];
```

### 3.4 API Client Pattern

```typescript
// src/api/client.ts
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export async function apiClient<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }

  return response.json();
}
```

---

## 4. Pages & Routes

| Route | Page Component | Description |
|-------|---------------|-------------|
| `/` | `OverviewPage` | Dashboard with horizontal scrolls |
| `/books` | `BooksPage` | Grid of all books with search |
| `/books/:id` | `BookDetailPage` | Book details + download files |
| `/authors` | `AuthorsPage` | Grid of all authors with search |
| `/authors/:id` | `AuthorDetailPage` | Author bio + their books |
| `/series` | `SeriesPage` | Grid of all series with search |
| `/series/:id` | `SeriesDetailPage` | Series banner + books in series |

---

## 5. Components Specification

### 5.1 Layout Components

#### TopBar
- Fixed position at top (60px height)
- Logo with book icon + "BookNest" text
- Search button (opens global search modal)
- Settings button
- Hamburger menu (mobile only)

#### Sidebar
- Fixed position, left side (220px width)
- Navigation items: Overview, Authors, Books, Series
- Active state with accent color + left border
- Collapsible on mobile (overlay mode)

#### Layout
- Wraps all pages
- Provides TopBar + Sidebar + main content area
- Handles mobile sidebar toggle

### 5.2 Card Components

#### AuthorCard
- Circular avatar (grayscale -> color on hover)
- Author name below
- Clickable -> navigate to author detail

#### BookCard
- Book cover (2:3 aspect ratio, no rounded corners)
- Book title
- Author name (secondary text)
- Hover: scale up + shadow
- Clickable -> navigate to book detail

#### SeriesCard
- Series cover (16:9 aspect ratio, no rounded corners)
- Series name
- Book count
- Hover: scale up + shadow
- Clickable -> navigate to series detail

### 5.3 SearchBar
- Full-width search input
- Search icon on left
- Focus state with accent border + shadow
- Debounced input (300ms)

### 5.4 HorizontalScroll
- Horizontal scrollable container
- Drag-to-scroll functionality
- Scroll snap for better UX
- Used on Overview page

### 5.5 DownloadSection (Book Detail)
- List of available file formats
- Format badges (EPUB, MOBI, PDF, AZW3, TXT, FB2)
- File size display
- Download button with arrow icon

---

## 6. Styling Guidelines

### 6.1 CSS Variables (from template)

```css
:root {
  --bn-bg: #FFFFFF;
  --bn-sidebar: #FAFAFA;
  --bn-accent: #4F7DF3;
  --bn-accent-light: rgba(79, 125, 243, 0.1);
  --bn-text: #111111;
  --bn-text-secondary: #666666;
  --bn-text-muted: #999999;
  --bn-border: #EEEEEE;
  --bn-border-light: #F5F5F5;
  --bn-shadow-soft: 0 4px 20px rgba(0, 0, 0, 0.05);
  --bn-shadow-hover: 0 8px 30px rgba(0, 0, 0, 0.1);
  --bn-radius: 0;
  --bn-radius-sm: 4px;
  --bn-radius-lg: 16px;
  --bn-sidebar-width: 220px;
}
```

### 6.2 CSS Module Pattern

Each component should have its own CSS module:

```tsx
// BookCard.tsx
import styles from './BookCard.module.css';

export function BookCard({ book }) {
  return (
    <div className={styles.card}>
      <img className={styles.cover} src={book.cover} alt={book.title} />
      <h3 className={styles.title}>{book.title}</h3>
    </div>
  );
}
```

### 6.3 Typography

- **Font Family**: Roboto (Google Fonts)
- **Page Titles**: 2rem, font-weight 700
- **Section Titles**: 1.375rem, font-weight 600
- **Card Titles**: 0.9375rem, font-weight 500
- **Secondary Text**: 0.8125rem, color var(--bn-text-secondary)

### 6.4 Responsive Breakpoints

| Breakpoint | Behavior |
|------------|----------|
| > 1024px | Full sidebar visible |
| 768px - 1024px | Narrower grid columns |
| < 768px | Sidebar hidden (hamburger toggle) |
| < 480px | Compact spacing, 2-column grid |

---

## 7. State Management

### 7.1 Server State (API Data)
Use React Query for:
- Automatic caching
- Background refetching
- Deduplication
- Loading/error states

```typescript
// hooks/useBooks.ts
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../api/client';

export function useBooks(page = 1, limit = 20) {
  return useQuery({
    queryKey: ['books', page, limit],
    queryFn: () => apiClient<{ data: Book[]; pagination: Pagination }>(
      `/api/books?page=${page}&limit=${limit}`
    ),
  });
}
```

### 7.2 UI State
- Sidebar open/closed: React context or local state
- Search query: Local state with URL sync
- Active nav item: Derived from current route

---

## 8. Performance Requirements

- **First Contentful Paint**: < 1.5s
- **Lazy loading**: Images should use `loading="lazy"`
- **Code splitting**: Route-based code splitting
- **Bundle size**: Keep main bundle < 150KB gzipped

---

## 9. Accessibility

- Semantic HTML (header, nav, main, article, etc.)
- ARIA labels on icon buttons
- Keyboard navigation support
- Focus visible states
- Reduced motion support (respect `prefers-reduced-motion`)

---

## 10. Environment Configuration

```env
# .env.development
VITE_API_URL=http://localhost:3000

# .env.production
VITE_API_URL=/  # Same origin
```

---

## 11. Scripts Summary

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "lint": "eslint src/",
    "lint:fix": "eslint src/ --fix",
    "format": "prettier --write \"src/**/*.{ts,tsx,css}\"",
    "generate:api": "openapi-typescript http://localhost:3000/api-docs/swagger.json -o src/types/api.generated.ts",
    "typecheck": "tsc --noEmit"
  },
  "devDependencies": {
    "openapi-typescript": "^6.7.0"
  }
}
```

---

## 12. Backend Contract

The frontend expects these API endpoints (from backend OpenAPI spec):

### Books
- `GET /api/books` - List books (paginated)
- `GET /api/books/search?q={query}` - Search books
- `GET /api/books/:id` - Get book by ID
- `GET /api/books/:id/files` - Get book files

### Authors
- `GET /api/authors` - List authors (paginated)
- `GET /api/authors/search?q={query}` - Search authors
- `GET /api/authors/:id` - Get author by ID
- `GET /api/authors/:id/books` - Get author's books
- `GET /api/authors/:id/series` - Get author's series

### Series
- `GET /api/series` - List series (paginated)
- `GET /api/series/search?q={query}` - Search series
- `GET /api/series/:id` - Get series by ID
- `GET /api/series/:id/books` - Get books in series

### Files
- `GET /api/files/books/:bookId/download/:format` - Download book file
- `GET /api/files/images/books/:bookId` - Get book cover image
- `GET /api/files/images/authors/:authorId` - Get author avatar

### Overview
- `GET /api/overview` - Get library statistics

### Search
- `GET /api/search?q={query}` - Global search (books, authors, series)

---

## 13. Implementation Checklist

- [ ] Initialize Vite + React + TypeScript project
- [ ] Configure Bootstrap (CDN)
- [ ] Set up CSS variables
- [ ] Create Layout component (TopBar + Sidebar)
- [ ] Implement routing with react-router-dom
- [ ] Create API client
- [ ] Run `npm run generate:api` to generate types from OpenAPI spec
- [ ] Build card components (Author, Book, Series)
- [ ] Build page components
- [ ] Implement search functionality
- [ ] Add horizontal scroll with drag
- [ ] Handle loading and error states
- [ ] Responsive design implementation
- [ ] Accessibility audit
- [ ] Performance optimization
