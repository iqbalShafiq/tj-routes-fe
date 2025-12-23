import { createFileRoute, Link, redirect } from '@tanstack/react-router';
import { useLeaderboard } from '../../lib/hooks/useLeaderboard';
import { useAuth } from '../../lib/hooks/useAuth';
import { authApi } from '../../lib/api/auth';
import { Card } from '../../components/ui/Card';
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

function getLevelColor(level: string) {
  switch (level) {
    case 'newcomer': return 'from-slate-400 to-slate-500';
    case 'contributor': return 'from-emerald-400 to-emerald-600';
    case 'trusted': return 'from-blue-400 to-blue-600';
    case 'expert': return 'from-purple-400 to-purple-600';
    case 'legend': return 'from-amber-400 to-amber-600';
    default: return 'from-slate-400 to-slate-500';
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
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return null;
  };

  return (
    <div 
      className={`
        flex items-center gap-4 p-4 rounded-xl transition-all duration-200
        ${isCurrentUser ? 'bg-amber-50 border-2 border-amber-200' : 'bg-white hover:bg-slate-50'}
        ${rank <= 3 ? 'shadow-md' : ''}
      `}
    >
      {/* Rank */}
      <div className={`
        w-12 h-12 flex items-center justify-center rounded-xl font-display font-bold text-lg
        ${rank === 1 ? 'bg-gradient-to-br from-amber-300 to-amber-500 text-white' :
          rank === 2 ? 'bg-gradient-to-br from-slate-300 to-slate-400 text-white' :
          rank === 3 ? 'bg-gradient-to-br from-orange-300 to-orange-500 text-white' :
          'bg-slate-100 text-slate-600'}
      `}>
        {getMedalIcon() || `#${rank}`}
      </div>

      {/* User info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <Link 
            to="/profile/$userId" 
            params={{ userId: String(entry.id) }}
            className="font-display font-semibold text-slate-900 hover:text-amber-600 truncate"
          >
            {entry.username}
          </Link>
          {isCurrentUser && (
            <span className="px-2 py-0.5 text-xs bg-amber-200 text-amber-800 rounded-full">You</span>
          )}
        </div>
        <span className={`
          inline-flex items-center px-2 py-0.5 mt-1 text-xs font-medium rounded-full
          bg-gradient-to-r ${getLevelColor(entry.level)} text-white
        `}>
          {getLevelBadge(entry.level)}
        </span>
      </div>

      {/* Points */}
      <div className="text-right">
        <p className="text-2xl font-display font-bold text-slate-900">{entry.reputation_points.toLocaleString()}</p>
        <p className="text-xs text-slate-500">points</p>
      </div>
    </div>
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
        <div className="max-w-2xl mx-auto space-y-3">
          {[...Array(10)].map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20 animate-fade-in">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 mb-4 card-chamfered">
          <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="text-red-600 font-display text-lg mb-2">Error loading leaderboard</p>
        <p className="text-slate-600 text-sm">Please try again later.</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Leaderboard"
        subtitle="Top contributors in the TransJakarta community. Earn points by submitting helpful reports and receiving upvotes."
      />

      <div className="max-w-2xl mx-auto">
        {/* Level guide */}
        <Card static className="mb-8">
          <h3 className="font-display font-semibold text-slate-900 mb-4">Level Progression</h3>
          <div className="flex flex-wrap gap-3">
            {USER_LEVELS.map((level) => (
              <div key={level.value} className="flex items-center gap-2">
                <span className={`
                  px-3 py-1 text-xs font-medium rounded-full
                  bg-gradient-to-r ${getLevelColor(level.value)} text-white
                `}>
                  {level.label}
                </span>
                <span className="text-xs text-slate-500">
                  {level.minPoints}+ pts
                </span>
              </div>
            ))}
          </div>
        </Card>

        {/* Top 3 Podium */}
        {leaderboard && leaderboard.length >= 3 && (
          <div className="grid grid-cols-3 gap-4 mb-8">
            {/* 2nd Place */}
            <div className="flex flex-col items-center pt-8">
              <div className="w-20 h-20 bg-gradient-to-br from-slate-300 to-slate-400 rounded-full flex items-center justify-center text-white font-bold text-2xl mb-2 shadow-lg">
                {leaderboard[1].username.charAt(0).toUpperCase()}
              </div>
              <span className="text-3xl mb-1">🥈</span>
              <Link 
                to="/profile/$userId" 
                params={{ userId: String(leaderboard[1].id) }}
                className="font-display font-semibold text-slate-900 hover:text-amber-600 text-center truncate w-full"
              >
                {leaderboard[1].username}
              </Link>
              <p className="text-lg font-bold text-slate-600">{leaderboard[1].reputation_points.toLocaleString()}</p>
            </div>

            {/* 1st Place */}
            <div className="flex flex-col items-center">
              <div className="w-24 h-24 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center text-white font-bold text-3xl mb-2 shadow-xl ring-4 ring-amber-200">
                {leaderboard[0].username.charAt(0).toUpperCase()}
              </div>
              <span className="text-4xl mb-1">🥇</span>
              <Link 
                to="/profile/$userId" 
                params={{ userId: String(leaderboard[0].id) }}
                className="font-display font-bold text-xl text-slate-900 hover:text-amber-600 text-center truncate w-full"
              >
                {leaderboard[0].username}
              </Link>
              <p className="text-xl font-bold text-amber-600">{leaderboard[0].reputation_points.toLocaleString()}</p>
            </div>

            {/* 3rd Place */}
            <div className="flex flex-col items-center pt-8">
              <div className="w-20 h-20 bg-gradient-to-br from-orange-300 to-orange-500 rounded-full flex items-center justify-center text-white font-bold text-2xl mb-2 shadow-lg">
                {leaderboard[2].username.charAt(0).toUpperCase()}
              </div>
              <span className="text-3xl mb-1">🥉</span>
              <Link 
                to="/profile/$userId" 
                params={{ userId: String(leaderboard[2].id) }}
                className="font-display font-semibold text-slate-900 hover:text-amber-600 text-center truncate w-full"
              >
                {leaderboard[2].username}
              </Link>
              <p className="text-lg font-bold text-slate-600">{leaderboard[2].reputation_points.toLocaleString()}</p>
            </div>
          </div>
        )}

        {/* Full list */}
        <div className="space-y-2">
          {leaderboard && leaderboard.slice(3).map((entry, index) => (
            <LeaderboardRow key={entry.id} entry={entry} rank={index + 4} />
          ))}
        </div>

        {leaderboard && leaderboard.length === 0 && (
          <Card static>
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-100 mb-4 rounded-full">
                <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <p className="text-slate-600 font-display text-lg">No rankings yet</p>
              <p className="text-slate-500 text-sm mt-2">Be the first to earn points!</p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

