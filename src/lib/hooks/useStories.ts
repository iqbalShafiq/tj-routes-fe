import { useQuery } from '@tanstack/react-query';
import { reportsApi } from '../api/reports';

export const useStories = (limit: number = 20, userId?: number) => {
  return useQuery({
    queryKey: ['stories', limit, userId],
    queryFn: () => reportsApi.getStories(limit, userId),
  });
};

