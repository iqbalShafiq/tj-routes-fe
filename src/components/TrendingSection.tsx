import { useState } from 'react';
import { Link } from '@tanstack/react-router';
import { useTrendingReports } from '../lib/hooks/useTrendingReports';
import { Card } from './ui/Card';
import { Skeleton } from './ui/Loading';
import { formatDistanceToNow } from 'date-fns';
import type { Report } from '../lib/api/reports';

export const TrendingSection = () => {
  const [window, setWindow] = useState<'1h' | '24h' | '7d' | '30d' | 'all'>('24h');
  const { data, isLoading } = useTrendingReports(10, window);

  if (isLoading) {
    return (
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-display font-bold text-slate-900">Trending Now</h2>
          <Skeleton className="h-8 w-32" />
        </div>
        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="w-80 h-48 flex-shrink-0 card-chamfered" />
          ))}
        </div>
      </div>
    );
  }

  if (!data || data.data.length === 0) {
    return null;
  }

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-display font-bold text-slate-900">Trending Now</h2>
        <select
          value={window}
          onChange={(e) => setWindow(e.target.value as typeof window)}
          className="px-3 py-1.5 text-sm border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
        >
          <option value="1h">Last Hour</option>
          <option value="24h">Last 24 Hours</option>
          <option value="7d">Last 7 Days</option>
          <option value="30d">Last 30 Days</option>
          <option value="all">All Time</option>
        </select>
      </div>
      <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
        {data.data.map((report) => (
          <TrendingCard key={report.id} report={report} />
        ))}
      </div>
    </div>
  );
};

function TrendingCard({ report }: { report: Report }) {
  return (
    <Link
      to="/feed/$reportId"
      params={{ reportId: String(report.id) }}
      className="flex-shrink-0 w-80"
    >
      <Card className="hover:shadow-lg transition-shadow flex flex-col">
        {report.photo_urls && report.photo_urls.length > 0 && (
          <div className="w-full h-32 mb-3 rounded-lg overflow-hidden flex-shrink-0">
            <img
              src={report.photo_urls[0]}
              alt={report.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        <h3 className="font-display font-semibold text-slate-900 mb-2 line-clamp-1">
          {report.title}
        </h3>
        <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
          <span>{report.user?.username || 'Anonymous'}</span>
          <span>•</span>
          <span>{formatDistanceToNow(new Date(report.created_at), { addSuffix: true })}</span>
        </div>
        <div className="flex items-center gap-3 text-sm mt-auto">
          <div className="flex items-center gap-1 text-emerald-600">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
            <span className="font-medium">{report.upvotes}</span>
          </div>
          <div className="flex items-center gap-1 text-slate-500">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <span>{report.comment_count}</span>
          </div>
        </div>
      </Card>
    </Link>
  );
}

