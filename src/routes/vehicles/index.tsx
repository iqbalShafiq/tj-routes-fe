import { useState } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { useVehicles } from '../../lib/hooks/useVehicles';
import { Card, CardBody } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { FilterSelect } from '../../components/ui/FilterSelect';
import { Skeleton } from '../../components/ui/Loading';
import { PageHeader } from '../../components/layout';
import type { Vehicle } from '../../lib/api/vehicles';

export const Route = createFileRoute('/vehicles/')({
  component: VehiclesPage,
});

function VehicleCard({ vehicle }: { vehicle: Vehicle }) {
  return (
    <Card className="h-full">
      <div className="flex items-start gap-4">
        {vehicle.photo_url ? (
          <img 
            src={vehicle.photo_url} 
            alt={vehicle.vehicle_plate}
            className="w-24 h-24 object-cover rounded-lg flex-shrink-0"
          />
        ) : (
          <div className="w-24 h-24 bg-slate-100 flex items-center justify-center rounded-lg flex-shrink-0">
            <svg className="w-12 h-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span className={`px-2 py-0.5 text-xs font-medium rounded ${
              vehicle.status === 'active' 
                ? 'bg-emerald-100 text-emerald-700' 
                : 'bg-red-100 text-red-700'
            }`}>
              {vehicle.status}
            </span>
          </div>
          <h3 className="font-display font-bold text-slate-900 text-xl">{vehicle.vehicle_plate}</h3>
          {vehicle.vehicle_type && (
            <p className="text-sm text-slate-600 mt-1">{vehicle.vehicle_type}</p>
          )}
        </div>
      </div>
      
      <CardBody>
        <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-slate-100">
          {vehicle.capacity && (
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wider">Capacity</p>
              <p className="text-lg font-display font-semibold text-slate-900">{vehicle.capacity}</p>
            </div>
          )}
          {vehicle.route && (
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wider">Route</p>
              <p className="text-sm font-medium text-amber-600">{vehicle.route.route_number}</p>
              <p className="text-xs text-slate-500 truncate">{vehicle.route.name}</p>
            </div>
          )}
        </div>
      </CardBody>
    </Card>
  );
}

function VehiclesPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const limit = 12;

  const { data, isLoading, error } = useVehicles(page, limit, {
    search: search || undefined,
    status: statusFilter !== 'all' ? statusFilter : undefined,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  if (isLoading && !data) {
    return (
      <div className="animate-fade-in">
        <PageHeader
          title="Fleet"
          subtitle="Browse TransJakarta vehicles and their assigned routes."
        />
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-56 card-chamfered" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20 animate-fade-in">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 mb-4 card-chamfered">
          <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="text-red-600 font-display text-lg mb-2">Error loading vehicles</p>
        <p className="text-slate-600 text-sm">Please try again later.</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Fleet"
        subtitle="Browse TransJakarta vehicles and their assigned routes. View capacity and status information."
      >
        <div className="space-y-4">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 max-w-2xl">
            <Input
              type="text"
              placeholder="Search by plate number or type..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" variant="accent" className="w-full sm:w-auto">
              Search
            </Button>
          </form>
          
          <div className="flex flex-wrap gap-2">
            <FilterSelect
              label="Status"
              value={statusFilter}
              onChange={(value) => {
                setStatusFilter(value as 'all' | 'active' | 'inactive');
                setPage(1);
              }}
              options={[
                { value: 'all', label: 'All' },
                { value: 'active', label: 'Active' },
                { value: 'inactive', label: 'Inactive' },
              ]}
            />
            {(search || statusFilter !== 'all') && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearch('');
                  setSearchInput('');
                  setStatusFilter('all');
                  setPage(1);
                }}
              >
                Clear Filters
              </Button>
            )}
          </div>
        </div>
      </PageHeader>

      {data && data.data.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-12">
            {data.data.map((vehicle, index) => (
              <div key={vehicle.id} style={{ animationDelay: `${index * 50}ms` }} className="animate-stagger-1">
                <VehicleCard vehicle={vehicle} />
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            <Button
              variant="outline"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="w-full sm:w-auto"
            >
              ← Previous
            </Button>
            <span className="text-slate-600 text-sm sm:text-base font-medium px-4">
              Page {page} of {data.total_pages}
            </span>
            <Button
              variant="outline"
              onClick={() => setPage((p) => Math.min(data.total_pages, p + 1))}
              disabled={page >= data.total_pages}
              className="w-full sm:w-auto"
            >
              Next →
            </Button>
          </div>
        </>
      ) : (
        <div className="text-center py-20 animate-fade-in">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-100 mb-4 card-chamfered">
            <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
          </div>
          <p className="text-slate-600 font-display text-lg">No vehicles found</p>
          <p className="text-slate-500 text-sm mt-2">Try adjusting your search</p>
        </div>
      )}
    </div>
  );
}

