import { useQuery } from '@tanstack/react-query';
import { usersApi } from '../api/users';

// Query keys for follow status
export const followStatusKeys = {
  all: ['follow-status'] as const,
  status: (userId: string | number) => [...followStatusKeys.all, userId] as const,
};

export const useFollowStatus = (userId: string | number, enabled: boolean = true) => {
  return useQuery({
    queryKey: followStatusKeys.status(userId),
    queryFn: () => usersApi.getFollowStatus(userId),
    enabled: enabled && !!userId,
  });
};
