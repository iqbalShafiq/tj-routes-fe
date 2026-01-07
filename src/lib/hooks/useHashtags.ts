import { useQuery } from '@tanstack/react-query';
import { hashtagsApi } from '../api/hashtags';

// Query keys for hashtags
export const hashtagKeys = {
  all: ['hashtags'] as const,
  trending: (limit: number) => [...hashtagKeys.all, 'trending', limit] as const,
  search: (query: string, limit: number) => [...hashtagKeys.all, 'search', query, limit] as const,
  reports: (hashtag: string, page: number, limit: number) =>
    [...hashtagKeys.all, 'reports', hashtag, page, limit] as const,
};

export const useTrendingHashtags = (limit: number = 20) => {
  return useQuery({
    queryKey: hashtagKeys.trending(limit),
    queryFn: () => hashtagsApi.getTrending(limit),
  });
};

export const useSearchHashtags = (query: string, limit: number = 10, enabled: boolean = true) => {
  return useQuery({
    queryKey: hashtagKeys.search(query, limit),
    queryFn: () => hashtagsApi.search(query, limit),
    enabled: enabled && query.length > 0,
  });
};

export const useReportsByHashtag = (
  hashtag: string,
  page: number = 1,
  limit: number = 20,
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: hashtagKeys.reports(hashtag, page, limit),
    queryFn: () => hashtagsApi.getReportsByHashtag(hashtag, page, limit),
    enabled: enabled && hashtag.length > 0,
  });
};
