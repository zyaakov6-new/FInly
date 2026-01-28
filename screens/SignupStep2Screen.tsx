import React, { useState, useRef, useEffect } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TextInput,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Animated,
    Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
    ChevronRight,
    Briefcase,
    Code,
    Palette,
    TrendingUp,
    Edit3,
    CheckCircle,
    ArrowLeft,
} from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';
import { getColors, FONTS, SPACING, RADIUS, TYPOGRAPHY, LAYOUT, SHADOWS } from '../constants/theme';
import { useUserProfile } from '../context/UserProfileContext';

const { width, height } = Dimensions.get('window');

const BUSINESS_CATEGORIES = [
    { id: 'developer', label: 'מפתח/ת', icon: Code, color: '#6366F1' },
    { id: 'designer', label: 'מעצב/ת', icon: Palette, color: '#EC4899' },
    { id: 'consultant', label: 'יועץ/ת', icon: Briefcase, color: '#F59E0B' },
    { id: 'marketer', label: 'משווק/ת', icon: TrendingUp, color: '#10B981' },
    { id: 'other', label: 'אחר', icon: Edit3, color: '#8B5CF6' },
];

export default function SignupStep2Screen() {
    const navigation = useNavigation<any>();
    const insets = useSafeAreaInsets();
    const { resolvedTheme, isDark } = useTheme();
    const colors = getColors(resolvedTheme);
    const { updateUserProfile } = useUserProfile();

    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [customCategory, setCustomCategory] = useState('');
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

    const handleCategorySelect = (id: string) => {
        setSelectedCategory(id);
        if (id !== 'other') {
            setCustomCategory('');
        }
    };

    const handleContinue = async () => {
        if (!selectedCategory) return;

        setIsLoading(true);

        const categoryToSave = selectedCategory === 'other' ? customCategory : selectedCategory;
        await updateUserProfile({
            businessCategory: categoryToSave || '',
            customCategory: selectedCategory === 'other' ? customCategory : undefined
        });

        setTimeout(() => {
            setIsLoading(false);
            navigation.navigate('SignupStep3');
        }, 300);
    };

    const isValid = selectedCategory !== null && (selectedCategory !== 'other' || customCategory.trim().length > 0);

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <StatusBar style={isDark ? 'light' : 'dark'} />

            {/* Background Gradient */}
            <LinearGradient
                colors={isDark
                    ? ['#18181B', '#27272A', '#18181B']
                    : ['#10B981', '#059669', '#047857']}
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

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                <ScrollView
                    contentContainerStyle={[
                        styles.scrollContent,
                        { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 40 }
                    ]}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
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
                            <View style={[styles.progressStep, { backgroundColor: isDark ? colors.border : 'rgba(255,255,255,0.3)' }]} />
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
                            מה תחום העיסוק שלך?
                        </Text>
                        <Text style={[styles.subtitle, { color: isDark ? colors.textTertiary : 'rgba(255,255,255,0.8)' }]}>
                            נתאים את האפליקציה לצרכים שלך
                        </Text>
                    </Animated.View>

                    {/* Categories Grid */}
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
                        <View style={styles.categoriesGrid}>
                            {BUSINESS_CATEGORIES.map((category) => {
                                const IconComponent = category.icon;
                                const isSelected = selectedCategory === category.id;

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
                                        onPress={() => handleCategorySelect(category.id)}
                                        activeOpacity={0.8}
                                    >
                                        <View style={[
                                            styles.categoryIconContainer,
                                            { backgroundColor: isSelected ? `${category.color}20` : colors.surfaceSecondary }
                                        ]}>
                                            <IconComponent
                                                size={28}
                                                color={isSelected ? category.color : colors.textTertiary}
                                            />
                                        </View>
                                        <Text style={[
                                            styles.categoryLabel,
                                            { color: isSelected ? colors.textPrimary : colors.textSecondary }
                                        ]}>
                                            {category.label}
                                        </Text>
                                        {isSelected && (
                                            <View style={[styles.checkBadge, { backgroundColor: category.color }]}>
                                                <CheckCircle size={14} color="#FFFFFF" />
                                            </View>
                                        )}
                                    </TouchableOpacity>
                                );
                            })}
                        </View>

                        {/* Custom Category Input */}
                        {selectedCategory === 'other' && (
                            <View style={[
                                styles.customInputCard,
                                {
                                    backgroundColor: isDark ? colors.surface : '#FFFFFF',
                                },
                                SHADOWS.sm
                            ]}>
                                <Text style={[styles.customInputLabel, { color: colors.textSecondary }]}>
                                    ספר/י לנו מה תחום העיסוק שלך
                                </Text>
                                <TextInput
                                    style={[
                                        styles.customInput,
                                        {
                                            backgroundColor: colors.surfaceSecondary,
                                            color: colors.textPrimary,
                                            borderColor: colors.border,
                                        }
                                    ]}
                                    placeholder="לדוגמה: צלם, מאמן כושר, יועץ משכנתאות..."
                                    placeholderTextColor={colors.textQuaternary}
                                    value={customCategory}
                                    onChangeText={setCustomCategory}
                                    autoFocus
                                />
                            </View>
                        )}
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
                            disabled={!isValid || isLoading}
                        >
                            <LinearGradient
                                colors={isValid
                                    ? ['#10B981', '#059669']
                                    : [colors.fillSecondary, colors.fillSecondary]}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.continueButtonGradient}
                            >
                                <Text style={[
                                    styles.continueButtonText,
                                    { color: isValid ? '#FFFFFF' : colors.textTertiary }
                                ]}>
                                    המשך
                                </Text>
                                <ArrowLeft size={20} color={isValid ? '#FFFFFF' : colors.textTertiary} />
                            </LinearGradient>
                        </TouchableOpacity>

                        {/* Skip Link */}
                        <TouchableOpacity
                            style={styles.skipButton}
                            onPress={() => navigation.navigate('SignupStep3')}
                        >
                            <Text style={[styles.skipText, { color: isDark ? colors.textTertiary : 'rgba(255,255,255,0.7)' }]}>
                                דלג לשלב הבא
                            </Text>
                        </TouchableOpacity>
                    </Animated.View>
                </ScrollView>
            </KeyboardAvoidingView>
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
    keyboardView: {
        flex: 1,
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
    },
    categoriesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: SPACING.md,
        marginBottom: SPACING.xl,
    },
    categoryCard: {
        width: (width - LAYOUT.screenPadding * 2 - SPACING.md) / 2,
        borderRadius: RADIUS.xl,
        padding: SPACING.lg,
        alignItems: 'center',
        position: 'relative',
    },
    categoryIconContainer: {
        width: 56,
        height: 56,
        borderRadius: RADIUS.lg,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: SPACING.md,
    },
    categoryLabel: {
        ...TYPOGRAPHY.label,
        textAlign: 'center',
    },
    checkBadge: {
        position: 'absolute',
        top: SPACING.sm,
        right: SPACING.sm,
        width: 24,
        height: 24,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    // Custom Input
    customInputCard: {
        borderRadius: RADIUS.xl,
        padding: SPACING.lg,
        marginBottom: SPACING.xl,
    },
    customInputLabel: {
        ...TYPOGRAPHY.label,
        marginBottom: SPACING.md,
        textAlign: 'right',
    },
    customInput: {
        height: LAYOUT.inputHeight,
        borderRadius: RADIUS.lg,
        borderWidth: 1,
        paddingHorizontal: SPACING.lg,
        ...TYPOGRAPHY.body,
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
