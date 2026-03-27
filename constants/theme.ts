// Finly Design System v2.0
// A fresh, modern financial app aesthetic
// Inspired by: Linear, Mercury, Stripe, Arc Browser

// ============================================
// COLOR PALETTE - Fresh & Modern
// ============================================

export const COLORS = {
    light: {
        // Brand - Deep Indigo with warmth
        primary: '#6366F1',
        primaryDark: '#4F46E5',
        primaryLight: '#818CF8',
        primaryMuted: 'rgba(99, 102, 241, 0.08)',
        primarySoft: 'rgba(99, 102, 241, 0.15)',

        // Accent - Warm coral for highlights
        accent: '#F472B6',
        accentMuted: 'rgba(244, 114, 182, 0.1)',

        // Semantic - Vibrant but professional
        success: '#10B981',
        successMuted: 'rgba(16, 185, 129, 0.1)',
        successSoft: 'rgba(16, 185, 129, 0.15)',
        warning: '#F59E0B',
        warningMuted: 'rgba(245, 158, 11, 0.1)',
        warningSoft: 'rgba(245, 158, 11, 0.15)',
        danger: '#EF4444',
        dangerMuted: 'rgba(239, 68, 68, 0.1)',
        dangerSoft: 'rgba(239, 68, 68, 0.15)',
        info: '#3B82F6',
        infoMuted: 'rgba(59, 130, 246, 0.1)',

        // Backgrounds - Clean with subtle warmth
        background: '#FAFAFA',
        backgroundSecondary: '#F5F5F5',
        surface: '#FFFFFF',
        surfaceSecondary: '#F5F5F5',
        surfaceTertiary: '#EBEBEB',
        elevated: '#FFFFFF',
        card: '#FFFFFF',

        // Text - Rich contrast
        textPrimary: '#18181B',
        textSecondary: '#52525B',
        textTertiary: '#A1A1AA',
        textQuaternary: '#D4D4D8',
        textInverse: '#FFFFFF',

        // Borders & Dividers
        border: '#E4E4E7',
        borderLight: '#F4F4F5',
        borderStrong: '#D4D4D8',
        separator: '#E4E4E7',

        // Interactive
        fill: '#F4F4F5',
        fillSecondary: '#E4E4E7',
        fillActive: 'rgba(99, 102, 241, 0.1)',
        overlay: 'rgba(24, 24, 27, 0.6)',
        overlayLight: 'rgba(24, 24, 27, 0.3)',

        // Gradients (start, end)
        gradientPrimary: ['#6366F1', '#8B5CF6'],
        gradientSuccess: ['#10B981', '#34D399'],
        gradientWarm: ['#F472B6', '#FB7185'],

        // Static
        white: '#FFFFFF',
        black: '#000000',
    },
    dark: {
        // Brand
        primary: '#818CF8',
        primaryDark: '#6366F1',
        primaryLight: '#A5B4FC',
        primaryMuted: 'rgba(129, 140, 248, 0.15)',
        primarySoft: 'rgba(129, 140, 248, 0.2)',

        // Accent
        accent: '#F472B6',
        accentMuted: 'rgba(244, 114, 182, 0.15)',

        // Semantic
        success: '#34D399',
        successMuted: 'rgba(52, 211, 153, 0.15)',
        successSoft: 'rgba(52, 211, 153, 0.2)',
        warning: '#FBBF24',
        warningMuted: 'rgba(251, 191, 36, 0.15)',
        warningSoft: 'rgba(251, 191, 36, 0.2)',
        danger: '#F87171',
        dangerMuted: 'rgba(248, 113, 113, 0.15)',
        dangerSoft: 'rgba(248, 113, 113, 0.2)',
        info: '#60A5FA',
        infoMuted: 'rgba(96, 165, 250, 0.15)',

        // Backgrounds - Deep & rich
        background: '#09090B',
        backgroundSecondary: '#18181B',
        surface: '#18181B',
        surfaceSecondary: '#27272A',
        surfaceTertiary: '#3F3F46',
        elevated: '#27272A',
        card: '#18181B',

        // Text
        textPrimary: '#FAFAFA',
        textSecondary: '#A1A1AA',
        textTertiary: '#71717A',
        textQuaternary: '#52525B',
        textInverse: '#18181B',

        // Borders & Dividers
        border: '#27272A',
        borderLight: '#18181B',
        borderStrong: '#3F3F46',
        separator: '#27272A',

        // Interactive
        fill: '#27272A',
        fillSecondary: '#3F3F46',
        fillActive: 'rgba(129, 140, 248, 0.15)',
        overlay: 'rgba(0, 0, 0, 0.8)',
        overlayLight: 'rgba(0, 0, 0, 0.5)',

        // Gradients
        gradientPrimary: ['#818CF8', '#A78BFA'],
        gradientSuccess: ['#34D399', '#6EE7B7'],
        gradientWarm: ['#F472B6', '#FB7185'],

        // Static
        white: '#FFFFFF',
        black: '#000000',
    }
};

export const getColors = (scheme: 'light' | 'dark' | null | undefined) => {
    return COLORS[scheme === 'dark' ? 'dark' : 'light'];
};

// ============================================
// TYPOGRAPHY - Clean & Modern
// ============================================

export const FONTS = {
    regular: 'Rubik-Regular',
    medium: 'Rubik-Medium',
    semiBold: 'Rubik-SemiBold',
    bold: 'Rubik-Bold',
};

export const TYPOGRAPHY = {
    // Display - Hero text
    displayLarge: {
        fontSize: 48,
        lineHeight: 56,
        fontFamily: 'Rubik-Bold',
        letterSpacing: -1,
    },
    display: {
        fontSize: 36,
        lineHeight: 44,
        fontFamily: 'Rubik-Bold',
        letterSpacing: -0.5,
    },
    // Headings
    h1: {
        fontSize: 28,
        lineHeight: 36,
        fontFamily: 'Rubik-Bold',
        letterSpacing: -0.3,
    },
    h2: {
        fontSize: 22,
        lineHeight: 28,
        fontFamily: 'Rubik-SemiBold',
        letterSpacing: -0.2,
    },
    h3: {
        fontSize: 18,
        lineHeight: 24,
        fontFamily: 'Rubik-SemiBold',
        letterSpacing: 0,
    },
    h4: {
        fontSize: 16,
        lineHeight: 22,
        fontFamily: 'Rubik-SemiBold',
        letterSpacing: 0,
    },
    // Body
    bodyLarge: {
        fontSize: 17,
        lineHeight: 26,
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
        fontSize: 13,
        lineHeight: 18,
        fontFamily: 'Rubik-Regular',
        letterSpacing: 0,
    },
    // Labels
    label: {
        fontSize: 14,
        lineHeight: 20,
        fontFamily: 'Rubik-Medium',
        letterSpacing: 0.1,
    },
    labelSmall: {
        fontSize: 12,
        lineHeight: 16,
        fontFamily: 'Rubik-Medium',
        letterSpacing: 0.2,
    },
    // Captions
    caption: {
        fontSize: 12,
        lineHeight: 16,
        fontFamily: 'Rubik-Regular',
        letterSpacing: 0.1,
    },
    captionSmall: {
        fontSize: 10,
        lineHeight: 14,
        fontFamily: 'Rubik-Medium',
        letterSpacing: 0.3,
    },
    // Special - Money displays
    money: {
        fontSize: 40,
        lineHeight: 48,
        fontFamily: 'Rubik-Bold',
        letterSpacing: -1,
    },
    moneyMedium: {
        fontSize: 28,
        lineHeight: 34,
        fontFamily: 'Rubik-SemiBold',
        letterSpacing: -0.5,
    },
    moneySmall: {
        fontSize: 20,
        lineHeight: 26,
        fontFamily: 'Rubik-SemiBold',
        letterSpacing: -0.3,
    },
    // Buttons
    button: {
        fontSize: 15,
        lineHeight: 20,
        fontFamily: 'Rubik-SemiBold',
        letterSpacing: 0.2,
    },
    buttonSmall: {
        fontSize: 13,
        lineHeight: 18,
        fontFamily: 'Rubik-Medium',
        letterSpacing: 0.2,
    },
};

// ============================================
// SPACING - 4px base grid
// ============================================

export const SPACING = {
    xxs: 2,
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
    '8xl': 80,
};

// ============================================
// BORDER RADIUS - Softer, more modern
// ============================================

export const RADIUS = {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    '2xl': 24,
    '3xl': 28,
    '4xl': 32,
    full: 9999,
};

// ============================================
// SHADOWS - Layered depth system
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
        shadowOpacity: 0.04,
        shadowRadius: 2,
        elevation: 1,
    },
    sm: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 4,
        elevation: 2,
    },
    md: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 4,
    },
    lg: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 8,
    },
    xl: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.12,
        shadowRadius: 32,
        elevation: 12,
    },
    // Colored shadows for cards
    primary: {
        shadowColor: '#6366F1',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.25,
        shadowRadius: 20,
        elevation: 8,
    },
    success: {
        shadowColor: '#10B981',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
        elevation: 4,
    },
};

// ============================================
// LAYOUT CONSTANTS
// ============================================

export const LAYOUT = {
    screenPadding: 20,
    screenPaddingLarge: 24,
    cardPadding: 16,
    cardPaddingLarge: 20,
    inputHeight: 52,
    inputHeightSmall: 44,
    buttonHeight: 52,
    buttonHeightSmall: 44,
    buttonHeightLarge: 56,
    tabBarHeight: 84,
    headerHeight: 56,
    iconSizeSmall: 18,
    iconSize: 22,
    iconSizeLarge: 28,
};

// ============================================
// ANIMATION PRESETS
// ============================================

export const ANIMATION = {
    fast: 150,
    normal: 250,
    slow: 400,
    spring: {
        damping: 15,
        stiffness: 150,
    },
};
