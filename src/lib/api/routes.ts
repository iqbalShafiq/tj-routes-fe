import apiClient from './client';
import { API_ENDPOINTS } from '../utils/constants';
import type { Stop } from './stops';

export interface RouteStop {
  id: number;
  route_id: number;
  stop_id: number;
  sequence_order: number;
  stop: Stop;
}

export interface Route {
  id: number;
  code?: string; // For frontend compatibility
  route_number: string;
  name: string;
  description?: string;
  status: 'active' | 'inactive';
  stops?: Stop[];
  route_stops?: RouteStop[];
  created_at?: string;
  updated_at?: string;
}

export interface RoutesResponse {
  success: boolean;
  data: {
    routes: Route[];
    total: number;
    page: number;
    limit: number;
  };
}

export interface RouteResponse {
  success: boolean;
  data: Route;
}

export interface CreateRouteRequest {
  route_number: string;
  name: string;
  description?: string;
  status?: 'active' | 'inactive';
  stop_ids: number[];
}

export interface UpdateRouteStopsRequest {
  stop_ids: number[];
}

export const routesApi = {
  getRoutes: async (
    page: number = 1,
    limit: number = 20,
    options?: {
      search?: string;
      status?: 'active' | 'inactive';
      route_number?: string;
    }
  ): Promise<{
    data: Route[];
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
    if (options?.route_number) params.append('route_number', options.route_number);

    const response = await apiClient.get<RoutesResponse>(`${API_ENDPOINTS.routes.list}?${params}`);
    
    if (response.data.success && response.data.data.routes) {
      const routes = response.data.data.routes.map((route) => ({
        ...route,
        code: route.route_number || route.code, // Map route_number to code for compatibility
      }));
      
      const total = response.data.data.total;
      const total_pages = Math.ceil(total / limit);
      
      return {
        data: routes,
        total,
        page: response.data.data.page,
        limit: response.data.data.limit,
        total_pages,
      };
    }
    
    return { data: [], total: 0, page, limit, total_pages: 0 };
  },

  getRoute: async (id: string | number): Promise<Route> => {
    const response = await apiClient.get<RouteResponse>(API_ENDPOINTS.routes.detail(id));
    const route = response.data.data;
    return {
      ...route,
      code: route.route_number || (route as any).code,
    };
  },

  createRoute: async (data: CreateRouteRequest): Promise<Route> => {
    const response = await apiClient.post<RouteResponse>(API_ENDPOINTS.routes.list, data);
    return response.data.data;
  },

  updateRoute: async (id: string | number, data: Partial<Omit<CreateRouteRequest, 'stop_ids'>>): Promise<Route> => {
    const response = await apiClient.put<RouteResponse>(API_ENDPOINTS.routes.detail(id), data);
    return response.data.data;
  },

  updateRouteStops: async (id: string | number, stop_ids: number[]): Promise<void> => {
    await apiClient.put(API_ENDPOINTS.routes.stops(id), { stop_ids });
  },

  deleteRoute: async (id: string | number): Promise<void> => {
    await apiClient.delete(API_ENDPOINTS.routes.detail(id));
  },
};
