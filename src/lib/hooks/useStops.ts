import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { stopsApi, type CreateStopRequest } from '../api/stops';

// Query keys for stops
export const stopKeys = {
  all: ['stops'] as const,
  lists: () => [...stopKeys.all, 'list'] as const,
  list: (page: number, limit: number, options?: any) =>
    [...stopKeys.lists(), { page, limit, ...options }] as const,
  details: () => [...stopKeys.all, 'detail'] as const,
  detail: (id: string | number) => [...stopKeys.details(), id] as const,
};

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
    queryKey: stopKeys.list(page, limit, options),
    queryFn: () => stopsApi.getStops(page, limit, options),
  });
};

export const useStop = (id: string | number) => {
  return useQuery({
    queryKey: stopKeys.detail(id),
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
      queryClient.invalidateQueries({ queryKey: stopKeys.all });
    },
  });
};

export const useUpdateStop = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data, photo }: { id: string | number; data: Partial<CreateStopRequest>; photo?: File }) =>
      stopsApi.updateStop(id, data, photo),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: stopKeys.lists() });
      queryClient.invalidateQueries({ queryKey: stopKeys.detail(variables.id) });
    },
  });
};

export const useDeleteStop = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string | number) => stopsApi.deleteStop(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: stopKeys.all });
    },
  });
};

