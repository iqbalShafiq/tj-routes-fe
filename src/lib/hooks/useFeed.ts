import { useInfiniteQuery } from '@tanstack/react-query';
import { reportsApi } from '../api/reports';

export const useFeed = (
  limit: number = 20,
  options?: {
    sort?: 'recent' | 'popular' | 'trending';
    hashtag?: string;
    followed?: boolean;
  }
) => {
  return useInfiniteQuery({
    queryKey: ['feed', limit, options],
    queryFn: ({ pageParam = 0 }) =>
      reportsApi.getFeed(pageParam, limit, options),
    getNextPageParam: (lastPage) => {
      if (lastPage.offset + lastPage.limit < lastPage.total) {
        return lastPage.offset + lastPage.limit;
      }
      return undefined;
    },
    initialPageParam: 0,
  });
};

