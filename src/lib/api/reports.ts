import apiClient from './client';
import { API_ENDPOINTS } from '../utils/constants';

export interface Report {
  id: number;
  user_id: number;
  type: 'route_issue' | 'stop_issue' | 'temporary_event' | 'policy_change';
  title: string;
  description: string;
  related_route_id?: number | null;
  related_stop_id?: number | null;
  status: 'pending' | 'reviewed' | 'resolved';
  admin_notes?: string | null;
  photo_urls?: string[] | null;
  pdf_urls?: string[] | null;
  upvotes: number;
  downvotes: number;
  comment_count: number;
  hashtags?: string[] | null;
  is_following?: boolean | null;
  user_reaction?: 'upvote' | 'downvote' | null;
  created_at: string;
  updated_at: string;
  user?: {
    id: number;
    username: string;
    level?: string;
  };
  route?: {
    id: number;
    route_number: string;
    name: string;
  };
  stop?: {
    id: number;
    name: string;
  };
}

export interface CreateReportRequest {
  type: 'route_issue' | 'stop_issue' | 'temporary_event' | 'policy_change';
  title: string;
  description: string;
  related_route_id?: number;
  related_stop_id?: number;
}

export interface UpdateReportStatusRequest {
  status: 'pending' | 'reviewed' | 'resolved';
  admin_notes?: string;
}

export interface ReportsResponse {
  success: boolean;
  data: {
    reports: Report[];
    total: number;
    page: number;
    limit: number;
  };
}

export interface ReportResponse {
  success: boolean;
  data: Report;
}

export const reportsApi = {
  getReports: async (
    page: number = 1,
    limit: number = 20,
    options?: {
      status?: 'pending' | 'reviewed' | 'resolved';
      type?: string;
      search?: string;
    }
  ): Promise<{
    data: Report[];
    total: number;
    page: number;
    limit: number;
    total_pages: number;
  }> => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    if (options?.status) params.append('status', options.status);
    if (options?.type) params.append('type', options.type);
    if (options?.search) params.append('search', options.search);

    const response = await apiClient.get<ReportsResponse>(`${API_ENDPOINTS.reports.list}?${params}`);
    
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

  getReport: async (id: string | number): Promise<Report> => {
    const response = await apiClient.get<ReportResponse>(API_ENDPOINTS.reports.detail(id));
    return response.data.data;
  },

  createReport: async (
    data: CreateReportRequest,
    photos?: File[],
    pdfs?: File[]
  ): Promise<Report> => {
    const formData = new FormData();
    formData.append('data', JSON.stringify(data));
    
    if (photos) {
      photos.forEach((photo) => {
        formData.append('photos', photo);
      });
    }
    if (pdfs) {
      pdfs.forEach((pdf) => {
        formData.append('pdfs', pdf);
      });
    }

    const response = await apiClient.post<ReportResponse>(API_ENDPOINTS.reports.create, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.data;
  },

  updateReportStatus: async (
    id: string | number,
    data: UpdateReportStatusRequest
  ): Promise<void> => {
    await apiClient.put(API_ENDPOINTS.reports.status(id), data);
  },

  deleteReport: async (id: string | number): Promise<void> => {
    await apiClient.delete(API_ENDPOINTS.reports.detail(id));
  },

  getFeed: async (
    offset: number = 0,
    limit: number = 20,
    options?: {
      sort?: 'recent' | 'popular' | 'trending';
      hashtag?: string;
      followed?: boolean;
    }
  ): Promise<{
    data: Report[];
    total: number;
    offset: number;
    limit: number;
  }> => {
    const params = new URLSearchParams({
      offset: offset.toString(),
      limit: limit.toString(),
    });
    if (options?.sort) params.append('sort', options.sort);
    if (options?.hashtag) params.append('hashtag', options.hashtag);
    if (options?.followed !== undefined) params.append('followed', options.followed.toString());

    const response = await apiClient.get<{
      success: boolean;
      data: {
        reports: Report[];
        total: number;
        offset: number;
        limit: number;
      };
    }>(`${API_ENDPOINTS.reports.feed}?${params}`);
    
    if (response.data.success && response.data.data.reports) {
      return {
        data: response.data.data.reports,
        total: response.data.data.total,
        offset: response.data.data.offset,
        limit: response.data.data.limit,
      };
    }
    return { data: [], total: 0, offset, limit };
  },

  getTrending: async (
    offset: number = 0,
    limit: number = 20,
    window: '1h' | '24h' | '7d' | '30d' | 'all' = '24h'
  ): Promise<{
    data: Report[];
    total: number;
    offset: number;
    limit: number;
    window: string;
  }> => {
    const params = new URLSearchParams({
      offset: offset.toString(),
      limit: limit.toString(),
      window,
    });

    const response = await apiClient.get<{
      success: boolean;
      data: {
        reports: Report[];
        total: number;
        offset: number;
        limit: number;
        window: string;
      };
    }>(`${API_ENDPOINTS.reports.trending}?${params}`);
    
    if (response.data.success && response.data.data.reports) {
      return {
        data: response.data.data.reports,
        total: response.data.data.total,
        offset: response.data.data.offset,
        limit: response.data.data.limit,
        window: response.data.data.window,
      };
    }
    return { data: [], total: 0, offset, limit, window };
  },

  getStories: async (
    limit: number = 20,
    userId?: number
  ): Promise<Report[]> => {
    const params = new URLSearchParams({
      limit: limit.toString(),
    });
    if (userId) params.append('user_id', userId.toString());

    const response = await apiClient.get<{
      success: boolean;
      data: {
        stories: Report[];
      };
    }>(`${API_ENDPOINTS.reports.stories}?${params}`);

    if (response.data.success && response.data.data.stories) {
      return response.data.data.stories;
    }
    return [];
  },

  // Get reports for a specific user
  getUserReports: async (
    userId: string | number,
    page: number = 1,
    limit: number = 10,
    options?: {
      status?: 'pending' | 'reviewed' | 'resolved';
      type?: string;
      search?: string;
    }
  ): Promise<{
    data: Report[];
    total: number;
    page: number;
    limit: number;
    total_pages: number;
  }> => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      user_id: userId.toString(),
    });
    if (options?.status) params.append('status', options.status);
    if (options?.type) params.append('type', options.type);
    if (options?.search) params.append('search', options.search);

    const response = await apiClient.get<ReportsResponse>(`${API_ENDPOINTS.reports.list}?${params}`);

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
