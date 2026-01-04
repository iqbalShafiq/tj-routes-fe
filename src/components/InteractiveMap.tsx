import React, { useEffect, useCallback, useRef } from 'react';
import { Map, MapMarker, MapRoute, MapControls, useMap } from './ui/map';
import type { Stop } from '../lib/api/stops';

interface InteractiveMapProps {
  stops: Stop[];
  hoveredStopId: number | null;
  onHoverStopIdChange: (stopId: number | null) => void;
  focusedStopId: number | null;
  onFocusedStopIdChange: (stopId: number | null) => void;
  className?: string;
  showRoute?: boolean;
  routeColor?: string;
  initialZoom?: number;
}

// Nested component that accesses the map via useMap hook
function MapFlyController({
  focusedStopId,
  validStops,
}: {
  focusedStopId: number | null;
  validStops: Stop[];
}) {
  const { map, isLoaded } = useMap();

  useEffect(() => {
    if (!map || !isLoaded) return;

    if (focusedStopId === null) {
      // Fly back to route center when unfocused
      const center = validStops.length > 0
        ? [
            validStops.reduce((sum, s) => sum + s.longitude, 0) / validStops.length,
            validStops.reduce((sum, s) => sum + s.latitude, 0) / validStops.length,
          ]
        : [0, 0];

      map.flyTo({
        center,
        zoom: 13,
        duration: 800,
        essential: true,
      });
    } else {
      // Fly to focused stop
      const focusedStop = validStops.find((s) => s.id === focusedStopId);
      if (focusedStop && typeof focusedStop.latitude === 'number' && typeof focusedStop.longitude === 'number') {
        map.flyTo({
          center: [focusedStop.longitude, focusedStop.latitude],
          zoom: 15,
          duration: 800,
          essential: true,
        });
      }
    }
  }, [focusedStopId, validStops, map, isLoaded]);

  return null;
}

export function InteractiveMap({
  stops,
  hoveredStopId,
  onHoverStopIdChange,
  focusedStopId,
  onFocusedStopIdChange,
  className = '',
  showRoute = true,
  routeColor = '#1B4D3E',
  initialZoom = 13,
}: InteractiveMapProps) {
  // Filter stops with valid coordinates
  const validStops = stops.filter(
    (stop) =>
      typeof stop.latitude === 'number' &&
      typeof stop.longitude === 'number' &&
      !isNaN(stop.latitude) &&
      !isNaN(stop.longitude)
  );

  // Calculate center from all valid stops
  const center: [number, number] = validStops.length > 0
    ? [
        validStops.reduce((sum, s) => sum + s.longitude, 0) / validStops.length,
        validStops.reduce((sum, s) => sum + s.latitude, 0) / validStops.length,
      ]
    : [0, 0];

  // Convert stops to coordinates for route line
  const routeCoordinates: [number, number][] = validStops.map((stop) => [
    stop.longitude,
    stop.latitude,
  ]);

  // Handle marker click - memoized to prevent marker recreation
  // Use ref to track focusedStopId without adding it to dependencies
  const focusedStopIdRef = React.useRef(focusedStopId);
  focusedStopIdRef.current = focusedStopId;

  const handleMarkerClick = useCallback((stopId: number) => {
    onFocusedStopIdChange(stopId === focusedStopIdRef.current ? null : stopId);
  }, [onFocusedStopIdChange]);

  // Handle marker hover - memoized to prevent marker recreation
  const handleMarkerMouseEnter = useCallback((stopId: number) => {
    onHoverStopIdChange(stopId);
  }, [onHoverStopIdChange]);

  const handleMarkerMouseLeave = useCallback(() => {
    onHoverStopIdChange(null);
  }, [onHoverStopIdChange]);

  if (validStops.length === 0) {
    return (
      <div
        className={`flex items-center justify-center bg-bg-elevated text-text-muted ${className}`}
        style={{ minHeight: '300px' }}
      >
        <div className="text-center">
          <svg
            className="w-12 h-12 mx-auto mb-2 opacity-50"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
            />
          </svg>
          <p className="text-sm">No stops with valid coordinates</p>
        </div>
      </div>
    );
  }

  return (
    <Map
      center={center}
      zoom={initialZoom}
      className={className}
      style={{ height: '100%', minHeight: '400px' }}
    >
      {/* Route line */}
      {showRoute && routeCoordinates.length >= 2 && (
        <MapRoute
          coordinates={routeCoordinates}
          color={routeColor}
          width={4}
          opacity={0.8}
        />
      )}

      {/* Stop markers with sequence numbers */}
      {validStops.map((stop, index) => {
        const isHighlighted = stop.id === hoveredStopId;
        const isFocused = stop.id === focusedStopId;

        return (
          <MapMarker
            key={stop.id}
            longitude={stop.longitude}
            latitude={stop.latitude}
            stopId={stop.id}
            isHighlighted={isHighlighted}
            isFocused={isFocused}
            onClick={handleMarkerClick}
            onMouseEnter={handleMarkerMouseEnter}
            onMouseLeave={handleMarkerMouseLeave}
          >
            <div
              className={`
                w-10 h-10 rounded-full flex items-center justify-center
                font-bold text-sm transition-all duration-200 cursor-pointer
                border-2 border-white shadow-lg
                ${isFocused
                  ? 'bg-accent text-white scale-125 shadow-xl z-10'
                  : isHighlighted
                    ? 'bg-accent-light text-accent scale-110 shadow-lg border-accent'
                    : 'bg-accent text-white hover:scale-110'
                }
              `}
            >
              {index + 1}
            </div>
          </MapMarker>
        );
      })}

      {/* Controller for flyTo behavior */}
      <MapFlyController focusedStopId={focusedStopId} validStops={validStops} />

      <MapControls position="bottom-right" showZoom={true} showCompass={true} />
    </Map>
  );
}
