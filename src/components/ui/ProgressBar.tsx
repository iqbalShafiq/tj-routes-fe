import { useEffect, useState } from "react";

interface ProgressBarProps {
  isActive: boolean;
  onComplete?: () => void;
}

export const ProgressBar = ({ isActive, onComplete }: ProgressBarProps) => {
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isActive) {
      setIsVisible(true);
      setProgress(0);

      // Start with immediate visible progress for better UX
      requestAnimationFrame(() => {
        setProgress(5);
      });

      // Simulate progress animation
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            // Wait a bit before hiding
            setTimeout(() => {
              setIsVisible(false);
              onComplete?.();
            }, 300);
            return 100;
          }
          // Faster start, slow down as we approach 100%
          const increment = prev < 70 ? 15 : prev < 90 ? 8 : 2;
          return Math.min(prev + increment, 100);
        });
      }, 30);

      return () => {
        clearInterval(interval);
      };
    } else {
      setProgress(0);
      setIsVisible(false);
    }
  }, [isActive, onComplete]);

  if (!isVisible) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] h-1 bg-transparent pointer-events-none">
      <div
        className="h-full bg-accent transition-all duration-300 ease-out shadow-lg"
        style={{
          width: `${progress}%`,
          boxShadow: "0 0 10px rgba(var(--color-accent), 0.5)",
        }}
      />
    </div>
  );
};
