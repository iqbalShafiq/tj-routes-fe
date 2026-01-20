// Automatically detect API base URL
// If accessed from mobile device, replace localhost with the current hostname
const getApiBaseUrl = (): string => {
  const envUrl = import.meta.env.VITE_API_BASE_URL;

  // If explicitly set in env, use it
  if (envUrl) {
    return envUrl;
  }

  // Default to localhost:8080
  const defaultUrl = "http://localhost:8080";
  const defaultPort = "8080";

  // If running in browser and not on localhost, replace localhost with current hostname
  if (typeof window !== "undefined") {
    const currentHost = window.location.hostname;
    // If accessing from a network IP (not localhost/127.0.0.1), use that IP for API too
    if (currentHost !== "localhost" && currentHost !== "127.0.0.1") {
      return `http://${currentHost}:${defaultPort}`;
    }
  }

  return defaultUrl;
};

export const API_BASE_URL = getApiBaseUrl();

export const API_ENDPOINTS = {
  auth: {
    login: "/api/v1/auth/login",
    register: "/api/v1/auth/register",
    oauth: (provider: string) => `/api/v1/auth/oauth/${provider}`,
    forgotPassword: "/api/v1/auth/forgot-password",
    resetPassword: "/api/v1/auth/reset-password",
    changePassword: "/api/v1/auth/change-password",
  },
  routes: {
    list: "/api/v1/routes",
    detail: (id: string | number) => `/api/v1/routes/${id}`,
    stops: (id: string | number) => `/api/v1/routes/${id}/stops`,
  },
  stops: {
    list: "/api/v1/stops",
    detail: (id: string | number) => `/api/v1/stops/${id}`,
  },
  vehicles: {
    list: "/api/v1/vehicles",
    detail: (id: string | number) => `/api/v1/vehicles/${id}`,
  },
  reports: {
    list: "/api/v1/reports",
    detail: (id: string | number) => `/api/v1/reports/${id}`,
    create: "/api/v1/reports",
    status: (id: string | number) => `/api/v1/reports/${id}/status`,
    comments: (id: string | number) => `/api/v1/reports/${id}/comments`,
    react: (id: string | number) => `/api/v1/reports/${id}/react`,
    feed: "/api/v1/reports/feed",
    trending: "/api/v1/reports/trending",
    stories: "/api/v1/reports/stories",
  },
  hashtags: {
    trending: "/api/v1/hashtags/trending",
    search: "/api/v1/hashtags/search",
    reports: (name: string) => `/api/v1/hashtags/${name}/reports`,
  },
  comments: {
    detail: (id: string | number) => `/api/v1/comments/${id}`,
    react: (id: string | number) => `/api/v1/comments/${id}/react`,
  },
  users: {
    list: "/api/v1/users",
    detail: (id: string | number) => `/api/v1/users/${id}`,
    role: (id: string | number) => `/api/v1/users/${id}/role`,
    profile: (id: string | number) => `/api/v1/users/${id}/profile`,
    follow: (id: string | number) => `/api/v1/users/${id}/follow`,
    followStatus: (id: string | number) => `/api/v1/users/${id}/follow-status`,
    followers: (id: string | number) => `/api/v1/users/${id}/followers`,
    following: (id: string | number) => `/api/v1/users/${id}/following`,
  },
  leaderboard: "/api/v1/leaderboard",
  badges: "/api/v1/badges",
  bulkUpload: {
    upload: (entityType: string) => `/api/v1/bulk-upload/${entityType}`,
    status: (id: string | number) => `/api/v1/bulk-upload/${id}`,
    list: "/api/v1/bulk-upload",
  },
  forums: {
    byRoute: (routeId: string | number) => `/api/v1/routes/${routeId}/forum`,
    detail: (id: string | number) => `/api/v1/forums/${id}`,
    join: (id: string | number) => `/api/v1/forums/${id}/join`,
    leave: (id: string | number) => `/api/v1/forums/${id}/leave`,
    membership: (id: string | number) => `/api/v1/forums/${id}/membership`,
    members: (id: string | number) => `/api/v1/forums/${id}/members`,
    posts: (id: string | number) => `/api/v1/forums/${id}/posts`,
    postDetail: (forumId: string | number, postId: string | number) =>
      `/api/v1/forums/${forumId}/posts/${postId}`,
    pinPost: (forumId: string | number, postId: string | number) =>
      `/api/v1/forums/${forumId}/posts/${postId}/pin`,
  },
  forumPosts: {
    comments: (id: string | number) => `/api/v1/forum-posts/${id}/comments`,
    react: (id: string | number) => `/api/v1/forum-posts/${id}/react`,
  },
  checkins: {
    list: "/api/v1/check-ins",
    detail: (id: string | number) => `/api/v1/check-ins/${id}`,
    create: "/api/v1/check-ins",
    complete: (id: string | number) => `/api/v1/check-ins/${id}/complete`,
    stats: "/api/v1/check-ins/stats",
  },
  personalized: {
    favorites: {
      routes: "/api/v1/users/me/personalized/favorites/routes",
      route: (id: string | number) => `/api/v1/users/me/personalized/favorites/routes/${id}`,
      stops: "/api/v1/users/me/personalized/favorites/stops",
      stop: (id: string | number) => `/api/v1/users/me/personalized/favorites/stops/${id}`,
    },
    places: {
      list: "/api/v1/users/me/personalized/places",
      detail: (id: string | number) => `/api/v1/users/me/personalized/places/${id}`,
    },
    recent: {
      routes: "/api/v1/users/me/personalized/recent/routes",
      stops: "/api/v1/users/me/personalized/recent/stops",
      navigations: "/api/v1/users/me/personalized/recent/navigations",
    },
    savedNavigations: {
      list: "/api/v1/users/me/personalized/saved-navigations",
      detail: (id: string | number) => `/api/v1/users/me/personalized/saved-navigations/${id}`,
    },
  },
} as const;

export const STORAGE_KEYS = {
  AUTH_TOKEN: "auth_token",
  REFRESH_TOKEN: "refresh_token",
  USER: "user",
  THEME: "theme",
} as const;

export const REPORT_TYPES = [
  { value: "route_issue", label: "Route Issue" },
  { value: "stop_issue", label: "Stop Issue" },
  { value: "temporary_event", label: "Temporary Event" },
  { value: "policy_change", label: "Policy Change" },
] as const;

export const REPORT_STATUSES = [
  { value: "pending", label: "Pending", color: "amber" },
  { value: "reviewed", label: "Reviewed", color: "blue" },
  { value: "resolved", label: "Resolved", color: "emerald" },
] as const;

export const USER_LEVELS = [
  { value: "newcomer", label: "Newcomer", minPoints: 0 },
  { value: "contributor", label: "Contributor", minPoints: 50 },
  { value: "trusted", label: "Trusted", minPoints: 200 },
  { value: "expert", label: "Expert", minPoints: 500 },
  { value: "legend", label: "Legend", minPoints: 1000 },
] as const;

export const FORUM_POST_TYPES = [
  { value: "discussion", label: "Discussion", icon: "discussion" },
  { value: "info", label: "Info", icon: "info" },
  { value: "question", label: "Question", icon: "question" },
  { value: "announcement", label: "Announcement", icon: "announcement" },
] as const;

export const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8080/api/v1/ws';
export const FORUM_WS_URL_PATTERN = 'ws://localhost:8080/api/v1/ws/forum/:forumId';
export const WS_RECONNECT_DELAY = 1000;
export const WS_MAX_RECONNECT_ATTEMPTS = 5;
export const WS_MESSAGE_QUEUE_LIMIT = 100;
export const WS_TYPING_DEBOUNCE_MS = 500;
