export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

export const API_ENDPOINTS = {
  auth: {
    login: '/api/v1/auth/login',
    register: '/api/v1/auth/register',
    oauth: (provider: string) => `/api/v1/auth/oauth/${provider}`,
  },
  routes: {
    list: '/api/v1/routes',
    detail: (id: string | number) => `/api/v1/routes/${id}`,
    stops: (id: string | number) => `/api/v1/routes/${id}/stops`,
  },
  stops: {
    list: '/api/v1/stops',
    detail: (id: string | number) => `/api/v1/stops/${id}`,
  },
  vehicles: {
    list: '/api/v1/vehicles',
    detail: (id: string | number) => `/api/v1/vehicles/${id}`,
  },
  reports: {
    list: '/api/v1/reports',
    detail: (id: string | number) => `/api/v1/reports/${id}`,
    create: '/api/v1/reports',
    status: (id: string | number) => `/api/v1/reports/${id}/status`,
    comments: (id: string | number) => `/api/v1/reports/${id}/comments`,
    react: (id: string | number) => `/api/v1/reports/${id}/react`,
  },
  comments: {
    detail: (id: string | number) => `/api/v1/comments/${id}`,
    react: (id: string | number) => `/api/v1/comments/${id}/react`,
  },
  users: {
    list: '/api/v1/users',
    detail: (id: string | number) => `/api/v1/users/${id}`,
    role: (id: string | number) => `/api/v1/users/${id}/role`,
    profile: (id: string | number) => `/api/v1/users/${id}/profile`,
  },
  leaderboard: '/api/v1/leaderboard',
  badges: '/api/v1/badges',
  bulkUpload: {
    upload: (entityType: string) => `/api/v1/bulk-upload/${entityType}`,
    status: (id: string | number) => `/api/v1/bulk-upload/${id}`,
    list: '/api/v1/bulk-upload',
  },
} as const;

export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  REFRESH_TOKEN: 'refresh_token',
  USER: 'user',
} as const;

export const REPORT_TYPES = [
  { value: 'route_issue', label: 'Route Issue' },
  { value: 'stop_issue', label: 'Stop Issue' },
  { value: 'temporary_event', label: 'Temporary Event' },
  { value: 'policy_change', label: 'Policy Change' },
] as const;

export const REPORT_STATUSES = [
  { value: 'pending', label: 'Pending', color: 'amber' },
  { value: 'reviewed', label: 'Reviewed', color: 'blue' },
  { value: 'resolved', label: 'Resolved', color: 'emerald' },
] as const;

export const USER_LEVELS = [
  { value: 'newcomer', label: 'Newcomer', minPoints: 0 },
  { value: 'contributor', label: 'Contributor', minPoints: 50 },
  { value: 'trusted', label: 'Trusted', minPoints: 200 },
  { value: 'expert', label: 'Expert', minPoints: 500 },
  { value: 'legend', label: 'Legend', minPoints: 1000 },
] as const;
