import apiClient from './client';
import { API_ENDPOINTS } from '../utils/constants';
import type { Stop } from './stops';

// Check-in status types
export type CheckInStatus = 'in_progress' | 'completed' | 'cancelled';

// Route type (simplified for check-in context)
export interface Route {
  id: number;
  route_number: string;
  name: string;
}

// Check-in response from API
export interface CheckIn {
  id: number;
  user_id: number;
  route_id: number;
  start_stop_id: number;
  end_stop_id?: number;
  start_time: string;
  end_time?: string;
  duration_seconds?: number;
  notes?: string;
  status: CheckInStatus;
  points_earned: number;
  created_at: string;
  updated_at: string;
  route?: Route;
  start_stop?: Stop;
  end_stop?: Stop;
}

// API Response types
export interface CheckInResponse {
  success: boolean;
  data: CheckIn;
}

export interface CheckInsResponse {
  success: boolean;
  data: {
    check_ins: CheckIn[];
    total: number;
    page: number;
    limit: number;
  };
}

export interface CheckInStatsResponse {
  success: boolean;
  data: {
    total_check_ins: number;
    completed_check_ins: number;
    total_points_earned: number;
    current_streak_days: number;
    longest_streak_days: number;
    unique_routes_count: number;
    total_duration_seconds: number;
    average_duration_seconds: number;
  };
}

// Request types
export interface CreateCheckInRequest {
  route_id: number;
  start_stop_id: number;
  start_time?: string;
  notes?: string;
}

export interface CompleteCheckInRequest {
  end_stop_id: number;
  end_time?: string;
  notes?: string;
}

// Filter options for list check-ins
export interface CheckInFilters {
  page?: number;
  limit?: number;
  status?: CheckInStatus;
}

// Check-in API methods
export const checkinApi = {
  // Create a new check-in (start journey)
  create: async (data: CreateCheckInRequest): Promise<CheckIn> => {
    const response = await apiClient.post<CheckInResponse>(API_ENDPOINTS.checkins.create, data);
    return response.data.data;
  },

  // Complete an in-progress check-in
  complete: async (id: string | number, data: CompleteCheckInRequest): Promise<CheckIn> => {
    const response = await apiClient.put<CheckInResponse>(API_ENDPOINTS.checkins.complete(id), data);
    return response.data.data;
  },

  // Get a single check-in by ID
  getById: async (id: string | number): Promise<CheckIn> => {
    const response = await apiClient.get<CheckInResponse>(API_ENDPOINTS.checkins.detail(id));
    return response.data.data;
  },

  // List user's check-ins with pagination and filters
  list: async (filters?: CheckInFilters): Promise<{
    check_ins: CheckIn[];
    total: number;
    page: number;
    limit: number;
  }> => {
    const params = new URLSearchParams();
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.status) params.append('status', filters.status);

    const response = await apiClient.get<CheckInsResponse>(
      `${API_ENDPOINTS.checkins.list}?${params}`
    );

    if (response.data.success && response.data.data.check_ins) {
      return response.data.data;
    }

    return { check_ins: [], total: 0, page: 1, limit: 10 };
  },

  // Get user's check-in statistics
  getStats: async (): Promise<CheckInStatsResponse['data']> => {
    const response = await apiClient.get<CheckInStatsResponse>(API_ENDPOINTS.checkins.stats);
    return response.data.data;
  },

  // Get active (in-progress) check-in for user
  getActive: async (): Promise<CheckIn | null> => {
    const response = await apiClient.get<CheckInsResponse>(
      `${API_ENDPOINTS.checkins.list}?status=in_progress`
    );

    if (response.data.success && response.data.data.check_ins) {
      const checkIns = response.data.data.check_ins;
      // Return first in-progress check-in if exists
      return checkIns.length > 0 ? checkIns[0] : null;
    }

    return null;
  },

  // Delete a check-in
  delete: async (id: string | number): Promise<void> => {
    await apiClient.delete(API_ENDPOINTS.checkins.detail(id));
  },
};
