import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { routesApi, type CreateRouteRequest } from '../api/routes';
import type { Stop } from '../api/stops';

// Query keys for routes
export const routeKeys = {
  all: ['routes'] as const,
  lists: () => [...routeKeys.all, 'list'] as const,
  list: (page: number, limit: number, search?: string) =>
    [...routeKeys.lists(), { page, limit, search }] as const,
  details: () => [...routeKeys.all, 'detail'] as const,
  detail: (id: string | number) => [...routeKeys.details(), id] as const,
  withStats: (id: string | number) => [...routeKeys.detail(id), 'withStats'] as const,
  stops: (id: string | number) => [...routeKeys.detail(id), 'stops'] as const,
};

export const useRoutes = (page: number = 1, limit: number = 20, search?: string) => {
  return useQuery({
    queryKey: routeKeys.list(page, limit, search),
    queryFn: () => routesApi.getRoutes(page, limit, search ? { search } : undefined),
  });
};

export const useRoute = (id: string | number) => {
  return useQuery({
    queryKey: routeKeys.detail(id),
    queryFn: () => routesApi.getRoute(id),
    enabled: !!id,
  });
};

export const useRouteWithStats = (id: string | number) => {
  return useQuery({
    queryKey: routeKeys.withStats(id),
    queryFn: () => routesApi.getRouteWithStats(id),
    enabled: !!id,
  });
};

export const useRouteStops = (routeId: string | number | undefined) => {
  return useQuery({
    queryKey: routeKeys.stops(routeId!),
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
      queryClient.invalidateQueries({ queryKey: routeKeys.all });
    },
  });
};

export const useUpdateRoute = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string | number; data: Partial<Omit<CreateRouteRequest, 'stop_ids'>> }) =>
      routesApi.updateRoute(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: routeKeys.lists() });
      queryClient.invalidateQueries({ queryKey: routeKeys.detail(variables.id) });
    },
  });
};

export const useDeleteRoute = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string | number) => routesApi.deleteRoute(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: routeKeys.all });
    },
  });
};
