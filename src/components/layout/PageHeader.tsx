import { type ReactNode } from 'react';
import { Link } from '@tanstack/react-router';

interface Breadcrumb {
  label: string;
  path?: string;
}

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumbs?: Breadcrumb[];
  actions?: ReactNode;
  children?: ReactNode;
}

export const PageHeader = ({ title, subtitle, breadcrumbs, actions, children }: PageHeaderProps) => {
  return (
    <header className="mb-8">
      {/* Breadcrumbs */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav className="mb-4">
          <ol className="flex items-center gap-2 text-sm">
            {breadcrumbs.map((crumb, index) => (
              <li key={index} className="flex items-center gap-2">
                {index > 0 && (
                  <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                )}
                {crumb.path ? (
                  <Link
                    to={crumb.path}
                    className="text-amber-600 hover:text-amber-700 font-medium transition-colors"
                  >
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="text-slate-600">{crumb.label}</span>
                )}
              </li>
            ))}
          </ol>
        </nav>
      )}

      {/* Title and actions row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-display font-bold text-slate-900">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-2 text-slate-600 text-lg max-w-2xl">
              {subtitle}
            </p>
          )}
        </div>
        {actions && (
          <div className="flex items-center gap-3 flex-shrink-0">
            {actions}
          </div>
        )}
      </div>

      {/* Optional additional content (like search bars) */}
      {children && (
        <div className="mt-6">
          {children}
        </div>
      )}
    </header>
  );
};

