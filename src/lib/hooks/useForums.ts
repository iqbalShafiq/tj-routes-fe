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
    onSuccess: (_, forumId) => {
      queryClient.invalidateQueries({ queryKey: ['forum', forumId] });
      queryClient.invalidateQueries({ queryKey: ['forum', 'membership', forumId] });
      queryClient.invalidateQueries({ queryKey: ['forum', 'members', forumId] });
    },
  });
};

export const useLeaveForum = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (forumId: string | number) => forumsApi.leaveForum(forumId),
    onSuccess: (_, forumId) => {
      queryClient.invalidateQueries({ queryKey: ['forum', forumId] });
      queryClient.invalidateQueries({ queryKey: ['forum', 'membership', forumId] });
      queryClient.invalidateQueries({ queryKey: ['forum', 'members', forumId] });
    },
  });
};

