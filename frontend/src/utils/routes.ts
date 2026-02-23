export const ROUTES = {
  HOME: '/',
  BOOKS: '/books',
  BOOK_DETAIL: (id: string) => `/books/${id}`,
  AUTHORS: '/authors',
  AUTHOR_DETAIL: (id: string) => `/authors/${id}`,
  SERIES: '/series',
  SERIES_DETAIL: (id: string) => `/series/${id}`,
} as const;
