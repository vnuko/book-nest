import { api } from './client';
import type { BookListResponse, Book } from '../types';

export const booksApi = {
  getAll: (page = 1, limit = 20) =>
    api.get<BookListResponse>('/api/books', { page, limit }),

  search: (query: string, page = 1, limit = 20) =>
    api.get<BookListResponse>('/api/books/search', { q: query, page, limit }),

  getById: (id: string) =>
    api.get<{ data: Book }>(`/api/books/${id}`),

  getByAuthor: (authorId: string, page = 1, limit = 20) =>
    api.get<BookListResponse>(`/api/books/author/${authorId}`, { page, limit }),

  getBySeries: (seriesId: string, page = 1, limit = 20) =>
    api.get<BookListResponse>(`/api/books/series/${seriesId}`, { page, limit }),

  getFiles: (bookId: string) =>
    api.get<{ data: Book['files'] }>(`/api/books/${bookId}/files`),

  toggleLike: (id: string, liked: boolean) =>
    api.put<{ data: { liked: boolean } }>(`/api/books/${id}/like`, { liked }),

  update: (id: string, data: { title: string; description?: string | null; firstPublishYear?: number | null }) =>
    api.put<{ data: Book }>(`/api/books/${id}`, data),
};
