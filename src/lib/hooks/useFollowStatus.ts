import { useQuery } from '@tanstack/react-query';
import { usersApi } from '../api/users';

export const useFollowStatus = (userId: string | number, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['follow-status', userId],
    queryFn: () => usersApi.getFollowStatus(userId),
    enabled: enabled && !!userId,
  });
};

