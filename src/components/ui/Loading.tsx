export const Loading = () => {
  return (
    <div className="flex items-center justify-center p-12">
      <div className="relative">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-border border-t-accent"></div>
        <div className="absolute inset-0 animate-spin rounded-full h-16 w-16 border-4 border-transparent border-r-accent/60" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
      </div>
    </div>
  );
};

export const LoadingSpinner = ({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) => {
  const sizes = {
    sm: 'h-4 w-4 border-2',
    md: 'h-8 w-8 border-3',
    lg: 'h-12 w-12 border-4',
  };

  return (
    <div className={`animate-spin rounded-full border-border border-t-accent ${sizes[size]}`}></div>
  );
};

export const Skeleton = ({ className = '' }: { className?: string }) => {
  return (
    <div className={`animate-shimmer bg-gradient-to-r from-bg-elevated via-bg-surface to-bg-elevated rounded-xl bg-[length:200%_100%] ${className}`}></div>
  );
};
