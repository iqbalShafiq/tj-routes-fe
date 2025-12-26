import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { commentsApi, type CreateCommentRequest } from '../api/comments';

// Report comments
export const useComments = (reportId: string | number) => {
  return useQuery({
    queryKey: ['comments', 'report', reportId],
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
      queryClient.invalidateQueries({ queryKey: ['comments', 'report', variables.reportId] });
      queryClient.invalidateQueries({ queryKey: ['report', variables.reportId] });
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
      queryClient.invalidateQueries({ queryKey: ['comments', 'report', reportId] });
    },
  });
};

export const useDeleteComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ commentId, reportId }: { commentId: string | number; reportId: string | number }) =>
      commentsApi.deleteComment(commentId).then(() => reportId),
    onSuccess: (reportId) => {
      queryClient.invalidateQueries({ queryKey: ['comments', 'report', reportId] });
      queryClient.invalidateQueries({ queryKey: ['report', reportId] });
    },
  });
};

// Forum post comments
export const useForumPostComments = (postId: string | number) => {
  return useQuery({
    queryKey: ['comments', 'forumPost', postId],
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
      queryClient.invalidateQueries({ queryKey: ['comments', 'forumPost', variables.postId] });
      queryClient.invalidateQueries({ queryKey: ['forumPost'] });
    },
  });
};

