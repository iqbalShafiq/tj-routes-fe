/**
 * Utility functions for navigation tracking
 */

const LAST_VISITED_PAGE_KEY = 'tj-last-visited-page';

/**
 * Stores the last visited page (excluding auth pages)
 * @param pathname - The current pathname
 */
export const trackLastVisitedPage = (pathname: string): void => {
  // Don't track auth pages or the root redirect
  if (pathname.startsWith('/auth') || pathname === '/') {
    return;
  }
  
  // Store in sessionStorage (clears when browser tab closes)
  if (typeof window !== 'undefined') {
    sessionStorage.setItem(LAST_VISITED_PAGE_KEY, pathname);
  }
};

/**
 * Gets the last visited page
 * @returns The last visited page path or null if none exists
 */
export const getLastVisitedPage = (): string | null => {
  if (typeof window !== 'undefined') {
    return sessionStorage.getItem(LAST_VISITED_PAGE_KEY);
  }
  return null;
};

/**
 * Clears the last visited page from storage
 */
export const clearLastVisitedPage = (): void => {
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem(LAST_VISITED_PAGE_KEY);
  }
};

