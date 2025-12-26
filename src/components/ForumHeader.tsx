import { Link } from '@tanstack/react-router';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import type { Forum } from '../lib/api/forums';

interface ForumHeaderProps {
  forum: Forum;
  memberCount: number;
  isMember: boolean;
  onJoin: () => void;
  onLeave: () => void;
  routeName: string;
  isLoading?: boolean;
}

export const ForumHeader = ({
  forum,
  memberCount,
  isMember,
  onJoin,
  onLeave,
  routeName,
  isLoading = false,
}: ForumHeaderProps) => {
  return (
    <Card static className="mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-display font-bold text-slate-900">Forum: {routeName}</h1>
            <span className="px-3 py-1 text-sm font-medium bg-amber-100 text-amber-700 card-chamfered-sm flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"
                />
              </svg>
              Forum
            </span>
          </div>
          <p className="text-slate-600">
            Join the discussion about this route. Share updates, ask questions, and help fellow commuters.
          </p>
          <div className="flex items-center gap-4 mt-3">
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              <span className="font-medium">{memberCount}</span>
              <span>members</span>
            </div>
            {isMember && (
              <Link
                to="/routes/$routeId/forum/members"
                params={{ routeId: String(forum.route_id) }}
                className="text-sm text-amber-600 hover:text-amber-700 font-medium"
              >
                View all members →
              </Link>
            )}
          </div>
        </div>
        <div className="flex-shrink-0">
          {isMember ? (
            <Button variant="outline" onClick={onLeave} disabled={isLoading}>
              {isLoading ? 'Leaving...' : 'Leave Forum'}
            </Button>
          ) : (
            <Button variant="accent" onClick={onJoin} disabled={isLoading}>
              {isLoading ? 'Joining...' : 'Join Forum'}
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};

