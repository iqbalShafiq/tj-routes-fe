import apiClient from './client';

export interface Vehicle {
  id: number;
  vehicle_plate: string;
  route_id: number;
  vehicle_type?: string;
  capacity?: number;
  status: 'active' | 'inactive';
  photo_url?: string;
  created_at: string;
  updated_at: string;
  route?: {
    id: number;
    route_number: string;
    name: string;
  };
}

export interface VehiclesResponse {
  success: boolean;
  data: {
    vehicles: Vehicle[];
    total: number;
    page: number;
    limit: number;
  };
}

export interface VehicleResponse {
  success: boolean;
  data: Vehicle;
}

export interface CreateVehicleRequest {
  vehicle_plate: string;
  route_id: number;
  vehicle_type?: string;
  capacity?: number;
  status?: 'active' | 'inactive';
}

export const vehiclesApi = {
  getVehicles: async (
    page: number = 1,
    limit: number = 20,
    options?: {
      search?: string;
      status?: 'active' | 'inactive';
      route_id?: number;
    }
  ): Promise<{
    data: Vehicle[];
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
    if (options?.route_id) params.append('route_id', options.route_id.toString());

    const response = await apiClient.get<VehiclesResponse>(`/api/v1/vehicles?${params}`);
    
    if (response.data.success && response.data.data.vehicles) {
      const total = response.data.data.total;
      const total_pages = Math.ceil(total / limit);
      return {
        data: response.data.data.vehicles,
        total,
        page: response.data.data.page,
        limit: response.data.data.limit,
        total_pages,
      };
    }
    return { data: [], total: 0, page, limit, total_pages: 0 };
  },

  getVehicle: async (id: number | string): Promise<Vehicle> => {
    const response = await apiClient.get<VehicleResponse>(`/api/v1/vehicles/${id}`);
    return response.data.data;
  },

  createVehicle: async (data: CreateVehicleRequest, photo?: File): Promise<Vehicle> => {
    const formData = new FormData();
    formData.append('data', JSON.stringify(data));
    if (photo) {
      formData.append('photo', photo);
    }
    const response = await apiClient.post<VehicleResponse>('/api/v1/vehicles', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.data;
  },

  updateVehicle: async (id: number | string, data: Partial<CreateVehicleRequest>, photo?: File): Promise<Vehicle> => {
    const formData = new FormData();
    formData.append('data', JSON.stringify(data));
    if (photo) {
      formData.append('photo', photo);
    }
    const response = await apiClient.put<VehicleResponse>(`/api/v1/vehicles/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.data;
  },

  deleteVehicle: async (id: number | string): Promise<void> => {
    await apiClient.delete(`/api/v1/vehicles/${id}`);
  },
};

