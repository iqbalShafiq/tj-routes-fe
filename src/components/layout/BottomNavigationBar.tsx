import { Link, useRouterState } from '@tanstack/react-router';

interface BottomNavigationBarProps {
  onMenuToggle: () => void;
  isMenuOpen: boolean;
}

interface NavItem {
  path: string;
  label: string;
  icon: React.ReactNode;
  requiresAuth?: boolean;
}

export const BottomNavigationBar = ({ onMenuToggle, isMenuOpen }: BottomNavigationBarProps) => {
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;
  const navItems: NavItem[] = [
    {
      path: '/feed',
      label: 'Community',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
        </svg>
      ),
    },
    {
      path: '/routes',
      label: 'Routes',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
        </svg>
      ),
    },
    {
      path: '/stops',
      label: 'Stops',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
  ];

  const isActive = (path: string) => {
    if (path === '/') return currentPath === path;
    return currentPath === path || (path !== '/' && currentPath.startsWith(path));
  };

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-border shadow-lg">
      {/* Material 3 rounded top corners */}
      <div className="rounded-t-3xl overflow-hidden bg-white">
        <div className="flex items-center justify-around h-20 px-2 pb-safe">
          {/* Navigation items */}
          {navItems.map((item) => {
            const active = isActive(item.path);
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`
                  relative flex flex-col items-center justify-center gap-1 min-w-[64px] h-full px-2
                  transition-all duration-200 active:scale-95
                  ${active
                    ? 'text-accent'
                    : 'text-text-secondary hover:text-text-primary'
                  }
                `}
              >
                <div>
                  {item.icon}
                </div>
                <span className="text-xs font-medium">
                  {item.label}
                </span>
                {active && (
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-accent rounded-t-full" />
                )}
              </Link>
            );
          })}

          {/* Hamburger menu button */}
          <button
            onClick={onMenuToggle}
            className={`
              relative flex flex-col items-center justify-center gap-1 min-w-[64px] h-full px-2
              transition-all duration-200 active:scale-95
              ${isMenuOpen
                ? 'text-accent'
                : 'text-text-secondary hover:text-text-primary'
              }
            `}
            aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
          >
            <div className="relative w-6 h-6 flex items-center justify-center">
              <div className="relative w-6 h-5">
                <span
                  className={`absolute left-0 w-6 h-0.5 bg-current transition-all duration-300 ${
                    isMenuOpen ? 'top-2 rotate-45' : 'top-0'
                  }`}
                />
                <span
                  className={`absolute left-0 top-2 w-6 h-0.5 bg-current transition-all duration-300 ${
                    isMenuOpen ? 'opacity-0 scale-0' : 'opacity-100 scale-100'
                  }`}
                />
                <span
                  className={`absolute left-0 w-6 h-0.5 bg-current transition-all duration-300 ${
                    isMenuOpen ? 'top-2 -rotate-45' : 'top-4'
                  }`}
                />
              </div>
            </div>
            <span className="text-xs font-medium">Menu</span>
          </button>
        </div>
      </div>
    </nav>
  );
};

