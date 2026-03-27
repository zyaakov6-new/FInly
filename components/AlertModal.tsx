import React, { useEffect, useRef } from 'react';
import {
    Modal,
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Animated,
    useColorScheme,
} from 'react-native';
import {
    AlertCircle,
    AlertTriangle,
    CheckCircle,
    Info,
    Trash2,
    LogOut,
    HelpCircle,
} from 'lucide-react-native';
import { getColors, FONTS, SPACING, RADIUS, SHADOWS, TYPOGRAPHY, LAYOUT } from '../constants/theme';

export type AlertType = 'success' | 'error' | 'warning' | 'info' | 'confirm' | 'delete' | 'logout';

export interface AlertButton {
    text: string;
    style?: 'default' | 'cancel' | 'destructive';
    onPress?: () => void;
}

interface AlertModalProps {
    visible: boolean;
    type?: AlertType;
    title: string;
    message: string;
    buttons?: AlertButton[];
    onDismiss: () => void;
}

export const AlertModal: React.FC<AlertModalProps> = ({
    visible,
    type = 'info',
    title,
    message,
    buttons = [{ text: 'אישור', style: 'default' }],
    onDismiss,
}) => {
    const colorScheme = useColorScheme();
    const colors = getColors(colorScheme);

    const scaleAnim = useRef(new Animated.Value(0.9)).current;
    const opacityAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (visible) {
            scaleAnim.setValue(0.9);
            opacityAnim.setValue(0);

            Animated.parallel([
                Animated.spring(scaleAnim, {
                    toValue: 1,
                    damping: 20,
                    stiffness: 300,
                    useNativeDriver: true,
                }),
                Animated.timing(opacityAnim, {
                    toValue: 1,
                    duration: 200,
                    useNativeDriver: true,
                }),
            ]).start();
        }
    }, [visible]);

    const handleButtonPress = (button: AlertButton) => {
        if (button.onPress) {
            button.onPress();
        }
        onDismiss();
    };

    const getIcon = () => {
        const iconSize = 28;
        const strokeWidth = 2;

        switch (type) {
            case 'success':
                return <CheckCircle size={iconSize} color={colors.success} strokeWidth={strokeWidth} />;
            case 'error':
                return <AlertCircle size={iconSize} color={colors.danger} strokeWidth={strokeWidth} />;
            case 'warning':
                return <AlertTriangle size={iconSize} color={colors.warning} strokeWidth={strokeWidth} />;
            case 'delete':
                return <Trash2 size={iconSize} color={colors.danger} strokeWidth={strokeWidth} />;
            case 'logout':
                return <LogOut size={iconSize} color={colors.warning} strokeWidth={strokeWidth} />;
            case 'confirm':
                return <HelpCircle size={iconSize} color={colors.primary} strokeWidth={strokeWidth} />;
            case 'info':
            default:
                return <Info size={iconSize} color={colors.primary} strokeWidth={strokeWidth} />;
        }
    };

    const getIconBackground = () => {
        switch (type) {
            case 'success':
                return colors.successMuted;
            case 'error':
            case 'delete':
                return colors.dangerMuted;
            case 'warning':
            case 'logout':
                return colors.warningMuted;
            case 'confirm':
            case 'info':
            default:
                return colors.primaryMuted;
        }
    };

    const getButtonStyle = (button: AlertButton, index: number) => {
        const isLast = index === buttons.length - 1;
        const baseStyle = [styles.button];

        if (button.style === 'destructive') {
            return [
                ...baseStyle,
                { backgroundColor: colors.danger },
                isLast && buttons.length > 1 && { marginLeft: SPACING.sm },
            ];
        }

        if (button.style === 'cancel') {
            return [
                ...baseStyle,
                { backgroundColor: colors.surfaceSecondary, borderWidth: 1, borderColor: colors.border },
                isLast && buttons.length > 1 && { marginLeft: SPACING.sm },
            ];
        }

        return [
            ...baseStyle,
            { backgroundColor: colors.primary },
            isLast && buttons.length > 1 && { marginLeft: SPACING.sm },
        ];
    };

    const getButtonTextStyle = (button: AlertButton) => {
        if (button.style === 'cancel') {
            return [styles.buttonText, { color: colors.textPrimary }];
        }
        return [styles.buttonText, { color: '#FFFFFF' }];
    };

    if (!visible) return null;

    return (
        <Modal
            transparent
            visible={visible}
            animationType="none"
            onRequestClose={onDismiss}
            statusBarTranslucent
        >
            <View style={[styles.overlay, { backgroundColor: colors.overlay }]}>
                <Animated.View
                    style={[
                        styles.container,
                        { backgroundColor: colors.surface },
                        SHADOWS.xl,
                        {
                            transform: [{ scale: scaleAnim }],
                            opacity: opacityAnim,
                        },
                    ]}
                >
                    <View style={[styles.iconContainer, { backgroundColor: getIconBackground() }]}>
                        {getIcon()}
                    </View>

                    <Text style={[styles.title, { color: colors.textPrimary }]}>{title}</Text>
                    <Text style={[styles.message, { color: colors.textSecondary }]}>{message}</Text>

                    <View style={styles.buttonContainer}>
                        {buttons.map((button, index) => (
                            <TouchableOpacity
                                key={index}
                                style={getButtonStyle(button, index)}
                                onPress={() => handleButtonPress(button)}
                                activeOpacity={0.8}
                            >
                                <Text style={getButtonTextStyle(button)}>{button.text}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </Animated.View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: SPACING['2xl'],
    },
    container: {
        width: '100%',
        maxWidth: 320,
        borderRadius: RADIUS.xl,
        padding: SPACING['2xl'],
        alignItems: 'center',
    },
    iconContainer: {
        width: 56,
        height: 56,
        borderRadius: RADIUS.full,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: SPACING.lg,
    },
    title: {
        ...TYPOGRAPHY.h4,
        marginBottom: SPACING.sm,
        textAlign: 'center',
    },
    message: {
        ...TYPOGRAPHY.body,
        textAlign: 'center',
        marginBottom: SPACING['2xl'],
        lineHeight: 22,
    },
    buttonContainer: {
        flexDirection: 'row',
        width: '100%',
    },
    button: {
        flex: 1,
        height: 48,
        borderRadius: RADIUS.md,
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonText: {
        ...TYPOGRAPHY.label,
    },
});
