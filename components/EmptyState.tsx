import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Inbox, Receipt, FileText, Users, Calendar, Plus, Search, TrendingUp, PieChart } from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';
import { getColors, FONTS, SPACING, RADIUS, TYPOGRAPHY, SHADOWS } from '../constants/theme';

interface EmptyStateProps {
    icon?: 'inbox' | 'receipt' | 'file' | 'users' | 'calendar' | 'search' | 'chart' | 'trending';
    title: string;
    message: string;
    actionLabel?: string;
    onAction?: () => void;
    compact?: boolean;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
    icon = 'inbox',
    title,
    message,
    actionLabel,
    onAction,
    compact = false
}) => {
    const { resolvedTheme } = useTheme();
    const colors = getColors(resolvedTheme);

    const getIcon = () => {
        const iconProps = { size: compact ? 32 : 48, color: colors.textQuaternary, strokeWidth: 1.5 };
        switch (icon) {
            case 'receipt': return <Receipt {...iconProps} />;
            case 'file': return <FileText {...iconProps} />;
            case 'users': return <Users {...iconProps} />;
            case 'calendar': return <Calendar {...iconProps} />;
            case 'search': return <Search {...iconProps} />;
            case 'chart': return <PieChart {...iconProps} />;
            case 'trending': return <TrendingUp {...iconProps} />;
            default: return <Inbox {...iconProps} />;
        }
    };

    return (
        <View style={[styles.container, compact && styles.containerCompact]}>
            <View style={[
                styles.iconContainer,
                { backgroundColor: colors.surfaceSecondary },
                compact && styles.iconContainerCompact
            ]}>
                {getIcon()}
            </View>
            <Text style={[
                styles.title,
                { color: colors.textPrimary },
                compact && styles.titleCompact
            ]}>
                {title}
            </Text>
            <Text style={[
                styles.message,
                { color: colors.textTertiary },
                compact && styles.messageCompact
            ]}>
                {message}
            </Text>
            {actionLabel && onAction && (
                <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: colors.primary }]}
                    onPress={onAction}
                    activeOpacity={0.8}
                >
                    <Plus size={18} color="#FFFFFF" />
                    <Text style={styles.actionButtonText}>{actionLabel}</Text>
                </TouchableOpacity>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: SPACING['4xl'],
    },
    containerCompact: {
        flex: 0,
        padding: SPACING.xl,
    },
    iconContainer: {
        width: 80,
        height: 80,
        borderRadius: RADIUS.full,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: SPACING.xl,
    },
    iconContainerCompact: {
        width: 56,
        height: 56,
        marginBottom: SPACING.md,
    },
    title: {
        ...TYPOGRAPHY.h4,
        marginBottom: SPACING.sm,
        textAlign: 'center',
    },
    titleCompact: {
        ...TYPOGRAPHY.label,
        marginBottom: SPACING.xs,
    },
    message: {
        ...TYPOGRAPHY.body,
        textAlign: 'center',
        lineHeight: 22,
    },
    messageCompact: {
        ...TYPOGRAPHY.bodySmall,
        lineHeight: 20,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: SPACING.xl,
        paddingVertical: SPACING.md,
        borderRadius: RADIUS.md,
        marginTop: SPACING.xl,
        gap: SPACING.sm,
    },
    actionButtonText: {
        color: '#FFFFFF',
        fontFamily: FONTS.semiBold,
        fontSize: 14,
    },
});
