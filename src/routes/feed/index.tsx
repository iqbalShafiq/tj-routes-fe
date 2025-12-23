import { useState } from 'react';
import { createFileRoute, Link } from '@tanstack/react-router';
import { useReports, useReactToReport } from '../../lib/hooks/useReports';
import { useAuth } from '../../lib/hooks/useAuth';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { FilterSelect } from '../../components/ui/FilterSelect';
import { Skeleton } from '../../components/ui/Loading';
import { PageHeader } from '../../components/layout';
import { format, formatDistanceToNow } from 'date-fns';
import type { Report } from '../../lib/api/reports';
import { REPORT_TYPES, REPORT_STATUSES } from '../../lib/utils/constants';

export const Route = createFileRoute('/feed/')({
  component: FeedPage,
});

function ReportCard({ report }: { report: Report }) {
  const { isAuthenticated } = useAuth();
  const reactMutation = useReactToReport();

  const typeInfo = REPORT_TYPES.find(t => t.value === report.type);
  const statusInfo = REPORT_STATUSES.find(s => s.value === report.status);

  const handleReaction = (type: 'upvote' | 'downvote') => {
    if (!isAuthenticated) return;
    reactMutation.mutate({ reportId: report.id, type });
  };

  const getStatusColor = (color?: string) => {
    switch (color) {
      case 'amber': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'blue': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'emerald': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getTypeIcon = () => {
    switch (report.type) {
      case 'route_issue':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
          </svg>
        );
      case 'stop_issue':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          </svg>
        );
      case 'temporary_event':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        );
    }
  };

  return (
    <Card className="mb-4">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center text-white font-bold">
            {report.user?.username?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <Link 
                to="/profile/$userId" 
                params={{ userId: String(report.user_id) }}
                className="font-medium text-slate-900 hover:text-amber-600"
              >
                {report.user?.username || 'Anonymous'}
              </Link>
              {report.user?.level && (
                <span className="px-2 py-0.5 text-xs bg-slate-100 text-slate-600 rounded-full">
                  {report.user.level}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500">
              {formatDistanceToNow(new Date(report.created_at), { addSuffix: true })}
            </p>
          </div>
        </div>
        <span className={`px-2 py-1 text-xs font-medium border rounded ${getStatusColor(statusInfo?.color)}`}>
          {statusInfo?.label || report.status}
        </span>
      </div>

      {/* Content */}
      <Link to="/feed/$reportId" params={{ reportId: String(report.id) }}>
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-amber-600">{getTypeIcon()}</span>
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              {typeInfo?.label || report.type}
            </span>
          </div>
          <h3 className="text-xl font-display font-semibold text-slate-900 mb-2 hover:text-amber-600 transition-colors">
            {report.title}
          </h3>
          <p className="text-slate-600 line-clamp-3">{report.description}</p>
        </div>

        {/* Images */}
        {report.photo_urls && report.photo_urls.length > 0 && (
          <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
            {report.photo_urls.slice(0, 4).map((url, idx) => (
              <img 
                key={idx}
                src={url} 
                alt={`Report image ${idx + 1}`}
                className="w-32 h-24 object-cover rounded-lg flex-shrink-0"
              />
            ))}
          </div>
        )}

        {/* Related info */}
        {(report.route || report.stop) && (
          <div className="flex flex-wrap gap-2 mb-4">
            {report.route && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-50 text-amber-700 text-xs rounded">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
                Route {report.route.route_number}
              </span>
            )}
            {report.stop && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-slate-100 text-slate-700 text-xs rounded">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                </svg>
                {report.stop.name}
              </span>
            )}
          </div>
        )}
      </Link>

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-100">
        <div className="flex items-center gap-4">
          <button
            onClick={() => handleReaction('upvote')}
            disabled={!isAuthenticated || reactMutation.isPending}
            className="flex items-center gap-1 text-slate-500 hover:text-emerald-600 transition-colors disabled:opacity-50"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
            <span className="text-sm font-medium">{report.upvotes}</span>
          </button>
          <button
            onClick={() => handleReaction('downvote')}
            disabled={!isAuthenticated || reactMutation.isPending}
            className="flex items-center gap-1 text-slate-500 hover:text-red-600 transition-colors disabled:opacity-50"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
            <span className="text-sm font-medium">{report.downvotes}</span>
          </button>
          <Link 
            to="/feed/$reportId" 
            params={{ reportId: String(report.id) }}
            className="flex items-center gap-1 text-slate-500 hover:text-amber-600 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <span className="text-sm font-medium">{report.comment_count}</span>
          </Link>
        </div>
        <p className="text-xs text-slate-400">
          {format(new Date(report.created_at), 'MMM d, yyyy')}
        </p>
      </div>
    </Card>
  );
}

function FeedPage() {
  const { isAuthenticated } = useAuth();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const limit = 10;

  const { data, isLoading, error } = useReports(page, limit, {
    search: search || undefined,
    type: typeFilter !== 'all' ? typeFilter : undefined,
    status: statusFilter !== 'all' ? statusFilter as any : undefined,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  if (isLoading && !data) {
    return (
      <div className="animate-fade-in max-w-3xl mx-auto">
        <PageHeader
          title="Community Feed"
          subtitle="See what's happening on TransJakarta routes and stops."
        />
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
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
        <p className="text-red-600 font-display text-lg mb-2">Error loading feed</p>
        <p className="text-slate-600 text-sm">Please try again later.</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="max-w-3xl mx-auto">
        <PageHeader
          title="Community Feed"
          subtitle="See what's happening on TransJakarta routes and stops. Share updates and help fellow commuters."
          actions={
            isAuthenticated && (
              <Link to="/reports/new">
                <Button variant="accent">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  New Report
                </Button>
              </Link>
            )
          }
        >
          <div className="space-y-4">
            <form onSubmit={handleSearch} className="flex gap-3">
              <Input
                type="text"
                placeholder="Search reports..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="flex-1"
              />
              <Button type="submit" variant="accent">
                Search
              </Button>
            </form>
            
            <div className="flex flex-wrap gap-2">
              <FilterSelect
                label="Type"
                value={typeFilter}
                onChange={(value) => {
                  setTypeFilter(value as string);
                  setPage(1);
                }}
                options={[
                  { value: 'all', label: 'All Types' },
                  ...REPORT_TYPES.map(type => ({ value: type.value, label: type.label })),
                ]}
              />
              <FilterSelect
                label="Status"
                value={statusFilter}
                onChange={(value) => {
                  setStatusFilter(value as string);
                  setPage(1);
                }}
                options={[
                  { value: 'all', label: 'All Statuses' },
                  ...REPORT_STATUSES.map(status => ({ value: status.value, label: status.label })),
                ]}
              />
            </div>
          </div>
        </PageHeader>

        {data && data.data.length > 0 ? (
          <>
            <div className="space-y-4 mb-8">
              {data.data.map((report, index) => (
                <div key={report.id} style={{ animationDelay: `${index * 50}ms` }} className="animate-stagger-1">
                  <ReportCard report={report} />
                </div>
              ))}
            </div>

            <div className="flex justify-center items-center gap-4 pb-8">
              <Button
                variant="outline"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                ← Previous
              </Button>
              <span className="text-slate-600 text-sm font-medium px-4">
                Page {page} of {data.total_pages}
              </span>
              <Button
                variant="outline"
                onClick={() => setPage((p) => Math.min(data.total_pages, p + 1))}
                disabled={page >= data.total_pages}
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                </svg>
              </div>
              <p className="text-slate-600 font-display text-lg">No reports yet</p>
              <p className="text-slate-500 text-sm mt-2 mb-6">Be the first to share something!</p>
              {isAuthenticated && (
                <Link to="/reports/new">
                  <Button variant="accent">Create Report</Button>
                </Link>
              )}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

