import { createFileRoute, redirect } from '@tanstack/react-router';
import { RouteErrorComponent } from '../components/RouteErrorComponent';

export const Route = createFileRoute('/')({
  beforeLoad: async ({ location }) => {
    // Don't redirect for /chat routes
    const pathname = location.pathname;
    if (pathname.startsWith('/chat')) {
      return;
    }
    throw redirect({ to: '/feed' });
  },
  errorComponent: RouteErrorComponent,
});
