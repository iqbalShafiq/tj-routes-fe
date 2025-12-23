import { useState } from 'react';
import { createFileRoute, useNavigate, redirect } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { reportsApi } from '../../lib/api/reports';
import { useAuth } from '../../lib/hooks/useAuth';
import { authApi } from '../../lib/api/auth';
import { Card, CardBody } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Skeleton } from '../../components/ui/Loading';
import { PageHeader } from '../../components/layout';
import { format } from 'date-fns';

export const Route = createFileRoute('/reports/')({
  beforeLoad: async () => {
    // Check if user is authenticated
    if (!authApi.isAuthenticated()) {
      throw redirect({
        to: '/auth/login',
      });
    }
  },
  component: ReportsPage,
});

function ReportsPage() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const limit = 20;

  const { data, isLoading, error } = useQuery({
    queryKey: ['reports', page],
    queryFn: () => reportsApi.getReports(page, limit),
    enabled: isAuthenticated,
  });

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto animate-fade-in">
        <Card>
          <div className="text-center py-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-100 mb-4 card-chamfered">
              <svg className="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h2 className="text-2xl font-display font-bold text-slate-900 mb-2">Authentication Required</h2>
            <p className="text-slate-600 mb-6">
              You need to be logged in to view your reports.
            </p>
            <Button variant="accent" onClick={() => navigate({ to: '/auth/login' })}>
              Go to Login
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="animate-fade-in">
        <PageHeader
          title="My Reports"
          subtitle="Track the status of your submitted reports"
        />
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-40 card-chamfered" />
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
        <p className="text-red-600 font-display text-lg mb-2">Error loading reports</p>
        <p className="text-slate-600 text-sm">Please try again later.</p>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'resolved':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'reviewed':
        return 'bg-slate-100 text-slate-700 border-slate-200';
      case 'pending':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'policy_change':
        return 'Policy Change';
      case 'temporary_event':
        return 'Temporary Event';
      default:
        return 'Other';
    }
  };

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="My Reports"
        subtitle="Track the status of your submitted reports"
        actions={
          <Button variant="accent" onClick={() => navigate({ to: '/reports/new' })}>
            New Report
          </Button>
        }
      />

      {data && data.data.length > 0 ? (
        <>
          <div className="space-y-4 mb-8">
            {data.data.map((report, index) => (
              <Card key={report.id} className="animate-fade-in" style={{ animationDelay: `${index * 50}ms` }}>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-xl font-display font-semibold text-slate-900">Report #{report.id}</h3>
                      <span className={`px-3 py-1 text-xs font-medium border card-chamfered-sm ${getStatusColor(report.status)}`}>
                        {report.status}
                      </span>
                      <span className="px-3 py-1 text-xs font-medium bg-slate-100 text-slate-700 card-chamfered-sm">
                        {getTypeLabel(report.type)}
                      </span>
                    </div>
                    <p className="text-sm text-slate-500 mb-4">{format(new Date(report.created_at), 'PPp')}</p>
                  </div>
                </div>
                <CardBody>
                  {report.route && (
                    <div className="mb-3 p-3 bg-slate-50 rounded-lg">
                      <p className="text-sm text-slate-600 mb-1">
                        <span className="font-medium">Route:</span> {report.route.code} - {report.route.name}
                      </p>
                    </div>
                  )}
                  {report.stop && (
                    <div className="mb-3 p-3 bg-slate-50 rounded-lg">
                      <p className="text-sm text-slate-600">
                        <span className="font-medium">Stop:</span> {report.stop.name}
                      </p>
                    </div>
                  )}
                  <p className="text-slate-700 mb-4 leading-relaxed">{report.description}</p>
                  {report.admin_notes && (
                    <div className="mt-4 p-4 bg-slate-50 border border-slate-200 card-chamfered-sm">
                      <p className="text-sm font-display font-medium text-slate-900 mb-2">Admin Notes:</p>
                      <p className="text-sm text-slate-700 leading-relaxed">{report.admin_notes}</p>
                    </div>
                  )}
                </CardBody>
              </Card>
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
        <Card static>
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-100 mb-4 card-chamfered">
              <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-slate-600 font-display text-lg mb-2">No reports yet</p>
            <p className="text-slate-500 text-sm mb-6">Start by submitting your first report</p>
            <Button variant="accent" onClick={() => navigate({ to: '/reports/new' })}>
              Submit Your First Report
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
