import { api } from './client';
import type { AuthorListResponse, Author, Pagination, Series } from '../types';

export const authorsApi = {
  getAll: (page = 1, limit = 20) =>
    api.get<AuthorListResponse>('/api/authors', { page, limit }),

  search: (query: string, page = 1, limit = 20) =>
    api.get<AuthorListResponse>('/api/authors/search', { q: query, page, limit }),

  getById: (id: string) =>
    api.get<{ data: Author }>(`/api/authors/${id}`),

  getBooks: (authorId: string, page = 1, limit = 20) =>
    api.get<{ data: Author[]; pagination?: Pagination }>(`/api/authors/${authorId}/books`, { page, limit }),

  getSeries: (authorId: string, page = 1, limit = 20) =>
    api.get<{ data: Series[]; pagination?: Pagination }>(`/api/authors/${authorId}/series`, { page, limit }),

  update: (id: string, data: { name: string; bio?: string | null; dateOfBirth?: string | null; nationality?: string | null }) =>
    api.put<{ data: Author }>(`/api/authors/${id}`, data),
};
