import { useState } from 'react';
import { createFileRoute, redirect, Link } from '@tanstack/react-router';
import { useUsers, useUpdateUserRole } from '../../lib/hooks/useUsers';
import { authApi } from '../../lib/api/auth';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { Chip } from '../../components/ui/Chip';
import { Table } from '../../components/ui/Table';
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
          <Table
            data={data.data}
            columns={[
              {
                key: 'username',
                header: 'User',
                render: (user) => {
                  const levelInfo = USER_LEVELS.find(l => l.value === user.level);
                  return (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center text-white font-bold">
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
                  );
                },
              },
              {
                key: 'email',
                header: 'Email',
                hidden: 'md:table-cell',
                render: (user) => user.email,
              },
              {
                key: 'level',
                header: 'Level',
                render: (user) => (
                  <Chip variant={getLevelVariant(user.level)}>
                    {USER_LEVELS.find(l => l.value === user.level)?.label || user.level}
                  </Chip>
                ),
              },
              {
                key: 'points',
                header: 'Points',
                hidden: 'md:table-cell',
                render: (user) => user.reputation_points.toLocaleString(),
              },
              {
                key: 'role',
                header: 'Role',
                render: (user) => (
                  <Chip variant={user.role === 'admin' ? 'warning' : 'neutral'}>
                    {user.role}
                  </Chip>
                ),
              },
              {
                key: 'joined',
                header: 'Joined',
                hidden: 'lg:table-cell',
                render: (user) => format(new Date(user.created_at), 'MMM d, yyyy'),
              },
            ]}
            actions={(user) => (
              <Select
                value={user.role}
                onChange={(value) => handleRoleChange(user.id, value as 'common_user' | 'admin')}
                disabled={updateRoleMutation.isPending}
                size="xs"
                className="w-20"
              >
                <option value="common_user">User</option>
                <option value="admin">Admin</option>
              </Select>
            )}
          />

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

