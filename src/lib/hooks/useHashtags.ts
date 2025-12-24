import { useQuery } from '@tanstack/react-query';
import { hashtagsApi } from '../api/hashtags';

export const useTrendingHashtags = (limit: number = 20) => {
  return useQuery({
    queryKey: ['trending-hashtags', limit],
    queryFn: () => hashtagsApi.getTrending(limit),
  });
};

export const useSearchHashtags = (query: string, limit: number = 10, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['search-hashtags', query, limit],
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
    queryKey: ['hashtag-reports', hashtag, page, limit],
    queryFn: () => hashtagsApi.getReportsByHashtag(hashtag, page, limit),
    enabled: enabled && hashtag.length > 0,
  });
};

