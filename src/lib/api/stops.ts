import apiClient from './client';
import { API_ENDPOINTS } from '../utils/constants';

export interface Stop {
  id: number;
  name: string;
  type: 'stop' | 'terminal';
  latitude: number;
  longitude: number;
  address?: string;
  city?: string;
  district?: string;
  facilities?: string | string[];
  status: 'active' | 'inactive';
  photo_url?: string | null;
  created_at?: string;
  updated_at?: string;
  sequence?: number; // For route stops
}

export interface StopsResponse {
  success: boolean;
  data: {
    stops: Stop[];
    total: number;
    page: number;
    limit: number;
  };
}

export interface StopResponse {
  success: boolean;
  data: Stop;
}

export interface CreateStopRequest {
  name: string;
  type: 'stop' | 'terminal';
  latitude: number;
  longitude: number;
  address?: string;
  city?: string;
  district?: string;
  facilities?: string;
  status?: 'active' | 'inactive';
}

export const stopsApi = {
  getStops: async (
    page: number = 1,
    limit: number = 20,
    options?: {
      search?: string;
      status?: 'active' | 'inactive';
      type?: 'stop' | 'terminal';
      city?: string;
    }
  ): Promise<{
    data: Stop[];
    total: number;
    page: number;
    limit: number;
    total_pages: number;
  }> => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    if (options?.search) params.append('search', options.search);
    if (options?.status) params.append('status', options.status);
    if (options?.type) params.append('type', options.type);
    if (options?.city) params.append('city', options.city);

    const response = await apiClient.get<StopsResponse>(`${API_ENDPOINTS.stops.list}?${params}`);
    
    if (response.data.success && response.data.data.stops) {
      const total = response.data.data.total;
      const total_pages = Math.ceil(total / limit);
      return {
        data: response.data.data.stops,
        total,
        page: response.data.data.page,
        limit: response.data.data.limit,
        total_pages,
      };
    }
    return { data: [], total: 0, page, limit, total_pages: 0 };
  },

  getStop: async (id: string | number): Promise<Stop> => {
    const response = await apiClient.get<StopResponse>(API_ENDPOINTS.stops.detail(id));
    return response.data.data;
  },

  createStop: async (data: CreateStopRequest, photo?: File): Promise<Stop> => {
    const formData = new FormData();
    formData.append('data', JSON.stringify(data));
    if (photo) {
      formData.append('photo', photo);
    }
    const response = await apiClient.post<StopResponse>(API_ENDPOINTS.stops.list, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.data;
  },

  updateStop: async (id: string | number, data: Partial<CreateStopRequest>, photo?: File): Promise<Stop> => {
    const formData = new FormData();
    formData.append('data', JSON.stringify(data));
    if (photo) {
      formData.append('photo', photo);
    }
    const response = await apiClient.put<StopResponse>(API_ENDPOINTS.stops.detail(id), formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.data;
  },

  deleteStop: async (id: string | number): Promise<void> => {
    await apiClient.delete(API_ENDPOINTS.stops.detail(id));
  },
};
