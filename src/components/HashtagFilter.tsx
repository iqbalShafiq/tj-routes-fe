import { useState } from 'react';
import { useTrendingHashtags, useSearchHashtags } from '../lib/hooks/useHashtags';
import { Input } from './ui/Input';

interface HashtagFilterProps {
  selectedHashtag?: string;
  onHashtagSelect: (hashtag: string | undefined) => void;
}

export const HashtagFilter = ({ selectedHashtag, onHashtagSelect }: HashtagFilterProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const { data: trendingHashtags } = useTrendingHashtags(10);
  const { data: searchResults } = useSearchHashtags(searchQuery, 10, searchQuery.length > 0);

  const hashtagsToShow = searchQuery.length > 0 ? searchResults : trendingHashtags;

  return (
    <div className="mb-4">
      <div className="mb-2">
        <Input
          type="text"
          placeholder="Search hashtags..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full"
        />
      </div>
      <div className="flex flex-wrap gap-2">
        {selectedHashtag && (
          <button
            onClick={() => onHashtagSelect(undefined)}
            className="px-3 py-1.5 bg-tertiary text-white text-sm font-medium rounded-full hover:bg-tertiary-hover transition-colors flex items-center gap-1"
          >
            #{selectedHashtag}
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
        {hashtagsToShow && hashtagsToShow.length > 0 && (
          <>
            {hashtagsToShow.map((hashtag) => (
              <button
                key={hashtag.id}
                onClick={() => onHashtagSelect(hashtag.name)}
                className={`px-3 py-1.5 text-sm font-medium rounded-full transition-colors ${
                  selectedHashtag === hashtag.name
                    ? 'bg-tertiary text-white'
                    : 'bg-bg-elevated text-text-secondary hover:bg-bg-elevated/80'
                }`}
              >
                #{hashtag.name}
                {hashtag.usage_count > 0 && (
                  <span className="ml-1 text-xs opacity-75">({hashtag.usage_count})</span>
                )}
              </button>
            ))}
          </>
        )}
      </div>
    </div>
  );
};

