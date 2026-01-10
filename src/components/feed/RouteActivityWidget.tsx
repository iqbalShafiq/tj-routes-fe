import { useMemo, useState, useEffect } from 'react';
import { useFavoriteRoutes, useRecentRoutes } from '../../lib/hooks/usePersonalized';
import { forumsApi } from '../../lib/api/forums';
import { forumPostsApi } from '../../lib/api/forum-posts';
import { reportsApi } from '../../lib/api/reports';
import { Skeleton } from '../ui/Loading';
import { Card } from '../ui/Card';
import { useNavigate } from '@tanstack/react-router';

interface ActivityItem {
  id: number;
  type: 'forum_post' | 'report';
  routeId: number;
  routeNumber: string;
  routeName: string;
  title: string;
  createdAt: string;
}

const timeAgo = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return date.toLocaleDateString();
};

const getActivityIcon = (type: 'forum_post' | 'report') => {
  if (type === 'forum_post') {
    return (
      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
        </svg>
      </div>
    );
  }
  return (
    <div className="w-8 h-8 rounded-full bg-tertiary/10 flex items-center justify-center flex-shrink-0">
      <svg className="w-4 h-4 text-tertiary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    </div>
  );
};

export const RouteActivityWidget = () => {
  const navigate = useNavigate();
  const { data: favoriteRoutes, isLoading: loadingFavorites } = useFavoriteRoutes(1, 3);
  const { data: recentRoutes, isLoading: loadingRecents } = useRecentRoutes(1, 3);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loadingActivities, setLoadingActivities] = useState(false);

  const routes = useMemo(() => {
    if (!favoriteRoutes?.data) return [];
    const favRouteIds = new Set(favoriteRoutes.data.map((f) => f.route.id));
    const recentOnly = recentRoutes?.data?.filter((r) => !favRouteIds.has(r.route.id)) || [];
    const merged = [...favoriteRoutes.data, ...recentOnly];
    // Deduplicate by route ID
    const unique = merged.filter((item, index, self) =>
      index === self.findIndex((t) => t.route.id === item.route.id)
    );
    return unique.slice(0, 5);
  }, [favoriteRoutes, recentRoutes]);

  useEffect(() => {
    const fetchActivities = async () => {
      if (routes.length === 0) {
        setActivities([]);
        return;
      }

      setLoadingActivities(true);
      const allActivities: ActivityItem[] = [];

      for (const favorite of routes) {
        const route = favorite.route;

        try {
          // Get forum posts
          const forumResult = await forumsApi.getForumByRoute(route.id);
          if (forumResult.forum?.id) {
            const postsResult = await forumPostsApi.getForumPosts(forumResult.forum.id, 1, 2);
            for (const post of postsResult.data) {
              allActivities.push({
                id: post.id,
                type: 'forum_post',
                routeId: route.id,
                routeNumber: route.route_number,
                routeName: route.name,
                title: post.title,
                createdAt: post.created_at,
              });
            }
          }
        } catch {
          // Continue on error
        }

        try {
          // Get recent reports
          const reportsResult = await reportsApi.getRecentByRoute(route.id, 1, 2);
          for (const report of reportsResult.data) {
            allActivities.push({
              id: report.id,
              type: 'report',
              routeId: route.id,
              routeNumber: route.route_number,
              routeName: route.name,
              title: report.title,
              createdAt: report.created_at,
            });
          }
        } catch {
          // Continue on error
        }
      }

      // Sort by created_at descending and take top 5
      allActivities.sort((a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      setActivities(allActivities.slice(0, 5));
      setLoadingActivities(false);
    };

    fetchActivities();
  }, [routes]);

  const handleActivityClick = (activity: ActivityItem) => {
    // Navigate to the route forum page
    navigate({ to: '/routes/$routeId/forum', params: { routeId: activity.routeId.toString() } });
  };

  const handleRouteClick = (routeId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    navigate({ to: '/routes/$routeId', params: { routeId: routeId.toString() } });
  };

  const isLoading = loadingFavorites || loadingRecents || loadingActivities;

  if (isLoading) {
    return (
      <Card size="sm">
        <div className="mb-4">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <h3 className="font-display font-semibold text-text-primary">Your Routes Activity</h3>
          </div>
        </div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-start gap-3">
              <Skeleton className="h-8 w-8 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
          ))}
        </div>
      </Card>
    );
  }

  if (activities.length === 0) {
    return (
      <Card size="sm">
        <div className="mb-4">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <h3 className="font-display font-semibold text-text-primary">Your Routes Activity</h3>
          </div>
        </div>
        <div className="text-center py-6 text-text-muted text-sm">
          <svg className="w-8 h-8 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
          </svg>
          <p>Favorite routes to see activity here</p>
        </div>
      </Card>
    );
  }

  return (
    <Card size="sm">
      <div className="mb-4">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <h3 className="font-display font-semibold text-text-primary">Your Routes Activity</h3>
        </div>
      </div>
      <div className="space-y-4">
        {activities.map((activity) => (
          <button
            key={`${activity.type}-${activity.id}`}
            onClick={() => handleActivityClick(activity)}
            className="w-full flex items-start gap-3 p-2 rounded-lg hover:bg-bg-elevated transition-colors text-left"
          >
            {getActivityIcon(activity.type)}
            <div className="flex-1 min-w-0">
              <p className="font-medium text-text-primary text-sm line-clamp-2">
                {activity.title}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <button
                  onClick={(e) => handleRouteClick(activity.routeId, e)}
                  className="text-xs px-2 py-0.5 bg-bg-elevated rounded text-tertiary hover:underline font-medium"
                >
                  {activity.routeNumber}
                </button>
                <span className="text-xs text-text-muted">
                  {timeAgo(activity.createdAt)}
                </span>
              </div>
            </div>
          </button>
        ))}
      </div>
    </Card>
  );
};
