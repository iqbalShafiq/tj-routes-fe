import { HTMLAttributes, ReactNode } from 'react';

type CardSize = 'sm' | 'md' | 'lg';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  /** Size variant affects chamfer size and padding */
  size?: CardSize;
  /** Disable hover effects */
  static?: boolean;
}

const sizeClasses: Record<CardSize, string> = {
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
};

export const Card = ({ className = '', children, size = 'md', static: isStatic, ...props }: CardProps) => {
  return (
    <div
      className={`
        card-minimal
        relative bg-white transition-all duration-300
        ${sizeClasses[size]}
        ${className}
      `}
      {...props}
    >
      <div className="relative z-0">
        {children}
      </div>
    </div>
  );
};

interface CardHeaderProps {
  title: string;
  subtitle?: string;
  /** Optional badge/tag to display next to title */
  badge?: ReactNode;
}

export const CardHeader = ({ title, subtitle, badge }: CardHeaderProps) => {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-3 mb-2">
        <h3 className="text-2xl font-display font-semibold text-slate-900">{title}</h3>
        {badge}
      </div>
      {subtitle && <p className="text-sm text-slate-600 font-body leading-relaxed">{subtitle}</p>}
    </div>
  );
};

interface CardBodyProps {
  children: ReactNode;
}

export const CardBody = ({ children }: CardBodyProps) => {
  return <div className="text-slate-700 font-body leading-relaxed">{children}</div>;
};

interface CardFooterProps {
  children: ReactNode;
  /** Add a top border separator */
  divided?: boolean;
}

export const CardFooter = ({ children, divided = true }: CardFooterProps) => {
  return (
    <div className={`mt-4 pt-4 ${divided ? 'border-t border-slate-100' : ''}`}>
      {children}
    </div>
  );
};
