import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersApi } from '../api/users';

export const useUsers = (page: number = 1, limit: number = 20) => {
  return useQuery({
    queryKey: ['users', page, limit],
    queryFn: () => usersApi.getUsers(page, limit),
  });
};

export const useUser = (id: string | number) => {
  return useQuery({
    queryKey: ['user', id],
    queryFn: () => usersApi.getUser(id),
    enabled: !!id,
  });
};

export const useUpdateUserRole = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, role }: { id: string | number; role: 'common_user' | 'admin' }) =>
      usersApi.updateUserRole(id, role),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['user', variables.id] });
    },
  });
};

