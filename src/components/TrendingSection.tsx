import { useState } from 'react';
import { Link } from '@tanstack/react-router';
import { useTrendingReports } from '../lib/hooks/useTrendingReports';
import { Card } from './ui/Card';
import { Skeleton } from './ui/Loading';
import { FilterSelect } from './ui/FilterSelect';
import { formatDistanceToNow } from 'date-fns';
import type { Report } from '../lib/api/reports';

export const TrendingSection = () => {
  const [window, setWindow] = useState<'1h' | '24h' | '7d' | '30d' | 'all'>('24h');
  const { data, isLoading } = useTrendingReports(10, window);

  if (isLoading) {
    return (
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-display font-bold text-text-primary">Trending Now</h2>
          <Skeleton className="h-8 w-32" />
        </div>
        <div className="-mx-6">
          <div className="flex gap-4 overflow-x-auto overflow-y-visible pb-2 pt-2 scrollbar-hide px-6">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="w-80 h-48 flex-shrink-0 card-chamfered" />
            ))}
          </div>
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
        <FilterSelect
          label="Time"
          value={window}
          onChange={(value) => setWindow(value as typeof window)}
          options={[
            { value: '1h', label: 'Last Hour' },
            { value: '24h', label: 'Last 24 Hours' },
            { value: '7d', label: 'Last 7 Days' },
            { value: '30d', label: 'Last 30 Days' },
            { value: 'all', label: 'All Time' },
          ]}
        />
      </div>
      <div className="-mx-6">
        <div className="flex gap-4 overflow-x-auto overflow-y-visible pb-2 pt-2 scrollbar-hide px-6">
          {data.data.map((report) => (
            <TrendingCard key={report.id} report={report} />
          ))}
        </div>
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
        <h3 className="font-display font-semibold text-text-primary mb-2 line-clamp-1">
          {report.title}
        </h3>
        <div className="flex items-center gap-2 text-xs text-text-muted mb-2">
          <span>{report.user?.username || 'Anonymous'}</span>
          <span>•</span>
          <span>{formatDistanceToNow(new Date(report.created_at), { addSuffix: true })}</span>
        </div>
        <div className="flex items-center gap-3 text-sm mt-auto">
          <div className="flex items-center gap-1 text-accent">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
            <span className="font-medium">{report.upvotes}</span>
          </div>
          <div className="flex items-center gap-1 text-text-muted">
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

