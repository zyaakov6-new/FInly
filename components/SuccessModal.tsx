import React, { useEffect, useRef } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions, useColorScheme } from 'react-native';
import { CheckCircle, X, Sparkles } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { getColors, FONTS, SHADOWS, GRADIENTS } from '../constants/theme';

const { width, height } = Dimensions.get('window');

interface SuccessModalProps {
    visible: boolean;
    title: string;
    description: string;
    onClose: () => void;
    buttonText?: string;
}

export const SuccessModal = ({ visible, title, description, onClose, buttonText = "מעולה!" }: SuccessModalProps) => {
    const colorScheme = useColorScheme();
    const colors = getColors(colorScheme);

    const scaleValue = useRef(new Animated.Value(0.5)).current;
    const opacityValue = useRef(new Animated.Value(0)).current;
    const iconScale = useRef(new Animated.Value(0)).current;
    const iconRotate = useRef(new Animated.Value(0)).current;
    const confetti1 = useRef(new Animated.Value(0)).current;
    const confetti2 = useRef(new Animated.Value(0)).current;
    const confetti3 = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (visible) {
            // Reset values
            scaleValue.setValue(0.5);
            opacityValue.setValue(0);
            iconScale.setValue(0);
            iconRotate.setValue(0);
            confetti1.setValue(0);
            confetti2.setValue(0);
            confetti3.setValue(0);

            // Start animations
            Animated.parallel([
                Animated.spring(scaleValue, {
                    toValue: 1,
                    friction: 6,
                    tension: 60,
                    useNativeDriver: true,
                }),
                Animated.timing(opacityValue, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                }),
            ]).start();

            // Icon animation with delay
            setTimeout(() => {
                Animated.parallel([
                    Animated.spring(iconScale, {
                        toValue: 1,
                        friction: 5,
                        tension: 80,
                        useNativeDriver: true,
                    }),
                    Animated.timing(iconRotate, {
                        toValue: 1,
                        duration: 600,
                        useNativeDriver: true,
                    }),
                ]).start();
            }, 200);

            // Confetti animation
            const animateConfetti = (anim: Animated.Value, delay: number) => {
                setTimeout(() => {
                    Animated.sequence([
                        Animated.timing(anim, {
                            toValue: 1,
                            duration: 400,
                            useNativeDriver: true,
                        }),
                        Animated.timing(anim, {
                            toValue: 0,
                            duration: 400,
                            useNativeDriver: true,
                        }),
                    ]).start();
                }, delay);
            };

            animateConfetti(confetti1, 300);
            animateConfetti(confetti2, 400);
            animateConfetti(confetti3, 500);
        }
    }, [visible]);

    if (!visible) return null;

    const spinInterpolate = iconRotate.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
    });

    return (
        <Modal transparent visible={visible} animationType="none" onRequestClose={onClose} statusBarTranslucent>
            <View style={styles.overlay}>
                <Animated.View style={[
                    styles.container,
                    {
                        backgroundColor: colors.surface,
                        borderColor: colors.border,
                        transform: [{ scale: scaleValue }],
                        opacity: opacityValue,
                        ...SHADOWS.xlarge,
                    }
                ]}>
                    {/* Decorative particles */}
                    <Animated.View style={[
                        styles.confetti,
                        styles.confetti1,
                        {
                            opacity: confetti1,
                            transform: [
                                { translateY: confetti1.interpolate({ inputRange: [0, 1], outputRange: [0, -30] }) },
                                { scale: confetti1 },
                            ],
                        }
                    ]}>
                        <Sparkles size={20} color={colors.warning} />
                    </Animated.View>

                    <Animated.View style={[
                        styles.confetti,
                        styles.confetti2,
                        {
                            opacity: confetti2,
                            transform: [
                                { translateY: confetti2.interpolate({ inputRange: [0, 1], outputRange: [0, -25] }) },
                                { translateX: confetti2.interpolate({ inputRange: [0, 1], outputRange: [0, 15] }) },
                                { scale: confetti2 },
                            ],
                        }
                    ]}>
                        <Sparkles size={16} color={colors.info} />
                    </Animated.View>

                    <Animated.View style={[
                        styles.confetti,
                        styles.confetti3,
                        {
                            opacity: confetti3,
                            transform: [
                                { translateY: confetti3.interpolate({ inputRange: [0, 1], outputRange: [0, -20] }) },
                                { translateX: confetti3.interpolate({ inputRange: [0, 1], outputRange: [0, -15] }) },
                                { scale: confetti3 },
                            ],
                        }
                    ]}>
                        <Sparkles size={14} color={colors.secondary} />
                    </Animated.View>

                    {/* Success Icon */}
                    <Animated.View style={[
                        styles.iconContainer,
                        {
                            transform: [
                                { scale: iconScale },
                                { rotate: spinInterpolate },
                            ],
                        }
                    ]}>
                        <LinearGradient
                            colors={GRADIENTS.success}
                            style={styles.iconGradient}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                        >
                            <CheckCircle size={44} color="#fff" strokeWidth={2.5} />
                        </LinearGradient>
                    </Animated.View>

                    <Text style={[styles.title, { color: colors.textPrimary }]}>{title}</Text>
                    <Text style={[styles.description, { color: colors.textSecondary }]}>{description}</Text>

                    <TouchableOpacity style={styles.button} onPress={onClose} activeOpacity={0.9}>
                        <LinearGradient
                            colors={GRADIENTS.primary}
                            style={styles.buttonGradient}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                        >
                            <Text style={styles.buttonText}>{buttonText}</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </Animated.View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.7)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    container: {
        width: width * 0.85,
        borderRadius: 32,
        padding: 32,
        alignItems: 'center',
        borderWidth: 1,
        position: 'relative',
        overflow: 'visible',
    },
    confetti: {
        position: 'absolute',
    },
    confetti1: {
        top: -10,
        left: '50%',
        marginLeft: -10,
    },
    confetti2: {
        top: 20,
        right: 30,
    },
    confetti3: {
        top: 20,
        left: 30,
    },
    iconContainer: {
        marginBottom: 24,
    },
    iconGradient: {
        width: 88,
        height: 88,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        ...SHADOWS.large,
        shadowColor: '#00FF94',
    },
    title: {
        fontSize: 26,
        fontFamily: FONTS.bold,
        marginBottom: 12,
        textAlign: 'center',
        letterSpacing: 0.3,
    },
    description: {
        fontSize: 16,
        fontFamily: FONTS.regular,
        textAlign: 'center',
        marginBottom: 32,
        lineHeight: 24,
        paddingHorizontal: 8,
    },
    button: {
        width: '100%',
        borderRadius: 18,
        overflow: 'hidden',
        ...SHADOWS.medium,
        shadowColor: '#FF6B6B',
    },
    buttonGradient: {
        paddingVertical: 18,
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontFamily: FONTS.bold,
    },
});
