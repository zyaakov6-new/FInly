import React, { useEffect, useRef } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions, Platform } from 'react-native';
import { CheckCircle, X } from 'lucide-react-native';
import { COLORS, FONTS } from '../constants/theme';

const { width, height } = Dimensions.get('window');

interface SuccessModalProps {
    visible: boolean;
    title: string;
    description: string;
    onClose: () => void;
    buttonText?: string;
}

export const SuccessModal = ({ visible, title, description, onClose, buttonText = "מעולה!" }: SuccessModalProps) => {
    const scaleValue = useRef(new Animated.Value(0)).current;
    const opacityValue = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (visible) {
            Animated.parallel([
                Animated.spring(scaleValue, {
                    toValue: 1,
                    friction: 6,
                    tension: 50,
                    useNativeDriver: true,
                }),
                Animated.timing(opacityValue, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                })
            ]).start();
        } else {
            scaleValue.setValue(0.8);
            opacityValue.setValue(0);
        }
    }, [visible]);

    if (!visible) return null;

    return (
        <Modal transparent visible={visible} animationType="none" onRequestClose={onClose} statusBarTranslucent>
            <View style={styles.overlay}>
                <Animated.View style={[styles.container, { transform: [{ scale: scaleValue }], opacity: opacityValue }]}>
                    <View style={styles.iconContainer}>
                        <CheckCircle size={40} color={COLORS.white} strokeWidth={3} />
                    </View>

                    <Text style={styles.title}>{title}</Text>
                    <Text style={styles.description}>{description}</Text>

                    <TouchableOpacity style={styles.button} onPress={onClose} activeOpacity={0.8}>
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
        backgroundColor: 'rgba(0,0,0,0.75)', // Darker overlay for focus
        justifyContent: 'center',
        alignItems: 'center',
    },
    container: {
        width: width * 0.85,
        backgroundColor: COLORS.surface, // Higher contrast dark bg
        borderRadius: 28,
        padding: 32,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.border,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 20,
        },
        shadowOpacity: 0.5,
        shadowRadius: 30,
        elevation: 20,
    },
    iconContainer: {
        width: 72,
        height: 72,
        borderRadius: 36,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.5,
        shadowRadius: 16,
        elevation: 10,
    },
    title: {
        fontSize: 24,
        color: COLORS.white,
        fontFamily: FONTS.bold,
        marginBottom: 12,
        textAlign: 'center',
        letterSpacing: 0.5,
    },
    description: {
        fontSize: 16,
        color: COLORS.textSecondary,
        fontFamily: FONTS.regular,
        textAlign: 'center',
        marginBottom: 32,
        lineHeight: 24,
    },
    button: {
        backgroundColor: COLORS.primary,
        paddingVertical: 18,
        width: '100%',
        borderRadius: 16,
        alignItems: 'center',
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 5,
    },
    buttonText: {
        color: COLORS.white,
        fontSize: 18,
        fontFamily: FONTS.bold,
    }
});
