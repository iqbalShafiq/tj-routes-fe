import { useState, useCallback, useRef, useEffect } from "react";

export interface ImageItem {
  url: string;
  alt?: string;
}

interface TouchState {
  isDragging: boolean;
  lastX: number;
  lastY: number;
  startX: number;
  startY: number;
}

interface GestureState {
  initialDistance: number;
  initialScale: number;
  isPinching: boolean;
}

const ZOOM_MIN = 0.25;
const ZOOM_MAX = 5;
const ZOOM_STEP = 0.25;

export function useImageViewer(
  images: ImageItem[],
  initialIndex: number = 0
) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [zoom, setZoom] = useState(1);
  const [translateX, setTranslateX] = useState(0);
  const [translateY, setTranslateY] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const touchStateRef = useRef<TouchState>({
    isDragging: false,
    lastX: 0,
    lastY: 0,
    startX: 0,
    startY: 0,
  });

  const gestureRef = useRef<GestureState>({
    initialDistance: 0,
    initialScale: 1,
    isPinching: false,
  });

  const lastTapTimeRef = useRef<number>(0);
  const lastTapPositionRef = useRef<{ x: number; y: number } | null>(null);

  // Reset state when image changes
  useEffect(() => {
    setZoom(1);
    setTranslateX(0);
    setTranslateY(0);
    setIsLoading(true);
  }, [currentIndex]);

  const handleImageLoad = useCallback(() => {
    setIsLoading(false);
  }, []);

  const nextImage = useCallback(() => {
    if (currentIndex < images.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  }, [currentIndex, images.length]);

  const prevImage = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  }, [currentIndex]);

  const goToImage = useCallback((index: number) => {
    if (index >= 0 && index < images.length) {
      setCurrentIndex(index);
    }
  }, [images.length]);

  const zoomIn = useCallback(() => {
    setZoom((prev) => Math.min(prev + ZOOM_STEP, ZOOM_MAX));
  }, []);

  const zoomOut = useCallback(() => {
    setZoom((prev) => Math.max(prev - ZOOM_STEP, ZOOM_MIN));
  }, []);

  const resetZoom = useCallback(() => {
    setZoom(1);
    setTranslateX(0);
    setTranslateY(0);
  }, []);

  const toggleZoom = useCallback((fitToScreen: boolean) => {
    if (fitToScreen) {
      setZoom(1);
      setTranslateX(0);
      setTranslateY(0);
    } else {
      setZoom((prev) => (prev === 1 ? 2 : 1));
    }
  }, []);

  // Touch handlers for gestures
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      touchStateRef.current = {
        isDragging: zoom > 1,
        lastX: touch.clientX,
        lastY: touch.clientY,
        startX: touch.clientX,
        startY: touch.clientY,
      };
    } else if (e.touches.length === 2) {
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const distance = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      );
      gestureRef.current = {
        initialDistance: distance,
        initialScale: zoom,
        isPinching: true,
      };
    }
  }, [zoom]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 1 && touchStateRef.current.isDragging) {
      e.preventDefault();
      const touch = e.touches[0];
      const deltaX = touch.clientX - touchStateRef.current.lastX;
      const deltaY = touch.clientY - touchStateRef.current.lastY;

      setTranslateX((prev) => prev + deltaX);
      setTranslateY((prev) => prev + deltaY);

      touchStateRef.current.lastX = touch.clientX;
      touchStateRef.current.lastY = touch.clientY;
    } else if (e.touches.length === 2 && gestureRef.current.isPinching) {
      e.preventDefault();
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const distance = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      );

      const scaleDelta = distance / gestureRef.current.initialDistance;
      const newZoom = Math.min(
        Math.max(gestureRef.current.initialScale * scaleDelta, ZOOM_MIN),
        ZOOM_MAX
      );
      setZoom(newZoom);
    }
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 0) {
      // Check for double tap
      const now = Date.now();
      const touch = e.changedTouches[0];

      if (
        lastTapTimeRef.current &&
        now - lastTapTimeRef.current < 300 &&
        lastTapPositionRef.current
      ) {
        const distance = Math.hypot(
          touch.clientX - lastTapPositionRef.current.x,
          touch.clientY - lastTapPositionRef.current.y
        );

        if (distance < 30) {
          // Double tap detected - toggle zoom
          toggleZoom(zoom === 1);
        }
      }

      lastTapTimeRef.current = now;
      lastTapPositionRef.current = { x: touch.clientX, y: touch.clientY };

      // Reset drag state
      touchStateRef.current.isDragging = false;
      gestureRef.current.isPinching = false;
    }
  }, [toggleZoom, zoom]);

  // Wheel zoom for trackpad
  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();
    if (e.ctrlKey || e.metaKey) {
      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      setZoom((prev) => Math.min(Math.max(prev + delta, ZOOM_MIN), ZOOM_MAX));
    }
  }, []);

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      switch (e.key) {
        case "ArrowLeft":
          e.preventDefault();
          prevImage();
          break;
        case "ArrowRight":
          e.preventDefault();
          nextImage();
          break;
        case "+":
        case "=":
          e.preventDefault();
          zoomIn();
          break;
        case "-":
        case "_":
          e.preventDefault();
          zoomOut();
          break;
        case "0":
          e.preventDefault();
          resetZoom();
          break;
        case "Home":
          e.preventDefault();
          goToImage(0);
          break;
        case "End":
          e.preventDefault();
          goToImage(images.length - 1);
          break;
      }
    },
    [nextImage, prevImage, zoomIn, zoomOut, resetZoom, goToImage, images.length]
  );

  return {
    currentIndex,
    setCurrentIndex: goToImage,
    zoom,
    setZoom,
    translateX,
    translateY,
    isLoading,
    setIsLoading: handleImageLoad,
    nextImage,
    prevImage,
    goToImage,
    zoomIn,
    zoomOut,
    resetZoom,
    toggleZoom,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    handleWheel,
    handleKeyDown,
    totalImages: images.length,
    currentImage: images[currentIndex],
    hasNext: currentIndex < images.length - 1,
    hasPrev: currentIndex > 0,
  };
}
