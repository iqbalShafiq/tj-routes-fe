import apiClient from './client';

export interface Comment {
  id: number;
  report_id: number;
  user_id: number;
  parent_id?: number | null;
  content: string;
  upvotes: number;
  downvotes: number;
  created_at: string;
  updated_at: string;
  user?: {
    id: number;
    username: string;
    level?: string;
  };
  replies?: Comment[];
}

export interface CommentsResponse {
  success: boolean;
  data: {
    comments: Comment[];
  };
}

export interface CommentResponse {
  success: boolean;
  data: Comment;
}

export interface CreateCommentRequest {
  content: string;
  parent_id?: number | null;
}

export const commentsApi = {
  getComments: async (reportId: number | string): Promise<Comment[]> => {
    const response = await apiClient.get<CommentsResponse>(`/api/v1/reports/${reportId}/comments`);
    return response.data.data.comments || [];
  },

  createComment: async (reportId: number | string, data: CreateCommentRequest): Promise<Comment> => {
    const response = await apiClient.post<CommentResponse>(`/api/v1/reports/${reportId}/comments`, data);
    return response.data.data;
  },

  updateComment: async (commentId: number | string, content: string): Promise<Comment> => {
    const response = await apiClient.put<CommentResponse>(`/api/v1/comments/${commentId}`, { content });
    return response.data.data;
  },

  deleteComment: async (commentId: number | string): Promise<void> => {
    await apiClient.delete(`/api/v1/comments/${commentId}`);
  },
};

