import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { vehiclesApi, type CreateVehicleRequest } from '../api/vehicles';

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
    queryKey: ['vehicles', page, limit, options],
    queryFn: () => vehiclesApi.getVehicles(page, limit, options),
  });
};

export const useVehicle = (id: string | number) => {
  return useQuery({
    queryKey: ['vehicle', id],
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
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
    },
  });
};

export const useUpdateVehicle = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data, photo }: { id: string | number; data: Partial<CreateVehicleRequest>; photo?: File }) =>
      vehiclesApi.updateVehicle(id, data, photo),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      queryClient.invalidateQueries({ queryKey: ['vehicle', variables.id] });
    },
  });
};

export const useDeleteVehicle = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string | number) => vehiclesApi.deleteVehicle(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
    },
  });
};

