import { Card } from './ui/Card';
import type { Route } from '../lib/api/routes';

interface RouteDetailProps {
  route: Route;
}

export const RouteDetail = ({ route }: RouteDetailProps) => {
  return (
    <div className="max-w-5xl">
      {/* Route Info Card */}
      <Card static className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 bg-slate-900 flex items-center justify-center card-chamfered">
            <span className="text-white font-display font-bold text-xl">{route.code}</span>
          </div>
          {route.status === 'active' && (
            <span className="px-3 py-1.5 text-sm font-medium bg-emerald-100 text-emerald-700 card-chamfered-sm">
              Active
            </span>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          <div className="p-4 bg-slate-50 card-chamfered-sm">
            <p className="text-sm text-slate-500 mb-1">Total Stops</p>
            <p className="text-2xl font-display font-bold text-slate-900">
              {route.stops?.length || route.route_stops?.length || 0}
            </p>
          </div>
          <div className="p-4 bg-slate-50 card-chamfered-sm">
            <p className="text-sm text-slate-500 mb-1">Status</p>
            <p className="text-2xl font-display font-bold text-slate-900 capitalize">
              {route.status || 'Active'}
            </p>
          </div>
          <div className="p-4 bg-slate-50 card-chamfered-sm">
            <p className="text-sm text-slate-500 mb-1">Route ID</p>
            <p className="text-2xl font-display font-bold text-slate-900">
              #{route.id}
            </p>
          </div>
        </div>
      </Card>

      {/* Route Stops */}
      {route.stops && route.stops.length > 0 && (
        <Card static>
          <div className="mb-6">
            <h2 className="text-2xl font-display font-bold text-slate-900 mb-2">Route Stops</h2>
            <p className="text-slate-600">{route.stops.length} stops in sequence</p>
          </div>
          <div className="space-y-3">
            {route.stops
              .sort((a, b) => (a.sequence || 0) - (b.sequence || 0))
              .map((stop, index) => (
                <div
                  key={stop.id}
                  className="group relative flex items-start gap-4 p-5 border-2 border-slate-200 hover:border-amber-300 hover:bg-amber-50/30 transition-all duration-200 animate-fade-in card-chamfered-sm"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex-shrink-0 w-12 h-12 bg-slate-900 text-white flex items-center justify-center font-display font-bold text-lg shadow-md group-hover:shadow-lg transition-shadow card-chamfered-sm">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-display font-semibold text-slate-900 text-lg mb-1 group-hover:text-amber-700 transition-colors">
                      {stop.name}
                    </h4>
                    {stop.code && (
                      <p className="text-sm text-slate-500 font-mono mb-2">Code: {stop.code}</p>
                    )}
                    {stop.address && (
                      <div className="flex items-start gap-2 mt-2">
                        <svg className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <p className="text-sm text-slate-600 leading-relaxed">{stop.address}</p>
                      </div>
                    )}
                    {stop.facilities && stop.facilities.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {stop.facilities.map((facility, i) => (
                          <span
                            key={i}
                            className="px-3 py-1.5 text-xs font-medium bg-amber-100 text-amber-700 card-chamfered-sm"
                          >
                            {facility}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
          </div>
        </Card>
      )}
    </div>
  );
};
