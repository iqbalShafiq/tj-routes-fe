import { useReportsByRoute } from '../../lib/hooks/useReports';
import { Skeleton } from '../ui/Loading';
import { Card } from '../ui/Card';
import { useNavigate } from '@tanstack/react-router';

const formatTimeAgo = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return date.toLocaleDateString();
};

interface RelatedReportsByRouteWidgetProps {
  routeId: number;
  routeNumber?: string;
  excludeReportId: number;
}

export const RelatedReportsByRouteWidget = ({
  routeId,
  routeNumber,
  excludeReportId,
}: RelatedReportsByRouteWidgetProps) => {
  const navigate = useNavigate();
  const { data: reports, isLoading, error } = useReportsByRoute(routeId, excludeReportId, 5);

  const handleReportClick = (reportId: number) => {
    navigate({ to: '/feed/$reportId', params: { reportId: reportId.toString() } });
  };

  const formatCount = (count: number) => {
    if (count >= 1000) return `${(count / 1000).toFixed(1)}k`;
    return count.toString();
  };

  if (isLoading) {
    return (
      <Card size="sm">
        <div className="mb-4">
          <h3 className="font-display font-semibold text-text-primary">Route Reports</h3>
        </div>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-3 w-24" />
            </div>
          ))}
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card size="sm">
        <div className="mb-4">
          <h3 className="font-display font-semibold text-text-primary">Route Reports</h3>
        </div>
        <div className="text-center py-4 text-error text-sm">
          Failed to load reports
        </div>
      </Card>
    );
  }

  if (!reports?.data || reports.data.length === 0) {
    return (
      <Card size="sm">
        <div className="mb-4">
          <h3 className="font-display font-semibold text-text-primary">Route Reports</h3>
        </div>
        <div className="text-center py-4 text-text-muted text-sm">
          <p>No other reports for this route</p>
        </div>
      </Card>
    );
  }

  return (
    <Card size="sm">
      <div className="mb-4">
        <h3 className="font-display font-semibold text-text-primary">
          {routeNumber ? `Route ${routeNumber}` : 'Route'} Reports
        </h3>
      </div>
      <div className="space-y-3">
        {reports.data.map((report) => (
          <button
            key={report.id}
            onClick={() => handleReportClick(report.id)}
            className="w-full text-left p-2 rounded-lg hover:bg-bg-elevated transition-colors"
          >
            <p className="font-medium text-text-primary text-sm line-clamp-2">
              {report.title}
            </p>
            <div className="flex items-center gap-2 mt-1 text-xs text-text-muted">
              <span>{formatTimeAgo(report.created_at)}</span>
              <span className="flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                </svg>
                {formatCount(report.upvotes)}
              </span>
              <span className="flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                {formatCount(report.comment_count)}
              </span>
            </div>
          </button>
        ))}
      </div>
    </Card>
  );
};
