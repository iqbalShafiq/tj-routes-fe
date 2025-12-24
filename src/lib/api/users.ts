import apiClient from './client';

export interface User {
  id: number;
  email: string;
  username: string;
  role: 'common_user' | 'admin';
  oauth_provider?: string | null;
  oauth_id?: string | null;
  reputation_points: number;
  level: 'newcomer' | 'contributor' | 'trusted' | 'expert' | 'legend';
  created_at: string;
  updated_at: string;
}

export interface UsersResponse {
  success: boolean;
  data: {
    users: User[];
    total: number;
    page: number;
    limit: number;
  };
}

export interface UserResponse {
  success: boolean;
  data: User;
}

export const usersApi = {
  getUsers: async (
    page: number = 1,
    limit: number = 20
  ): Promise<{
    data: User[];
    total: number;
    page: number;
    limit: number;
    total_pages: number;
  }> => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    const response = await apiClient.get<UsersResponse>(`/api/v1/users?${params}`);
    
    if (response.data.success && response.data.data.users) {
      const total = response.data.data.total;
      const total_pages = Math.ceil(total / limit);
      return {
        data: response.data.data.users,
        total,
        page: response.data.data.page,
        limit: response.data.data.limit,
        total_pages,
      };
    }
    return { data: [], total: 0, page, limit, total_pages: 0 };
  },

  getUser: async (id: number | string): Promise<User> => {
    const response = await apiClient.get<UserResponse>(`/api/v1/users/${id}`);
    return response.data.data;
  },

  updateUserRole: async (id: number | string, role: 'common_user' | 'admin'): Promise<void> => {
    await apiClient.put(`/api/v1/users/${id}/role`, { role });
  },

  followUser: async (id: number | string): Promise<void> => {
    await apiClient.post(`/api/v1/users/${id}/follow`);
  },

  unfollowUser: async (id: number | string): Promise<void> => {
    await apiClient.delete(`/api/v1/users/${id}/follow`);
  },

  getFollowStatus: async (id: number | string): Promise<boolean> => {
    const response = await apiClient.get<{
      success: boolean;
      data: {
        is_following: boolean;
      };
    }>(`/api/v1/users/${id}/follow-status`);
    return response.data.data.is_following;
  },

  getFollowers: async (
    id: number | string,
    page: number = 1,
    limit: number = 20
  ): Promise<{
    data: User[];
    total: number;
    page: number;
    limit: number;
    total_pages: number;
  }> => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    const response = await apiClient.get<{
      success: boolean;
      data: {
        followers: User[];
        total: number;
        page: number;
        limit: number;
      };
    }>(`/api/v1/users/${id}/followers?${params}`);
    
    if (response.data.success && response.data.data.followers) {
      const total = response.data.data.total;
      const total_pages = Math.ceil(total / limit);
      return {
        data: response.data.data.followers,
        total,
        page: response.data.data.page,
        limit: response.data.data.limit,
        total_pages,
      };
    }
    return { data: [], total: 0, page, limit, total_pages: 0 };
  },

  getFollowing: async (
    id: number | string,
    page: number = 1,
    limit: number = 20
  ): Promise<{
    data: User[];
    total: number;
    page: number;
    limit: number;
    total_pages: number;
  }> => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    const response = await apiClient.get<{
      success: boolean;
      data: {
        following: User[];
        total: number;
        page: number;
        limit: number;
      };
    }>(`/api/v1/users/${id}/following?${params}`);
    
    if (response.data.success && response.data.data.following) {
      const total = response.data.data.total;
      const total_pages = Math.ceil(total / limit);
      return {
        data: response.data.data.following,
        total,
        page: response.data.data.page,
        limit: response.data.data.limit,
        total_pages,
      };
    }
    return { data: [], total: 0, page, limit, total_pages: 0 };
  },
};

