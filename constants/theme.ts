// Finly Design System
// A sophisticated, premium financial app aesthetic
// Inspired by: Revolut, N26, Apple Wallet

// ============================================
// COLOR PALETTE
// ============================================

export const COLORS = {
    light: {
        // Brand - Sophisticated teal
        primary: '#0D9488',
        primaryDark: '#0F766E',
        primaryLight: '#14B8A6',
        primaryMuted: 'rgba(13, 148, 136, 0.08)',
        primarySoft: 'rgba(13, 148, 136, 0.12)',

        // Semantic
        success: '#059669',
        successMuted: 'rgba(5, 150, 105, 0.08)',
        warning: '#D97706',
        warningMuted: 'rgba(217, 119, 6, 0.08)',
        danger: '#DC2626',
        dangerMuted: 'rgba(220, 38, 38, 0.08)',

        // Backgrounds
        background: '#FFFFFF',
        backgroundSecondary: '#F8FAFC',
        surface: '#FFFFFF',
        surfaceSecondary: '#F1F5F9',
        elevated: '#FFFFFF',

        // Text - True neutrals
        textPrimary: '#0F172A',
        textSecondary: '#475569',
        textTertiary: '#94A3B8',
        textQuaternary: '#CBD5E1',
        textInverse: '#FFFFFF',

        // Borders & Dividers
        border: '#E2E8F0',
        borderLight: '#F1F5F9',
        separator: '#E2E8F0',

        // Interactive
        fill: '#F1F5F9',
        fillSecondary: '#E2E8F0',
        overlay: 'rgba(15, 23, 42, 0.5)',

        // Static
        white: '#FFFFFF',
        black: '#000000',
    },
    dark: {
        // Brand
        primary: '#14B8A6',
        primaryDark: '#0D9488',
        primaryLight: '#2DD4BF',
        primaryMuted: 'rgba(20, 184, 166, 0.12)',
        primarySoft: 'rgba(20, 184, 166, 0.16)',

        // Semantic
        success: '#10B981',
        successMuted: 'rgba(16, 185, 129, 0.12)',
        warning: '#F59E0B',
        warningMuted: 'rgba(245, 158, 11, 0.12)',
        danger: '#EF4444',
        dangerMuted: 'rgba(239, 68, 68, 0.12)',

        // Backgrounds
        background: '#0F172A',
        backgroundSecondary: '#1E293B',
        surface: '#1E293B',
        surfaceSecondary: '#334155',
        elevated: '#334155',

        // Text
        textPrimary: '#F8FAFC',
        textSecondary: '#CBD5E1',
        textTertiary: '#64748B',
        textQuaternary: '#475569',
        textInverse: '#0F172A',

        // Borders & Dividers
        border: '#334155',
        borderLight: '#1E293B',
        separator: '#334155',

        // Interactive
        fill: '#334155',
        fillSecondary: '#475569',
        overlay: 'rgba(0, 0, 0, 0.7)',

        // Static
        white: '#FFFFFF',
        black: '#000000',
    }
};

export const getColors = (scheme: 'light' | 'dark' | null | undefined) => {
    return COLORS[scheme === 'dark' ? 'dark' : 'light'];
};

// ============================================
// TYPOGRAPHY
// ============================================

export const FONTS = {
    regular: 'Rubik-Regular',
    medium: 'Rubik-Medium',
    semiBold: 'Rubik-SemiBold',
    bold: 'Rubik-Bold',
};

export const TYPOGRAPHY = {
    // Display
    display: {
        fontSize: 40,
        lineHeight: 48,
        fontFamily: 'Rubik-Bold',
        letterSpacing: -0.5,
    },
    // Headings
    h1: {
        fontSize: 32,
        lineHeight: 40,
        fontFamily: 'Rubik-Bold',
        letterSpacing: -0.3,
    },
    h2: {
        fontSize: 24,
        lineHeight: 32,
        fontFamily: 'Rubik-Bold',
        letterSpacing: -0.2,
    },
    h3: {
        fontSize: 20,
        lineHeight: 28,
        fontFamily: 'Rubik-SemiBold',
        letterSpacing: 0,
    },
    h4: {
        fontSize: 18,
        lineHeight: 26,
        fontFamily: 'Rubik-SemiBold',
        letterSpacing: 0,
    },
    // Body
    bodyLarge: {
        fontSize: 17,
        lineHeight: 24,
        fontFamily: 'Rubik-Regular',
        letterSpacing: 0,
    },
    body: {
        fontSize: 15,
        lineHeight: 22,
        fontFamily: 'Rubik-Regular',
        letterSpacing: 0,
    },
    bodySmall: {
        fontSize: 14,
        lineHeight: 20,
        fontFamily: 'Rubik-Regular',
        letterSpacing: 0,
    },
    // Labels
    label: {
        fontSize: 14,
        lineHeight: 20,
        fontFamily: 'Rubik-Medium',
        letterSpacing: 0,
    },
    labelSmall: {
        fontSize: 12,
        lineHeight: 16,
        fontFamily: 'Rubik-Medium',
        letterSpacing: 0.1,
    },
    // Captions
    caption: {
        fontSize: 12,
        lineHeight: 16,
        fontFamily: 'Rubik-Regular',
        letterSpacing: 0.1,
    },
    captionSmall: {
        fontSize: 11,
        lineHeight: 14,
        fontFamily: 'Rubik-Regular',
        letterSpacing: 0.2,
    },
    // Special
    amount: {
        fontSize: 36,
        lineHeight: 44,
        fontFamily: 'Rubik-Bold',
        letterSpacing: -0.5,
    },
    amountSmall: {
        fontSize: 24,
        lineHeight: 32,
        fontFamily: 'Rubik-SemiBold',
        letterSpacing: -0.2,
    },
};

// ============================================
// SPACING
// ============================================

export const SPACING = {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    '2xl': 24,
    '3xl': 32,
    '4xl': 40,
    '5xl': 48,
    '6xl': 64,
};

// ============================================
// BORDER RADIUS
// ============================================

export const RADIUS = {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    '2xl': 24,
    '3xl': 32,
    full: 9999,
};

// ============================================
// SHADOWS - Subtle and elegant
// ============================================

export const SHADOWS = {
    none: {
        shadowColor: 'transparent',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0,
        shadowRadius: 0,
        elevation: 0,
    },
    xs: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.03,
        shadowRadius: 2,
        elevation: 1,
    },
    sm: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 2,
    },
    md: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 3,
    },
    lg: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 16,
        elevation: 6,
    },
    xl: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.1,
        shadowRadius: 24,
        elevation: 10,
    },
};

// ============================================
// LAYOUT CONSTANTS
// ============================================

export const LAYOUT = {
    screenPadding: 20,
    cardPadding: 16,
    inputHeight: 52,
    buttonHeight: 52,
    tabBarHeight: 80,
    headerHeight: 56,
};
