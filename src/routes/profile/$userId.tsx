import { createFileRoute, Link, redirect } from '@tanstack/react-router';
import { useUserProfile, useBadges, leaderboardKeys } from '../../lib/hooks/useLeaderboard';
import { useAuth } from '../../lib/hooks/useAuth';
import { useUserReports } from '../../lib/hooks/useReports';
import { useCheckIns, useCheckInStats } from '../../lib/hooks/useCheckIn';
import { authApi } from '../../lib/api/auth';
import { leaderboardApi } from '../../lib/api/leaderboard';
import { Card } from '../../components/ui/Card';
import { Loading, Skeleton } from '../../components/ui/Loading';
import { PageHeader } from '../../components/layout';
import { ReportListCard } from '../../components/ReportListCard';
import { CheckInHistoryList } from '../../components/CheckInHistoryList';
import { FollowButton } from '../../components/FollowButton';
import { MessageUserButton } from '../../components/MessageUserButton';
import { format } from 'date-fns';
import { USER_LEVELS } from '../../lib/utils/constants';
import { useState } from 'react';
import { RouteErrorComponent } from '../../components/RouteErrorComponent';
import { Button } from '../../components/ui/Button';
import { ChangePasswordModal } from '../../components/ChangePasswordModal';

export const Route = createFileRoute('/profile/$userId')({
  beforeLoad: async () => {
    if (!authApi.isAuthenticated()) {
      throw redirect({ to: '/auth/login' });
    }
  },
  loader: async ({ context, params }) => {
    const { queryClient } = context;
    const userId = params.userId;

    // Prefetch user profile data
    await queryClient.ensureQueryData({
      queryKey: leaderboardKeys.userProfile(userId),
      queryFn: () => leaderboardApi.getUserProfile(userId),
    });

    return { userId };
  },
  component: UserProfilePage,
  errorComponent: RouteErrorComponent,
  pendingComponent: () => (
    <div className="animate-fade-in">
      <PageHeader title="Loading profile..." />
      <div className="space-y-6">
        <Skeleton className="h-48 card-chamfered" />
        <Skeleton className="h-32 card-chamfered" />
        <Skeleton className="h-64 card-chamfered" />
      </div>
    </div>
  ),
});

function getLevelColor(level: string) {
  // Use theme accent color for all levels
  return 'bg-accent';
}

function getBadgeIcon(badgeName: string, criteriaType?: string) {
  const name = badgeName.toLowerCase();
  
  // Map badge names/types to appropriate outlined icons
  if (name.includes('first') || name.includes('starter') || name.includes('newcomer')) {
    return (
      <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
      </svg>
    );
  }
  
  if (name.includes('report') || criteriaType === 'reports_accepted') {
    return (
      <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    );
  }
  
  if (name.includes('comment') || criteriaType === 'comments_made') {
    return (
      <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    );
  }
  
  if (name.includes('upvote') || name.includes('popular') || criteriaType === 'upvotes_received') {
    return (
      <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
      </svg>
    );
  }
  
  if (name.includes('reputation') || name.includes('points') || criteriaType === 'reputation_points') {
    return (
      <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    );
  }
  
  if (name.includes('helpful') || name.includes('contributor')) {
    return (
      <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    );
  }
  
  if (name.includes('verified') || name.includes('trusted')) {
    return (
      <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    );
  }
  
  if (name.includes('expert') || name.includes('master')) {
    return (
      <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
      </svg>
    );
  }
  
  // Default badge icon (outlined)
  return (
    <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
    </svg>
  );
}

function UserProfilePage() {
  const { userId } = Route.useParams();
  const { user: currentUser } = useAuth();
  const { data: profile, isLoading: profileLoading, error: profileError } = useUserProfile(userId);
  const { data: allBadges } = useBadges();
  const [activeTab, setActiveTab] = useState<'reports' | 'checkins' | 'badges'>('reports');
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);

  const isOwnProfile = currentUser?.id === Number(userId);

  // Fetch user's reports
  const { data: userReports, isLoading: reportsLoading } = useUserReports(userId, 1, 10);

  // Fetch check-ins only for own profile (only used when isOwnProfile is true)
  const { data: checkInStats } = useCheckInStats();

  if (profileLoading) {
    return <Loading />;
  }

  if (profileError || !profile) {
    return (
      <div className="text-center py-20 animate-fade-in">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-error/10 mb-4 card-chamfered">
          <svg className="w-8 h-8 text-error" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="text-error font-display text-lg mb-2">User not found</p>
        <Link to="/leaderboard">
          <span className="text-accent hover:underline">Back to Leaderboard</span>
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

      {/* Profile Header */}
      <Card className="mb-6">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            {/* Avatar */}
            <div className={`
              w-28 h-28 rounded-full flex items-center justify-center text-white font-bold text-4xl
              ${getLevelColor(profile.level)} shadow-xl
            `}>
              {profile.user.username.charAt(0).toUpperCase()}
            </div>

            {/* Info */}
            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-col md:flex-row items-center gap-3 mb-2">
                <h1 className="text-3xl font-display font-bold text-text-primary">
                  {profile.user.username}
                </h1>
                {isOwnProfile && (
                  <span className="px-3 py-1 text-sm bg-warning/10 text-warning rounded-full">
                    Your Profile
                  </span>
                )}
                {!isOwnProfile && (
                  <div className="flex items-center gap-2">
                    <FollowButton userId={Number(userId)} variant="default" />
                    <MessageUserButton userId={Number(userId)} variant="default" />
                  </div>
                )}
              </div>
              
              <div className="flex flex-wrap justify-center md:justify-start gap-3 mb-4">
                <span className={`
                  inline-flex items-center px-4 py-1.5 text-sm font-semibold rounded-full
                  ${getLevelColor(profile.level)} text-white shadow
                `}>
                  {currentLevel?.label || profile.level}
                </span>
                <span className="inline-flex items-center px-4 py-1.5 text-sm font-medium bg-bg-elevated text-text-secondary rounded-full">
                  {profile.reputation_points.toLocaleString()} points
                </span>
              </div>

              {/* Progress to next level */}
              {nextLevel && (
                <div className="max-w-sm mx-auto md:mx-0">
                  <div className="flex justify-between text-xs text-text-muted mb-1">
                    <span>{currentLevel?.label}</span>
                    <span>{nextLevel.label}</span>
                  </div>
                  <div className="h-2 bg-bg-elevated rounded-full overflow-hidden">
                    <div
                      className={`h-full ${getLevelColor(profile.level)} transition-all duration-500`}
                      style={{ width: `${progressToNext}%` }}
                    />
                  </div>
                  <p className="text-xs text-text-muted mt-1">
                    {nextLevel.minPoints - profile.reputation_points} points to {nextLevel.label}
                  </p>
                </div>
              )}
            </div>
          </div>
        </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          <Card static className="text-center">
            <p className="text-3xl font-display font-bold text-accent">
              {profile.reputation_points.toLocaleString()}
            </p>
            <p className="text-sm text-text-muted">Total Points</p>
          </Card>
          <Card static className="text-center">
            <p className="text-3xl font-display font-bold text-text-primary">
              {profile.badges.length}
            </p>
            <p className="text-sm text-text-muted">Badges Earned</p>
          </Card>
          <Card static className="text-center">
            <p className="text-3xl font-display font-bold text-info">
              {nextLevel ? `${nextLevel.minPoints - profile.reputation_points}` : '—'}
            </p>
            <p className="text-sm text-text-muted">Points to Next</p>
          </Card>
      </div>

      {/* Security Section - Only show for own profile and non-OAuth users */}
      {isOwnProfile && !currentUser?.oauth_provider && (
        <Card className="mb-6">
          <h2 className="text-xl font-display font-semibold text-text-primary mb-4">
            Security
          </h2>
          <p className="text-sm text-text-secondary mb-4">
            Manage your account security settings
          </p>
          <Button
            variant="outline"
            onClick={() => setShowChangePasswordModal(true)}
          >
            Change Password
          </Button>
        </Card>
      )}

      {/* Tab Navigation */}
      <div className="flex border-b border-border mb-6">
        <button
          className={`px-4 py-3 border-b-2 transition-colors ${
            activeTab === 'reports'
              ? 'border-accent text-accent'
              : 'border-transparent text-text-secondary hover:text-text-primary'
          }`}
          onClick={() => setActiveTab('reports')}
        >
          <span className="font-display font-medium">Reports</span>
          <span className="ml-2 px-2 py-0.5 text-xs bg-bg-elevated rounded-full">
            {userReports?.total || 0}
          </span>
        </button>
        {isOwnProfile && (
          <button
            className={`px-4 py-3 border-b-2 transition-colors ${
              activeTab === 'checkins'
                ? 'border-accent text-accent'
                : 'border-transparent text-text-secondary hover:text-text-primary'
            }`}
            onClick={() => setActiveTab('checkins')}
          >
            <span className="font-display font-medium">Check-in History</span>
          </button>
        )}
        <button
          className={`px-4 py-3 border-b-2 transition-colors ml-auto ${
            activeTab === 'badges'
              ? 'border-accent text-accent'
              : 'border-transparent text-text-secondary hover:text-text-primary'
          }`}
          onClick={() => setActiveTab('badges')}
        >
          <span className="font-display font-medium">Badges</span>
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'reports' && (
        <div className="animate-fade-in">
          <h2 className="text-xl font-display font-semibold text-text-primary mb-4">
            Reports ({userReports?.total || 0})
          </h2>

          {reportsLoading ? (
            <div className="grid gap-4">
              {[1, 2, 3].map((i) => (
                <Card key={i} size="sm" className="p-4 animate-pulse">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-bg-elevated" />
                    <div className="flex-1">
                      <div className="h-5 bg-bg-elevated rounded mb-2 w-1/3" />
                      <div className="h-4 bg-bg-elevated rounded w-2/3" />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : userReports?.data && userReports.data.length > 0 ? (
            <div className="grid gap-3">
              {userReports.data.map((report) => (
                <ReportListCard key={report.id} report={report} />
              ))}
            </div>
          ) : (
            <Card className="p-8 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-bg-elevated rounded-full mb-4">
                <svg className="w-8 h-8 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-display font-semibold text-text-primary mb-2">
                No reports yet
              </h3>
              <p className="text-sm text-text-muted">
                {isOwnProfile
                  ? "Start reporting issues to see them here"
                  : "This user hasn't submitted any reports yet."}
              </p>
            </Card>
          )}
        </div>
      )}

      {activeTab === 'checkins' && isOwnProfile && (
        <div className="animate-fade-in">
          <h2 className="text-xl font-display font-semibold text-text-primary mb-4">
            Check-in History
          </h2>

          {/* Check-in Stats */}
          {checkInStats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <Card static className="text-center">
                <p className="text-2xl font-display font-bold text-accent">
                  {checkInStats.total_check_ins}
                </p>
                <p className="text-sm text-text-muted">Total Check-ins</p>
              </Card>
              <Card static className="text-center">
                <p className="text-2xl font-display font-bold text-success">
                  {checkInStats.completed_check_ins}
                </p>
                <p className="text-sm text-text-muted">Completed</p>
              </Card>
              <Card static className="text-center">
                <p className="text-2xl font-display font-bold text-warning">
                  {checkInStats.current_streak_days}
                </p>
                <p className="text-sm text-text-muted">Current Streak</p>
              </Card>
              <Card static className="text-center">
                <p className="text-2xl font-display font-bold text-info">
                  {checkInStats.total_points_earned}
                </p>
                <p className="text-sm text-text-muted">Points Earned</p>
              </Card>
            </div>
          )}

          {/* Check-in History List */}
          <CheckInHistoryList />
        </div>
      )}

      {activeTab === 'badges' && (
        <div className="animate-fade-in">
          {/* Badges */}
          <Card static className="mb-6">
            <h2 className="text-xl font-display font-semibold text-text-primary mb-4">Earned Badges</h2>

            {profile.badges.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {profile.badges.map((userBadge) => (
                  <div
                    key={userBadge.id}
                    className="flex flex-col items-center p-4 bg-warning/10 rounded-sm border border-warning"
                  >
                    <div className="text-tertiary mb-2">
                      {getBadgeIcon(userBadge.badge.name, userBadge.badge.criteria_type)}
                    </div>
                    <p className="font-display font-semibold text-text-primary text-center text-sm">
                      {userBadge.badge.name}
                    </p>
                    <p className="text-xs text-text-muted text-center mt-1">
                      {userBadge.badge.description}
                    </p>
                    <p className="text-xs text-tertiary mt-2">
                      {format(new Date(userBadge.earned_at), 'MMM d, yyyy')}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-text-muted">
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
              <h2 className="text-xl font-display font-semibold text-text-primary mb-4">All Available Badges</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {allBadges.map((badge) => {
                  const isEarned = profile.badges.some(b => b.badge_id === badge.id);
                  return (
                    <div
                      key={badge.id}
                      className={`
                        flex flex-col items-center p-4 rounded-sm border transition-all
                        ${isEarned
                          ? 'bg-accent/10 border-accent'
                          : 'bg-bg-main border-border opacity-60'}
                      `}
                    >
                      <div className={`mb-2 ${isEarned ? 'text-accent' : 'text-text-muted'}`}>
                        {getBadgeIcon(badge.name, badge.criteria_type)}
                      </div>
                      <p className="font-display font-semibold text-text-primary text-center text-sm">
                        {badge.name}
                      </p>
                      <p className="text-xs text-text-muted text-center mt-1">
                        {badge.description}
                      </p>
                      {isEarned && (
                        <span className="mt-2 px-2 py-0.5 text-xs bg-accent/30 text-accent-hover rounded-full">
                          Earned
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </Card>
          )}
        </div>
      )}

      {/* Change Password Modal */}
      <ChangePasswordModal
        isOpen={showChangePasswordModal}
        onClose={() => setShowChangePasswordModal(false)}
      />
    </div>
  );
}

