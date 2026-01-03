import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useImageViewer } from "../../hooks/useImageViewer";
import type { ImageItem } from "../../hooks/useImageViewer";
import { GalleryControls } from "./GalleryControls";
import { ZoomIndicator } from "./ZoomIndicator";

interface ImageViewerProps {
  images: ImageItem[];
  initialIndex?: number;
  isOpen: boolean;
  onClose: () => void;
}

export const ImageViewer = ({
  images,
  initialIndex = 0,
  isOpen,
  onClose,
}: ImageViewerProps) => {
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const {
    currentIndex,
    zoom,
    translateX,
    translateY,
    isLoading,
    setIsLoading,
    nextImage,
    prevImage,
    zoomIn,
    zoomOut,
    resetZoom,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    handleWheel,
    handleKeyDown,
    hasNext,
    hasPrev,
    totalImages,
  } = useImageViewer(images, initialIndex);

  // Prevent body scroll when viewer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  // Focus management
  useEffect(() => {
    if (isOpen && containerRef.current) {
      containerRef.current.focus();
    }
  }, [isOpen]);

  if (!isOpen || images.length === 0) return null;

  const currentImage = images[currentIndex];

  // Calculate transform style
  const transformStyle = {
    transform: `translate(${translateX}px, ${translateY}px) scale(${zoom})`,
    transformOrigin: "center center",
    transition: zoom === 1 ? "transform 0.3s ease-out" : "none",
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center p-4"
      role="presentation"
    >
      {/* Overlay - click closes */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Image container - click does NOT close */}
      <div
        ref={containerRef}
        role="dialog"
        aria-modal="true"
        aria-label="Image viewer"
        tabIndex={-1}
        onKeyDown={handleKeyDown}
        className="relative flex items-center justify-center max-w-[90vw] max-h-[90vh] outline-none"
        onClick={(e) => e.stopPropagation()}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onWheel={handleWheel}
        style={{ touchAction: "none" }}
      >
        {/* Image */}
        <img
          ref={imageRef}
          src={currentImage.url}
          alt={currentImage.alt || `Image ${currentIndex + 1} of ${totalImages}`}
          className={`max-w-full max-h-full object-contain ${
            isLoading ? "opacity-0" : "opacity-100"
          }`}
          style={transformStyle}
          onLoad={() => setIsLoading(false)}
          draggable={false}
        />

        {/* Controls */}
        <GalleryControls
          currentIndex={currentIndex}
          totalImages={totalImages}
          hasPrev={hasPrev}
          hasNext={hasNext}
          onPrev={prevImage}
          onNext={nextImage}
          onZoomIn={zoomIn}
          onZoomOut={zoomOut}
          onReset={resetZoom}
          onClose={onClose}
        />
      </div>

      {/* Loading indicator */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin" />
        </div>
      )}

      {/* Zoom indicator */}
      <ZoomIndicator zoom={zoom} visible={zoom !== 1} />

      {/* Screen reader announcements */}
      <div className="sr-only" role="status" aria-live="polite">
        {`Showing image ${currentIndex + 1} of ${totalImages}${
          zoom !== 1 ? `, zoomed to ${Math.round(zoom * 100)}%` : ""
        }`}
      </div>
    </div>,
    document.body
  );
};
