import { useNavigate } from '@tanstack/react-router';
import { useForumPosts } from '../../lib/hooks/useForumPosts';
import { Skeleton } from '../ui/Loading';
import { Card } from '../ui/Card';
import { PostTypeIcon } from '../ui/PostTypeIcon';

interface PopularPostsWidgetProps {
  routeId: string;
  forumId: number;
  limit?: number;
  excludePostId?: number;
}

export const PopularPostsWidget = ({ routeId, forumId, limit = 5, excludePostId }: PopularPostsWidgetProps) => {
  const navigate = useNavigate();
  const { data: postsData, isLoading, error } = useForumPosts(forumId, 1, 20);

  const handlePostClick = (postId: number) => {
    navigate({
      to: '/routes/$routeId/forum/posts/$postId',
      params: { routeId, postId: postId.toString() },
      search: undefined,
    });
  };

  // Sort by upvotes (most upvoted first) and filter out current post
  const popularPosts = postsData?.data
    ?.filter((post) => post.id !== excludePostId)
    ?.sort((a, b) => (b.upvotes - b.downvotes) - (a.upvotes - a.downvotes))
    ?.slice(0, limit) || [];

  if (isLoading) {
    return (
      <Card size="sm">
        <div className="mb-4">
          <h3 className="font-display font-semibold text-text-primary">Popular Posts</h3>
        </div>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
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
          <h3 className="font-display font-semibold text-text-primary">Popular Posts</h3>
        </div>
        <div className="text-center py-6 text-error text-sm">
          <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p>Failed to load posts</p>
        </div>
      </Card>
    );
  }

  if (popularPosts.length === 0) {
    return (
      <Card size="sm">
        <div className="mb-4">
          <h3 className="font-display font-semibold text-text-primary">Popular Posts</h3>
        </div>
        <div className="text-center py-6 text-text-muted text-sm">
          <svg className="w-8 h-8 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
          </svg>
          <p>No posts yet</p>
        </div>
      </Card>
    );
  }

  const timeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <Card size="sm">
      <div className="mb-4">
        <h3 className="font-display font-semibold text-text-primary">Popular Posts</h3>
      </div>
      <div className="space-y-3">
        {popularPosts.map((post) => (
          <button
            key={post.id}
            onClick={() => handlePostClick(post.id)}
            className="w-full text-left p-2 rounded-lg hover:bg-bg-elevated transition-colors group"
          >
            <div className="flex items-start gap-2">
              <PostTypeIcon type={post.post_type} className="w-4 h-4 flex-shrink-0 mt-0.5 text-tertiary" />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-text-primary text-sm line-clamp-2 group-hover:text-tertiary transition-colors">
                  {post.title}
                </p>
                <div className="flex items-center gap-2 mt-1 text-xs text-text-muted">
                  <span>{timeAgo(post.created_at)}</span>
                  <span className="flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                    </svg>
                    {post.upvotes - post.downvotes}
                  </span>
                  <span className="flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    {post.comment_count}
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
