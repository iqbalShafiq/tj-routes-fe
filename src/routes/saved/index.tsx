import { useState } from 'react';
import { createFileRoute, Link, redirect } from '@tanstack/react-router';
import { authApi } from '../../lib/api/auth';
import { useFavoriteRoutes, useFavoriteStops, usePlaces, useSavedNavigations, useDeletePlace, useDeleteSavedNavigation } from '../../lib/hooks/usePersonalized';
import { Card } from '../../components/ui/Card';
import { Loading } from '../../components/ui/Loading';
import { PageHeader } from '../../components/layout';
import { FavoriteButton } from '../../components/FavoriteButton';
import { SavedPlaceCard } from '../../components/SavedPlaceCard';
import { SavedNavigationCard } from '../../components/SavedNavigationCard';
import { PlaceFormModal } from '../../components/PlaceFormModal';
import { NavigationFormModal } from '../../components/NavigationFormModal';
import { useAuth } from '../../lib/hooks/useAuth';

export const Route = createFileRoute('/saved/')({
  beforeLoad: async () => {
    if (!authApi.isAuthenticated()) {
      throw redirect({ to: '/auth/login' });
    }
  },
  component: SavedPage,
});

type TabType = 'favorites' | 'places' | 'navigations';
type FavoriteSubTab = 'routes' | 'stops';

function SavedPage() {
  // const { user } = useAuth(); // unused
  const [activeTab, setActiveTab] = useState<TabType>('favorites');
  const [favoriteSubTab, setFavoriteSubTab] = useState<FavoriteSubTab>('routes');

  // Modals state
  const [placeModalOpen, setPlaceModalOpen] = useState(false);
  const [editingPlace, setEditingPlace] = useState<any>(null);
  const [navigationModalOpen, setNavigationModalOpen] = useState(false);
  const [editingNavigation, setEditingNavigation] = useState<any>(null);

  // Data queries
  const { data: favoriteRoutes, isLoading: loadingRoutes } = useFavoriteRoutes();
  const { data: favoriteStops, isLoading: loadingStops } = useFavoriteStops();
  const { data: places, isLoading: loadingPlaces } = usePlaces();
  const { data: savedNavigations, isLoading: loadingNavigations } = useSavedNavigations();

  // Mutations
  const deletePlace = useDeletePlace();
  const deleteNavigation = useDeleteSavedNavigation();

  const handleEditPlace = (place: any) => {
    setEditingPlace(place);
    setPlaceModalOpen(true);
  };

  const handleDeletePlace = async (place: any) => {
    if (confirm('Are you sure you want to delete this place?')) {
      await deletePlace.mutateAsync(place.id);
    }
  };

  const handleEditNavigation = (navigation: any) => {
    setEditingNavigation(navigation);
    setNavigationModalOpen(true);
  };

  const handleDeleteNavigation = async (navigation: any) => {
    if (confirm('Are you sure you want to delete this navigation?')) {
      await deleteNavigation.mutateAsync(navigation.id);
    }
  };

  const handlePlaceModalClose = () => {
    setPlaceModalOpen(false);
    setEditingPlace(null);
  };

  const handleNavigationModalClose = () => {
    setNavigationModalOpen(false);
    setEditingNavigation(null);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'favorites':
        return renderFavoritesTab();
      case 'places':
        return renderPlacesTab();
      case 'navigations':
        return renderNavigationsTab();
      default:
        return null;
    }
  };

  const renderFavoritesTab = () => (
    <div className="animate-fade-in">
      {/* Sub-tabs for Favorites */}
      <div className="flex border-b border-border mb-6">
        <button
          className={`px-4 py-3 border-b-2 transition-colors ${
            favoriteSubTab === 'routes'
              ? 'border-accent text-accent'
              : 'border-transparent text-text-secondary hover:text-text-primary'
          }`}
          onClick={() => setFavoriteSubTab('routes')}
        >
          <span className="font-display font-medium">Routes</span>
          <span className="ml-2 px-2 py-0.5 text-xs bg-bg-elevated rounded-full">
            {favoriteRoutes?.total || 0}
          </span>
        </button>
        <button
          className={`px-4 py-3 border-b-2 transition-colors ${
            favoriteSubTab === 'stops'
              ? 'border-accent text-accent'
              : 'border-transparent text-text-secondary hover:text-text-primary'
          }`}
          onClick={() => setFavoriteSubTab('stops')}
        >
          <span className="font-display font-medium">Stops</span>
          <span className="ml-2 px-2 py-0.5 text-xs bg-bg-elevated rounded-full">
            {favoriteStops?.total || 0}
          </span>
        </button>
      </div>

      {favoriteSubTab === 'routes' && (
        <div className="grid gap-4">
          {loadingRoutes ? (
            <div className="grid gap-4">
              {[1, 2, 3].map((i) => (
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
          ) : favoriteRoutes?.data && favoriteRoutes.data.length > 0 ? (
            <div className="grid gap-3">
              {favoriteRoutes.data.map((route) => (
                <Card key={route.id} size="md" className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
                      <span className="text-accent font-display font-bold text-lg">
                        {route.route.route_number}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-display font-semibold text-text-primary truncate">
                        {route.route.name}
                      </h3>
                      <p className="text-sm text-text-muted">
                        Added {new Date(route.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <FavoriteButton
                        id={Number(route.route.id)}
                        type="route"
                        isFavorite={true}
                        size="md"
                        variant="minimal"
                      />
                      <Link
                        to="/routes/$routeId"
                        params={{ routeId: String(route.route.id) }}
                        className="p-2 hover:bg-bg-elevated rounded-lg transition-colors"
                      >
                        <svg
                          className="w-5 h-5 text-text-secondary"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </Link>
                    </div>
                  </div>
                </Card>
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
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-display font-semibold text-text-primary mb-2">
                No favorite routes yet
              </h3>
              <p className="text-sm text-text-muted">
                Start exploring routes and save your favorites for quick access
              </p>
              <Link to="/routes">
                <button className="mt-4 px-4 py-2 bg-accent text-white rounded-lg font-medium hover:bg-accent-hover transition-colors">
                  Browse Routes
                </button>
              </Link>
            </Card>
          )}
        </div>
      )}

      {favoriteSubTab === 'stops' && (
        <div className="grid gap-4">
          {loadingStops ? (
            <div className="grid gap-4">
              {[1, 2, 3].map((i) => (
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
          ) : favoriteStops?.data && favoriteStops.data.length > 0 ? (
            <div className="grid gap-3">
              {favoriteStops.data.map((stop) => (
                <Card key={stop.id} size="md" className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
                      <svg className="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-display font-semibold text-text-primary truncate">
                        {stop.stop.name}
                      </h3>
                      {stop.stop.code && (
                        <p className="text-sm text-text-muted">{stop.stop.code}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <FavoriteButton
                        id={Number(stop.stop.id)}
                        type="stop"
                        isFavorite={true}
                        size="md"
                        variant="minimal"
                      />
                    </div>
                  </div>
                </Card>
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
                No favorite stops yet
              </h3>
              <p className="text-sm text-text-muted">
                Start exploring stops and save your favorites for quick access
              </p>
              <Link to="/stops">
                <button className="mt-4 px-4 py-2 bg-accent text-white rounded-lg font-medium hover:bg-accent-hover transition-colors">
                  Browse Stops
                </button>
              </Link>
            </Card>
          )}
        </div>
      )}
    </div>
  );

  const renderPlacesTab = () => (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-display font-semibold text-text-primary">
          Saved Places
        </h2>
        <button
          onClick={() => setPlaceModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-lg font-medium hover:bg-accent-hover transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Place
        </button>
      </div>

      {loadingPlaces ? (
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
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
      ) : places?.places && places.places.length > 0 ? (
        <div className="grid gap-3">
          {places.places.map((place) => (
            <SavedPlaceCard
              key={place.id}
              place={place}
              onEdit={handleEditPlace}
              onDelete={handleDeletePlace}
            />
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
            No saved places yet
          </h3>
          <p className="text-sm text-text-muted">
            Save your frequently visited places for quick access
          </p>
          <button
            onClick={() => setPlaceModalOpen(true)}
            className="mt-4 px-4 py-2 bg-accent text-white rounded-lg font-medium hover:bg-accent-hover transition-colors"
          >
            Add Your First Place
          </button>
        </Card>
      )}
    </div>
  );

  const renderNavigationsTab = () => (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-display font-semibold text-text-primary">
          Saved Navigations
        </h2>
        <button
          onClick={() => setNavigationModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-lg font-medium hover:bg-accent-hover transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Save Navigation
        </button>
      </div>

      {loadingNavigations ? (
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
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
      ) : savedNavigations?.data && savedNavigations.data.length > 0 ? (
        <div className="grid gap-3">
          {savedNavigations.data.map((nav) => (
            <SavedNavigationCard
              key={nav.id}
              navigation={nav}
              onEdit={handleEditNavigation}
              onDelete={handleDeleteNavigation}
            />
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
            No saved navigations yet
          </h3>
          <p className="text-sm text-text-muted">
            Save your frequently used routes for quick navigation
          </p>
          <button
            onClick={() => setNavigationModalOpen(true)}
            className="mt-4 px-4 py-2 bg-accent text-white rounded-lg font-medium hover:bg-accent-hover transition-colors"
          >
            Save Your First Navigation
          </button>
        </Card>
      )}
    </div>
  );

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Saved"
        breadcrumbs={[{ label: 'Saved' }]}
      />

      {/* Tab Navigation */}
      <div className="flex border-b border-border mb-6">
        <button
          className={`px-4 py-3 border-b-2 transition-colors ${
            activeTab === 'favorites'
              ? 'border-accent text-accent'
              : 'border-transparent text-text-secondary hover:text-text-primary'
          }`}
          onClick={() => setActiveTab('favorites')}
        >
          <span className="font-display font-medium">Favorites</span>
        </button>
        <button
          className={`px-4 py-3 border-b-2 transition-colors ${
            activeTab === 'places'
              ? 'border-accent text-accent'
              : 'border-transparent text-text-secondary hover:text-text-primary'
          }`}
          onClick={() => setActiveTab('places')}
        >
          <span className="font-display font-medium">Places</span>
        </button>
        <button
          className={`px-4 py-3 border-b-2 transition-colors ${
            activeTab === 'navigations'
              ? 'border-accent text-accent'
              : 'border-transparent text-text-secondary hover:text-text-primary'
          }`}
          onClick={() => setActiveTab('navigations')}
        >
          <span className="font-display font-medium">Navigations</span>
        </button>
      </div>

      {/* Tab Content */}
      {renderTabContent()}

      {/* Modals */}
      <PlaceFormModal
        isOpen={placeModalOpen}
        onClose={handlePlaceModalClose}
        place={editingPlace}
        onSuccess={() => {
          setEditingPlace(null);
        }}
      />

      <NavigationFormModal
        isOpen={navigationModalOpen}
        onClose={handleNavigationModalClose}
        navigation={editingNavigation}
        onSuccess={() => {
          setEditingNavigation(null);
        }}
      />
    </div>
  );
}
