export interface ApiResponse<T> {
  data: T;
  pagination?: PaginationResponse;
}

export interface PaginationResponse {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiError {
  error: {
    code: string;
    message: string;
    statusCode: number;
  };
}

export interface BookResponse {
  id: string;
  title: string;
  originalTitle: string | null;
  slug: string;
  description: string | null;
  firstPublishYear: number | null;
  liked: boolean;
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
  files: Array<{
    id: string;
    format: string;
    size: number | null;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface AuthorResponse {
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

export interface SeriesResponse {
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

export interface SearchResponse {
  books: BookResponse[];
  authors: AuthorResponse[];
  series: SeriesResponse[];
}
