import { useQuery } from '@tanstack/react-query';
import { leaderboardApi } from '../api/leaderboard';

// Query keys for leaderboard
export const leaderboardKeys = {
  all: ['leaderboard'] as const,
  list: (limit: number) => [...leaderboardKeys.all, limit] as const,
  userProfiles: () => [...leaderboardKeys.all, 'userProfile'] as const,
  userProfile: (userId: string | number) => [...leaderboardKeys.userProfiles(), userId] as const,
  badges: () => ['badges'] as const,
};

export const useLeaderboard = (limit: number = 10) => {
  return useQuery({
    queryKey: leaderboardKeys.list(limit),
    queryFn: () => leaderboardApi.getLeaderboard(limit),
  });
};

export const useUserProfile = (userId: string | number) => {
  return useQuery({
    queryKey: leaderboardKeys.userProfile(userId),
    queryFn: () => leaderboardApi.getUserProfile(userId),
    enabled: !!userId,
  });
};

export const useBadges = () => {
  return useQuery({
    queryKey: leaderboardKeys.badges(),
    queryFn: () => leaderboardApi.getAllBadges(),
  });
};
