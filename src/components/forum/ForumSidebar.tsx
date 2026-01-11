import { AuthorProfileWidget } from './AuthorProfileWidget';
import { ForumMembersWidget } from './ForumMembersWidget';
import { PopularPostsWidget } from './PopularPostsWidget';
import { useForumByRoute } from '../../lib/hooks/useForums';

interface ForumSidebarProps {
  routeId: string;
  showAuthorProfile?: boolean;
  authorUserId?: number;
  excludePostId?: number;
}

export const ForumSidebar = ({
  routeId,
  showAuthorProfile = false,
  authorUserId,
  excludePostId,
}: ForumSidebarProps) => {
  const { data: forumData } = useForumByRoute(routeId);
  const forumId = forumData?.forum.id || 0;

  return (
    <aside className="hidden lg:block w-[360px] sticky top-8 self-start max-h-[calc(100vh-4rem)] overflow-y-auto">
      <div className="space-y-6">
        {showAuthorProfile && authorUserId && (
          <AuthorProfileWidget userId={authorUserId} />
        )}

        {forumId > 0 && (
          <>
            <PopularPostsWidget routeId={routeId} forumId={forumId} limit={5} excludePostId={excludePostId} />
            <ForumMembersWidget forumId={forumId} limit={5} />
          </>
        )}
      </div>
    </aside>
  );
};
