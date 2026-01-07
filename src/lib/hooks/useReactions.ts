import { useMutation, useQueryClient } from '@tanstack/react-query';
import { reactionsApi, type ReactionType } from '../api/reactions';
import { reportKeys } from './useReports';
import { commentKeys } from './useComments';

// Report reactions
export const useReactToReport = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ reportId, type }: { reportId: string | number; type: ReactionType }) =>
      reactionsApi.reactToReport(reportId, type),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: reportKeys.detail(variables.reportId) });
      queryClient.invalidateQueries({ queryKey: reportKeys.lists() });
    },
  });
};

export const useRemoveReportReaction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (reportId: string | number) =>
      reactionsApi.removeReportReaction(reportId).then(() => reportId),
    onSuccess: (reportId) => {
      queryClient.invalidateQueries({ queryKey: reportKeys.detail(reportId) });
      queryClient.invalidateQueries({ queryKey: reportKeys.lists() });
    },
  });
};

// Comment reactions (for reports)
export const useReactToComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      commentId,
      type,
      reportId,
    }: {
      commentId: string | number;
      type: ReactionType;
      reportId: string | number;
    }) => reactionsApi.reactToComment(commentId, type).then(() => reportId),
    onSuccess: (reportId) => {
      queryClient.invalidateQueries({ queryKey: commentKeys.report(reportId) });
    },
  });
};

export const useRemoveCommentReaction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ commentId, reportId }: { commentId: string | number; reportId: string | number }) =>
      reactionsApi.removeCommentReaction(commentId).then(() => reportId),
    onSuccess: (reportId) => {
      queryClient.invalidateQueries({ queryKey: commentKeys.report(reportId) });
    },
  });
};

// Comment reactions (for forum posts)
export const useReactToForumPostComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      commentId,
      type,
      postId,
    }: {
      commentId: string | number;
      type: ReactionType;
      postId: string | number;
    }) => reactionsApi.reactToComment(commentId, type).then(() => postId),
    onSuccess: (postId) => {
      queryClient.invalidateQueries({ queryKey: commentKeys.forumPost(postId) });
    },
  });
};

export const useRemoveForumPostCommentReaction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ commentId, postId }: { commentId: string | number; postId: string | number }) =>
      reactionsApi.removeCommentReaction(commentId).then(() => postId),
    onSuccess: (postId) => {
      queryClient.invalidateQueries({ queryKey: commentKeys.forumPost(postId) });
    },
  });
};

// Forum post reactions
export const useReactToForumPost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ postId, type }: { postId: string | number; type: ReactionType }) =>
      reactionsApi.reactToForumPost(postId, type),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['forumPost'] });
      queryClient.invalidateQueries({ queryKey: ['forumPosts'] });
    },
  });
};

export const useRemoveForumPostReaction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (postId: string | number) =>
      reactionsApi.removeForumPostReaction(postId).then(() => postId),
    onSuccess: (postId) => {
      queryClient.invalidateQueries({ queryKey: ['forumPost'] });
      queryClient.invalidateQueries({ queryKey: ['forumPosts'] });
    },
  });
};
