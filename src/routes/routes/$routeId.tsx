import { createFileRoute, Link, Outlet, useLocation } from '@tanstack/react-router';
import { useRouteWithStats } from '../../lib/hooks/useRoutes';
import { RouteDetail } from '../../components/RouteDetail';
import { Loading } from '../../components/ui/Loading';
import { Button } from '../../components/ui/Button';
import { PageHeader } from '../../components/layout';

export const Route = createFileRoute('/routes/$routeId')({
  component: RouteDetailPage,
});

function RouteDetailPage() {
  const { routeId } = Route.useParams();
  const location = useLocation();
  const { data: routeDetail, isLoading, error } = useRouteWithStats(routeId);

  // Check if we're on a child route (forum, etc.) by checking the pathname
  const isChildRoute = location.pathname.includes('/forum');

  // If we're on a child route, just render the outlet
  if (isChildRoute) {
    return <Outlet />;
  }

  if (isLoading) {
    return <Loading />;
  }

  if (error || !routeDetail) {
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
        title={`${routeDetail.route.code} - ${routeDetail.route.name}`}
        subtitle={routeDetail.route.description}
        breadcrumbs={[
          { label: 'Routes', path: '/' },
          { label: routeDetail.route.code },
        ]}
        actions={
          <div className="flex items-center gap-3">
            <Link to="/routes/$routeId/forum" params={{ routeId }}>
              <Button variant="outline">
                View Forum
              </Button>
            </Link>
            <Button variant="accent" onClick={() => window.location.href = `/reports/new?routeId=${routeDetail.route.id}`}>
              Report Issue
            </Button>
          </div>
        }
      />
      <RouteDetail data={routeDetail} />
    </div>
  );
}
