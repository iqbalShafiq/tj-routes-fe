import { useMutation, useQueryClient } from '@tanstack/react-query';
import { usersApi } from '../api/users';
import { followStatusKeys } from './useFollowStatus';
import { feedKeys } from './useFeed';
import { reportKeys } from './useReports';

export const useFollowUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string | number) => usersApi.followUser(userId),
    onSuccess: (_, userId) => {
      queryClient.invalidateQueries({ queryKey: followStatusKeys.status(userId) });
      queryClient.invalidateQueries({ queryKey: feedKeys.all });
      queryClient.invalidateQueries({ queryKey: reportKeys.all });
    },
  });
};

export const useUnfollowUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string | number) => usersApi.unfollowUser(userId),
    onSuccess: (_, userId) => {
      queryClient.invalidateQueries({ queryKey: followStatusKeys.status(userId) });
      queryClient.invalidateQueries({ queryKey: feedKeys.all });
      queryClient.invalidateQueries({ queryKey: reportKeys.all });
    },
  });
};
