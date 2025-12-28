import { createFileRoute, Link, redirect } from '@tanstack/react-router';
import { useLeaderboard } from '../../lib/hooks/useLeaderboard';
import { useAuth } from '../../lib/hooks/useAuth';
import { authApi } from '../../lib/api/auth';
import { Card } from '../../components/ui/Card';
import { Chip } from '../../components/ui/Chip';
import { Skeleton } from '../../components/ui/Loading';
import { PageHeader } from '../../components/layout';
import type { LeaderboardEntry } from '../../lib/api/leaderboard';
import { USER_LEVELS } from '../../lib/utils/constants';

export const Route = createFileRoute('/leaderboard/')({
  beforeLoad: async () => {
    if (!authApi.isAuthenticated()) {
      throw redirect({ to: '/auth/login' });
    }
  },
  component: LeaderboardPage,
});

function getLevelVariant(level: string): 'default' | 'success' | 'info' | 'purple' | 'warning' {
  switch (level) {
    case 'newcomer': return 'default';
    case 'contributor': return 'success';
    case 'trusted': return 'info';
    case 'expert': return 'purple';
    case 'legend': return 'warning';
    default: return 'default';
  }
}

function getLevelBadge(level: string) {
  const levelInfo = USER_LEVELS.find(l => l.value === level);
  return levelInfo?.label || level;
}

function LeaderboardRow({ entry, rank }: { entry: LeaderboardEntry; rank: number }) {
  const { user } = useAuth();
  const isCurrentUser = user?.id === entry.id;

  const getMedalIcon = () => {
    if (rank === 1) return '#1';
    if (rank === 2) return '#2';
    if (rank === 3) return '#3';
    return null;
  };

  const getCardBackgroundColor = () => {
    if (rank === 1) return 'bg-accent-light';
    if (rank === 2) return 'bg-bg-surface';
    if (rank === 3) return 'bg-bg-elevated';
    return 'bg-bg-surface';
  };

  return (
    <Card 
      className={`
        ${getCardBackgroundColor()}
        ${isCurrentUser ? 'border-2 border-accent/30' : ''}
      `}
      size="md"
    >
      <div className="flex items-center gap-4">
        {/* Rank */}
        <div className={`
          w-12 h-12 flex items-center justify-center rounded-sm font-display font-bold text-lg
          ${rank === 1 ? 'bg-gradient-to-br from-accent/60 to-accent text-white' :
            rank === 2 ? 'bg-gradient-to-br from-text-muted/40 to-text-muted/60 text-white' :
            rank === 3 ? 'bg-gradient-to-br from-accent/40 to-accent/60 text-white' :
            'bg-bg-elevated text-text-secondary'}
        `}>
          {getMedalIcon() || `#${rank}`}
        </div>

        {/* User info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <Link 
              to="/profile/$userId" 
              params={{ userId: String(entry.id) }}
              className="font-display font-semibold text-text-primary hover:text-accent truncate"
            >
              {entry.username}
            </Link>
            {isCurrentUser && (
              <Chip variant="warning">You</Chip>
            )}
          </div>
          <Chip variant={getLevelVariant(entry.level)}>
            {getLevelBadge(entry.level)}
          </Chip>
        </div>

        {/* Points */}
        <div className="text-right">
          <p className="text-2xl font-display font-bold text-text-primary">{entry.reputation_points.toLocaleString()}</p>
          <p className="text-xs text-text-muted">points</p>
        </div>
      </div>
    </Card>
  );
}

function LeaderboardPage() {
  const { user } = useAuth();
  const { data: leaderboard, isLoading, error } = useLeaderboard(50);

  if (isLoading) {
    return (
      <div className="animate-fade-in">
        <PageHeader
          title="Leaderboard"
          subtitle="Top contributors in the TransJakarta community"
        />
        <div className="space-y-3">
          {[...Array(10)].map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-sm" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20 animate-fade-in">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-error/10 mb-4 card-chamfered">
          <svg className="w-8 h-8 text-error" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="text-error font-display text-lg mb-2">Error loading leaderboard</p>
        <p className="text-text-secondary text-sm">Please try again later.</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Leaderboard"
        subtitle="Top contributors in the TransJakarta community. Earn points by submitting helpful reports and receiving upvotes."
      />

      {/* Level guide */}
      <Card static className="mb-8">
        <h3 className="font-display font-semibold text-text-primary mb-4">Level Progression</h3>
        <div className="flex flex-wrap gap-3">
          {USER_LEVELS.map((level) => (
            <div key={level.value} className="flex items-center gap-2">
              <Chip variant={getLevelVariant(level.value)}>
                {level.label}
              </Chip>
              <span className="text-xs text-text-muted">
                {level.minPoints}+ pts
              </span>
            </div>
          ))}
        </div>
      </Card>

      {/* Full list */}
      <div className="space-y-2">
        {leaderboard && leaderboard.map((entry, index) => (
          <LeaderboardRow key={entry.id} entry={entry} rank={index + 1} />
        ))}
      </div>

      {leaderboard && leaderboard.length === 0 && (
        <Card static>
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-bg-elevated mb-4 rounded-sm">
              <svg className="w-8 h-8 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <p className="text-text-secondary font-display text-lg">No rankings yet</p>
            <p className="text-text-muted text-sm mt-2">Be the first to earn points!</p>
          </div>
        </Card>
      )}
    </div>
  );
}

