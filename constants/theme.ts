export const COLORS = {
    light: {
        // Brand
        primary: '#FD7979',
        secondary: '#FDACAC',
        accent: '#FFCDC9',

        // Status
        danger: '#ef4444',
        success: '#10b981',
        warning: '#f59e0b',
        info: '#3b82f6',

        // Backgrounds
        background: '#FEEAC9',
        surface: '#FFF9F0',
        surfaceLight: '#FFF5E6',
        card: '#FFFFFF',

        // Text
        textPrimary: '#000000',
        textSecondary: '#444444',
        textTertiary: '#666666',
        textOnDark: '#FFFFFF',

        // UI
        border: '#E6D5C4',
        divider: 'rgba(0,0,0,0.05)',
        white: '#ffffff',
        black: '#000000',
        transparent: 'transparent',
    },
    dark: {
        // Brand
        primary: '#FD7979',
        secondary: '#FDACAC',
        accent: '#FFCDC9',

        // Status
        danger: '#ff6b6b',
        success: '#00ff88',
        warning: '#ff9a4a',
        info: '#4a9eff',

        // Backgrounds
        background: '#0a0a0f',
        surface: '#12121e',
        surfaceLight: '#151520',
        card: '#1c1c2b',

        // Text
        textPrimary: '#FFFFFF',
        textSecondary: '#AAAAAA',
        textTertiary: '#666666',
        textOnDark: '#FFFFFF',

        // UI
        border: 'rgba(255,255,255,0.05)',
        divider: 'rgba(255,255,255,0.1)',
        white: '#ffffff',
        black: '#000000',
        transparent: 'transparent',
    }
};

export const getColors = (scheme: 'light' | 'dark' | null | undefined) => {
    return COLORS[scheme === 'dark' ? 'dark' : 'light'];
};

export const SPACING = {
    micro: 4,
    small: 8,
    medium: 16,
    large: 24,
    xlarge: 32,
    xxlarge: 48,
};

export const FONTS = {
    bold: 'Rubik-Bold',
    semiBold: 'Rubik-SemiBold',
    medium: 'Rubik-Medium',
    regular: 'Rubik-Regular',
};
