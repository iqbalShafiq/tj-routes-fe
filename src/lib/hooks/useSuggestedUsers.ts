import { useMemo } from 'react';
import { useUsers } from './useUsers';
import { useAuth } from './useAuth';

export const suggestedUserKeys = {
  all: ['suggestedUsers'] as const,
  list: (limit: number) => [...suggestedUserKeys.all, limit] as const,
};

export const useSuggestedUsers = (limit: number = 5) => {
  const { user: currentUser } = useAuth();
  const { data, isLoading, error } = useUsers(1, 50);

  const suggestedUsers = useMemo(() => {
    if (!data?.data || !currentUser) return [];
    return data.data
      .filter((user) => user.id !== currentUser.id)
      .sort((a, b) => (b.reputation_points || 0) - (a.reputation_points || 0))
      .slice(0, limit);
  }, [data, currentUser, limit]);

  return { data: suggestedUsers, isLoading, error };
};
