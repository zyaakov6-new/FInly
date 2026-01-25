import React, { useEffect, useRef } from 'react';
import {
    StyleSheet,
    Text,
    View,
    ScrollView,
    TouchableOpacity,
    Animated,
    Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { ArrowLeft, Rocket, Shield, Bell, TrendingUp } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { FONTS } from '../constants/theme';

const { width } = Dimensions.get('window');

const FEATURES = [
    {
        id: 'security',
        title: 'אבטחה מוגברת',
        subtitle: 'הנתונים הפיננסיים שלך מוצפנים ברמה בנקאית.',
        icon: <Shield size={20} color="#00ff88" />,
    },
    {
        id: 'notifications',
        title: 'התראות חכמות',
        subtitle: 'קבל עדכון בזמן אמת על כל פעולה או הוצאה חריגה.',
        icon: <Bell size={20} color="#00ff88" />,
    },
    {
        id: 'insights',
        title: 'דוחות מפורטים',
        subtitle: 'צפה בגרפים של צמיחה והקלה דוחות למס הכנסה בקלות בלחיצה.',
        icon: <TrendingUp size={20} color="#00ff88" />,
    },
];

export default function SignupStep4Screen() {
    const navigation = useNavigation<any>();

    // Animations
    const scaleAnim = useRef(new Animated.Value(0)).current;
    const glowAnim = useRef(new Animated.Value(0)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        // Rocket scale animation
        Animated.spring(scaleAnim, {
            toValue: 1,
            tension: 20,
            friction: 7,
            useNativeDriver: true,
        }).start();

        // Glow pulse animation
        Animated.loop(
            Animated.sequence([
                Animated.timing(glowAnim, {
                    toValue: 1,
                    duration: 2000,
                    useNativeDriver: true,
                }),
                Animated.timing(glowAnim, {
                    toValue: 0,
                    duration: 2000,
                    useNativeDriver: true,
                }),
            ])
        ).start();

        // Features fade in
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 800,
            delay: 300,
            useNativeDriver: true,
        }).start();
    }, []);

    const handleStart = () => {
        navigation.replace('Main');
    };

    const glowOpacity = glowAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0.3, 0.7],
    });

    return (
        <View style={styles.container}>
            <StatusBar style="light" />

            {/* Dark Green Gradient Background */}
            <LinearGradient
                colors={['#0a3d2e', '#1a5c47', '#0a3d2e']}
                style={styles.gradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            />

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Step Progress Indicator - Scrolls with content */}
                <View style={styles.progressContainer}>
                    <View style={styles.progressSteps}>
                        <View style={[styles.progressStep, styles.progressStepActive]} />
                        <View style={[styles.progressStep, styles.progressStepActive]} />
                        <View style={[styles.progressStep, styles.progressStepActive]} />
                        <View style={[styles.progressStep, styles.progressStepActive]} />
                    </View>
                </View>

                <View style={styles.content}>
                    {/* Rocket Icon with Glow */}
                    <View style={styles.rocketContainer}>
                        <Animated.View
                            style={[
                                styles.glowCircle,
                                {
                                    opacity: glowOpacity,
                                    transform: [{ scale: scaleAnim }],
                                },
                            ]}
                        />
                        <Animated.View
                            style={[
                                styles.rocketIconContainer,
                                {
                                    transform: [{ scale: scaleAnim }],
                                },
                            ]}
                        >
                            <Rocket size={48} color="#ffffff" />
                        </Animated.View>
                    </View>

                    {/* Title */}
                    <Text style={styles.title}>הכל מוכן!</Text>
                    <Text style={styles.subtitle}>העסק שלך עכשיו תחת שליטה</Text>

                    {/* Features List */}
                    <Animated.View style={[styles.featuresList, { opacity: fadeAnim }]}>
                        {FEATURES.map((feature, index) => (
                            <View key={feature.id} style={styles.featureCard}>
                                <View style={styles.featureIcon}>
                                    {feature.icon}
                                </View>
                                <View style={styles.featureContent}>
                                    <Text style={styles.featureTitle}>{feature.title}</Text>
                                    <Text style={styles.featureSubtitle}>{feature.subtitle}</Text>
                                </View>
                            </View>
                        ))}
                    </Animated.View>

                    {/* Start Button */}
                    <TouchableOpacity
                        style={styles.startButton}
                        onPress={handleStart}
                        activeOpacity={0.8}
                    >
                        <LinearGradient
                            colors={['#00ff88', '#00cc6f']}
                            style={styles.startButtonGradient}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                        >
                            <Text style={styles.startButtonText}>בואו נתחיל</Text>
                            <ArrowLeft size={20} color="#0a3d2e" style={styles.arrowIcon} />
                        </LinearGradient>
                    </TouchableOpacity>

                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0a3d2e',
    },
    gradient: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
    },
    progressContainer: {
        marginBottom: 24,
        paddingHorizontal: 24,
    },
    progressSteps: {
        flexDirection: 'row',
        gap: 8,
    },
    progressStep: {
        flex: 1,
        height: 4,
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 2,
    },
    progressStepActive: {
        backgroundColor: '#00ff88',
    },
    scrollContent: {
        flexGrow: 1,
        paddingTop: 60,
        paddingBottom: 40,
    },
    content: {
        flex: 1,
        paddingHorizontal: 24,
        alignItems: 'center',
    },
    rocketContainer: {
        width: 160,
        height: 160,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 40,
    },
    glowCircle: {
        position: 'absolute',
        width: 160,
        height: 160,
        borderRadius: 80,
        backgroundColor: '#00ff88',
        shadowColor: '#00ff88',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 1,
        shadowRadius: 40,
        elevation: 20,
    },
    rocketIconContainer: {
        width: 96,
        height: 96,
        borderRadius: 48,
        backgroundColor: '#00ff88',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#00ff88',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.5,
        shadowRadius: 20,
        elevation: 12,
    },
    title: {
        fontSize: 40,
        fontFamily: FONTS.bold,
        color: '#ffffff',
        textAlign: 'left',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        fontFamily: FONTS.regular,
        color: 'rgba(255,255,255,0.6)',
        textAlign: 'left',
        marginBottom: 48,
    },
    featuresList: {
        width: '100%',
        marginBottom: 40,
    },
    featureCard: {
        flexDirection: 'row-reverse',
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        padding: 20,
        marginBottom: 12,
        alignItems: 'flex-start',
    },
    featureIcon: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: 'rgba(0,255,136,0.15)',
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 16,
    },
    featureContent: {
        flex: 1,
    },
    featureTitle: {
        fontSize: 16,
        fontFamily: FONTS.bold,
        color: '#ffffff',
        textAlign: 'left',
        marginBottom: 4,
    },
    featureSubtitle: {
        fontSize: 13,
        fontFamily: FONTS.regular,
        color: 'rgba(255,255,255,0.6)',
        textAlign: 'left',
        lineHeight: 18,
    },
    startButton: {
        width: '100%',
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: '#00ff88',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
        elevation: 8,
        marginBottom: 24,
    },
    startButtonGradient: {
        paddingVertical: 18,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    startButtonText: {
        fontSize: 18,
        fontFamily: FONTS.bold,
        color: '#0a3d2e',
        marginRight: 8,
    },
    arrowIcon: {
        transform: [{ rotate: '0deg' }],
    },
    poweredBy: {
        fontSize: 11,
        fontFamily: FONTS.regular,
        color: 'rgba(255,255,255,0.3)',
        letterSpacing: 1,
    },
});
