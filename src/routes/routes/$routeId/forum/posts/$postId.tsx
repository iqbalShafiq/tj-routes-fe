import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { useRoute } from '../../../../../lib/hooks/useRoutes';
import { useForumByRoute, forumKeys } from '../../../../../lib/hooks/useForums';
import { useForumPost, useUpdateForumPost, useDeleteForumPost, usePinForumPost, useUnpinForumPost, forumPostKeys } from '../../../../../lib/hooks/useForumPosts';
import { useAuth } from '../../../../../lib/hooks/useAuth';
import { Loading, Skeleton } from '../../../../../components/ui/Loading';
import { Button } from '../../../../../components/ui/Button';
import { PageHeader } from '../../../../../components/layout';
import { ForumPostDetail } from '../../../../../components/ForumPostDetail';
import { CreateForumPostForm } from '../../../../../components/CreateForumPostModal';
import { Modal } from '../../../../../components/ui/Modal';
import { RouteErrorComponent } from '../../../../../components/RouteErrorComponent';
import { forumsApi } from '../../../../../lib/api/forums';
import { forumPostsApi } from '../../../../../lib/api/forum-posts';
import { ForumSidebar } from '../../../../../components/forum/ForumSidebar';

export const Route = createFileRoute('/routes/$routeId/forum/posts/$postId')({
  loader: async ({ context, params }) => {
    const { queryClient } = context;
    const { routeId, postId } = params;

    // First, fetch the forum by route to get the forumId
    const forumData = await queryClient.ensureQueryData({
      queryKey: forumKeys.byRoute(routeId),
      queryFn: () => forumsApi.getForumByRoute(routeId),
    });

    // Then, fetch the forum post using the forumId
    if (forumData?.forum?.id) {
      await queryClient.ensureQueryData({
        queryKey: forumPostKeys.detail(forumData.forum.id, postId),
        queryFn: () => forumPostsApi.getForumPost(forumData.forum.id, postId),
      });
    }

    return { routeId, postId };
  },
  component: ForumPostDetailPage,
  errorComponent: RouteErrorComponent,
  pendingComponent: () => (
    <div className="animate-fade-in">
      <PageHeader title="Loading post..." />
      <div className="space-y-4">
        <Skeleton className="h-64 card-chamfered" />
        <Skeleton className="h-48 card-chamfered" />
      </div>
    </div>
  ),
});

function ForumPostDetailPage() {
  const { routeId, postId } = Route.useParams();
  const navigate = useNavigate();
  const search = Route.useSearch();
  const { user } = useAuth();

  const { data: route } = useRoute(routeId);
  const { data: forumData } = useForumByRoute(routeId);
  const { data: post, isLoading, error } = useForumPost(
    forumData?.forum.id || 0,
    postId
  );
  const deleteMutation = useDeleteForumPost();
  const pinMutation = usePinForumPost();
  const unpinMutation = useUnpinForumPost();

  // Check if edit modal should be open (account for URL-encoded quotes)
  const isEditModalOpen = (search.edit === 'true' || search.edit === '"true"') && user?.id === post?.user_id;

  const handleEdit = () => {
    // Navigate with edit=true query parameter
    navigate({
      to: '/routes/$routeId/forum/posts/$postId',
      params: { routeId, postId },
      search: { edit: 'true' },
    });
  };

  const handleCloseEditModal = () => {
    // Navigate to remove edit query parameter
    navigate({
      to: '/routes/$routeId/forum/posts/$postId',
      params: { routeId, postId },
      search: { edit: undefined },
    });
  };

  const handleDelete = (postId: number) => {
    if (confirm('Are you sure you want to delete this post?')) {
      if (forumData?.forum.id) {
        deleteMutation.mutate(
          { forumId: forumData.forum.id, postId },
          {
            onSuccess: () => {
              navigate({
                to: '/routes/$routeId/forum',
                params: { routeId },
              });
            },
          }
        );
      }
    }
  };

  const handlePin = (postId: number) => {
    if (forumData?.forum.id) {
      pinMutation.mutate({ forumId: forumData.forum.id, postId: String(postId) });
    }
  };

  const handleUnpin = (postId: number) => {
    if (forumData?.forum.id) {
      unpinMutation.mutate({ forumId: forumData.forum.id, postId: String(postId) });
    }
  };

  if (isLoading) {
    return <Loading />;
  }

  if (error || !post || !route || !forumData) {
    return (
      <div className="text-center py-20 animate-fade-in">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 mb-4 card-chamfered">
          <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="text-red-600 font-display text-lg mb-2">Post not found</p>
        <Link to="/routes/$routeId/forum" params={{ routeId }}>
          <Button variant="outline">Back to Forum</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <PageHeader
        title=""
        breadcrumbs={[
          { label: 'Routes', path: '/' },
          { label: route.route_number || String(route.id), path: `/routes/${routeId}` },
          { label: 'Forum', path: `/routes/${routeId}/forum` },
          { label: post.title },
        ]}
        actions={
          <Link to="/routes/$routeId/forum" params={{ routeId }}>
            <Button variant="outline">Back to Forum</Button>
          </Link>
        }
      />

      {/* Edit Modal */}
      {isEditModalOpen && (
        <Modal
          isOpen={true}
          onClose={handleCloseEditModal}
          title="Edit Post"
          size="lg"
        >
          <CreateForumPostForm
            forumId={forumData.forum.id}
            postId={post.id}
            isEditing={true}
            initialData={{
              post_type: post.post_type,
              title: post.title,
              content: post.content,
              linked_report_id: post.linked_report_id,
            }}
            initialPhotos={Array.isArray(post.photo_urls) ? post.photo_urls : []}
            initialPdfs={Array.isArray(post.pdf_urls) ? post.pdf_urls : []}
            onSuccess={handleCloseEditModal}
            onCancel={handleCloseEditModal}
          />
        </Modal>
      )}

      {/* Main content with sidebar */}
      <div className="lg:grid lg:grid-cols-[1fr_360px] lg:gap-8">
        <ForumPostDetail
          post={post}
          forumId={forumData.forum.id}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onPin={handlePin}
          onUnpin={handleUnpin}
        />

        {/* Sidebar with author profile */}
        <ForumSidebar
          routeId={routeId}
          showAuthorProfile={true}
          authorUserId={post.user_id}
          excludePostId={post.id}
        />
      </div>
    </div>
  );
}

