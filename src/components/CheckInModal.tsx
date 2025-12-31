import { useState, useEffect, useMemo } from 'react';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';
import { Select } from './ui/Select';
import { Textarea } from './ui/Textarea';
import { Card } from './ui/Card';
import { Chip } from './ui/Chip';
import { useStartCheckIn, useCompleteCheckIn } from '../lib/hooks/useCheckIn';
import type { Route, RouteStop } from '../lib/api/routes';
import type { Stop } from '../lib/api/stops';
import type { CheckIn } from '../lib/api/checkin';

interface CheckInModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'start' | 'complete';
  route?: Route;
  routeStops?: RouteStop[];
  activeCheckIn?: CheckIn | null;
  onCheckInStart?: (checkIn: CheckIn) => void;
  onCheckInComplete?: (checkIn: CheckIn) => void;
}

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

// Calculate elapsed time from start time
const calculateElapsedTime = (startTime: string): number => {
  const start = new Date(startTime).getTime();
  const now = Date.now();
  return Math.floor((now - start) / 1000);
};

export function CheckInModal({
  isOpen,
  onClose,
  mode,
  route,
  routeStops,
  activeCheckIn,
  onCheckInStart,
  onCheckInComplete,
}: CheckInModalProps) {
  // Start mode state
  const [startStopId, setStartStopId] = useState<string | number>('');
  const [startNotes, setStartNotes] = useState('');

  // Complete mode state
  const [endStopId, setEndStopId] = useState<string | number>('');
  const [endNotes, setEndNotes] = useState('');

  // Elapsed time for complete mode
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Mutations
  const startCheckInMutation = useStartCheckIn();
  const completeCheckInMutation = useCompleteCheckIn();

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setStartStopId('');
      setStartNotes('');
      setEndStopId('');
      setEndNotes('');
      setElapsedSeconds(0);
    }
  }, [isOpen]);

  // Update elapsed time for complete mode
  useEffect(() => {
    if (mode === 'complete' && activeCheckIn?.start_time) {
      setElapsedSeconds(calculateElapsedTime(activeCheckIn.start_time));

      const interval = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [mode, isOpen, activeCheckIn?.start_time]);

  // Extract stops from routeStops or use empty array
  const stops: Stop[] = useMemo(() => {
    if (routeStops && routeStops.length > 0) {
      return routeStops
        .map((rs) => rs.stop)
        .filter((stop): stop is Stop => stop !== undefined);
    }
    return [];
  }, [routeStops]);

  // Stop options for select component
  const stopOptions = stops.map((stop) => ({
    value: stop.id,
    label: stop.name,
  }));

  // Handle start check-in
  const handleStartCheckIn = async () => {
    if (!route || !startStopId) return;

    try {
      const checkIn = await startCheckInMutation.mutateAsync({
        route_id: route.id,
        start_stop_id: Number(startStopId),
        notes: startNotes || undefined,
      });
      onCheckInStart?.(checkIn);
      onClose();
    } catch (error) {
      console.error('Failed to start check-in:', error);
    }
  };

  // Handle complete check-in
  const handleCompleteCheckIn = async () => {
    if (!activeCheckIn || !endStopId) return;

    try {
      const checkIn = await completeCheckInMutation.mutateAsync({
        id: activeCheckIn.id,
        data: {
          end_stop_id: Number(endStopId),
          notes: endNotes || undefined,
        },
      });
      onCheckInComplete?.(checkIn);
      onClose();
    } catch (error) {
      console.error('Failed to complete check-in:', error);
    }
  };

  // Loading state
  const isLoading = startCheckInMutation.isPending || completeCheckInMutation.isPending;

  // Validation
  const isStartValid = route && startStopId && !isLoading;
  const isCompleteValid = activeCheckIn && endStopId && !isLoading;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === 'start' ? 'Start Check-in' : 'Complete Journey'}
      size="md"
    >
      <div className="space-y-6">
        {/* Route Info Card */}
        {mode === 'start' && route && (
          <Card size="sm" static>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-accent text-white flex items-center justify-center font-display font-bold">
                {route.route_number}
              </div>
              <div>
                <p className="font-display font-semibold text-text-primary">{route.name}</p>
                <p className="text-sm text-text-muted">
                  {stops.length} stops on this route
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Active Check-in Info */}
        {mode === 'complete' && activeCheckIn && (
          <Card size="sm" static>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-text-muted">Status</span>
                <Chip variant="success" size="sm">
                  In Progress
                </Chip>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-text-muted">Started</span>
                <span className="text-sm font-medium text-text-primary">
                  {new Date(activeCheckIn.start_time).toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-text-muted">From</span>
                <span className="text-sm font-medium text-text-primary">
                  {activeCheckIn.start_stop?.name || 'Unknown Stop'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-text-muted">Elapsed</span>
                <span className="text-lg font-display font-bold text-accent">
                  {formatDuration(elapsedSeconds)}
                </span>
              </div>
              {activeCheckIn.route && (
                <div className="flex items-center justify-between pt-2 border-t border-border">
                  <span className="text-sm text-text-muted">Route</span>
                  <span className="text-sm font-medium text-text-primary">
                    {activeCheckIn.route.route_number} - {activeCheckIn.route.name}
                  </span>
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Start Stop Select */}
        {mode === 'start' ? (
          <Select
            label="Select Start Stop"
            placeholder="Choose your starting stop..."
            value={startStopId}
            onChange={(value) => setStartStopId(value)}
            options={stopOptions}
            searchable
            required
            error={!startStopId && startCheckInMutation.isError ? 'Please select a starting stop' : undefined}
          />
        ) : (
          <Select
            label="Select End Stop"
            placeholder="Where are you getting off?"
            value={endStopId}
            onChange={(value) => setEndStopId(value)}
            options={stopOptions}
            searchable
            required
            error={!endStopId && completeCheckInMutation.isError ? 'Please select an ending stop' : undefined}
          />
        )}

        {/* Notes */}
        <Textarea
          label={mode === 'start' ? 'Notes (optional)' : 'Add notes (optional)'}
          placeholder={mode === 'start' ? 'Any notes about your journey...' : 'Add any final notes...'}
          value={mode === 'start' ? startNotes : endNotes}
          onChange={(e) => mode === 'start' ? setStartNotes(e.target.value) : setEndNotes(e.target.value)}
          rows={3}
          maxLength={500}
        />

        {/* Points Info */}
        <div className="flex items-center gap-2 p-3 bg-accent/5 rounded-lg border border-accent/20">
          <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
          <span className="text-sm text-text-secondary">
            Complete your journey to earn <strong className="text-accent">5 reputation points</strong>
          </span>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <Button variant="secondary" onClick={onClose} disabled={isLoading} className="flex-1">
            Cancel
          </Button>
          {mode === 'start' ? (
            <Button
              variant="primary"
              onClick={handleStartCheckIn}
              disabled={!isStartValid}
              className="flex-1"
            >
              {isLoading ? 'Starting...' : 'Start Check-in'}
            </Button>
          ) : (
            <Button
              variant="primary"
              onClick={handleCompleteCheckIn}
              disabled={!isCompleteValid}
              className="flex-1"
            >
              {isLoading ? 'Completing...' : 'Complete Journey'}
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
}
