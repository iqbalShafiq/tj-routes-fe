import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reportsApi, type CreateReportRequest, type UpdateReportStatusRequest } from '../api/reports';
import { commentsApi, type CreateCommentRequest } from '../api/comments';
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
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['report', variables.reportId] });
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      queryClient.invalidateQueries({ queryKey: ['feed'] });
    },
  });
};

export const useRemoveReportReaction = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (reportId: string | number) =>
      reactionsApi.removeReportReaction(reportId).then(() => reportId),
    onSuccess: (reportId) => {
      queryClient.invalidateQueries({ queryKey: ['report', reportId] });
      queryClient.invalidateQueries({ queryKey: ['reports'] });
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
