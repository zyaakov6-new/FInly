import React, { useRef, useEffect } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    ScrollView,
    Animated,
    Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
    Rocket,
    Shield,
    Bell,
    TrendingUp,
    ArrowLeft,
    CheckCircle,
    Sparkles,
} from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { getColors, FONTS, SPACING, RADIUS, TYPOGRAPHY, LAYOUT, SHADOWS } from '../constants/theme';

const { width, height } = Dimensions.get('window');

const FEATURES = [
    {
        id: 'security',
        title: 'אבטחה מוגברת',
        subtitle: 'הנתונים שלך מוצפנים ברמה בנקאית',
        icon: Shield,
        color: '#10B981',
    },
    {
        id: 'notifications',
        title: 'התראות חכמות',
        subtitle: 'עדכונים בזמן אמת על כל פעולה',
        icon: Bell,
        color: '#6366F1',
    },
    {
        id: 'insights',
        title: 'תובנות עסקיות',
        subtitle: 'דוחות וגרפים להבנת הביצועים שלך',
        icon: TrendingUp,
        color: '#F59E0B',
    },
];

export default function SignupStep4Screen() {
    const navigation = useNavigation<any>();
    const insets = useSafeAreaInsets();
    const { resolvedTheme, isDark } = useTheme();
    const colors = getColors(resolvedTheme);
    const { completeOnboarding } = useAuth();

    // Animations
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0)).current;
    const glowAnim = useRef(new Animated.Value(0)).current;
    const featuresAnim = useRef(new Animated.Value(0)).current;
    const buttonAnim = useRef(new Animated.Value(0)).current;
    const confettiAnims = useRef([...Array(12)].map(() => ({
        y: new Animated.Value(-100),
        x: new Animated.Value(Math.random() * width),
        rotate: new Animated.Value(0),
        opacity: new Animated.Value(1),
    }))).current;

    useEffect(() => {
        // Main animations sequence
        Animated.sequence([
            // Rocket appears
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 400,
                    useNativeDriver: true,
                }),
                Animated.spring(scaleAnim, {
                    toValue: 1,
                    tension: 40,
                    friction: 7,
                    useNativeDriver: true,
                }),
            ]),
            // Features slide in
            Animated.spring(featuresAnim, {
                toValue: 1,
                tension: 40,
                friction: 8,
                useNativeDriver: true,
            }),
            // Button appears
            Animated.spring(buttonAnim, {
                toValue: 1,
                tension: 50,
                friction: 8,
                useNativeDriver: true,
            }),
        ]).start();

        // Glow pulse animation
        Animated.loop(
            Animated.sequence([
                Animated.timing(glowAnim, {
                    toValue: 1,
                    duration: 1500,
                    useNativeDriver: true,
                }),
                Animated.timing(glowAnim, {
                    toValue: 0,
                    duration: 1500,
                    useNativeDriver: true,
                }),
            ])
        ).start();

        // Confetti animation
        confettiAnims.forEach((anim, index) => {
            const delay = index * 100;
            Animated.loop(
                Animated.sequence([
                    Animated.delay(delay),
                    Animated.parallel([
                        Animated.timing(anim.y, {
                            toValue: height + 100,
                            duration: 3000 + Math.random() * 2000,
                            useNativeDriver: true,
                        }),
                        Animated.timing(anim.rotate, {
                            toValue: 1,
                            duration: 3000 + Math.random() * 2000,
                            useNativeDriver: true,
                        }),
                        Animated.sequence([
                            Animated.delay(2000),
                            Animated.timing(anim.opacity, {
                                toValue: 0,
                                duration: 1000,
                                useNativeDriver: true,
                            }),
                        ]),
                    ]),
                    Animated.parallel([
                        Animated.timing(anim.y, {
                            toValue: -100,
                            duration: 0,
                            useNativeDriver: true,
                        }),
                        Animated.timing(anim.x, {
                            toValue: Math.random() * width,
                            duration: 0,
                            useNativeDriver: true,
                        }),
                        Animated.timing(anim.opacity, {
                            toValue: 1,
                            duration: 0,
                            useNativeDriver: true,
                        }),
                    ]),
                ])
            ).start();
        });
    }, []);

    const handleStart = async () => {
        try {
            await completeOnboarding();
        } catch (error) {
            console.error('Error completing onboarding:', error);
        }
        navigation.replace('Main');
    };

    const glowOpacity = glowAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0.3, 0.6],
    });

    const confettiColors = ['#10B981', '#6366F1', '#F59E0B', '#EC4899', '#8B5CF6'];

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <StatusBar style={isDark ? 'light' : 'dark'} />

            {/* Background Gradient */}
            <LinearGradient
                colors={isDark
                    ? ['#18181B', '#27272A', '#18181B']
                    : ['#6366F1', '#8B5CF6', '#A78BFA']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.gradientBg}
            />

            {/* Confetti */}
            {confettiAnims.map((anim, index) => (
                <Animated.View
                    key={index}
                    style={[
                        styles.confetti,
                        {
                            backgroundColor: confettiColors[index % confettiColors.length],
                            transform: [
                                { translateY: anim.y },
                                { translateX: anim.x },
                                {
                                    rotate: anim.rotate.interpolate({
                                        inputRange: [0, 1],
                                        outputRange: ['0deg', '720deg'],
                                    }),
                                },
                            ],
                            opacity: anim.opacity,
                        },
                    ]}
                />
            ))}

            {/* Decorative Elements */}
            <Animated.View
                style={[
                    styles.decorCircle1,
                    {
                        opacity: isDark ? 0.1 : 0.2,
                        transform: [{ scale: scaleAnim }],
                    }
                ]}
            />

            <ScrollView
                contentContainerStyle={[
                    styles.scrollContent,
                    { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 40 }
                ]}
                showsVerticalScrollIndicator={false}
            >
                {/* Progress Indicator */}
                <Animated.View
                    style={[
                        styles.progressContainer,
                        { opacity: fadeAnim }
                    ]}
                >
                    <View style={styles.progressSteps}>
                        <View style={[styles.progressStep, styles.progressActive, { backgroundColor: isDark ? colors.primary : '#FFFFFF' }]} />
                        <View style={[styles.progressStep, styles.progressActive, { backgroundColor: isDark ? colors.primary : '#FFFFFF' }]} />
                        <View style={[styles.progressStep, styles.progressActive, { backgroundColor: isDark ? colors.primary : '#FFFFFF' }]} />
                        <View style={[styles.progressStep, styles.progressActive, { backgroundColor: isDark ? colors.primary : '#FFFFFF' }]} />
                    </View>
                </Animated.View>

                {/* Rocket Section */}
                <Animated.View
                    style={[
                        styles.heroSection,
                        {
                            opacity: fadeAnim,
                            transform: [{ scale: scaleAnim }],
                        }
                    ]}
                >
                    <View style={styles.rocketContainer}>
                        <Animated.View
                            style={[
                                styles.rocketGlow,
                                {
                                    opacity: glowOpacity,
                                    backgroundColor: isDark ? colors.primary : '#FFFFFF',
                                }
                            ]}
                        />
                        <LinearGradient
                            colors={isDark ? ['#6366F1', '#8B5CF6'] : ['#FFFFFF', '#F0F0FF']}
                            style={styles.rocketIcon}
                        >
                            <Rocket size={40} color={isDark ? '#FFFFFF' : '#6366F1'} />
                        </LinearGradient>
                    </View>

                    <View style={styles.checkBadge}>
                        <CheckCircle size={20} color="#10B981" fill="#10B981" />
                    </View>
                </Animated.View>

                {/* Title */}
                <Animated.View
                    style={[
                        styles.titleSection,
                        { opacity: fadeAnim }
                    ]}
                >
                    <View style={styles.titleRow}>
                        <Sparkles size={28} color={isDark ? colors.primary : '#FFFFFF'} />
                        <Text style={[styles.title, { color: isDark ? colors.textPrimary : '#FFFFFF' }]}>
                            הכל מוכן!
                        </Text>
                    </View>
                    <Text style={[styles.subtitle, { color: isDark ? colors.textTertiary : 'rgba(255,255,255,0.8)' }]}>
                        העסק שלך עכשיו תחת שליטה מלאה
                    </Text>
                </Animated.View>

                {/* Features List */}
                <Animated.View
                    style={[
                        styles.featuresContainer,
                        {
                            opacity: featuresAnim,
                            transform: [{
                                translateY: featuresAnim.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [30, 0],
                                }),
                            }],
                        }
                    ]}
                >
                    {FEATURES.map((feature) => {
                        const IconComponent = feature.icon;
                        return (
                            <View
                                key={feature.id}
                                style={[
                                    styles.featureCard,
                                    {
                                        backgroundColor: isDark ? colors.surface : '#FFFFFF',
                                    },
                                    SHADOWS.sm
                                ]}
                            >
                                <View style={[
                                    styles.featureIconContainer,
                                    { backgroundColor: `${feature.color}20` }
                                ]}>
                                    <IconComponent size={22} color={feature.color} />
                                </View>
                                <View style={styles.featureContent}>
                                    <Text style={[styles.featureTitle, { color: colors.textPrimary }]}>
                                        {feature.title}
                                    </Text>
                                    <Text style={[styles.featureSubtitle, { color: colors.textTertiary }]}>
                                        {feature.subtitle}
                                    </Text>
                                </View>
                            </View>
                        );
                    })}
                </Animated.View>

                {/* Start Button */}
                <Animated.View
                    style={[
                        styles.buttonContainer,
                        {
                            opacity: buttonAnim,
                            transform: [{ scale: buttonAnim }],
                        }
                    ]}
                >
                    <TouchableOpacity
                        style={styles.startButton}
                        onPress={handleStart}
                        activeOpacity={0.9}
                    >
                        <LinearGradient
                            colors={['#6366F1', '#8B5CF6']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.startButtonGradient}
                        >
                            <Text style={styles.startButtonText}>בואו נתחיל!</Text>
                            <ArrowLeft size={20} color="#FFFFFF" />
                        </LinearGradient>
                    </TouchableOpacity>
                </Animated.View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    gradientBg: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        height: height * 0.5,
    },
    confetti: {
        position: 'absolute',
        width: 10,
        height: 10,
        borderRadius: 2,
    },
    decorCircle1: {
        position: 'absolute',
        width: 300,
        height: 300,
        borderRadius: 150,
        backgroundColor: '#FFFFFF',
        top: -100,
        right: -80,
        opacity: 0.2,
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: LAYOUT.screenPadding,
    },
    // Progress
    progressContainer: {
        marginBottom: SPACING['3xl'],
    },
    progressSteps: {
        flexDirection: 'row',
        gap: SPACING.sm,
    },
    progressStep: {
        flex: 1,
        height: 4,
        borderRadius: 2,
    },
    progressActive: {},
    // Hero
    heroSection: {
        alignItems: 'center',
        marginBottom: SPACING['2xl'],
    },
    rocketContainer: {
        position: 'relative',
        width: 120,
        height: 120,
        alignItems: 'center',
        justifyContent: 'center',
    },
    rocketGlow: {
        position: 'absolute',
        width: 120,
        height: 120,
        borderRadius: 60,
    },
    rocketIcon: {
        width: 80,
        height: 80,
        borderRadius: RADIUS.xl,
        alignItems: 'center',
        justifyContent: 'center',
    },
    checkBadge: {
        position: 'absolute',
        bottom: 0,
        right: width / 2 - 60 - 12,
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#FFFFFF',
        alignItems: 'center',
        justifyContent: 'center',
        ...SHADOWS.md,
    },
    // Title
    titleSection: {
        alignItems: 'center',
        marginBottom: SPACING['2xl'],
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.md,
        marginBottom: SPACING.sm,
    },
    title: {
        ...TYPOGRAPHY.h1,
        fontSize: 36,
    },
    subtitle: {
        ...TYPOGRAPHY.body,
        textAlign: 'center',
    },
    // Features
    featuresContainer: {
        gap: SPACING.md,
        marginBottom: SPACING['2xl'],
    },
    featureCard: {
        flexDirection: 'row-reverse',
        alignItems: 'center',
        borderRadius: RADIUS.xl,
        padding: SPACING.lg,
    },
    featureIconContainer: {
        width: 48,
        height: 48,
        borderRadius: RADIUS.lg,
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: SPACING.md,
    },
    featureContent: {
        flex: 1,
    },
    featureTitle: {
        ...TYPOGRAPHY.label,
        marginBottom: SPACING.xs,
        textAlign: 'right',
    },
    featureSubtitle: {
        ...TYPOGRAPHY.caption,
        textAlign: 'right',
    },
    // Button
    buttonContainer: {
        marginTop: 'auto',
    },
    startButton: {
        borderRadius: RADIUS.lg,
        overflow: 'hidden',
    },
    startButtonGradient: {
        height: LAYOUT.buttonHeight,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: SPACING.sm,
    },
    startButtonText: {
        ...TYPOGRAPHY.button,
        color: '#FFFFFF',
        fontSize: 18,
    },
});
