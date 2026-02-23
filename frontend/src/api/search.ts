import { api } from './client';
import type { SearchResponse } from '../types';

export const searchApi = {
  global: (query: string) =>
    api.get<SearchResponse>('/api/search', { q: query }),
};
