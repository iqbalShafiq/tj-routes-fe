import { Link } from '@tanstack/react-router';
import { Card } from './ui/Card';
import { formatDistanceToNow } from 'date-fns';

function safeFormatDistance(dateString: string | null | undefined, options?: { addSuffix: boolean }): string {
  if (!dateString) return 'recently';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'recently';
    return formatDistanceToNow(date, options);
  } catch {
    return 'recently';
  }
}

interface RecentRouteItem {
  id: number;
  route: {
    id: number;
    route_number: string;
    name: string;
  };
  created_at: string;
}

interface RecentStopItem {
  id: number;
  stop: {
    id: number;
    name: string;
    code?: string;
  };
  created_at: string;
}

interface RecentNavigationItem {
  id: number;
  from: { place_type?: string; place_name?: string; stop_name?: string };
  to: { place_type?: string; place_name?: string; stop_name?: string };
  searched_at: string;
}

interface RecentItemCardProps {
  type: 'route' | 'stop' | 'navigation';
  item: RecentRouteItem | RecentStopItem | RecentNavigationItem;
  onRemove?: () => void;
}

export const RecentItemCard = ({ type, item, onRemove }: RecentItemCardProps) => {
  if (type === 'route') {
    const route = item as RecentRouteItem;
    return (
      <Link to="/routes/$routeId" params={{ routeId: String(route.route.id) }}>
        <Card className="group hover:shadow-lg transition-all duration-200 cursor-pointer" size="sm">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
              <span className="text-accent font-display font-bold">{route.route.route_number}</span>
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-display font-semibold text-text-primary truncate">
                {route.route.name}
              </h4>
              <p className="text-xs text-text-muted">
                Viewed {safeFormatDistance(route.created_at, { addSuffix: true })}
              </p>
            </div>
            <svg
              className="w-5 h-5 text-text-muted group-hover:text-accent transition-colors"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </div>
        </Card>
      </Link>
    );
  }

  if (type === 'stop') {
    const stop = item as RecentStopItem;
    return (
      <Link to="/stops/$stopId" params={{ stopId: String(stop.stop.id) }}>
        <Card className="group hover:shadow-lg transition-all duration-200 cursor-pointer" size="sm">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-info/10 flex items-center justify-center">
              <svg className="w-5 h-5 text-info" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-display font-semibold text-text-primary truncate">
                {stop.stop.name}
              </h4>
              {stop.stop.code && (
                <p className="text-xs text-text-muted">{stop.stop.code}</p>
              )}
              <p className="text-xs text-text-muted">
                Viewed {safeFormatDistance(stop.created_at, { addSuffix: true })}
              </p>
            </div>
            <svg
              className="w-5 h-5 text-text-muted group-hover:text-accent transition-colors"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </div>
        </Card>
      </Link>
    );
  }

  // Navigation type
  const nav = item as RecentNavigationItem;
  const formatPoint = (point: { place_type?: string; place_name?: string; stop_name?: string }) => {
    // Priority: place_name -> stop_name -> place_type -> Unknown
    if (point.place_name && point.place_name.trim()) return point.place_name;
    if (point.stop_name && point.stop_name.trim()) return point.stop_name;
    if (point.place_type) {
      // Convert place_type to readable format
      const placeLabels: Record<string, string> = {
        home: 'Home',
        office: 'Office',
        school: 'School',
        gym: 'Gym',
        shopping: 'Shopping',
        restaurant: 'Restaurant',
        hospital: 'Hospital',
        other: 'Other',
        custom: 'Custom',
        stop: 'Stop',
      };
      return placeLabels[point.place_type] || point.place_type;
    }
    return 'Unknown';
  };

  return (
    <Card className="group hover:shadow-lg transition-all duration-200 cursor-pointer" size="sm">
      <div className="flex items-center gap-3">
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-tertiary/10 flex items-center justify-center">
          <svg className="w-5 h-5 text-tertiary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
            />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-text-secondary truncate">{formatPoint(nav.from)}</span>
            <svg className="w-4 h-4 text-text-muted flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
            <span className="text-text-secondary truncate">{formatPoint(nav.to)}</span>
          </div>
          <p className="text-xs text-text-muted">
            Searched {safeFormatDistance(nav.searched_at, { addSuffix: true })}
          </p>
        </div>
        <svg
          className="w-5 h-5 text-text-muted group-hover:text-accent transition-colors"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </Card>
  );
};
