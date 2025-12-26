import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { routesApi, type CreateRouteRequest } from '../api/routes';
import type { Stop } from '../api/stops';

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

export const useRouteWithStats = (id: string | number) => {
  return useQuery({
    queryKey: ['route', id, 'withStats'],
    queryFn: () => routesApi.getRouteWithStats(id),
    enabled: !!id,
  });
};

export const useRouteStops = (routeId: string | number | undefined) => {
  return useQuery({
    queryKey: ['route', routeId, 'stops'],
    queryFn: async () => {
      if (!routeId) return [];
      const route = await routesApi.getRoute(routeId);
      // Extract stops from route_stops array
      if (route.route_stops && route.route_stops.length > 0) {
        return route.route_stops
          .map(routeStop => routeStop.stop)
          .filter((stop): stop is Stop => stop !== undefined);
      }
      // Fallback to stops array if route_stops is not available
      if (route.stops && route.stops.length > 0) {
        return route.stops;
      }
      return [];
    },
    enabled: !!routeId,
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
