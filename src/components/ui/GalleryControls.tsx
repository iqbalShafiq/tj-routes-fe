interface GalleryControlsProps {
  currentIndex: number;
  totalImages: number;
  hasPrev: boolean;
  hasNext: boolean;
  onPrev: () => void;
  onNext: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
  onClose: () => void;
  zoom?: number;
}

export const GalleryControls = ({
  currentIndex,
  totalImages,
  hasPrev,
  hasNext,
  onPrev,
  onNext,
  onZoomIn,
  onZoomOut,
  onReset,
  onClose,
  zoom = 1,
}: GalleryControlsProps) => {
  return (
    <>
      {/* Gallery indicator - top left of overlay */}
      <div className="pointer-events-auto absolute top-4 left-4 z-[82] bg-bg-surface/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg">
        <span className="text-sm font-medium text-text-secondary">
          {currentIndex + 1} / {totalImages}
        </span>
      </div>

      {/* Close button - top right of overlay */}
      <button
        onClick={onClose}
        className="pointer-events-auto absolute top-4 right-4 z-[82] w-10 h-10 bg-bg-surface/80 hover:bg-bg-surface backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-accent"
        aria-label="Close image viewer"
      >
        <svg className="w-6 h-6 text-text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Side arrows */}
      {hasPrev && (
        <button
          onClick={onPrev}
          className="pointer-events-auto absolute left-4 top-1/2 -translate-y-1/2 z-[82] w-12 h-12 bg-bg-surface/80 hover:bg-bg-surface backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-accent"
          aria-label="Previous image"
        >
          <svg className="w-6 h-6 text-text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      )}
      {hasNext && (
        <button
          onClick={onNext}
          className="pointer-events-auto absolute right-4 top-1/2 -translate-y-1/2 z-[82] w-12 h-12 bg-bg-surface/80 hover:bg-bg-surface backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-accent"
          aria-label="Next image"
        >
          <svg className="w-6 h-6 text-text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      )}

      {/* Bottom controls container */}
      <div className="pointer-events-auto absolute bottom-4 left-1/2 -translate-x-1/2 z-[82] flex flex-col items-center gap-3">
        {/* Zoom indicator - above zoom controls */}
        {zoom !== 1 && (
          <div className="bg-bg-surface/80 backdrop-blur-sm px-3 py-1 rounded-full shadow-lg">
            <span className="text-sm font-medium text-text-secondary">
              {Math.round(zoom * 100)}%
            </span>
          </div>
        )}

        {/* Zoom controls */}
        <div className="bg-bg-surface/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg flex items-center gap-2">
          {/* Zoom out */}
          <button
            onClick={onZoomOut}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-bg-elevated transition-colors focus:outline-none focus:ring-2 focus:ring-accent"
            aria-label="Zoom out"
          >
            <svg className="w-5 h-5 text-text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
            </svg>
          </button>

          {/* Reset zoom */}
          <button
            onClick={onReset}
            className="px-3 py-1.5 text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-bg-elevated rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-accent"
            aria-label="Reset zoom"
          >
            100%
          </button>

          {/* Zoom in */}
          <button
            onClick={onZoomIn}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-bg-elevated transition-colors focus:outline-none focus:ring-2 focus:ring-accent"
            aria-label="Zoom in"
          >
            <svg className="w-5 h-5 text-text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>
      </div>
    </>
  );
};
