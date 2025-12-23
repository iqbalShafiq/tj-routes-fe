import { createFileRoute } from '@tanstack/react-router';
import { useRoute } from '../../lib/hooks/useRoutes';
import { RouteDetail } from '../../components/RouteDetail';
import { Loading } from '../../components/ui/Loading';
import { Button } from '../../components/ui/Button';
import { PageHeader } from '../../components/layout';

export const Route = createFileRoute('/routes/$routeId')({
  component: RouteDetailPage,
});

function RouteDetailPage() {
  const { routeId } = Route.useParams();
  const { data: route, isLoading, error } = useRoute(routeId);

  if (isLoading) {
    return <Loading />;
  }

  if (error || !route) {
    return (
      <div className="text-center py-20 animate-fade-in">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 mb-4 card-chamfered">
          <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="text-red-600 font-display text-lg mb-2">Error loading route details</p>
        <p className="text-slate-600 text-sm mb-6">Please try again later.</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <PageHeader
        title={`${route.code} - ${route.name}`}
        subtitle={route.description}
        breadcrumbs={[
          { label: 'Routes', path: '/' },
          { label: route.code },
        ]}
        actions={
          <Button variant="accent" onClick={() => window.location.href = `/reports/new?routeId=${route.id}`}>
            Report Issue
          </Button>
        }
      />
      <RouteDetail route={route} />
    </div>
  );
}
