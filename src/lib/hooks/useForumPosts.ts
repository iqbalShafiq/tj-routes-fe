import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { forumPostsApi, type CreateForumPostRequest, type UpdateForumPostRequest } from '../api/forum-posts';

export const useForumPosts = (
  forumId: string | number,
  page: number = 1,
  limit: number = 20,
  options?: {
    post_type?: 'discussion' | 'info' | 'question' | 'announcement';
    search?: string;
  }
) => {
  return useQuery({
    queryKey: ['forumPosts', forumId, page, limit, options],
    queryFn: () => forumPostsApi.getForumPosts(forumId, page, limit, options),
    enabled: !!forumId,
  });
};

export const useForumPostsInfinite = (
  forumId: string | number,
  limit: number = 20,
  options?: {
    post_type?: 'discussion' | 'info' | 'question' | 'announcement';
    search?: string;
  }
) => {
  return useInfiniteQuery({
    queryKey: ['forumPosts', 'infinite', forumId, limit, options],
    queryFn: ({ pageParam = 1 }) =>
      forumPostsApi.getForumPosts(forumId, pageParam, limit, options),
    getNextPageParam: (lastPage) => {
      if (lastPage.page < lastPage.total_pages) {
        return lastPage.page + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
    enabled: !!forumId,
  });
};

export const useForumPost = (forumId: string | number, postId: string | number) => {
  return useQuery({
    queryKey: ['forumPost', forumId, postId],
    queryFn: () => forumPostsApi.getForumPost(forumId, postId),
    enabled: !!forumId && !!postId,
  });
};

export const useCreateForumPost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      forumId,
      data,
      photos,
      pdfs,
    }: {
      forumId: string | number;
      data: CreateForumPostRequest;
      photos?: File[];
      pdfs?: File[];
    }) => forumPostsApi.createForumPost(forumId, data, photos, pdfs),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['forumPosts', variables.forumId] });
      queryClient.invalidateQueries({ queryKey: ['forum', variables.forumId] });
    },
  });
};

export const useUpdateForumPost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      forumId,
      postId,
      data,
    }: {
      forumId: string | number;
      postId: string | number;
      data: UpdateForumPostRequest;
    }) => forumPostsApi.updateForumPost(forumId, postId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['forumPost', variables.forumId, variables.postId] });
      queryClient.invalidateQueries({ queryKey: ['forumPosts', variables.forumId] });
    },
  });
};

export const useDeleteForumPost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ forumId, postId }: { forumId: string | number; postId: string | number }) =>
      forumPostsApi.deleteForumPost(forumId, postId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['forumPosts', variables.forumId] });
      queryClient.invalidateQueries({ queryKey: ['forum', variables.forumId] });
    },
  });
};

export const usePinForumPost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ forumId, postId }: { forumId: string | number; postId: string | number }) =>
      forumPostsApi.pinForumPost(forumId, postId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['forumPost', variables.forumId, variables.postId] });
      queryClient.invalidateQueries({ queryKey: ['forumPosts', variables.forumId] });
    },
  });
};

export const useUnpinForumPost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ forumId, postId }: { forumId: string | number; postId: string | number }) =>
      forumPostsApi.unpinForumPost(forumId, postId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['forumPost', variables.forumId, variables.postId] });
      queryClient.invalidateQueries({ queryKey: ['forumPosts', variables.forumId] });
    },
  });
};

