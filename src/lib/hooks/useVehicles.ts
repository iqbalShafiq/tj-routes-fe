import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { vehiclesApi, type CreateVehicleRequest } from '../api/vehicles';

// Query keys for vehicles
export const vehicleKeys = {
  all: ['vehicles'] as const,
  lists: () => [...vehicleKeys.all, 'list'] as const,
  list: (page: number, limit: number, options?: any) =>
    [...vehicleKeys.lists(), { page, limit, ...options }] as const,
  details: () => [...vehicleKeys.all, 'detail'] as const,
  detail: (id: string | number) => [...vehicleKeys.details(), id] as const,
};

export const useVehicles = (
  page: number = 1,
  limit: number = 20,
  options?: {
    search?: string;
    status?: 'active' | 'inactive';
    route_id?: number;
  }
) => {
  return useQuery({
    queryKey: vehicleKeys.list(page, limit, options),
    queryFn: () => vehiclesApi.getVehicles(page, limit, options),
  });
};

export const useVehicle = (id: string | number) => {
  return useQuery({
    queryKey: vehicleKeys.detail(id),
    queryFn: () => vehiclesApi.getVehicle(id),
    enabled: !!id,
  });
};

export const useCreateVehicle = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ data, photo }: { data: CreateVehicleRequest; photo?: File }) =>
      vehiclesApi.createVehicle(data, photo),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: vehicleKeys.all });
    },
  });
};

export const useUpdateVehicle = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data, photo }: { id: string | number; data: Partial<CreateVehicleRequest>; photo?: File }) =>
      vehiclesApi.updateVehicle(id, data, photo),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: vehicleKeys.lists() });
      queryClient.invalidateQueries({ queryKey: vehicleKeys.detail(variables.id) });
    },
  });
};

export const useDeleteVehicle = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string | number) => vehiclesApi.deleteVehicle(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: vehicleKeys.all });
    },
  });
};

