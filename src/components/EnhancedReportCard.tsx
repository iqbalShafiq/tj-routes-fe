import { Link } from '@tanstack/react-router';
import { useAuth } from '../lib/hooks/useAuth';
import { useReactToReport, useRemoveReportReaction } from '../lib/hooks/useReports';
import { Card } from './ui/Card';
import { Chip } from './ui/Chip';
import { ShareButton } from './ShareButton';
import { FollowButton } from './FollowButton';
import { format, formatDistanceToNow } from 'date-fns';
import type { Report } from '../lib/api/reports';
import { REPORT_TYPES, REPORT_STATUSES } from '../lib/utils/constants';
import { useState } from 'react';

interface EnhancedReportCardProps {
  report: Report;
}

export const EnhancedReportCard = ({ report }: EnhancedReportCardProps) => {
  const { isAuthenticated } = useAuth();
  const reactMutation = useReactToReport();
  const removeReactionMutation = useRemoveReportReaction();
  const [imageIndex, setImageIndex] = useState(0);

  const typeInfo = REPORT_TYPES.find(t => t.value === report.type);
  const statusInfo = REPORT_STATUSES.find(s => s.value === report.status);

  const handleReaction = (type: 'upvote' | 'downvote') => {
    if (!isAuthenticated) return;
    
    // If user already has this reaction, remove it
    if (report.user_reaction === type) {
      removeReactionMutation.mutate(report.id);
    } else {
      reactMutation.mutate({ reportId: report.id, type });
    }
  };

  const getStatusVariant = (color?: string): 'warning' | 'info' | 'success' | 'default' => {
    switch (color) {
      case 'amber': return 'warning';
      case 'blue': return 'info';
      case 'emerald': return 'success';
      default: return 'default';
    }
  };

  const reportUrl = `${window.location.origin}/feed/${report.id}`;

  return (
    <Card size="sm" className="mb-6 hover:shadow-lg transition-shadow sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-2">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <Link 
            to="/profile/$userId" 
            params={{ userId: String(report.user_id) }}
            className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center text-white font-bold text-base sm:text-lg hover:scale-105 transition-transform flex-shrink-0"
          >
            {report.user?.username?.charAt(0).toUpperCase() || 'U'}
          </Link>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <Link 
                to="/profile/$userId" 
                params={{ userId: String(report.user_id) }}
                className="font-semibold text-sm sm:text-base text-slate-900 hover:text-amber-600 transition-colors truncate"
              >
                {report.user?.username || 'Anonymous'}
              </Link>
              {report.user?.level && (
                <Chip variant="default" className="text-xs">
                  {report.user.level}
                </Chip>
              )}
              {report.is_following && (
                <Chip variant="warning" className="text-xs">
                  Following
                </Chip>
              )}
            </div>
            <div className="flex items-center gap-2 flex-wrap mt-0.5 sm:block">
              <p className="text-xs text-slate-500">
                {formatDistanceToNow(new Date(report.created_at), { addSuffix: true })}
              </p>
              <div className="flex items-center gap-1.5 sm:hidden">
                <span className="text-xs text-slate-400">·</span>
                <FollowButton userId={report.user_id} variant="minimal" className="text-xs" />
                <span className="text-xs text-slate-400">·</span>
                <span className="text-xs font-medium whitespace-nowrap">
                  {statusInfo?.label || report.status}
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-2 flex-shrink-0 self-start">
          <FollowButton userId={report.user_id} variant="minimal" />
          <Chip variant={getStatusVariant(statusInfo?.color)}>
            {statusInfo?.label || report.status}
          </Chip>
        </div>
      </div>

      {/* Content */}
      <Link to="/feed/$reportId" params={{ reportId: String(report.id) }} className="block">
        <div className="mb-4">
          <span className="text-[10px] sm:text-xs font-medium text-slate-500 uppercase tracking-wider mb-1 block">
            {typeInfo?.label || report.type}
          </span>
          <h3 className="text-xl sm:text-2xl font-display font-bold text-slate-900 mb-2 hover:text-amber-600 transition-colors">
            {report.title}
          </h3>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed mb-2">{report.description}</p>

          {/* Hashtags */}
          {report.hashtags && report.hashtags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-2">
              {report.hashtags.map((hashtag) => (
                <button
                  key={hashtag}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    window.location.href = `/feed?hashtag=${encodeURIComponent(hashtag)}`;
                  }}
                  className="text-amber-600 hover:text-amber-700 text-sm font-medium"
                >
                  #{hashtag}
                </button>
              ))}
            </div>
          )}

          {/* Images Gallery */}
          {report.photo_urls && report.photo_urls.length > 0 && (
            <div className="mb-4">
              {report.photo_urls.length === 1 ? (
                <div className="w-full rounded-lg overflow-hidden">
                  <img 
                    src={report.photo_urls[0]} 
                    alt={report.title}
                    className="w-full h-auto max-h-96 object-cover"
                  />
                </div>
              ) : (
                <div className="relative">
                  <div className="w-full rounded-lg overflow-hidden">
                    <img 
                      src={report.photo_urls[imageIndex]} 
                      alt={`${report.title} - Image ${imageIndex + 1}`}
                      className="w-full h-auto max-h-96 object-cover"
                    />
                  </div>
                  {report.photo_urls.length > 1 && (
                    <>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setImageIndex((prev) => (prev > 0 ? prev - 1 : report.photo_urls!.length - 1));
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
                          setImageIndex((prev) => (prev < report.photo_urls!.length - 1 ? prev + 1 : 0));
                        }}
                        className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                        {report.photo_urls.map((_, idx) => (
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

          {/* Related info */}
          {(report.route || report.stop) && (
            <div className="flex flex-wrap gap-2">
              {report.route && (
                <Link
                  to="/routes/$routeId"
                  params={{ routeId: String(report.route.id) }}
                  onClick={(e) => e.stopPropagation()}
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-amber-50 text-amber-700 text-sm rounded-lg hover:bg-amber-100 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                  Route {report.route.route_number}
                </Link>
              )}
              {report.stop && (
                <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-100 text-slate-700 text-sm rounded-lg">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  </svg>
                  {report.stop.name}
                </span>
              )}
            </div>
          )}
        </div>
      </Link>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-4 border-t border-slate-100">
        <div className="flex items-center gap-4 sm:gap-6 flex-wrap">
          <button
            onClick={() => handleReaction('upvote')}
            disabled={!isAuthenticated || reactMutation.isPending || removeReactionMutation.isPending}
            className={`flex items-center gap-1.5 transition-colors disabled:opacity-50 ${
              report.user_reaction === 'upvote'
                ? 'text-emerald-600'
                : 'text-slate-500 hover:text-emerald-600'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
            <span className="text-sm font-medium">{report.upvotes}</span>
          </button>
          <button
            onClick={() => handleReaction('downvote')}
            disabled={!isAuthenticated || reactMutation.isPending || removeReactionMutation.isPending}
            className={`flex items-center gap-1.5 transition-colors disabled:opacity-50 ${
              report.user_reaction === 'downvote'
                ? 'text-red-600'
                : 'text-slate-500 hover:text-red-600'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
            <span className="text-sm font-medium">{report.downvotes}</span>
          </button>
          <Link 
            to="/feed/$reportId" 
            params={{ reportId: String(report.id) }}
            className="flex items-center gap-1.5 text-slate-500 hover:text-amber-600 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <span className="text-sm font-medium">{report.comment_count}</span>
          </Link>
          <ShareButton url={reportUrl} title={report.title} text={report.description} />
        </div>
      </div>
    </Card>
  );
};

