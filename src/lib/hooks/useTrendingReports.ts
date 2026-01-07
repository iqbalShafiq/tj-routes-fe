import { useQuery } from '@tanstack/react-query';
import { reportsApi } from '../api/reports';

// Query keys for trending reports
export const trendingReportKeys = {
  all: ['trending-reports'] as const,
  list: (limit: number, window: string) => [...trendingReportKeys.all, limit, window] as const,
};

export const useTrendingReports = (
  limit: number = 20,
  window: '1h' | '24h' | '7d' | '30d' | 'all' = '24h'
) => {
  return useQuery({
    queryKey: trendingReportKeys.list(limit, window),
    queryFn: () => reportsApi.getTrending(0, limit, window),
  });
};
