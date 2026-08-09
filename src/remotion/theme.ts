/**
 * Visual design tokens for the EduVision video engine.
 * Centralising these keeps every scene visually consistent and easy to theme.
 */

export const VIDEO = {
  width: 1920,
  height: 1080,
  fps: 30,
} as const;

export const COLORS = {
  background: '#0d1b2a',
  backgroundDeep: '#08111f',
  primary: '#f4a300', // warm gold — brand accent
  secondary: '#38b6ff', // blue
  success: '#3ddc97',
  panel: 'rgba(16, 27, 44, 0.82)',
  text: '#f5f8fc',
  textMuted: '#aab8cc',
  divider: 'rgba(255, 255, 255, 0.14)',
} as const;

/**
 * Font stack. The first family is a full-coverage script font (Noto Sans,
 * spans Latin + Devanagari + Kannada + other Indian scripts) if bundled into
 * public/fonts. Nirmala UI (Windows) also covers most Indian scripts, so
 * Kannada/Hindi render correctly in preview even without bundled fonts.
 */
export const FONTS = {
  display:
    "'Noto Sans', 'Baloo Tamma 2', 'Nirmala UI', 'Segoe UI', system-ui, sans-serif",
  body: "'Noto Sans', 'Nirmala UI', 'Segoe UI', system-ui, sans-serif",
} as const;

export const LAYOUT = {
  paddingX: 140,
  paddingY: 110,
  maxTextWidth: 1400,
} as const;
