import { useState } from 'react';
import { createFileRoute, redirect } from '@tanstack/react-router';
import { useRoutes } from '../../lib/hooks/useRoutes';
import { routesApi } from '../../lib/api/routes';
import { useQueryClient } from '@tanstack/react-query';
import { authApi } from '../../lib/api/auth';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Textarea } from '../../components/ui/Textarea';
import { Skeleton } from '../../components/ui/Loading';
import { PageHeader } from '../../components/layout';
import { useToast } from '../../lib/hooks/useToast';

export const Route = createFileRoute('/admin/routes')({
  beforeLoad: async () => {
    const user = authApi.getCurrentUser();
    if (!user || user.role !== 'admin') {
      throw redirect({ to: '/' });
    }
  },
  component: AdminRoutesPage,
});

function AdminRoutesPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingRoute, setEditingRoute] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState<number | null>(null);
  const limit = 20;
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useRoutes(page, limit, search);

  const [formData, setFormData] = useState({
    route_number: '',
    name: '',
    description: '',
    status: 'active' as 'active' | 'inactive',
    stop_ids: [] as number[],
  });

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this route?')) return;
    
    setIsDeleting(id);
    try {
      await routesApi.deleteRoute(id);
      toast({ title: 'Success', description: 'Route deleted successfully', variant: 'success' });
      queryClient.invalidateQueries({ queryKey: ['routes'] });
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to delete route', variant: 'error' });
    } finally {
      setIsDeleting(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingRoute) {
        await routesApi.updateRoute(editingRoute.id, {
          route_number: formData.route_number,
          name: formData.name,
          description: formData.description,
          status: formData.status,
        });
        toast({ title: 'Success', description: 'Route updated successfully', variant: 'success' });
      } else {
        await routesApi.createRoute({
          route_number: formData.route_number,
          name: formData.name,
          description: formData.description,
          status: formData.status,
          stop_ids: formData.stop_ids.length > 0 ? formData.stop_ids : [1, 2], // Minimum 2 stops required
        });
        toast({ title: 'Success', description: 'Route created successfully', variant: 'success' });
      }
      
      setShowForm(false);
      setEditingRoute(null);
      setFormData({ route_number: '', name: '', description: '', status: 'active', stop_ids: [] });
      queryClient.invalidateQueries({ queryKey: ['routes'] });
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to save route', variant: 'error' });
    }
  };

  const startEdit = (route: any) => {
    setEditingRoute(route);
    setFormData({
      route_number: route.route_number || route.code || '',
      name: route.name,
      description: route.description || '',
      status: route.status || 'active',
      stop_ids: [],
    });
    setShowForm(true);
  };

  if (isLoading && !data) {
    return (
      <div className="animate-fade-in">
        <PageHeader title="Manage Routes" subtitle="Create, edit, and delete transit routes." />
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
        title="Manage Routes"
        subtitle="Create, edit, and delete transit routes."
        breadcrumbs={[
          { label: 'Admin', path: '/admin' },
          { label: 'Routes' },
        ]}
        actions={
          <Button variant="accent" onClick={() => { setShowForm(true); setEditingRoute(null); setFormData({ route_number: '', name: '', description: '', status: 'active', stop_ids: [] }); }}>
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Route
          </Button>
        }
      />

      {/* Search */}
      <div className="mb-6">
        <Input
          type="text"
          placeholder="Search routes..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="max-w-md"
        />
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card static className="w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-display font-semibold text-slate-900 mb-4">
              {editingRoute ? 'Edit Route' : 'Add New Route'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Route Number</label>
                <Input
                  value={formData.route_number}
                  onChange={(e) => setFormData({ ...formData, route_number: e.target.value })}
                  placeholder="e.g., 1, 1A, 2B"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Blok M - Kota"
                  required
                />
              </div>
              <div>
                <Textarea
                  label="Description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Route description..."
                  rows={3}
                />
              </div>
              <div>
                <Select
                  label="Status"
                  value={formData.status}
                  onChange={(value) => setFormData({ ...formData, status: value as 'active' | 'inactive' })}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </Select>
              </div>
              <div className="flex gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => { setShowForm(false); setEditingRoute(null); }} className="flex-1">
                  Cancel
                </Button>
                <Button type="submit" variant="accent" className="flex-1">
                  {editingRoute ? 'Update' : 'Create'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Routes List */}
      {data && data.data.length > 0 ? (
        <>
          <div className="bg-white rounded-lg border border-slate-200 overflow-hidden mb-6">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-slate-900">Route #</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-slate-900">Name</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-slate-900 hidden md:table-cell">Description</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-slate-900">Status</th>
                  <th className="text-right px-4 py-3 text-sm font-semibold text-slate-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.data.map((route) => (
                  <tr key={route.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <span className="font-display font-semibold text-amber-600">
                        {route.route_number || route.code}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-900">{route.name}</td>
                    <td className="px-4 py-3 text-slate-500 text-sm hidden md:table-cell truncate max-w-xs">
                      {route.description || '—'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 text-xs font-medium rounded ${
                        route.status === 'active' 
                          ? 'bg-emerald-100 text-emerald-700' 
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {route.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <Button size="sm" variant="outline" onClick={() => startEdit(route)}>
                          Edit
                        </Button>
                        <Button 
                          size="sm" 
                          variant="danger" 
                          onClick={() => handleDelete(route.id)}
                          disabled={isDeleting === route.id}
                        >
                          {isDeleting === route.id ? '...' : 'Delete'}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex justify-center items-center gap-4">
            <Button
              variant="outline"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              ← Previous
            </Button>
            <span className="text-slate-600 text-sm font-medium">
              Page {page} of {data.total_pages}
            </span>
            <Button
              variant="outline"
              onClick={() => setPage((p) => Math.min(data.total_pages, p + 1))}
              disabled={page >= data.total_pages}
            >
              Next →
            </Button>
          </div>
        </>
      ) : (
        <Card static>
          <div className="text-center py-12">
            <p className="text-slate-600">No routes found</p>
            <Button variant="accent" className="mt-4" onClick={() => setShowForm(true)}>
              Add Your First Route
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}

