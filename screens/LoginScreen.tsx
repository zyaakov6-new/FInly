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
    useColorScheme,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Mail, Lock, Eye, EyeOff, ChevronLeft } from 'lucide-react-native';
import { FONTS, getColors, SPACING, RADIUS, SHADOWS, TYPOGRAPHY } from '../constants/theme';

export default function LoginScreen() {
    const navigation = useNavigation<any>();
    const insets = useSafeAreaInsets();
    const colorScheme = useColorScheme();
    const colors = getColors(colorScheme);

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [focusedInput, setFocusedInput] = useState<'email' | 'password' | null>(null);

    // Subtle fade animation
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(20)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 400,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 400,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    const handleLogin = () => {
        navigation.replace('Main');
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                <ScrollView
                    contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 60 }]}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
                        {/* Logo */}
                        <View style={styles.logoContainer}>
                            <View style={[styles.logo, { backgroundColor: colors.primary }]}>
                                <Text style={styles.logoText}>F</Text>
                            </View>
                            <Text style={[styles.appName, { color: colors.textPrimary }]}>Finly</Text>
                        </View>

                        {/* Title */}
                        <View style={styles.titleContainer}>
                            <Text style={[styles.title, { color: colors.textPrimary }]}>התחברות</Text>
                            <Text style={[styles.subtitle, { color: colors.textTertiary }]}>
                                הזן את פרטי החשבון שלך
                            </Text>
                        </View>

                        {/* Form */}
                        <View style={styles.form}>
                            {/* Email Field */}
                            <View style={styles.fieldContainer}>
                                <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>אימייל</Text>
                                <View style={[
                                    styles.inputContainer,
                                    { backgroundColor: colors.surface, borderColor: colors.border },
                                    focusedInput === 'email' && { borderColor: colors.primary },
                                    SHADOWS.sm
                                ]}>
                                    <Mail size={20} color={focusedInput === 'email' ? colors.primary : colors.textTertiary} />
                                    <TextInput
                                        style={[styles.input, { color: colors.textPrimary }]}
                                        placeholder="name@example.com"
                                        placeholderTextColor={colors.textQuaternary}
                                        value={email}
                                        onChangeText={setEmail}
                                        keyboardType="email-address"
                                        autoCapitalize="none"
                                        onFocus={() => setFocusedInput('email')}
                                        onBlur={() => setFocusedInput(null)}
                                    />
                                </View>
                            </View>

                            {/* Password Field */}
                            <View style={styles.fieldContainer}>
                                <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>סיסמה</Text>
                                <View style={[
                                    styles.inputContainer,
                                    { backgroundColor: colors.surface, borderColor: colors.border },
                                    focusedInput === 'password' && { borderColor: colors.primary },
                                    SHADOWS.sm
                                ]}>
                                    <Lock size={20} color={focusedInput === 'password' ? colors.primary : colors.textTertiary} />
                                    <TextInput
                                        style={[styles.input, { color: colors.textPrimary }]}
                                        placeholder="הזן סיסמה"
                                        placeholderTextColor={colors.textQuaternary}
                                        value={password}
                                        onChangeText={setPassword}
                                        secureTextEntry={!showPassword}
                                        onFocus={() => setFocusedInput('password')}
                                        onBlur={() => setFocusedInput(null)}
                                    />
                                    <TouchableOpacity
                                        onPress={() => setShowPassword(!showPassword)}
                                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                                    >
                                        {showPassword ? (
                                            <Eye size={20} color={colors.textTertiary} />
                                        ) : (
                                            <EyeOff size={20} color={colors.textTertiary} />
                                        )}
                                    </TouchableOpacity>
                                </View>
                            </View>

                            {/* Forgot Password */}
                            <TouchableOpacity style={styles.forgotPassword}>
                                <Text style={[styles.forgotPasswordText, { color: colors.primary }]}>
                                    שכחת סיסמה?
                                </Text>
                            </TouchableOpacity>

                            {/* Login Button */}
                            <TouchableOpacity
                                style={[styles.loginButton, { backgroundColor: colors.primary }]}
                                onPress={handleLogin}
                                activeOpacity={0.8}
                            >
                                <Text style={styles.loginButtonText}>התחבר</Text>
                            </TouchableOpacity>

                            {/* Divider */}
                            <View style={styles.divider}>
                                <View style={[styles.dividerLine, { backgroundColor: colors.separator }]} />
                                <Text style={[styles.dividerText, { color: colors.textTertiary }]}>או</Text>
                                <View style={[styles.dividerLine, { backgroundColor: colors.separator }]} />
                            </View>

                            {/* Apple Sign In Style Button */}
                            <TouchableOpacity
                                style={[styles.altButton, { backgroundColor: colors.surface, borderColor: colors.border }, SHADOWS.sm]}
                                activeOpacity={0.8}
                            >
                                <Text style={[styles.altButtonText, { color: colors.textPrimary }]}>
                                    המשך עם Face ID
                                </Text>
                            </TouchableOpacity>

                            {/* Sign Up */}
                            <View style={styles.signupContainer}>
                                <Text style={[styles.signupText, { color: colors.textTertiary }]}>
                                    אין לך חשבון?{' '}
                                </Text>
                                <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
                                    <Text style={[styles.signupLink, { color: colors.primary }]}>הרשם עכשיו</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
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
    keyboardView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: SPACING['2xl'],
        paddingBottom: SPACING['4xl'],
    },
    logoContainer: {
        alignItems: 'center',
        marginBottom: SPACING['4xl'],
    },
    logo: {
        width: 72,
        height: 72,
        borderRadius: RADIUS.xl,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: SPACING.lg,
    },
    logoText: {
        fontSize: 32,
        fontFamily: FONTS.bold,
        color: '#FFFFFF',
    },
    appName: {
        ...TYPOGRAPHY.title1,
    },
    titleContainer: {
        marginBottom: SPACING['3xl'],
    },
    title: {
        ...TYPOGRAPHY.largeTitle,
        marginBottom: SPACING.sm,
        textAlign: 'right',
    },
    subtitle: {
        ...TYPOGRAPHY.body,
        textAlign: 'right',
    },
    form: {},
    fieldContainer: {
        marginBottom: SPACING.xl,
    },
    fieldLabel: {
        ...TYPOGRAPHY.subhead,
        fontFamily: FONTS.medium,
        marginBottom: SPACING.sm,
        textAlign: 'right',
    },
    inputContainer: {
        flexDirection: 'row-reverse',
        alignItems: 'center',
        borderRadius: RADIUS.md,
        borderWidth: 1,
        paddingHorizontal: SPACING.lg,
        height: 52,
        gap: SPACING.md,
    },
    input: {
        flex: 1,
        ...TYPOGRAPHY.body,
        textAlign: 'right',
    },
    forgotPassword: {
        alignSelf: 'flex-end',
        marginBottom: SPACING['2xl'],
    },
    forgotPasswordText: {
        ...TYPOGRAPHY.subhead,
        fontFamily: FONTS.medium,
    },
    loginButton: {
        height: 52,
        borderRadius: RADIUS.md,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: SPACING.xl,
    },
    loginButtonText: {
        ...TYPOGRAPHY.headline,
        color: '#FFFFFF',
    },
    divider: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SPACING.xl,
    },
    dividerLine: {
        flex: 1,
        height: StyleSheet.hairlineWidth,
    },
    dividerText: {
        ...TYPOGRAPHY.caption1,
        marginHorizontal: SPACING.lg,
    },
    altButton: {
        height: 52,
        borderRadius: RADIUS.md,
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: SPACING['2xl'],
    },
    altButtonText: {
        ...TYPOGRAPHY.headline,
    },
    signupContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    signupText: {
        ...TYPOGRAPHY.subhead,
    },
    signupLink: {
        ...TYPOGRAPHY.subhead,
        fontFamily: FONTS.semiBold,
    },
});
