import { Link } from '@tanstack/react-router';
import { useStories } from '../lib/hooks/useStories';
import { Skeleton } from './ui/Loading';
import { formatDistanceToNow } from 'date-fns';

export const StoriesBar = () => {
  const { data: stories, isLoading } = useStories(20);

  if (isLoading) {
    return (
      <div className="mb-6">
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="flex-shrink-0">
              <Skeleton className="w-20 h-20 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!stories || stories.length === 0) {
    return null;
  }

  return (
    <div className="mb-6">
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
        {stories.map((story) => (
          <Link
            key={story.id}
            to="/feed/$reportId"
            params={{ reportId: String(story.id) }}
            className="flex-shrink-0 group"
          >
            <div className="relative">
              {story.photo_urls && story.photo_urls.length > 0 ? (
                <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-amber-500 p-0.5 group-hover:border-amber-600 transition-colors">
                  <img
                    src={story.photo_urls[0]}
                    alt={story.title}
                    className="w-full h-full object-cover rounded-full"
                  />
                </div>
              ) : (
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 border-2 border-amber-500 flex items-center justify-center text-white font-bold text-lg group-hover:border-amber-600 transition-colors">
                  {story.user?.username?.charAt(0).toUpperCase() || 'U'}
                </div>
              )}
              {story.user && (
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-6 h-6 bg-white rounded-full border-2 border-amber-500 flex items-center justify-center">
                  <div className="w-4 h-4 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                    {story.user.username.charAt(0).toUpperCase()}
                  </div>
                </div>
              )}
            </div>
            <p className="text-xs text-center mt-2 text-slate-600 truncate w-20">
              {story.user?.username || 'Anonymous'}
            </p>
            <p className="text-xs text-center text-slate-400">
              {formatDistanceToNow(new Date(story.created_at), { addSuffix: true })}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
};

