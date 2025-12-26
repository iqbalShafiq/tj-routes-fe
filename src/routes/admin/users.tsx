import { useState } from 'react';
import { createFileRoute, redirect, Link } from '@tanstack/react-router';
import { useUsers, useUpdateUserRole } from '../../lib/hooks/useUsers';
import { authApi } from '../../lib/api/auth';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { Chip } from '../../components/ui/Chip';
import { Skeleton } from '../../components/ui/Loading';
import { PageHeader } from '../../components/layout';
import { useToast } from '../../lib/hooks/useToast';
import { format } from 'date-fns';
import { USER_LEVELS } from '../../lib/utils/constants';

export const Route = createFileRoute('/admin/users')({
  beforeLoad: async () => {
    const user = authApi.getCurrentUser();
    if (!user || user.role !== 'admin') {
      throw redirect({ to: '/' });
    }
  },
  component: AdminUsersPage,
});

function getLevelVariant(level: string): 'default' | 'success' | 'info' | 'purple' | 'warning' {
  switch (level) {
    case 'newcomer': return 'default';
    case 'contributor': return 'success';
    case 'trusted': return 'info';
    case 'expert': return 'purple';
    case 'legend': return 'warning';
    default: return 'default';
  }
}

function AdminUsersPage() {
  const [page, setPage] = useState(1);
  const limit = 20;
  const { toast } = useToast();

  const { data, isLoading } = useUsers(page, limit);
  const updateRoleMutation = useUpdateUserRole();

  const handleRoleChange = (userId: number, newRole: 'common_user' | 'admin') => {
    if (!confirm(`Are you sure you want to change this user's role to ${newRole}?`)) return;
    
    updateRoleMutation.mutate(
      { id: userId, role: newRole },
      {
        onSuccess: () => toast({ title: 'Success', description: 'User role updated successfully', variant: 'success' }),
        onError: () => toast({ title: 'Error', description: 'Failed to update user role', variant: 'error' }),
      }
    );
  };

  if (isLoading && !data) {
    return (
      <div className="animate-fade-in">
        <PageHeader title="Manage Users" subtitle="View and manage user accounts." />
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-20 card-chamfered" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Manage Users"
        subtitle="View and manage user accounts and roles."
        breadcrumbs={[
          { label: 'Admin', path: '/admin' },
          { label: 'Users' },
        ]}
      />

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card static className="text-center">
          <p className="text-2xl font-display font-bold text-slate-900">{data?.total || 0}</p>
          <p className="text-sm text-slate-500">Total Users</p>
        </Card>
        <Card static className="text-center">
          <p className="text-2xl font-display font-bold text-amber-600">
            {data?.data.filter(u => u.role === 'admin').length || 0}
          </p>
          <p className="text-sm text-slate-500">Admins</p>
        </Card>
        <Card static className="text-center">
          <p className="text-2xl font-display font-bold text-emerald-600">
            {data?.data.filter(u => u.level !== 'newcomer').length || 0}
          </p>
          <p className="text-sm text-slate-500">Active Contributors</p>
        </Card>
        <Card static className="text-center">
          <p className="text-2xl font-display font-bold text-blue-600">
            {data?.data.filter(u => u.oauth_provider).length || 0}
          </p>
          <p className="text-sm text-slate-500">OAuth Users</p>
        </Card>
      </div>

      {/* Users List */}
      {data && data.data.length > 0 ? (
        <>
          <div className="bg-white rounded-sm border border-slate-200 overflow-hidden mb-6">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-slate-900">User</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-slate-900 hidden md:table-cell">Email</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-slate-900">Level</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-slate-900 hidden md:table-cell">Points</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-slate-900">Role</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-slate-900 hidden lg:table-cell">Joined</th>
                  <th className="text-right px-4 py-3 text-sm font-semibold text-slate-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.data.map((user) => {
                  const levelInfo = USER_LEVELS.find(l => l.value === user.level);
                  return (
                    <tr key={user.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-slate-300 to-slate-500 rounded-full flex items-center justify-center text-white font-bold">
                            {user.username.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <Link 
                              to="/profile/$userId" 
                              params={{ userId: String(user.id) }}
                              className="font-medium text-slate-900 hover:text-amber-600"
                            >
                              {user.username}
                            </Link>
                            {user.oauth_provider && (
                              <span className="ml-2 text-xs text-slate-400">({user.oauth_provider})</span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-500 text-sm hidden md:table-cell">{user.email}</td>
                      <td className="px-4 py-3">
                        <Chip variant={getLevelVariant(user.level)}>
                          {levelInfo?.label || user.level}
                        </Chip>
                      </td>
                      <td className="px-4 py-3 text-slate-600 hidden md:table-cell">
                        {user.reputation_points.toLocaleString()}
                      </td>
                      <td className="px-4 py-3">
                        <Chip variant={user.role === 'admin' ? 'warning' : 'neutral'}>
                          {user.role}
                        </Chip>
                      </td>
                      <td className="px-4 py-3 text-slate-500 text-sm hidden lg:table-cell">
                        {format(new Date(user.created_at), 'MMM d, yyyy')}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Select
                          value={user.role}
                          onChange={(value) => handleRoleChange(user.id, value as 'common_user' | 'admin')}
                          disabled={updateRoleMutation.isPending}
                          size="sm"
                          className="w-24"
                        >
                          <option value="common_user">User</option>
                          <option value="admin">Admin</option>
                        </Select>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="flex justify-center items-center gap-4">
            <Button variant="outline" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
              ← Previous
            </Button>
            <span className="text-slate-600 text-sm font-medium">Page {page} of {data.total_pages}</span>
            <Button variant="outline" onClick={() => setPage((p) => Math.min(data.total_pages, p + 1))} disabled={page >= data.total_pages}>
              Next →
            </Button>
          </div>
        </>
      ) : (
        <Card static>
          <div className="text-center py-12">
            <p className="text-slate-600">No users found</p>
          </div>
        </Card>
      )}
    </div>
  );
}

