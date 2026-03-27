import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity, useColorScheme } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CheckCircle, AlertCircle, AlertTriangle, Info, X } from 'lucide-react-native';
import { getColors, FONTS, SPACING, RADIUS, SHADOWS, TYPOGRAPHY } from '../constants/theme';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastProps {
    visible: boolean;
    type: ToastType;
    title: string;
    message?: string;
    duration?: number;
    onDismiss: () => void;
    position?: 'top' | 'bottom';
}

export const Toast: React.FC<ToastProps> = ({
    visible,
    type,
    title,
    message,
    duration = 3000,
    onDismiss,
    position = 'top',
}) => {
    const insets = useSafeAreaInsets();
    const colorScheme = useColorScheme();
    const colors = getColors(colorScheme);

    const translateY = useRef(new Animated.Value(position === 'top' ? -100 : 100)).current;
    const opacity = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (visible) {
            Animated.parallel([
                Animated.spring(translateY, {
                    toValue: 0,
                    damping: 20,
                    stiffness: 300,
                    useNativeDriver: true,
                }),
                Animated.timing(opacity, {
                    toValue: 1,
                    duration: 200,
                    useNativeDriver: true,
                }),
            ]).start();

            const timer = setTimeout(() => {
                handleDismiss();
            }, duration);

            return () => clearTimeout(timer);
        }
    }, [visible]);

    const handleDismiss = () => {
        Animated.parallel([
            Animated.timing(translateY, {
                toValue: position === 'top' ? -100 : 100,
                duration: 200,
                useNativeDriver: true,
            }),
            Animated.timing(opacity, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
            }),
        ]).start(() => onDismiss());
    };

    const getTypeStyles = () => {
        switch (type) {
            case 'success':
                return {
                    icon: <CheckCircle size={20} color={colors.success} strokeWidth={2} />,
                    backgroundColor: colors.successMuted,
                    borderColor: colors.success,
                    iconBg: colors.successMuted,
                };
            case 'error':
                return {
                    icon: <AlertCircle size={20} color={colors.danger} strokeWidth={2} />,
                    backgroundColor: colors.dangerMuted,
                    borderColor: colors.danger,
                    iconBg: colors.dangerMuted,
                };
            case 'warning':
                return {
                    icon: <AlertTriangle size={20} color={colors.warning} strokeWidth={2} />,
                    backgroundColor: colors.warningMuted,
                    borderColor: colors.warning,
                    iconBg: colors.warningMuted,
                };
            case 'info':
            default:
                return {
                    icon: <Info size={20} color={colors.primary} strokeWidth={2} />,
                    backgroundColor: colors.primaryMuted,
                    borderColor: colors.primary,
                    iconBg: colors.primaryMuted,
                };
        }
    };

    if (!visible) return null;

    const typeStyles = getTypeStyles();

    return (
        <Animated.View
            style={[
                styles.container,
                {
                    [position]: position === 'top' ? insets.top + SPACING.md : insets.bottom + SPACING.md,
                    transform: [{ translateY }],
                    opacity,
                },
            ]}
        >
            <View
                style={[
                    styles.toast,
                    {
                        backgroundColor: colors.surface,
                        borderLeftColor: typeStyles.borderColor,
                    },
                    SHADOWS.lg,
                ]}
            >
                <View style={[styles.iconContainer, { backgroundColor: typeStyles.iconBg }]}>
                    {typeStyles.icon}
                </View>

                <View style={styles.content}>
                    <Text style={[styles.title, { color: colors.textPrimary }]}>{title}</Text>
                    {message && (
                        <Text style={[styles.message, { color: colors.textSecondary }]} numberOfLines={2}>
                            {message}
                        </Text>
                    )}
                </View>

                <TouchableOpacity
                    onPress={handleDismiss}
                    style={styles.closeButton}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                    <X size={18} color={colors.textTertiary} />
                </TouchableOpacity>
            </View>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        left: SPACING.lg,
        right: SPACING.lg,
        zIndex: 9999,
    },
    toast: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: SPACING.md,
        borderRadius: RADIUS.lg,
        borderLeftWidth: 4,
    },
    iconContainer: {
        width: 36,
        height: 36,
        borderRadius: RADIUS.sm,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: SPACING.md,
    },
    content: {
        flex: 1,
    },
    title: {
        ...TYPOGRAPHY.label,
    },
    message: {
        ...TYPOGRAPHY.caption,
        marginTop: 2,
    },
    closeButton: {
        padding: SPACING.xs,
        marginLeft: SPACING.sm,
    },
});
