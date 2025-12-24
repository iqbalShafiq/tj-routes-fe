import apiClient from './client';
import { API_ENDPOINTS } from '../utils/constants';

export interface Hashtag {
  id: number;
  name: string;
  usage_count: number;
  created_at: string;
  updated_at: string;
}

export interface HashtagListResponse {
  success: boolean;
  data: {
    hashtags: Hashtag[];
    query?: string | null;
  };
}

export const hashtagsApi = {
  getTrending: async (limit: number = 20): Promise<Hashtag[]> => {
    const params = new URLSearchParams({
      limit: limit.toString(),
    });

    const response = await apiClient.get<HashtagListResponse>(`${API_ENDPOINTS.hashtags.trending}?${params}`);
    
    if (response.data.success && response.data.data.hashtags) {
      return response.data.data.hashtags;
    }
    return [];
  },

  search: async (query: string, limit: number = 10): Promise<Hashtag[]> => {
    const params = new URLSearchParams({
      q: query,
      limit: limit.toString(),
    });

    const response = await apiClient.get<HashtagListResponse>(`${API_ENDPOINTS.hashtags.search}?${params}`);
    
    if (response.data.success && response.data.data.hashtags) {
      return response.data.data.hashtags;
    }
    return [];
  },

  getReportsByHashtag: async (
    name: string,
    page: number = 1,
    limit: number = 20
  ): Promise<{
    data: any[];
    total: number;
    page: number;
    limit: number;
    total_pages: number;
  }> => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    const response = await apiClient.get<{
      success: boolean;
      data: {
        reports: any[];
        total: number;
        page: number;
        limit: number;
      };
    }>(`${API_ENDPOINTS.hashtags.reports(name)}?${params}`);
    
    if (response.data.success && response.data.data.reports) {
      const total = response.data.data.total;
      const total_pages = Math.ceil(total / limit);
      return {
        data: response.data.data.reports,
        total,
        page: response.data.data.page,
        limit: response.data.data.limit,
        total_pages,
      };
    }
    return { data: [], total: 0, page, limit, total_pages: 0 };
  },
};

