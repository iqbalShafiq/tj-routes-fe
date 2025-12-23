import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authApi } from '../api/auth';
import type { AuthResponse } from '../api/auth';

export type UserRole = 'common_user' | 'admin';
export type UserLevel = 'newcomer' | 'contributor' | 'trusted' | 'expert' | 'legend';

export interface User {
  id: number;
  email: string;
  username: string;
  role: UserRole;
  reputation_points?: number;
  level?: UserLevel;
  oauth_provider?: string | null;
  created_at?: string;
  updated_at?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  initiateOAuth: (provider?: string) => void;
  updateUser: (user: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const currentUser = authApi.getCurrentUser();
    setUser(currentUser);
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const response: AuthResponse = await authApi.login({ email, password });
    if (response.success && response.data.user) {
      setUser(response.data.user as User);
    }
  };

  const register = async (email: string, password: string, name: string) => {
    const response: AuthResponse = await authApi.register({ email, password, name });
    if (response.success && response.data.user) {
      setUser(response.data.user as User);
    }
  };

  const logout = () => {
    authApi.logout();
    setUser(null);
  };

  const initiateOAuth = (provider: string = 'google') => {
    authApi.initiateOAuth(provider);
  };

  const updateUser = (updates: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      // Also update in localStorage
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };

  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        isAdmin,
        login,
        register,
        logout,
        initiateOAuth,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
