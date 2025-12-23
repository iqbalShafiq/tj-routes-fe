export const Loading = () => {
  return (
    <div className="flex items-center justify-center p-12">
      <div className="relative">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-slate-200 border-t-amber-500"></div>
        <div className="absolute inset-0 animate-spin rounded-full h-16 w-16 border-4 border-transparent border-r-amber-300" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
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
    <div className={`animate-spin rounded-full border-slate-200 border-t-amber-500 ${sizes[size]}`}></div>
  );
};

export const Skeleton = ({ className = '' }: { className?: string }) => {
  return (
    <div className={`animate-pulse bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 rounded-xl ${className}`} style={{ backgroundSize: '200% 100%', animation: 'shimmer 2s infinite' }}></div>
  );
};
