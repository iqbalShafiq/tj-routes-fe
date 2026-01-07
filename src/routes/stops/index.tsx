import { useState } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { useStops } from '../../lib/hooks/useStops';
import { Card, CardBody } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { FilterSelect } from '../../components/ui/FilterSelect';
import { Chip } from '../../components/ui/Chip';
import { Skeleton } from '../../components/ui/Loading';
import { PageHeader } from '../../components/layout';
import type { Stop } from '../../lib/api/stops';
import { FavoriteButton } from '../../components/FavoriteButton';
import { useIsFavoriteStop } from '../../lib/hooks/usePersonalized';
import { RouteErrorComponent } from '../../components/RouteErrorComponent';

export const Route = createFileRoute('/stops/')({
  component: StopsPage,
  errorComponent: RouteErrorComponent,
});

function StopCard({ stop }: { stop: Stop }) {
  const { data: isFavorite } = useIsFavoriteStop(stop.id);
  const isTerminal = stop.type === 'terminal';

  // Parse facilities if it's a string
  const facilities = typeof stop.facilities === 'string'
    ? JSON.parse(stop.facilities || '[]')
    : stop.facilities || [];

  return (
    <Card className="h-full">
      <div className="flex items-start gap-4">
        {stop.photo_url ? (
          <img
            src={stop.photo_url}
            alt={stop.name}
            className="w-20 h-20 object-cover rounded-sm flex-shrink-0"
          />
        ) : (
          <div className={`w-20 h-20 flex items-center justify-center rounded-sm flex-shrink-0 ${
            isTerminal ? 'bg-accent/10' : 'bg-tertiary/10'
          }`}>
            <svg className={`w-10 h-10 ${isTerminal ? 'text-accent' : 'text-tertiary'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isTerminal ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              )}
            </svg>
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <div className="flex items-center gap-2">
              <Chip variant={isTerminal ? 'warning' : 'default'}>
                {isTerminal ? 'Terminal' : 'Stop'}
              </Chip>
              <Chip variant={stop.status === 'active' ? 'success' : 'error'}>
                {stop.status}
              </Chip>
            </div>
            <FavoriteButton
              id={stop.id}
              type="stop"
              isFavorite={!!isFavorite}
              size="sm"
              variant="minimal"
            />
          </div>
          <h3 className="font-display font-semibold text-text-primary text-lg truncate">{stop.name}</h3>
          {stop.address && (
            <p className="text-sm text-text-muted mt-1 line-clamp-2">{stop.address}</p>
          )}
          {stop.city && (
            <p className="text-xs text-text-muted mt-1">
              {stop.district ? `${stop.district}, ` : ''}{stop.city}
            </p>
          )}
        </div>
      </div>
      
      {facilities.length > 0 && (
        <CardBody>
          <div className="flex flex-wrap gap-1 mt-2">
            {facilities.slice(0, 4).map((facility: string, idx: number) => (
              <Chip key={idx} variant="default" className="text-xs">
                {facility}
              </Chip>
            ))}
            {facilities.length > 4 && (
              <Chip variant="default" className="text-xs">
                +{facilities.length - 4} more
              </Chip>
            )}
          </div>
        </CardBody>
      )}
    </Card>
  );
}

function StopsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'stop' | 'terminal'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const limit = 12;

  const { data, isLoading, error } = useStops(page, limit, {
    search: search || undefined,
    type: typeFilter !== 'all' ? typeFilter : undefined,
    status: statusFilter !== 'all' ? statusFilter : undefined,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  const handleFilterChange = () => {
    setPage(1);
  };

  if (isLoading && !data) {
    return (
      <div className="animate-fade-in">
        <PageHeader
          title="Stops & Terminals"
          subtitle="Explore TransJakarta stops and terminals across the city."
        />
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-48 card-chamfered" />
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
        <p className="text-error font-display text-lg mb-2">Error loading stops</p>
        <p className="text-text-secondary text-sm">Please try again later.</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Stops & Terminals"
        subtitle="Explore TransJakarta stops and terminals across the city. Find facilities and location information."
      >
        <div className="space-y-4">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 max-w-2xl">
            <Input
              type="text"
              placeholder="Search stops by name or address..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" variant="primary" className="w-full sm:w-auto">
              Search
            </Button>
          </form>
          
          <div className="flex flex-wrap gap-2">
            <FilterSelect
              label="Type"
              value={typeFilter}
              onChange={(value) => {
                setTypeFilter(value as 'all' | 'stop' | 'terminal');
                handleFilterChange();
              }}
              options={[
                { value: 'all', label: 'All' },
                { value: 'stop', label: 'Stops' },
                { value: 'terminal', label: 'Terminals' },
              ]}
            />
            <FilterSelect
              label="Status"
              value={statusFilter}
              onChange={(value) => {
                setStatusFilter(value as 'all' | 'active' | 'inactive');
                handleFilterChange();
              }}
              options={[
                { value: 'all', label: 'All' },
                { value: 'active', label: 'Active' },
                { value: 'inactive', label: 'Inactive' },
              ]}
            />
            {(search || typeFilter !== 'all' || statusFilter !== 'all') && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearch('');
                  setSearchInput('');
                  setTypeFilter('all');
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
            {data.data.map((stop, index) => (
              <div key={stop.id} style={{ animationDelay: `${index * 50}ms` }} className="animate-stagger-1">
                <StopCard stop={stop} />
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
            <span className="text-text-secondary text-sm sm:text-base font-medium px-4">
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
          <div className="inline-flex items-center justify-center w-16 h-16 bg-bg-elevated mb-4 card-chamfered">
            <svg className="w-8 h-8 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            </svg>
          </div>
          <p className="text-text-secondary font-display text-lg">No stops found</p>
          <p className="text-text-muted text-sm mt-2">Try adjusting your filters</p>
        </div>
      )}
    </div>
  );
}

