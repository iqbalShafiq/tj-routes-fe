/**
 * ShareReportButton - Opens ShareReportModal for comprehensive sharing options
 * Replaces the simple ShareButton with platform-optimized image sharing
 */

import React, { useState } from 'react';
import type { Report } from '../lib/api/reports';
import { ShareReportModal } from './ShareReportModal';

interface ShareReportButtonProps {
  report: Report;
  variant?: 'icon-only' | 'with-label';
  className?: string;
}

export const ShareReportButton: React.FC<ShareReportButtonProps> = ({
  report,
  variant = 'with-label',
  className = '',
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleClick = () => {
    setIsModalOpen(true);
  };

  const handleClose = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      <button
        onClick={handleClick}
        className={`flex items-center gap-1.5 text-text-muted hover:text-accent transition-colors ${className}`}
        title="Share report"
        aria-label="Share report"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
          />
        </svg>
        {variant === 'with-label' && (
          <span className="text-sm font-medium">Share</span>
        )}
      </button>

      <ShareReportModal
        isOpen={isModalOpen}
        onClose={handleClose}
        report={report}
      />
    </>
  );
};
