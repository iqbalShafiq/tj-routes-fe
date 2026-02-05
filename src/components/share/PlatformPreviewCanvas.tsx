/**
 * PlatformPreviewCanvas - Renders platform-specific preview layouts for sharing
 * Each platform has a unique template optimized for its aspect ratio
 */

import React from 'react';
import type { Report } from '../../lib/api/reports';
import type { SharePlatformType } from '../../lib/utils/platformConfigs';
import { BRAND_COLORS } from '../../lib/utils/platformConfigs';
import { format } from 'date-fns';

interface PlatformPreviewCanvasProps {
  report: Report;
  platform: SharePlatformType;
  previewRef: React.RefObject<HTMLDivElement | null>;
}

export const PlatformPreviewCanvas: React.FC<PlatformPreviewCanvasProps> = ({
  report,
  platform,
  previewRef,
}) => {
  const hasImages = report.photo_urls && report.photo_urls.length > 0;
  const firstImage = hasImages ? report.photo_urls![0] : null;
  const imageCount = report.photo_urls?.length || 0;

  const reportTypeLabels: Record<string, string> = {
    route_issue: 'Route Issue',
    stop_issue: 'Stop Issue',
    temporary_event: 'Temporary Event',
    policy_change: 'Policy Change',
  };



  const formattedDate = format(new Date(report.created_at), 'MMM dd, yyyy');
  const routeInfo = report.route
    ? `Route ${report.route.route_number} - ${report.route.name}`
    : report.stop
    ? `Stop: ${report.stop.name}`
    : 'TransJakarta Report';

  // Common styles for all platforms - opacity-based hiding for reliable html2canvas rendering
  const baseStyles: React.CSSProperties = {
    position: 'fixed',
    left: 0,
    top: 0,
    opacity: 0,
    pointerEvents: 'none',
    zIndex: -1,
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    color: BRAND_COLORS.text,
    overflow: 'hidden',
  };

  // Render Instagram Story layout (9:16)
  const renderInstagramStory = () => (
    <div
      ref={previewRef}
      style={{
        ...baseStyles,
        width: '1080px',
        height: '1920px',
        background: hasImages
          ? `linear-gradient(rgba(15, 40, 34, 0.7), rgba(15, 40, 34, 0.9)), url(${firstImage})`
          : `linear-gradient(135deg, ${BRAND_COLORS.background} 0%, ${BRAND_COLORS.primary} 100%)`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        position: 'relative',
        padding: '100px 80px',
      }}
    >
      {/* Top Section - Report Type Badge */}
      <div
        style={{
          backgroundColor: BRAND_COLORS.primary,
          padding: '24px 40px',
          borderRadius: '30px',
          fontSize: '32px',
          fontWeight: '600',
          lineHeight: '38px',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <span style={{ display: 'inline-block', transform: 'translateY(-12px)' }}>
          {reportTypeLabels[report.type]}
        </span>
      </div>

      {/* Middle Section - Title - Absolutely Centered */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '80px',
          right: '80px',
          transform: 'translateY(-50%)',
        }}
      >
        <h1
          style={{
            fontFamily: '"Space Grotesk", sans-serif',
            fontSize: '72px',
            fontWeight: '700',
            lineHeight: 1.2,
            margin: 0,
            marginBottom: '40px',
            textShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
          }}
        >
          {report.title}
        </h1>
        {report.description && (
          <p
            style={{
              fontSize: '40px',
              lineHeight: 1.7,
              color: BRAND_COLORS.textMuted,
              margin: 0,
            }}
          >
            {report.description}
          </p>
        )}
      </div>

      {/* Bottom Section - Metadata */}
      <div
        style={{
          position: 'absolute',
          bottom: '100px',
          left: '80px',
          right: '80px',
          display: 'flex',
          flexDirection: 'column',
          gap: '30px',
        }}
      >
        <div
          style={{
            fontSize: '36px',
            fontWeight: '500',
            color: BRAND_COLORS.textMuted,
          }}
        >
          {routeInfo}
        </div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div style={{ fontSize: '32px', color: BRAND_COLORS.textMuted }}>
            {formattedDate}
          </div>
          <div
            style={{
              fontSize: '48px',
              fontWeight: '700',
              fontFamily: '"Space Grotesk", sans-serif',
            }}
          >
            TransJakarta
          </div>
        </div>
      </div>
    </div>
  );

  // Render Instagram Post layout (1:1)
  const renderInstagramPost = () => (
    <div
      ref={previewRef}
      style={{
        ...baseStyles,
        width: '1080px',
        height: '1080px',
        backgroundColor: BRAND_COLORS.background,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Image Section - Top 60% */}
      {hasImages ? (
        <div
          style={{
            height: '648px',
            position: 'relative',
            background: `url(${firstImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          {imageCount > 1 && (
            <div
              style={{
                position: 'absolute',
                top: '30px',
                right: '30px',
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                padding: '15px 30px',
                borderRadius: '20px',
                fontSize: '28px',
                fontWeight: '600',
              }}
            >
              +{imageCount - 1} more
            </div>
          )}
          {/* Report Type Badge */}
          <div
            style={{
              position: 'absolute',
              top: '30px',
              left: '30px',
              backgroundColor: BRAND_COLORS.primary,
              padding: '18px 30px',
              borderRadius: '20px',
              fontSize: '28px',
              fontWeight: '600',
              lineHeight: '34px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <span style={{ display: 'inline-block', transform: 'translateY(-12px)' }}>
              {reportTypeLabels[report.type]}
            </span>
          </div>
        </div>
      ) : (
        <div
          style={{
            height: '648px',
            background: `linear-gradient(135deg, ${BRAND_COLORS.background} 0%, ${BRAND_COLORS.primary} 100%)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '60px',
          }}
        >
          <div
            style={{
              fontSize: '64px',
              fontWeight: '700',
              fontFamily: '"Space Grotesk", sans-serif',
              textAlign: 'center',
              textShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
            }}
          >
            {reportTypeLabels[report.type]}
          </div>
        </div>
      )}

      {/* Text Section - Bottom 40% */}
      <div
        style={{
          flex: 1,
          padding: '50px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}
      >
        <div>
          <h2
            style={{
              fontFamily: '"Space Grotesk", sans-serif',
              fontSize: '42px',
              fontWeight: '700',
              lineHeight: 1.25,
              marginBottom: '20px',
            }}
          >
            {report.title}
          </h2>
          <p
            style={{
              fontSize: '28px',
              lineHeight: 1.6,
              color: BRAND_COLORS.textMuted,
            }}
          >
            {routeInfo}
          </p>
        </div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div style={{ fontSize: '24px', color: BRAND_COLORS.textMuted }}>
            {formattedDate}
          </div>
          <div
            style={{
              fontSize: '36px',
              fontWeight: '700',
              fontFamily: '"Space Grotesk", sans-serif',
            }}
          >
            TransJakarta
          </div>
        </div>
      </div>
    </div>
  );

  // Render Twitter/X layout (16:9)
  const renderTwitter = () => (
    <div
      ref={previewRef}
      style={{
        ...baseStyles,
        width: '1200px',
        height: '675px',
        backgroundColor: BRAND_COLORS.background,
        display: 'flex',
      }}
    >
      {/* Left Section - Image (60%) */}
      <div
        style={{
          width: '720px',
          background: hasImages
            ? `url(${firstImage})`
            : `linear-gradient(135deg, ${BRAND_COLORS.background} 0%, ${BRAND_COLORS.primary} 100%)`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          position: 'relative',
        }}
      >
        {!hasImages && (
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              fontSize: '72px',
              fontWeight: '700',
              fontFamily: '"Space Grotesk", sans-serif',
              textAlign: 'center',
            }}
          >
            TransJakarta
          </div>
        )}
      </div>

      {/* Right Section - Content (40%) */}
      <div
        style={{
          flex: 1,
          padding: '50px',
          position: 'relative',
        }}
      >
        {/* Centered Content */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50px',
            right: '50px',
            transform: 'translateY(-50%)',
          }}
        >
          {/* Report Type Badge */}
          <div
            style={{
              backgroundColor: BRAND_COLORS.primary,
              padding: '14px 24px',
              borderRadius: '20px',
              fontSize: '20px',
              fontWeight: '600',
              lineHeight: '26px',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '24px',
            }}
          >
            <span style={{ display: 'inline-block', transform: 'translateY(-12px)' }}>
              {reportTypeLabels[report.type]}
            </span>
          </div>
          <h2
            style={{
              fontFamily: '"Space Grotesk", sans-serif',
              fontSize: '36px',
              fontWeight: '700',
              lineHeight: 1.25,
              margin: 0,
              marginBottom: '20px',
            }}
          >
            {report.title}
          </h2>
          <p
            style={{
              fontSize: '20px',
              color: BRAND_COLORS.textMuted,
              lineHeight: 1.6,
              margin: 0,
            }}
          >
            {routeInfo}
          </p>
        </div>

        {/* Bottom Metadata */}
        <div
          style={{
            position: 'absolute',
            bottom: '50px',
            left: '50px',
            right: '50px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '18px',
            color: BRAND_COLORS.textMuted,
          }}
        >
          <div>{formattedDate}</div>
          <div style={{ display: 'flex', gap: '20px' }}>
            <span>↑ {report.upvotes}</span>
            <span>💬 {report.comment_count}</span>
          </div>
        </div>
      </div>
    </div>
  );

  // Render Facebook OG Card layout (1.91:1)
  const renderFacebook = () => (
    <div
      ref={previewRef}
      style={{
        ...baseStyles,
        width: '1200px',
        height: '630px',
        backgroundColor: BRAND_COLORS.background,
        position: 'relative',
      }}
    >
      {/* Background Image */}
      {hasImages && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: `linear-gradient(rgba(15, 40, 34, 0.85), rgba(15, 40, 34, 0.95)), url(${firstImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
      )}

      {/* Content */}
      <div
        style={{
          position: 'relative',
          height: '100%',
          padding: '60px 80px',
        }}
      >
        {/* Top - Report Type */}
        <div
          style={{
            backgroundColor: BRAND_COLORS.primary,
            padding: '20px 32px',
            borderRadius: '24px',
            fontSize: '24px',
            fontWeight: '600',
            lineHeight: '30px',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <span style={{ display: 'inline-block', transform: 'translateY(-12px)' }}>
            {reportTypeLabels[report.type]}
          </span>
        </div>

        {/* Middle - Title & Description - Absolutely Centered */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '80px',
            right: '80px',
            transform: 'translateY(-50%)',
          }}
        >
          <h1
            style={{
              fontFamily: '"Space Grotesk", sans-serif',
              fontSize: '56px',
              fontWeight: '700',
              lineHeight: 1.2,
              margin: 0,
              marginBottom: '24px',
            }}
          >
            {report.title}
          </h1>
          <p
            style={{
              fontSize: '28px',
              lineHeight: 1.6,
              color: BRAND_COLORS.textMuted,
              margin: 0,
            }}
          >
            {routeInfo}
          </p>
        </div>

        {/* Bottom - Source */}
        <div
          style={{
            position: 'absolute',
            bottom: '60px',
            left: '80px',
            right: '80px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div style={{ fontSize: '22px', color: BRAND_COLORS.textMuted }}>
            TransJakarta Routes App • {formattedDate}
          </div>
          <div
            style={{
              fontSize: '48px',
              fontWeight: '700',
              fontFamily: '"Space Grotesk", sans-serif',
            }}
          >
            TJ
          </div>
        </div>
      </div>
    </div>
  );

  // Render WhatsApp layout (4:3)
  const renderWhatsApp = () => (
    <div
      ref={previewRef}
      style={{
        ...baseStyles,
        width: '1200px',
        height: '900px',
        backgroundColor: BRAND_COLORS.background,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Top - Branding */}
      <div
        style={{
          padding: '40px 60px',
          backgroundColor: BRAND_COLORS.primary,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div
          style={{
            fontSize: '48px',
            fontWeight: '700',
            fontFamily: '"Space Grotesk", sans-serif',
          }}
        >
          TransJakarta
        </div>
        <div
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            padding: '16px 28px',
            borderRadius: '20px',
            fontSize: '24px',
            fontWeight: '600',
            lineHeight: '30px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <span style={{ display: 'inline-block', transform: 'translateY(-12px)' }}>
            {reportTypeLabels[report.type]}
          </span>
        </div>
      </div>

      {/* Middle - Image (if available) */}
      {hasImages && (
        <div
          style={{
            height: '450px',
            background: `url(${firstImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            position: 'relative',
          }}
        >
          {imageCount > 1 && (
            <div
              style={{
                position: 'absolute',
                bottom: '30px',
                right: '30px',
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                padding: '16px 32px',
                borderRadius: '24px',
                fontSize: '28px',
                fontWeight: '600',
              }}
            >
              +{imageCount - 1} more photos
            </div>
          )}
        </div>
      )}

      {/* Content */}
      <div
        style={{
          flex: 1,
          padding: '50px 60px',
          position: 'relative',
        }}
      >
        {/* Centered Content */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '60px',
            right: '60px',
            transform: 'translateY(-50%)',
          }}
        >
          <h2
            style={{
              fontFamily: '"Space Grotesk", sans-serif',
              fontSize: hasImages ? '42px' : '56px',
              fontWeight: '700',
              lineHeight: 1.25,
              margin: 0,
              marginBottom: '24px',
            }}
          >
            {report.title}
          </h2>
          {report.description && (
            <p
              style={{
                fontSize: '28px',
                lineHeight: 1.7,
                color: BRAND_COLORS.textMuted,
                margin: 0,
              }}
            >
              {report.description}
            </p>
          )}
        </div>

        {/* Bottom Section */}
        <div
          style={{
            position: 'absolute',
            bottom: '50px',
            left: '60px',
            right: '60px',
            borderTop: `2px solid ${BRAND_COLORS.primary}`,
            paddingTop: '24px',
          }}
        >
          <div
            style={{
              fontSize: '24px',
              lineHeight: 1.6,
              color: BRAND_COLORS.textMuted,
            }}
          >
            {routeInfo}
          </div>
        </div>
      </div>
    </div>
  );

  // Render based on platform
  switch (platform) {
    case 'instagram_story':
      return renderInstagramStory();
    case 'instagram_post':
      return renderInstagramPost();
    case 'twitter':
      return renderTwitter();
    case 'facebook':
      return renderFacebook();
    case 'whatsapp':
      return renderWhatsApp();
    default:
      return renderInstagramPost();
  }
};
