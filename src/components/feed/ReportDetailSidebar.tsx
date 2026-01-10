import { AuthorProfileWidget } from './AuthorProfileWidget';
import { RelatedReportsByTypeWidget } from './RelatedReportsByTypeWidget';
import { RelatedReportsByRouteWidget } from './RelatedReportsByRouteWidget';
import { RelatedReportsByStopWidget } from './RelatedReportsByStopWidget';
import type { Report } from '../../lib/api/reports';

interface ReportDetailSidebarProps {
  report: Report;
}

export const ReportDetailSidebar = ({ report }: ReportDetailSidebarProps) => {
  return (
    <aside className="hidden lg:block w-80 sticky top-8 self-start max-h-[calc(100vh-4rem)] overflow-y-auto">
      <div className="space-y-6">
        {/* Author Profile */}
        {report.user && (
          <AuthorProfileWidget userId={report.user_id} />
        )}

        {/* Similar Reports (by type) */}
        <RelatedReportsByTypeWidget
          type={report.type}
          excludeReportId={report.id}
        />

        {/* Route Reports (if has route) */}
        {report.related_route_id && (
          <RelatedReportsByRouteWidget
            routeId={report.related_route_id}
            routeNumber={report.route?.route_number}
            excludeReportId={report.id}
          />
        )}

        {/* Stop Reports (if has stop) */}
        {report.related_stop_id && (
          <RelatedReportsByStopWidget
            stopId={report.related_stop_id}
            stopName={report.stop?.name}
            excludeReportId={report.id}
          />
        )}
      </div>
    </aside>
  );
};
