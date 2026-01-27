import React from 'react';
import { View, Text, StyleSheet, useColorScheme } from 'react-native';
import { Inbox, Receipt, FileText, Users, Calendar } from 'lucide-react-native';
import { getColors, SPACING, RADIUS, TYPOGRAPHY } from '../constants/theme';

interface EmptyStateProps {
    icon?: 'inbox' | 'receipt' | 'file' | 'users' | 'calendar';
    title: string;
    message: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ icon = 'inbox', title, message }) => {
    const colorScheme = useColorScheme();
    const colors = getColors(colorScheme);

    const getIcon = () => {
        const iconProps = { size: 48, color: colors.textQuaternary, strokeWidth: 1.5 };
        switch (icon) {
            case 'receipt': return <Receipt {...iconProps} />;
            case 'file': return <FileText {...iconProps} />;
            case 'users': return <Users {...iconProps} />;
            case 'calendar': return <Calendar {...iconProps} />;
            default: return <Inbox {...iconProps} />;
        }
    };

    return (
        <View style={styles.container}>
            <View style={[styles.iconContainer, { backgroundColor: colors.surfaceSecondary }]}>
                {getIcon()}
            </View>
            <Text style={[styles.title, { color: colors.textPrimary }]}>{title}</Text>
            <Text style={[styles.message, { color: colors.textTertiary }]}>{message}</Text>
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
    iconContainer: {
        width: 80,
        height: 80,
        borderRadius: RADIUS.full,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: SPACING.xl,
    },
    title: {
        ...TYPOGRAPHY.h4,
        marginBottom: SPACING.sm,
        textAlign: 'center',
    },
    message: {
        ...TYPOGRAPHY.body,
        textAlign: 'center',
        lineHeight: 22,
    },
});
