import { Link, useRouterState } from "@tanstack/react-router";
import { useAuth } from "../../lib/hooks/useAuth";
import { useNavigationLoading } from "../../lib/hooks/useNavigationLoading";

interface SidebarProps {
  isExpanded: boolean;
  onToggle: () => void;
  isMobile: boolean;
  onCloseMobile: () => void;
  isMobileOpen?: boolean;
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
    path: "/feed",
    label: "Community",
    icon: (
      <svg
        className="w-4 h-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"
        />
      </svg>
    ),
  },
  {
    path: "/routes",
    label: "Routes",
    icon: (
      <svg
        className="w-4 h-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
        />
      </svg>
    ),
  },
  {
    path: "/stops",
    label: "Stops",
    icon: (
      <svg
        className="w-4 h-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
        />
      </svg>
    ),
  },
  {
    path: "/vehicles",
    label: "Fleet",
    icon: (
      <svg
        className="w-4 h-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
        />
      </svg>
    ),
  },
  {
    path: "/leaderboard",
    label: "Leaderboard",
    icon: (
      <svg
        className="w-4 h-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
        />
      </svg>
    ),
    requiresAuth: true,
  },
  {
    path: "/reports",
    label: "My Reports",
    icon: (
      <svg
        className="w-4 h-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      </svg>
    ),
    requiresAuth: true,
  },
  {
    path: "/reports/new",
    label: "New Report",
    icon: (
      <svg
        className="w-4 h-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 4v16m8-8H4"
        />
      </svg>
    ),
    requiresAuth: true,
  },
];

// Admin navigation items
const adminNavItems: NavItem[] = [
  {
    path: "/admin",
    label: "Dashboard",
    icon: (
      <svg
        className="w-4 h-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
        />
      </svg>
    ),
    adminOnly: true,
  },
  {
    path: "/admin/routes",
    label: "Routes",
    icon: (
      <svg
        className="w-4 h-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
        />
      </svg>
    ),
    adminOnly: true,
  },
  {
    path: "/admin/stops",
    label: "Stops",
    icon: (
      <svg
        className="w-4 h-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
        />
      </svg>
    ),
    adminOnly: true,
  },
  {
    path: "/admin/vehicles",
    label: "Vehicles",
    icon: (
      <svg
        className="w-4 h-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
        />
      </svg>
    ),
    adminOnly: true,
  },
  {
    path: "/admin/users",
    label: "Users",
    icon: (
      <svg
        className="w-4 h-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
        />
      </svg>
    ),
    adminOnly: true,
  },
  {
    path: "/admin/reports",
    label: "Reports",
    icon: (
      <svg
        className="w-4 h-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      </svg>
    ),
    adminOnly: true,
  },
  {
    path: "/admin/bulk-upload",
    label: "Bulk Upload",
    icon: (
      <svg
        className="w-4 h-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
        />
      </svg>
    ),
    adminOnly: true,
  },
];

export const Sidebar = ({
  isExpanded,
  onToggle,
  isMobile,
  onCloseMobile,
  isMobileOpen = false,
}: SidebarProps) => {
  const { isAuthenticated, isAdmin, user, logout } = useAuth();
  const routerState = useRouterState();
  const { startNavigation } = useNavigationLoading();
  const currentPath = routerState.location.pathname;

  const handleNavClick = () => {
    if (isMobile) {
      onCloseMobile();
    }
  };

  const handleLogout = () => {
    logout();
    if (isMobile) {
      onCloseMobile();
    }
  };

  // Filter nav items based on auth and admin status
  const visibleUserItems = userNavItems.filter((item) => {
    if (item.requiresAuth && !isAuthenticated) return false;
    return true;
  });

  const visibleAdminItems = isAdmin ? adminNavItems : [];

  const renderNavItem = (item: NavItem) => {
    const isActive =
      currentPath === item.path ||
      (item.path !== "/" &&
        item.path !== "/admin" &&
        currentPath.startsWith(item.path));

    return (
      <li key={item.path}>
        <Link
          to={item.path}
          onClick={handleNavClick}
          className={`
            flex items-center gap-0 py-1.5 rounded-lg transition-all duration-200 w-full
            ${!isMobile && !isExpanded ? "justify-center px-2" : "px-4 gap-2"}
            ${
              isActive
                ? `bg-accent-light text-accent font-medium ${!isMobile && !isExpanded ? "" : "border-l-2 border-accent"}`
                : "text-text-secondary hover:text-text-primary hover:bg-bg-elevated"
            }
          `}
        >
          <span
            className={`flex-shrink-0 ${isActive ? "text-accent" : "text-text-muted"}`}
          >
            {item.icon}
          </span>
          <span
            className={`
              whitespace-nowrap transition-opacity duration-300 text-sm font-medium
              ${!isMobile && !isExpanded ? "opacity-0 w-0 overflow-hidden" : "opacity-100"}
            `}
          >
            {item.label}
          </span>
          {item.badge && (isMobile || isExpanded) && (
            <span className="ml-auto px-2.5 py-0.5 text-xs font-medium bg-accent-light text-accent rounded-badge">
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
          className={`fixed inset-0 bg-text-primary/40 backdrop-blur-sm z-[55] transition-opacity duration-300 ${
            isMobileOpen ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full bg-bg-surface border-r border-border z-[60]
          flex flex-col transition-all duration-300 ease-in-out
          ${isMobile ? "w-64" : isExpanded ? "w-64" : "w-20"}
          ${isMobile && !isMobileOpen ? "-translate-x-full" : ""}
        `}
      >
        {/* Header: Greeting or Logo */}
        <div className="h-16 flex items-center px-4 border-b border-border relative">
          {/* Mobile close button */}
          {isMobile && (
            <button
              onClick={onCloseMobile}
              className="absolute right-2 p-2 hover:bg-bg-elevated rounded-lg transition-colors"
              aria-label="Close sidebar"
            >
              <svg className="w-5 h-5 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}

          {/* Greeting / Logo - show when expanded or mobile */}
          {(isMobile || isExpanded) && (
            <Link
              to="/"
              onClick={handleNavClick}
              className="flex items-center gap-3 overflow-hidden"
            >
              {/* Avatar */}
              <div className="w-8 h-8 rounded-full bg-accent text-white flex items-center justify-center flex-shrink-0">
                <span className="font-bold text-xs">
                  {user?.username?.charAt(0).toUpperCase() || (isAuthenticated ? "U" : "?")}
                </span>
              </div>

              {/* Greeting text */}
              <span className="font-display font-medium text-text-primary whitespace-nowrap text-sm">
                {isAuthenticated
                  ? `Hi, ${user?.username?.split(" ")[0] || "User"}!`
                  : "Sign In"}
              </span>
            </Link>
          )}

          {/* Collapsed desktop: show nothing, just the toggle button */}
          {!isMobile && !isExpanded && (
            <div className="w-8 h-8" />
          )}

          {/* Toggle button - desktop only, centered */}
          {!isMobile && (
            <button
              onClick={onToggle}
              className={`p-2 hover:bg-bg-hover rounded-lg transition-colors ${
                !isExpanded ? "absolute left-1/2 -translate-x-1/2" : "absolute right-2"
              }`}
              aria-label={isExpanded ? "Collapse sidebar" : "Expand sidebar"}
            >
              <svg
                className={`w-5 h-5 text-text-secondary transition-transform duration-300 ${
                  isExpanded ? "" : "rotate-180"
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
                />
              </svg>
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-3 overflow-y-auto sidebar-scrollbar">
          {/* User Navigation */}
          {(isMobile || isExpanded) && (
            <p className="text-xs font-medium text-text-muted uppercase tracking-wider mb-3 px-3 whitespace-nowrap">
              MAIN MENU
            </p>
          )}
          <ul className="space-y-0.5">{visibleUserItems.map(renderNavItem)}</ul>

          {/* Admin Navigation */}
          {visibleAdminItems.length > 0 && (
            <>
              <div
                className={`my-4 ${!isMobile && !isExpanded ? "mx-2" : "mx-0"}`}
              >
                <div className="border-t border-border" />
                {(isMobile || isExpanded) && (
                  <p className="text-xs font-medium text-text-muted uppercase tracking-wider mt-4 mb-3 px-3 whitespace-nowrap">
                    ADMIN
                  </p>
                )}
              </div>
              <ul className="space-y-0.5">
                {visibleAdminItems.map(renderNavItem)}
              </ul>
            </>
          )}

          {/* YOUR ACCOUNT Section */}
          <div
            className={`my-4 ${!isMobile && !isExpanded ? "mx-2" : "mx-0"}`}
          >
            <div className="border-t border-border" />
            {(isMobile || isExpanded) && (
              <p className="text-xs font-medium text-text-muted uppercase tracking-wider mt-4 mb-3 px-3 whitespace-nowrap">
                YOUR ACCOUNT
              </p>
            )}
          </div>
          <ul className="space-y-0.5">
            {isAuthenticated ? (
              <>
                {/* My Profile */}
                <li>
                  <Link
                    to="/profile/$userId"
                    params={{ userId: String(user?.id) }}
                    onClick={handleNavClick}
                    className={`
                      flex items-center gap-0 py-1.5 rounded-lg transition-all duration-200 w-full
                      ${!isMobile && !isExpanded ? "justify-center px-2" : "px-4 gap-2"}
                      ${
                        currentPath.startsWith("/profile")
                          ? `bg-accent-light text-accent font-medium ${!isMobile && !isExpanded ? "" : "border-l-2 border-accent"}`
                          : "text-text-secondary hover:bg-bg-elevated hover:text-text-primary"
                      }
                    `}
                  >
                    <span
                      className={`flex-shrink-0 ${currentPath.startsWith("/profile") ? "text-accent" : "text-text-muted"}`}
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                    </span>
                    {(isMobile || isExpanded) && (
                      <span className="text-sm font-medium whitespace-nowrap">My Profile</span>
                    )}
                  </Link>
                </li>

                {/* Logout */}
                <li>
                  <button
                    onClick={handleLogout}
                    className={`
                      w-full flex items-center gap-0 py-1.5 rounded-lg transition-all duration-200
                      ${!isMobile && !isExpanded ? "justify-center px-2" : "px-4 gap-2"}
                      text-text-secondary hover:bg-bg-elevated hover:text-text-primary
                    `}
                  >
                    <span className="flex-shrink-0 text-text-muted">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                        />
                      </svg>
                    </span>
                    {(isMobile || isExpanded) && (
                      <span className="text-sm font-medium whitespace-nowrap">Logout</span>
                    )}
                  </button>
                </li>
              </>
            ) : (
              /* Logged out state */
              <>
                {/* Login */}
                <li>
                  <button
                    onClick={() => {
                      handleNavClick();
                      startNavigation();
                      window.location.href = "/auth/login";
                    }}
                    className={`
                      w-full flex items-center gap-0 py-1.5 rounded-lg transition-all duration-200
                      ${!isMobile && !isExpanded ? "justify-center px-2" : "px-4 gap-2"}
                      text-text-secondary hover:bg-bg-elevated hover:text-text-primary
                    `}
                  >
                    <span className="flex-shrink-0 text-text-muted">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                        />
                      </svg>
                    </span>
                    {(isMobile || isExpanded) && (
                      <span className="text-sm font-medium whitespace-nowrap">Login</span>
                    )}
                  </button>
                </li>

                {/* Register */}
                <li>
                  <button
                    onClick={() => {
                      handleNavClick();
                      startNavigation();
                      window.location.href = "/auth/register";
                    }}
                    className={`
                      w-full flex items-center gap-0 py-1.5 rounded-lg transition-all duration-200
                      ${!isMobile && !isExpanded ? "justify-center px-2" : "px-4 gap-2"}
                      text-text-secondary hover:bg-bg-elevated hover:text-text-primary
                    `}
                  >
                    <span className="flex-shrink-0 text-text-muted">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                        />
                      </svg>
                    </span>
                    {(isMobile || isExpanded) && (
                      <span className="text-sm font-medium whitespace-nowrap">Register</span>
                    )}
                  </button>
                </li>
              </>
            )}
          </ul>
        </nav>

        {/* Empty bottom area */}
      </aside>
    </>
  );
};
