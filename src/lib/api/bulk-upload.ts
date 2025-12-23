import apiClient from './client';

export type EntityType = 'route' | 'stop' | 'vehicle';
export type UploadStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface BulkUploadLog {
  id: number;
  entity_type: EntityType;
  file_path: string;
  status: UploadStatus;
  total_rows: number;
  success_count: number;
  duplicate_count: number;
  error_count: number;
  error_message?: string | null;
  user_id: number;
  last_processed_row: number;
  last_updated_at: string;
  job_id?: string | null;
  created_at: string;
  updated_at: string;
}

export interface BulkUploadResponse {
  success: boolean;
  data: BulkUploadLog;
}

export interface BulkUploadListResponse {
  success: boolean;
  data: {
    uploads: BulkUploadLog[];
    total: number;
    page: number;
    limit: number;
  };
}

export const bulkUploadApi = {
  uploadCSV: async (entityType: EntityType, file: File): Promise<BulkUploadLog> => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await apiClient.post<BulkUploadResponse>(
      `/api/v1/bulk-upload/${entityType}`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    return response.data.data;
  },

  getUploadStatus: async (id: number | string): Promise<BulkUploadLog> => {
    const response = await apiClient.get<BulkUploadResponse>(`/api/v1/bulk-upload/${id}`);
    return response.data.data;
  },

  getUploads: async (
    page: number = 1,
    limit: number = 20,
    options?: {
      entity_type?: EntityType;
      status?: UploadStatus;
      user_id?: number;
    }
  ): Promise<{
    data: BulkUploadLog[];
    total: number;
    page: number;
    limit: number;
    total_pages: number;
  }> => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    if (options?.entity_type) params.append('entity_type', options.entity_type);
    if (options?.status) params.append('status', options.status);
    if (options?.user_id) params.append('user_id', options.user_id.toString());

    const response = await apiClient.get<BulkUploadListResponse>(`/api/v1/bulk-upload?${params}`);
    
    if (response.data.success && response.data.data.uploads) {
      const total = response.data.data.total;
      const total_pages = Math.ceil(total / limit);
      return {
        data: response.data.data.uploads,
        total,
        page: response.data.data.page,
        limit: response.data.data.limit,
        total_pages,
      };
    }
    return { data: [], total: 0, page, limit, total_pages: 0 };
  },
};

