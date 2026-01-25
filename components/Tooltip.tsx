import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet, Dimensions, Animated, Pressable } from 'react-native';
import { HelpCircle } from 'lucide-react-native';
import { FONTS } from '../constants/theme';

interface TooltipProps {
    text: string;
    children: React.ReactNode;
    colors: any;
}

/**
 * A simple tooltip component that shows an explanation on press
 */
export const Tooltip: React.FC<TooltipProps> = ({ text, children, colors }) => {
    const [visible, setVisible] = useState(false);
    const fadeAnim = useRef(new Animated.Value(0)).current;

    const showTooltip = () => {
        setVisible(true);
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
        }).start();
    };

    const hideTooltip = () => {
        Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 150,
            useNativeDriver: true,
        }).start(() => setVisible(false));
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity
                onLongPress={showTooltip}
                delayLongPress={300}
                activeOpacity={0.7}
                style={styles.trigger}
            >
                {children}
            </TouchableOpacity>

            <Modal
                transparent
                visible={visible}
                animationType="none"
                onRequestClose={hideTooltip}
            >
                <Pressable style={styles.overlay} onPress={hideTooltip}>
                    <Animated.View style={[
                        styles.tooltipBody,
                        {
                            opacity: fadeAnim,
                            backgroundColor: colors.surfaceLight,
                            borderColor: colors.border
                        }
                    ]}>
                        <Text style={[styles.tooltipText, { color: colors.textPrimary }]}>
                            {text}
                        </Text>
                    </Animated.View>
                </Pressable>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    trigger: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
    },
    tooltipBody: {
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        width: '100%',
        maxWidth: 300,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 5,
    },
    tooltipText: {
        fontSize: 14,
        fontFamily: FONTS.regular,
        textAlign: 'right',
        lineHeight: 20,
    },
});
