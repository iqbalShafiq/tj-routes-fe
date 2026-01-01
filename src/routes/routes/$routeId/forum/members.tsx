import { useState } from 'react';
import { createFileRoute, Link } from '@tanstack/react-router';
import { useRoute } from '../../../../lib/hooks/useRoutes';
import { useForumByRoute, useForumMembers } from '../../../../lib/hooks/useForums';
import { Loading } from '../../../../components/ui/Loading';
import { Button } from '../../../../components/ui/Button';
import { PageHeader } from '../../../../components/layout';
import { ForumMembersList } from '../../../../components/ForumMembersList';

export const Route = createFileRoute('/routes/$routeId/forum/members')({
  component: ForumMembersPage,
});

function ForumMembersPage() {
  const { routeId } = Route.useParams();
  const [page, setPage] = useState(1);
  const limit = 20;

  const { data: route, isLoading: routeLoading } = useRoute(routeId);
  const { data: forumData, isLoading: forumLoading } = useForumByRoute(routeId);
  const { data: membersData, isLoading: membersLoading } = useForumMembers(
    forumData?.forum.id || 0,
    page,
    limit
  );

  if (routeLoading || forumLoading) {
    return <Loading />;
  }

  if (!route || !forumData) {
    return (
      <div className="text-center py-20 animate-fade-in">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 mb-4 card-chamfered">
          <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="text-red-600 font-display text-lg mb-2">Error loading forum</p>
        <Link to="/routes/$routeId" params={{ routeId }}>
          <Button variant="outline">Back to Route</Button>
        </Link>
      </div>
    );
  }

  const routeName = `${route.route_number} - ${route.name}`;

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Forum Members"
        subtitle={`Members of ${routeName} forum`}
        breadcrumbs={[
          { label: 'Routes', path: '/' },
          { label: route.route_number || String(route.id), path: `/routes/${routeId}` },
          { label: 'Forum', path: `/routes/${routeId}/forum` },
          { label: 'Members' },
        ]}
        actions={
          <Link to="/routes/$routeId/forum" params={{ routeId }}>
            <Button variant="outline">Back to Forum</Button>
          </Link>
        }
      />

      {membersLoading ? (
        <Loading />
      ) : membersData ? (
        <ForumMembersList
          members={membersData.data}
          total={membersData.total}
          page={membersData.page}
          limit={membersData.limit}
          onPageChange={setPage}
        />
      ) : (
        <div className="text-center py-20">
          <p className="text-slate-600">Error loading members</p>
        </div>
      )}
    </div>
  );
}

