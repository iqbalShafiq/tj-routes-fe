import apiClient from './client';

export interface LeaderboardEntry {
  id: number;
  username: string;
  reputation_points: number;
  level: 'newcomer' | 'contributor' | 'trusted' | 'expert' | 'legend';
}

export interface LeaderboardResponse {
  success: boolean;
  data: {
    leaderboard: LeaderboardEntry[];
    limit: number;
  };
}

export interface Badge {
  id: number;
  name: string;
  description: string;
  icon: string;
  criteria_type: 'reports_accepted' | 'comments_made' | 'upvotes_received' | 'reputation_points';
  criteria_value: number;
  created_at: string;
  updated_at: string;
}

export interface UserBadge {
  id: number;
  user_id: number;
  badge_id: number;
  earned_at: string;
  badge: Badge;
}

export interface UserProfile {
  user: {
    id: number;
    username: string;
    email: string;
  };
  reputation_points: number;
  level: 'newcomer' | 'contributor' | 'trusted' | 'expert' | 'legend';
  badges: UserBadge[];
}

export interface UserProfileResponse {
  success: boolean;
  data: UserProfile;
}

export interface BadgesResponse {
  success: boolean;
  data: {
    badges: Badge[];
  };
}

export const leaderboardApi = {
  getLeaderboard: async (limit: number = 10): Promise<LeaderboardEntry[]> => {
    const response = await apiClient.get<LeaderboardResponse>(`/api/v1/leaderboard?limit=${limit}`);
    return response.data.data.leaderboard || [];
  },

  getUserProfile: async (userId: number | string): Promise<UserProfile> => {
    const response = await apiClient.get<UserProfileResponse>(`/api/v1/users/${userId}/profile`);
    return response.data.data;
  },

  getAllBadges: async (): Promise<Badge[]> => {
    const response = await apiClient.get<BadgesResponse>('/api/v1/badges');
    return response.data.data.badges || [];
  },
};

