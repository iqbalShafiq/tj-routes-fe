import { useState } from 'react';
import { Link } from '@tanstack/react-router';
import { format, formatDistanceToNow } from 'date-fns';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Textarea } from './ui/Textarea';
import { Chip } from './ui/Chip';
import { Loading } from './ui/Loading';
import { useAuth } from '../lib/hooks/useAuth';
import { useForumPostComments, useCreateForumPostComment } from '../lib/hooks/useComments';
import { useReactToForumPost, useRemoveForumPostReaction, useReactToForumPostComment, useRemoveForumPostCommentReaction } from '../lib/hooks/useReactions';
import { FORUM_POST_TYPES } from '../lib/utils/constants';
import { PostTypeIcon } from './ui/PostTypeIcon';
import type { ForumPost } from '../lib/api/forum-posts';
import type { Comment } from '../lib/api/comments';

interface CommentItemProps {
  comment: Comment;
  postId: string | number;
  depth?: number;
}

function CommentItem({ comment, postId, depth = 0 }: CommentItemProps) {
  const { isAuthenticated } = useAuth();
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const createComment = useCreateForumPostComment();
  const reactMutation = useReactToForumPostComment();

  const handleReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyContent.trim()) return;

    createComment.mutate(
      { postId, data: { content: replyContent, parent_id: comment.id } },
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
    reactMutation.mutate({ commentId: comment.id, type, postId });
  };

  return (
    <div className={`${depth > 0 ? 'ml-8 border-l-2 border-slate-100 pl-4' : ''}`}>
      <div className="py-4">
        <div className="flex items-start gap-3">
          <Link
            to="/profile/$userId"
            params={{ userId: String(comment.user_id) }}
            className="w-8 h-8 bg-accent rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0 hover:scale-105 transition-transform"
          >
            {comment.user?.username?.charAt(0).toUpperCase() || 'U'}
          </Link>
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
            <p className="text-text-secondary text-sm whitespace-pre-wrap">{comment.content}</p>

            <div className="flex items-center gap-4 mt-2">
              <button
                onClick={() => handleReaction('upvote')}
                disabled={!isAuthenticated}
                className="flex items-center gap-1 text-xs text-text-muted hover:text-accent disabled:opacity-50"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                </svg>
                {comment.upvotes}
              </button>
              <button
                onClick={() => handleReaction('downvote')}
                disabled={!isAuthenticated}
                className="flex items-center gap-1 text-xs text-slate-500 hover:text-red-600 disabled:opacity-50"
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
            <CommentItem key={reply.id} comment={reply} postId={postId} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

interface ForumPostDetailProps {
  post: ForumPost;
  forumId: number;
  onEdit?: (post: ForumPost) => void;
  onDelete?: (postId: number) => void;
  onPin?: (postId: number) => void;
  onUnpin?: (postId: number) => void;
}

export const ForumPostDetail = ({
  post,
  forumId,
  onEdit,
  onDelete,
  onPin,
  onUnpin,
}: ForumPostDetailProps) => {
  const { isAuthenticated, user } = useAuth();
  const [newComment, setNewComment] = useState('');

  const { data: comments, isLoading: commentsLoading } = useForumPostComments(post.id);
  const createComment = useCreateForumPostComment();
  const reactMutation = useReactToForumPost();
  const removeReactionMutation = useRemoveForumPostReaction();

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    createComment.mutate(
      { postId: post.id, data: { content: newComment } },
      {
        onSuccess: () => setNewComment(''),
      }
    );
  };

  const handleReaction = (type: 'upvote' | 'downvote') => {
    if (!isAuthenticated) return;
    reactMutation.mutate({ postId: post.id, type });
  };

  const postTypeInfo = FORUM_POST_TYPES.find((t) => t.value === post.post_type);
  const isOwner = user?.id === post.user_id;
  const isAdmin = user?.role === 'admin';

  return (
    <div className="animate-fade-in">
      <Card className="mb-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-6">
          <div className="flex items-center gap-3 flex-1">
            <Link
              to="/profile/$userId"
              params={{ userId: String(post.user_id) }}
              className="w-12 h-12 bg-accent rounded-full flex items-center justify-center text-white font-bold text-lg hover:scale-105 transition-transform flex-shrink-0"
            >
              {post.user?.username?.charAt(0).toUpperCase() || 'U'}
            </Link>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <Link
                  to="/profile/$userId"
                  params={{ userId: String(post.user_id) }}
                  className="font-medium text-text-primary hover:text-accent"
                >
                  {post.user?.username || 'Anonymous'}
                </Link>
                {postTypeInfo && (
                  <Chip variant="default" className="text-xs">
                    <PostTypeIcon type={postTypeInfo.icon as any} className="w-3 h-3 mr-1" />
                    <span>{postTypeInfo.label}</span>
                  </Chip>
                )}
                {post.is_pinned && (
                  <Chip variant="warning" className="text-xs">
                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                    </svg>
                    <span>Pinned</span>
                  </Chip>
                )}
              </div>
              <p className="text-sm text-text-muted">{format(new Date(post.created_at), 'PPp')}</p>
            </div>
          </div>
          {(isOwner || isAdmin) && (
            <div className="flex items-center gap-2 flex-shrink-0">
              {isAdmin && (
                <>
                  {post.is_pinned ? (
                    <Button variant="outline" size="sm" onClick={() => onUnpin?.(post.id)} title="Unpin post">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                      </svg>
                    </Button>
                  ) : (
                    <Button variant="outline" size="sm" onClick={() => onPin?.(post.id)} title="Pin post">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                      </svg>
                    </Button>
                  )}
                </>
              )}
              {isOwner && (
                <>
                  <Button variant="outline" size="sm" onClick={() => onEdit?.(post)}>
                    Edit
                  </Button>
                  <Button variant="danger" size="sm" onClick={() => onDelete?.(post.id)}>
                    Delete
                  </Button>
                </>
              )}
            </div>
          )}
        </div>

        {/* Title & Content */}
        <h1 className="text-3xl font-display font-bold text-text-primary mb-4">{post.title}</h1>
        <p className="text-text-secondary leading-relaxed mb-6 whitespace-pre-wrap">{post.content}</p>

        {/* Linked Report */}
        {post.linked_report && (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg mb-6">
            <p className="text-xs text-amber-700 font-medium mb-1 uppercase tracking-wider">Linked Report</p>
            <Link
              to="/feed/$reportId"
              params={{ reportId: String(post.linked_report.id) }}
              className="text-amber-700 hover:text-amber-800 font-medium"
            >
              {post.linked_report.title} →
            </Link>
          </div>
        )}

        {/* Images */}
        {post.photo_urls && post.photo_urls.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-6">
            {post.photo_urls.map((url, idx) => (
              <a key={idx} href={url} target="_blank" rel="noopener noreferrer">
                <img
                  src={url}
                  alt={`Post image ${idx + 1}`}
                  className="w-full h-40 object-cover rounded-lg hover:opacity-90 transition-opacity"
                />
              </a>
            ))}
          </div>
        )}

        {/* PDFs */}
        {post.pdf_urls && post.pdf_urls.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {post.pdf_urls.map((url, idx) => (
              <a
                key={idx}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm4 18H6V4h7v5h5v11z" />
                </svg>
                <span className="text-sm text-slate-700">Document {idx + 1}</span>
              </a>
            ))}
          </div>
        )}

        {/* Reactions */}
        <div className="flex items-center gap-4 sm:gap-6 pt-4 border-t border-slate-100">
          <button
            onClick={() => handleReaction('upvote')}
            disabled={!isAuthenticated || reactMutation.isPending}
            className="flex items-center gap-2 text-text-secondary hover:text-accent transition-colors disabled:opacity-50"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
            <span className="font-medium hidden sm:inline">{post.upvotes} Upvotes</span>
            <span className="font-medium sm:hidden">{post.upvotes}</span>
          </button>
          <button
            onClick={() => handleReaction('downvote')}
            disabled={!isAuthenticated || reactMutation.isPending}
            className="flex items-center gap-2 text-slate-600 hover:text-red-600 transition-colors disabled:opacity-50"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
            <span className="font-medium hidden sm:inline">{post.downvotes} Downvotes</span>
            <span className="font-medium sm:hidden">{post.downvotes}</span>
          </button>
          <span className="flex items-center gap-2 text-slate-500">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
            <span className="hidden sm:inline">{post.comment_count} Comments</span>
            <span className="sm:hidden">{post.comment_count}</span>
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
              <CommentItem key={comment.id} comment={comment} postId={post.id} />
            ))}
          </div>
        ) : (
          <div className="py-8 text-center text-text-muted">
            <p>No comments yet. Be the first to comment!</p>
          </div>
        )}
      </Card>
    </div>
  );
};

