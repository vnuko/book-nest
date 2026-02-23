import { useQuery } from '@tanstack/react-query';
import { authorsApi } from '../api';

export function useAuthors(page = 1, limit = 20) {
  return useQuery({
    queryKey: ['authors', page, limit],
    queryFn: () => authorsApi.getAll(page, limit),
  });
}

export function useAuthor(id: string | undefined) {
  return useQuery({
    queryKey: ['author', id],
    queryFn: () => authorsApi.getById(id!),
    enabled: !!id,
  });
}

export function useAuthorSearch(query: string, page = 1, limit = 20) {
  return useQuery({
    queryKey: ['authors', 'search', query, page, limit],
    queryFn: () => authorsApi.search(query, page, limit),
    enabled: query.length > 0,
  });
}

export function useAuthorBooks(authorId: string | undefined, page = 1, limit = 20) {
  return useQuery({
    queryKey: ['authors', 'books', authorId, page, limit],
    queryFn: () => authorsApi.getBooks(authorId!, page, limit),
    enabled: !!authorId,
  });
}

export function useAuthorSeries(authorId: string | undefined, page = 1, limit = 20) {
  return useQuery({
    queryKey: ['authors', 'series', authorId, page, limit],
    queryFn: () => authorsApi.getSeries(authorId!, page, limit),
    enabled: !!authorId,
  });
}
