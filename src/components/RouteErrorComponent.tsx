import { Link } from '@tanstack/react-router';
import { Button } from './ui/Button';

export const RouteErrorComponent = ({ error, reset }: { error: Error; reset?: () => void }) => (
  <div className="text-center py-20 animate-fade-in">
    <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 mb-4 card-chamfered">
      <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    </div>
    <p className="text-red-600 font-display text-lg mb-2">
      {error.message || 'Something went wrong'}
    </p>
    <p className="text-text-secondary text-sm mb-4">Please try again later.</p>
    <div className="flex gap-2 justify-center">
      {reset && (
        <Button onClick={reset} variant="outline">
          Try Again
        </Button>
      )}
      <Link to="/feed" search={{ sort: 'recent', hashtag: undefined, followed: undefined }}>
        <Button variant="primary">Go Home</Button>
      </Link>
    </div>
  </div>
);
