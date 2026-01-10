import { useTrendingHashtags } from '../../lib/hooks/useHashtags';
import { Skeleton } from '../ui/Loading';
import { Card } from '../ui/Card';

export const TrendingHashtagsWidget = () => {
  const { data: hashtags, isLoading, error } = useTrendingHashtags(10);

  const handleHashtagClick = (hashtag: string) => {
    const url = new URL(window.location.href);
    const currentHashtag = url.searchParams.get('hashtag');
    if (currentHashtag === hashtag) {
      url.searchParams.delete('hashtag');
    } else {
      url.searchParams.set('hashtag', hashtag);
    }
    window.history.pushState({}, '', url.toString());
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  const formatCount = (count: number) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k`;
    }
    return count.toString();
  };

  if (isLoading) {
    return (
      <Card size="sm">
        <div className="mb-4">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-tertiary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
            </svg>
            <h3 className="font-display font-semibold text-text-primary">Trending Hashtags</h3>
          </div>
        </div>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-8 w-full" />
          ))}
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card size="sm">
        <div className="mb-4">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-tertiary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
            </svg>
            <h3 className="font-display font-semibold text-text-primary">Trending Hashtags</h3>
          </div>
        </div>
        <div className="text-center py-6 text-error text-sm">
          <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p>Failed to load hashtags</p>
        </div>
      </Card>
    );
  }

  if (!hashtags || hashtags.length === 0) {
    return (
      <Card size="sm">
        <div className="mb-4">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-tertiary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
            </svg>
            <h3 className="font-display font-semibold text-text-primary">Trending Hashtags</h3>
          </div>
        </div>
        <div className="text-center py-6 text-text-muted text-sm">
          <svg className="w-8 h-8 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
          </svg>
          <p>No trending hashtags right now</p>
        </div>
      </Card>
    );
  }

  const currentHashtag = new URLSearchParams(window.location.search).get('hashtag');

  return (
    <Card size="sm">
      <div className="mb-4">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-tertiary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
          </svg>
          <h3 className="font-display font-semibold text-text-primary">Trending Hashtags</h3>
        </div>
      </div>
      <div className="space-y-2">
        {hashtags.slice(0, 10).map((hashtag) => {
          const isSelected = currentHashtag === hashtag.name;
          return (
            <button
              key={hashtag.id}
              onClick={() => handleHashtagClick(hashtag.name)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors ${
                isSelected
                  ? 'bg-tertiary text-white'
                  : 'text-text-secondary hover:bg-bg-elevated'
              }`}
            >
              <span className={`font-medium ${isSelected ? 'text-white' : 'text-text-primary'}`}>
                #{hashtag.name}
              </span>
              <span className={`text-xs ${isSelected ? 'text-white/70' : 'text-text-muted'}`}>
                {formatCount(hashtag.usage_count)}
              </span>
            </button>
          );
        })}
      </div>
    </Card>
  );
};
