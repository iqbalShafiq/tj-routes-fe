import { createFileRoute, Link, Outlet, useLocation } from '@tanstack/react-router';
import { useState } from 'react';
import { useRouteWithStats, routeKeys } from '../../lib/hooks/useRoutes';
import { useAuth } from '../../lib/hooks/useAuth';
import { useActiveCheckIn } from '../../lib/hooks/useCheckIn';
import { RouteDetail } from '../../components/RouteDetail';
import { CheckInModal } from '../../components/CheckInModal';
import { ReportModal } from '../../components/ReportModal';
import { Loading, Skeleton } from '../../components/ui/Loading';
import { Button } from '../../components/ui/Button';
import { PageHeader } from '../../components/layout';
import { RouteErrorComponent } from '../../components/RouteErrorComponent';
import { routesApi } from '../../lib/api/routes';

export const Route = createFileRoute('/routes/$routeId')({
  loader: async ({ context, params }) => {
    const { queryClient } = context;
    const routeId = params.routeId;

    // Prefetch route detail with stats
    await queryClient.ensureQueryData({
      queryKey: routeKeys.withStats(routeId),
      queryFn: () => routesApi.getRouteWithStats(routeId),
    });

    return { routeId };
  },
  component: RouteDetailPage,
  errorComponent: RouteErrorComponent,
  pendingComponent: () => (
    <div className="animate-fade-in">
      <PageHeader title="Loading route..." />
      <div className="space-y-6">
        <Skeleton className="h-48 card-chamfered" />
        <Skeleton className="h-64 card-chamfered" />
        <Skeleton className="h-96 card-chamfered" />
      </div>
    </div>
  ),
});

function RouteDetailPage() {
  const { routeId } = Route.useParams();
  const location = useLocation();
  const { data: routeDetail, isLoading, error } = useRouteWithStats(routeId);
  const { isAuthenticated } = useAuth();
  const { data: activeCheckIn } = useActiveCheckIn();

  // Modal state
  const [showStartCheckInModal, setShowStartCheckInModal] = useState(false);
  const [showCompleteCheckInModal, setShowCompleteCheckInModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);

  // Check if active check-in is for this route
  const isCurrentRouteCheckIn = activeCheckIn?.route_id === Number(routeId);

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
        title={`${routeDetail.route.route_number} - ${routeDetail.route.name}`}
        subtitle={routeDetail.route.description}
        breadcrumbs={[
          { label: 'Routes', path: '/' },
          { label: routeDetail.route.route_number },
        ]}
        actions={
          <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap">
            <Link to="/routes/$routeId/forum" params={{ routeId }}>
              <Button variant="outline">
                View Forum
              </Button>
            </Link>
            {/* Check-in buttons */}
            {isAuthenticated ? (
              isCurrentRouteCheckIn ? (
                <Button
                  variant="tertiary"
                  onClick={() => setShowCompleteCheckInModal(true)}
                >
                  Complete Journey
                </Button>
              ) : !activeCheckIn ? (
                <Button
                  variant="primary"
                  onClick={() => setShowStartCheckInModal(true)}
                >
                  Start Check-in
                </Button>
              ) : null
            ) : null}
            <Button className="sm:ml-auto" variant="danger" onClick={() => setShowReportModal(true)}>
              Report Issue
            </Button>
          </div>
        }
      />
      <RouteDetail data={routeDetail} />

      {/* Start Check-in Modal */}
      <CheckInModal
        isOpen={showStartCheckInModal}
        onClose={() => setShowStartCheckInModal(false)}
        mode="start"
        route={routeDetail.route}
        routeStops={routeDetail.route.route_stops}
        onCheckInStart={(checkIn) => {
          // Invalidate active check-in query to update the banner
          window.dispatchEvent(new CustomEvent('invalidate-checkin'));
        }}
      />

      {/* Complete Check-in Modal */}
      {isCurrentRouteCheckIn && (
        <CheckInModal
          isOpen={showCompleteCheckInModal}
          onClose={() => setShowCompleteCheckInModal(false)}
          mode="complete"
          route={activeCheckIn.route}
          activeCheckIn={activeCheckIn}
          routeStops={routeDetail.route.route_stops}
          onCheckInComplete={(checkIn) => {
            // Invalidate active check-in query to update the banner
            window.dispatchEvent(new CustomEvent('invalidate-checkin'));
          }}
        />
      )}

      {/* Report Modal */}
      <ReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        initialRouteId={routeDetail.route.id}
      />
    </div>
  );
}
