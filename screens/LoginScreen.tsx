import React, { useState, useEffect, useRef } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TextInput,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    TouchableWithoutFeedback,
    Keyboard,
    Animated,
    I18nManager,
    Dimensions,
    Switch,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { Chrome as Google, Apple, Mail, Lock, Eye, EyeOff, ArrowLeft } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, FONTS } from '../constants/theme';
import i18n from '../i18n';

const { width, height } = Dimensions.get('window');

// Background Phoenix Visual Component
const PhoenixVisuals = () => (
    <View style={styles.phoenixContainer}>
        <View style={[styles.phoenixArrow, { height: height * 0.4, right: width * 0.1, opacity: 0.2 }]} />
        <View style={[styles.phoenixArrow, { height: height * 0.5, right: width * 0.3, opacity: 0.3, bottom: -50 }]} />
        <View style={[styles.phoenixArrow, { height: height * 0.3, right: width * 0.5, opacity: 0.1, bottom: 20 }]} />
        <View style={[styles.phoenixArrow, { height: height * 0.6, right: width * 0.05, opacity: 0.15, bottom: -100 }]} />
    </View>
);

export default function LoginScreen() {
    const navigation = useNavigation<any>();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [isFocused, setIsFocused] = useState<string | null>(null);

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(30)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 1000,
                useNativeDriver: true,
            }),
            Animated.spring(slideAnim, {
                toValue: 0,
                tension: 20,
                friction: 7,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    const handleLogin = () => {
        navigation.replace('Main');
    };

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.container}>
                <StatusBar style="light" translucent={true} backgroundColor="transparent" />

                {/* Background Gradient */}
                <View style={styles.background} />

                <PhoenixVisuals />

                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                    style={styles.keyboardView}
                >
                    <Animated.View
                        style={[
                            styles.content,
                            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
                        ]}
                    >
                        {/* Header Section */}
                        <View style={styles.header}>
                            {/* Removed backButton as per user request for starting screen */}
                            <Text style={styles.title}>{i18n.t('welcomeTitle')}</Text>
                            <Text style={styles.subtitle}>{i18n.t('welcomeSubtitle')}</Text>
                        </View>

                        {/* Form Section */}
                        <View style={styles.form}>
                            {/* Email Input */}
                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>{i18n.t('emailLabel')}</Text>
                                <View style={[styles.inputContainer, isFocused === 'email' && styles.inputFocused]}>
                                    <Mail size={18} color={COLORS.primary} style={styles.inputIcon} />
                                    <TextInput
                                        style={styles.input}
                                        placeholder={i18n.t('emailPlaceholder')}
                                        placeholderTextColor={COLORS.textTertiary}
                                        value={email}
                                        onChangeText={setEmail}
                                        onFocus={() => setIsFocused('email')}
                                        onBlur={() => setIsFocused(null)}
                                        textAlign="right"
                                        keyboardType="email-address"
                                        autoCapitalize="none"
                                    />
                                </View>
                            </View>

                            {/* Password Input */}
                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>{i18n.t('passwordLabel')}</Text>
                                <View style={[styles.inputContainer, isFocused === 'password' && styles.inputFocused]}>
                                    <Lock size={18} color={COLORS.primary} style={styles.inputIcon} />
                                    <TextInput
                                        style={styles.input}
                                        placeholder={i18n.t('passwordPlaceholder')}
                                        placeholderTextColor={COLORS.textTertiary}
                                        value={password}
                                        onChangeText={setPassword}
                                        secureTextEntry={!showPassword}
                                        onFocus={() => setIsFocused('password')}
                                        onBlur={() => setIsFocused(null)}
                                        textAlign="right"
                                    />
                                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={{ paddingLeft: 10 }}>
                                        {showPassword ? <EyeOff size={18} color={COLORS.textTertiary} /> : <Eye size={18} color={COLORS.textTertiary} />}
                                    </TouchableOpacity>
                                </View>
                            </View>

                            {/* Remember & Forgot */}
                            <View style={styles.optionsRow}>
                                <View style={styles.rememberMe}>
                                    <Switch
                                        value={rememberMe}
                                        onValueChange={setRememberMe}
                                        trackColor={{ false: '#333', true: COLORS.primary }}
                                        thumbColor={Platform.OS === 'ios' ? COLORS.white : rememberMe ? '#DDD' : '#999'}
                                    />
                                    <Text style={styles.optionText}>{i18n.t('rememberMe')}</Text>
                                </View>
                                <TouchableOpacity>
                                    <Text style={styles.forgotText}>{i18n.t('forgotPassword')}</Text>
                                </TouchableOpacity>
                            </View>

                            {/* Login Button */}
                            <TouchableOpacity
                                style={styles.loginButton}
                                onPress={handleLogin}
                            >
                                <LinearGradient
                                    colors={COLORS.primaryGradient as [string, string, ...string[]]}
                                    style={styles.buttonGradient}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                >
                                    <Text style={styles.loginButtonText}>{i18n.t('loginButton')}</Text>
                                </LinearGradient>
                            </TouchableOpacity>

                            {/* Divider */}
                            <View style={styles.dividerRow}>
                                <View style={styles.dividerLine} />
                                <Text style={styles.dividerText}>{i18n.t('orLoginWith')}</Text>
                                <View style={styles.dividerLine} />
                            </View>

                            {/* Social Buttons */}
                            <View style={styles.socialRow}>
                                <TouchableOpacity style={styles.socialButton}>
                                    <Google size={20} color={COLORS.textPrimary} />
                                    <Text style={styles.socialText}>Google</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.socialButton}>
                                    <Apple size={20} color={COLORS.textPrimary} />
                                    <Text style={styles.socialText}>Apple</Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Footer */}
                        <View style={styles.footer}>
                            <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
                                <Text style={styles.signupText}>{i18n.t('signupLink')}</Text>
                            </TouchableOpacity>
                            <Text style={styles.footerText}>{i18n.t('noAccount')}</Text>
                        </View>
                    </Animated.View>
                </KeyboardAvoidingView>
            </View>
        </TouchableWithoutFeedback>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    background: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: COLORS.background,
    },
    phoenixContainer: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'flex-end',
    },
    phoenixArrow: {
        position: 'absolute',
        width: 40,
        backgroundColor: COLORS.primary,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        bottom: -20,
        // Glow effect
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 15,
        elevation: 10,
    },
    keyboardView: {
        flex: 1,
        paddingHorizontal: 25,
        paddingTop: Platform.OS === 'ios' ? 100 : 80,
        justifyContent: 'center',
    },
    content: {
        width: '100%',
    },
    header: {
        marginBottom: 40,
        alignItems: 'flex-start', // Start = Right in RTL
        width: '100%',
    },
    title: {
        fontSize: 34,
        color: COLORS.textPrimary,
        textAlign: 'left', // In RTL mode, 'left' = Start = Visual Right
        writingDirection: 'rtl',
        fontFamily: FONTS.bold,
        letterSpacing: -0.5,
    },
    subtitle: {
        fontSize: 16,
        color: COLORS.textSecondary,
        textAlign: 'left', // In RTL mode, 'left' = Start = Visual Right
        writingDirection: 'rtl',
        marginTop: 8,
        fontFamily: FONTS.regular,
        lineHeight: 24,
    },
    form: {
        width: '100%',
    },
    inputGroup: {
        marginBottom: 20,
    },
    inputLabel: {
        color: COLORS.textPrimary,
        fontSize: 15,
        marginBottom: 10,
        textAlign: 'right',
        writingDirection: 'rtl',
        fontFamily: FONTS.medium,
        width: '100%',
    },
    inputContainer: {
        flexDirection: 'row-reverse',
        alignItems: 'center',
        height: 58,
        backgroundColor: COLORS.surface,
        borderRadius: 16,
        paddingHorizontal: 15,
        borderWidth: 1,
        borderColor: COLORS.border,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    inputFocused: {
        borderColor: COLORS.primary,
        backgroundColor: 'rgba(0, 212, 170, 0.08)', // Using primary color with opacity
    },
    inputIcon: {
        marginRight: 12, // Gap for RTL icon (now on the right)
    },
    input: {
        flex: 1,
        color: COLORS.textPrimary,
        fontSize: 16,
        fontFamily: FONTS.regular,
        textAlign: 'right',
    },
    optionsRow: {
        flexDirection: 'row-reverse',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 30,
    },
    rememberMe: {
        flexDirection: 'row-reverse',
        alignItems: 'center',
    },
    optionText: {
        color: COLORS.textPrimary,
        fontSize: 15,
        marginRight: 10, // RTL gap
        fontFamily: FONTS.regular,
    },
    forgotText: {
        color: COLORS.textSecondary,
        fontSize: 15,
        fontFamily: FONTS.medium,
    },
    loginButton: {
        height: 60,
        borderRadius: 30,
        overflow: 'hidden',
        marginBottom: 30,
    },
    buttonGradient: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.primary,
    },
    loginButtonText: {
        color: COLORS.white,
        fontSize: 18,
        fontFamily: FONTS.bold,
        textShadowColor: 'rgba(0, 0, 0, 0.2)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 4,
    },
    dividerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 30,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: COLORS.border,
    },
    dividerText: {
        color: COLORS.textTertiary,
        fontSize: 14,
        marginHorizontal: 15,
        fontFamily: FONTS.regular,
        textAlign: 'right',
    },
    socialRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    socialButton: {
        flex: 0.48,
        height: 58,
        borderRadius: 16,
        backgroundColor: COLORS.surface,
        borderWidth: 1,
        borderColor: COLORS.border,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    socialText: {
        color: COLORS.textPrimary,
        fontSize: 16,
        marginLeft: 10,
        fontFamily: FONTS.medium,
    },
    footer: {
        flexDirection: 'row-reverse', // RTL Reverse = Start from Left. Button (Left) ... Text (Right)
        justifyContent: 'space-between',
        marginTop: 40,
        alignItems: 'center',
    },
    footerText: {
        color: COLORS.textSecondary,
        fontSize: 15,
        fontFamily: FONTS.regular,
        textAlign: 'right',
        writingDirection: 'rtl',
    },
    signupText: {
        color: COLORS.primary,
        fontSize: 15,
        fontFamily: FONTS.medium,
        textAlign: 'left',
    },
});
