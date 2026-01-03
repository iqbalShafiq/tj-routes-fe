import { useState } from 'react';
import { useCheckIns } from '../lib/hooks/useCheckIn';
import { Card } from './ui/Card';
import { Loading } from './ui/Loading';
import { CheckInHistoryCard } from './CheckInHistoryCard';

interface CheckInHistoryListProps {
  limit?: number;
}

export const CheckInHistoryList = ({ limit = 10 }: CheckInHistoryListProps) => {
  const [page, setPage] = useState(1);
  const { data, isLoading, error } = useCheckIns({ page, limit });

  const totalPages = data ? Math.ceil(data.total / limit) : 0;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Loading />
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} size="sm" className="p-4 animate-pulse">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-bg-elevated" />
                <div className="flex-1">
                  <div className="h-5 bg-bg-elevated rounded mb-2 w-1/3" />
                  <div className="h-4 bg-bg-elevated rounded mb-4 w-2/3" />
                  <div className="h-3 bg-bg-elevated rounded w-1/2" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-6 text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 bg-error/10 rounded-full mb-3">
          <svg className="w-6 h-6 text-error" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <p className="text-error font-medium mb-1">Failed to load check-in history</p>
        <p className="text-sm text-text-muted">Please try again later</p>
      </Card>
    );
  }

  if (!data || data.check_ins.length === 0) {
    return (
      <Card className="p-8 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-bg-elevated rounded-full mb-4">
          <svg className="w-8 h-8 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <h3 className="text-lg font-display font-semibold text-text-primary mb-2">
          No check-ins yet
        </h3>
        <p className="text-sm text-text-muted">
          Start checking in to routes to see your history here
        </p>
      </Card>
    );
  }

  return (
    <div>
      <div className="grid gap-3">
        {data.check_ins.map((checkIn) => (
          <CheckInHistoryCard key={checkIn.id} checkIn={checkIn} />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-2 rounded-md bg-bg-elevated text-text-secondary hover:bg-bg-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <span className="text-sm text-text-secondary px-3">
            Page {page} of {totalPages}
          </span>

          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-3 py-2 rounded-md bg-bg-elevated text-text-secondary hover:bg-bg-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
};
