"use client";

import React, {
  useEffect,
  useMemo,
  useState,
  createContext,
  useContext,
  useRef,
} from "react";
import maplibregl from "maplibre-gl";
import type {
  MapOptions,
  MarkerOptions,
  StyleSpecification,
} from "maplibre-gl";

interface MapContextValue {
  map: maplibregl.Map | null;
  isLoaded: boolean;
}

const MapContext = createContext<MapContextValue>({
  map: null,
  isLoaded: false,
});

export const useMap = () => useContext(MapContext);

// Default CARTO basemap styles
const DEFAULT_LIGHT_STYLE =
  "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json";
const DEFAULT_DARK_STYLE =
  "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json";

interface MapProps extends Omit<MapOptions, "container" | "style"> {
  center?: [number, number];
  zoom?: number;
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  styles?: {
    light?: string | StyleSpecification;
    dark?: string | StyleSpecification;
  };
}

export function Map({
  center = [0, 0],
  zoom = 10,
  children,
  className,
  style,
  styles,
  ...options
}: MapProps) {
  const mapContainerRef = React.useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<maplibregl.Map | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Determine which style to use based on theme
  const mapStyle = useMemo(() => {
    const lightStyle = styles?.light || DEFAULT_LIGHT_STYLE;
    const darkStyle = styles?.dark || DEFAULT_DARK_STYLE;
    const isDark = document.documentElement.classList.contains("dark");
    return isDark ? darkStyle : lightStyle;
  }, [styles]);

  useEffect(() => {
    if (!mapContainerRef.current || map) return;

    const mapInstance = new maplibregl.Map({
      container: mapContainerRef.current,
      style: mapStyle,
      center,
      zoom,
      ...options,
    });

    mapInstance.on("load", () => setIsLoaded(true));

    setMap(mapInstance);

    return () => {
      mapInstance.remove();
      setMap(null);
    };
  }, []);

  // Update center and zoom when props change
  useEffect(() => {
    if (!map || !isLoaded) return;
    map.flyTo({ center, zoom, duration: 1000 });
  }, [map, isLoaded, center, zoom]);

  // Watch for theme changes
  useEffect(() => {
    if (!map || !isLoaded) return;

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (
          mutation.type === "attributes" &&
          mutation.attributeName === "class"
        ) {
          const isDark = document.documentElement.classList.contains("dark");
          const newStyle = isDark
            ? styles?.dark || DEFAULT_DARK_STYLE
            : styles?.light || DEFAULT_LIGHT_STYLE;
          map.setStyle(newStyle);
        }
      });
    });

    observer.observe(document.documentElement, { attributes: true });
    return () => observer.disconnect();
  }, [map, isLoaded, styles]);

  return (
    <MapContext.Provider value={{ map, isLoaded }}>
      <div
        ref={mapContainerRef}
        className={`w-full h-full ${className || ""}`}
        style={{ minHeight: "300px", ...style }}
      >
        {children}
      </div>
    </MapContext.Provider>
  );
}

interface MapControlsProps {
  position?: "top-left" | "top-right" | "bottom-left" | "bottom-right";
  showZoom?: boolean;
  showCompass?: boolean;
  showLocate?: boolean;
  showFullscreen?: boolean;
  onLocate?: (coords: { longitude: number; latitude: number }) => void;
}

export function MapControls({
  position = "bottom-right",
  showZoom = true,
  showCompass = false,
  showLocate = false,
  showFullscreen = false,
  onLocate,
}: MapControlsProps) {
  const { map } = useMap();

  useEffect(() => {
    if (!map) return;

    if (showZoom) {
      map.addControl(
        new maplibregl.NavigationControl({ showZoom: true, showCompass }),
        position
      );
    }

    if (showFullscreen) {
      map.addControl(new maplibregl.FullscreenControl(), position);
    }

    if (showLocate) {
      const locateControl = new maplibregl.GeolocateControl({
        positionOptions: { enableHighAccuracy: true },
        trackUserLocation: true,
        showUserLocation: true,
      });
      locateControl.on("geolocate", (e) => {
        if (onLocate) {
          onLocate({
            longitude: e.coords.longitude,
            latitude: e.coords.latitude,
          });
        }
      });
      map.addControl(locateControl, position);
    }
  }, [
    map,
    position,
    showZoom,
    showCompass,
    showLocate,
    showFullscreen,
    onLocate,
  ]);

  return null;
}

interface MapMarkerProps extends Omit<MarkerOptions, "element"> {
  longitude: number;
  latitude: number;
  children?: React.ReactNode;
  stopId?: number;
  isHighlighted?: boolean;
  isFocused?: boolean;
  onClick?: (stopId: number, e: maplibregl.MapMouseEvent) => void;
  onMouseEnter?: (stopId: number, e: maplibregl.MapMouseEvent) => void;
  onMouseLeave?: (stopId: number, e: maplibregl.MapMouseEvent) => void;
  onDragStart?: (lngLat: { lng: number; lat: number }) => void;
  onDrag?: (lngLat: { lng: number; lat: number }) => void;
  onDragEnd?: (lngLat: { lng: number; lat: number }) => void;
}

// Helper to check if a child is a MarkerTooltip
function isMarkerTooltip(child: React.ReactNode): boolean {
  if (!child || typeof child !== "object") return false;
  const type = (child as { type?: { name?: string } })?.type;
  return type?.name === "MarkerTooltip";
}

// Helper to get tooltip content from children
function extractTooltipContent(
  children: React.ReactNode
): React.ReactNode | null {
  if (!children) return null;
  const childrenArray = React.Children.toArray(children);
  for (const child of childrenArray) {
    if (isMarkerTooltip(child)) {
      return (
        (child as React.ReactElement<{ children?: React.ReactNode }>)?.props
          ?.children ?? null
      );
    }
  }
  return null;
}

export function MapMarker({
  longitude,
  latitude,
  children,
  stopId,
  isHighlighted = false,
  isFocused = false,
  onClick,
  onMouseEnter,
  onMouseLeave,
  onDragStart,
  onDrag,
  onDragEnd,
  ...options
}: MapMarkerProps) {
  const { map, isLoaded } = useMap();
  const markerRef = React.useRef<maplibregl.Marker | null>(null);
  const popupRef = React.useRef<maplibregl.Popup | null>(null);

  // Extract tooltip content from children
  const tooltipContent = extractTooltipContent(children);
  const markerContent = React.Children.toArray(children).filter(
    (child) => !isMarkerTooltip(child)
  );

  // Create marker element on mount, remove on unmount - don't render anything in React tree
  useEffect(() => {
    if (!map || !isLoaded) return;

    // Helper to extract text/number from React nodes
    const extractNodeText = (node: React.ReactNode): string => {
      if (node === null || node === undefined) return "";
      if (typeof node === "string") return node;
      if (typeof node === "number") return String(node);
      if (Array.isArray(node)) return node.map(extractNodeText).join("");
      if (React.isValidElement(node)) {
        const props = node.props as { children?: React.ReactNode };
        return extractNodeText(props.children);
      }
      return "";
    };

    // Create marker element programmatically
    const markerElement = document.createElement("div");
    markerElement.className = "maplibre-marker-wrapper cursor-pointer";
    markerElement.style.width = "auto";
    markerElement.style.height = "auto";

    // Create content element with proper styling
    const contentElement = document.createElement("div");
    contentElement.className = "w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border-2 border-white shadow-lg bg-accent text-white";
    contentElement.textContent = markerContent.length > 0 ? extractNodeText(markerContent[0]) : "?";
    markerElement.appendChild(contentElement);

    const marker = new maplibregl.Marker({
      element: markerElement,
      ...options,
    })
      .setLngLat([longitude, latitude])
      .addTo(map);

    if (onClick && stopId !== undefined) {
      marker
        .getElement()
        .addEventListener("click", (e) =>
          onClick(stopId, e as unknown as maplibregl.MapMouseEvent)
        );
    }
    if (onMouseEnter && stopId !== undefined) {
      marker
        .getElement()
        .addEventListener("mouseenter", (e) =>
          onMouseEnter(stopId, e as unknown as maplibregl.MapMouseEvent)
        );
    }
    if (onMouseLeave && stopId !== undefined) {
      marker
        .getElement()
        .addEventListener("mouseleave", (e) =>
          onMouseLeave(stopId, e as unknown as maplibregl.MapMouseEvent)
        );
    }

    // Tooltip functionality - show popup on hover
    if (tooltipContent) {
      marker.getElement().addEventListener("mouseenter", () => {
        if (!popupRef.current) {
          const popupContainer = document.createElement("div");
          popupContainer.className = "map-tooltip-container p-2";

          // Extract text content from tooltip
          if (typeof tooltipContent === "string") {
            popupContainer.textContent = tooltipContent;
          } else {
            // Extract text from React elements
            const extractText = (node: React.ReactNode): string => {
              if (typeof node === "string") return node;
              if (typeof node === "number") return String(node);
              if (Array.isArray(node)) return node.map(extractText).join("");
              if (node && typeof node === "object") {
                const element = node as React.ReactElement<{
                  children?: React.ReactNode;
                }>;
                if ("props" in element && element.props) {
                  return extractText(element.props.children);
                }
              }
              return "";
            };
            const textContent = extractText(tooltipContent);
            if (textContent) {
              popupContainer.textContent = textContent;
            }
          }

          popupRef.current = new maplibregl.Popup({
            closeButton: false,
            closeOnClick: false,
            offset: 8,
            className: "maplibre-tooltip",
          })
            .setLngLat([longitude, latitude])
            .setDOMContent(popupContainer)
            .addTo(map);
        }
      });

      marker.getElement().addEventListener("mouseleave", () => {
        if (popupRef.current) {
          popupRef.current.remove();
          popupRef.current = null;
        }
      });
    }

    if (options.draggable) {
      marker.on("dragstart", () => {
        const lngLat = marker.getLngLat();
        if (onDragStart) onDragStart({ lng: lngLat.lng, lat: lngLat.lat });
      });
      marker.on("drag", () => {
        const lngLat = marker.getLngLat();
        if (onDrag) onDrag({ lng: lngLat.lng, lat: lngLat.lat });
      });
      marker.on("dragend", () => {
        const lngLat = marker.getLngLat();
        if (onDragEnd) onDragEnd({ lng: lngLat.lng, lat: lngLat.lat });
      });
    }

    markerRef.current = marker;

    return () => {
      // Safely clean up popup with try-catch to handle already-removed elements
      try {
        if (popupRef.current) {
          popupRef.current.remove();
          popupRef.current = null;
        }
      } catch {
        popupRef.current = null;
      }

      // Safely remove marker with try-catch
      try {
        if (markerRef.current) {
          markerRef.current.remove();
          markerRef.current = null;
        }
      } catch {
        markerRef.current = null;
      }
    };
  }, [
    map,
    isLoaded,
    longitude,
    latitude,
    onClick,
    onMouseEnter,
    onMouseLeave,
    onDragStart,
    onDrag,
    onDragEnd,
    tooltipContent,
    options,
  ]);
  // Return null - MapLibre manages the DOM, React should not render anything
  return null;
}

interface MarkerContentProps {
  children?: React.ReactNode;
  className?: string;
}

export function MarkerContent({ children, className }: MarkerContentProps) {
  return (
    <div className={`maplibre-marker-content ${className || ""}`}>
      {children || (
        <div className="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-md" />
      )}
    </div>
  );
}

interface MarkerTooltipProps {
  children?: React.ReactNode;
  className?: string;
}

export function MarkerTooltip({}: MarkerTooltipProps) {
  return null;
}

interface MarkerPopupProps {
  children?: React.ReactNode;
  className?: string;
  closeButton?: boolean;
  closeOnClick?: boolean;
  anchor?: "top" | "bottom" | "left" | "right";
}

export function MarkerPopup({}: MarkerPopupProps) {
  return null;
}

interface MapPopupProps {
  longitude: number;
  latitude: number;
  children?: React.ReactNode;
  className?: string;
  closeButton?: boolean;
  onClose?: () => void;
}

export function MapPopup({
  longitude,
  latitude,
  children,
  className,
  closeButton = false,
  onClose,
}: MapPopupProps) {
  const { map, isLoaded } = useMap();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!map || !isLoaded || !children || !containerRef.current) return;

    const popup = new maplibregl.Popup({
      closeButton,
      closeOnClick: false,
      className: `maplibre-popup ${className || ""}`,
    })
      .setLngLat([longitude, latitude])
      .setDOMContent(containerRef.current)
      .addTo(map);

    if (onClose) {
      popup.on("close", onClose);
    }

    return () => {
      popup.remove();
    };
  }, [map, isLoaded, longitude, latitude, closeButton, className, onClose]);

  if (!children) return null;

  return (
    <div ref={containerRef} className="maplibre-popup-content">
      {children}
    </div>
  );
}

interface MapRouteProps {
  coordinates: [number, number][];
  color?: string;
  width?: number;
  opacity?: number;
  dashArray?: [number, number];
}

export function MapRoute({
  coordinates,
  color = "#4285F4",
  width = 3,
  opacity = 0.8,
  dashArray,
}: MapRouteProps) {
  const { map, isLoaded } = useMap();
  const sourceRef = React.useRef<string>("route-source");
  const layerRef = React.useRef<string>("route-layer");

  useEffect(() => {
    if (!map || !isLoaded || coordinates.length < 2) return;

    const sourceId = sourceRef.current;
    const layerId = layerRef.current;

    // Create GeoJSON LineString
    const geoJSON: GeoJSON.FeatureCollection = {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          properties: {},
          geometry: {
            type: "LineString",
            coordinates,
          },
        },
      ],
    };

    // Add source if it doesn't exist
    if (!map.getSource(sourceId)) {
      map.addSource(sourceId, {
        type: "geojson",
        data: geoJSON,
      });
    } else {
      (map.getSource(sourceId) as maplibregl.GeoJSONSource).setData(geoJSON);
    }

    // Add layer if it doesn't exist
    if (!map.getLayer(layerId)) {
      map.addLayer({
        id: layerId,
        type: "line",
        source: sourceId,
        layout: {
          "line-join": "round",
          "line-cap": "round",
        },
        paint: {
          "line-color": color,
          "line-width": width,
          "line-opacity": opacity,
          ...(dashArray && { "line-dasharray": dashArray }),
        },
      });
    }

    return () => {
      if (!map) return;
      try {
        if (layerId && typeof map.getLayer === 'function' && map.getLayer(layerId)) {
          map.removeLayer(layerId);
        }
      } catch {
        // Layer might not exist or already removed
      }
      try {
        if (sourceId && typeof map.getSource === 'function' && map.getSource(sourceId)) {
          map.removeSource(sourceId);
        }
      } catch {
        // Source might not exist or already removed
      }
    };
  }, [map, isLoaded, coordinates, color, width, opacity, dashArray]);

  return null;
}

interface MarkerLabelProps {
  children?: React.ReactNode;
  className?: string;
  position?: "top" | "bottom";
}

export function MarkerLabel({ children: _children }: MarkerLabelProps) {
  return null;
}

interface MapClusterLayerProps {
  data: string | GeoJSON.FeatureCollection;
  clusterMaxZoom?: number;
  clusterRadius?: number;
  clusterColors?: [string, string, string];
  clusterThresholds?: [number, number];
  pointColor?: string;
  onPointClick?: (
    feature: GeoJSON.Feature,
    coordinates: [number, number]
  ) => void;
  onClusterClick?: (
    clusterId: number,
    coordinates: [number, number],
    pointCount: number
  ) => void;
}

export function MapClusterLayer({
  data,
  clusterMaxZoom = 14,
  clusterRadius = 50,
  clusterColors = ["#51bbd6", "#f1f075", "#f28cb1"],
  clusterThresholds = [100, 750],
  pointColor = "#3b82f6",
  onPointClick,
  onClusterClick,
}: MapClusterLayerProps) {
  const { map, isLoaded } = useMap();

  useEffect(() => {
    if (!map || !isLoaded) return;
    // Clustering implementation placeholder
  }, [
    map,
    isLoaded,
    data,
    clusterMaxZoom,
    clusterRadius,
    clusterColors,
    clusterThresholds,
    pointColor,
    onPointClick,
    onClusterClick,
  ]);

  return null;
}
