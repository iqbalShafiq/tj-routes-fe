import { createFileRoute, redirect, Link } from '@tanstack/react-router';
import { useRoutes } from '../../lib/hooks/useRoutes';
import { useStops } from '../../lib/hooks/useStops';
import { useVehicles } from '../../lib/hooks/useVehicles';
import { useReports } from '../../lib/hooks/useReports';
import { useUsers } from '../../lib/hooks/useUsers';
import { authApi } from '../../lib/api/auth';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Chip } from '../../components/ui/Chip';
import { Skeleton } from '../../components/ui/Loading';
import { PageHeader } from '../../components/layout';
import { format } from 'date-fns';

export const Route = createFileRoute('/admin/')({
  beforeLoad: async () => {
    const user = authApi.getCurrentUser();
    if (!user || user.role !== 'admin') {
      throw redirect({ to: '/' });
    }
  },
  component: AdminDashboard,
});

function StatCard({ 
  title, 
  value, 
  subtitle, 
  icon, 
  color,
  link 
}: { 
  title: string; 
  value: number | string; 
  subtitle?: string;
  icon: React.ReactNode; 
  color: string;
  link?: string;
}) {
  const content = (
    <Card className={`${link ? 'hover:border-tertiary cursor-pointer' : ''}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-text-muted mb-1">{title}</p>
          <p className={`text-3xl font-display font-bold ${color}`}>{value}</p>
          {subtitle && <p className="text-xs text-text-muted mt-1">{subtitle}</p>}
        </div>
        <div className={`w-14 h-14 rounded-sm flex items-center justify-center ${color.replace('text-', 'bg-')}/10`}>
          {icon}
        </div>
      </div>
    </Card>
  );

  if (link) {
    return <Link to={link}>{content}</Link>;
  }
  return content;
}

function AdminDashboard() {
  const { data: routesData, isLoading: routesLoading } = useRoutes(1, 1);
  const { data: stopsData, isLoading: stopsLoading } = useStops(1, 1);
  const { data: vehiclesData, isLoading: vehiclesLoading } = useVehicles(1, 1);
  const { data: reportsData, isLoading: reportsLoading } = useReports(1, 5);
  const { data: pendingReports } = useReports(1, 1, { status: 'pending' });
  const { data: usersData, isLoading: usersLoading } = useUsers(1, 1);

  const isLoading = routesLoading || stopsLoading || vehiclesLoading || reportsLoading || usersLoading;

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Admin Dashboard"
        subtitle="Manage TransJakarta routes, stops, vehicles, and user reports."
      />

      {/* Stats Grid - Primary metrics (top row) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
        {isLoading ? (
          <>
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-28 card-chamfered" />
            ))}
          </>
        ) : (
          <>
            <StatCard
              title="Total Routes"
              value={routesData?.total || 0}
              icon={<svg className="w-7 h-7 text-info" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg>}
              color="text-info"
              link="/admin/routes"
            />
            <StatCard
              title="Total Stops"
              value={stopsData?.total || 0}
              icon={<svg className="w-7 h-7 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /></svg>}
              color="text-success"
              link="/admin/stops"
            />
            <StatCard
              title="Total Vehicles"
              value={vehiclesData?.total || 0}
              icon={<svg className="w-7 h-7 text-tertiary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>}
              color="text-tertiary"
              link="/admin/vehicles"
            />
            <StatCard
              title="Pending Reports"
              value={pendingReports?.total || 0}
              icon={<svg className="w-7 h-7 text-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
              color="text-warning"
              link="/admin/reports"
            />
          </>
        )}
      </div>

      {/* Recent Reports and Right Column (Quick Actions + Bulk Management) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card static className="flex flex-col h-full">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-display font-semibold text-text-primary">Recent Reports</h2>
            <Link to="/admin/reports" className="text-sm text-warning hover:text-warning-hover">
              View All →
            </Link>
          </div>
          
          {reportsLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-16" />
              ))}
            </div>
          ) : reportsData && reportsData.data.length > 0 ? (
            <div className="space-y-3">
              {reportsData.data.slice(0, 5).map((report) => (
                <Link
                  key={report.id}
                  to="/admin/reports"
                  className="block p-3 bg-bg-main hover:bg-bg-elevated rounded-sm transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-text-primary truncate">{report.title}</p>
                      <p className="text-xs text-text-muted">
                        {format(new Date(report.created_at), 'MMM d, yyyy')}
                      </p>
                    </div>
                    <Chip variant={
                      report.status === 'pending' ? 'warning' :
                      report.status === 'reviewed' ? 'info' :
                      'success'
                    }>
                      {report.status}
                    </Chip>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-text-muted text-center py-8">No reports yet</p>
          )}
        </Card>

        {/* Right Column - Quick Actions and Bulk Management */}
        <div className="flex flex-col space-y-6 h-full">
          {/* Quick Actions */}
          <Card static className="flex-shrink-0">
            <h2 className="text-lg font-display font-semibold text-text-primary mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-3">
              <Link
                to="/admin/routes"
                className="group p-4 bg-bg-main hover:bg-bg-elevated border border-border hover:border-text-muted rounded-sm transition-all duration-200 text-center"
              >
                <p className="font-semibold text-text-primary text-sm mb-1">Add Route</p>
                <p className="text-xs text-text-muted">New transit route</p>
              </Link>
              <Link
                to="/admin/stops"
                className="group p-4 bg-bg-main hover:bg-bg-elevated border border-border hover:border-text-muted rounded-sm transition-all duration-200 text-center"
              >
                <p className="font-semibold text-text-primary text-sm mb-1">Add Stop</p>
                <p className="text-xs text-text-muted">New location</p>
              </Link>
              <Link
                to="/admin/vehicles"
                className="group p-4 bg-bg-main hover:bg-bg-elevated border border-border hover:border-text-muted rounded-sm transition-all duration-200 text-center"
              >
                <p className="font-semibold text-text-primary text-sm mb-1">Add Vehicle</p>
                <p className="text-xs text-text-muted">Register fleet</p>
              </Link>
              <Link
                to="/admin/users"
                className="group p-4 bg-bg-main hover:bg-bg-elevated border border-border hover:border-text-muted rounded-sm transition-all duration-200 text-center"
              >
                <p className="font-semibold text-text-primary text-sm mb-1">User Access</p>
                <p className="text-xs text-text-muted">Manage roles</p>
              </Link>
            </div>
          </Card>

          {/* Bulk Management */}
          <Card static className="flex-1 flex flex-col">
            <h2 className="text-lg font-display font-semibold text-text-primary mb-4">Bulk Management</h2>
            <Link to="/admin/bulk-upload" className="flex-1 flex items-center justify-center">
              <div className="border-2 border-dashed border-border rounded-sm p-6 w-full text-center hover:border-text-muted hover:bg-bg-main transition-all duration-200">
                <p className="text-sm text-text-secondary mb-4">
                  Upload CSV to update routes, stops, or fleet data in bulk.
                </p>
                <Button variant="primary" size="sm">
                  Import Data
                </Button>
              </div>
            </Link>
          </Card>
        </div>
      </div>
    </div>
  );
}

