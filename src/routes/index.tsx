import { createFileRoute, redirect } from '@tanstack/react-router';
import { RouteErrorComponent } from '../components/RouteErrorComponent';

export const Route = createFileRoute('/')({
  beforeLoad: () => {
    throw redirect({ to: '/feed' });
  },
  errorComponent: RouteErrorComponent,
});
