import { createFileRoute } from '@tanstack/react-router';
import { useRoutes } from '../lib/hooks/useRoutes';
import { RouteCard } from '../components/RouteCard';
import { Skeleton } from '../components/ui/Loading';
import { useState } from 'react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { PageHeader } from '../components/layout';

export const Route = createFileRoute('/')({
  component: RoutesListing,
});

function RoutesListing() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const limit = 20;

  const { data, isLoading, error } = useRoutes(page, limit, search);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  if (isLoading && !data) {
    return (
      <div className="animate-fade-in">
        <PageHeader
          title="TransJakarta Routes"
          subtitle="Explore all available bus rapid transit routes across Jakarta."
        />
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-64 card-chamfered" />
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
        <p className="text-red-600 font-display text-lg mb-2">Error loading routes</p>
        <p className="text-slate-600 text-sm">Please try again later.</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="TransJakarta Routes"
        subtitle="Explore all available bus rapid transit routes across Jakarta. Find your route and discover stops along the way."
      >
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 max-w-2xl">
          <Input
            type="text"
            placeholder="Search by route code or name..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="flex-1"
          />
          <Button type="submit" variant="accent" className="w-full sm:w-auto">
            Search
          </Button>
        </form>
      </PageHeader>

      {data && data.data.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-12">
            {data.data.map((route, index) => (
              <div key={route.id} style={{ animationDelay: `${index * 50}ms` }} className="animate-stagger-1">
                <RouteCard route={route} />
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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-slate-600 font-display text-lg">No routes found</p>
          <p className="text-slate-500 text-sm mt-2">Try adjusting your search terms</p>
        </div>
      )}
    </div>
  );
}
