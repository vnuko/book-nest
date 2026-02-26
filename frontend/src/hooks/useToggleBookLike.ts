import { useMutation, useQueryClient } from '@tanstack/react-query';
import { booksApi } from '../api';

export function useToggleBookLike(bookId: string) {
  const queryClient = useQueryClient();

  const { mutate: toggle, isPending } = useMutation({
    mutationFn: (liked: boolean) => booksApi.toggleLike(bookId, liked),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['books'] });
    },
  });

  return { toggle, isPending };
}
