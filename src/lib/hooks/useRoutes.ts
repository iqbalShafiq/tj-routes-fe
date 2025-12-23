import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { routesApi, type CreateRouteRequest } from '../api/routes';

export const useRoutes = (page: number = 1, limit: number = 20, search?: string) => {
  return useQuery({
    queryKey: ['routes', page, limit, search],
    queryFn: () => routesApi.getRoutes(page, limit, search ? { search } : undefined),
  });
};

export const useRoute = (id: string | number) => {
  return useQuery({
    queryKey: ['route', id],
    queryFn: () => routesApi.getRoute(id),
    enabled: !!id,
  });
};

export const useCreateRoute = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateRouteRequest) => routesApi.createRoute(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['routes'] });
    },
  });
};

export const useUpdateRoute = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string | number; data: Partial<Omit<CreateRouteRequest, 'stop_ids'>> }) =>
      routesApi.updateRoute(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['routes'] });
      queryClient.invalidateQueries({ queryKey: ['route', variables.id] });
    },
  });
};

export const useDeleteRoute = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string | number) => routesApi.deleteRoute(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['routes'] });
    },
  });
};
