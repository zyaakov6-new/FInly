import React, { useEffect, useRef } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, Animated, useColorScheme } from 'react-native';
import { CheckCircle } from 'lucide-react-native';
import { getColors, SPACING, RADIUS, SHADOWS, TYPOGRAPHY, LAYOUT } from '../constants/theme';

interface SuccessModalProps {
    visible: boolean;
    title: string;
    description: string;
    onClose: () => void;
    buttonText?: string;
}

export const SuccessModal = ({ visible, title, description, onClose, buttonText = "סיום" }: SuccessModalProps) => {
    const colorScheme = useColorScheme();
    const colors = getColors(colorScheme);

    const scaleAnim = useRef(new Animated.Value(0.9)).current;
    const opacityAnim = useRef(new Animated.Value(0)).current;
    const checkAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (visible) {
            scaleAnim.setValue(0.9);
            opacityAnim.setValue(0);
            checkAnim.setValue(0);

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

            setTimeout(() => {
                Animated.spring(checkAnim, {
                    toValue: 1,
                    damping: 15,
                    stiffness: 200,
                    useNativeDriver: true,
                }).start();
            }, 150);
        }
    }, [visible]);

    if (!visible) return null;

    return (
        <Modal transparent visible={visible} animationType="none" onRequestClose={onClose} statusBarTranslucent>
            <View style={[styles.overlay, { backgroundColor: colors.overlay }]}>
                <Animated.View style={[
                    styles.container,
                    { backgroundColor: colors.surface },
                    SHADOWS.xl,
                    {
                        transform: [{ scale: scaleAnim }],
                        opacity: opacityAnim,
                    }
                ]}>
                    <Animated.View style={[
                        styles.iconContainer,
                        { backgroundColor: colors.successMuted },
                        { transform: [{ scale: checkAnim }] }
                    ]}>
                        <CheckCircle size={40} color={colors.success} strokeWidth={2} />
                    </Animated.View>

                    <Text style={[styles.title, { color: colors.textPrimary }]}>{title}</Text>
                    <Text style={[styles.description, { color: colors.textTertiary }]}>{description}</Text>

                    <TouchableOpacity
                        style={[styles.button, { backgroundColor: colors.primary }]}
                        onPress={onClose}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.buttonText}>{buttonText}</Text>
                    </TouchableOpacity>
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
        width: 72,
        height: 72,
        borderRadius: RADIUS.full,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: SPACING.xl,
    },
    title: {
        ...TYPOGRAPHY.h3,
        marginBottom: SPACING.sm,
        textAlign: 'center',
    },
    description: {
        ...TYPOGRAPHY.body,
        textAlign: 'center',
        marginBottom: SPACING['2xl'],
        lineHeight: 22,
    },
    button: {
        width: '100%',
        height: LAYOUT.buttonHeight,
        borderRadius: RADIUS.md,
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonText: {
        ...TYPOGRAPHY.h4,
        color: '#FFFFFF',
    },
});
