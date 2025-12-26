import { Link } from '@tanstack/react-router';
import { Card } from './ui/Card';
import type { Route, RouteDetailResponse, RouteStatistics, ReportSummary, ForumPostSummary } from '../lib/api/routes';

interface RouteDetailProps {
  data: RouteDetailResponse;
}

// Helper component for status badge
const StatusBadge = ({ status }: { status: string }) => {
  const colors: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-700',
    reviewed: 'bg-blue-100 text-blue-700',
    resolved: 'bg-emerald-100 text-emerald-700',
    active: 'bg-emerald-100 text-emerald-700',
    inactive: 'bg-slate-100 text-slate-700',
  };

  return (
    <span className={`px-3 py-1 text-sm font-medium ${colors[status] || 'bg-slate-100 text-slate-700'}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

// Section 1: Route Info Card
const RouteInfoCard = ({ route, forumId }: { route: Route; forumId?: number | null }) => (
  <Card className="mb-6">
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 bg-slate-900 flex items-center justify-center">
          <span className="text-white font-display font-bold text-xl">{route.code}</span>
        </div>
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-900">{route.name}</h1>
          {route.description && (
            <p className="text-slate-600 mt-1">{route.description}</p>
          )}
        </div>
      </div>
      <StatusBadge status={route.status} />
    </div>

    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
      <div className="p-4 bg-slate-50">
        <p className="text-sm text-slate-500 mb-1">Total Stops</p>
        <p className="text-2xl font-display font-bold text-slate-900">
          {route.stops?.length || route.route_stops?.length || 0}
        </p>
      </div>
      <div className="p-4 bg-slate-50">
        <p className="text-sm text-slate-500 mb-1">Route ID</p>
        <p className="text-2xl font-display font-bold text-slate-900">#{route.id}</p>
      </div>
      {forumId !== undefined && forumId !== null && (
        <div className="p-4 bg-slate-50">
          <p className="text-sm text-slate-500 mb-1">Forum</p>
          <Link
            to="/routes/$routeId/forum"
            params={{ routeId: route.id.toString() }}
            className="text-2xl font-display font-bold text-amber-600 hover:text-amber-700"
          >
            View
          </Link>
        </div>
      )}
    </div>
  </Card>
);

// Section 2: Statistics Dashboard
const StatisticsSection = ({ statistics }: { statistics: RouteStatistics }) => {
  const formatPercent = (value: number) => `${Math.round(value * 100)}%`;
  const getActivityColor = (score: number) => {
    if (score >= 7) return 'text-emerald-600 bg-emerald-50';
    if (score >= 4) return 'text-amber-600 bg-amber-50';
    return 'text-red-600 bg-red-50';
  };

  return (
    <Card className="mb-6">
      <div className="mb-6">
        <h2 className="text-xl font-display font-bold text-slate-900 mb-2">Route Statistics</h2>
        <p className="text-slate-600">Community engagement and report metrics</p>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="p-4 bg-slate-50 text-center">
          <p className="text-sm text-slate-500 mb-1">Total Reports</p>
          <p className="text-3xl font-display font-bold text-slate-900">{statistics.total_reports}</p>
        </div>
        <div className="p-4 bg-slate-50 text-center">
          <p className="text-sm text-slate-500 mb-1">Resolution Rate</p>
          <p className="text-3xl font-display font-bold text-slate-900">{formatPercent(statistics.report_resolution_rate)}</p>
        </div>
        <div className="p-4 bg-slate-50 text-center">
          <p className="text-sm text-slate-500 mb-1">Activity Score</p>
          <p className={`text-3xl font-display font-bold px-3 py-1 rounded-lg ${getActivityColor(statistics.community_activity_score)}`}>
            {statistics.community_activity_score.toFixed(1)}
          </p>
        </div>
        <div className="p-4 bg-slate-50 text-center">
          <p className="text-sm text-slate-500 mb-1">Forum Members</p>
          <p className="text-3xl font-display font-bold text-slate-900">{statistics.forum_member_count}</p>
        </div>
      </div>

      {/* Reports by Status and Type */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Reports by Status */}
        <div className="p-4 bg-slate-50">
          <h3 className="font-semibold text-slate-900 mb-3">Reports by Status</h3>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-slate-600">Pending</span>
                <span className="font-medium text-slate-900">{statistics.reports_by_status.pending}</span>
              </div>
              <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-400 rounded-full transition-all"
                  style={{ width: `${(statistics.reports_by_status.pending / statistics.total_reports) * 100}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-slate-600">Reviewed</span>
                <span className="font-medium text-slate-900">{statistics.reports_by_status.reviewed}</span>
              </div>
              <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-400 rounded-full transition-all"
                  style={{ width: `${(statistics.reports_by_status.reviewed / statistics.total_reports) * 100}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-slate-600">Resolved</span>
                <span className="font-medium text-slate-900">{statistics.reports_by_status.resolved}</span>
              </div>
              <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-400 rounded-full transition-all"
                  style={{ width: `${(statistics.reports_by_status.resolved / statistics.total_reports) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Reports by Type */}
        <div className="p-4 bg-slate-50">
          <h3 className="font-semibold text-slate-900 mb-3">Reports by Type</h3>
          <div className="space-y-2">
            {Object.entries(statistics.reports_by_type).map(([type, count]) => (
              <div key={type} className="flex items-center justify-between">
                <span className="text-sm text-slate-600 capitalize">{type.replace('_', ' ')}</span>
                <span className="font-medium text-slate-900">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Forum Activity */}
      <div className="mt-6 p-4 bg-slate-50">
        <h3 className="font-semibold text-slate-900 mb-3">Forum Activity</h3>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-display font-bold text-slate-900">{statistics.forum_post_count}</p>
            <p className="text-sm text-slate-500">Posts</p>
          </div>
          <div>
            <p className="text-2xl font-display font-bold text-emerald-600">+{statistics.total_post_upvotes}</p>
            <p className="text-sm text-slate-500">Upvotes</p>
          </div>
          <div>
            <p className="text-2xl font-display font-bold text-red-400">-{statistics.total_post_downvotes}</p>
            <p className="text-sm text-slate-500">Downvotes</p>
          </div>
        </div>
      </div>
    </Card>
  );
};

// Section 3: Recent Reports
const RecentReportsSection = ({ reports }: { reports: ReportSummary[] }) => {
  if (!reports || reports.length === 0) {
    return null;
  }

  return (
    <Card className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-display font-bold text-slate-900">Recent Reports</h2>
          <p className="text-slate-600 text-sm">Latest community reports for this route</p>
        </div>
      </div>
      <div className="space-y-3">
        {reports.map((report, index) => (
          <Link
            key={report.id}
            to="/reports/$reportId"
            params={{ reportId: report.id.toString() }}
            className="group flex items-start gap-4 p-4 border border-slate-200 hover:border-amber-300 hover:bg-amber-50/30 transition-all duration-200 animate-fade-in"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className="flex-shrink-0 w-10 h-10 bg-slate-900 text-white flex items-center justify-center font-display font-bold">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <h4 className="font-display font-semibold text-slate-900 group-hover:text-amber-700 transition-colors truncate">
                  {report.title}
                </h4>
                <StatusBadge status={report.status} />
              </div>
              <div className="flex items-center gap-3 mt-2 text-sm text-slate-500">
                <span className="capitalize">{report.type.replace('_', ' ')}</span>
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                  </svg>
                  {report.upvotes}
                </span>
                <span>{new Date(report.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </Card>
  );
};

// Section 4: Recent Forum Posts
const RecentPostsSection = ({ posts }: { posts: ForumPostSummary[] }) => {
  if (!posts || posts.length === 0) {
    return null;
  }

  const postTypeIcons: Record<string, JSX.Element> = {
    discussion: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    ),
    question: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    info: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    announcement: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
      </svg>
    ),
  };

  return (
    <Card className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-display font-bold text-slate-900">Recent Forum Posts</h2>
          <p className="text-slate-600 text-sm">Latest discussions in this route's forum</p>
        </div>
      </div>
      <div className="space-y-3">
        {posts.map((post, index) => (
          <Link
            key={post.id}
            to="/routes/$routeId/forum"
            params={{ routeId: post.id.toString() }}
            className="group flex items-start gap-4 p-4 border border-slate-200 hover:border-blue-300 hover:bg-blue-50/30 transition-all duration-200 animate-fade-in"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className="flex-shrink-0 w-10 h-10 bg-blue-900 text-white flex items-center justify-center">
              {postTypeIcons[post.post_type]}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <h4 className="font-display font-semibold text-slate-900 group-hover:text-blue-700 transition-colors truncate">
                  {post.title}
                </h4>
                <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 capitalize">
                  {post.post_type}
                </span>
              </div>
              <div className="flex items-center gap-3 mt-2 text-sm text-slate-500">
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                  </svg>
                  {post.upvotes}
                </span>
                <span>{new Date(post.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </Card>
  );
};

// Section 5: Route Stops (existing)
const RouteStopsSection = ({ stops }: { stops?: any[] }) => {
  if (!stops || stops.length === 0) {
    return null;
  }

  return (
    <Card>
      <div className="mb-6">
        <h2 className="text-xl font-display font-bold text-slate-900">Route Stops</h2>
        <p className="text-slate-600">{stops.length} stops in sequence</p>
      </div>
      <div className="space-y-3">
        {stops
          .sort((a, b) => (a.sequence || 0) - (b.sequence || 0))
          .map((stop, index) => (
            <div
              key={stop.id}
              className="group relative flex items-start gap-4 p-5 border border-slate-200 hover:border-amber-300 hover:bg-amber-50/30 transition-all duration-200 animate-fade-in"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex-shrink-0 w-12 h-12 bg-slate-900 text-white flex items-center justify-center font-display font-bold text-lg shadow-md group-hover:shadow-lg transition-shadow">
                {index + 1}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-display font-semibold text-slate-900 text-lg mb-1 group-hover:text-amber-700 transition-colors">
                  {stop.name}
                </h4>
                {stop.code && (
                  <p className="text-sm text-slate-500 font-mono mb-2">Code: {stop.code}</p>
                )}
                {stop.address && (
                  <div className="flex items-start gap-2 mt-2">
                    <svg className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <p className="text-sm text-slate-600 leading-relaxed">{stop.address}</p>
                  </div>
                )}
                {stop.facilities && stop.facilities.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {stop.facilities.map((facility: string, i: number) => (
                      <span
                        key={i}
                        className="px-3 py-1 text-xs font-medium bg-amber-100 text-amber-700"
                      >
                        {facility}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
      </div>
    </Card>
  );
};

export const RouteDetail = ({ data }: RouteDetailProps) => {
  const { route, statistics, recent_reports, recent_posts } = data;

  return (
    <div className="w-full animate-fade-in">
      {/* Section 1: Route Info Card */}
      <RouteInfoCard route={route} forumId={statistics.forum_id} />

      {/* Section 2: Statistics Dashboard */}
      <StatisticsSection statistics={statistics} />

      {/* Section 3: Recent Reports */}
      <RecentReportsSection reports={recent_reports} />

      {/* Section 4: Recent Forum Posts */}
      <RecentPostsSection posts={recent_posts} />

      {/* Section 5: Route Stops */}
      <RouteStopsSection stops={route.stops} />
    </div>
  );
};
