import { createFileRoute, redirect, Link } from '@tanstack/react-router';
import { useRoutes } from '../../lib/hooks/useRoutes';
import { useStops } from '../../lib/hooks/useStops';
import { useVehicles } from '../../lib/hooks/useVehicles';
import { useReports } from '../../lib/hooks/useReports';
import { useUsers } from '../../lib/hooks/useUsers';
import { authApi } from '../../lib/api/auth';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
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
    <Card className={`${link ? 'hover:border-amber-300 cursor-pointer' : ''}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500 mb-1">{title}</p>
          <p className={`text-3xl font-display font-bold ${color}`}>{value}</p>
          {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
        </div>
        <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${color.replace('text-', 'bg-').replace('600', '100')}`}>
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

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
              icon={<svg className="w-7 h-7 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg>}
              color="text-blue-600"
              link="/admin/routes"
            />
            <StatCard
              title="Total Stops"
              value={stopsData?.total || 0}
              icon={<svg className="w-7 h-7 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /></svg>}
              color="text-emerald-600"
              link="/admin/stops"
            />
            <StatCard
              title="Total Vehicles"
              value={vehiclesData?.total || 0}
              icon={<svg className="w-7 h-7 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>}
              color="text-purple-600"
              link="/admin/vehicles"
            />
            <StatCard
              title="Pending Reports"
              value={pendingReports?.total || 0}
              subtitle="Awaiting review"
              icon={<svg className="w-7 h-7 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
              color="text-amber-600"
              link="/admin/reports"
            />
          </>
        )}
      </div>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard
          title="Total Users"
          value={usersData?.total || 0}
          icon={<svg className="w-7 h-7 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>}
          color="text-slate-600"
          link="/admin/users"
        />
        <StatCard
          title="Total Reports"
          value={reportsData?.total || 0}
          icon={<svg className="w-7 h-7 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}
          color="text-red-600"
          link="/admin/reports"
        />
        <Card static>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 mb-1">Bulk Upload</p>
              <p className="text-lg font-display font-semibold text-slate-900">Import Data</p>
              <p className="text-xs text-slate-400 mt-1">CSV upload for routes, stops, vehicles</p>
            </div>
            <Link to="/admin/bulk-upload">
              <Button variant="accent" size="sm">
                Upload
              </Button>
            </Link>
          </div>
        </Card>
      </div>

      {/* Recent Reports */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card static>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-display font-semibold text-slate-900">Recent Reports</h2>
            <Link to="/admin/reports" className="text-sm text-amber-600 hover:text-amber-700">
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
                  className="block p-3 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-900 truncate">{report.title}</p>
                      <p className="text-xs text-slate-500">
                        {format(new Date(report.created_at), 'MMM d, yyyy')}
                      </p>
                    </div>
                    <span className={`
                      px-2 py-1 text-xs font-medium rounded
                      ${report.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                        report.status === 'reviewed' ? 'bg-blue-100 text-blue-700' :
                        'bg-emerald-100 text-emerald-700'}
                    `}>
                      {report.status}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-slate-500 text-center py-8">No reports yet</p>
          )}
        </Card>

        {/* Quick Actions */}
        <Card static>
          <h2 className="text-lg font-display font-semibold text-slate-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            <Link to="/admin/routes">
              <Button variant="outline" className="w-full justify-start">
                <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                Add Route
              </Button>
            </Link>
            <Link to="/admin/stops">
              <Button variant="outline" className="w-full justify-start">
                <svg className="w-5 h-5 mr-2 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                Add Stop
              </Button>
            </Link>
            <Link to="/admin/vehicles">
              <Button variant="outline" className="w-full justify-start">
                <svg className="w-5 h-5 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                Add Vehicle
              </Button>
            </Link>
            <Link to="/admin/bulk-upload">
              <Button variant="outline" className="w-full justify-start">
                <svg className="w-5 h-5 mr-2 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                Bulk Import
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}

