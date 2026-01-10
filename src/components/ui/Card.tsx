import { type HTMLAttributes, type ReactNode } from "react";

type CardSize = "sm" | "md" | "lg";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  size?: CardSize;
  static?: boolean;
}

const sizeClasses: Record<CardSize, string> = {
  sm: "p-4",
  md: "p-6",
  lg: "p-8",
};

export const Card = ({
  className = "",
  children,
  size = "md",
  static: isStatic,
  ...props
}: CardProps) => {
  return (
    <div
      className={`
        rounded-card border border-border bg-bg-surface
        relative transition-all duration-200
        ${!isStatic ? "hover:shadow-soft" : ""}
        ${sizeClasses[size]}
        ${className}
      `}
      {...props}
    >
      <div className="relative z-0">{children}</div>
    </div>
  );
};

interface CardHeaderProps {
  title: string;
  subtitle?: string;
  badge?: ReactNode;
}

export const CardHeader = ({ title, subtitle, badge }: CardHeaderProps) => {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-3 mb-2">
        <h3 className="text-2xl font-display font-semibold text-text-primary">
          {title}
        </h3>
        {badge}
      </div>
      {subtitle && (
        <p className="text-sm text-text-secondary font-body leading-relaxed">
          {subtitle}
        </p>
      )}
    </div>
  );
};

interface CardBodyProps {
  children: ReactNode;
}

export const CardBody = ({ children }: CardBodyProps) => {
  return (
    <div className="text-text-secondary font-body leading-relaxed">
      {children}
    </div>
  );
};

interface CardFooterProps {
  children: ReactNode;
  divided?: boolean;
}

export const CardFooter = ({ children, divided = true }: CardFooterProps) => {
  return (
    <div className={`mt-4 pt-4 ${divided ? "border-t border-border" : ""}`}>
      {children}
    </div>
  );
};
