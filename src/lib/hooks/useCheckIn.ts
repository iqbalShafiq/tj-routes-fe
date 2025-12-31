import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { checkinApi, type CreateCheckInRequest, type CompleteCheckInRequest, type CheckInFilters } from '../api/checkin';

// Query keys for check-ins
export const checkInKeys = {
  all: ['check-ins'] as const,
  lists: () => [...checkInKeys.all, 'list'] as const,
  list: (filters: CheckInFilters) => [...checkInKeys.lists(), filters] as const,
  details: () => [...checkInKeys.all, 'detail'] as const,
  detail: (id: string | number) => [...checkInKeys.details(), id] as const,
  active: () => [...checkInKeys.all, 'active'] as const,
  stats: () => [...checkInKeys.all, 'stats'] as const,
};

// Hook to list user's check-ins with pagination and filters
export const useCheckIns = (filters: CheckInFilters = {}) => {
  const { page = 1, limit = 10, status } = filters;

  return useQuery({
    queryKey: checkInKeys.list({ page, limit, status }),
    queryFn: () => checkinApi.list({ page, limit, status }),
  });
};

// Hook to get a single check-in by ID
export const useCheckIn = (id: string | number | undefined) => {
  return useQuery({
    queryKey: checkInKeys.detail(id ?? ''),
    queryFn: () => checkinApi.getById(id!),
    enabled: !!id,
  });
};

// Hook to get the active (in-progress) check-in for the current user
export const useActiveCheckIn = () => {
  return useQuery({
    queryKey: checkInKeys.active(),
    queryFn: () => checkinApi.getActive(),
    staleTime: 30000, // 30 seconds - more frequent updates for active check-in
    refetchInterval: 30000, // Poll every 30 seconds for updates
  });
};

// Hook to get user's check-in statistics
export const useCheckInStats = () => {
  return useQuery({
    queryKey: checkInKeys.stats(),
    queryFn: () => checkinApi.getStats(),
    staleTime: 60000, // 1 minute - stats don't change frequently
  });
};

// Hook to start a new check-in (create)
export const useStartCheckIn = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCheckInRequest) => checkinApi.create(data),
    onSuccess: () => {
      // Invalidate all check-in related queries
      queryClient.invalidateQueries({ queryKey: checkInKeys.all });
    },
  });
};

// Hook to complete an active check-in
export const useCompleteCheckIn = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string | number; data: CompleteCheckInRequest }) =>
      checkinApi.complete(id, data),
    onSuccess: () => {
      // Invalidate all check-in related queries
      queryClient.invalidateQueries({ queryKey: checkInKeys.all });
    },
  });
};

// Hook to delete a check-in
export const useDeleteCheckIn = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string | number) => checkinApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: checkInKeys.all });
    },
  });
};
