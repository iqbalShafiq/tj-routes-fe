import { useState, useEffect, useRef } from 'react';
import { createFileRoute, useSearch } from '@tanstack/react-router';
import { useFeed } from '../../lib/hooks/useFeed';
import { useAuth } from '../../lib/hooks/useAuth';
import { Button } from '../../components/ui/Button';
import { Skeleton } from '../../components/ui/Loading';
import { PageHeader } from '../../components/layout';
import { EnhancedReportCard } from '../../components/EnhancedReportCard';
import { StoriesBar } from '../../components/StoriesBar';
import { TrendingSection } from '../../components/TrendingSection';
import { HashtagFilter } from '../../components/HashtagFilter';
import { ReportModal } from '../../components/ReportModal';

export const Route = createFileRoute('/feed/')({
  component: FeedPage,
  validateSearch: (search: Record<string, unknown>) => {
    return {
      sort: (search.sort as 'recent' | 'popular' | 'trending') || 'recent',
      hashtag: search.hashtag as string | undefined,
      followed: search.followed === 'true' ? true : undefined,
    };
  },
});

function FeedPage() {
  const { isAuthenticated } = useAuth();
  const search = useSearch({ from: '/feed/' });
  const [sort, setSort] = useState<'recent' | 'popular' | 'trending'>(search.sort || 'recent');
  const [hashtag, setHashtag] = useState<string | undefined>(search.hashtag);
  const [followed, setFollowed] = useState<boolean | undefined>(
    search.followed ? true : undefined
  );
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const limit = 20;

  const {
    data,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useFeed(limit, {
    sort,
    hashtag,
    followed: followed && isAuthenticated ? true : undefined,
  });

  // Infinite scroll
  const loadMoreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!loadMoreRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (sort !== 'recent') params.set('sort', sort);
    if (hashtag) params.set('hashtag', hashtag);
    if (followed) params.set('followed', 'true');
    const queryString = params.toString();
    const newUrl = queryString ? `/feed?${queryString}` : '/feed';
    window.history.replaceState({}, '', newUrl);
  }, [sort, hashtag, followed]);

  const allReports = data?.pages.flatMap((page) => page.data) || [];

  if (isLoading && !data) {
    return (
      <div className="animate-fade-in">
        <PageHeader
          title="Community Feed"
          subtitle="See what's happening on TransJakarta routes and stops."
        />
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-64 card-chamfered" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20 animate-fade-in">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 mb-4 card-chamfered">
          <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="text-red-600 font-display text-lg mb-2">Error loading feed</p>
        <p className="text-text-secondary text-sm">Please try again later.</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Community Feed"
        subtitle="See what's happening on TransJakarta routes and stops. Share updates and help fellow commuters."
        actions={
          isAuthenticated && (
            <Button variant="primary" onClick={() => setIsReportModalOpen(true)}>
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Report
            </Button>
          )
        }
      >
        {/* Feed Sorting Tabs */}
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <div className="flex gap-2 bg-bg-elevated p-1 rounded-sm">
            <button
              onClick={() => setSort('recent')}
              className={`px-4 py-2 text-sm font-medium rounded transition-colors ${
                sort === 'recent'
                  ? 'bg-white text-tertiary shadow-sm'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              Recent
            </button>
            <button
              onClick={() => setSort('popular')}
              className={`px-4 py-2 text-sm font-medium rounded transition-colors ${
                sort === 'popular'
                  ? 'bg-white text-tertiary shadow-sm'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              Popular
            </button>
            <button
              onClick={() => setSort('trending')}
              className={`px-4 py-2 text-sm font-medium rounded transition-colors ${
                sort === 'trending'
                  ? 'bg-white text-tertiary shadow-sm'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              Trending
            </button>
          </div>
          {isAuthenticated && (
            <button
              onClick={() => setFollowed(followed ? undefined : true)}
              className={`px-4 py-2 text-sm font-medium rounded transition-colors ${
                followed
                  ? 'bg-tertiary text-white hover:bg-tertiary-hover'
                  : 'bg-bg-elevated text-text-secondary hover:bg-border'
              }`}
            >
              Following
            </button>
          )}
        </div>

        {/* Hashtag Filter */}
        <HashtagFilter
          selectedHashtag={hashtag}
          onHashtagSelect={(tag) => setHashtag(tag)}
        />
      </PageHeader>

      {/* Stories Bar */}
      <StoriesBar />

      {/* Trending Section */}
      {sort === 'recent' && <TrendingSection />}

      {/* Feed Posts */}
      {allReports.length > 0 ? (
        <>
          <div className="space-y-6 mb-8">
            {allReports.map((report, index) => (
              <div key={report.id} style={{ animationDelay: `${index * 50}ms` }} className="animate-stagger-1">
                <EnhancedReportCard report={report} />
              </div>
            ))}
          </div>

          {/* Infinite scroll trigger */}
          <div ref={loadMoreRef} className="h-10 flex items-center justify-center">
            {isFetchingNextPage && (
              <div className="flex items-center gap-2 text-text-muted">
                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Loading more...</span>
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-bg-elevated mb-4 card-chamfered">
              <svg className="w-8 h-8 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
              </svg>
            </div>
            <p className="text-text-secondary font-display text-lg">No reports yet</p>
            <p className="text-text-muted text-sm mt-2 mb-6">Be the first to share something!</p>
            {isAuthenticated && (
              <Button variant="primary" onClick={() => setIsReportModalOpen(true)}>
                Create Report
              </Button>
            )}
          </div>
      )}

      <ReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
      />
    </div>
  );
}
