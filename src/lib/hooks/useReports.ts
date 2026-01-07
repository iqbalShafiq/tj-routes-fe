import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reportsApi, type CreateReportRequest, type UpdateReportStatusRequest, type Report } from '../api/reports';
import { commentsApi, type CreateCommentRequest, type Comment } from '../api/comments';
import { reactionsApi, type ReactionType } from '../api/reactions';

// Query keys for reports
export const reportKeys = {
  all: ['reports'] as const,
  lists: () => [...reportKeys.all, 'list'] as const,
  list: (page: number, limit: number, options?: any) =>
    [...reportKeys.lists(), { page, limit, ...options }] as const,
  details: () => [...reportKeys.all, 'detail'] as const,
  detail: (id: string | number) => [...reportKeys.details(), id] as const,
  userReports: (userId: string | number) => [...reportKeys.all, 'user', userId] as const,
  comments: (reportId: string | number) => [...reportKeys.all, 'comments', reportId] as const,
};

export const useReports = (
  page: number = 1,
  limit: number = 20,
  options?: {
    status?: 'pending' | 'reviewed' | 'resolved';
    type?: string;
    search?: string;
  }
) => {
  return useQuery({
    queryKey: reportKeys.list(page, limit, options),
    queryFn: () => reportsApi.getReports(page, limit, options),
  });
};

export const useReport = (id: string | number) => {
  return useQuery({
    queryKey: reportKeys.detail(id),
    queryFn: () => reportsApi.getReport(id),
    enabled: !!id,
  });
};

export const useCreateReport = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ data, photos, pdfs }: { data: CreateReportRequest; photos?: File[]; pdfs?: File[] }) =>
      reportsApi.createReport(data, photos, pdfs),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reportKeys.all });
    },
  });
};

export const useUpdateReportStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string | number; data: UpdateReportStatusRequest }) =>
      reportsApi.updateReportStatus(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: reportKeys.lists() });
      queryClient.invalidateQueries({ queryKey: reportKeys.detail(variables.id) });
    },
  });
};

export const useDeleteReport = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string | number) => reportsApi.deleteReport(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reportKeys.all });
    },
  });
};

// Comments hooks
export const useComments = (reportId: string | number) => {
  return useQuery({
    queryKey: reportKeys.comments(reportId),
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
      queryClient.invalidateQueries({ queryKey: reportKeys.comments(variables.reportId) });
      queryClient.invalidateQueries({ queryKey: reportKeys.detail(variables.reportId) });
    },
  });
};

export const useUpdateComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ commentId, content, reportId }: { commentId: string | number; content: string; reportId: string | number }) =>
      commentsApi.updateComment(commentId, content).then(() => reportId),
    onSuccess: (reportId) => {
      queryClient.invalidateQueries({ queryKey: reportKeys.comments(reportId) });
    },
  });
};

export const useDeleteComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ commentId, reportId }: { commentId: string | number; reportId: string | number }) =>
      commentsApi.deleteComment(commentId).then(() => reportId),
    onSuccess: (reportId) => {
      queryClient.invalidateQueries({ queryKey: reportKeys.comments(reportId) });
      queryClient.invalidateQueries({ queryKey: reportKeys.detail(reportId) });
    },
  });
};

// Reactions hooks
export const useReactToReport = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ reportId, type }: { reportId: string | number; type: ReactionType }) =>
      reactionsApi.reactToReport(reportId, type),
    onMutate: async ({ reportId, type }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['feed'] });
      await queryClient.cancelQueries({ queryKey: reportKeys.detail(reportId) });

      // Snapshot previous value
      const previousReport = queryClient.getQueryData(reportKeys.detail(reportId));

      // Calculate the updated report data
      const updateReportData = (report: any) => {
        const alreadyReacted = report.user_reaction === type;
        if (alreadyReacted) {
          // Removing own reaction
          return {
            ...report,
            upvotes: type === 'upvote' ? report.upvotes - 1 : report.upvotes,
            downvotes: type === 'downvote' ? report.downvotes - 1 : report.downvotes,
            user_reaction: null,
          };
        } else {
          // Adding/changing reaction
          const wasUpvoted = report.user_reaction === 'upvote';
          const wasDownvoted = report.user_reaction === 'downvote';
          return {
            ...report,
            upvotes: type === 'upvote'
              ? report.upvotes + 1
              : (wasUpvoted ? report.upvotes - 1 : report.upvotes),
            downvotes: type === 'downvote'
              ? report.downvotes + 1
              : (wasDownvoted ? report.downvotes - 1 : report.downvotes),
            user_reaction: type,
          };
        }
      };

      // Optimistically update individual report query
      if (previousReport) {
        queryClient.setQueryData(reportKeys.detail(reportId), updateReportData(previousReport));
      }

      // Optimistically update feed
      queryClient.setQueryData(['feed'], (old: any) => {
        if (!old?.pages) return old;
        return {
          ...old,
          pages: old.pages.map((page: any) => ({
            ...page,
            data: page.data.map((report: any) => {
              if (report.id === reportId) {
                return updateReportData(report);
              }
              return report;
            }),
          })),
        };
      });

      return { previousReport };
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: reportKeys.detail(variables.reportId) });
      queryClient.invalidateQueries({ queryKey: ['feed'] });
    },
    onError: (_, variables, context) => {
      // Rollback on error
      if (context?.previousReport) {
        queryClient.setQueryData(reportKeys.detail(variables.reportId), context.previousReport);
      }
      queryClient.invalidateQueries({ queryKey: ['feed'] });
    },
  });
};

export const useRemoveReportReaction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (reportId: string | number) =>
      reactionsApi.removeReportReaction(reportId).then(() => reportId),
    onMutate: async (reportId) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['feed'] });
      await queryClient.cancelQueries({ queryKey: reportKeys.detail(reportId) });

      // Snapshot previous value
      const previousReport = queryClient.getQueryData(reportKeys.detail(reportId));

      // Calculate updated report data for removal
      const removeReactionData = (report: any) => ({
        ...report,
        upvotes: report.user_reaction === 'upvote' ? report.upvotes - 1 : report.upvotes,
        downvotes: report.user_reaction === 'downvote' ? report.downvotes - 1 : report.downvotes,
        user_reaction: null,
      });

      // Optimistically update individual report query
      if (previousReport && previousReport.user_reaction) {
        queryClient.setQueryData(reportKeys.detail(reportId), removeReactionData(previousReport));
      }

      // Optimistically update feed
      queryClient.setQueryData(['feed'], (old: any) => {
        if (!old?.pages) return old;
        return {
          ...old,
          pages: old.pages.map((page: any) => ({
            ...page,
            data: page.data.map((report: any) => {
              if (report.id === reportId && report.user_reaction) {
                return removeReactionData(report);
              }
              return report;
            }),
          })),
        };
      });

      return { previousReport };
    },
    onSuccess: (reportId) => {
      queryClient.invalidateQueries({ queryKey: reportKeys.detail(reportId) });
      queryClient.invalidateQueries({ queryKey: ['feed'] });
    },
    onError: (_, reportId, context) => {
      // Rollback on error
      if (context?.previousReport) {
        queryClient.setQueryData(reportKeys.detail(reportId), context.previousReport);
      }
      queryClient.invalidateQueries({ queryKey: ['feed'] });
    },
  });
};

export const useReactToComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ commentId, type, reportId }: { commentId: string | number; type: ReactionType; reportId: string | number }) =>
      reactionsApi.reactToComment(commentId, type).then(() => reportId),
    onSuccess: (reportId) => {
      queryClient.invalidateQueries({ queryKey: reportKeys.comments(reportId) });
    },
  });
};

export const useRemoveCommentReaction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ commentId, reportId }: { commentId: string | number; reportId: string | number }) =>
      reactionsApi.removeCommentReaction(commentId).then(() => reportId),
    onSuccess: (reportId) => {
      queryClient.invalidateQueries({ queryKey: reportKeys.comments(reportId) });
    },
  });
};

// Hook to get reports for a specific user (for profile page)
export const useUserReports = (
  userId: string | number | undefined,
  page: number = 1,
  limit: number = 10,
  options?: {
    status?: 'pending' | 'reviewed' | 'resolved';
    type?: string;
    search?: string;
  }
) => {
  return useQuery({
    queryKey: reportKeys.userReports(userId!),
    queryFn: () => reportsApi.getUserReports(userId!, page, limit, options),
    enabled: !!userId,
  });
};
