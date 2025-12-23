import { useQuery } from '@tanstack/react-query';
import { leaderboardApi } from '../api/leaderboard';

export const useLeaderboard = (limit: number = 10) => {
  return useQuery({
    queryKey: ['leaderboard', limit],
    queryFn: () => leaderboardApi.getLeaderboard(limit),
  });
};

export const useUserProfile = (userId: string | number) => {
  return useQuery({
    queryKey: ['userProfile', userId],
    queryFn: () => leaderboardApi.getUserProfile(userId),
    enabled: !!userId,
  });
};

export const useBadges = () => {
  return useQuery({
    queryKey: ['badges'],
    queryFn: () => leaderboardApi.getAllBadges(),
  });
};

