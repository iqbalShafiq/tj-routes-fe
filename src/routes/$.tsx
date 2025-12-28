import { createFileRoute, Link } from '@tanstack/react-router';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';

export const Route = createFileRoute('/$')({
  component: NotFoundPage,
});

function NotFoundPage() {
  return (
    <div className="animate-fade-in w-full">
      <div className="w-full max-w-3xl md:max-w-5xl lg:max-w-6xl xl:max-w-7xl 2xl:max-w-[90rem] mx-auto px-6">
        {/* Main 404 Content */}
        <div className="text-center">
          {/* Icon Container */}
          <div className="inline-flex items-center justify-center w-24 h-24 bg-accent-light mb-6 rounded-sm relative">
            <svg
              className="w-12 h-12 text-accent"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>

          {/* 404 Number */}
          <h1 className="text-8xl md:text-9xl font-display font-bold text-text-primary mb-4 leading-none">
            404
          </h1>

          {/* Title */}
          <h2 className="text-3xl md:text-4xl font-display font-semibold text-text-primary mb-3">
            Route Not Found
          </h2>

          {/* Description */}
          <p className="text-lg text-text-secondary mb-8 max-w-md mx-auto">
            Looks like you've taken a wrong turn. This route doesn't exist in our system.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/feed">
              <Button variant="primary" size="lg" className="w-full sm:w-auto">
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                  />
                </svg>
                Go to Feed
              </Button>
            </Link>
          </div>
        </div>

        {/* Helpful Links */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link
            to="/feed"
            className="block"
          >
            <Card size="sm" className="group">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-accent-light rounded-sm flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                <svg
                  className="w-5 h-5 text-accent"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              <div className="text-left">
                <p className="font-display font-medium text-text-primary group-hover:text-accent transition-colors">
                  Community Feed
                </p>
                <p className="text-sm text-text-muted">See latest reports</p>
              </div>
            </div>
            </Card>
          </Link>

          <Link
            to="/routes"
            className="block"
          >
            <Card size="sm" className="group">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-accent-light rounded-sm flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                <svg
                  className="w-5 h-5 text-accent"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                  />
                </svg>
              </div>
              <div className="text-left">
                <p className="font-display font-medium text-text-primary group-hover:text-accent transition-colors">
                  All Routes
                </p>
                <p className="text-sm text-text-muted">Browse TransJakarta</p>
              </div>
            </div>
            </Card>
          </Link>

          <Link
            to="/stops"
            className="block"
          >
            <Card size="sm" className="group">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-accent-light rounded-sm flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                <svg
                  className="w-5 h-5 text-accent"
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
              </div>
              <div className="text-left">
                <p className="font-display font-medium text-text-primary group-hover:text-accent transition-colors">
                  Stops
                </p>
                <p className="text-sm text-text-muted">Browse bus stops</p>
              </div>
            </div>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
}

