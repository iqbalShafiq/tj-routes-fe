import { TrendingHashtagsWidget } from './TrendingHashtagsWidget';
import { SuggestedUsersWidget } from './SuggestedUsersWidget';
import { ActiveForumDiscussionsWidget } from './ActiveForumDiscussionsWidget';
import { RouteActivityWidget } from './RouteActivityWidget';

export const RightSidebar = () => {
  return (
    <aside className="hidden lg:block w-[400px] sticky top-8 self-start max-h-[calc(100vh-4rem)] overflow-y-auto scrollbar-thin">
      <div className="space-y-6">
        <TrendingHashtagsWidget />
        <SuggestedUsersWidget />
        <ActiveForumDiscussionsWidget />
        <RouteActivityWidget />
      </div>
    </aside>
  );
};
