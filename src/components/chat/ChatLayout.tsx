import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { UserInfoPanel } from './UserInfoPanel';
import type { ReactNode } from 'react';

interface ChatLayoutProps {
  leftPanel: ReactNode;
  rightPanel: ReactNode | null;
  infoPanel?: { type: 'conversation' | 'group'; id: number } | null;
  selectedChatId: number | null;
  onCloseDetail: () => void;
}

export function ChatLayout({ leftPanel, rightPanel, infoPanel, selectedChatId, onCloseDetail }: ChatLayoutProps) {
  const isMobile = useMediaQuery('(max-width: 1023px)');
  const isLargeScreen = useMediaQuery('(min-width: 1536px)'); // xl breakpoint

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && selectedChatId) {
        onCloseDetail();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedChatId, onCloseDetail]);

  if (isMobile) {
    return (
      <div className="h-[calc(100vh-5rem)] flex flex-col overflow-hidden">
        <AnimatePresence mode="wait">
          {!selectedChatId ? (
            <motion.div
              key="list"
              initial={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="flex-1 flex flex-col"
            >
              {leftPanel}
            </motion.div>
          ) : (
            <motion.div
              key="detail"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="absolute inset-0 flex flex-col bg-bg-main"
            >
              {rightPanel}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // Desktop layout - three panels on large screens, two panels on medium screens
  return (
    <div className="h-screen flex">
      {/* Left panel - Chat list */}
      <div className="w-80 border-r border-border flex-shrink-0 overflow-hidden">
        {leftPanel}
      </div>

      {/* Middle panel - Chat messages */}
      <div className="flex-1 overflow-hidden min-w-0">
        {rightPanel}
      </div>

      {/* Right panel - User info (only on xl screens when chat is selected) */}
      {isLargeScreen && infoPanel && (
        <div className="w-80 border-l border-border flex-shrink-0 overflow-hidden">
          <UserInfoPanel type={infoPanel.type} id={infoPanel.id} />
        </div>
      )}
    </div>
  );
}
