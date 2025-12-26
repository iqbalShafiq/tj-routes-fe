import { Link } from '@tanstack/react-router';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import type { ForumMember } from '../lib/api/forums';

interface ForumMembersListProps {
  members: ForumMember[];
  total: number;
  page: number;
  limit: number;
  onPageChange?: (page: number) => void;
}

export const ForumMembersList = ({
  members,
  total,
  page,
  limit,
  onPageChange,
}: ForumMembersListProps) => {
  const totalPages = Math.ceil(total / limit);

  return (
    <div>
      <div className="mb-4">
        <h2 className="text-2xl font-display font-bold text-slate-900 mb-2">Forum Members</h2>
        <p className="text-slate-600">{total} member{total !== 1 ? 's' : ''} total</p>
      </div>

      {members.length === 0 ? (
        <Card static>
          <div className="text-center py-12">
            <p className="text-slate-600">No members yet</p>
          </div>
        </Card>
      ) : (
        <>
          <div className="space-y-3 mb-6">
            {members.map((member) => (
              <Card key={member.id} size="sm" className="hover:shadow-md transition-shadow">
                <div className="flex items-center gap-4">
                  <Link
                    to="/profile/$userId"
                    params={{ userId: String(member.user_id) }}
                    className="w-12 h-12 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center text-white font-bold text-lg hover:scale-105 transition-transform flex-shrink-0"
                  >
                    {member.user.username?.charAt(0).toUpperCase() || 'U'}
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link
                      to="/profile/$userId"
                      params={{ userId: String(member.user_id) }}
                      className="font-semibold text-slate-900 hover:text-amber-600 transition-colors block"
                    >
                      {member.user.username}
                    </Link>
                    {member.user.level && (
                      <p className="text-sm text-slate-500 capitalize">{member.user.level}</p>
                    )}
                  </div>
                  {member.user.reputation_points !== undefined && (
                    <div className="text-right">
                      <p className="text-sm font-medium text-slate-900">
                        {member.user.reputation_points}
                      </p>
                      <p className="text-xs text-slate-500">points</p>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange?.(page - 1)}
                disabled={page === 1}
              >
                Previous
              </Button>
              <span className="text-sm text-slate-600">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange?.(page + 1)}
                disabled={page >= totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

