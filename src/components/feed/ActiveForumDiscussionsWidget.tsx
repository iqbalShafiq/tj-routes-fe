import { useMemo, useState, useEffect } from 'react';
import { useFavoriteRoutes, useRecentRoutes } from '../../lib/hooks/usePersonalized';
import { forumsApi } from '../../lib/api/forums';
import { forumPostsApi, type ForumPost } from '../../lib/api/forum-posts';
import { Skeleton } from '../ui/Loading';
import { Card } from '../ui/Card';
import { useNavigate } from '@tanstack/react-router';

const getPostTypeIcon = (postType: string) => {
  switch (postType) {
    case 'discussion':
      return (
        <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      );
    case 'info':
      return (
        <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    case 'question':
      return (
        <svg className="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    case 'announcement':
      return (
        <svg className="w-4 h-4 text-tertiary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
        </svg>
      );
    default:
      return (
        <svg className="w-4 h-4 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
        </svg>
      );
  }
};

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

interface PostWithRoute extends ForumPost {
  routeId: number;
  routeNumber: string;
  routeName: string;
}

export const ActiveForumDiscussionsWidget = () => {
  const navigate = useNavigate();
  const { data: favoriteRoutes, isLoading: loadingFavorites } = useFavoriteRoutes(1, 5);
  const { data: recentRoutes, isLoading: loadingRecents } = useRecentRoutes(1, 5);
  const [posts, setPosts] = useState<PostWithRoute[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(false);

  const routes = useMemo(() => {
    if (!favoriteRoutes?.data) return [];
    const favRouteIds = new Set(favoriteRoutes.data.map((f) => f.route.id));
    const recentOnly = recentRoutes?.data?.filter((r) => !favRouteIds.has(r.route.id)) || [];
    return [...favoriteRoutes.data, ...recentOnly].slice(0, 5);
  }, [favoriteRoutes, recentRoutes]);

  useEffect(() => {
    const fetchPosts = async () => {
      if (routes.length === 0) {
        setPosts([]);
        return;
      }

      setLoadingPosts(true);
      const allPosts: PostWithRoute[] = [];

      for (const favorite of routes) {
        try {
          const route = favorite.route;
          const forumResult = await forumsApi.getForumByRoute(route.id);

          if (forumResult.forum && forumResult.forum.id) {
            const postsResult = await forumPostsApi.getForumPosts(forumResult.forum.id, 1, 3);

            for (const post of postsResult.data) {
              allPosts.push({
                ...post,
                routeId: route.id,
                routeNumber: route.route_number,
                routeName: route.name,
              });
            }
          }
        } catch (error) {
          // Silently continue on error
        }
      }

      // Sort by created_at descending and take top 5
      allPosts.sort((a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      setPosts(allPosts.slice(0, 5));
      setLoadingPosts(false);
    };

    fetchPosts();
  }, [routes]);

  const handlePostClick = (routeId: number, postId: number) => {
    navigate({ to: '/routes/$routeId/forum/posts/$postId', params: { routeId: routeId.toString(), postId: postId.toString() } });
  };

  const handleRouteClick = (routeId: number) => {
    navigate({ to: '/routes/$routeId', params: { routeId: routeId.toString() } });
  };

  const isLoading = loadingFavorites || loadingRecents || loadingPosts;

  if (isLoading) {
    return (
      <Card size="sm">
        <div className="mb-4">
          <h3 className="font-display font-semibold text-text-primary">Active Discussions</h3>
        </div>
        <div className="space-y-4">
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

  if (posts.length === 0) {
    return (
      <Card size="sm">
        <div className="mb-4">
          <h3 className="font-display font-semibold text-text-primary">Active Discussions</h3>
        </div>
        <div className="text-center py-6 text-text-muted text-sm">
          <svg className="w-8 h-8 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <p>Join route forums to see discussions</p>
        </div>
      </Card>
    );
  }

  return (
    <Card size="sm">
      <div className="mb-4">
        <h3 className="font-display font-semibold text-text-primary">Active Discussions</h3>
      </div>
      <div className="space-y-3">
        {posts.map((post) => (
          <button
            key={post.id}
            onClick={() => handlePostClick(post.routeId, post.id)}
            className="w-full text-left p-3 rounded-lg hover:bg-bg-elevated transition-colors"
          >
            <div className="flex items-start gap-2">
              <div className="pt-0.5">{getPostTypeIcon(post.post_type)}</div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-text-primary line-clamp-2 text-sm">
                  {post.title}
                </p>
                <div className="flex items-center gap-2 mt-1 text-xs text-text-muted">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRouteClick(post.routeId);
                    }}
                    className="text-tertiary hover:underline font-medium"
                  >
                    {post.routeNumber}
                  </button>
                  <span>•</span>
                  <span>{timeAgo(post.created_at)}</span>
                </div>
                <div className="flex items-center gap-3 mt-2 text-xs text-text-muted">
                  <span className="flex items-center gap-1">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    {post.comment_count}
                  </span>
                  <span className="flex items-center gap-1">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                    </svg>
                    {post.upvotes}
                  </span>
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </Card>
  );
};
