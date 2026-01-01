import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reportsApi, type CreateReportRequest, type UpdateReportStatusRequest, type Report } from '../api/reports';
import { commentsApi, type CreateCommentRequest, type Comment } from '../api/comments';
import { reactionsApi, type ReactionType } from '../api/reactions';

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
    queryKey: ['reports', page, limit, options],
    queryFn: () => reportsApi.getReports(page, limit, options),
  });
};

export const useReport = (id: string | number) => {
  return useQuery({
    queryKey: ['report', id],
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
      queryClient.invalidateQueries({ queryKey: ['reports'] });
    },
  });
};

export const useUpdateReportStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string | number; data: UpdateReportStatusRequest }) =>
      reportsApi.updateReportStatus(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      queryClient.invalidateQueries({ queryKey: ['report', variables.id] });
    },
  });
};

export const useDeleteReport = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string | number) => reportsApi.deleteReport(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
    },
  });
};

// Comments hooks
export const useComments = (reportId: string | number) => {
  return useQuery({
    queryKey: ['comments', reportId],
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
      queryClient.invalidateQueries({ queryKey: ['comments', variables.reportId] });
      queryClient.invalidateQueries({ queryKey: ['report', variables.reportId] });
    },
  });
};

export const useUpdateComment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ commentId, content, reportId }: { commentId: string | number; content: string; reportId: string | number }) =>
      commentsApi.updateComment(commentId, content).then(() => reportId),
    onSuccess: (reportId) => {
      queryClient.invalidateQueries({ queryKey: ['comments', reportId] });
    },
  });
};

export const useDeleteComment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ commentId, reportId }: { commentId: string | number; reportId: string | number }) =>
      commentsApi.deleteComment(commentId).then(() => reportId),
    onSuccess: (reportId) => {
      queryClient.invalidateQueries({ queryKey: ['comments', reportId] });
      queryClient.invalidateQueries({ queryKey: ['report', reportId] });
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
      await queryClient.cancelQueries({ queryKey: ['report', reportId] });

      // Snapshot previous value
      const previousReport = queryClient.getQueryData(['report', reportId]);

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
        queryClient.setQueryData(['report', reportId], updateReportData(previousReport));
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
      queryClient.invalidateQueries({ queryKey: ['report', variables.reportId] });
      queryClient.invalidateQueries({ queryKey: ['feed'] });
    },
    onError: (_, variables, context) => {
      // Rollback on error
      if (context?.previousReport) {
        queryClient.setQueryData(['report', variables.reportId], context.previousReport);
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
      await queryClient.cancelQueries({ queryKey: ['report', reportId] });

      // Snapshot previous value
      const previousReport = queryClient.getQueryData(['report', reportId]);

      // Calculate updated report data for removal
      const removeReactionData = (report: any) => ({
        ...report,
        upvotes: report.user_reaction === 'upvote' ? report.upvotes - 1 : report.upvotes,
        downvotes: report.user_reaction === 'downvote' ? report.downvotes - 1 : report.downvotes,
        user_reaction: null,
      });

      // Optimistically update individual report query
      if (previousReport && previousReport.user_reaction) {
        queryClient.setQueryData(['report', reportId], removeReactionData(previousReport));
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
      queryClient.invalidateQueries({ queryKey: ['report', reportId] });
      queryClient.invalidateQueries({ queryKey: ['feed'] });
    },
    onError: (_, reportId, context) => {
      // Rollback on error
      if (context?.previousReport) {
        queryClient.setQueryData(['report', reportId], context.previousReport);
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
      queryClient.invalidateQueries({ queryKey: ['comments', reportId] });
    },
  });
};

export const useRemoveCommentReaction = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ commentId, reportId }: { commentId: string | number; reportId: string | number }) =>
      reactionsApi.removeCommentReaction(commentId).then(() => reportId),
    onSuccess: (reportId) => {
      queryClient.invalidateQueries({ queryKey: ['comments', reportId] });
    },
  });
};
