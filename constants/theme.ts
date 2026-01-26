// Premium Theme System for Finly
// Beautiful, modern design with glass morphism and premium gradients

export const COLORS = {
    light: {
        // Brand - Vibrant & Premium
        primary: '#FF6B6B',
        primaryDark: '#E85555',
        primaryLight: '#FF8585',
        secondary: '#4ECDC4',
        secondaryDark: '#3DB8B0',
        accent: '#FFE66D',
        accentDark: '#F5D93A',

        // Status - Clear & Vibrant
        danger: '#FF5252',
        dangerLight: 'rgba(255, 82, 82, 0.15)',
        success: '#00D68F',
        successLight: 'rgba(0, 214, 143, 0.15)',
        warning: '#FFAA00',
        warningLight: 'rgba(255, 170, 0, 0.15)',
        info: '#0095FF',
        infoLight: 'rgba(0, 149, 255, 0.15)',

        // Backgrounds - Warm & Inviting
        background: '#FFF8F0',
        surface: '#FFFFFF',
        surfaceLight: '#FFFBF7',
        surfaceElevated: '#FFFFFF',
        card: '#FFFFFF',

        // Text - High Contrast
        textPrimary: '#1A1A2E',
        textSecondary: '#4A4A6A',
        textTertiary: '#8B8BA8',
        textOnDark: '#FFFFFF',
        textOnPrimary: '#FFFFFF',

        // UI Elements
        border: '#F0E6DD',
        borderLight: '#F5EDE5',
        divider: 'rgba(26, 26, 46, 0.06)',
        overlay: 'rgba(26, 26, 46, 0.4)',
        white: '#FFFFFF',
        black: '#000000',
        transparent: 'transparent',

        // Gradients
        gradientPrimary: ['#FF6B6B', '#FF8E53'],
        gradientSecondary: ['#4ECDC4', '#44B3AA'],
        gradientSuccess: ['#00D68F', '#00B377'],
        gradientDark: ['#1A1A2E', '#2D2D44'],
        gradientCard: ['#FFFFFF', '#FFF8F0'],
        gradientGlass: ['rgba(255,255,255,0.9)', 'rgba(255,255,255,0.7)'],

        // Shadows
        shadowColor: '#1A1A2E',
        shadowLight: 'rgba(26, 26, 46, 0.08)',
        shadowMedium: 'rgba(26, 26, 46, 0.12)',
        shadowHeavy: 'rgba(26, 26, 46, 0.2)',

        // Glass Effect
        glass: 'rgba(255, 255, 255, 0.85)',
        glassBorder: 'rgba(255, 255, 255, 0.3)',
        glassHighlight: 'rgba(255, 255, 255, 0.5)',
    },
    dark: {
        // Brand - Neon & Vibrant
        primary: '#FF6B6B',
        primaryDark: '#E85555',
        primaryLight: '#FF8585',
        secondary: '#4ECDC4',
        secondaryDark: '#3DB8B0',
        accent: '#FFE66D',
        accentDark: '#F5D93A',

        // Status - Neon Vibrance
        danger: '#FF6B6B',
        dangerLight: 'rgba(255, 107, 107, 0.15)',
        success: '#00FF94',
        successLight: 'rgba(0, 255, 148, 0.15)',
        warning: '#FFB800',
        warningLight: 'rgba(255, 184, 0, 0.15)',
        info: '#00D4FF',
        infoLight: 'rgba(0, 212, 255, 0.15)',

        // Backgrounds - Deep & Rich
        background: '#0D0D14',
        surface: '#16161F',
        surfaceLight: '#1C1C28',
        surfaceElevated: '#22222F',
        card: '#1C1C28',

        // Text - Clear Hierarchy
        textPrimary: '#FFFFFF',
        textSecondary: '#A0A0B8',
        textTertiary: '#6B6B80',
        textOnDark: '#FFFFFF',
        textOnPrimary: '#FFFFFF',

        // UI Elements
        border: 'rgba(255, 255, 255, 0.08)',
        borderLight: 'rgba(255, 255, 255, 0.04)',
        divider: 'rgba(255, 255, 255, 0.06)',
        overlay: 'rgba(0, 0, 0, 0.6)',
        white: '#FFFFFF',
        black: '#000000',
        transparent: 'transparent',

        // Gradients - Vibrant & Dynamic
        gradientPrimary: ['#FF6B6B', '#FF8E53'],
        gradientSecondary: ['#4ECDC4', '#00D4FF'],
        gradientSuccess: ['#00FF94', '#00D68F'],
        gradientDark: ['#1C1C28', '#0D0D14'],
        gradientCard: ['#1C1C28', '#16161F'],
        gradientGlass: ['rgba(28, 28, 40, 0.9)', 'rgba(22, 22, 31, 0.8)'],

        // Shadows
        shadowColor: '#000000',
        shadowLight: 'rgba(0, 0, 0, 0.3)',
        shadowMedium: 'rgba(0, 0, 0, 0.5)',
        shadowHeavy: 'rgba(0, 0, 0, 0.7)',

        // Glass Effect - Frosted Dark
        glass: 'rgba(28, 28, 40, 0.75)',
        glassBorder: 'rgba(255, 255, 255, 0.08)',
        glassHighlight: 'rgba(255, 255, 255, 0.05)',
    }
};

export const getColors = (scheme: 'light' | 'dark' | null | undefined) => {
    return COLORS[scheme === 'light' ? 'light' : 'dark'];
};

export const SPACING = {
    micro: 4,
    tiny: 6,
    small: 8,
    medium: 16,
    large: 24,
    xlarge: 32,
    xxlarge: 48,
    xxxlarge: 64,
};

export const FONTS = {
    bold: 'Rubik-Bold',
    semiBold: 'Rubik-SemiBold',
    medium: 'Rubik-Medium',
    regular: 'Rubik-Regular',
};

export const FONT_SIZES = {
    tiny: 10,
    small: 12,
    body: 14,
    medium: 16,
    large: 18,
    xlarge: 20,
    xxlarge: 24,
    display: 32,
    hero: 40,
    giant: 48,
};

export const BORDER_RADIUS = {
    small: 8,
    medium: 12,
    large: 16,
    xlarge: 20,
    xxlarge: 24,
    full: 9999,
};

export const SHADOWS = {
    small: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 2,
    },
    medium: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 8,
        elevation: 4,
    },
    large: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.16,
        shadowRadius: 16,
        elevation: 8,
    },
    xlarge: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.2,
        shadowRadius: 24,
        elevation: 12,
    },
    glow: (color: string) => ({
        shadowColor: color,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
        elevation: 8,
    }),
    inner: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 0,
    },
};

// Animation presets
export const ANIMATIONS = {
    spring: {
        tension: 60,
        friction: 10,
    },
    springBouncy: {
        tension: 80,
        friction: 8,
    },
    springGentle: {
        tension: 40,
        friction: 12,
    },
    timing: {
        fast: 150,
        normal: 250,
        slow: 400,
    },
};

// Common gradients for LinearGradient
export const GRADIENTS = {
    primary: ['#FF6B6B', '#FF8E53'] as const,
    secondary: ['#4ECDC4', '#00D4FF'] as const,
    success: ['#00FF94', '#00D68F'] as const,
    warning: ['#FFB800', '#FF8E53'] as const,
    danger: ['#FF6B6B', '#FF5252'] as const,
    dark: ['#1C1C28', '#0D0D14'] as const,
    darkReverse: ['#0D0D14', '#1C1C28'] as const,
    accent: ['#FFE66D', '#FF8E53'] as const,
    premium: ['#667EEA', '#764BA2'] as const,
    ocean: ['#2193B0', '#6DD5ED'] as const,
    sunset: ['#F56217', '#F9A825'] as const,
    forest: ['#134E5E', '#71B280'] as const,
    midnight: ['#232526', '#414345'] as const,
    coral: ['#FF6B6B', '#FFCDC9'] as const,
    teal: ['#4ECDC4', '#44B3AA'] as const,
};
