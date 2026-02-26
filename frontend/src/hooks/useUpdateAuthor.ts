import { useMutation, useQueryClient } from '@tanstack/react-query';
import { authorsApi } from '../api';

export function useUpdateAuthor(authorId: string) {
  const queryClient = useQueryClient();

  const { mutate, mutateAsync, isPending, error } = useMutation({
    mutationFn: (data: { name: string; bio?: string | null; dateOfBirth?: string | null; nationality?: string | null }) =>
      authorsApi.update(authorId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['author', authorId] });
    },
  });

  return { mutate, mutateAsync, isPending, error };
}
