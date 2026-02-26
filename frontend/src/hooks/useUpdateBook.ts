import { useMutation, useQueryClient } from '@tanstack/react-query';
import { booksApi } from '../api';

export function useUpdateBook(bookId: string) {
  const queryClient = useQueryClient();

  const { mutate, mutateAsync, isPending, error } = useMutation({
    mutationFn: (data: { title: string; description?: string | null; firstPublishYear?: number | null }) =>
      booksApi.update(bookId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['book', bookId] });
    },
  });

  return { mutate, mutateAsync, isPending, error };
}
