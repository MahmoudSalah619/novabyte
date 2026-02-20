// Brand Colors
export const COLORS = {
  // Primary brand colors
  primary: '#ffb339',
  primaryDark: '#e09818',
  
  // Background colors
  backgroundDark: '#0f172a',
  backgroundSecondary: '#1e293b',
  
  // Border and accent colors
  border: '#334155',
  borderHover: '#475569',
  
  // Text colors
  text: '#f8fafc',
  textMuted: '#cbd5e1',
  textSecondary: '#94a3b8',
  textTertiary: '#64748b',
  
  // Gradients
  gradient: {
    primary: 'linear-gradient(135deg, #ffb339, #e09818)',
    background: 'linear-gradient(to bottom, #0f172a, #1e293b)',
  },
  
  // Opacity variations
  opacity: {
    primary15: 'rgba(255, 179, 57, 0.15)',
    primary20: 'rgba(255, 179, 57, 0.2)',
    primary30: 'rgba(255, 179, 57, 0.3)',
    primary40: 'rgba(255, 179, 57, 0.4)',
    secondary50: 'rgba(30, 41, 59, 0.5)',
    secondary80: 'rgba(30, 41, 59, 0.8)',
    dark50: 'rgba(15, 23, 42, 0.5)',
    dark80: 'rgba(15, 23, 42, 0.8)',
    dark90: 'rgba(15, 23, 42, 0.9)',
    slate50: 'rgba(71, 85, 105, 0.5)',
  }
} as const;

export type Colors = typeof COLORS;
