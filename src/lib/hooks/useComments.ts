import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { commentsApi, type CreateCommentRequest } from '../api/comments';
import { reportKeys } from './useReports';

// Query keys for comments
export const commentKeys = {
  all: ['comments'] as const,
  report: (reportId: string | number) => [...commentKeys.all, 'report', reportId] as const,
  forumPost: (postId: string | number) => [...commentKeys.all, 'forumPost', postId] as const,
};

// Report comments
export const useComments = (reportId: string | number) => {
  return useQuery({
    queryKey: commentKeys.report(reportId),
    queryFn: () => commentsApi.getComments(reportId),
    enabled: !!reportId,
  });
};

export const useCreateComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ reportId, data }: { reportId: string | number; data: CreateCommentRequest }) =>
      commentsApi.createComment(reportId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: commentKeys.report(variables.reportId) });
      queryClient.invalidateQueries({ queryKey: reportKeys.detail(variables.reportId) });
    },
  });
};

export const useUpdateComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      commentId,
      content,
      reportId,
    }: {
      commentId: string | number;
      content: string;
      reportId: string | number;
    }) => commentsApi.updateComment(commentId, content).then(() => reportId),
    onSuccess: (reportId) => {
      queryClient.invalidateQueries({ queryKey: commentKeys.report(reportId) });
    },
  });
};

export const useDeleteComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ commentId, reportId }: { commentId: string | number; reportId: string | number }) =>
      commentsApi.deleteComment(commentId).then(() => reportId),
    onSuccess: (reportId) => {
      queryClient.invalidateQueries({ queryKey: commentKeys.report(reportId) });
      queryClient.invalidateQueries({ queryKey: reportKeys.detail(reportId) });
    },
  });
};

// Forum post comments
export const useForumPostComments = (postId: string | number) => {
  return useQuery({
    queryKey: commentKeys.forumPost(postId),
    queryFn: () => commentsApi.getForumPostComments(postId),
    enabled: !!postId,
  });
};

export const useCreateForumPostComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ postId, data }: { postId: string | number; data: CreateCommentRequest }) =>
      commentsApi.createForumPostComment(postId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: commentKeys.forumPost(variables.postId) });
      queryClient.invalidateQueries({ queryKey: ['forumPost'] });
    },
  });
};
