import { useEffect, useState } from "react";
import { AnimatedCounter } from "./AnimatedCounter";

interface ZoomIndicatorProps {
  zoom: number;
  visible: boolean;
}

export const ZoomIndicator = ({ zoom, visible }: ZoomIndicatorProps) => {
  const [show, setShow] = useState(false);

  // Show indicator when zoom changes
  useEffect(() => {
    if (visible) {
      setShow(true);
      const timer = setTimeout(() => setShow(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [zoom, visible]);

  if (!show) return null;

  return (
    <div
      className="fixed bottom-20 left-1/2 -translate-x-1/2 z-[82] pointer-events-none"
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      <div className="bg-bg-surface/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg animate-fade-in">
        <span className="text-sm font-medium text-text-secondary">
          <AnimatedCounter value={Math.round(zoom * 100)} />%
        </span>
      </div>
    </div>
  );
};
