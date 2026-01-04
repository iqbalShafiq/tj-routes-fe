import apiClient from './client';
import { API_ENDPOINTS } from '../utils/constants';

// =====================
// Types for Favorites
// =====================

export interface UserFavoriteRoute {
  id: number;              // favorite record ID
  route: {
    id: number;            // route entity ID
    route_number: string;
    name: string;
    description?: string;
    status: string;
    created_at: string;
    updated_at: string;
  };
  created_at: string;
}

export interface UserFavoriteStop {
  id: number;              // favorite record ID
  stop: {
    id: number;            // stop entity ID
    name: string;
    type?: string;
    code?: string;
    latitude: number;
    longitude: number;
    address?: string;
    city?: string;
    district?: string;
    status: string;
    created_at: string;
    updated_at: string;
  };
  created_at: string;
}

export interface FavoriteRoutesResponse {
  success: boolean;
  data: {
    routes: UserFavoriteRoute[];
    total: number;
    page: number;
    limit: number;
  };
}

export interface FavoriteStopsResponse {
  success: boolean;
  data: {
    stops: UserFavoriteStop[];
    total: number;
    page: number;
    limit: number;
  };
}

export interface FavoriteStatusResponse {
  success: boolean;
  data: {
    is_favorite: boolean;
  };
}

// =====================
// Types for Places
// =====================

export type PlaceType =
  | 'home'
  | 'office'
  | 'school'
  | 'gym'
  | 'shopping'
  | 'restaurant'
  | 'hospital'
  | 'other'
  | 'custom';

export interface UserPlace {
  id: number;
  place_type: PlaceType;
  name: string;
  latitude: number;
  longitude: number;
  address?: string;
  notes?: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreatePlaceRequest {
  place_type: PlaceType;
  name: string;
  latitude: number;
  longitude: number;
  address?: string;
  notes?: string;
  is_default?: boolean;
}

export interface UpdatePlaceRequest {
  place_type?: PlaceType;
  name?: string;
  latitude?: number;
  longitude?: number;
  address?: string;
  notes?: string;
  is_default?: boolean;
}

export interface PlacesResponse {
  success: boolean;
  data: {
    data: UserPlace[];
    total: number;
  };
}

export interface PlaceResponse {
  success: boolean;
  data: UserPlace;
}

// =====================
// Types for Saved Navigations
// =====================

export interface NavigationPoint {
  place_type?: PlaceType | 'stop';
  place_id?: number;
  place_name?: string;
  stop_id?: number;
  stop_name?: string;
}

export interface UserSavedNavigation {
  id: number;
  name: string;
  from: NavigationPoint;
  to: NavigationPoint;
  created_at: string;
  updated_at: string;
}

export interface CreateNavigationRequest {
  name: string;
  from: NavigationPoint;
  to: NavigationPoint;
}

export interface UpdateNavigationRequest {
  name?: string;
  from?: NavigationPoint;
  to?: NavigationPoint;
}

export interface SavedNavigationsResponse {
  success: boolean;
  data: {
    data: UserSavedNavigation[];
    total: number;
    page: number;
    limit: number;
  };
}

export interface NavigationResponse {
  success: boolean;
  data: UserSavedNavigation;
}

// =====================
// Types for Recent Items
// =====================

export interface RecentNavigation {
  id: number;
  from: NavigationPoint;
  to: NavigationPoint;
  searched_at: string;
}

export interface RecentNavigationsResponse {
  success: boolean;
  data: {
    data: RecentNavigation[];
    total: number;
    page: number;
    limit: number;
  };
}

export interface RecordRecentNavigationRequest {
  from: NavigationPoint;
  to: NavigationPoint;
}

// =====================
// API Functions
// =====================

export const personalizedApi = {
  // Favorite Routes
  getFavoriteRoutes: async (
    page: number = 1,
    limit: number = 20
  ): Promise<{
    data: UserFavoriteRoute[];
    total: number;
    page: number;
    limit: number;
  }> => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    const response = await apiClient.get<FavoriteRoutesResponse>(
      `${API_ENDPOINTS.personalized.favorites.routes}?${params}`
    );
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    return { data: [], total: 0, page, limit };
  },

  addFavoriteRoute: async (routeId: number): Promise<void> => {
    await apiClient.post(API_ENDPOINTS.personalized.favorites.routes, { routeId });
  },

  removeFavoriteRoute: async (routeId: number): Promise<void> => {
    await apiClient.delete(API_ENDPOINTS.personalized.favorites.route(routeId));
  },

  isFavoriteRoute: async (routeId: number): Promise<boolean> => {
    const response = await apiClient.get<FavoriteStatusResponse>(
      API_ENDPOINTS.personalized.favorites.route(routeId)
    );
    return response.data.data?.is_favorite ?? false;
  },

  // Favorite Stops
  getFavoriteStops: async (
    page: number = 1,
    limit: number = 20
  ): Promise<{
    data: UserFavoriteStop[];
    total: number;
    page: number;
    limit: number;
  }> => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    const response = await apiClient.get<FavoriteStopsResponse>(
      `${API_ENDPOINTS.personalized.favorites.stops}?${params}`
    );
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    return { data: [], total: 0, page, limit };
  },

  addFavoriteStop: async (stopId: number): Promise<void> => {
    await apiClient.post(API_ENDPOINTS.personalized.favorites.stops, { stopId });
  },

  removeFavoriteStop: async (stopId: number): Promise<void> => {
    await apiClient.delete(API_ENDPOINTS.personalized.favorites.stop(stopId));
  },

  isFavoriteStop: async (stopId: number): Promise<boolean> => {
    const response = await apiClient.get<FavoriteStatusResponse>(
      API_ENDPOINTS.personalized.favorites.stop(stopId)
    );
    return response.data.data?.is_favorite ?? false;
  },

  // Places
  getPlaces: async (): Promise<{ places: UserPlace[]; total: number }> => {
    const response = await apiClient.get<PlacesResponse>(
      API_ENDPOINTS.personalized.places.list
    );
    if (response.data.success && response.data.data) {
      return {
        places: response.data.data.data,
        total: response.data.data.total,
      };
    }
    return { places: [], total: 0 };
  },

  getPlace: async (id: string | number): Promise<UserPlace> => {
    const response = await apiClient.get<PlaceResponse>(
      API_ENDPOINTS.personalized.places.detail(id)
    );
    return response.data.data;
  },

  createPlace: async (data: CreatePlaceRequest): Promise<UserPlace> => {
    const response = await apiClient.post<PlaceResponse>(
      API_ENDPOINTS.personalized.places.list,
      data
    );
    return response.data.data;
  },

  updatePlace: async (
    id: string | number,
    data: UpdatePlaceRequest
  ): Promise<UserPlace> => {
    const response = await apiClient.put<PlaceResponse>(
      API_ENDPOINTS.personalized.places.detail(id),
      data
    );
    return response.data.data;
  },

  deletePlace: async (id: string | number): Promise<void> => {
    await apiClient.delete(API_ENDPOINTS.personalized.places.detail(id));
  },

  // Recent Routes
  getRecentRoutes: async (
    page: number = 1,
    limit: number = 20
  ): Promise<{
    data: UserFavoriteRoute[];
    total: number;
    page: number;
    limit: number;
  }> => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    const response = await apiClient.get<FavoriteRoutesResponse>(
      `${API_ENDPOINTS.personalized.recent.routes}?${params}`
    );
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    return { data: [], total: 0, page, limit };
  },

  // Recent Stops
  getRecentStops: async (
    page: number = 1,
    limit: number = 20
  ): Promise<{
    data: UserFavoriteStop[];
    total: number;
    page: number;
    limit: number;
  }> => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    const response = await apiClient.get<FavoriteStopsResponse>(
      `${API_ENDPOINTS.personalized.recent.stops}?${params}`
    );
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    return { data: [], total: 0, page, limit };
  },

  // Recent Navigations
  getRecentNavigations: async (
    page: number = 1,
    limit: number = 20
  ): Promise<{
    data: RecentNavigation[];
    total: number;
    page: number;
    limit: number;
  }> => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    const response = await apiClient.get<RecentNavigationsResponse>(
      `${API_ENDPOINTS.personalized.recent.navigations}?${params}`
    );
    if (response.data.success && response.data.data) {
      return {
        data: response.data.data.data,
        total: response.data.data.total,
        page: response.data.data.page,
        limit: response.data.data.limit,
      };
    }
    return { data: [], total: 0, page, limit };
  },

  recordRecentNavigation: async (data: RecordRecentNavigationRequest): Promise<void> => {
    await apiClient.post(API_ENDPOINTS.personalized.recent.navigations, data);
  },

  // Saved Navigations
  getSavedNavigations: async (
    page: number = 1,
    limit: number = 20
  ): Promise<{
    data: UserSavedNavigation[];
    total: number;
    page: number;
    limit: number;
  }> => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    const response = await apiClient.get<SavedNavigationsResponse>(
      `${API_ENDPOINTS.personalized.savedNavigations.list}?${params}`
    );
    if (response.data.success && response.data.data) {
      return {
        data: response.data.data.data,
        total: response.data.data.total,
        page: response.data.data.page,
        limit: response.data.data.limit,
      };
    }
    return { data: [], total: 0, page, limit };
  },

  getSavedNavigation: async (id: string | number): Promise<UserSavedNavigation> => {
    const response = await apiClient.get<NavigationResponse>(
      API_ENDPOINTS.personalized.savedNavigations.detail(id)
    );
    return response.data.data;
  },

  createSavedNavigation: async (
    data: CreateNavigationRequest
  ): Promise<UserSavedNavigation> => {
    const response = await apiClient.post<NavigationResponse>(
      API_ENDPOINTS.personalized.savedNavigations.list,
      data
    );
    return response.data.data;
  },

  updateSavedNavigation: async (
    id: string | number,
    data: UpdateNavigationRequest
  ): Promise<UserSavedNavigation> => {
    const response = await apiClient.put<NavigationResponse>(
      API_ENDPOINTS.personalized.savedNavigations.detail(id),
      data
    );
    return response.data.data;
  },

  deleteSavedNavigation: async (id: string | number): Promise<void> => {
    await apiClient.delete(API_ENDPOINTS.personalized.savedNavigations.detail(id));
  },
};
