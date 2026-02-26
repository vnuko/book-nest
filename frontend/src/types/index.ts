export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface Author {
  id: string;
  name: string;
  slug: string;
  bio: string | null;
  nationality: string | null;
  dateOfBirth: string | null;
  bookCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Series {
  id: string;
  name: string;
  originalName: string | null;
  slug: string;
  description: string | null;
  author: {
    id: string;
    name: string;
    slug: string;
  };
  bookCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface BookFile {
  id: string;
  format: string;
  size: number | null;
}

export interface Book {
  id: string;
  title: string;
  originalTitle: string | null;
  slug: string;
  description: string | null;
  isbn: string | null;
  firstPublishYear: number | null;
  author: {
    id: string;
    name: string;
    slug: string;
  };
  series: {
    id: string;
    name: string;
    slug: string;
  } | null;
  seriesOrder: number | null;
  files: BookFile[];
  createdAt: string;
  updatedAt: string;
  liked: boolean;
}

export interface BookListResponse {
  data: Book[];
  pagination?: Pagination;
}

export interface AuthorListResponse {
  data: Author[];
  pagination?: Pagination;
}

export interface SeriesListResponse {
  data: Series[];
  pagination?: Pagination;
}

export interface SearchResponse {
  data: {
    books: Book[];
    authors: Author[];
    series: Series[];
  };
}

export interface Overview {
  data: {
    totalBooks: number;
    totalAuthors: number;
    totalSeries: number;
    totalFiles: number;
    recentBooks: Book[];
    recentAuthors: Author[];
  };
}

export interface ApiErrorResponse {
  error: {
    code: string;
    message: string;
    statusCode: number;
  };
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination?: Pagination;
}
