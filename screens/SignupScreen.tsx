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
    Mail,
    User,
    Lock,
    Eye,
    EyeOff,
    ChevronRight,
    CheckCircle,
    Sparkles,
    ArrowLeft,
    Phone,
} from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { getColors, FONTS, SPACING, RADIUS, TYPOGRAPHY, LAYOUT, SHADOWS } from '../constants/theme';
import { useUserProfile } from '../context/UserProfileContext';

const { width, height } = Dimensions.get('window');

export default function SignupScreen() {
    const navigation = useNavigation<any>();
    const insets = useSafeAreaInsets();
    const { resolvedTheme, isDark } = useTheme();
    const colors = getColors(resolvedTheme);
    const { updateUserProfile } = useUserProfile();
    const { signUp } = useAuth();

    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [focusedField, setFocusedField] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState<{ name?: string; email?: string; phone?: string; password?: string; general?: string }>({});

    // Animations
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(50)).current;
    const headerAnim = useRef(new Animated.Value(0)).current;
    const inputAnim1 = useRef(new Animated.Value(0)).current;
    const inputAnim2 = useRef(new Animated.Value(0)).current;
    const inputAnim3 = useRef(new Animated.Value(0)).current;
    const inputAnim4 = useRef(new Animated.Value(0)).current;
    const buttonAnim = useRef(new Animated.Value(0)).current;
    const checkAnim = useRef(new Animated.Value(0)).current;

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
            Animated.stagger(70, [
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
                Animated.spring(inputAnim3, {
                    toValue: 1,
                    tension: 50,
                    friction: 8,
                    useNativeDriver: true,
                }),
                Animated.spring(inputAnim4, {
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

    // Password strength
    const getPasswordStrength = (pass: string) => {
        let strength = 0;
        if (pass.length >= 6) strength++;
        if (pass.length >= 8) strength++;
        if (/[A-Z]/.test(pass)) strength++;
        if (/[0-9]/.test(pass)) strength++;
        if (/[^A-Za-z0-9]/.test(pass)) strength++;
        return strength;
    };

    const passwordStrength = getPasswordStrength(password);
    const strengthLabels = ['חלש', 'בינוני', 'טוב', 'חזק', 'מעולה'];
    const strengthColors = [colors.danger, colors.warning, colors.warning, colors.success, colors.success];

    const validateEmail = (email: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const validatePhone = (phone: string) => {
        // Israeli phone format: 05X-XXXXXXX or 05XXXXXXXX
        const phoneRegex = /^0(5[0-9])[- ]?[0-9]{7}$/;
        return phoneRegex.test(phone.replace(/[- ]/g, ''));
    };

    const handleContinue = async () => {
        setErrors({});

        const newErrors: { name?: string; email?: string; phone?: string; password?: string } = {};

        if (!fullName.trim()) {
            newErrors.name = 'נא להזין שם מלא';
        } else if (fullName.trim().length < 2) {
            newErrors.name = 'שם חייב להכיל לפחות 2 תווים';
        }

        if (!email.trim()) {
            newErrors.email = 'נא להזין אימייל';
        } else if (!validateEmail(email)) {
            newErrors.email = 'אימייל לא תקין';
        }

        if (!phone.trim()) {
            newErrors.phone = 'נא להזין מספר טלפון';
        } else if (!validatePhone(phone)) {
            newErrors.phone = 'מספר טלפון לא תקין';
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

        // Animate checkmark
        Animated.spring(checkAnim, {
            toValue: 1,
            tension: 50,
            friction: 7,
            useNativeDriver: true,
        }).start();

        // Real Firebase signup (includes phone in user profile)
        const result = await signUp(email, password, fullName, phone);

        if (result.success) {
            // Also update local user profile
            await updateUserProfile({ fullName, email, phone });

            setTimeout(() => {
                setIsLoading(false);
                navigation.navigate('SignupStep2');
            }, 500);
        } else {
            setIsLoading(false);
            setErrors({ general: result.error });
        }
    };

    const isValid = fullName.trim().length > 0 && email.trim().length > 0 && phone.trim().length > 0 && password.length >= 6;

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
                            <View style={[styles.progressStep, { backgroundColor: isDark ? colors.border : 'rgba(255,255,255,0.3)' }]} />
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
                        <View style={styles.titleRow}>
                            <Sparkles size={24} color={isDark ? colors.primary : '#FFFFFF'} />
                            <Text style={[styles.title, { color: isDark ? colors.textPrimary : '#FFFFFF' }]}>
                                יצירת חשבון
                            </Text>
                        </View>
                        <Text style={[styles.subtitle, { color: isDark ? colors.textTertiary : 'rgba(255,255,255,0.8)' }]}>
                            הצטרף לאלפי פרילנסרים שכבר מנהלים את הכספים שלהם בחכמה
                        </Text>
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
                        {/* Full Name Input */}
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
                                שם מלא
                            </Text>
                            <View style={[
                                styles.inputContainer,
                                {
                                    backgroundColor: colors.surfaceSecondary,
                                    borderColor: errors.name
                                        ? colors.danger
                                        : focusedField === 'name'
                                            ? colors.primary
                                            : colors.border,
                                    borderWidth: focusedField === 'name' ? 2 : 1,
                                }
                            ]}>
                                <View style={[
                                    styles.inputIconContainer,
                                    { backgroundColor: focusedField === 'name' ? colors.primaryMuted : 'transparent' }
                                ]}>
                                    <User
                                        size={20}
                                        color={focusedField === 'name' ? colors.primary : colors.textTertiary}
                                    />
                                </View>
                                <TextInput
                                    style={[styles.input, { color: colors.textPrimary }]}
                                    placeholder="ישראל ישראלי"
                                    placeholderTextColor={colors.textQuaternary}
                                    value={fullName}
                                    onChangeText={(text) => {
                                        setFullName(text);
                                        if (errors.name) setErrors({ ...errors, name: undefined });
                                    }}
                                    onFocus={() => setFocusedField('name')}
                                    onBlur={() => setFocusedField(null)}
                                />
                                {fullName.length > 0 && !errors.name && (
                                    <CheckCircle size={20} color={colors.success} />
                                )}
                            </View>
                            {errors.name && (
                                <Text style={[styles.errorText, { color: colors.danger }]}>
                                    {errors.name}
                                </Text>
                            )}
                        </Animated.View>

                        {/* Email Input */}
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
                                {validateEmail(email) && !errors.email && (
                                    <CheckCircle size={20} color={colors.success} />
                                )}
                            </View>
                            {errors.email && (
                                <Text style={[styles.errorText, { color: colors.danger }]}>
                                    {errors.email}
                                </Text>
                            )}
                        </Animated.View>

                        {/* Phone Input */}
                        <Animated.View
                            style={[
                                styles.inputGroup,
                                {
                                    opacity: inputAnim3,
                                    transform: [{
                                        translateX: inputAnim3.interpolate({
                                            inputRange: [0, 1],
                                            outputRange: [50, 0],
                                        }),
                                    }],
                                }
                            ]}
                        >
                            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
                                טלפון
                            </Text>
                            <View style={[
                                styles.inputContainer,
                                {
                                    backgroundColor: colors.surfaceSecondary,
                                    borderColor: errors.phone
                                        ? colors.danger
                                        : focusedField === 'phone'
                                            ? colors.primary
                                            : colors.border,
                                    borderWidth: focusedField === 'phone' ? 2 : 1,
                                }
                            ]}>
                                <View style={[
                                    styles.inputIconContainer,
                                    { backgroundColor: focusedField === 'phone' ? colors.primaryMuted : 'transparent' }
                                ]}>
                                    <Phone
                                        size={20}
                                        color={focusedField === 'phone' ? colors.primary : colors.textTertiary}
                                    />
                                </View>
                                <TextInput
                                    style={[styles.input, { color: colors.textPrimary }]}
                                    placeholder="050-1234567"
                                    placeholderTextColor={colors.textQuaternary}
                                    value={phone}
                                    onChangeText={(text) => {
                                        setPhone(text);
                                        if (errors.phone) setErrors({ ...errors, phone: undefined });
                                    }}
                                    keyboardType="phone-pad"
                                    onFocus={() => setFocusedField('phone')}
                                    onBlur={() => setFocusedField(null)}
                                />
                                {validatePhone(phone) && !errors.phone && (
                                    <CheckCircle size={20} color={colors.success} />
                                )}
                            </View>
                            {errors.phone && (
                                <Text style={[styles.errorText, { color: colors.danger }]}>
                                    {errors.phone}
                                </Text>
                            )}
                        </Animated.View>

                        {/* Password Input */}
                        <Animated.View
                            style={[
                                styles.inputGroup,
                                {
                                    opacity: inputAnim4,
                                    transform: [{
                                        translateX: inputAnim4.interpolate({
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
                                    placeholder="צור סיסמה חזקה"
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

                            {/* Password Strength Indicator */}
                            {password.length > 0 && (
                                <View style={styles.strengthContainer}>
                                    <View style={styles.strengthBars}>
                                        {[1, 2, 3, 4, 5].map((level) => (
                                            <View
                                                key={level}
                                                style={[
                                                    styles.strengthBar,
                                                    {
                                                        backgroundColor: level <= passwordStrength
                                                            ? strengthColors[passwordStrength - 1]
                                                            : colors.border,
                                                    }
                                                ]}
                                            />
                                        ))}
                                    </View>
                                    <Text style={[
                                        styles.strengthText,
                                        { color: passwordStrength > 0 ? strengthColors[passwordStrength - 1] : colors.textTertiary }
                                    ]}>
                                        {passwordStrength > 0 ? strengthLabels[passwordStrength - 1] : 'הזן סיסמה'}
                                    </Text>
                                </View>
                            )}
                        </Animated.View>

                        {/* General Error */}
                        {errors.general && (
                            <View style={[styles.generalError, { backgroundColor: colors.dangerMuted }]}>
                                <Text style={[styles.generalErrorText, { color: colors.danger }]}>
                                    {errors.general}
                                </Text>
                            </View>
                        )}

                        {/* Continue Button */}
                        <Animated.View
                            style={{
                                opacity: buttonAnim,
                                transform: [{ scale: buttonAnim }],
                            }}
                        >
                            <TouchableOpacity
                                style={[styles.continueButton]}
                                onPress={handleContinue}
                                activeOpacity={0.9}
                                disabled={isLoading || !isValid}
                            >
                                <LinearGradient
                                    colors={isValid
                                        ? ['#10B981', '#059669']
                                        : [colors.fillSecondary, colors.fillSecondary]}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                    style={styles.continueButtonGradient}
                                >
                                    {isLoading ? (
                                        <View style={styles.loadingContainer}>
                                            <Animated.View style={{ transform: [{ scale: checkAnim }] }}>
                                                <CheckCircle size={24} color="#FFFFFF" />
                                            </Animated.View>
                                        </View>
                                    ) : (
                                        <>
                                            <Text style={[
                                                styles.continueButtonText,
                                                { color: isValid ? '#FFFFFF' : colors.textTertiary }
                                            ]}>
                                                המשך
                                            </Text>
                                            <ArrowLeft size={20} color={isValid ? '#FFFFFF' : colors.textTertiary} />
                                        </>
                                    )}
                                </LinearGradient>
                            </TouchableOpacity>
                        </Animated.View>

                        {/* Terms */}
                        <Text style={[styles.termsText, { color: colors.textTertiary }]}>
                            בלחיצה על "המשך" אתה מסכים ל
                            <Text style={{ color: colors.primary }}>תנאי השימוש</Text>
                            {' '}ול
                            <Text style={{ color: colors.primary }}>מדיניות הפרטיות</Text>
                        </Text>
                    </Animated.View>

                    {/* Login Link */}
                    <Animated.View
                        style={[
                            styles.loginSection,
                            { opacity: fadeAnim }
                        ]}
                    >
                        <Text style={[styles.loginText, { color: isDark ? colors.textTertiary : 'rgba(255,255,255,0.8)' }]}>
                            כבר יש לך חשבון?{' '}
                        </Text>
                        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                            <Text style={[styles.loginLink, { color: isDark ? colors.primary : '#FFFFFF' }]}>
                                התחבר
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
    progressActive: {
        // Active color set dynamically
    },
    // Title Section
    titleSection: {
        marginBottom: SPACING['2xl'],
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.sm,
        marginBottom: SPACING.sm,
    },
    title: {
        ...TYPOGRAPHY.h1,
    },
    subtitle: {
        ...TYPOGRAPHY.body,
        textAlign: 'right',
    },
    // Form Card
    formCard: {
        borderRadius: RADIUS['2xl'],
        padding: SPACING.xl,
        marginBottom: SPACING['2xl'],
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
    // Password Strength
    strengthContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: SPACING.sm,
    },
    strengthBars: {
        flexDirection: 'row',
        gap: SPACING.xs,
        flex: 1,
        marginRight: SPACING.md,
    },
    strengthBar: {
        flex: 1,
        height: 4,
        borderRadius: 2,
    },
    strengthText: {
        ...TYPOGRAPHY.captionSmall,
    },
    // Continue Button
    continueButton: {
        borderRadius: RADIUS.lg,
        overflow: 'hidden',
        marginBottom: SPACING.lg,
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
    loadingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.sm,
    },
    // Terms
    termsText: {
        ...TYPOGRAPHY.caption,
        textAlign: 'center',
        lineHeight: 20,
    },
    // Login
    loginSection: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    loginText: {
        ...TYPOGRAPHY.body,
    },
    loginLink: {
        ...TYPOGRAPHY.label,
        fontFamily: FONTS.semiBold,
    },
});
