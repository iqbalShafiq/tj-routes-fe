import { type ReactNode, useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { MobileMenuButton } from './MobileMenuButton';
import { BottomNavigationBar } from './BottomNavigationBar';
import { useLocation } from '@tanstack/react-router';

interface AppLayoutProps {
  children: ReactNode;
}

const SIDEBAR_STORAGE_KEY = 'tj-sidebar-expanded';

export const AppLayout = ({ children }: AppLayoutProps) => {
  const [isExpanded, setIsExpanded] = useState(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(SIDEBAR_STORAGE_KEY);
      return stored !== null ? stored === 'true' : true;
    }
    return true;
  });
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 1024;
    }
    return false;
  });
  const [isSmallScreen, setIsSmallScreen] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 1024;
    }
    return false;
  });

  // Handle responsive breakpoint
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
      setIsSmallScreen(window.innerWidth < 1024);
    };

    // Check immediately on mount
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Persist sidebar state
  useEffect(() => {
    localStorage.setItem(SIDEBAR_STORAGE_KEY, String(isExpanded));
    window.dispatchEvent(new CustomEvent('sidebar-toggle'));
  }, [isExpanded]);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileOpen(false);
  }, []);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileOpen]);

  const handleToggle = () => {
    setIsExpanded((prev) => !prev);
  };

  const handleMobileToggle = () => {
    setIsMobileOpen((prev) => !prev);
  };

  const handleCloseMobile = () => {
    setIsMobileOpen(false);
  };

  const location = useLocation();
  const isConversationDetail = location.pathname.includes('/chat/conversations/');
  const isChatPage = location.pathname.startsWith('/chat');

  return (
    <div className="min-h-screen bg-bg-main">
      {/* Sidebar - Desktop */}
      {!isMobile && (
        <Sidebar
          isExpanded={isExpanded}
          onToggle={handleToggle}
          isMobile={false}
          onCloseMobile={handleCloseMobile}
        />
      )}

      {/* Sidebar - Mobile (overlay) */}
      {isMobile && (
        <Sidebar
          isExpanded={true}
          onToggle={handleToggle}
          isMobile={true}
          onCloseMobile={handleCloseMobile}
          isMobileOpen={isMobileOpen}
        />
      )}

      {/* Mobile menu button - hidden when bottom nav is visible */}
      {false && (
        <MobileMenuButton onClick={handleMobileToggle} isOpen={isMobileOpen} />
      )}

      {/* Main content area */}
      <main
        className={`
          min-h-screen transition-all duration-300
          ${!isMobile ? (isExpanded ? 'pl-64' : 'pl-20') : 'pl-0'}
          ${isSmallScreen ? 'pb-20' : ''}
        `}
      >
        {isChatPage ? (
          children
        ) : (
          <div className="max-w-7xl mx-auto px-6 py-8">
            {children}
          </div>
        )}
      </main>

      {/* Bottom Navigation Bar - only on small screens (mobile) and not on conversation detail */}
      {isSmallScreen && !isConversationDetail && (
        <BottomNavigationBar
          onMenuToggle={handleMobileToggle}
          isMenuOpen={isMobileOpen}
        />
      )}
    </div>
  );
};

