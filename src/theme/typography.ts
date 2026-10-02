const typography = {
  fontFamily: {
    regular: 'System',
    medium: 'System',
    semiBold: 'System',
    bold: 'System',
  },

  size: {
    xs: 10,
    sm: 12,
    md: 14,
    lg: 16,
    xl: 20,
    xxl: 28,
    xxxl: 32,
  },

  lineHeight: {
    xs: 14,
    sm: 17,
    md: 20,
    lg: 23,
    xl: 27,
    xxl: 34,
    xxxl: 38,
  },

  weight: {
    regular: '400',
    medium: '500',
    semiBold: '600',
    bold: '700',
    extraBold: '800',
  },

  letterSpacing: {
    tight: -0.3,
    normal: 0,
    wide: 0.4,
    heading: 0.7,
  },
} as const;

export default typography;