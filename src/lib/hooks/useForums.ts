import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { forumsApi } from '../api/forums';

export const useForumByRoute = (routeId: string | number) => {
  return useQuery({
    queryKey: ['forum', 'byRoute', routeId],
    queryFn: () => forumsApi.getForumByRoute(routeId),
    enabled: !!routeId,
  });
};

export const useForum = (forumId: string | number) => {
  return useQuery({
    queryKey: ['forum', forumId],
    queryFn: () => forumsApi.getForum(forumId),
    enabled: !!forumId,
  });
};

export const useForumMembership = (forumId: string | number) => {
  return useQuery({
    queryKey: ['forum', 'membership', forumId],
    queryFn: () => forumsApi.checkMembership(forumId),
    enabled: !!forumId,
  });
};

export const useForumMembers = (forumId: string | number, page: number = 1, limit: number = 20) => {
  return useQuery({
    queryKey: ['forum', 'members', forumId, page, limit],
    queryFn: () => forumsApi.getForumMembers(forumId, page, limit),
    enabled: !!forumId,
  });
};

export const useJoinForum = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (forumId: string | number) => forumsApi.joinForum(forumId),
    onMutate: async (forumId) => {
      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({ queryKey: ['forum'] });

      // Snapshot the previous values - need to update both byRoute and direct forum queries
      const allByRouteQueries = queryClient.getQueriesData({ queryKey: ['forum', 'byRoute'] });
      const allForumQueries = queryClient.getQueriesData({ queryKey: ['forum', forumId] });
      const previousMembership = queryClient.getQueryData(['forum', 'membership', forumId]);

      // Find and snapshot only the queries we're going to modify
      const previousByRouteQueries: Array<[any, any]> = [];
      const previousForumQueries: Array<[any, any]> = [];

      // Optimistically update byRoute queries (where forum data is accessed)
      allByRouteQueries.forEach(([queryKey, data]: [any, any]) => {
        if (data?.forum?.id === forumId) {
          previousByRouteQueries.push([queryKey, data]);
          queryClient.setQueryData(queryKey, {
            ...data,
            is_member: true,
            member_count: (data.member_count || 0) + 1,
          });
        }
      });

      // Optimistically update direct forum queries
      allForumQueries.forEach(([queryKey, data]: [any, any]) => {
        if (data?.forum?.id === forumId) {
          previousForumQueries.push([queryKey, data]);
          queryClient.setQueryData(queryKey, {
            ...data,
            is_member: true,
            member_count: (data.member_count || 0) + 1,
          });
        }
      });

      // Optimistically update membership status
      queryClient.setQueryData(['forum', 'membership', forumId], true);

      // Return a context object with the snapshotted values
      return { previousByRouteQueries, previousForumQueries, previousMembership };
    },
    onError: (err, forumId, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      context?.previousByRouteQueries?.forEach(([queryKey, data]: [any, any]) => {
        queryClient.setQueryData(queryKey, data);
      });
      context?.previousForumQueries?.forEach(([queryKey, data]: [any, any]) => {
        queryClient.setQueryData(queryKey, data);
      });
      if (context?.previousMembership !== undefined) {
        queryClient.setQueryData(['forum', 'membership', forumId], context.previousMembership);
      }
    },
    onSuccess: (_, forumId) => {
      queryClient.invalidateQueries({ queryKey: ['forum', forumId] });
      queryClient.invalidateQueries({ queryKey: ['forum', 'byRoute'] });
      queryClient.invalidateQueries({ queryKey: ['forum', 'membership', forumId] });
      queryClient.invalidateQueries({ queryKey: ['forum', 'members', forumId] });
    },
  });
};

export const useLeaveForum = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (forumId: string | number) => forumsApi.leaveForum(forumId),
    onMutate: async (forumId) => {
      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({ queryKey: ['forum'] });

      // Snapshot the previous values - need to update both byRoute and direct forum queries
      const allByRouteQueries = queryClient.getQueriesData({ queryKey: ['forum', 'byRoute'] });
      const allForumQueries = queryClient.getQueriesData({ queryKey: ['forum', forumId] });
      const previousMembership = queryClient.getQueryData(['forum', 'membership', forumId]);

      // Find and snapshot only the queries we're going to modify
      const previousByRouteQueries: Array<[any, any]> = [];
      const previousForumQueries: Array<[any, any]> = [];

      // Optimistically update byRoute queries (where forum data is accessed)
      allByRouteQueries.forEach(([queryKey, data]: [any, any]) => {
        if (data?.forum?.id === forumId) {
          previousByRouteQueries.push([queryKey, data]);
          queryClient.setQueryData(queryKey, {
            ...data,
            is_member: false,
            member_count: Math.max((data.member_count || 0) - 1, 0),
          });
        }
      });

      // Optimistically update direct forum queries
      allForumQueries.forEach(([queryKey, data]: [any, any]) => {
        if (data?.forum?.id === forumId) {
          previousForumQueries.push([queryKey, data]);
          queryClient.setQueryData(queryKey, {
            ...data,
            is_member: false,
            member_count: Math.max((data.member_count || 0) - 1, 0),
          });
        }
      });

      // Optimistically update membership status
      queryClient.setQueryData(['forum', 'membership', forumId], false);

      // Return a context object with the snapshotted values
      return { previousByRouteQueries, previousForumQueries, previousMembership };
    },
    onError: (err, forumId, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      context?.previousByRouteQueries?.forEach(([queryKey, data]: [any, any]) => {
        queryClient.setQueryData(queryKey, data);
      });
      context?.previousForumQueries?.forEach(([queryKey, data]: [any, any]) => {
        queryClient.setQueryData(queryKey, data);
      });
      if (context?.previousMembership !== undefined) {
        queryClient.setQueryData(['forum', 'membership', forumId], context.previousMembership);
      }
    },
    onSuccess: (_, forumId) => {
      queryClient.invalidateQueries({ queryKey: ['forum', forumId] });
      queryClient.invalidateQueries({ queryKey: ['forum', 'byRoute'] });
      queryClient.invalidateQueries({ queryKey: ['forum', 'membership', forumId] });
      queryClient.invalidateQueries({ queryKey: ['forum', 'members', forumId] });
    },
  });
};

