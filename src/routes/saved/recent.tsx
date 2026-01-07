import { useState } from 'react';
import { createFileRoute, Link, redirect } from '@tanstack/react-router';
import { authApi } from '../../lib/api/auth';
import { useRecentRoutes, useRecentStops, useRecentNavigations } from '../../lib/hooks/usePersonalized';
import { Card } from '../../components/ui/Card';
import { Loading } from '../../components/ui/Loading';
import { PageHeader } from '../../components/layout';
import { RecentItemCard } from '../../components/RecentItemCard';
import { RouteErrorComponent } from '../../components/RouteErrorComponent';

export const Route = createFileRoute('/saved/recent')({
  beforeLoad: async () => {
    if (!authApi.isAuthenticated()) {
      throw redirect({ to: '/auth/login' });
    }
  },
  component: RecentPage,
  errorComponent: RouteErrorComponent,
});

type RecentTabType = 'routes' | 'stops' | 'navigations';

function RecentPage() {
  const [activeTab, setActiveTab] = useState<RecentTabType>('routes');

  // Data queries
  const { data: recentRoutes, isLoading: loadingRoutes } = useRecentRoutes();
  const { data: recentStops, isLoading: loadingStops } = useRecentStops();
  const { data: recentNavigations, isLoading: loadingNavigations } = useRecentNavigations();

  const isLoading = loadingRoutes || loadingStops || loadingNavigations;

  const renderTabContent = () => {
    switch (activeTab) {
      case 'routes':
        return renderRoutesTab();
      case 'stops':
        return renderStopsTab();
      case 'navigations':
        return renderNavigationsTab();
      default:
        return null;
    }
  };

  const renderRoutesTab = () => (
    <div className="grid gap-4">
      {loadingRoutes ? (
        <div className="grid gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <Card key={i} size="md" className="p-4 animate-pulse">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-bg-elevated" />
                <div className="flex-1">
                  <div className="h-5 bg-bg-elevated rounded mb-2 w-1/3" />
                  <div className="h-4 bg-bg-elevated rounded w-1/2" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : recentRoutes?.data && recentRoutes.data.length > 0 ? (
        <div className="grid gap-3">
          {recentRoutes.data.map((route) => (
            <RecentItemCard key={route.id} type="route" item={route} />
          ))}
        </div>
      ) : (
        <Card className="p-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-bg-elevated rounded-full mb-4">
            <svg className="w-8 h-8 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-display font-semibold text-text-primary mb-2">
            No recent routes yet
          </h3>
          <p className="text-sm text-text-muted">
            Routes you view will appear here for quick access
          </p>
          <Link to="/routes">
            <button className="mt-4 px-4 py-2 bg-accent text-white rounded-lg font-medium hover:bg-accent-hover transition-colors">
              Browse Routes
            </button>
          </Link>
        </Card>
      )}
    </div>
  );

  const renderStopsTab = () => (
    <div className="grid gap-4">
      {loadingStops ? (
        <div className="grid gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <Card key={i} size="md" className="p-4 animate-pulse">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-bg-elevated" />
                <div className="flex-1">
                  <div className="h-5 bg-bg-elevated rounded mb-2 w-1/3" />
                  <div className="h-4 bg-bg-elevated rounded w-1/2" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : recentStops?.data && recentStops.data.length > 0 ? (
        <div className="grid gap-3">
          {recentStops.data.map((stop) => (
            <RecentItemCard key={stop.id} type="stop" item={stop} />
          ))}
        </div>
      ) : (
        <Card className="p-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-bg-elevated rounded-full mb-4">
            <svg className="w-8 h-8 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-display font-semibold text-text-primary mb-2">
            No recent stops yet
          </h3>
          <p className="text-sm text-text-muted">
            Stops you view will appear here for quick access
          </p>
          <Link to="/stops">
            <button className="mt-4 px-4 py-2 bg-accent text-white rounded-lg font-medium hover:bg-accent-hover transition-colors">
              Browse Stops
            </button>
          </Link>
        </Card>
      )}
    </div>
  );

  const renderNavigationsTab = () => (
    <div className="grid gap-4">
      {loadingNavigations ? (
        <div className="grid gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <Card key={i} size="md" className="p-4 animate-pulse">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-bg-elevated" />
                <div className="flex-1">
                  <div className="h-5 bg-bg-elevated rounded mb-2 w-1/3" />
                  <div className="h-4 bg-bg-elevated rounded w-1/2" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : recentNavigations?.data && recentNavigations.data.length > 0 ? (
        <div className="grid gap-3">
          {recentNavigations.data.map((nav) => (
            <RecentItemCard key={nav.id} type="navigation" item={nav} />
          ))}
        </div>
      ) : (
        <Card className="p-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-bg-elevated rounded-full mb-4">
            <svg className="w-8 h-8 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
              />
            </svg>
          </div>
          <h3 className="text-lg font-display font-semibold text-text-primary mb-2">
            No recent searches yet
          </h3>
          <p className="text-sm text-text-muted">
            Your navigation searches will appear here
          </p>
        </Card>
      )}
    </div>
  );

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Recent"
        breadcrumbs={[{ label: 'Saved', path: '/saved' }, { label: 'Recent' }]}
      />

      {/* Tab Navigation */}
      <div className="flex border-b border-border mb-6">
        <button
          className={`px-4 py-3 border-b-2 transition-colors ${
            activeTab === 'routes'
              ? 'border-accent text-accent'
              : 'border-transparent text-text-secondary hover:text-text-primary'
          }`}
          onClick={() => setActiveTab('routes')}
        >
          <span className="font-display font-medium">Routes</span>
          <span className="ml-2 px-2 py-0.5 text-xs bg-bg-elevated rounded-full">
            {recentRoutes?.total || 0}
          </span>
        </button>
        <button
          className={`px-4 py-3 border-b-2 transition-colors ${
            activeTab === 'stops'
              ? 'border-accent text-accent'
              : 'border-transparent text-text-secondary hover:text-text-primary'
          }`}
          onClick={() => setActiveTab('stops')}
        >
          <span className="font-display font-medium">Stops</span>
          <span className="ml-2 px-2 py-0.5 text-xs bg-bg-elevated rounded-full">
            {recentStops?.total || 0}
          </span>
        </button>
        <button
          className={`px-4 py-3 border-b-2 transition-colors ${
            activeTab === 'navigations'
              ? 'border-accent text-accent'
              : 'border-transparent text-text-secondary hover:text-text-primary'
          }`}
          onClick={() => setActiveTab('navigations')}
        >
          <span className="font-display font-medium">Searches</span>
          <span className="ml-2 px-2 py-0.5 text-xs bg-bg-elevated rounded-full">
            {recentNavigations?.total || 0}
          </span>
        </button>
      </div>

      {/* Tab Content */}
      {renderTabContent()}
    </div>
  );
}
