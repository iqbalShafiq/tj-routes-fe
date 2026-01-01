import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { useRoute } from '../../../../../lib/hooks/useRoutes';
import { useForumByRoute } from '../../../../../lib/hooks/useForums';
import { useForumPost, useUpdateForumPost, useDeleteForumPost, usePinForumPost, useUnpinForumPost } from '../../../../../lib/hooks/useForumPosts';
import { useAuth } from '../../../../../lib/hooks/useAuth';
import { Loading } from '../../../../../components/ui/Loading';
import { Button } from '../../../../../components/ui/Button';
import { PageHeader } from '../../../../../components/layout';
import { ForumPostDetail } from '../../../../../components/ForumPostDetail';
import { CreateForumPostForm } from '../../../../../components/CreateForumPostForm';
import { useState } from 'react';

export const Route = createFileRoute('/routes/$routeId/forum/posts/$postId')({
  component: ForumPostDetailPage,
});

function ForumPostDetailPage() {
  const { routeId, postId } = Route.useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);

  const { data: route } = useRoute(routeId);
  const { data: forumData } = useForumByRoute(routeId);
  const { data: post, isLoading, error } = useForumPost(
    forumData?.forum.id || 0,
    postId
  );
  const updateMutation = useUpdateForumPost();
  const deleteMutation = useDeleteForumPost();
  const pinMutation = usePinForumPost();
  const unpinMutation = useUnpinForumPost();

  const handleEdit = (post: any) => {
    setIsEditing(true);
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
      pinMutation.mutate({ forumId: forumData.forum.id, postId });
    }
  };

  const handleUnpin = (postId: number) => {
    if (forumData?.forum.id) {
      unpinMutation.mutate({ forumId: forumData.forum.id, postId });
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

  const routeName = `${route.route_number} - ${route.name}`;

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

      {isEditing && user?.id === post.user_id ? (
        <div className="mb-6">
          <CreateForumPostForm
            forumId={forumData.forum.id}
            initialData={{
              post_type: post.post_type,
              title: post.title,
              content: post.content,
              linked_report_id: post.linked_report_id,
            }}
            onSuccess={() => {
              setIsEditing(false);
            }}
            onCancel={() => setIsEditing(false)}
          />
        </div>
      ) : (
        <ForumPostDetail
          post={post}
          forumId={forumData.forum.id}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onPin={handlePin}
          onUnpin={handleUnpin}
        />
      )}
    </div>
  );
}

