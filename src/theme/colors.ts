const colors = {
  /*
   * ─────────────────────────────
   * BACKGROUND
   * ─────────────────────────────
   */

  background: '#050711',

  backgroundSoft: '#080B18',

  /*
   * ─────────────────────────────
   * DARK ENTERPRISE SURFACES
   * ─────────────────────────────
   */

  surface: 'rgba(18, 24, 46, 0.84)',

  surfaceElevated: 'rgba(20, 26, 49, 0.90)',

  surfaceStrong: '#10182B',

  /*
   * ─────────────────────────────
   * PRIMARY
   * ─────────────────────────────
   */

  primary: '#5B8CFF',

  primaryPressed: '#4878E8',

  primarySoft: 'rgba(91, 140, 255, 0.14)',

  primaryBorder: 'rgba(91, 140, 255, 0.28)',

  primaryShadow: '#5B8CFF',

  /*
   * ─────────────────────────────
   * SECONDARY
   * ─────────────────────────────
   */

  secondary: '#9B7BFF',

  secondarySoft: 'rgba(155, 123, 255, 0.14)',

  /*
   * ─────────────────────────────
   * CATEGORY COLORS
   * ─────────────────────────────
   */

  categories: {
    dashboard: '#5B8CFF',

    vehicles: '#1688FF',

    drivers: '#00D6C9',

    trips: '#9B5CFF',

    maintenance: '#FF9F1C',

    accounts: '#00D6A3',
  },

  /*
   * ─────────────────────────────
   * EXTRA AURORA ACCENTS
   * ─────────────────────────────
   */

  electricCyan: '#55D6FF',

  violet: '#C15CFF',

  /*
   * ─────────────────────────────
   * TEXT
   * ─────────────────────────────
   */

  textPrimary: '#F5F7FF',

  textSecondary: '#9AA4BF',

  textMuted: '#6F7892',

  textSoft: '#CBD3E6',

  /*
   * ─────────────────────────────
   * BORDERS
   * ─────────────────────────────
   */

  border: 'rgba(255, 255, 255, 0.08)',

  borderLight: 'rgba(255, 255, 255, 0.05)',

  borderStrong: 'rgba(143, 157, 255, 0.15)',

  /*
   * ─────────────────────────────
   * SEMANTIC COLORS
   * ─────────────────────────────
   */

  success: '#39E6C4',

  successSoft: 'rgba(57, 230, 196, 0.14)',

  warning: '#FFC857',

  warningSoft: 'rgba(255, 200, 87, 0.14)',

  danger: '#FF6685',

  dangerSoft: 'rgba(255, 102, 133, 0.14)',

  info: '#55D6FF',

  infoSoft: 'rgba(85, 214, 255, 0.14)',

  /*
   * ─────────────────────────────
   * BASE
   * ─────────────────────────────
   */

  white: '#FFFFFF',

  black: '#000000',

  transparent: 'transparent',
} as const;

export default colors;