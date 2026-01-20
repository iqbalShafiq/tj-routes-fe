import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { usersApi } from '../api/users';
import { followStatusKeys } from './useFollowStatus';
import { feedKeys } from './useFeed';
import { reportKeys } from './useReports';

export const useFollowUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string | number) => usersApi.followUser(userId),
    onMutate: async (userId) => {
      await queryClient.cancelQueries({ queryKey: followStatusKeys.status(userId) });
      const previousStatus = queryClient.getQueryData(followStatusKeys.status(userId));
      queryClient.setQueryData(followStatusKeys.status(userId), true);
      return { previousStatus };
    },
    onSuccess: (_, userId) => {
      queryClient.invalidateQueries({ queryKey: followStatusKeys.all });
      queryClient.invalidateQueries({ queryKey: feedKeys.all });
      queryClient.invalidateQueries({ queryKey: reportKeys.all });
    },
    onError: (_, userId, context) => {
      if (context?.previousStatus !== undefined) {
        queryClient.setQueryData(followStatusKeys.status(userId), context.previousStatus);
      }
      queryClient.invalidateQueries({ queryKey: followStatusKeys.status(userId) });
    },
  });
};

export const useUnfollowUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string | number) => usersApi.unfollowUser(userId),
    onMutate: async (userId) => {
      await queryClient.cancelQueries({ queryKey: followStatusKeys.status(userId) });
      const previousStatus = queryClient.getQueryData(followStatusKeys.status(userId));
      queryClient.setQueryData(followStatusKeys.status(userId), false);
      return { previousStatus };
    },
    onSuccess: (_, userId) => {
      queryClient.invalidateQueries({ queryKey: followStatusKeys.all });
      queryClient.invalidateQueries({ queryKey: feedKeys.all });
      queryClient.invalidateQueries({ queryKey: reportKeys.all });
    },
    onError: (_, userId, context) => {
      if (context?.previousStatus !== undefined) {
        queryClient.setQueryData(followStatusKeys.status(userId), context.previousStatus);
      }
      queryClient.invalidateQueries({ queryKey: followStatusKeys.status(userId) });
    },
  });
};

// Friends query keys
export const friendsKeys = {
  all: ['friends'] as const,
  list: (userId: string | number) => [...friendsKeys.all, userId] as const,
};

// Hook to fetch friends (mutual follows)
export const useFriends = (userId: string | number, page = 1, limit = 20) => {
  return useQuery({
    queryKey: [...friendsKeys.list(userId), page, limit],
    queryFn: () => usersApi.getFriends(userId, page, limit),
    enabled: !!userId,
  });
};
