/**
 * Utility functions for sharing reports across platforms
 * Handles image generation, download, clipboard, and Web Share API
 */

import html2canvas from 'html2canvas';
import type { SharePlatformType, PlatformConfig } from './platformConfigs';

/**
 * Generate a shareable image from a DOM element using html2canvas
 */
export const generateShareImage = async (
  element: HTMLElement,
  platform: PlatformConfig
): Promise<Blob> => {
  try {
    // Ensure element is visible for proper rendering
    const originalStyle = element.style.cssText;
    element.style.position = 'fixed';
    element.style.left = '0';
    element.style.top = '0';
    element.style.opacity = '1';
    element.style.zIndex = '999999';

    // Wait for images to load
    await new Promise((resolve) => setTimeout(resolve, 200));

    const canvas = await html2canvas(element, {
      scale: 1,
      backgroundColor: null,
      logging: false,
      useCORS: true,
      allowTaint: true,
    });

    // Restore original styles
    element.style.cssText = originalStyle;

    return new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to generate image blob'));
          }
        },
        'image/png',
        1.0
      );
    });
  } catch (error) {
    console.error('Error generating share image:', error);
    throw new Error('Failed to generate share image');
  }
};

/**
 * Download a blob as a file
 */
export const downloadImage = (blob: Blob, filename: string): void => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Check if Web Share API with files is supported
 */
export const canShareFiles = (): boolean => {
  return (
    typeof navigator !== 'undefined' &&
    'share' in navigator &&
    'canShare' in navigator
  );
};

/**
 * Share via Web Share API (mobile)
 */
export const shareViaWebAPI = async (
  blob: Blob,
  url: string,
  title: string,
  text?: string
): Promise<void> => {
  if (!canShareFiles()) {
    throw new Error('Web Share API not supported');
  }

  try {
    const file = new File([blob], 'transjakarta-report.png', {
      type: 'image/png',
    });

    const shareData: ShareData = {
      title,
      text: text || 'Check out this TransJakarta report',
      url,
      files: [file],
    };

    // Check if the data can be shared
    if (navigator.canShare && !navigator.canShare(shareData)) {
      // Fallback: share without files
      delete shareData.files;
    }

    await navigator.share(shareData);
  } catch (error) {
    // User cancelled or error occurred
    if ((error as Error).name !== 'AbortError') {
      console.error('Error sharing via Web Share API:', error);
      throw error;
    }
  }
};

/**
 * Copy text to clipboard
 */
export const copyToClipboard = async (text: string): Promise<void> => {
  if (typeof navigator === 'undefined' || !navigator.clipboard) {
    throw new Error('Clipboard API not supported');
  }

  try {
    await navigator.clipboard.writeText(text);
  } catch (error) {
    console.error('Error copying to clipboard:', error);
    throw new Error('Failed to copy to clipboard');
  }
};

/**
 * Generate filename for downloaded image
 */
export const generateFilename = (
  reportId: number,
  platform: SharePlatformType
): string => {
  const timestamp = new Date().toISOString().split('T')[0];
  return `transjakarta-report-${reportId}-${platform}-${timestamp}.png`;
};

/**
 * Get report URL for sharing
 */
export const getReportUrl = (reportId: number): string => {
  const baseUrl = window.location.origin;
  return `${baseUrl}/feed/${reportId}`;
};

/**
 * Format share text based on report data
 */
export const formatShareText = (
  title: string,
  reportType: string
): string => {
  return `Check out this ${reportType} report on TransJakarta Routes: "${title}"`;
};
