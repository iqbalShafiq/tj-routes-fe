import { useQuery } from '@tanstack/react-query';
import { reportsApi } from '../api/reports';

export const useTrendingReports = (
  limit: number = 20,
  window: '1h' | '24h' | '7d' | '30d' | 'all' = '24h'
) => {
  return useQuery({
    queryKey: ['trending-reports', limit, window],
    queryFn: () => reportsApi.getTrending(0, limit, window),
  });
};

