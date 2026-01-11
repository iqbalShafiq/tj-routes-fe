import { useRoute } from '../../lib/hooks/useRoutes';
import { useForumByRoute, useJoinForum, useLeaveForum } from '../../lib/hooks/useForums';
import { useAuth } from '../../lib/hooks/useAuth';
import { Skeleton } from '../ui/Loading';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

interface ForumInfoWidgetProps {
  routeId: string;
}

export const ForumInfoWidget = ({ routeId }: ForumInfoWidgetProps) => {
  const { isAuthenticated } = useAuth();
  const { data: route, isLoading: routeLoading } = useRoute(routeId);
  const { data: forumData, isLoading: forumLoading } = useForumByRoute(routeId);
  const joinMutation = useJoinForum();
  const leaveMutation = useLeaveForum();

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

  if (routeLoading || forumLoading) {
    return (
      <Card size="sm">
        <div className="mb-4">
          <h3 className="font-display font-semibold text-text-primary">Forum Info</h3>
        </div>
        <div className="space-y-3">
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-10 w-full" />
        </div>
      </Card>
    );
  }

  if (!forumData || !route) {
    return (
      <Card size="sm">
        <div className="mb-4">
          <h3 className="font-display font-semibold text-text-primary">Forum Info</h3>
        </div>
        <div className="text-center py-4 text-text-muted text-sm">
          Forum not available
        </div>
      </Card>
    );
  }

  const routeName = `${route.route_number} - ${route.name}`;

  return (
    <Card size="sm">
      <div className="mb-4">
        <h3 className="font-display font-semibold text-text-primary">Forum Info</h3>
      </div>

      <div className="space-y-3">
        <div>
          <p className="text-xs text-text-muted uppercase tracking-wider">Route</p>
          <p className="font-medium text-text-primary">{routeName}</p>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-text-muted">Members</span>
          <span className="font-medium text-text-primary">{forumData.member_count}</span>
        </div>

        {isAuthenticated && (
          <div className="pt-2">
            {forumData.is_member ? (
              <Button
                variant="outline"
                size="sm"
                onClick={handleLeave}
                disabled={leaveMutation.isPending}
                className="w-full"
              >
                {leaveMutation.isPending ? 'Leaving...' : 'Leave Forum'}
              </Button>
            ) : (
              <Button
                variant="primary"
                size="sm"
                onClick={handleJoin}
                disabled={joinMutation.isPending}
                className="w-full"
              >
                {joinMutation.isPending ? 'Joining...' : 'Join Forum'}
              </Button>
            )}
          </div>
        )}
      </div>
    </Card>
  );
};
