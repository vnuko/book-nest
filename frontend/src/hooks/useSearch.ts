import { useQuery } from '@tanstack/react-query';
import { searchApi } from '../api';

export function useGlobalSearch(query: string) {
  return useQuery({
    queryKey: ['search', query],
    queryFn: () => searchApi.global(query),
    enabled: query.length > 0,
  });
}
