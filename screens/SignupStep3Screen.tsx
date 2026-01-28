import React, { useState, useRef, useEffect } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    ScrollView,
    Animated,
    Dimensions,
    Switch,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
    ChevronRight,
    Car,
    Monitor,
    Megaphone,
    Coffee,
    Home,
    CheckCircle,
    ArrowLeft,
    Zap,
} from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';
import { getColors, FONTS, SPACING, RADIUS, TYPOGRAPHY, LAYOUT, SHADOWS } from '../constants/theme';
import { useUserProfile } from '../context/UserProfileContext';

const { width, height } = Dimensions.get('window');

const EXPENSE_CATEGORIES = [
    { id: 'transport', label: 'רכב ונסיעות', icon: Car, color: '#6366F1' },
    { id: 'software', label: 'תוכנה וטכנולוגיה', icon: Monitor, color: '#EC4899' },
    { id: 'marketing', label: 'שיווק ופרסום', icon: Megaphone, color: '#F59E0B' },
    { id: 'meals', label: 'ארוחות עסקיות', icon: Coffee, color: '#10B981' },
    { id: 'office', label: 'משרד וציוד', icon: Home, color: '#8B5CF6' },
];

export default function SignupStep3Screen() {
    const navigation = useNavigation<any>();
    const insets = useSafeAreaInsets();
    const { resolvedTheme, isDark } = useTheme();
    const colors = getColors(resolvedTheme);
    const { updateUserProfile } = useUserProfile();

    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [autoTrack, setAutoTrack] = useState(true);
    const [isLoading, setIsLoading] = useState(false);

    // Animations
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const headerAnim = useRef(new Animated.Value(0)).current;
    const cardsAnim = useRef(new Animated.Value(0)).current;
    const buttonAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.sequence([
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 400,
                    useNativeDriver: true,
                }),
                Animated.spring(headerAnim, {
                    toValue: 1,
                    tension: 50,
                    friction: 8,
                    useNativeDriver: true,
                }),
            ]),
            Animated.spring(cardsAnim, {
                toValue: 1,
                tension: 40,
                friction: 8,
                useNativeDriver: true,
            }),
            Animated.spring(buttonAnim, {
                toValue: 1,
                tension: 50,
                friction: 8,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    const toggleCategory = (id: string) => {
        if (selectedCategories.includes(id)) {
            setSelectedCategories(selectedCategories.filter(c => c !== id));
        } else {
            setSelectedCategories([...selectedCategories, id]);
        }
    };

    const handleContinue = async () => {
        setIsLoading(true);

        await updateUserProfile({
            expenseCategories: selectedCategories,
            autoTrackExpenses: autoTrack
        });

        setTimeout(() => {
            setIsLoading(false);
            navigation.navigate('SignupStep4');
        }, 300);
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <StatusBar style={isDark ? 'light' : 'dark'} />

            {/* Background Gradient */}
            <LinearGradient
                colors={isDark
                    ? ['#18181B', '#27272A', '#18181B']
                    : ['#8B5CF6', '#7C3AED', '#6D28D9']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.gradientBg}
            />

            {/* Decorative Elements */}
            <Animated.View
                style={[
                    styles.decorCircle1,
                    {
                        opacity: isDark ? 0.1 : 0.2,
                        transform: [{ scale: headerAnim }],
                    }
                ]}
            />
            <Animated.View
                style={[
                    styles.decorCircle2,
                    {
                        opacity: isDark ? 0.05 : 0.15,
                        transform: [{ scale: headerAnim }],
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
                {/* Header */}
                <Animated.View
                    style={[
                        styles.header,
                        {
                            opacity: fadeAnim,
                            transform: [{
                                translateY: headerAnim.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [-20, 0],
                                }),
                            }],
                        }
                    ]}
                >
                    {/* Back Button */}
                    <TouchableOpacity
                        style={[styles.backButton, { backgroundColor: isDark ? colors.surfaceSecondary : 'rgba(255,255,255,0.2)' }]}
                        onPress={() => navigation.goBack()}
                    >
                        <ChevronRight size={24} color={isDark ? colors.textSecondary : '#FFFFFF'} />
                    </TouchableOpacity>

                    {/* Progress Indicator */}
                    <View style={styles.progressContainer}>
                        <View style={[styles.progressStep, styles.progressActive, { backgroundColor: isDark ? colors.primary : '#FFFFFF' }]} />
                        <View style={[styles.progressStep, styles.progressActive, { backgroundColor: isDark ? colors.primary : '#FFFFFF' }]} />
                        <View style={[styles.progressStep, styles.progressActive, { backgroundColor: isDark ? colors.primary : '#FFFFFF' }]} />
                        <View style={[styles.progressStep, { backgroundColor: isDark ? colors.border : 'rgba(255,255,255,0.3)' }]} />
                    </View>
                </Animated.View>

                {/* Title Section */}
                <Animated.View
                    style={[
                        styles.titleSection,
                        { opacity: fadeAnim }
                    ]}
                >
                    <Text style={[styles.title, { color: isDark ? colors.textPrimary : '#FFFFFF' }]}>
                        הוצאות מוכרות
                    </Text>
                    <Text style={[styles.subtitle, { color: isDark ? colors.textTertiary : 'rgba(255,255,255,0.8)' }]}>
                        בחר/י את סוגי ההוצאות הרלוונטיות לעסק שלך
                    </Text>
                </Animated.View>

                {/* Categories */}
                <Animated.View
                    style={[
                        styles.categoriesContainer,
                        {
                            opacity: cardsAnim,
                            transform: [{
                                translateY: cardsAnim.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [30, 0],
                                }),
                            }],
                        }
                    ]}
                >
                    {EXPENSE_CATEGORIES.map((category, index) => {
                        const IconComponent = category.icon;
                        const isSelected = selectedCategories.includes(category.id);

                        return (
                            <TouchableOpacity
                                key={category.id}
                                style={[
                                    styles.categoryCard,
                                    {
                                        backgroundColor: isDark ? colors.surface : '#FFFFFF',
                                        borderColor: isSelected ? category.color : colors.border,
                                        borderWidth: isSelected ? 2 : 1,
                                    },
                                    isSelected && SHADOWS.md
                                ]}
                                onPress={() => toggleCategory(category.id)}
                                activeOpacity={0.8}
                            >
                                <View style={[
                                    styles.categoryIconContainer,
                                    { backgroundColor: isSelected ? `${category.color}20` : colors.surfaceSecondary }
                                ]}>
                                    <IconComponent
                                        size={24}
                                        color={isSelected ? category.color : colors.textTertiary}
                                    />
                                </View>
                                <Text style={[
                                    styles.categoryLabel,
                                    { color: isSelected ? colors.textPrimary : colors.textSecondary }
                                ]}>
                                    {category.label}
                                </Text>
                                <View style={[
                                    styles.checkbox,
                                    {
                                        backgroundColor: isSelected ? category.color : 'transparent',
                                        borderColor: isSelected ? category.color : colors.border,
                                    }
                                ]}>
                                    {isSelected && <CheckCircle size={14} color="#FFFFFF" />}
                                </View>
                            </TouchableOpacity>
                        );
                    })}

                    {/* Auto Track Card */}
                    <View style={[
                        styles.autoTrackCard,
                        {
                            backgroundColor: isDark ? colors.surface : '#FFFFFF',
                        },
                        SHADOWS.sm
                    ]}>
                        <View style={styles.autoTrackContent}>
                            <View style={[styles.autoTrackIcon, { backgroundColor: colors.primaryMuted }]}>
                                <Zap size={20} color={colors.primary} />
                            </View>
                            <View style={styles.autoTrackText}>
                                <Text style={[styles.autoTrackTitle, { color: colors.textPrimary }]}>
                                    זיהוי אוטומטי
                                </Text>
                                <Text style={[styles.autoTrackDescription, { color: colors.textTertiary }]}>
                                    המערכת תזהה ותרשום הוצאות אוטומטית לאישורך
                                </Text>
                            </View>
                        </View>
                        <Switch
                            value={autoTrack}
                            onValueChange={setAutoTrack}
                            trackColor={{ false: colors.border, true: colors.primaryMuted }}
                            thumbColor={autoTrack ? colors.primary : colors.textQuaternary}
                        />
                    </View>
                </Animated.View>

                {/* Continue Button */}
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
                        style={[styles.continueButton]}
                        onPress={handleContinue}
                        activeOpacity={0.9}
                        disabled={isLoading}
                    >
                        <LinearGradient
                            colors={['#8B5CF6', '#7C3AED']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.continueButtonGradient}
                        >
                            <Text style={styles.continueButtonText}>המשך</Text>
                            <ArrowLeft size={20} color="#FFFFFF" />
                        </LinearGradient>
                    </TouchableOpacity>

                    {/* Skip Link */}
                    <TouchableOpacity
                        style={styles.skipButton}
                        onPress={() => navigation.navigate('SignupStep4')}
                    >
                        <Text style={[styles.skipText, { color: isDark ? colors.textTertiary : 'rgba(255,255,255,0.7)' }]}>
                            דלג לשלב הבא
                        </Text>
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
        height: height * 0.35,
    },
    decorCircle1: {
        position: 'absolute',
        width: 250,
        height: 250,
        borderRadius: 125,
        backgroundColor: '#FFFFFF',
        top: -80,
        right: -60,
    },
    decorCircle2: {
        position: 'absolute',
        width: 180,
        height: 180,
        borderRadius: 90,
        backgroundColor: '#FFFFFF',
        top: 120,
        left: -50,
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: LAYOUT.screenPadding,
    },
    // Header
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: SPACING['2xl'],
    },
    backButton: {
        width: 44,
        height: 44,
        borderRadius: RADIUS.md,
        alignItems: 'center',
        justifyContent: 'center',
    },
    progressContainer: {
        flexDirection: 'row',
        gap: SPACING.sm,
        flex: 1,
        marginLeft: SPACING.lg,
    },
    progressStep: {
        flex: 1,
        height: 4,
        borderRadius: 2,
    },
    progressActive: {},
    // Title Section
    titleSection: {
        marginBottom: SPACING['2xl'],
    },
    title: {
        ...TYPOGRAPHY.h1,
        marginBottom: SPACING.sm,
    },
    subtitle: {
        ...TYPOGRAPHY.body,
        textAlign: 'right',
    },
    // Categories
    categoriesContainer: {
        flex: 1,
        gap: SPACING.md,
        marginBottom: SPACING.xl,
    },
    categoryCard: {
        flexDirection: 'row-reverse',
        alignItems: 'center',
        borderRadius: RADIUS.xl,
        padding: SPACING.lg,
    },
    categoryIconContainer: {
        width: 48,
        height: 48,
        borderRadius: RADIUS.lg,
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: SPACING.md,
    },
    categoryLabel: {
        ...TYPOGRAPHY.body,
        flex: 1,
        textAlign: 'right',
    },
    checkbox: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        alignItems: 'center',
        justifyContent: 'center',
    },
    // Auto Track
    autoTrackCard: {
        flexDirection: 'row-reverse',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderRadius: RADIUS.xl,
        padding: SPACING.lg,
        marginTop: SPACING.md,
    },
    autoTrackContent: {
        flexDirection: 'row-reverse',
        alignItems: 'center',
        flex: 1,
    },
    autoTrackIcon: {
        width: 44,
        height: 44,
        borderRadius: RADIUS.md,
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: SPACING.md,
    },
    autoTrackText: {
        flex: 1,
    },
    autoTrackTitle: {
        ...TYPOGRAPHY.label,
        marginBottom: SPACING.xs,
        textAlign: 'right',
    },
    autoTrackDescription: {
        ...TYPOGRAPHY.caption,
        textAlign: 'right',
    },
    // Button
    buttonContainer: {
        marginTop: 'auto',
    },
    continueButton: {
        borderRadius: RADIUS.lg,
        overflow: 'hidden',
        marginBottom: SPACING.md,
    },
    continueButtonGradient: {
        height: LAYOUT.buttonHeight,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: SPACING.sm,
    },
    continueButtonText: {
        ...TYPOGRAPHY.button,
        color: '#FFFFFF',
        fontSize: 16,
    },
    skipButton: {
        alignItems: 'center',
        paddingVertical: SPACING.md,
    },
    skipText: {
        ...TYPOGRAPHY.body,
    },
});
