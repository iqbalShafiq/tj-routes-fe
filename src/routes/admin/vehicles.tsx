import { useState } from 'react';
import { createFileRoute, redirect } from '@tanstack/react-router';
import { useVehicles, useCreateVehicle, useUpdateVehicle, useDeleteVehicle } from '../../lib/hooks/useVehicles';
import { useRoutes } from '../../lib/hooks/useRoutes';
import { authApi } from '../../lib/api/auth';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { FileInput } from '../../components/ui/FileInput';
import { Skeleton } from '../../components/ui/Loading';
import { PageHeader } from '../../components/layout';
import { useToast } from '../../lib/hooks/useToast';
import type { Vehicle, CreateVehicleRequest } from '../../lib/api/vehicles';

export const Route = createFileRoute('/admin/vehicles')({
  beforeLoad: async () => {
    const user = authApi.getCurrentUser();
    if (!user || user.role !== 'admin') {
      throw redirect({ to: '/' });
    }
  },
  component: AdminVehiclesPage,
});

function AdminVehiclesPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [photo, setPhoto] = useState<File | null>(null);
  const limit = 20;
  const { toast } = useToast();

  const { data, isLoading } = useVehicles(page, limit, { search: search || undefined });
  const { data: routesData } = useRoutes(1, 100);

  const createMutation = useCreateVehicle();
  const updateMutation = useUpdateVehicle();
  const deleteMutation = useDeleteVehicle();

  const [formData, setFormData] = useState<CreateVehicleRequest>({
    vehicle_plate: '',
    route_id: 0,
    vehicle_type: '',
    capacity: 0,
    status: 'active',
  });

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this vehicle?')) return;
    
    deleteMutation.mutate(id, {
      onSuccess: () => toast({ title: 'Success', description: 'Vehicle deleted successfully', variant: 'success' }),
      onError: () => toast({ title: 'Error', description: 'Failed to delete vehicle', variant: 'error' }),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingVehicle) {
      updateMutation.mutate(
        { id: editingVehicle.id, data: formData, photo: photo || undefined },
        {
          onSuccess: () => {
            toast({ title: 'Success', description: 'Vehicle updated successfully', variant: 'success' });
            resetForm();
          },
          onError: () => toast({ title: 'Error', description: 'Failed to update vehicle', variant: 'error' }),
        }
      );
    } else {
      createMutation.mutate(
        { data: formData, photo: photo || undefined },
        {
          onSuccess: () => {
            toast({ title: 'Success', description: 'Vehicle created successfully', variant: 'success' });
            resetForm();
          },
          onError: () => toast({ title: 'Error', description: 'Failed to create vehicle', variant: 'error' }),
        }
      );
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingVehicle(null);
    setPhoto(null);
    setFormData({
      vehicle_plate: '',
      route_id: 0,
      vehicle_type: '',
      capacity: 0,
      status: 'active',
    });
  };

  const startEdit = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle);
    setFormData({
      vehicle_plate: vehicle.vehicle_plate,
      route_id: vehicle.route_id,
      vehicle_type: vehicle.vehicle_type || '',
      capacity: vehicle.capacity || 0,
      status: vehicle.status,
    });
    setShowForm(true);
  };

  if (isLoading && !data) {
    return (
      <div className="animate-fade-in">
        <PageHeader title="Manage Vehicles" subtitle="Create, edit, and delete vehicles." />
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
        title="Manage Vehicles"
        subtitle="Create, edit, and delete vehicles in the fleet."
        breadcrumbs={[
          { label: 'Admin', path: '/admin' },
          { label: 'Vehicles' },
        ]}
        actions={
          <Button variant="accent" onClick={() => { resetForm(); setShowForm(true); }}>
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Vehicle
          </Button>
        }
      />

      {/* Search */}
      <div className="mb-6">
        <Input
          type="text"
          placeholder="Search by plate number..."
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
              {editingVehicle ? 'Edit Vehicle' : 'Add New Vehicle'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Plate Number</label>
                <Input
                  value={formData.vehicle_plate}
                  onChange={(e) => setFormData({ ...formData, vehicle_plate: e.target.value })}
                  placeholder="e.g., B1234XYZ"
                  required
                />
              </div>
              <div>
                <Select
                  label="Route"
                  value={formData.route_id}
                  onChange={(value) => setFormData({ ...formData, route_id: typeof value === 'number' ? value : parseInt(String(value)) })}
                  required
                >
                  <option value={0}>Select a route</option>
                  {routesData?.data.map((route) => (
                    <option key={route.id} value={route.id}>
                      {route.route_number || route.code} - {route.name}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Vehicle Type</label>
                <Input
                  value={formData.vehicle_type}
                  onChange={(e) => setFormData({ ...formData, vehicle_type: e.target.value })}
                  placeholder="e.g., Bus, Articulated Bus"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Capacity</label>
                <Input
                  type="number"
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) || 0 })}
                  placeholder="Number of passengers"
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
              <div>
                <FileInput
                  label="Photo"
                  accept="image/*"
                  onFileChange={(files) => setPhoto(files?.[0] || null)}
                />
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
                  {editingVehicle ? 'Update' : 'Create'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Vehicles List */}
      {data && data.data.length > 0 ? (
        <>
          <div className="bg-white rounded-lg border border-slate-200 overflow-hidden mb-6">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-slate-900">Plate</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-slate-900">Type</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-slate-900 hidden md:table-cell">Route</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-slate-900 hidden md:table-cell">Capacity</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-slate-900">Status</th>
                  <th className="text-right px-4 py-3 text-sm font-semibold text-slate-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.data.map((vehicle) => (
                  <tr key={vehicle.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {vehicle.photo_url ? (
                          <img src={vehicle.photo_url} alt={vehicle.vehicle_plate} className="w-10 h-10 rounded-lg object-cover" />
                        ) : (
                          <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                            <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                            </svg>
                          </div>
                        )}
                        <span className="font-display font-semibold text-slate-900">{vehicle.vehicle_plate}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{vehicle.vehicle_type || '—'}</td>
                    <td className="px-4 py-3 text-slate-500 text-sm hidden md:table-cell">
                      {vehicle.route ? `${vehicle.route.route_number}` : '—'}
                    </td>
                    <td className="px-4 py-3 text-slate-500 hidden md:table-cell">{vehicle.capacity || '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 text-xs font-medium rounded ${
                        vehicle.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {vehicle.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <Button size="sm" variant="outline" onClick={() => startEdit(vehicle)}>
                          Edit
                        </Button>
                        <Button 
                          size="sm" 
                          variant="danger" 
                          onClick={() => handleDelete(vehicle.id)}
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
            <p className="text-slate-600">No vehicles found</p>
            <Button variant="accent" className="mt-4" onClick={() => setShowForm(true)}>
              Add Your First Vehicle
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}

