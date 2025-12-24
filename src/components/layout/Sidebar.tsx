import { Link, useRouterState } from '@tanstack/react-router';
import { useAuth } from '../../lib/hooks/useAuth';
import { Button } from '../ui/Button';
import { useState, useRef, useEffect } from 'react';

interface SidebarProps {
  isExpanded: boolean;
  onToggle: () => void;
  isMobile: boolean;
  onCloseMobile: () => void;
}

interface NavItem {
  path: string;
  label: string;
  icon: React.ReactNode;
  requiresAuth?: boolean;
  adminOnly?: boolean;
  badge?: string;
}

// User navigation items
const userNavItems: NavItem[] = [
  {
    path: '/feed',
    label: 'Community',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
      </svg>
    ),
  },
  {
    path: '/routes',
    label: 'Routes',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
      </svg>
    ),
  },
  {
    path: '/stops',
    label: 'Stops',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    path: '/vehicles',
    label: 'Fleet',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
      </svg>
    ),
  },
  {
    path: '/leaderboard',
    label: 'Leaderboard',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    requiresAuth: true,
  },
  {
    path: '/reports',
    label: 'My Reports',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    requiresAuth: true,
  },
  {
    path: '/reports/new',
    label: 'New Report',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
      </svg>
    ),
    requiresAuth: true,
  },
];

// Admin navigation items
const adminNavItems: NavItem[] = [
  {
    path: '/admin',
    label: 'Dashboard',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
      </svg>
    ),
    adminOnly: true,
  },
  {
    path: '/admin/routes',
    label: 'Routes',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
      </svg>
    ),
    adminOnly: true,
  },
  {
    path: '/admin/stops',
    label: 'Stops',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
      </svg>
    ),
    adminOnly: true,
  },
  {
    path: '/admin/vehicles',
    label: 'Vehicles',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
      </svg>
    ),
    adminOnly: true,
  },
  {
    path: '/admin/users',
    label: 'Users',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
    adminOnly: true,
  },
  {
    path: '/admin/reports',
    label: 'Reports',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    adminOnly: true,
  },
  {
    path: '/admin/bulk-upload',
    label: 'Bulk Upload',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
      </svg>
    ),
    adminOnly: true,
  },
];

export const Sidebar = ({ isExpanded, onToggle, isMobile, onCloseMobile }: SidebarProps) => {
  const { isAuthenticated, isAdmin, user, logout } = useAuth();
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const handleNavClick = () => {
    if (isMobile) {
      onCloseMobile();
    }
  };

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
    if (isMobile) {
      onCloseMobile();
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };

    if (showUserMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showUserMenu]);

  // Filter nav items based on auth and admin status
  const visibleUserItems = userNavItems.filter(item => {
    if (item.requiresAuth && !isAuthenticated) return false;
    return true;
  });

  const visibleAdminItems = isAdmin ? adminNavItems : [];

  const renderNavItem = (item: NavItem) => {
    const isActive = currentPath === item.path || 
      (item.path !== '/' && item.path !== '/admin' && currentPath.startsWith(item.path));

    return (
      <li key={item.path}>
        <Link
          to={item.path}
          onClick={handleNavClick}
          className={`
            flex items-center px-3 py-2.5 rounded-lg transition-all duration-200 w-full
            ${!isMobile && !isExpanded ? 'justify-center gap-0' : 'gap-3'}
            ${isActive
              ? 'bg-amber-50 text-amber-600 font-medium'
              : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }
          `}
        >
          <span className={`flex-shrink-0 ${isActive ? 'text-amber-600' : 'text-slate-600'}`}>
            {item.icon}
          </span>
          <span
            className={`
              whitespace-nowrap transition-opacity duration-300
              ${!isMobile && !isExpanded ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'}
            `}
          >
            {item.label}
          </span>
          {item.badge && (isMobile || isExpanded) && (
            <span className="ml-auto px-2 py-0.5 text-xs bg-amber-500 text-white rounded-full">
              {item.badge}
            </span>
          )}
        </Link>
      </li>
    );
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isMobile && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 transition-opacity duration-300"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full bg-white border-r border-slate-200 z-50
          flex flex-col transition-all duration-300 ease-in-out
          ${isMobile ? 'w-64' : isExpanded ? 'w-64' : 'w-20'}
        `}
      >
        {/* Logo section */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-200 relative">
          {(!isMobile && !isExpanded) ? null : (
            <Link 
              to="/" 
              onClick={handleNavClick} 
              className="flex items-center gap-3 overflow-hidden"
            >
              <div className="w-10 h-10 bg-amber-500 flex items-center justify-center flex-shrink-0 card-chamfered">
                <span className="text-white font-bold text-lg">TJ</span>
              </div>
              <span
                className={`
                  font-display font-bold text-slate-900 whitespace-nowrap transition-opacity duration-300
                  ${!isMobile && !isExpanded ? 'opacity-0 w-0' : 'opacity-100'}
                `}
              >
                TransJakarta
              </span>
            </Link>
          )}
          
          {!isMobile && (
            <button
              onClick={onToggle}
              className={`
                p-2 hover:bg-slate-100 rounded-lg transition-colors flex-shrink-0
                ${!isExpanded ? 'absolute left-1/2 -translate-x-1/2' : ''}
              `}
              aria-label={isExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
            >
              <svg
                className={`w-5 h-5 text-slate-600 transition-transform duration-300 ${isExpanded ? '' : 'rotate-180'}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
              </svg>
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-3 overflow-y-auto sidebar-scrollbar">
          {/* User Navigation */}
          {(isMobile || isExpanded) && (
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 px-3">
              MAIN MENU
            </p>
          )}
          <ul className="space-y-1">
            {visibleUserItems.map(renderNavItem)}
          </ul>

          {/* Admin Navigation */}
          {visibleAdminItems.length > 0 && (
            <>
              <div className={`my-4 ${!isMobile && !isExpanded ? 'mx-2' : 'mx-0'}`}>
                <div className="border-t border-slate-200" />
                {(isMobile || isExpanded) && (
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mt-4 mb-3 px-3">
                    ADMIN
                  </p>
                )}
              </div>
              <ul className="space-y-1">
                {visibleAdminItems.map(renderNavItem)}
              </ul>
            </>
          )}
        </nav>

        {/* User section */}
        <div 
          className="border-t border-slate-200 p-4 relative" 
          ref={userMenuRef}
          onMouseLeave={() => !isMobile && setShowUserMenu(false)}
        >
          {isAuthenticated ? (
            <>
              <div
                className={`
                  flex items-center cursor-pointer rounded-lg transition-colors p-3 bg-slate-50
                  ${!isMobile && !isExpanded ? 'justify-center gap-0' : 'gap-3'}
                  hover:bg-slate-100
                  ${showUserMenu ? 'bg-slate-100' : ''}
                `}
                onClick={() => setShowUserMenu(!showUserMenu)}
                onMouseEnter={() => !isMobile && setShowUserMenu(true)}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                  isAdmin 
                    ? 'bg-amber-500 text-white' 
                    : 'bg-slate-300 text-slate-700'
                }`}>
                  <span className="font-bold text-sm">
                    {user?.username?.charAt(0).toUpperCase() || 'U'}
                    {user?.username?.charAt(1)?.toUpperCase() || ''}
                  </span>
                </div>
                <div className={`flex-1 min-w-0 ${!isMobile && !isExpanded ? 'hidden' : ''}`}>
                  <span className="text-sm font-bold text-slate-900 truncate block">
                    {user?.username || 'User'}
                  </span>
                  <span className="text-xs text-slate-500">
                    {isAdmin ? 'Administrator' : user?.level || 'User'}
                  </span>
                </div>
                {(isMobile || isExpanded) && (
                  <svg 
                    className="w-5 h-5 text-slate-600 flex-shrink-0" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                )}
              </div>

              {/* Popover menu */}
              {showUserMenu && (
                <>
                  {!isMobile && !isExpanded && (
                    <div
                      className="absolute left-full top-0 w-2 h-full z-40"
                      onMouseEnter={() => setShowUserMenu(true)}
                    />
                  )}
                  {!isMobile && isExpanded && (
                    <div
                      className="absolute bottom-full left-0 right-0 h-4 z-40"
                      onMouseEnter={() => setShowUserMenu(true)}
                    />
                  )}
                  <div
                    className={`
                      absolute bg-white border border-slate-200 shadow-lg card-chamfered-sm overflow-hidden z-50
                      ${!isMobile && !isExpanded 
                        ? 'left-full top-0 ml-2 w-48' 
                        : 'bottom-full left-0 right-0 mb-1 w-full'
                      }
                    `}
                    onMouseEnter={() => !isMobile && setShowUserMenu(true)}
                  >
                    <Link
                      to="/profile/$userId"
                      params={{ userId: String(user?.id) }}
                      onClick={() => { setShowUserMenu(false); handleNavClick(); }}
                      className="w-full px-4 py-3 text-left text-sm text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      My Profile
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full px-4 py-3 text-left text-sm text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-2 border-t border-slate-100"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Logout
                    </button>
                  </div>
                </>
              )}
            </>
          ) : (
            <div className={`space-y-2 ${!isMobile && !isExpanded ? 'flex flex-col items-center' : ''}`}>
              <Link to="/auth/login" onClick={handleNavClick} className="block w-full">
                <Button
                  size="sm"
                  variant="outline"
                  className={`w-full ${!isMobile && !isExpanded ? 'px-2' : ''}`}
                >
                  {!isMobile && !isExpanded ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                    </svg>
                  ) : (
                    'Login'
                  )}
                </Button>
              </Link>
              {(isMobile || isExpanded) && (
                <Link to="/auth/register" onClick={handleNavClick} className="block w-full">
                  <Button size="sm" variant="accent" className="w-full">
                    Register
                  </Button>
                </Link>
              )}
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
