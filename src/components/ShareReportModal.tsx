/**
 * ShareReportModal - Main modal for sharing reports across platforms
 * Orchestrates platform selection, preview generation, and sharing actions
 */

import React, { useState, useRef, useEffect } from 'react';
import type { Report } from '../lib/api/reports';
import { Modal } from './ui/Modal';
import { SharePlatformSelector } from './share/SharePlatformSelector';
import { PlatformPreviewCanvas } from './share/PlatformPreviewCanvas';
import { ShareActions } from './share/ShareActions';
import { useShareReport } from '../lib/hooks/useShareReport';
import {
  DEFAULT_PLATFORM,
  getPlatformConfig,
  type SharePlatformType,
} from '../lib/utils/platformConfigs';

interface ShareReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  report: Report;
}

export const ShareReportModal: React.FC<ShareReportModalProps> = ({
  isOpen,
  onClose,
  report,
}) => {
  const [selectedPlatform, setSelectedPlatform] = useState<SharePlatformType>(DEFAULT_PLATFORM);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  const {
    isGenerating,
    error,
    generatePreview,
    downloadPreview,
    sharePreview,
    copyLink,
    clearCache,
    canShare,
  } = useShareReport();

  const platformConfig = getPlatformConfig(selectedPlatform);

  // Generate preview when platform changes or modal opens
  useEffect(() => {
    if (isOpen && previewRef.current) {
      const timer = setTimeout(() => {
        handleGeneratePreview();
      }, 300); // Small delay to ensure DOM is ready

      return () => clearTimeout(timer);
    }
  }, [selectedPlatform, isOpen]);

  // Clear cache and preview URL when modal closes
  useEffect(() => {
    if (!isOpen) {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      clearCache();
      setPreviewUrl(null);
    }
  }, [isOpen, clearCache, previewUrl]);

  // Clean up preview URL on unmount
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleGeneratePreview = async () => {
    if (!previewRef.current) return;

    try {
      // Revoke old URL if exists
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }

      const blob = await generatePreview(previewRef.current, platformConfig);
      const url = URL.createObjectURL(blob);
      setPreviewUrl(url);
    } catch (error) {
      console.error('Failed to generate preview:', error);
      setPreviewUrl(null);
    }
  };

  const handleDownload = async () => {
    if (!previewUrl && previewRef.current) {
      await handleGeneratePreview();
    }
    await downloadPreview(platformConfig, report.id);
  };

  const handleShare = async () => {
    if (!previewUrl && previewRef.current) {
      await handleGeneratePreview();
    }
    await sharePreview(platformConfig, report);
  };

  const handleCopyLink = async () => {
    await copyLink(report.id);
  };

  const handlePlatformChange = (platform: SharePlatformType) => {
    setSelectedPlatform(platform);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Share Report"
        size="xl"
      >
        <div className="flex flex-col gap-4">
          {/* Preview Area */}
          <div>
            <div className="relative bg-bg-main rounded-lg border border-border overflow-hidden">
              {/* Loading Skeleton */}
              {isGenerating && (
                <div className="absolute inset-0 flex items-center justify-center bg-bg-surface/80 backdrop-blur-sm z-10">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin" />
                    <p className="text-sm text-text-secondary">Generating preview...</p>
                  </div>
                </div>
              )}

              {/* Preview Display */}
              <div className="flex items-center justify-center p-4">
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="Share preview"
                    className="max-w-full h-auto rounded-lg shadow-lg"
                    style={{
                      maxHeight: '500px',
                      aspectRatio: platformConfig.aspectRatio,
                    }}
                  />
                ) : (
                  <div
                    className="flex items-center justify-center bg-gradient-to-br from-bg-surface to-bg-elevated rounded-lg"
                    style={{
                      width: '100%',
                      maxWidth: '600px',
                      aspectRatio: platformConfig.aspectRatio,
                      minHeight: '300px',
                    }}
                  >
                    <div className="text-center p-8">
                      <svg
                        className="w-16 h-16 mx-auto mb-4 text-text-muted"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      <p className="text-sm text-text-muted">
                        Generating preview...
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Error Display */}
              {error && (
                <div className="m-4 bg-error/10 border border-error rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <svg
                      className="w-5 h-5 text-error flex-shrink-0 mt-0.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <p className="text-sm text-error">{error}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Platform Selector */}
          <div>
            <SharePlatformSelector
              selectedPlatform={selectedPlatform}
              onSelectPlatform={handlePlatformChange}
            />
          </div>

          {/* Share Actions */}
          <ShareActions
            report={report}
            platform={platformConfig}
            isGenerating={isGenerating}
            canShare={canShare}
            onDownload={handleDownload}
            onShare={handleShare}
            onCopyLink={handleCopyLink}
          />
        </div>
      </Modal>

      {/* Hidden Preview Canvas for html2canvas */}
      <PlatformPreviewCanvas
        report={report}
        platform={selectedPlatform}
        previewRef={previewRef}
      />
    </>
  );
};
