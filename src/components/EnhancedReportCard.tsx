import { Link } from '@tanstack/react-router';
import { useAuth } from '../lib/hooks/useAuth';
import { useReactToReport, useRemoveReportReaction } from '../lib/hooks/useReports';
import { Card } from './ui/Card';
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

  const getStatusColor = (color?: string) => {
    switch (color) {
      case 'amber': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'blue': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'emerald': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getTypeIcon = () => {
    switch (report.type) {
      case 'route_issue':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
          </svg>
        );
      case 'stop_issue':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          </svg>
        );
      case 'temporary_event':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        );
    }
  };

  const reportUrl = `${window.location.origin}/feed/${report.id}`;

  return (
    <Card className="mb-6 hover:shadow-lg transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3 flex-1">
          <Link 
            to="/profile/$userId" 
            params={{ userId: String(report.user_id) }}
            className="w-12 h-12 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center text-white font-bold text-lg hover:scale-105 transition-transform"
          >
            {report.user?.username?.charAt(0).toUpperCase() || 'U'}
          </Link>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <Link 
                to="/profile/$userId" 
                params={{ userId: String(report.user_id) }}
                className="font-semibold text-slate-900 hover:text-amber-600 transition-colors"
              >
                {report.user?.username || 'Anonymous'}
              </Link>
              {report.user?.level && (
                <span className="px-2 py-0.5 text-xs bg-slate-100 text-slate-600 rounded-full">
                  {report.user.level}
                </span>
              )}
              {report.is_following && (
                <span className="px-2 py-0.5 text-xs bg-amber-100 text-amber-700 rounded-full">
                  Following
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500">
              {formatDistanceToNow(new Date(report.created_at), { addSuffix: true })}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <FollowButton userId={report.user_id} variant="minimal" />
          <span className={`px-2 py-1 text-xs font-medium border rounded ${getStatusColor(statusInfo?.color)}`}>
            {statusInfo?.label || report.status}
          </span>
        </div>
      </div>

      {/* Content */}
      <Link to="/feed/$reportId" params={{ reportId: String(report.id) }} className="block">
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-amber-600">{getTypeIcon()}</span>
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              {typeInfo?.label || report.type}
            </span>
          </div>
          <h3 className="text-2xl font-display font-bold text-slate-900 mb-3 hover:text-amber-600 transition-colors">
            {report.title}
          </h3>
          <p className="text-slate-600 leading-relaxed mb-4">{report.description}</p>

          {/* Hashtags */}
          {report.hashtags && report.hashtags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
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
      <div className="flex items-center justify-between pt-4 border-t border-slate-100">
        <div className="flex items-center gap-6">
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
        <p className="text-xs text-slate-400">
          {format(new Date(report.created_at), 'MMM d, yyyy')}
        </p>
      </div>
    </Card>
  );
};

