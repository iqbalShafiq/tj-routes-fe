import { Link } from '@tanstack/react-router';
import { Card } from './ui/Card';
import { Chip } from './ui/Chip';
import { formatDistanceToNow } from 'date-fns';
import type { Report } from '../lib/api/reports';
import { REPORT_TYPES, REPORT_STATUSES } from '../lib/utils/constants';
import { ShareReportButton } from './ShareReportButton';

interface ReportListCardProps {
  report: Report;
}

const getStatusVariant = (color?: string): 'warning' | 'info' | 'success' | 'default' => {
  switch (color) {
    case 'amber': return 'warning';
    case 'blue': return 'info';
    case 'emerald': return 'success';
    default: return 'default';
  }
};

export const ReportListCard = ({ report }: ReportListCardProps) => {
  const typeInfo = REPORT_TYPES.find(t => t.value === report.type);
  const statusInfo = REPORT_STATUSES.find(s => s.value === report.status);

  return (
    <Link
      to="/feed/$reportId"
      params={{ reportId: String(report.id) }}
      className="block"
    >
      <Card size="sm" className="hover:shadow-md transition-shadow p-4">
        <div className="flex items-start gap-3">
          {/* Type icon */}
          <div className={`
            w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0
            ${report.type === 'route_issue' ? 'bg-error/10 text-error' :
              report.type === 'stop_issue' ? 'bg-warning/10 text-warning' :
              report.type === 'temporary_event' ? 'bg-info/10 text-info' :
              'bg-accent/10 text-accent'}
          `}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>

          <div className="flex-1 min-w-0">
            {/* Title and type */}
            <div className="flex items-start justify-between gap-2 mb-1">
              <h3 className="font-display font-semibold text-text-primary truncate text-sm sm:text-base">
                {report.title}
              </h3>
              <Chip
                variant={getStatusVariant(statusInfo?.color)}
                size="sm"
              >
                {statusInfo?.label || report.status}
              </Chip>
            </div>

            {/* Type label */}
            <p className="text-xs text-text-muted mb-2">
              {typeInfo?.label || report.type}
            </p>

            {/* Route/Stop info */}
            {report.route && (
              <div className="flex items-center gap-2 text-xs text-text-secondary mb-2">
                <span className="font-semibold text-accent">{report.route.route_number}</span>
                <span>{report.route.name}</span>
              </div>
            )}

            {report.stop && (
              <div className="flex items-center gap-2 text-xs text-text-secondary mb-2">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="truncate">{report.stop.name}</span>
              </div>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between text-xs text-text-muted mt-2 pt-2 border-t border-border">
              <span>{formatDistanceToNow(new Date(report.created_at), { addSuffix: true })}</span>
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                  </svg>
                  {report.upvotes}
                </span>
                <span className="flex items-center gap-1">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  {report.comment_count}
                </span>
                <div onClick={(e) => e.stopPropagation()} title="Share report">
                  <ShareReportButton report={report} variant="icon-only" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
};
