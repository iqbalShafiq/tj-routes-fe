import { createRootRoute, Outlet, useRouterState } from '@tanstack/react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '../lib/hooks/useAuth';
import { AppLayout } from '../components/layout';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

function RootComponent() {
  const routerState = useRouterState();
  const isAuthPage = routerState.location.pathname.startsWith('/auth');

  if (isAuthPage) {
    // Auth pages get a centered, clean layout
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <main className="w-full max-w-md mx-auto px-6 py-12">
          <Outlet />
        </main>
      </div>
    );
  }

  // All other pages get the sidebar layout
  return (
    <AppLayout>
      <Outlet />
    </AppLayout>
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
