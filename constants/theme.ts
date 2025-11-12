// theme.ts - dummy content
export const Colors = {
  // Dark Blue Theme - أزرق غامق احترافي
  primary: '#1E40AF',        // Dark Blue - أزرق غامق
  primaryDark: '#1E3A8A',    // Darker Blue
  primaryLight: '#3B82F6',   // Light Blue
  secondary: '#06B6D4',      // Cyan - سماوي مخضر
  secondaryDark: '#0891B2',  // Darker Cyan
  secondaryLight: '#22D3EE', // Light Cyan
  accent: '#F43F5E',         // Rose - لون مميز للتفاعلات
  accentLight: '#FB7185',    // Light Rose
  orange: '#F97316',
  orangeGradient: '#FB923C',
  white: '#FFFFFF',
  black: '#000000',
  
  // Gradient Colors for modern UI - Purple → Red → Blue
  gradient: {
    start: '#9333EA',    // Purple (بنفسجي)
    middle: '#EF4444',   // Red (أحمر)
    end: '#3B82F6',      // Blue (أزرق)
    ocean: '#06B6D4',    // Cyan
  },
  
  gray: {
    50: '#F8FAFC',
    100: '#F1F5F9',
    200: '#E2E8F0',
    300: '#CBD5E1',
    400: '#94A3B8',
    500: '#64748B',
    600: '#475569',
    700: '#334155',
    800: '#1E293B',
    900: '#0F172A',
  },
  success: '#10B981',
  successLight: '#34D399',
  warning: '#F59E0B',
  warningLight: '#FBBF24',
  error: '#EF4444',
  errorLight: '#FCA5A5',
  background: '#F8FAFC',
  surface: '#FFFFFF',
  surfaceElevated: '#FFFFFF',
  text: {
    primary: '#1E40AF',      // Dark Blue for primary text - أزرق غامق للنصوص الرئيسية
    secondary: '#1E3A8A',    // Darker Blue for secondary text
    tertiary: '#3B82F6',     // Light Blue for tertiary text
    inverse: '#FFFFFF',
  },
  border: {
    light: '#E2E8F0',
    default: '#CBD5E1',
    dark: '#94A3B8',
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const BorderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
};

export const FontSizes = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 17,
  xl: 19,
  xxl: 22,
  xxxl: 28,
  xxxxl: 36,
};

export const FontWeights = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
  extrabold: '800' as const,
};

export const Shadows = {
  sm: {
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  lg: {
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  xl: {
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
};
