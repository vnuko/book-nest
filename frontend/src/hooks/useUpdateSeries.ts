import { useMutation, useQueryClient } from '@tanstack/react-query';
import { seriesApi } from '../api';

export function useUpdateSeries(seriesId: string) {
  const queryClient = useQueryClient();

  const { mutate, mutateAsync, isPending, error } = useMutation({
    mutationFn: (data: { name: string; description?: string | null }) =>
      seriesApi.update(seriesId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['series', seriesId] });
    },
  });

  return { mutate, mutateAsync, isPending, error };
}
