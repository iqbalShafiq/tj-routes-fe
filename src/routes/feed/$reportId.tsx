import { useState, useEffect } from 'react';
import { createFileRoute, Link, redirect } from '@tanstack/react-router';
import { useReport, useComments, useCreateComment, useReactToReport, useReactToComment, reportKeys } from '../../lib/hooks/useReports';
import { commentKeys } from '../../lib/hooks/useComments';
import { useAuth } from '../../lib/hooks/useAuth';
import { authApi } from '../../lib/api/auth';
import { reportsApi } from '../../lib/api/reports';
import { commentsApi } from '../../lib/api/comments';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { Chip } from '../../components/ui/Chip';
import { Loading, Skeleton } from '../../components/ui/Loading';
import { PageHeader } from '../../components/layout';
import { ImageViewer } from '../../components/ui/ImageViewer';
import { format, formatDistanceToNow } from 'date-fns';
import type { Comment } from '../../lib/api/comments';
import { REPORT_TYPES, REPORT_STATUSES } from '../../lib/utils/constants';
import { RouteErrorComponent } from '../../components/RouteErrorComponent';
import { ReportDetailSidebar } from '../../components/feed/ReportDetailSidebar';

export const Route = createFileRoute('/feed/$reportId')({
  beforeLoad: async () => {
    if (!authApi.isAuthenticated()) {
      throw redirect({ to: '/auth/login' });
    }
  },
  loader: async ({ context, params }) => {
    const { queryClient } = context;
    const reportId = params.reportId;

    // Prefetch report and comments concurrently
    await Promise.all([
      queryClient.ensureQueryData({
        queryKey: reportKeys.detail(reportId),
        queryFn: () => reportsApi.getReport(reportId),
      }),
      queryClient.ensureQueryData({
        queryKey: commentKeys.report(reportId),
        queryFn: () => commentsApi.getComments(reportId),
      }),
    ]);

    return { reportId };
  },
  component: ReportDetailPage,
  errorComponent: RouteErrorComponent,
  pendingComponent: () => (
    <div className="animate-fade-in">
      <PageHeader title="Loading..." />
      <div className="space-y-4">
        <Skeleton className="h-64 card-chamfered" />
        <Skeleton className="h-32 card-chamfered" />
        <Skeleton className="h-48 card-chamfered" />
      </div>
    </div>
  ),
});

function CommentItem({
  comment,
  reportId,
  depth = 0
}: {
  comment: Comment;
  reportId: string;
  depth?: number;
}) {
  const { isAuthenticated } = useAuth();
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [animatingReaction, setAnimatingReaction] = useState<'upvote' | 'downvote' | null>(null);
  const createComment = useCreateComment();
  const reactMutation = useReactToComment();

  // Clear animation state after animation completes
  useEffect(() => {
    if (animatingReaction) {
      const timer = setTimeout(() => setAnimatingReaction(null), 300);
      return () => clearTimeout(timer);
    }
  }, [animatingReaction]);

  const handleReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyContent.trim()) return;

    createComment.mutate(
      { reportId, data: { content: replyContent, parent_id: comment.id } },
      {
        onSuccess: () => {
          setReplyContent('');
          setShowReplyForm(false);
        },
      }
    );
  };

  const handleReaction = (type: 'upvote' | 'downvote') => {
    if (!isAuthenticated) return;
    setAnimatingReaction(type);
    reactMutation.mutate({ commentId: comment.id, type, reportId });
  };

  return (
    <div className={`${depth > 0 ? 'ml-8 border-l-2 border-border pl-4' : ''}`}>
      <div className="py-4">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
            {comment.user?.username?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Link
                to="/profile/$userId"
                params={{ userId: String(comment.user_id) }}
                className="font-medium text-text-primary hover:text-accent text-sm"
              >
                {comment.user?.username || 'Anonymous'}
              </Link>
              <span className="text-xs text-text-muted">
                {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
              </span>
            </div>
            <p className="text-text-secondary text-sm">{comment.content}</p>
            
            <div className="flex items-center gap-4 mt-2">
              <button
                onClick={() => handleReaction('upvote')}
                disabled={!isAuthenticated}
                className={`flex items-center gap-1 text-xs transition-all duration-200 disabled:opacity-50 ${
                  animatingReaction === 'upvote'
                    ? 'animate-reaction-pulse text-accent'
                    : comment.user_reaction === 'upvote'
                    ? 'text-accent'
                    : 'text-text-muted hover:text-accent'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                </svg>
                {comment.upvotes}
              </button>
              <button
                onClick={() => handleReaction('downvote')}
                disabled={!isAuthenticated}
                className={`flex items-center gap-1 text-xs transition-all duration-200 disabled:opacity-50 ${
                  animatingReaction === 'downvote'
                    ? 'animate-reaction-pulse text-error'
                    : comment.user_reaction === 'downvote'
                    ? 'text-error'
                    : 'text-text-muted hover:text-error'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
                {comment.downvotes}
              </button>
              {depth < 2 && isAuthenticated && (
                <button
                  onClick={() => setShowReplyForm(!showReplyForm)}
                  className="text-xs text-text-muted hover:text-accent"
                >
                  Reply
                </button>
              )}
            </div>

            {showReplyForm && (
              <form onSubmit={handleReply} className="mt-3 flex gap-2">
                <Input
                  type="text"
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder="Write a reply..."
                  className="flex-1 text-sm"
                />
                <Button type="submit" size="sm" variant="primary" disabled={createComment.isPending}>
                  Reply
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
      
      {/* Nested replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div>
          {comment.replies.map((reply) => (
            <CommentItem key={reply.id} comment={reply} reportId={reportId} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

function ReportDetailPage() {
  const { reportId } = Route.useParams();
  const { isAuthenticated } = useAuth();
  const [newComment, setNewComment] = useState('');
  const [animatingReaction, setAnimatingReaction] = useState<'upvote' | 'downvote' | null>(null);
  const [isImageViewerOpen, setIsImageViewerOpen] = useState(false);
  const [viewerInitialIndex, setViewerInitialIndex] = useState(0);

  const { data: report, isLoading: reportLoading, error: reportError } = useReport(reportId);
  const { data: comments, isLoading: commentsLoading } = useComments(reportId);
  const createComment = useCreateComment();
  const reactMutation = useReactToReport();

  // Clear animation state after animation completes
  useEffect(() => {
    if (animatingReaction) {
      const timer = setTimeout(() => setAnimatingReaction(null), 300);
      return () => clearTimeout(timer);
    }
  }, [animatingReaction]);

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    createComment.mutate(
      { reportId, data: { content: newComment } },
      {
        onSuccess: () => setNewComment(''),
      }
    );
  };

  const handleReaction = (type: 'upvote' | 'downvote') => {
    if (!isAuthenticated) return;
    setAnimatingReaction(type);
    reactMutation.mutate({ reportId, type });
  };

  if (reportLoading) {
    return <Loading />;
  }

  if (reportError || !report) {
    return (
      <div className="text-center py-20 animate-fade-in">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 mb-4 card-chamfered">
          <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="text-red-600 font-display text-lg mb-2">Report not found</p>
        <Link to="/feed">
          <Button variant="outline">Back to Feed</Button>
        </Link>
      </div>
    );
  }

  const typeInfo = REPORT_TYPES.find(t => t.value === report.type);
  const statusInfo = REPORT_STATUSES.find(s => s.value === report.status);

  const getStatusVariant = (color?: string): 'warning' | 'info' | 'success' | 'default' => {
    switch (color) {
      case 'amber': return 'warning';
      case 'blue': return 'info';
      case 'emerald': return 'success';
      default: return 'default';
    }
  };

  return (
    <div className="animate-fade-in">
      <PageHeader
        title=""
        breadcrumbs={[
          { label: 'Feed', path: '/feed' },
          { label: report.title },
        ]}
      />

      {/* Two-column grid: main content + right sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-6 lg:gap-8">
        {/* Main Content Column */}
        <div className="min-w-0">
          <Card className="mb-6">
        {/* Author */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center text-white font-bold text-lg">
            {report.user?.username?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div>
            <Link
              to="/profile/$userId"
              params={{ userId: String(report.user_id) }}
              className="font-medium text-text-primary hover:text-accent"
            >
              {report.user?.username || 'Anonymous'}
            </Link>
            <p className="text-sm text-text-muted">
              {format(new Date(report.created_at), 'PPp')}
            </p>
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          <Chip variant={getStatusVariant(statusInfo?.color)}>
            {statusInfo?.label || report.status}
          </Chip>
          <Chip variant="default">
            {typeInfo?.label || report.type}
          </Chip>
        </div>

        {/* Title & Description */}
        <h1 className="text-2xl font-display font-bold text-text-primary mb-4">{report.title}</h1>
        <p className="text-text-secondary leading-relaxed mb-6 whitespace-pre-wrap">{report.description}</p>

        {/* Images */}
        {report.photo_urls && report.photo_urls.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-6">
            {report.photo_urls.map((url, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setViewerInitialIndex(idx);
                  setIsImageViewerOpen(true);
                }}
                className="w-full cursor-zoom-in focus:outline-none focus:ring-2 focus:ring-accent rounded-sm overflow-hidden"
                aria-label={`View image ${idx + 1} fullscreen`}
              >
                <img
                  src={url}
                  alt={`Report image ${idx + 1}`}
                  className="w-full h-40 object-cover rounded-sm hover:opacity-90 transition-opacity"
                />
              </button>
            ))}
          </div>
        )}

        {/* PDFs */}
        {report.pdf_urls && report.pdf_urls.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {report.pdf_urls.map((url, idx) => (
              <a
                key={idx}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3 py-2 bg-bg-elevated hover:bg-border rounded-sm transition-colors"
              >
                <svg className="w-5 h-5 text-error" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm4 18H6V4h7v5h5v11z"/>
                </svg>
                <span className="text-sm text-text-secondary">Document {idx + 1}</span>
              </a>
            ))}
          </div>
        )}

        {/* Related info */}
        {(report.route || report.stop) && (
          <div className="p-4 bg-bg-main rounded-sm mb-6">
            <p className="text-xs text-text-muted uppercase tracking-wider mb-2">Related to</p>
            <div className="flex flex-wrap gap-3">
              {report.route && (
                <Link
                  to="/routes/$routeId"
                  params={{ routeId: String(report.related_route_id) }}
                  className="inline-flex items-center gap-2 text-tertiary hover:text-tertiary-hover"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                  Route {report.route.route_number}: {report.route.name}
                </Link>
              )}
              {report.stop && (
                <span className="inline-flex items-center gap-2 text-text-secondary">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  </svg>
                  {report.stop.name}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Admin notes */}
        {report.admin_notes && (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-sm mb-6">
            <p className="text-xs text-blue-600 uppercase tracking-wider mb-1">Admin Response</p>
            <p className="text-blue-900">{report.admin_notes}</p>
          </div>
        )}

        {/* Reactions */}
        <div className="flex items-center gap-4 sm:gap-6 pt-4 border-t border-border">
          <button
            onClick={() => handleReaction('upvote')}
            disabled={!isAuthenticated || reactMutation.isPending}
            className={`flex items-center gap-2 transition-all duration-200 disabled:opacity-50 ${
              animatingReaction === 'upvote'
                ? 'animate-reaction-pulse text-accent'
                : report.user_reaction === 'upvote'
                ? 'text-accent'
                : 'text-text-muted hover:text-accent'
            }`}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
            <span className="font-medium hidden sm:inline">{report.upvotes} Upvotes</span>
            <span className="font-medium sm:hidden">{report.upvotes}</span>
          </button>
          <button
            onClick={() => handleReaction('downvote')}
            disabled={!isAuthenticated || reactMutation.isPending}
            className={`flex items-center gap-2 transition-all duration-200 disabled:opacity-50 ${
              animatingReaction === 'downvote'
                ? 'animate-reaction-pulse text-error'
                : report.user_reaction === 'downvote'
                ? 'text-error'
                : 'text-text-muted hover:text-error'
            }`}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
            <span className="font-medium hidden sm:inline">{report.downvotes} Downvotes</span>
            <span className="font-medium sm:hidden">{report.downvotes}</span>
          </button>
          <span className="flex items-center gap-2 text-text-muted">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <span className="hidden sm:inline">{report.comment_count} Comments</span>
            <span className="sm:hidden">{report.comment_count}</span>
          </span>
        </div>
      </Card>

      {/* Comment Input */}
      {isAuthenticated && (
        <Card className="mb-6">
          <h2 className="text-lg font-display font-semibold text-text-primary mb-4">Add a Comment</h2>
          <form onSubmit={handleSubmitComment}>
            <Textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Share your thoughts..."
              rows={2}
            />
            <div className="flex justify-end mt-2">
              <Button type="submit" variant="primary" disabled={createComment.isPending || !newComment.trim()}>
                {createComment.isPending ? 'Posting...' : 'Post Comment'}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Comments Section */}
        <Card static>
          <h2 className="text-lg font-display font-semibold text-text-primary mb-4">Comments</h2>

          {commentsLoading ? (
            <div className="py-8 text-center text-text-muted">Loading comments...</div>
          ) : comments && comments.length > 0 ? (
            <div className="divide-y divide-border">
              {comments.map((comment) => (
                <CommentItem key={comment.id} comment={comment} reportId={reportId} />
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-text-muted">
              <p>No comments yet. Be the first to comment!</p>
            </div>
          )}
        </Card>
      </div>

      {/* Right Sidebar Column */}
      <ReportDetailSidebar report={report} />
      </div>

      {/* Image Viewer Portal */}
      {report.photo_urls && (
        <ImageViewer
          images={report.photo_urls.map((url) => ({ url, alt: report.title }))}
          initialIndex={viewerInitialIndex}
          isOpen={isImageViewerOpen}
          onClose={() => setIsImageViewerOpen(false)}
        />
      )}
    </div>
  );
}

