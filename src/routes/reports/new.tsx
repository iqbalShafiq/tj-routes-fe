import { createFileRoute, useNavigate, useSearch, redirect } from '@tanstack/react-router';
import { ReportForm } from '../../components/ReportForm';
import { useAuth } from '../../lib/hooks/useAuth';
import { authApi } from '../../lib/api/auth';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { PageHeader } from '../../components/layout';

export const Route = createFileRoute('/reports/new')({
  beforeLoad: async () => {
    // Check if user is authenticated
    if (!authApi.isAuthenticated()) {
      throw redirect({
        to: '/auth/login',
      });
    }
  },
  component: NewReportPage,
  validateSearch: (search: Record<string, unknown>) => {
    return {
      routeId: search.routeId ? Number(search.routeId) : undefined,
      stopId: search.stopId ? Number(search.stopId) : undefined,
    };
  },
});

function NewReportPage() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const search = useSearch({ from: '/reports/new' });

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto animate-fade-in">
        <Card static>
          <div className="text-center py-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-100 mb-4 card-chamfered">
              <svg className="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h2 className="text-2xl font-display font-bold text-slate-900 mb-2">Authentication Required</h2>
            <p className="text-slate-600 mb-6">
              You need to be logged in to submit a report.
            </p>
            <Button variant="accent" onClick={() => navigate({ to: '/auth/login' })}>
              Go to Login
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl animate-fade-in">
      <PageHeader
        title="Submit Report"
        subtitle="Report route changes, issues, or temporary events"
        breadcrumbs={[
          { label: 'My Reports', path: '/reports' },
          { label: 'New Report' },
        ]}
      />
      <Card static>
        <ReportForm initialRouteId={search.routeId} initialStopId={search.stopId} />
      </Card>
    </div>
  );
}
