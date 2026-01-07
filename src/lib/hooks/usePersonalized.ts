import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  personalizedApi,
  type CreatePlaceRequest,
  type UpdatePlaceRequest,
  type CreateNavigationRequest,
  type UpdateNavigationRequest,
  type RecordRecentNavigationRequest,
} from '../api/personalized';

// Query keys for personalized content
export const personalizedKeys = {
  // Favorite Routes
  favoriteRoutes: {
    all: () => ['favoriteRoutes'] as const,
    list: (page: number, limit: number) => ['favoriteRoutes', page, limit] as const,
  },
  isFavoriteRoute: (routeId: string | number) => ['isFavoriteRoute', routeId] as const,

  // Favorite Stops
  favoriteStops: {
    all: () => ['favoriteStops'] as const,
    list: (page: number, limit: number) => ['favoriteStops', page, limit] as const,
  },
  isFavoriteStop: (stopId: string | number) => ['isFavoriteStop', stopId] as const,

  // Places
  places: {
    all: () => ['places'] as const,
  },
  place: (id: string | number) => ['place', id] as const,

  // Recent Routes
  recentRoutes: {
    all: () => ['recentRoutes'] as const,
    list: (page: number, limit: number) => ['recentRoutes', page, limit] as const,
  },

  // Recent Stops
  recentStops: {
    all: () => ['recentStops'] as const,
    list: (page: number, limit: number) => ['recentStops', page, limit] as const,
  },

  // Recent Navigations
  recentNavigations: {
    all: () => ['recentNavigations'] as const,
    list: (page: number, limit: number) => ['recentNavigations', page, limit] as const,
  },

  // Saved Navigations
  savedNavigations: {
    all: () => ['savedNavigations'] as const,
    list: (page: number, limit: number) => ['savedNavigations', page, limit] as const,
  },
  savedNavigation: (id: string | number) => ['savedNavigation', id] as const,
};

// =====================
// Favorite Routes Hooks
// =====================

export const useFavoriteRoutes = (page: number = 1, limit: number = 20) => {
  return useQuery({
    queryKey: personalizedKeys.favoriteRoutes.list(page, limit),
    queryFn: () => personalizedApi.getFavoriteRoutes(page, limit),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 0, // Don't retry on error
    throwOnError: false, // Don't throw, return error state
  });
};

export const useIsFavoriteRoute = (routeId: string | number | undefined) => {
  return useQuery({
    queryKey: personalizedKeys.isFavoriteRoute(routeId!),
    queryFn: () => personalizedApi.isFavoriteRoute(Number(routeId)),
    enabled: !!routeId,
  });
};

export const useToggleFavoriteRoute = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ routeId, isFavorite }: { routeId: number; isFavorite: boolean }) => {
      if (isFavorite) {
        return personalizedApi.removeFavoriteRoute(routeId);
      }
      return personalizedApi.addFavoriteRoute(routeId);
    },
    onMutate: async ({ routeId, isFavorite }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: personalizedKeys.isFavoriteRoute(routeId) });
      await queryClient.cancelQueries({ queryKey: personalizedKeys.favoriteRoutes.all() });

      // Snapshot previous value
      const previousIsFavorite = queryClient.getQueryData(personalizedKeys.isFavoriteRoute(routeId));
      const previousFavoriteRoutes = queryClient.getQueryData(personalizedKeys.favoriteRoutes.all());

      // Optimistically update the cache
      queryClient.setQueryData(personalizedKeys.isFavoriteRoute(routeId), !isFavorite);

      // Also update the favorite routes list if needed
      queryClient.setQueryData(personalizedKeys.favoriteRoutes.all(), (old: any) => {
        if (!old?.data) return old;
        if (isFavorite) {
          // Removing: filter out the route
          return {
            ...old,
            data: old.data.filter((item: any) => item.route?.id !== routeId),
            total: (old.total || old.data.length) - 1,
          };
        }
        // Adding: won't show until refetch
        return old;
      });

      return { previousIsFavorite, previousFavoriteRoutes };
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: personalizedKeys.isFavoriteRoute(variables.routeId) });
      queryClient.invalidateQueries({ queryKey: personalizedKeys.favoriteRoutes.all() });
    },
    onError: (_, variables, context) => {
      // Rollback on error
      if (context?.previousIsFavorite) {
        queryClient.setQueryData(personalizedKeys.isFavoriteRoute(variables.routeId), context.previousIsFavorite);
      }
      if (context?.previousFavoriteRoutes) {
        queryClient.setQueryData(personalizedKeys.favoriteRoutes.all(), context.previousFavoriteRoutes);
      }
    },
    retry: 0, // Don't retry on error
  });
};

export const useAddFavoriteRoute = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (routeId: number) => personalizedApi.addFavoriteRoute(routeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: personalizedKeys.favoriteRoutes.all() });
    },
  });
};

export const useRemoveFavoriteRoute = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (routeId: number) => personalizedApi.removeFavoriteRoute(routeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: personalizedKeys.favoriteRoutes.all() });
    },
  });
};

// =====================
// Favorite Stops Hooks
// =====================

export const useFavoriteStops = (page: number = 1, limit: number = 20) => {
  return useQuery({
    queryKey: personalizedKeys.favoriteStops.list(page, limit),
    queryFn: () => personalizedApi.getFavoriteStops(page, limit),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 0,
    throwOnError: false,
  });
};

export const useIsFavoriteStop = (stopId: string | number | undefined) => {
  return useQuery({
    queryKey: personalizedKeys.isFavoriteStop(stopId!),
    queryFn: () => personalizedApi.isFavoriteStop(Number(stopId)),
    enabled: !!stopId,
  });
};

export const useToggleFavoriteStop = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ stopId, isFavorite }: { stopId: number; isFavorite: boolean }) => {
      if (isFavorite) {
        return personalizedApi.removeFavoriteStop(stopId);
      }
      return personalizedApi.addFavoriteStop(stopId);
    },
    onMutate: async ({ stopId, isFavorite }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: personalizedKeys.isFavoriteStop(stopId) });
      await queryClient.cancelQueries({ queryKey: personalizedKeys.favoriteStops.all() });

      // Snapshot previous value
      const previousIsFavorite = queryClient.getQueryData(personalizedKeys.isFavoriteStop(stopId));
      const previousFavoriteStops = queryClient.getQueryData(personalizedKeys.favoriteStops.all());

      // Optimistically update the cache
      queryClient.setQueryData(personalizedKeys.isFavoriteStop(stopId), !isFavorite);

      // Also update the favorite stops list if needed
      queryClient.setQueryData(personalizedKeys.favoriteStops.all(), (old: any) => {
        if (!old?.data) return old;
        if (isFavorite) {
          // Removing: filter out the stop
          return {
            ...old,
            data: old.data.filter((item: any) => item.stop?.id !== stopId),
            total: (old.total || old.data.length) - 1,
          };
        }
        // Adding: won't show until refetch
        return old;
      });

      return { previousIsFavorite, previousFavoriteStops };
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: personalizedKeys.isFavoriteStop(variables.stopId) });
      queryClient.invalidateQueries({ queryKey: personalizedKeys.favoriteStops.all() });
    },
    onError: (_, variables, context) => {
      // Rollback on error
      if (context?.previousIsFavorite) {
        queryClient.setQueryData(personalizedKeys.isFavoriteStop(variables.stopId), context.previousIsFavorite);
      }
      if (context?.previousFavoriteStops) {
        queryClient.setQueryData(personalizedKeys.favoriteStops.all(), context.previousFavoriteStops);
      }
    },
    retry: 0, // Don't retry on error
  });
};

export const useAddFavoriteStop = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (stopId: number) => personalizedApi.addFavoriteStop(stopId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: personalizedKeys.favoriteStops.all() });
    },
  });
};

export const useRemoveFavoriteStop = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (stopId: number) => personalizedApi.removeFavoriteStop(stopId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: personalizedKeys.favoriteStops.all() });
    },
  });
};

// =====================
// Places Hooks
// =====================

export const usePlaces = () => {
  return useQuery({
    queryKey: personalizedKeys.places.all(),
    queryFn: () => personalizedApi.getPlaces(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 0,
    throwOnError: false,
  });
};

export const usePlace = (id: string | number | undefined) => {
  return useQuery({
    queryKey: personalizedKeys.place(id!),
    queryFn: () => personalizedApi.getPlace(id!),
    enabled: !!id,
  });
};

export const useCreatePlace = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePlaceRequest) => personalizedApi.createPlace(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: personalizedKeys.places.all() });
    },
  });
};

export const useUpdatePlace = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string | number; data: UpdatePlaceRequest }) =>
      personalizedApi.updatePlace(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: personalizedKeys.places.all() });
      queryClient.invalidateQueries({ queryKey: personalizedKeys.place(variables.id) });
    },
  });
};

export const useDeletePlace = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string | number) => personalizedApi.deletePlace(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: personalizedKeys.places.all() });
    },
  });
};

// =====================
// Recent Routes Hooks
// =====================

export const useRecentRoutes = (page: number = 1, limit: number = 20) => {
  return useQuery({
    queryKey: personalizedKeys.recentRoutes.list(page, limit),
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
    queryKey: personalizedKeys.recentStops.list(page, limit),
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
    queryKey: personalizedKeys.recentNavigations.list(page, limit),
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
      queryClient.invalidateQueries({ queryKey: personalizedKeys.recentNavigations.all() });
    },
  });
};

// =====================
// Saved Navigations Hooks
// =====================

export const useSavedNavigations = (page: number = 1, limit: number = 20) => {
  return useQuery({
    queryKey: personalizedKeys.savedNavigations.list(page, limit),
    queryFn: () => personalizedApi.getSavedNavigations(page, limit),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 0,
    throwOnError: false,
  });
};

export const useSavedNavigation = (id: string | number | undefined) => {
  return useQuery({
    queryKey: personalizedKeys.savedNavigation(id!),
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
      queryClient.invalidateQueries({ queryKey: personalizedKeys.savedNavigations.all() });
    },
  });
};

export const useUpdateSavedNavigation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string | number; data: UpdateNavigationRequest }) =>
      personalizedApi.updateSavedNavigation(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: personalizedKeys.savedNavigations.all() });
      queryClient.invalidateQueries({ queryKey: personalizedKeys.savedNavigation(variables.id) });
    },
  });
};

export const useDeleteSavedNavigation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string | number) => personalizedApi.deleteSavedNavigation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: personalizedKeys.savedNavigations.all() });
    },
  });
};
