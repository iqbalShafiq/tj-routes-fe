import {
  createRootRoute,
  Outlet,
  useRouterState,
  useLocation,
} from "@tanstack/react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "../lib/hooks/useAuth";
import { useNavigationLoading } from "../lib/hooks/useNavigationLoading";
import { AppLayout } from "../components/layout";
import { ProgressBar } from "../components/ui/ProgressBar";
import { ActiveCheckInBanner } from "../components/ActiveCheckInBanner";
import { trackLastVisitedPage } from "../lib/utils/navigation";
import { useEffect } from "react";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

function RootComponent() {
  const location = useLocation();
  const routerState = useRouterState();
  const { isNavigating, stopNavigation } = useNavigationLoading();
  const pathname = location.pathname;
  const isAuthPage = pathname.startsWith("/auth");
  // Check if the current route is the catch-all 404 route
  const is404Page = routerState.matches.some((match) => match.routeId === "/$");

  // Track last visited page for non-auth pages
  useEffect(() => {
    if (!isAuthPage && !is404Page) {
      trackLastVisitedPage(pathname);
    }
  }, [pathname, isAuthPage, is404Page]);

  // Stop navigation loading when route changes (for client-side navigation)
  useEffect(() => {
    if (isNavigating) {
      // Small delay to allow progress bar to complete
      const stopTimer = setTimeout(() => {
        stopNavigation();
      }, 500);
      return () => clearTimeout(stopTimer);
    }
  }, [pathname, isNavigating, stopNavigation]);

  // 404 pages get a wide, centered layout without sidebar
  if (is404Page) {
    return (
      <>
        <ProgressBar isActive={isNavigating} onComplete={stopNavigation} />
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <main className="w-full max-w-7xl mx-auto px-6 py-8">
            <Outlet />
          </main>
        </div>
      </>
    );
  }

  // Auth pages get a centered, clean layout
  if (isAuthPage) {
    return (
      <>
        <ProgressBar isActive={isNavigating} onComplete={stopNavigation} />
        <div className="min-h-screen bg-white flex items-center justify-center">
          <main className="w-full max-w-md mx-auto px-6 py-12">
            <Outlet />
          </main>
        </div>
      </>
    );
  }

  // All other pages get the sidebar layout
  return (
    <>
      <ProgressBar isActive={isNavigating} onComplete={stopNavigation} />
      <ActiveCheckInBanner />
      <AppLayout>
        <Outlet />
      </AppLayout>
    </>
  );
}

export const Route = createRootRoute({
  component: () => (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <RootComponent />
      </AuthProvider>
    </QueryClientProvider>
  ),
});
