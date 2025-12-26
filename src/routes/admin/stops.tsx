import { useState } from 'react';
import { createFileRoute, redirect } from '@tanstack/react-router';
import { useStops, useCreateStop, useUpdateStop, useDeleteStop } from '../../lib/hooks/useStops';
import { authApi } from '../../lib/api/auth';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { FilterSelect } from '../../components/ui/FilterSelect';
import { FileInput } from '../../components/ui/FileInput';
import { Modal } from '../../components/ui/Modal';
import { Chip } from '../../components/ui/Chip';
import { Skeleton } from '../../components/ui/Loading';
import { PageHeader } from '../../components/layout';
import { useToast } from '../../lib/hooks/useToast';
import type { Stop, CreateStopRequest } from '../../lib/api/stops';

export const Route = createFileRoute('/admin/stops')({
  beforeLoad: async () => {
    const user = authApi.getCurrentUser();
    if (!user || user.role !== 'admin') {
      throw redirect({ to: '/' });
    }
  },
  component: AdminStopsPage,
});

function AdminStopsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'stop' | 'terminal'>('all');
  const [showForm, setShowForm] = useState(false);
  const [editingStop, setEditingStop] = useState<Stop | null>(null);
  const [photo, setPhoto] = useState<File | null>(null);
  const limit = 20;
  const { toast } = useToast();

  const { data, isLoading } = useStops(page, limit, {
    search: search || undefined,
    type: typeFilter !== 'all' ? typeFilter : undefined,
  });

  const createMutation = useCreateStop();
  const updateMutation = useUpdateStop();
  const deleteMutation = useDeleteStop();

  const [formData, setFormData] = useState<CreateStopRequest>({
    name: '',
    type: 'stop',
    latitude: 0,
    longitude: 0,
    address: '',
    city: '',
    district: '',
    facilities: '',
    status: 'active',
  });

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this stop?')) return;
    
    deleteMutation.mutate(id, {
      onSuccess: () => toast({ title: 'Success', description: 'Stop deleted successfully', variant: 'success' }),
      onError: () => toast({ title: 'Error', description: 'Failed to delete stop', variant: 'error' }),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingStop) {
      updateMutation.mutate(
        { id: editingStop.id, data: formData, photo: photo || undefined },
        {
          onSuccess: () => {
            toast({ title: 'Success', description: 'Stop updated successfully', variant: 'success' });
            resetForm();
          },
          onError: () => toast({ title: 'Error', description: 'Failed to update stop', variant: 'error' }),
        }
      );
    } else {
      createMutation.mutate(
        { data: formData, photo: photo || undefined },
        {
          onSuccess: () => {
            toast({ title: 'Success', description: 'Stop created successfully', variant: 'success' });
            resetForm();
          },
          onError: () => toast({ title: 'Error', description: 'Failed to create stop', variant: 'error' }),
        }
      );
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingStop(null);
    setPhoto(null);
    setFormData({
      name: '',
      type: 'stop',
      latitude: 0,
      longitude: 0,
      address: '',
      city: '',
      district: '',
      facilities: '',
      status: 'active',
    });
  };

  const startEdit = (stop: Stop) => {
    setEditingStop(stop);
    setFormData({
      name: stop.name,
      type: stop.type,
      latitude: stop.latitude,
      longitude: stop.longitude,
      address: stop.address || '',
      city: stop.city || '',
      district: stop.district || '',
      facilities: typeof stop.facilities === 'string' ? stop.facilities : JSON.stringify(stop.facilities || []),
      status: stop.status,
    });
    setShowForm(true);
  };

  if (isLoading && !data) {
    return (
      <div className="animate-fade-in">
        <PageHeader title="Manage Stops" subtitle="Create, edit, and delete stops and terminals." />
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
        title="Manage Stops"
        subtitle="Create, edit, and delete stops and terminals."
        breadcrumbs={[
          { label: 'Admin', path: '/admin' },
          { label: 'Stops' },
        ]}
        actions={
          <Button variant="accent" onClick={() => { resetForm(); setShowForm(true); }}>
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Stop
          </Button>
        }
      />

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <Input
          type="text"
          placeholder="Search stops..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="max-w-sm"
        />
        <FilterSelect
          label="Type"
          value={typeFilter}
          onChange={(value) => { setTypeFilter(value as any); setPage(1); }}
          options={[
            { value: 'all', label: 'All Types' },
            { value: 'stop', label: 'Stops' },
            { value: 'terminal', label: 'Terminals' },
          ]}
        />
      </div>

      {/* Form Modal */}
      {showForm && (
        <Modal
          isOpen={showForm}
          onClose={resetForm}
          title={editingStop ? 'Edit Stop' : 'Add New Stop'}
          size="xl"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Stop name"
                  required
                  autoFocus
                />
              </div>
                <div>
                  <Select
                    label="Type"
                    value={formData.type}
                    onChange={(value) => setFormData({ ...formData, type: value as 'stop' | 'terminal' })}
                  >
                    <option value="stop">Stop</option>
                    <option value="terminal">Terminal</option>
                  </Select>
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
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Latitude</label>
                  <Input
                    type="number"
                    step="any"
                    value={formData.latitude}
                    onChange={(e) => setFormData({ ...formData, latitude: parseFloat(e.target.value) || 0 })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Longitude</label>
                  <Input
                    type="number"
                    step="any"
                    value={formData.longitude}
                    onChange={(e) => setFormData({ ...formData, longitude: parseFloat(e.target.value) || 0 })}
                    required
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Address</label>
                  <Input
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Full address"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">City</label>
                  <Input
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="City"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">District</label>
                  <Input
                    value={formData.district}
                    onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                    placeholder="District"
                  />
                </div>
                <div className="col-span-2">
                  <FileInput
                    label="Photo"
                    accept="image/*"
                    onFileChange={(files) => setPhoto(files?.[0] || null)}
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <Button type="button" variant="outline" onClick={resetForm} className="flex-1">
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  variant="accent" 
                  className="flex-1"
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  {editingStop ? 'Update' : 'Create'}
                </Button>
              </div>
            </form>
          </Modal>
        )}

      {/* Stops List */}
      {data && data.data.length > 0 ? (
        <>
          <div className="bg-white rounded-sm border border-slate-200 overflow-x-auto mb-6">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-slate-900 whitespace-nowrap overflow-hidden text-ellipsis">Name</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-slate-900 whitespace-nowrap overflow-hidden text-ellipsis">Type</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-slate-900 hidden md:table-cell whitespace-nowrap overflow-hidden text-ellipsis">City</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-slate-900 whitespace-nowrap overflow-hidden text-ellipsis">Status</th>
                  <th className="text-right px-4 py-3 text-sm font-semibold text-slate-900 whitespace-nowrap overflow-hidden text-ellipsis">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.data.map((stop) => (
                  <tr key={stop.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {stop.photo_url ? (
                          <img src={stop.photo_url} alt={stop.name} className="w-10 h-10 rounded-sm object-cover" />
                        ) : (
                          <div className="w-10 h-10 bg-slate-100 rounded-sm flex items-center justify-center">
                            <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            </svg>
                          </div>
                        )}
                        <span className="font-medium text-slate-900">{stop.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Chip variant={stop.type === 'terminal' ? 'warning' : 'default'}>
                        {stop.type}
                      </Chip>
                    </td>
                    <td className="px-4 py-3 text-slate-500 text-sm hidden md:table-cell">{stop.city || '—'}</td>
                    <td className="px-4 py-3">
                      <Chip variant={stop.status === 'active' ? 'success' : 'error'}>
                        {stop.status}
                      </Chip>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <Button size="sm" variant="outline" onClick={() => startEdit(stop)}>
                          Edit
                        </Button>
                        <Button 
                          size="sm" 
                          variant="danger" 
                          onClick={() => handleDelete(stop.id)}
                          disabled={deleteMutation.isPending}
                        >
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
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
            <p className="text-slate-600">No stops found</p>
            <Button variant="accent" className="mt-4" onClick={() => setShowForm(true)}>
              Add Your First Stop
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}

