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
};

