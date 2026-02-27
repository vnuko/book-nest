import { api } from './client';
import type { SeriesListResponse, Series, BookListResponse } from '../types';

export const seriesApi = {
  getAll: (page = 1, limit = 20) =>
    api.get<SeriesListResponse>('/api/series', { page, limit }),

  search: (query: string, page = 1, limit = 20) =>
    api.get<SeriesListResponse>('/api/series/search', { q: query, page, limit }),

  getById: (id: string) =>
    api.get<{ data: Series }>(`/api/series/${id}`),

  getBooks: (seriesId: string, page = 1, limit = 20) =>
    api.get<BookListResponse>(`/api/series/${seriesId}/books`, { page, limit }),

  update: (id: string, data: { name: string; description?: string | null }) =>
    api.put<{ data: Series }>(`/api/series/${id}`, data),
};
