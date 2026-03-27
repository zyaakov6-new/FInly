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
    ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
    Mail,
    Lock,
    Eye,
    EyeOff,
    Fingerprint,
    Sparkles,
} from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { getColors, FONTS, SPACING, RADIUS, TYPOGRAPHY, LAYOUT, SHADOWS } from '../constants/theme';

const { width, height } = Dimensions.get('window');

export default function LoginScreen() {
    const navigation = useNavigation<any>();
    const insets = useSafeAreaInsets();
    const { resolvedTheme, isDark } = useTheme();
    const colors = getColors(resolvedTheme);
    const { signIn, resetPassword } = useAuth();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [focusedField, setFocusedField] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({});

    // Animations
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(50)).current;
    const logoScale = useRef(new Animated.Value(0.5)).current;
    const logoRotate = useRef(new Animated.Value(0)).current;
    const inputAnim1 = useRef(new Animated.Value(0)).current;
    const inputAnim2 = useRef(new Animated.Value(0)).current;
    const buttonAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        // Staggered entrance animations
        Animated.sequence([
            Animated.parallel([
                Animated.spring(logoScale, {
                    toValue: 1,
                    tension: 50,
                    friction: 7,
                    useNativeDriver: true,
                }),
                Animated.timing(logoRotate, {
                    toValue: 1,
                    duration: 800,
                    useNativeDriver: true,
                }),
            ]),
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 400,
                    useNativeDriver: true,
                }),
                Animated.spring(slideAnim, {
                    toValue: 0,
                    tension: 50,
                    friction: 8,
                    useNativeDriver: true,
                }),
            ]),
            Animated.stagger(100, [
                Animated.spring(inputAnim1, {
                    toValue: 1,
                    tension: 50,
                    friction: 8,
                    useNativeDriver: true,
                }),
                Animated.spring(inputAnim2, {
                    toValue: 1,
                    tension: 50,
                    friction: 8,
                    useNativeDriver: true,
                }),
                Animated.spring(buttonAnim, {
                    toValue: 1,
                    tension: 50,
                    friction: 8,
                    useNativeDriver: true,
                }),
            ]),
        ]).start();
    }, []);

    const validateEmail = (email: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const handleLogin = async () => {
        // Clear previous errors
        setErrors({});

        // Validate inputs
        const newErrors: { email?: string; password?: string } = {};

        if (!email.trim()) {
            newErrors.email = 'נא להזין אימייל';
        } else if (!validateEmail(email)) {
            newErrors.email = 'אימייל לא תקין';
        }

        if (!password.trim()) {
            newErrors.password = 'נא להזין סיסמה';
        } else if (password.length < 6) {
            newErrors.password = 'סיסמה חייבת להכיל לפחות 6 תווים';
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setIsLoading(true);

        // Animate button press
        Animated.sequence([
            Animated.timing(buttonAnim, {
                toValue: 0.95,
                duration: 100,
                useNativeDriver: true,
            }),
            Animated.timing(buttonAnim, {
                toValue: 1,
                duration: 100,
                useNativeDriver: true,
            }),
        ]).start();

        // Real Firebase login
        const result = await signIn(email, password);

        setIsLoading(false);

        if (result.success) {
            navigation.replace('Main');
        } else {
            setErrors({ general: result.error });
        }
    };

    const handleForgotPassword = async () => {
        if (!email.trim()) {
            setErrors({ email: 'נא להזין אימייל לאיפוס סיסמה' });
            return;
        }

        if (!validateEmail(email)) {
            setErrors({ email: 'אימייל לא תקין' });
            return;
        }

        const result = await resetPassword(email);
        if (result.success) {
            setErrors({ general: 'נשלח אימייל לאיפוס סיסמה' });
        } else {
            setErrors({ general: result.error });
        }
    };

    const handleBiometricLogin = () => {
        // For now, biometric just navigates (would need expo-local-authentication)
        navigation.replace('Main');
    };

    const logoRotation = logoRotate.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
    });

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

            {/* Decorative Elements */}
            <Animated.View
                style={[
                    styles.decorCircle1,
                    {
                        opacity: isDark ? 0.1 : 0.2,
                        transform: [{ scale: logoScale }],
                    }
                ]}
            />
            <Animated.View
                style={[
                    styles.decorCircle2,
                    {
                        opacity: isDark ? 0.05 : 0.15,
                        transform: [{ scale: logoScale }],
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
                        { paddingTop: insets.top + 40, paddingBottom: insets.bottom + 40 }
                    ]}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Logo Section */}
                    <Animated.View
                        style={[
                            styles.logoSection,
                            {
                                transform: [
                                    { scale: logoScale },
                                ],
                            }
                        ]}
                    >
                        <View style={styles.logoWrapper}>
                            <LinearGradient
                                colors={isDark
                                    ? ['#818CF8', '#A78BFA']
                                    : ['#FFFFFF', '#F0F0FF']}
                                style={styles.logoContainer}
                            >
                                <Animated.View style={{ transform: [{ rotate: logoRotation }] }}>
                                    <Text style={[styles.logoText, { color: isDark ? '#18181B' : '#6366F1' }]}>F</Text>
                                </Animated.View>
                            </LinearGradient>
                            <View style={[styles.logoGlow, { backgroundColor: colors.primary }]} />
                        </View>
                        <Text style={[styles.appName, { color: isDark ? colors.textPrimary : '#FFFFFF' }]}>
                            Finly
                        </Text>
                        <View style={styles.taglineContainer}>
                            <Sparkles size={14} color={isDark ? colors.primary : 'rgba(255,255,255,0.8)'} />
                            <Text style={[styles.tagline, { color: isDark ? colors.textTertiary : 'rgba(255,255,255,0.8)' }]}>
                                ניהול פיננסי חכם לפרילנסרים
                            </Text>
                        </View>
                    </Animated.View>

                    {/* Form Card */}
                    <Animated.View
                        style={[
                            styles.formCard,
                            {
                                backgroundColor: isDark ? colors.surface : '#FFFFFF',
                                opacity: fadeAnim,
                                transform: [{ translateY: slideAnim }],
                            },
                            SHADOWS.xl
                        ]}
                    >
                        {/* Welcome Text */}
                        <View style={styles.welcomeSection}>
                            <Text style={[styles.welcomeTitle, { color: colors.textPrimary }]}>
                                ברוך הבא
                            </Text>
                            <Text style={[styles.welcomeSubtitle, { color: colors.textSecondary }]}>
                                היכנס לחשבון שלך כדי להמשיך
                            </Text>
                        </View>

                        {/* Email Input */}
                        <Animated.View
                            style={[
                                styles.inputGroup,
                                {
                                    opacity: inputAnim1,
                                    transform: [{
                                        translateX: inputAnim1.interpolate({
                                            inputRange: [0, 1],
                                            outputRange: [50, 0],
                                        }),
                                    }],
                                }
                            ]}
                        >
                            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
                                אימייל
                            </Text>
                            <View style={[
                                styles.inputContainer,
                                {
                                    backgroundColor: colors.surfaceSecondary,
                                    borderColor: errors.email
                                        ? colors.danger
                                        : focusedField === 'email'
                                            ? colors.primary
                                            : colors.border,
                                    borderWidth: focusedField === 'email' ? 2 : 1,
                                }
                            ]}>
                                <View style={[
                                    styles.inputIconContainer,
                                    { backgroundColor: focusedField === 'email' ? colors.primaryMuted : 'transparent' }
                                ]}>
                                    <Mail
                                        size={20}
                                        color={focusedField === 'email' ? colors.primary : colors.textTertiary}
                                    />
                                </View>
                                <TextInput
                                    style={[styles.input, { color: colors.textPrimary }]}
                                    placeholder="your@email.com"
                                    placeholderTextColor={colors.textQuaternary}
                                    value={email}
                                    onChangeText={(text) => {
                                        setEmail(text);
                                        if (errors.email) setErrors({ ...errors, email: undefined });
                                    }}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                    onFocus={() => setFocusedField('email')}
                                    onBlur={() => setFocusedField(null)}
                                />
                            </View>
                            {errors.email && (
                                <Text style={[styles.errorText, { color: colors.danger }]}>
                                    {errors.email}
                                </Text>
                            )}
                        </Animated.View>

                        {/* Password Input */}
                        <Animated.View
                            style={[
                                styles.inputGroup,
                                {
                                    opacity: inputAnim2,
                                    transform: [{
                                        translateX: inputAnim2.interpolate({
                                            inputRange: [0, 1],
                                            outputRange: [50, 0],
                                        }),
                                    }],
                                }
                            ]}
                        >
                            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
                                סיסמה
                            </Text>
                            <View style={[
                                styles.inputContainer,
                                {
                                    backgroundColor: colors.surfaceSecondary,
                                    borderColor: errors.password
                                        ? colors.danger
                                        : focusedField === 'password'
                                            ? colors.primary
                                            : colors.border,
                                    borderWidth: focusedField === 'password' ? 2 : 1,
                                }
                            ]}>
                                <View style={[
                                    styles.inputIconContainer,
                                    { backgroundColor: focusedField === 'password' ? colors.primaryMuted : 'transparent' }
                                ]}>
                                    <Lock
                                        size={20}
                                        color={focusedField === 'password' ? colors.primary : colors.textTertiary}
                                    />
                                </View>
                                <TextInput
                                    style={[styles.input, { color: colors.textPrimary }]}
                                    placeholder="הזן סיסמה"
                                    placeholderTextColor={colors.textQuaternary}
                                    value={password}
                                    onChangeText={(text) => {
                                        setPassword(text);
                                        if (errors.password) setErrors({ ...errors, password: undefined });
                                    }}
                                    secureTextEntry={!showPassword}
                                    onFocus={() => setFocusedField('password')}
                                    onBlur={() => setFocusedField(null)}
                                />
                                <TouchableOpacity
                                    onPress={() => setShowPassword(!showPassword)}
                                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                                    style={styles.eyeButton}
                                >
                                    {showPassword ? (
                                        <Eye size={20} color={colors.textTertiary} />
                                    ) : (
                                        <EyeOff size={20} color={colors.textTertiary} />
                                    )}
                                </TouchableOpacity>
                            </View>
                            {errors.password && (
                                <Text style={[styles.errorText, { color: colors.danger }]}>
                                    {errors.password}
                                </Text>
                            )}
                        </Animated.View>

                        {/* General Error */}
                        {errors.general && (
                            <View style={[styles.generalError, { backgroundColor: errors.general.includes('נשלח') ? colors.successMuted : colors.dangerMuted }]}>
                                <Text style={[styles.generalErrorText, { color: errors.general.includes('נשלח') ? colors.success : colors.danger }]}>
                                    {errors.general}
                                </Text>
                            </View>
                        )}

                        {/* Forgot Password */}
                        <TouchableOpacity style={styles.forgotPassword} onPress={handleForgotPassword}>
                            <Text style={[styles.forgotPasswordText, { color: colors.primary }]}>
                                שכחת סיסמה?
                            </Text>
                        </TouchableOpacity>

                        {/* Login Button */}
                        <Animated.View
                            style={{
                                opacity: buttonAnim,
                                transform: [{ scale: buttonAnim }],
                            }}
                        >
                            <TouchableOpacity
                                style={[styles.loginButton]}
                                onPress={handleLogin}
                                activeOpacity={0.9}
                                disabled={isLoading}
                            >
                                <LinearGradient
                                    colors={['#6366F1', '#8B5CF6']}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                    style={styles.loginButtonGradient}
                                >
                                    {isLoading ? (
                                        <ActivityIndicator color="#FFFFFF" size="small" />
                                    ) : (
                                        <Text style={styles.loginButtonText}>התחבר</Text>
                                    )}
                                </LinearGradient>
                            </TouchableOpacity>
                        </Animated.View>

                        {/* Divider */}
                        <View style={styles.divider}>
                            <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
                            <Text style={[styles.dividerText, { color: colors.textTertiary }]}>או</Text>
                            <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
                        </View>

                        {/* Biometric Button */}
                        <TouchableOpacity
                            style={[
                                styles.biometricButton,
                                { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }
                            ]}
                            activeOpacity={0.7}
                            onPress={handleBiometricLogin}
                        >
                            <Fingerprint size={22} color={colors.primary} />
                            <Text style={[styles.biometricButtonText, { color: colors.textPrimary }]}>
                                המשך עם זיהוי ביומטרי
                            </Text>
                        </TouchableOpacity>
                    </Animated.View>

                    {/* Sign Up Link */}
                    <Animated.View
                        style={[
                            styles.signupSection,
                            { opacity: fadeAnim }
                        ]}
                    >
                        <Text style={[styles.signupText, { color: isDark ? colors.textTertiary : 'rgba(255,255,255,0.8)' }]}>
                            אין לך חשבון?{' '}
                        </Text>
                        <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
                            <Text style={[styles.signupLink, { color: isDark ? colors.primary : '#FFFFFF' }]}>
                                הרשם עכשיו
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
        height: height * 0.45,
    },
    decorCircle1: {
        position: 'absolute',
        width: 300,
        height: 300,
        borderRadius: 150,
        backgroundColor: '#FFFFFF',
        top: -100,
        right: -80,
    },
    decorCircle2: {
        position: 'absolute',
        width: 200,
        height: 200,
        borderRadius: 100,
        backgroundColor: '#FFFFFF',
        top: 150,
        left: -60,
    },
    keyboardView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: LAYOUT.screenPadding,
    },
    // Logo
    logoSection: {
        alignItems: 'center',
        marginBottom: SPACING['3xl'],
    },
    logoWrapper: {
        position: 'relative',
        marginBottom: SPACING.lg,
    },
    logoContainer: {
        width: 80,
        height: 80,
        borderRadius: RADIUS.xl,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1,
    },
    logoGlow: {
        position: 'absolute',
        width: 80,
        height: 80,
        borderRadius: RADIUS.xl,
        top: 8,
        left: 0,
        opacity: 0.3,
        zIndex: 0,
    },
    logoText: {
        fontSize: 36,
        fontFamily: FONTS.bold,
    },
    appName: {
        ...TYPOGRAPHY.h1,
        marginBottom: SPACING.sm,
    },
    taglineContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.xs,
    },
    tagline: {
        ...TYPOGRAPHY.body,
    },
    // Form Card
    formCard: {
        borderRadius: RADIUS['2xl'],
        padding: SPACING.xl,
        marginBottom: SPACING['2xl'],
    },
    welcomeSection: {
        marginBottom: SPACING['2xl'],
    },
    welcomeTitle: {
        ...TYPOGRAPHY.h2,
        textAlign: 'right',
        marginBottom: SPACING.xs,
    },
    welcomeSubtitle: {
        ...TYPOGRAPHY.body,
        textAlign: 'right',
    },
    // Inputs
    inputGroup: {
        marginBottom: SPACING.xl,
    },
    inputLabel: {
        ...TYPOGRAPHY.label,
        marginBottom: SPACING.sm,
        textAlign: 'right',
    },
    inputContainer: {
        flexDirection: 'row-reverse',
        alignItems: 'center',
        height: LAYOUT.inputHeight,
        borderRadius: RADIUS.lg,
        paddingHorizontal: SPACING.sm,
        gap: SPACING.sm,
    },
    inputIconContainer: {
        width: 40,
        height: 40,
        borderRadius: RADIUS.md,
        alignItems: 'center',
        justifyContent: 'center',
    },
    input: {
        flex: 1,
        ...TYPOGRAPHY.body,
        textAlign: 'right',
        height: '100%',
    },
    eyeButton: {
        padding: SPACING.sm,
    },
    errorText: {
        ...TYPOGRAPHY.caption,
        textAlign: 'right',
        marginTop: SPACING.xs,
    },
    generalError: {
        padding: SPACING.md,
        borderRadius: RADIUS.md,
        marginBottom: SPACING.lg,
    },
    generalErrorText: {
        ...TYPOGRAPHY.body,
        textAlign: 'center',
    },
    // Forgot Password
    forgotPassword: {
        alignSelf: 'flex-end',
        marginBottom: SPACING['2xl'],
    },
    forgotPasswordText: {
        ...TYPOGRAPHY.label,
    },
    // Login Button
    loginButton: {
        borderRadius: RADIUS.lg,
        overflow: 'hidden',
        marginBottom: SPACING.xl,
    },
    loginButtonGradient: {
        height: LAYOUT.buttonHeight,
        alignItems: 'center',
        justifyContent: 'center',
    },
    loginButtonText: {
        ...TYPOGRAPHY.button,
        color: '#FFFFFF',
        fontSize: 16,
    },
    // Divider
    divider: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SPACING.xl,
    },
    dividerLine: {
        flex: 1,
        height: 1,
    },
    dividerText: {
        ...TYPOGRAPHY.caption,
        marginHorizontal: SPACING.lg,
    },
    // Biometric
    biometricButton: {
        height: LAYOUT.buttonHeight,
        borderRadius: RADIUS.lg,
        borderWidth: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: SPACING.sm,
    },
    biometricButtonText: {
        ...TYPOGRAPHY.button,
    },
    // Signup
    signupSection: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    signupText: {
        ...TYPOGRAPHY.body,
    },
    signupLink: {
        ...TYPOGRAPHY.label,
        fontFamily: FONTS.semiBold,
    },
});
