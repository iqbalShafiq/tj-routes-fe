/**
 * Custom hook for sharing reports with image generation
 * Manages state and provides methods for generating, downloading, and sharing report images
 */

import { useState, useCallback, useRef } from 'react';
import type { Report } from '../api/reports';
import type { SharePlatformType, PlatformConfig } from '../utils/platformConfigs';
import {
  generateShareImage,
  downloadImage,
  shareViaWebAPI,
  copyToClipboard,
  generateFilename,
  getReportUrl,
  formatShareText,
  canShareFiles,
} from '../utils/shareUtils';

interface UseShareReportReturn {
  isGenerating: boolean;
  error: string | null;
  generatedImages: Map<SharePlatformType, Blob>;
  generatePreview: (element: HTMLElement, platform: PlatformConfig) => Promise<Blob>;
  downloadPreview: (platform: PlatformConfig, reportId: number) => Promise<void>;
  sharePreview: (platform: PlatformConfig, report: Report) => Promise<void>;
  copyLink: (reportId: number) => Promise<void>;
  clearCache: () => void;
  canShare: boolean;
}

export const useShareReport = (): UseShareReportReturn => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const generatedImagesRef = useRef<Map<SharePlatformType, Blob>>(new Map());

  const canShare = canShareFiles();

  /**
   * Generate preview image for a platform
   */
  const generatePreview = useCallback(
    async (element: HTMLElement, platform: PlatformConfig): Promise<Blob> => {
      setIsGenerating(true);
      setError(null);

      try {
        // Check if already cached
        const cached = generatedImagesRef.current.get(platform.id);
        if (cached) {
          setIsGenerating(false);
          return cached;
        }

        // Generate new image
        const blob = await generateShareImage(element, platform);

        // Cache the result
        generatedImagesRef.current.set(platform.id, blob);

        setIsGenerating(false);
        return blob;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to generate preview';
        setError(errorMessage);
        setIsGenerating(false);
        throw err;
      }
    },
    []
  );

  /**
   * Download preview image
   */
  const downloadPreview = useCallback(
    async (platform: PlatformConfig, reportId: number): Promise<void> => {
      setError(null);

      try {
        const blob = generatedImagesRef.current.get(platform.id);
        if (!blob) {
          throw new Error('Please generate preview first');
        }

        const filename = generateFilename(reportId, platform.id);
        downloadImage(blob, filename);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to download image';
        setError(errorMessage);
        throw err;
      }
    },
    []
  );

  /**
   * Share preview via Web Share API (mobile)
   */
  const sharePreview = useCallback(
    async (platform: PlatformConfig, report: Report): Promise<void> => {
      setError(null);

      try {
        const blob = generatedImagesRef.current.get(platform.id);
        if (!blob) {
          throw new Error('Please generate preview first');
        }

        const url = getReportUrl(report.id);
        const title = report.title;
        const text = formatShareText(report.title, report.type);

        await shareViaWebAPI(blob, url, title, text);
      } catch (err) {
        // Don't set error for user cancellation
        if ((err as Error).name !== 'AbortError') {
          const errorMessage = err instanceof Error ? err.message : 'Failed to share';
          setError(errorMessage);
          throw err;
        }
      }
    },
    []
  );

  /**
   * Copy report link to clipboard
   */
  const copyLink = useCallback(async (reportId: number): Promise<void> => {
    setError(null);

    try {
      const url = getReportUrl(reportId);
      await copyToClipboard(url);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to copy link';
      setError(errorMessage);
      throw err;
    }
  }, []);

  /**
   * Clear image cache
   */
  const clearCache = useCallback(() => {
    generatedImagesRef.current.clear();
  }, []);

  return {
    isGenerating,
    error,
    generatedImages: generatedImagesRef.current,
    generatePreview,
    downloadPreview,
    sharePreview,
    copyLink,
    clearCache,
    canShare,
  };
};
