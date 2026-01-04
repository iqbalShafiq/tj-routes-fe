import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  personalizedApi,
  type CreatePlaceRequest,
  type UpdatePlaceRequest,
  type CreateNavigationRequest,
  type UpdateNavigationRequest,
  type RecordRecentNavigationRequest,
} from '../api/personalized';

// =====================
// Favorite Routes Hooks
// =====================

export const useFavoriteRoutes = (page: number = 1, limit: number = 20) => {
  return useQuery({
    queryKey: ['favoriteRoutes', page, limit],
    queryFn: () => personalizedApi.getFavoriteRoutes(page, limit),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 0, // Don't retry on error
    throwOnError: false, // Don't throw, return error state
  });
};

export const useIsFavoriteRoute = (routeId: string | number | undefined) => {
  return useQuery({
    queryKey: ['isFavoriteRoute', routeId],
    queryFn: () => personalizedApi.isFavoriteRoute(routeId!),
    enabled: !!routeId,
  });
};

export const useToggleFavoriteRoute = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ routeId, isFavorite }: { routeId: number; isFavorite: boolean }) => {
      if (isFavorite) {
        await personalizedApi.removeFavoriteRoute(routeId);
      } else {
        await personalizedApi.addFavoriteRoute(routeId);
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['favoriteRoutes'] });
      queryClient.invalidateQueries({ queryKey: ['isFavoriteRoute', variables.routeId] });
    },
    retry: 0, // Don't retry on error
  });
};

export const useAddFavoriteRoute = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (routeId: number) => personalizedApi.addFavoriteRoute(routeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favoriteRoutes'] });
    },
  });
};

export const useRemoveFavoriteRoute = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (routeId: number) => personalizedApi.removeFavoriteRoute(routeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favoriteRoutes'] });
    },
  });
};

// =====================
// Favorite Stops Hooks
// =====================

export const useFavoriteStops = (page: number = 1, limit: number = 20) => {
  return useQuery({
    queryKey: ['favoriteStops', page, limit],
    queryFn: () => personalizedApi.getFavoriteStops(page, limit),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 0,
    throwOnError: false,
  });
};

export const useIsFavoriteStop = (stopId: string | number | undefined) => {
  return useQuery({
    queryKey: ['isFavoriteStop', stopId],
    queryFn: () => personalizedApi.isFavoriteStop(stopId!),
    enabled: !!stopId,
  });
};

export const useToggleFavoriteStop = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ stopId, isFavorite }: { stopId: number; isFavorite: boolean }) => {
      if (isFavorite) {
        await personalizedApi.removeFavoriteStop(stopId);
      } else {
        await personalizedApi.addFavoriteStop(stopId);
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['favoriteStops'] });
      queryClient.invalidateQueries({ queryKey: ['isFavoriteStop', variables.stopId] });
    },
    retry: 0, // Don't retry on error
  });
};

export const useAddFavoriteStop = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (stopId: number) => personalizedApi.addFavoriteStop(stopId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favoriteStops'] });
    },
  });
};

export const useRemoveFavoriteStop = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (stopId: number) => personalizedApi.removeFavoriteStop(stopId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favoriteStops'] });
    },
  });
};

// =====================
// Places Hooks
// =====================

export const usePlaces = () => {
  return useQuery({
    queryKey: ['places'],
    queryFn: () => personalizedApi.getPlaces(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 0,
    throwOnError: false,
  });
};

export const usePlace = (id: string | number | undefined) => {
  return useQuery({
    queryKey: ['place', id],
    queryFn: () => personalizedApi.getPlace(id!),
    enabled: !!id,
  });
};

export const useCreatePlace = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePlaceRequest) => personalizedApi.createPlace(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['places'] });
    },
  });
};

export const useUpdatePlace = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string | number; data: UpdatePlaceRequest }) =>
      personalizedApi.updatePlace(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['places'] });
      queryClient.invalidateQueries({ queryKey: ['place', variables.id] });
    },
  });
};

export const useDeletePlace = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string | number) => personalizedApi.deletePlace(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['places'] });
    },
  });
};

// =====================
// Recent Routes Hooks
// =====================

export const useRecentRoutes = (page: number = 1, limit: number = 20) => {
  return useQuery({
    queryKey: ['recentRoutes', page, limit],
    queryFn: () => personalizedApi.getRecentRoutes(page, limit),
    staleTime: 2 * 60 * 1000, // 2 minutes - recent items may change more often
    retry: 0,
    throwOnError: false,
  });
};

// =====================
// Recent Stops Hooks
// =====================

export const useRecentStops = (page: number = 1, limit: number = 20) => {
  return useQuery({
    queryKey: ['recentStops', page, limit],
    queryFn: () => personalizedApi.getRecentStops(page, limit),
    staleTime: 2 * 60 * 1000, // 2 minutes - recent items may change more often
    retry: 0,
    throwOnError: false,
  });
};

// =====================
// Recent Navigations Hooks
// =====================

export const useRecentNavigations = (page: number = 1, limit: number = 20) => {
  return useQuery({
    queryKey: ['recentNavigations', page, limit],
    queryFn: () => personalizedApi.getRecentNavigations(page, limit),
    staleTime: 2 * 60 * 1000, // 2 minutes - recent items may change more often
    retry: 0,
    throwOnError: false,
  });
};

export const useRecordRecentNavigation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: RecordRecentNavigationRequest) =>
      personalizedApi.recordRecentNavigation(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recentNavigations'] });
    },
  });
};

// =====================
// Saved Navigations Hooks
// =====================

export const useSavedNavigations = (page: number = 1, limit: number = 20) => {
  return useQuery({
    queryKey: ['savedNavigations', page, limit],
    queryFn: () => personalizedApi.getSavedNavigations(page, limit),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 0,
    throwOnError: false,
  });
};

export const useSavedNavigation = (id: string | number | undefined) => {
  return useQuery({
    queryKey: ['savedNavigation', id],
    queryFn: () => personalizedApi.getSavedNavigation(id!),
    enabled: !!id,
  });
};

export const useCreateSavedNavigation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateNavigationRequest) =>
      personalizedApi.createSavedNavigation(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['savedNavigations'] });
    },
  });
};

export const useUpdateSavedNavigation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string | number; data: UpdateNavigationRequest }) =>
      personalizedApi.updateSavedNavigation(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['savedNavigations'] });
      queryClient.invalidateQueries({ queryKey: ['savedNavigation', variables.id] });
    },
  });
};

export const useDeleteSavedNavigation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string | number) => personalizedApi.deleteSavedNavigation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['savedNavigations'] });
    },
  });
};
