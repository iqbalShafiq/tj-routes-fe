import { createFileRoute, Link, redirect } from '@tanstack/react-router';
import { useUserProfile, useBadges } from '../../lib/hooks/useLeaderboard';
import { useAuth } from '../../lib/hooks/useAuth';
import { authApi } from '../../lib/api/auth';
import { Card } from '../../components/ui/Card';
import { Loading } from '../../components/ui/Loading';
import { PageHeader } from '../../components/layout';
import { format } from 'date-fns';
import { USER_LEVELS } from '../../lib/utils/constants';

export const Route = createFileRoute('/profile/$userId')({
  beforeLoad: async () => {
    if (!authApi.isAuthenticated()) {
      throw redirect({ to: '/auth/login' });
    }
  },
  component: UserProfilePage,
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

function UserProfilePage() {
  const { userId } = Route.useParams();
  const { user: currentUser } = useAuth();
  const { data: profile, isLoading: profileLoading, error: profileError } = useUserProfile(userId);
  const { data: allBadges } = useBadges();

  const isOwnProfile = currentUser?.id === Number(userId);

  if (profileLoading) {
    return <Loading />;
  }

  if (profileError || !profile) {
    return (
      <div className="text-center py-20 animate-fade-in">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 mb-4 card-chamfered">
          <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="text-red-600 font-display text-lg mb-2">User not found</p>
        <Link to="/leaderboard">
          <span className="text-amber-600 hover:underline">Back to Leaderboard</span>
        </Link>
      </div>
    );
  }

  const currentLevel = USER_LEVELS.find(l => l.value === profile.level);
  const nextLevel = USER_LEVELS.find(l => l.minPoints > profile.reputation_points);
  const progressToNext = nextLevel 
    ? Math.min(100, ((profile.reputation_points - (currentLevel?.minPoints || 0)) / (nextLevel.minPoints - (currentLevel?.minPoints || 0))) * 100)
    : 100;

  return (
    <div className="animate-fade-in">
      <PageHeader
        title=""
        breadcrumbs={[
          { label: 'Leaderboard', path: '/leaderboard' },
          { label: profile.user.username },
        ]}
      />

      <div className="max-w-3xl mx-auto">
        {/* Profile Header */}
        <Card className="mb-6">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            {/* Avatar */}
            <div className={`
              w-28 h-28 rounded-full flex items-center justify-center text-white font-bold text-4xl
              bg-gradient-to-br ${getLevelColor(profile.level)} shadow-xl
            `}>
              {profile.user.username.charAt(0).toUpperCase()}
            </div>

            {/* Info */}
            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-col md:flex-row items-center gap-3 mb-2">
                <h1 className="text-3xl font-display font-bold text-slate-900">
                  {profile.user.username}
                </h1>
                {isOwnProfile && (
                  <span className="px-3 py-1 text-sm bg-amber-100 text-amber-700 rounded-full">
                    Your Profile
                  </span>
                )}
              </div>
              
              <div className="flex flex-wrap justify-center md:justify-start gap-3 mb-4">
                <span className={`
                  inline-flex items-center px-4 py-1.5 text-sm font-semibold rounded-full
                  bg-gradient-to-r ${getLevelColor(profile.level)} text-white shadow
                `}>
                  {currentLevel?.label || profile.level}
                </span>
                <span className="inline-flex items-center px-4 py-1.5 text-sm font-medium bg-slate-100 text-slate-700 rounded-full">
                  {profile.reputation_points.toLocaleString()} points
                </span>
              </div>

              {/* Progress to next level */}
              {nextLevel && (
                <div className="max-w-sm mx-auto md:mx-0">
                  <div className="flex justify-between text-xs text-slate-500 mb-1">
                    <span>{currentLevel?.label}</span>
                    <span>{nextLevel.label}</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full bg-gradient-to-r ${getLevelColor(profile.level)} transition-all duration-500`}
                      style={{ width: `${progressToNext}%` }}
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    {nextLevel.minPoints - profile.reputation_points} points to {nextLevel.label}
                  </p>
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card static className="text-center">
            <p className="text-3xl font-display font-bold text-amber-600">
              {profile.reputation_points.toLocaleString()}
            </p>
            <p className="text-sm text-slate-500">Total Points</p>
          </Card>
          <Card static className="text-center">
            <p className="text-3xl font-display font-bold text-slate-900">
              {profile.badges.length}
            </p>
            <p className="text-sm text-slate-500">Badges Earned</p>
          </Card>
          <Card static className="text-center">
            <p className="text-3xl font-display font-bold text-emerald-600">
              {currentLevel?.label || profile.level}
            </p>
            <p className="text-sm text-slate-500">Current Level</p>
          </Card>
          <Card static className="text-center">
            <p className="text-3xl font-display font-bold text-blue-600">
              {nextLevel ? `${nextLevel.minPoints - profile.reputation_points}` : '—'}
            </p>
            <p className="text-sm text-slate-500">Points to Next</p>
          </Card>
        </div>

        {/* Badges */}
        <Card static className="mb-6">
          <h2 className="text-xl font-display font-semibold text-slate-900 mb-4">Badges</h2>
          
          {profile.badges.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {profile.badges.map((userBadge) => (
                <div 
                  key={userBadge.id}
                  className="flex flex-col items-center p-4 bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl border border-amber-200"
                >
                  <span className="text-4xl mb-2">{userBadge.badge.icon}</span>
                  <p className="font-display font-semibold text-slate-900 text-center text-sm">
                    {userBadge.badge.name}
                  </p>
                  <p className="text-xs text-slate-500 text-center mt-1">
                    {userBadge.badge.description}
                  </p>
                  <p className="text-xs text-amber-600 mt-2">
                    {format(new Date(userBadge.earned_at), 'MMM d, yyyy')}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-500">
              <p className="text-lg mb-2">No badges yet</p>
              <p className="text-sm">
                {isOwnProfile 
                  ? "Start contributing to earn badges!" 
                  : "This user hasn't earned any badges yet."}
              </p>
            </div>
          )}
        </Card>

        {/* Available Badges */}
        {allBadges && (
          <Card static>
            <h2 className="text-xl font-display font-semibold text-slate-900 mb-4">All Available Badges</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {allBadges.map((badge) => {
                const isEarned = profile.badges.some(b => b.badge_id === badge.id);
                return (
                  <div 
                    key={badge.id}
                    className={`
                      flex flex-col items-center p-4 rounded-xl border transition-all
                      ${isEarned 
                        ? 'bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200' 
                        : 'bg-slate-50 border-slate-200 opacity-60'}
                    `}
                  >
                    <span className={`text-4xl mb-2 ${!isEarned && 'grayscale'}`}>{badge.icon}</span>
                    <p className="font-display font-semibold text-slate-900 text-center text-sm">
                      {badge.name}
                    </p>
                    <p className="text-xs text-slate-500 text-center mt-1">
                      {badge.description}
                    </p>
                    {isEarned && (
                      <span className="mt-2 px-2 py-0.5 text-xs bg-emerald-200 text-emerald-700 rounded-full">
                        ✓ Earned
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

