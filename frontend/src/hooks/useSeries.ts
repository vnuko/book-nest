import { useQuery } from '@tanstack/react-query';
import { seriesApi } from '../api';

export function useSeries(page = 1, limit = 20) {
  return useQuery({
    queryKey: ['series', page, limit],
    queryFn: () => seriesApi.getAll(page, limit),
  });
}

export function useSeriesById(id: string | undefined) {
  return useQuery({
    queryKey: ['series', id],
    queryFn: () => seriesApi.getById(id!),
    enabled: !!id,
  });
}

export function useSeriesSearch(query: string, page = 1, limit = 20) {
  return useQuery({
    queryKey: ['series', 'search', query, page, limit],
    queryFn: () => seriesApi.search(query, page, limit),
    enabled: query.length > 0,
  });
}

export function useSeriesBooks(seriesId: string | undefined, page = 1, limit = 20) {
  return useQuery({
    queryKey: ['series', 'books', seriesId, page, limit],
    queryFn: () => seriesApi.getBooks(seriesId!, page, limit),
    enabled: !!seriesId,
  });
}
