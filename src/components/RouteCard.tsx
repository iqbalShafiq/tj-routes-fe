import { Link } from "@tanstack/react-router";
import { Card } from "./ui/Card";
import { Chip } from "./ui/Chip";
import type { Route } from "../lib/api/routes";

interface RouteCardProps {
  route: Route;
}

export const RouteCard = ({ route }: RouteCardProps) => {
  const stopsCount = route.stops?.length || route.route_stops?.length || 0;
  
  return (
    <Link to="/routes/$routeId" params={{ routeId: route.id.toString() }}>
      <Card className="h-full group cursor-pointer hover:shadow-lg transition-all duration-200" size="md">
        {/* Header: Number and Status */}
        <div className="flex items-start justify-between mb-3">
          <span className="text-4xl font-display font-bold text-slate-900 leading-none">
            {route.code}
          </span>
          {route.status === "active" && (
            <Chip variant="success">
              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
              Active
            </Chip>
          )}
        </div>

        {/* Route Name */}
        <h3 className="text-lg font-display font-bold text-slate-900 mb-2 group-hover:text-amber-600 transition-colors truncate">
          {route.name}
        </h3>

        {/* Description */}
        {route.description && (
          <p className="text-sm text-slate-600 mb-4 line-clamp-1 leading-relaxed">
            {route.description}
          </p>
        )}

        {/* Footer: Stops and Details */}
        <div className="flex items-center justify-between mt-auto pt-2">
          {stopsCount > 0 && (
            <div className="flex items-center gap-1.5 text-sm text-slate-500">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
              <span className="font-medium">
                {stopsCount} {stopsCount === 1 ? "Stop" : "Stops"}
              </span>
            </div>
          )}
          <span className="text-sm font-medium text-amber-600 group-hover:text-amber-700 transition-colors flex items-center gap-1 ml-auto">
            Details
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </span>
        </div>
      </Card>
    </Link>
  );
};
