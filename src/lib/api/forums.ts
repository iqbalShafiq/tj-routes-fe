import apiClient from './client';
import { API_ENDPOINTS } from '../utils/constants';
import type { Route } from './routes';
import type { User } from './auth';

export interface Forum {
  id: number;
  route_id: number;
  created_at: string;
  updated_at: string;
  route?: Route;
}

export interface ForumResponse {
  success: boolean;
  data: {
    forum: Forum;
    member_count: number;
    is_member: boolean;
  };
}

export interface ForumMember {
  id: number;
  forum_id: number;
  user_id: number;
  created_at: string;
  user: User;
}

export interface ForumMemberListResponse {
  success: boolean;
  data: {
    members: ForumMember[];
    total: number;
    page: number;
    limit: number;
  };
}

export interface MembershipStatusResponse {
  success: boolean;
  data: {
    is_member: boolean;
  };
}

export interface MessageResponse {
  success: boolean;
  message: string;
}

export const forumsApi = {
  getForumByRoute: async (routeId: string | number): Promise<ForumResponse['data']> => {
    const response = await apiClient.get<ForumResponse>(API_ENDPOINTS.forums.byRoute(routeId));
    return response.data.data;
  },

  getForum: async (forumId: string | number): Promise<ForumResponse['data']> => {
    const response = await apiClient.get<ForumResponse>(API_ENDPOINTS.forums.detail(forumId));
    return response.data.data;
  },

  joinForum: async (forumId: string | number): Promise<void> => {
    await apiClient.post<MessageResponse>(API_ENDPOINTS.forums.join(forumId));
  },

  leaveForum: async (forumId: string | number): Promise<void> => {
    await apiClient.delete<MessageResponse>(API_ENDPOINTS.forums.leave(forumId));
  },

  checkMembership: async (forumId: string | number): Promise<boolean> => {
    const response = await apiClient.get<MembershipStatusResponse>(API_ENDPOINTS.forums.membership(forumId));
    return response.data.data.is_member;
  },

  getForumMembers: async (
    forumId: string | number,
    page: number = 1,
    limit: number = 20
  ): Promise<{
    data: ForumMember[];
    total: number;
    page: number;
    limit: number;
    total_pages: number;
  }> => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    const response = await apiClient.get<ForumMemberListResponse>(
      `${API_ENDPOINTS.forums.members(forumId)}?${params}`
    );

    if (response.data.success && response.data.data.members) {
      const total = response.data.data.total;
      const total_pages = Math.ceil(total / limit);
      return {
        data: response.data.data.members,
        total,
        page: response.data.data.page,
        limit: response.data.data.limit,
        total_pages,
      };
    }
    return { data: [], total: 0, page, limit, total_pages: 0 };
  },
};

