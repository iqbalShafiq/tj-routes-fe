import { Link } from "@tanstack/react-router";
import { Card, CardBody, CardFooter } from "./ui/Card";
import type { Route } from "../lib/api/routes";

interface RouteCardProps {
  route: Route;
}

export const RouteCard = ({ route }: RouteCardProps) => {
  return (
    <Link to="/routes/$routeId" params={{ routeId: route.id.toString() }}>
      <Card className="h-full group cursor-pointer">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="inline-flex items-center gap-2 mb-2">
              <span className="text-2xl font-display font-bold text-slate-900">
                {route.code}
              </span>
              {route.status === "active" && (
                <span className="px-2 py-1 text-xs font-medium bg-emerald-100 text-emerald-700 card-chamfered-sm">
                  Active
                </span>
              )}
            </div>
            <h3 className="text-lg font-display font-semibold text-slate-900 mb-2 group-hover:text-amber-600 transition-colors truncate">
              {route.name}
            </h3>
          </div>
        </div>
        <CardBody>
          <div className="mb-4 h-[3rem]">
            {route.description ? (
              <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed">
                {route.description}
              </p>
            ) : (
              <p className="text-sm text-slate-400 line-clamp-2 leading-relaxed">
                &nbsp;
              </p>
            )}
          </div>
          {(route.stops || route.route_stops) &&
            (route.stops?.length || route.route_stops?.length) > 0 && (
              <div className="flex items-center gap-2 text-sm text-slate-500">
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
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <span className="font-medium">
                  {route.stops?.length || route.route_stops?.length || 0}
                </span>
                <span>
                  {(route.stops?.length || route.route_stops?.length || 0) === 1
                    ? "stop"
                    : "stops"}
                </span>
              </div>
            )}
        </CardBody>
        <CardFooter>
          <span className="text-sm font-medium text-amber-600 group-hover:text-amber-700 transition-colors">
            View Details →
          </span>
        </CardFooter>
      </Card>
    </Link>
  );
};
