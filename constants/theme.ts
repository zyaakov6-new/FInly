// Clean, Apple-inspired Design System for Finly
// Minimalist, professional, and elegant

export const COLORS = {
    light: {
        // Primary - Clean Blue (Apple-like)
        primary: '#007AFF',
        primaryLight: '#4DA3FF',
        primaryMuted: 'rgba(0, 122, 255, 0.1)',

        // Semantic Colors
        success: '#34C759',
        successMuted: 'rgba(52, 199, 89, 0.1)',
        warning: '#FF9500',
        warningMuted: 'rgba(255, 149, 0, 0.1)',
        danger: '#FF3B30',
        dangerMuted: 'rgba(255, 59, 48, 0.1)',

        // Backgrounds
        background: '#F2F2F7',
        surface: '#FFFFFF',
        surfaceSecondary: '#F9F9F9',
        elevated: '#FFFFFF',

        // Text
        textPrimary: '#000000',
        textSecondary: '#3C3C43',
        textTertiary: '#8E8E93',
        textQuaternary: '#C7C7CC',

        // UI Elements
        border: 'rgba(60, 60, 67, 0.1)',
        separator: 'rgba(60, 60, 67, 0.12)',
        fill: 'rgba(120, 120, 128, 0.2)',
        overlay: 'rgba(0, 0, 0, 0.4)',

        // System
        white: '#FFFFFF',
        black: '#000000',
        clear: 'transparent',

        // Tints
        tintBlue: '#007AFF',
        tintGreen: '#34C759',
        tintOrange: '#FF9500',
        tintRed: '#FF3B30',
        tintPurple: '#AF52DE',
        tintPink: '#FF2D55',
        tintTeal: '#5AC8FA',
    },
    dark: {
        // Primary
        primary: '#0A84FF',
        primaryLight: '#409CFF',
        primaryMuted: 'rgba(10, 132, 255, 0.15)',

        // Semantic Colors
        success: '#30D158',
        successMuted: 'rgba(48, 209, 88, 0.15)',
        warning: '#FF9F0A',
        warningMuted: 'rgba(255, 159, 10, 0.15)',
        danger: '#FF453A',
        dangerMuted: 'rgba(255, 69, 58, 0.15)',

        // Backgrounds
        background: '#000000',
        surface: '#1C1C1E',
        surfaceSecondary: '#2C2C2E',
        elevated: '#2C2C2E',

        // Text
        textPrimary: '#FFFFFF',
        textSecondary: '#EBEBF5',
        textTertiary: '#8E8E93',
        textQuaternary: '#636366',

        // UI Elements
        border: 'rgba(84, 84, 88, 0.65)',
        separator: 'rgba(84, 84, 88, 0.6)',
        fill: 'rgba(120, 120, 128, 0.32)',
        overlay: 'rgba(0, 0, 0, 0.6)',

        // System
        white: '#FFFFFF',
        black: '#000000',
        clear: 'transparent',

        // Tints
        tintBlue: '#0A84FF',
        tintGreen: '#30D158',
        tintOrange: '#FF9F0A',
        tintRed: '#FF453A',
        tintPurple: '#BF5AF2',
        tintPink: '#FF375F',
        tintTeal: '#64D2FF',
    }
};

export const getColors = (scheme: 'light' | 'dark' | null | undefined) => {
    return COLORS[scheme === 'light' ? 'light' : 'dark'];
};

// Apple-like spacing scale
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
};

// SF Pro-inspired typography
export const FONTS = {
    bold: 'Rubik-Bold',
    semiBold: 'Rubik-SemiBold',
    medium: 'Rubik-Medium',
    regular: 'Rubik-Regular',
};

// Typography scale (Apple HIG inspired)
export const TYPOGRAPHY = {
    largeTitle: {
        fontSize: 34,
        lineHeight: 41,
        fontFamily: 'Rubik-Bold',
        letterSpacing: 0.37,
    },
    title1: {
        fontSize: 28,
        lineHeight: 34,
        fontFamily: 'Rubik-Bold',
        letterSpacing: 0.36,
    },
    title2: {
        fontSize: 22,
        lineHeight: 28,
        fontFamily: 'Rubik-Bold',
        letterSpacing: 0.35,
    },
    title3: {
        fontSize: 20,
        lineHeight: 25,
        fontFamily: 'Rubik-SemiBold',
        letterSpacing: 0.38,
    },
    headline: {
        fontSize: 17,
        lineHeight: 22,
        fontFamily: 'Rubik-SemiBold',
        letterSpacing: -0.41,
    },
    body: {
        fontSize: 17,
        lineHeight: 22,
        fontFamily: 'Rubik-Regular',
        letterSpacing: -0.41,
    },
    callout: {
        fontSize: 16,
        lineHeight: 21,
        fontFamily: 'Rubik-Regular',
        letterSpacing: -0.32,
    },
    subhead: {
        fontSize: 15,
        lineHeight: 20,
        fontFamily: 'Rubik-Regular',
        letterSpacing: -0.24,
    },
    footnote: {
        fontSize: 13,
        lineHeight: 18,
        fontFamily: 'Rubik-Regular',
        letterSpacing: -0.08,
    },
    caption1: {
        fontSize: 12,
        lineHeight: 16,
        fontFamily: 'Rubik-Regular',
        letterSpacing: 0,
    },
    caption2: {
        fontSize: 11,
        lineHeight: 13,
        fontFamily: 'Rubik-Regular',
        letterSpacing: 0.07,
    },
};

// Clean border radius
export const RADIUS = {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    '2xl': 24,
    full: 9999,
};

// Subtle, elegant shadows
export const SHADOWS = {
    sm: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 3,
        elevation: 1,
    },
    md: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 6,
        elevation: 2,
    },
    lg: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 4,
    },
    xl: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.1,
        shadowRadius: 24,
        elevation: 8,
    },
};

// Animation timing (Apple-like spring)
export const ANIMATION = {
    spring: {
        damping: 20,
        stiffness: 300,
    },
    springGentle: {
        damping: 25,
        stiffness: 200,
    },
    duration: {
        fast: 200,
        normal: 300,
        slow: 450,
    },
};
