import { Link } from '@tanstack/react-router';
import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { useAuth } from '../lib/hooks/useAuth';
import { useReactToForumPost, useRemoveForumPostReaction } from '../lib/hooks/useReactions';
import { FORUM_POST_TYPES } from '../lib/utils/constants';
import { PostTypeIcon } from './ui/PostTypeIcon';
import type { ForumPost } from '../lib/api/forum-posts';

interface ForumPostCardProps {
  post: ForumPost;
  forumId: number;
  onEdit?: (post: ForumPost) => void;
  onDelete?: (postId: number) => void;
  onPin?: (postId: number) => void;
  onUnpin?: (postId: number) => void;
}

export const ForumPostCard = ({
  post,
  forumId,
  onEdit,
  onDelete,
  onPin,
  onUnpin,
}: ForumPostCardProps) => {
  const { isAuthenticated, user } = useAuth();
  const reactMutation = useReactToForumPost();
  const removeReactionMutation = useRemoveForumPostReaction();
  const [imageIndex, setImageIndex] = useState(0);

  const postTypeInfo = FORUM_POST_TYPES.find((t) => t.value === post.post_type);

  const handleReaction = (type: 'upvote' | 'downvote') => {
    if (!isAuthenticated) return;
    reactMutation.mutate({ postId: post.id, type });
  };

  const handleRemoveReaction = () => {
    if (!isAuthenticated) return;
    removeReactionMutation.mutate(post.id);
  };

  const isOwner = user?.id === post.user_id;
  const isAdmin = user?.role === 'admin';

  return (
    <Card size="sm" className="mb-6 hover:shadow-lg transition-shadow">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-3">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <Link
            to="/profile/$userId"
            params={{ userId: String(post.user_id) }}
            className="w-10 h-10 sm:w-12 sm:h-12 bg-accent rounded-full flex items-center justify-center text-white font-bold text-base sm:text-lg hover:scale-105 transition-transform flex-shrink-0"
          >
            {post.user?.username?.charAt(0).toUpperCase() || 'U'}
          </Link>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <Link
                to="/profile/$userId"
                params={{ userId: String(post.user_id) }}
                className="font-semibold text-sm sm:text-base text-slate-900 hover:text-amber-600 transition-colors truncate"
              >
                {post.user?.username || 'Anonymous'}
              </Link>
              {postTypeInfo && (
                <span className="px-2 py-0.5 text-xs bg-slate-100 text-slate-700 rounded-full flex-shrink-0 flex items-center gap-1">
                  <PostTypeIcon type={postTypeInfo.icon as any} className="w-3 h-3" />
                  <span>{postTypeInfo.label}</span>
                </span>
              )}
              {post.is_pinned && (
                <span className="px-2 py-0.5 text-xs bg-amber-100 text-amber-700 rounded-full flex-shrink-0 flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                  </svg>
                  <span>Pinned</span>
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
            </p>
          </div>
        </div>
        {(isOwner || isAdmin) && (
          <div className="flex items-center gap-2 flex-shrink-0">
            {isAdmin && (
              <>
                {post.is_pinned ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onUnpin?.(post.id)}
                    title="Unpin post"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                    </svg>
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPin?.(post.id)}
                    title="Pin post"
                  >
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

      {/* Content */}
      <Link
        to="/routes/$routeId/forum/posts/$postId"
        params={{ routeId: String(post.forum_id), postId: String(post.id) }}
        className="block"
      >
        <div className="mb-4">
          <h3 className="text-xl sm:text-2xl font-display font-bold text-slate-900 mb-2 hover:text-amber-600 transition-colors">
            {post.title}
          </h3>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed mb-2 line-clamp-3">
            {post.content}
          </p>

          {/* Linked Report */}
          {post.linked_report && (
            <div className="mb-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-xs text-amber-700 font-medium mb-1">Linked Report</p>
              <Link
                to="/feed/$reportId"
                params={{ reportId: String(post.linked_report.id) }}
                onClick={(e) => e.stopPropagation()}
                className="text-sm text-amber-700 hover:text-amber-800 font-medium"
              >
                {post.linked_report.title} →
              </Link>
            </div>
          )}

          {/* Images Gallery */}
          {post.photo_urls && post.photo_urls.length > 0 && (
            <div className="mb-4">
              {post.photo_urls.length === 1 ? (
                <div className="w-full rounded-lg overflow-hidden">
                  <img
                    src={post.photo_urls[0]}
                    alt={post.title}
                    className="w-full h-auto max-h-96 object-cover"
                  />
                </div>
              ) : (
                <div className="relative">
                  <div className="w-full rounded-lg overflow-hidden">
                    <img
                      src={post.photo_urls[imageIndex]}
                      alt={`${post.title} - Image ${imageIndex + 1}`}
                      className="w-full h-auto max-h-96 object-cover"
                    />
                  </div>
                  {post.photo_urls.length > 1 && (
                    <>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setImageIndex((prev) => (prev > 0 ? prev - 1 : post.photo_urls!.length - 1));
                        }}
                        className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                      </button>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setImageIndex((prev) => (prev < post.photo_urls!.length - 1 ? prev + 1 : 0));
                        }}
                        className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                        {post.photo_urls.map((_, idx) => (
                          <button
                            key={idx}
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setImageIndex(idx);
                            }}
                            className={`w-2 h-2 rounded-full transition-colors ${
                              idx === imageIndex ? 'bg-white' : 'bg-white/50'
                            }`}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          )}

          {/* PDFs */}
          {post.pdf_urls && post.pdf_urls.length > 0 && (
            <div className="mb-4 flex flex-wrap gap-2">
              {post.pdf_urls.map((pdfUrl, idx) => (
                <a
                  key={idx}
                  href={pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                    />
                  </svg>
                  PDF {idx + 1}
                </a>
              ))}
            </div>
          )}
        </div>
      </Link>

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-100">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleReaction('upvote');
              }}
              disabled={!isAuthenticated || reactMutation.isPending}
              className="flex items-center gap-1 text-slate-600 hover:text-amber-600 transition-colors disabled:opacity-50"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
              <span className="text-sm font-medium">{post.upvotes}</span>
            </button>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleReaction('downvote');
              }}
              disabled={!isAuthenticated || reactMutation.isPending}
              className="flex items-center gap-1 text-slate-600 hover:text-red-600 transition-colors disabled:opacity-50"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
              <span className="text-sm font-medium">{post.downvotes}</span>
            </button>
          </div>
          <Link
            to="/routes/$routeId/forum/posts/$postId"
            params={{ routeId: String(forumId), postId: String(post.id) }}
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-1 text-slate-600 hover:text-amber-600 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
            <span className="text-sm font-medium">{post.comment_count} comments</span>
          </Link>
        </div>
      </div>
    </Card>
  );
};

