import React, { useState } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TextInput,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';
import { getColors, FONTS, SPACING, RADIUS, TYPOGRAPHY, LAYOUT } from '../constants/theme';

export default function LoginScreen() {
    const navigation = useNavigation<any>();
    const insets = useSafeAreaInsets();
    const { resolvedTheme, isDark } = useTheme();
    const colors = getColors(resolvedTheme);

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [focusedField, setFocusedField] = useState<string | null>(null);

    const handleLogin = () => {
        navigation.replace('Main');
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <StatusBar style={isDark ? 'light' : 'dark'} />

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                <ScrollView
                    contentContainerStyle={[
                        styles.scrollContent,
                        { paddingTop: insets.top + 60, paddingBottom: insets.bottom + 40 }
                    ]}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Logo */}
                    <View style={styles.logoSection}>
                        <View style={[styles.logoContainer, { backgroundColor: colors.primary }]}>
                            <Text style={styles.logoText}>F</Text>
                        </View>
                        <Text style={[styles.appName, { color: colors.textPrimary }]}>Finly</Text>
                        <Text style={[styles.tagline, { color: colors.textTertiary }]}>
                            ניהול פיננסי חכם
                        </Text>
                    </View>

                    {/* Welcome Text */}
                    <View style={styles.welcomeSection}>
                        <Text style={[styles.welcomeTitle, { color: colors.textPrimary }]}>
                            ברוך הבא
                        </Text>
                        <Text style={[styles.welcomeSubtitle, { color: colors.textSecondary }]}>
                            היכנס לחשבון שלך כדי להמשיך
                        </Text>
                    </View>

                    {/* Form */}
                    <View style={styles.form}>
                        {/* Email */}
                        <View style={styles.inputGroup}>
                            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
                                אימייל
                            </Text>
                            <View style={[
                                styles.inputContainer,
                                {
                                    backgroundColor: colors.surfaceSecondary,
                                    borderColor: focusedField === 'email' ? colors.primary : colors.border
                                }
                            ]}>
                                <Mail
                                    size={20}
                                    color={focusedField === 'email' ? colors.primary : colors.textTertiary}
                                />
                                <TextInput
                                    style={[styles.input, { color: colors.textPrimary }]}
                                    placeholder="your@email.com"
                                    placeholderTextColor={colors.textQuaternary}
                                    value={email}
                                    onChangeText={setEmail}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    onFocus={() => setFocusedField('email')}
                                    onBlur={() => setFocusedField(null)}
                                />
                            </View>
                        </View>

                        {/* Password */}
                        <View style={styles.inputGroup}>
                            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
                                סיסמה
                            </Text>
                            <View style={[
                                styles.inputContainer,
                                {
                                    backgroundColor: colors.surfaceSecondary,
                                    borderColor: focusedField === 'password' ? colors.primary : colors.border
                                }
                            ]}>
                                <Lock
                                    size={20}
                                    color={focusedField === 'password' ? colors.primary : colors.textTertiary}
                                />
                                <TextInput
                                    style={[styles.input, { color: colors.textPrimary }]}
                                    placeholder="הזן סיסמה"
                                    placeholderTextColor={colors.textQuaternary}
                                    value={password}
                                    onChangeText={setPassword}
                                    secureTextEntry={!showPassword}
                                    onFocus={() => setFocusedField('password')}
                                    onBlur={() => setFocusedField(null)}
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
                        >
                            <Text style={[styles.biometricButtonText, { color: colors.textPrimary }]}>
                                המשך עם Face ID
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* Sign Up Link */}
                    <View style={styles.signupSection}>
                        <Text style={[styles.signupText, { color: colors.textTertiary }]}>
                            אין לך חשבון?{' '}
                        </Text>
                        <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
                            <Text style={[styles.signupLink, { color: colors.primary }]}>
                                הרשם עכשיו
                            </Text>
                        </TouchableOpacity>
                    </View>
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
        paddingHorizontal: LAYOUT.screenPadding,
    },
    logoSection: {
        alignItems: 'center',
        marginBottom: SPACING['4xl'],
    },
    logoContainer: {
        width: 64,
        height: 64,
        borderRadius: RADIUS.lg,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: SPACING.lg,
    },
    logoText: {
        fontSize: 28,
        fontFamily: FONTS.bold,
        color: '#FFFFFF',
    },
    appName: {
        ...TYPOGRAPHY.h2,
        marginBottom: SPACING.xs,
    },
    tagline: {
        ...TYPOGRAPHY.body,
    },
    welcomeSection: {
        marginBottom: SPACING['3xl'],
    },
    welcomeTitle: {
        ...TYPOGRAPHY.h1,
        textAlign: 'right',
        marginBottom: SPACING.sm,
    },
    welcomeSubtitle: {
        ...TYPOGRAPHY.body,
        textAlign: 'right',
    },
    form: {
        marginBottom: SPACING['3xl'],
    },
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
        borderRadius: RADIUS.md,
        borderWidth: 1,
        paddingHorizontal: SPACING.lg,
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
        ...TYPOGRAPHY.label,
    },
    loginButton: {
        height: LAYOUT.buttonHeight,
        borderRadius: RADIUS.md,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: SPACING.xl,
    },
    loginButtonText: {
        ...TYPOGRAPHY.h4,
        color: '#FFFFFF',
    },
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
    biometricButton: {
        height: LAYOUT.buttonHeight,
        borderRadius: RADIUS.md,
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    biometricButtonText: {
        ...TYPOGRAPHY.h4,
    },
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
    },
});
