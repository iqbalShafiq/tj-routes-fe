import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { bulkUploadApi, type EntityType, type UploadStatus } from '../api/bulk-upload';

export const useBulkUploads = (
  page: number = 1,
  limit: number = 20,
  options?: {
    entity_type?: EntityType;
    status?: UploadStatus;
    user_id?: number;
  }
) => {
  return useQuery({
    queryKey: ['bulkUploads', page, limit, options],
    queryFn: () => bulkUploadApi.getUploads(page, limit, options),
  });
};

export const useBulkUploadStatus = (id: string | number) => {
  return useQuery({
    queryKey: ['bulkUpload', id],
    queryFn: () => bulkUploadApi.getUploadStatus(id),
    enabled: !!id,
    refetchInterval: (query) => {
      const data = query.state.data;
      // Keep polling if status is pending or processing
      if (data && (data.status === 'pending' || data.status === 'processing')) {
        return 2000; // Poll every 2 seconds
      }
      return false;
    },
  });
};

export const useUploadCSV = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ entityType, file }: { entityType: EntityType; file: File }) =>
      bulkUploadApi.uploadCSV(entityType, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bulkUploads'] });
    },
  });
};

