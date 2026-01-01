import { useEffect, useRef } from 'react';

interface AnimatedCounterProps {
  value: number;
  className?: string;
}

export const AnimatedCounter = ({ value, className }: AnimatedCounterProps) => {
  // Use ref for display value to avoid re-renders during animation
  const displayValueRef = useRef(value);
  const prevValueRef = useRef(value);
  const spanRef = useRef<HTMLSpanElement>(null);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    // If value hasn't changed, skip
    if (value === prevValueRef.current) {
      return;
    }

    // Cancel any existing animation
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }

    const startValue = displayValueRef.current;
    const endValue = value;
    const diff = endValue - startValue;
    const duration = 200;
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function for smooth animation
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const currentValue = startValue + diff * easeOut;

      displayValueRef.current = currentValue;
      if (spanRef.current) {
        spanRef.current.textContent = Math.round(currentValue).toString();
      }

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        // Animation complete
        displayValueRef.current = endValue;
        if (spanRef.current) {
          spanRef.current.textContent = endValue.toString();
        }
      }
    };

    prevValueRef.current = value;
    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [value]);

  return (
    <span ref={spanRef} className={className}>
      {value}
    </span>
  );
};
