import apiClient from './client';
import { API_ENDPOINTS } from '../utils/constants';
import type { Forum } from './forums';
import type { User } from './auth';
import type { Report } from './reports';

export interface ForumPost {
  id: number;
  forum_id: number;
  user_id: number;
  post_type: 'discussion' | 'info' | 'question' | 'announcement';
  title: string;
  content: string;
  linked_report_id?: number | null;
  is_pinned: boolean;
  photo_urls?: string[] | null;
  pdf_urls?: string[] | null;
  upvotes: number;
  downvotes: number;
  comment_count: number;
  created_at: string;
  updated_at: string;
  user?: User;
  forum?: Forum;
  linked_report?: Report;
}

export interface ForumPostListResponse {
  success: boolean;
  data: {
    posts: ForumPost[];
    total: number;
    page: number;
    limit: number;
  };
}

export interface ForumPostResponse {
  success: boolean;
  data: ForumPost;
}

export interface CreateForumPostRequest {
  post_type: 'discussion' | 'info' | 'question' | 'announcement';
  title: string;
  content: string;
  linked_report_id?: number | null;
}

export interface UpdateForumPostRequest {
  title: string;
  content: string;
  post_type?: 'discussion' | 'info' | 'question' | 'announcement' | null;
}

export interface MessageResponse {
  success: boolean;
  message: string;
}

export const forumPostsApi = {
  getForumPosts: async (
    forumId: string | number,
    page: number = 1,
    limit: number = 20,
    options?: {
      post_type?: 'discussion' | 'info' | 'question' | 'announcement';
      search?: string;
    }
  ): Promise<{
    data: ForumPost[];
    total: number;
    page: number;
    limit: number;
    total_pages: number;
  }> => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    if (options?.post_type) params.append('post_type', options.post_type);
    if (options?.search) params.append('search', options.search);

    const response = await apiClient.get<ForumPostListResponse>(
      `${API_ENDPOINTS.forums.posts(forumId)}?${params}`
    );

    if (response.data.success && response.data.data.posts) {
      const total = response.data.data.total;
      const total_pages = Math.ceil(total / limit);
      return {
        data: response.data.data.posts,
        total,
        page: response.data.data.page,
        limit: response.data.data.limit,
        total_pages,
      };
    }
    return { data: [], total: 0, page, limit, total_pages: 0 };
  },

  createForumPost: async (
    forumId: string | number,
    data: CreateForumPostRequest,
    photos?: File[],
    pdfs?: File[]
  ): Promise<ForumPost> => {
    const formData = new FormData();
    formData.append('data', JSON.stringify(data));

    if (photos) {
      photos.forEach((photo) => {
        formData.append('photos', photo);
      });
    }
    if (pdfs) {
      pdfs.forEach((pdf) => {
        formData.append('pdfs', pdf);
      });
    }

    const response = await apiClient.post<ForumPostResponse>(
      API_ENDPOINTS.forums.posts(forumId),
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
      }
    );
    return response.data.data;
  },

  getForumPost: async (forumId: string | number, postId: string | number): Promise<ForumPost> => {
    const response = await apiClient.get<ForumPostResponse>(
      API_ENDPOINTS.forums.postDetail(forumId, postId)
    );
    return response.data.data;
  },

  updateForumPost: async (
    forumId: string | number,
    postId: string | number,
    data: UpdateForumPostRequest
  ): Promise<ForumPost> => {
    const response = await apiClient.put<ForumPostResponse>(
      API_ENDPOINTS.forums.postDetail(forumId, postId),
      data
    );
    return response.data.data;
  },

  deleteForumPost: async (forumId: string | number, postId: string | number): Promise<void> => {
    await apiClient.delete(API_ENDPOINTS.forums.postDetail(forumId, postId));
  },

  pinForumPost: async (forumId: string | number, postId: string | number): Promise<ForumPost> => {
    const response = await apiClient.post<ForumPostResponse>(
      API_ENDPOINTS.forums.pinPost(forumId, postId)
    );
    return response.data.data;
  },

  unpinForumPost: async (forumId: string | number, postId: string | number): Promise<ForumPost> => {
    const response = await apiClient.delete<ForumPostResponse>(
      API_ENDPOINTS.forums.pinPost(forumId, postId)
    );
    return response.data.data;
  },
};

