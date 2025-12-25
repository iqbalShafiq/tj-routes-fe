import { useState, useEffect, useCallback } from 'react';

const NAVIGATION_FLAG_KEY = 'tj-navigating-to-auth';

export const useNavigationLoading = () => {
  const [isNavigating, setIsNavigating] = useState(false);

  // Check for existing navigation flag on mount
  useEffect(() => {
    const flag = sessionStorage.getItem(NAVIGATION_FLAG_KEY);
    if (flag === 'true') {
      setIsNavigating(true);
    }
  }, []);

  const startNavigation = useCallback(() => {
    setIsNavigating(true);
    sessionStorage.setItem(NAVIGATION_FLAG_KEY, 'true');
  }, []);

  const stopNavigation = useCallback(() => {
    setIsNavigating(false);
    sessionStorage.removeItem(NAVIGATION_FLAG_KEY);
  }, []);

  return {
    isNavigating,
    startNavigation,
    stopNavigation,
  };
};

