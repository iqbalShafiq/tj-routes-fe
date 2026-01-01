import { useState } from 'react';
import { createFileRoute, useNavigate, redirect } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { reportsApi } from '../../lib/api/reports';
import { useAuth } from '../../lib/hooks/useAuth';
import { authApi } from '../../lib/api/auth';
import { Card, CardBody } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Chip } from '../../components/ui/Chip';
import { Skeleton } from '../../components/ui/Loading';
import { PageHeader } from '../../components/layout';
import { ReportModal } from '../../components/ReportModal';
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
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

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
            <div className="inline-flex items-center justify-center w-16 h-16 bg-warning/10 mb-4 card-chamfered">
              <svg className="w-8 h-8 text-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h2 className="text-2xl font-display font-bold text-text-primary mb-2">Authentication Required</h2>
            <p className="text-text-secondary mb-6">
              You need to be logged in to view your reports.
            </p>
            <Button variant="primary" onClick={() => navigate({ to: '/auth/login' })}>
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
        <p className="text-error font-display text-lg mb-2">Error loading reports</p>
        <p className="text-text-secondary text-sm">Please try again later.</p>
      </div>
    );
  }

  const getStatusVariant = (status: string): 'success' | 'info' | 'warning' | 'default' => {
    switch (status) {
      case 'resolved':
        return 'success';
      case 'reviewed':
        return 'info';
      case 'pending':
        return 'warning';
      default:
        return 'default';
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
          <Button variant="primary" onClick={() => setIsReportModalOpen(true)}>
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
                      <h3 className="text-xl font-display font-semibold text-text-primary">Report #{report.id}</h3>
                      <Chip variant={getStatusVariant(report.status)}>
                        {report.status}
                      </Chip>
                      <Chip variant="default">
                        {getTypeLabel(report.type)}
                      </Chip>
                    </div>
                    <p className="text-sm text-text-muted mb-4">{format(new Date(report.created_at), 'PPp')}</p>
                  </div>
                </div>
                <CardBody>
                  {report.route && (
                    <div className="mb-3 p-3 bg-bg-main rounded-sm">
                      <p className="text-sm text-text-secondary mb-1">
                        <span className="font-medium">Route:</span> {report.route.route_number} - {report.route.name}
                      </p>
                    </div>
                  )}
                  {report.stop && (
                    <div className="mb-3 p-3 bg-bg-main rounded-sm">
                      <p className="text-sm text-text-secondary">
                        <span className="font-medium">Stop:</span> {report.stop.name}
                      </p>
                    </div>
                  )}
                  <p className="text-text-secondary mb-4 leading-relaxed">{report.description}</p>
                  {report.admin_notes && (
                    <div className="mt-4 p-4 bg-bg-main border border-border card-chamfered-sm">
                      <p className="text-sm font-display font-medium text-text-primary mb-2">Admin Notes:</p>
                      <p className="text-sm text-text-secondary leading-relaxed">{report.admin_notes}</p>
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
        <Card static>
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-bg-elevated mb-4 card-chamfered">
              <svg className="w-8 h-8 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-text-secondary font-display text-lg mb-2">No reports yet</p>
            <p className="text-text-muted text-sm mb-6">Start by submitting your first report</p>
            <Button variant="primary" onClick={() => setIsReportModalOpen(true)}>
              Submit Your First Report
            </Button>
          </div>
        </Card>
      )}

      <ReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        onSuccess={() => {
          // Optionally refresh data or show notification
        }}
      />
    </div>
  );
}
