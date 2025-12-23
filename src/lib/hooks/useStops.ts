import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { stopsApi, type CreateStopRequest } from '../api/stops';

export const useStops = (
  page: number = 1,
  limit: number = 20,
  options?: {
    search?: string;
    status?: 'active' | 'inactive';
    type?: 'stop' | 'terminal';
    city?: string;
  }
) => {
  return useQuery({
    queryKey: ['stops', page, limit, options],
    queryFn: () => stopsApi.getStops(page, limit, options),
  });
};

export const useStop = (id: string | number) => {
  return useQuery({
    queryKey: ['stop', id],
    queryFn: () => stopsApi.getStop(id),
    enabled: !!id,
  });
};

export const useCreateStop = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ data, photo }: { data: CreateStopRequest; photo?: File }) =>
      stopsApi.createStop(data, photo),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stops'] });
    },
  });
};

export const useUpdateStop = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data, photo }: { id: string | number; data: Partial<CreateStopRequest>; photo?: File }) =>
      stopsApi.updateStop(id, data, photo),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['stops'] });
      queryClient.invalidateQueries({ queryKey: ['stop', variables.id] });
    },
  });
};

export const useDeleteStop = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string | number) => stopsApi.deleteStop(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stops'] });
    },
  });
};

