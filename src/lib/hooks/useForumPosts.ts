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
    onSuccess: (newPost, variables) => {
      // Update infinite queries - add the new post to the first page
      // We update all infinite queries so the user sees the new post immediately
      const allInfiniteQueries = queryClient.getQueriesData({ queryKey: ['forumPosts', 'infinite', variables.forumId] });
      allInfiniteQueries.forEach(([queryKey]) => {
        queryClient.setQueryData(queryKey, (old: any) => {
          if (!old || !old.pages || old.pages.length === 0) return old;
          return {
            ...old,
            pages: old.pages.map((page: any, pageIndex: number) => {
              // Add the new post to the first page
              if (pageIndex === 0) {
                return {
                  ...page,
                  data: [newPost, ...page.data],
                  total: (page.total || 0) + 1,
                };
              }
              return page;
            }),
          };
        });
      });

      // Update regular queries - add the new post to the beginning of the data array
      queryClient.setQueryData(['forumPosts', variables.forumId], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          data: [newPost, ...old.data],
          total: (old.total || 0) + 1,
        };
      });

      // Note: We don't invalidate here to allow the optimistic update to be visible immediately
      // The cache update above is sufficient for immediate UI feedback
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
    onMutate: async ({ forumId, postId }) => {
      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({ queryKey: ['forumPost', forumId, postId] });
      await queryClient.cancelQueries({ queryKey: ['forumPosts', forumId] });

      // Snapshot the previous values
      const previousPost = queryClient.getQueryData(['forumPost', forumId, postId]);
      const previousPosts = queryClient.getQueryData(['forumPosts', forumId]);
      
      // Get all infinite query data to snapshot
      const allInfiniteQueries = queryClient.getQueriesData({ queryKey: ['forumPosts', 'infinite', forumId] });
      const previousInfiniteQueries = allInfiniteQueries.map(([queryKey, data]) => [queryKey, data]);

      // Optimistically update the post
      queryClient.setQueryData(['forumPost', forumId, postId], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          is_pinned: true,
        };
      });

      // Optimistically update the posts list (regular query)
      queryClient.setQueryData(['forumPosts', forumId], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          data: old.data.map((post: any) =>
            post.id === postId ? { ...post, is_pinned: true } : post
          ),
        };
      });

      // Optimistically update infinite queries
      allInfiniteQueries.forEach(([queryKey]) => {
        queryClient.setQueryData(queryKey, (old: any) => {
          if (!old) return old;
          return {
            ...old,
            pages: old.pages.map((page: any) => ({
              ...page,
              data: page.data.map((post: any) =>
                post.id === postId ? { ...post, is_pinned: true } : post
              ),
            })),
          };
        });
      });

      // Return a context object with the snapshotted values
      return { previousPost, previousPosts, previousInfiniteQueries };
    },
    onError: (err, variables, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousPost) {
        queryClient.setQueryData(['forumPost', variables.forumId, variables.postId], context.previousPost);
      }
      if (context?.previousPosts) {
        queryClient.setQueryData(['forumPosts', variables.forumId], context.previousPosts);
      }
      // Rollback infinite queries
      context?.previousInfiniteQueries?.forEach(([queryKey, data]) => {
        queryClient.setQueryData(queryKey, data);
      });
    },
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
    onMutate: async ({ forumId, postId }) => {
      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({ queryKey: ['forumPost', forumId, postId] });
      await queryClient.cancelQueries({ queryKey: ['forumPosts', forumId] });

      // Snapshot the previous values
      const previousPost = queryClient.getQueryData(['forumPost', forumId, postId]);
      const previousPosts = queryClient.getQueryData(['forumPosts', forumId]);
      
      // Get all infinite query data to snapshot
      const allInfiniteQueries = queryClient.getQueriesData({ queryKey: ['forumPosts', 'infinite', forumId] });
      const previousInfiniteQueries = allInfiniteQueries.map(([queryKey, data]) => [queryKey, data]);

      // Optimistically update the post
      queryClient.setQueryData(['forumPost', forumId, postId], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          is_pinned: false,
        };
      });

      // Optimistically update the posts list (regular query)
      queryClient.setQueryData(['forumPosts', forumId], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          data: old.data.map((post: any) =>
            post.id === postId ? { ...post, is_pinned: false } : post
          ),
        };
      });

      // Optimistically update infinite queries
      allInfiniteQueries.forEach(([queryKey]) => {
        queryClient.setQueryData(queryKey, (old: any) => {
          if (!old) return old;
          return {
            ...old,
            pages: old.pages.map((page: any) => ({
              ...page,
              data: page.data.map((post: any) =>
                post.id === postId ? { ...post, is_pinned: false } : post
              ),
            })),
          };
        });
      });

      // Return a context object with the snapshotted values
      return { previousPost, previousPosts, previousInfiniteQueries };
    },
    onError: (err, variables, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousPost) {
        queryClient.setQueryData(['forumPost', variables.forumId, variables.postId], context.previousPost);
      }
      if (context?.previousPosts) {
        queryClient.setQueryData(['forumPosts', variables.forumId], context.previousPosts);
      }
      // Rollback infinite queries
      context?.previousInfiniteQueries?.forEach(([queryKey, data]) => {
        queryClient.setQueryData(queryKey, data);
      });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['forumPost', variables.forumId, variables.postId] });
      queryClient.invalidateQueries({ queryKey: ['forumPosts', variables.forumId] });
    },
  });
};

