import { useQuery } from '@tanstack/react-query';
import { reportsApi } from '../api/reports';

// Query keys for stories
export const storyKeys = {
  all: ['stories'] as const,
  list: (limit: number, userId?: number) => [...storyKeys.all, limit, userId] as const,
};

export const useStories = (limit: number = 20, userId?: number) => {
  return useQuery({
    queryKey: storyKeys.list(limit, userId),
    queryFn: () => reportsApi.getStories(limit, userId),
  });
};
