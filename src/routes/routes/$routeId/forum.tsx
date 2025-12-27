import { useState, useEffect, useRef } from 'react';
import { createFileRoute, Link, useNavigate, Outlet, useLocation } from '@tanstack/react-router';
import { useRoute } from '../../../lib/hooks/useRoutes';
import { useForumByRoute, useJoinForum, useLeaveForum } from '../../../lib/hooks/useForums';
import { useForumPostsInfinite } from '../../../lib/hooks/useForumPosts';
import { useAuth } from '../../../lib/hooks/useAuth';
import { Button } from '../../../components/ui/Button';
import { Skeleton } from '../../../components/ui/Loading';
import { PageHeader } from '../../../components/layout';
import { ForumHeader } from '../../../components/ForumHeader';
import { ForumPostCard } from '../../../components/ForumPostCard';
import { CreateForumPostForm } from '../../../components/CreateForumPostForm';
import { FORUM_POST_TYPES } from '../../../lib/utils/constants';
import { usePinForumPost, useUnpinForumPost, useDeleteForumPost } from '../../../lib/hooks/useForumPosts';
import { PostTypeIcon } from '../../../components/ui/PostTypeIcon';
import type { ForumPost } from '../../../lib/api/forum-posts';

export const Route = createFileRoute('/routes/$routeId/forum')({
  component: ForumPage,
});

function ForumPage() {
  const { routeId } = Route.useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user } = useAuth();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [postTypeFilter, setPostTypeFilter] = useState<
    'discussion' | 'info' | 'question' | 'announcement' | undefined
  >(undefined);
  const [searchTerm, setSearchTerm] = useState('');

  // Check if we're on a child route (posts, members, etc.)
  const isChildRoute = location.pathname.includes('/forum/posts/') || location.pathname.includes('/forum/members');

  const { data: route, isLoading: routeLoading } = useRoute(routeId);
  const { data: forumData, isLoading: forumLoading } = useForumByRoute(routeId);
  const joinMutation = useJoinForum();
  const leaveMutation = useLeaveForum();
  const pinMutation = usePinForumPost();
  const unpinMutation = useUnpinForumPost();
  const deleteMutation = useDeleteForumPost();

  const {
    data: postsData,
    isLoading: postsLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useForumPostsInfinite(
    forumData?.forum.id || 0,
    20,
    {
      post_type: postTypeFilter,
      search: searchTerm || undefined,
    }
  );

  // Infinite scroll
  const loadMoreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!loadMoreRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handleJoin = () => {
    if (forumData?.forum.id) {
      joinMutation.mutate(forumData.forum.id);
    }
  };

  const handleLeave = () => {
    if (forumData?.forum.id) {
      leaveMutation.mutate(forumData.forum.id);
    }
  };

  const handlePin = (postId: number) => {
    if (forumData?.forum.id) {
      pinMutation.mutate({ forumId: forumData.forum.id, postId });
    }
  };

  const handleUnpin = (postId: number) => {
    if (forumData?.forum.id) {
      unpinMutation.mutate({ forumId: forumData.forum.id, postId });
    }
  };

  const handleDelete = (postId: number) => {
    if (confirm('Are you sure you want to delete this post?')) {
      if (forumData?.forum.id) {
        deleteMutation.mutate({ forumId: forumData.forum.id, postId });
      }
    }
  };

  const handleEdit = (post: ForumPost) => {
    // Navigate to edit page or show edit modal
    navigate({
      to: '/routes/$routeId/forum/posts/$postId',
      params: { routeId, postId: String(post.id) },
      search: { edit: 'true' },
    });
  };

  if (routeLoading || forumLoading) {
    return (
      <div className="animate-fade-in">
        <PageHeader title="Forum" />
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-64 card-chamfered" />
          ))}
        </div>
      </div>
    );
  }

  if (!route || !forumData) {
    return (
      <div className="text-center py-20 animate-fade-in">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 mb-4 card-chamfered">
          <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="text-red-600 font-display text-lg mb-2">Error loading forum</p>
        <Link to="/routes/$routeId" params={{ routeId }}>
          <Button variant="outline">Back to Route</Button>
        </Link>
      </div>
    );
  }

  const allPosts = postsData?.pages.flatMap((page) => page.data) || [];
  // Sort: pinned posts first, then by created_at
  const sortedPosts = [...allPosts].sort((a, b) => {
    if (a.is_pinned && !b.is_pinned) return -1;
    if (!a.is_pinned && b.is_pinned) return 1;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  const routeName = `${route.code || route.route_number} - ${route.name}`;

  // If we're on a child route, just render the outlet
  if (isChildRoute) {
    return <Outlet />;
  }

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Forum"
        subtitle={`Discussion forum for ${routeName}`}
        breadcrumbs={[
          { label: 'Routes', path: '/' },
          { label: route.code || route.route_number || String(route.id), path: `/routes/${routeId}` },
          { label: 'Forum' },
        ]}
        actions={
          <Link to="/routes/$routeId" params={{ routeId }}>
            <Button variant="outline">Back to Route</Button>
          </Link>
        }
      />

      <ForumHeader
        forum={forumData.forum}
        memberCount={forumData.member_count}
        isMember={forumData.is_member}
        onJoin={handleJoin}
        onLeave={handleLeave}
        routeName={routeName}
        isLoading={joinMutation.isPending || leaveMutation.isPending}
      />

      {/* Filters and Create Button */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex gap-2 bg-slate-100 p-1 rounded-sm">
            <button
              onClick={() => setPostTypeFilter(undefined)}
              className={`px-4 py-2 text-sm font-medium rounded transition-colors ${
                !postTypeFilter
                  ? 'bg-white text-amber-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All
            </button>
            {FORUM_POST_TYPES.map((type) => (
              <button
                key={type.value}
                onClick={() =>
                  setPostTypeFilter(
                    postTypeFilter === type.value ? undefined : (type.value as any)
                  )
                }
                className={`px-4 py-2 text-sm font-medium rounded transition-colors flex items-center gap-2 ${
                  postTypeFilter === type.value
                    ? 'bg-white text-amber-600 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <PostTypeIcon type={type.icon as any} className="w-4 h-4" />
                {type.label}
              </button>
            ))}
          </div>
          <input
            type="text"
            placeholder="Search posts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-2 border-2 border-slate-200 bg-white rounded focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
          />
        </div>
        {isAuthenticated && forumData.is_member && (
          <Button variant="primary" onClick={() => setShowCreateForm(!showCreateForm)}>
            {showCreateForm ? 'Cancel' : '+ Create Post'}
          </Button>
        )}
      </div>

      {/* Create Post Form */}
      {showCreateForm && forumData.is_member && (
        <div className="mb-6">
          <CreateForumPostForm
            forumId={forumData.forum.id}
            onSuccess={() => {
              setShowCreateForm(false);
            }}
            onCancel={() => setShowCreateForm(false)}
          />
        </div>
      )}

      {/* Posts List */}
      {postsLoading && !postsData ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-64 card-chamfered" />
          ))}
        </div>
      ) : sortedPosts.length > 0 ? (
        <>
          <div className="space-y-6 mb-8">
            {sortedPosts.map((post, index) => (
              <div key={post.id} style={{ animationDelay: `${index * 50}ms` }} className="animate-stagger-1">
                <ForumPostCard
                  post={post}
                  forumId={forumData.forum.id}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onPin={handlePin}
                  onUnpin={handleUnpin}
                />
              </div>
            ))}
          </div>

          {/* Infinite scroll trigger */}
          <div ref={loadMoreRef} className="h-10 flex items-center justify-center">
            {isFetchingNextPage && (
              <div className="flex items-center gap-2 text-slate-500">
                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                <span>Loading more...</span>
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="text-center py-20">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-100 mb-4 card-chamfered">
            <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
              />
            </svg>
          </div>
          <p className="text-slate-600 font-display text-lg">No posts yet</p>
          <p className="text-slate-500 text-sm mt-2 mb-6">
            {forumData.is_member
              ? "Be the first to start a discussion!"
              : 'Join the forum to create posts'}
          </p>
          {isAuthenticated && !forumData.is_member && (
            <Button variant="primary" onClick={handleJoin}>
              Join Forum
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

