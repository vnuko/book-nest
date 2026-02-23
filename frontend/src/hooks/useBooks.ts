import { useQuery } from '@tanstack/react-query';
import { booksApi } from '../api';

export function useBooks(page = 1, limit = 20) {
  return useQuery({
    queryKey: ['books', page, limit],
    queryFn: () => booksApi.getAll(page, limit),
  });
}

export function useBook(id: string | undefined) {
  return useQuery({
    queryKey: ['book', id],
    queryFn: () => booksApi.getById(id!),
    enabled: !!id,
  });
}

export function useBookSearch(query: string, page = 1, limit = 20) {
  return useQuery({
    queryKey: ['books', 'search', query, page, limit],
    queryFn: () => booksApi.search(query, page, limit),
    enabled: query.length > 0,
  });
}

export function useBooksByAuthor(authorId: string | undefined, page = 1, limit = 20) {
  return useQuery({
    queryKey: ['books', 'author', authorId, page, limit],
    queryFn: () => booksApi.getByAuthor(authorId!, page, limit),
    enabled: !!authorId,
  });
}

export function useBooksBySeries(seriesId: string | undefined, page = 1, limit = 20) {
  return useQuery({
    queryKey: ['books', 'series', seriesId, page, limit],
    queryFn: () => booksApi.getBySeries(seriesId!, page, limit),
    enabled: !!seriesId,
  });
}

export function useBookFiles(bookId: string | undefined) {
  return useQuery({
    queryKey: ['books', 'files', bookId],
    queryFn: () => booksApi.getFiles(bookId!),
    enabled: !!bookId,
  });
}
