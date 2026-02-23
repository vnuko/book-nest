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
};
