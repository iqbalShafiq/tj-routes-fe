import { Link } from '@tanstack/react-router';
import { useState, useMemo, useRef, useEffect } from 'react';
import { Card } from './ui/Card';
import { Chip } from './ui/Chip';
import type { Stop } from '../lib/api/stops';
import type { Route, RouteStop, RouteStatistics, ReportSummary, ForumPostSummary } from '../lib/api/routes';
import { StopsListPanel } from './StopsListPanel';
import { InteractiveMap } from './InteractiveMap';
import { MobileStopsDrawer } from './MobileStopsDrawer';

interface RouteDetailProps {
  data: {
    route: Route;
    statistics: RouteStatistics;
    recent_reports: ReportSummary[];
    recent_posts: ForumPostSummary[];
  };
}

// Section 1: Route Info Card
const RouteInfoCard = ({ route, forumId }: { route: Route; forumId?: number | null }) => (
  <Card className="mb-6">
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 bg-accent/10 flex items-center justify-center">
          <span className="text-accent font-display font-bold text-xl">{route.route_number}</span>
        </div>
        <div>
          <h1 className="text-2xl font-display font-bold text-text-primary">{route.name}</h1>
          {route.description && (
            <p className="text-text-secondary mt-1">{route.description}</p>
          )}
        </div>
      </div>
      <Chip variant={route.status === 'active' ? 'success' : route.status === 'inactive' ? 'error' : 'default'}>
        {route.status}
      </Chip>
    </div>

    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
      <div className="p-4 bg-bg-main">
        <p className="text-sm text-text-muted mb-1">Total Stops</p>
        <p className="text-2xl font-display font-bold text-text-primary">
          {route.stops?.length || route.route_stops?.length || 0}
        </p>
      </div>
      <div className="p-4 bg-bg-main">
        <p className="text-sm text-text-muted mb-1">Route ID</p>
        <p className="text-2xl font-display font-bold text-text-primary">#{route.id}</p>
      </div>
      {forumId !== undefined && forumId !== null && (
        <div className="p-4 bg-bg-main">
          <p className="text-sm text-text-muted mb-1">Forum</p>
          <Link
            to="/routes/$routeId/forum"
            params={{ routeId: route.id.toString() }}
            className="text-2xl font-display font-bold text-tertiary hover:text-tertiary-hover"
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

  return (
    <Card className="mb-6">
      <div className="mb-6">
        <h2 className="text-xl font-display font-bold text-text-primary mb-2">Route Statistics</h2>
        <p className="text-text-secondary">Community engagement and report metrics</p>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="p-4 bg-bg-main text-center">
          <p className="text-sm text-text-muted mb-1">Total Reports</p>
          <p className="text-3xl font-display font-bold text-text-primary">{statistics.total_reports}</p>
        </div>
        <div className="p-4 bg-bg-main text-center">
          <p className="text-sm text-text-muted mb-1">Resolution Rate</p>
          <p className="text-3xl font-display font-bold text-text-primary">{formatPercent(statistics.report_resolution_rate)}</p>
        </div>
        <div className="p-4 bg-bg-main text-center">
          <p className="text-sm text-text-muted mb-1">Activity Score</p>
          <p className="text-3xl font-display font-bold text-text-primary">
            {statistics.community_activity_score.toFixed(1)}
          </p>
        </div>
        <div className="p-4 bg-bg-main text-center">
          <p className="text-sm text-text-muted mb-1">Forum Members</p>
          <p className="text-3xl font-display font-bold text-text-primary">{statistics.forum_member_count}</p>
        </div>
      </div>

      {/* Reports by Status and Type */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Reports by Status */}
        <div className="p-4 bg-bg-main">
          <h3 className="font-semibold text-text-primary mb-3">Reports by Status</h3>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-text-secondary">Pending</span>
                <span className="font-medium text-text-primary">{statistics.reports_by_status.pending}</span>
              </div>
              <div className="h-2 bg-bg-elevated rounded-full overflow-hidden">
                <div
                  className="h-full bg-warning rounded-full transition-all"
                  style={{ width: `${(statistics.reports_by_status.pending / statistics.total_reports) * 100}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-text-secondary">Reviewed</span>
                <span className="font-medium text-text-primary">{statistics.reports_by_status.reviewed}</span>
              </div>
              <div className="h-2 bg-bg-elevated rounded-full overflow-hidden">
                <div
                  className="h-full bg-info rounded-full transition-all"
                  style={{ width: `${(statistics.reports_by_status.reviewed / statistics.total_reports) * 100}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-text-secondary">Resolved</span>
                <span className="font-medium text-text-primary">{statistics.reports_by_status.resolved}</span>
              </div>
              <div className="h-2 bg-bg-elevated rounded-full overflow-hidden">
                <div
                  className="h-full bg-success rounded-full transition-all"
                  style={{ width: `${(statistics.reports_by_status.resolved / statistics.total_reports) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Reports by Type */}
        <div className="p-4 bg-bg-main">
          <h3 className="font-semibold text-text-primary mb-3">Reports by Type</h3>
          <div className="space-y-2">
            {Object.entries(statistics.reports_by_type).map(([type, count]) => (
              <div key={type} className="flex items-center justify-between">
                <span className="text-sm text-text-secondary capitalize">{type.replace('_', ' ')}</span>
                <span className="font-medium text-text-primary">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Forum Activity */}
      <div className="mt-6 p-4 bg-bg-main">
        <h3 className="font-semibold text-text-primary mb-3">Forum Activity</h3>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-display font-bold text-text-primary">{statistics.forum_post_count}</p>
            <p className="text-sm text-text-muted">Posts</p>
          </div>
          <div>
            <p className="text-2xl font-display font-bold text-accent">+{statistics.total_post_upvotes}</p>
            <p className="text-sm text-text-muted">Upvotes</p>
          </div>
          <div>
            <p className="text-2xl font-display font-bold text-error/60">-{statistics.total_post_downvotes}</p>
            <p className="text-sm text-text-muted">Downvotes</p>
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
          <h2 className="text-xl font-display font-bold text-text-primary">Recent Reports</h2>
          <p className="text-text-secondary text-sm">Latest community reports for this route</p>
        </div>
      </div>
      <div className="space-y-3">
        {reports.map((report, index) => (
          <Link
            key={report.id}
            to="/reports/$reportId"
            params={{ reportId: report.id.toString() }}
            className="group flex items-start gap-4 p-4 border border-border hover:border-tertiary hover:bg-tertiary/5 transition-all duration-200 animate-fade-in"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className="flex-shrink-0 w-10 h-10 bg-warning/10 text-warning flex items-center justify-center font-display font-bold">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <h4 className="font-display font-semibold text-text-primary group-hover:text-tertiary-hover transition-colors truncate">
                  {report.title}
                </h4>
                <Chip variant={report.status === 'resolved' ? 'success' : report.status === 'pending' ? 'warning' : 'default'}>
                  {report.status}
                </Chip>
              </div>
              <div className="flex items-center gap-3 mt-2 text-sm text-text-muted">
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

  const postTypeIcons: Record<string, React.ReactElement> = {
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
          <h2 className="text-xl font-display font-bold text-text-primary">Recent Forum Posts</h2>
          <p className="text-text-secondary text-sm">Latest discussions in this route's forum</p>
        </div>
      </div>
      <div className="space-y-3">
        {posts.map((post, index) => (
          <Link
            key={post.id}
            to="/routes/$routeId/forum"
            params={{ routeId: post.id.toString() }}
            className="group flex items-start gap-4 p-4 border border-border hover:border-accent hover:bg-accent/5 transition-all duration-200 animate-fade-in"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className="flex-shrink-0 w-10 h-10 bg-warning/10 text-warning flex items-center justify-center">
              {postTypeIcons[post.post_type]}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <h4 className="font-display font-semibold text-text-primary group-hover:text-accent transition-colors truncate">
                  {post.title}
                </h4>
                <Chip variant="info">
                  {post.post_type}
                </Chip>
              </div>
              <div className="flex items-center gap-3 mt-2 text-sm text-text-muted">
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

export const RouteDetail = ({ data }: RouteDetailProps) => {
  const { route, statistics, recent_reports, recent_posts } = data;

  // Extract and sort stops
  const stops: Stop[] = useMemo(() => {
    if (!route.route_stops) {
      return route.stops ?? [];
    }
    return route.route_stops
      .map((rs: RouteStop) => rs.stop)
      .filter((stop: Stop | undefined): stop is Stop => stop !== undefined)
      .sort((a: Stop, b: Stop) => {
        const seqA = a.sequence ?? (route.route_stops?.find((rs: RouteStop) => rs.stop_id === a.id)?.sequence_order ?? 0);
        const seqB = b.sequence ?? (route.route_stops?.find((rs: RouteStop) => rs.stop_id === b.id)?.sequence_order ?? 0);
        return seqA - seqB;
      });
  }, [route]);

  // Search and filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'stop' | 'terminal'>('all');
  const [facilityFilter, setFacilityFilter] = useState<string | null>(null);

  // Interaction state
  const [hoveredStopId, setHoveredStopId] = useState<number | null>(null);
  const [focusedStopId, setFocusedStopId] = useState<number | null>(null);
  const [expandedStopId, setExpandedStopId] = useState<number | null>(null);

  // Mobile drawer state
  const [isDrawerExpanded, setIsDrawerExpanded] = useState(false);

  // Map container ref for scrolling when bottom sheet expands
  const mapContainerRef = useRef<HTMLDivElement>(null);

  // Scroll to map when bottom sheet expands
  useEffect(() => {
    if (isDrawerExpanded && mapContainerRef.current) {
      // Disable scroll restoration temporarily
      if ('scrollRestoration' in window.history) {
        window.history.scrollRestoration = 'manual';
      }
      mapContainerRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      // Re-enable after animation
      const timer = setTimeout(() => {
        if ('scrollRestoration' in window.history) {
          window.history.scrollRestoration = 'auto';
        }
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isDrawerExpanded]);

  // Filter stops based on search and filters
  const filteredStops = useMemo(() => {
    let result = [...stops];

    // Search filter
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(stop =>
        stop.name.toLowerCase().includes(q) ||
        stop.address?.toLowerCase().includes(q) ||
        (Array.isArray(stop.facilities) &&
          stop.facilities.some(f => f.toLowerCase().includes(q)))
      );
    }

    // Type filter
    if (typeFilter !== 'all') {
      result = result.filter(stop => stop.type === typeFilter);
    }

    // Facility filter
    if (facilityFilter) {
      result = result.filter(stop =>
        Array.isArray(stop.facilities) && stop.facilities.includes(facilityFilter)
      );
    }

    return result;
  }, [stops, searchQuery, typeFilter, facilityFilter]);

  // Get all unique facilities for filter dropdown
  const allFacilities = useMemo(() => {
    const facilities = new Set<string>();
    stops.forEach(stop => {
      if (Array.isArray(stop.facilities)) {
        stop.facilities.forEach(f => facilities.add(f));
      }
    });
    return Array.from(facilities).sort();
  }, [stops]);

  // Handle stop focus from list
  const handleStopFocus = (stopId: number | null) => {
    if (stopId === null) {
      setFocusedStopId(null);
      return;
    }
    setFocusedStopId(stopId === focusedStopId ? null : stopId);
    if (stopId !== focusedStopId) {
      setExpandedStopId(stopId);
    }
  };

  return (
    <div className="w-full animate-fade-in">
      {/* Section 1: Route Info Card */}
      <RouteInfoCard route={route} forumId={statistics.forum_id} />

      {/* Split View Container */}
      {stops.length > 0 && (
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-0 mb-6 lg:h-[calc(100vh-220px)]">
          {/* Stops List Panel - Desktop */}
          <div className="hidden lg:flex w-[380px] xl:w-[420px] flex-col bg-bg-surface rounded-l-card border border-r-0 border-border overflow-hidden">
            <StopsListPanel
              stops={filteredStops}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              typeFilter={typeFilter}
              onTypeFilterChange={setTypeFilter}
              facilityFilter={facilityFilter}
              onFacilityFilterChange={setFacilityFilter}
              allFacilities={allFacilities}
              hoveredStopId={hoveredStopId}
              onHoverStopIdChange={setHoveredStopId}
              focusedStopId={focusedStopId}
              onFocusedStopIdChange={setFocusedStopId}
              expandedStopId={expandedStopId}
              onExpandedStopIdChange={setExpandedStopId}
            />
          </div>

          {/* Desktop Map Container */}
          <div className="hidden lg:flex flex-1 min-h-0 rounded-r-card overflow-hidden border border-border">
            <InteractiveMap
              stops={filteredStops}
              hoveredStopId={hoveredStopId}
              onHoverStopIdChange={setHoveredStopId}
              focusedStopId={focusedStopId}
              onFocusedStopIdChange={setFocusedStopId}
            />
          </div>

          {/* Mobile Map Container */}
          <div ref={mapContainerRef} className="lg:hidden relative h-[calc(100vh-160px)] transition-all duration-300 ease-out">
            <div className={`h-full transition-all duration-300 ease-out ${isDrawerExpanded ? 'h-[50%]' : 'h-full'}`}>
              <div className="h-full rounded-t-card overflow-hidden border border-border">
                <InteractiveMap
                  stops={filteredStops}
                  hoveredStopId={hoveredStopId}
                  onHoverStopIdChange={setHoveredStopId}
                  focusedStopId={focusedStopId}
                  onFocusedStopIdChange={setFocusedStopId}
                />
              </div>
            </div>

            {/* Mobile Bottom Sheet Drawer - fixed at viewport bottom */}
            <MobileStopsDrawer
              isExpanded={isDrawerExpanded}
              onToggleExpand={() => setIsDrawerExpanded(!isDrawerExpanded)}
              stops={filteredStops}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              typeFilter={typeFilter}
              onTypeFilterChange={setTypeFilter}
              facilityFilter={facilityFilter}
              onFacilityFilterChange={setFacilityFilter}
              allFacilities={allFacilities}
              hoveredStopId={hoveredStopId}
              onHoverStopIdChange={setHoveredStopId}
              focusedStopId={focusedStopId}
              onFocusedStopIdChange={handleStopFocus}
              expandedStopId={expandedStopId}
              onExpandedStopIdChange={setExpandedStopId}
            />
          </div>
        </div>
      )}

      {/* Section 2: Statistics Dashboard */}
      <StatisticsSection statistics={statistics} />

      {/* Section 3: Recent Reports */}
      <RecentReportsSection reports={recent_reports} />

      {/* Section 4: Recent Forum Posts */}
      <RecentPostsSection posts={recent_posts} />

      {/* NOTE: Old RouteStopsSection removed - replaced with new interactive stops list above */}
    </div>
  );
};
