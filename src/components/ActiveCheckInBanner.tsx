import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useQueryClient } from '@tanstack/react-query';
import { useActiveCheckIn, useCompleteCheckIn, checkInKeys } from '../lib/hooks/useCheckIn';
import { Button } from './ui/Button';
import { CheckInModal } from './CheckInModal';
import type { CheckIn } from '../lib/api/checkin';

// Format duration in seconds to human readable string
const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  }
  return `${secs}s`;
};

export function ActiveCheckInBanner() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: activeCheckIn, isLoading } = useActiveCheckIn();
  const completeCheckInMutation = useCompleteCheckIn();

  const [isVisible, setIsVisible] = useState(true);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [showCompleteModal, setShowCompleteModal] = useState(false);

  // Listen for invalidation events from other components
  useEffect(() => {
    const handleInvalidate = () => {
      queryClient.invalidateQueries({ queryKey: checkInKeys.all });
    };

    window.addEventListener('invalidate-checkin', handleInvalidate);
    return () => window.removeEventListener('invalidate-checkin', handleInvalidate);
  }, [queryClient]);

  // Calculate elapsed time
  useEffect(() => {
    if (activeCheckIn?.start_time) {
      const calculateElapsed = () => {
        const start = new Date(activeCheckIn.start_time).getTime();
        const now = Date.now();
        return Math.floor((now - start) / 1000);
      };

      setElapsedSeconds(calculateElapsed());

      const interval = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [activeCheckIn?.start_time, activeCheckIn]);

  // Hide banner if no active check-in
  useEffect(() => {
    if (!activeCheckIn) {
      setIsVisible(false);
    }
  }, [activeCheckIn]);

  // Navigate to the route of the active check-in
  const handleViewRoute = useCallback(() => {
    if (activeCheckIn?.route_id) {
      navigate({ to: '/routes/$routeId', params: { routeId: String(activeCheckIn.route_id) } });
    }
  }, [navigate, activeCheckIn?.route_id]);

  // Open complete modal
  const handleOpenCompleteModal = useCallback(() => {
    setShowCompleteModal(true);
  }, []);

  // Handle check-in completion
  const handleCheckInComplete = useCallback((_checkIn: CheckIn) => {
    setShowCompleteModal(false);
    setIsVisible(false);
  }, []);

  // Dismiss banner
  const handleDismiss = useCallback(() => {
    setIsVisible(false);
  }, []);

  // Don't show if loading or no active check-in
  if (isLoading || !activeCheckIn || !isVisible) {
    return null;
  }

  const route = activeCheckIn.route;
  const startStop = activeCheckIn.start_stop;

  return (
    <>
      {/* Banner */}
      <div
        className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-accent to-accent-hover animate-slide-in"
        role="banner"
      >
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            {/* Left: Check-in Info */}
            <div className="flex items-center gap-4 flex-1 min-w-0">
              {/* Icon */}
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-white/70 uppercase tracking-wider">
                    Journey in Progress
                  </span>
                  <span className="px-1.5 py-0.5 text-xs bg-white/20 rounded text-white font-medium">
                    +5 pts
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  {route && (
                    <span className="text-sm font-display font-semibold text-white">
                      Route {route.route_number}
                    </span>
                  )}
                  <span className="text-white/50">•</span>
                  <span className="text-sm text-white/80 truncate">
                    {startStop?.name || 'Unknown stop'}
                  </span>
                </div>
              </div>
            </div>

            {/* Center: Timer */}
            <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-white/10 rounded-lg">
              <svg className="w-4 h-4 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-lg font-mono font-bold text-white">
                {formatDuration(elapsedSeconds)}
              </span>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <Button
                variant="secondary"
                size="sm"
                onClick={handleViewRoute}
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
                View Route
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleOpenCompleteModal}
                disabled={completeCheckInMutation.isPending}
                className="bg-white text-accent hover:bg-white/90"
              >
                {completeCheckInMutation.isPending ? 'Completing...' : 'Complete'}
              </Button>
              <button
                onClick={handleDismiss}
                className="p-1 text-white/60 hover:text-white transition-colors"
                aria-label="Dismiss banner"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Spacer to prevent content from being hidden behind banner */}
      <div className="h-[60px] flex-shrink-0" />

      {/* Complete Check-in Modal */}
      <CheckInModal
        isOpen={showCompleteModal}
        onClose={() => setShowCompleteModal(false)}
        mode="complete"
        activeCheckIn={activeCheckIn}
        onCheckInComplete={handleCheckInComplete}
        route={undefined}
        routeStops={
          activeCheckIn.start_stop
            ? [{ id: 0, route_id: 0, stop_id: activeCheckIn.start_stop.id, sequence_order: 0, stop: activeCheckIn.start_stop } as any]
            : undefined
        }
      />
    </>
  );
}
