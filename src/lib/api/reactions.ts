import apiClient from './client';

export type ReactionType = 'upvote' | 'downvote';

export interface ReactRequest {
  type: ReactionType;
}

export interface MessageResponse {
  success: boolean;
  message: string;
}

export const reactionsApi = {
  // Report reactions
  reactToReport: async (reportId: number | string, type: ReactionType): Promise<void> => {
    await apiClient.post<MessageResponse>(`/api/v1/reports/${reportId}/react`, { type });
  },

  removeReportReaction: async (reportId: number | string): Promise<void> => {
    await apiClient.delete(`/api/v1/reports/${reportId}/react`);
  },

  // Comment reactions
  reactToComment: async (commentId: number | string, type: ReactionType): Promise<void> => {
    await apiClient.post<MessageResponse>(`/api/v1/comments/${commentId}/react`, { type });
  },

  removeCommentReaction: async (commentId: number | string): Promise<void> => {
    await apiClient.delete(`/api/v1/comments/${commentId}/react`);
  },
};

