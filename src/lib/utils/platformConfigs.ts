/**
 * Platform-specific configurations for social media share previews
 * Each platform has optimized dimensions and aspect ratios
 */

export type SharePlatformType =
  | 'instagram_story'
  | 'instagram_post'
  | 'twitter'
  | 'facebook'
  | 'whatsapp';

export interface PlatformConfig {
  id: SharePlatformType;
  label: string;
  aspectRatio: string;
  width: number;
  height: number;
  description: string;
  icon: string; // Icon identifier
}

export const SHARE_PLATFORMS: Record<SharePlatformType, PlatformConfig> = {
  instagram_story: {
    id: 'instagram_story',
    label: 'IG Story',
    aspectRatio: '9/16',
    width: 1080,
    height: 1920,
    description: 'Vertical story format',
    icon: 'instagram',
  },
  instagram_post: {
    id: 'instagram_post',
    label: 'IG Post',
    aspectRatio: '1/1',
    width: 1080,
    height: 1080,
    description: 'Square post format',
    icon: 'instagram',
  },
  twitter: {
    id: 'twitter',
    label: 'X',
    aspectRatio: '16/9',
    width: 1200,
    height: 675,
    description: 'Horizontal card format',
    icon: 'twitter',
  },
  facebook: {
    id: 'facebook',
    label: 'Facebook',
    aspectRatio: '1.91/1',
    width: 1200,
    height: 630,
    description: 'Wide OG card format',
    icon: 'facebook',
  },
  whatsapp: {
    id: 'whatsapp',
    label: 'WhatsApp',
    aspectRatio: '4/3',
    width: 1200,
    height: 900,
    description: 'Flexible messaging format',
    icon: 'whatsapp',
  },
};

export const DEFAULT_PLATFORM: SharePlatformType = 'instagram_post';

// Helper to get platform config
export const getPlatformConfig = (platform: SharePlatformType): PlatformConfig => {
  return SHARE_PLATFORMS[platform];
};

// Helper to get all platforms as array
export const getAllPlatforms = (): PlatformConfig[] => {
  return Object.values(SHARE_PLATFORMS);
};

// Brand colors for preview rendering
export const BRAND_COLORS = {
  primary: '#1B4D3E', // Deep Forest Green
  secondary: '#C1674B', // Terracotta
  background: '#0F2822', // Darker variant of primary
  text: '#FFFFFF',
  textMuted: 'rgba(255, 255, 255, 0.7)',
};
