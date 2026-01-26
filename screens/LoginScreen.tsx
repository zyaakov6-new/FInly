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
    Dimensions,
    Animated,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { Mail, Lock, Eye, EyeOff, HelpCircle, Fingerprint, Sparkles, ArrowRight, Shield } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { FONTS, GRADIENTS, SHADOWS } from '../constants/theme';

const { width, height } = Dimensions.get('window');

export default function LoginScreen() {
    const navigation = useNavigation<any>();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [focusedInput, setFocusedInput] = useState<'email' | 'password' | null>(null);

    // Animations
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(50)).current;
    const logoScale = useRef(new Animated.Value(0.5)).current;
    const logoRotate = useRef(new Animated.Value(0)).current;
    const formSlide = useRef(new Animated.Value(30)).current;
    const buttonScale = useRef(new Animated.Value(1)).current;

    // Floating particles animation
    const particle1 = useRef(new Animated.Value(0)).current;
    const particle2 = useRef(new Animated.Value(0)).current;
    const particle3 = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        // Start entrance animations
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 800,
                useNativeDriver: true,
            }),
            Animated.spring(slideAnim, {
                toValue: 0,
                tension: 50,
                friction: 10,
                useNativeDriver: true,
            }),
            Animated.spring(logoScale, {
                toValue: 1,
                tension: 60,
                friction: 8,
                useNativeDriver: true,
            }),
            Animated.timing(formSlide, {
                toValue: 0,
                duration: 600,
                delay: 200,
                useNativeDriver: true,
            }),
        ]).start();

        // Floating particles animation loop
        const createFloatingAnimation = (animValue: Animated.Value, duration: number) => {
            Animated.loop(
                Animated.sequence([
                    Animated.timing(animValue, {
                        toValue: 1,
                        duration: duration,
                        useNativeDriver: true,
                    }),
                    Animated.timing(animValue, {
                        toValue: 0,
                        duration: duration,
                        useNativeDriver: true,
                    }),
                ])
            ).start();
        };

        createFloatingAnimation(particle1, 3000);
        createFloatingAnimation(particle2, 4000);
        createFloatingAnimation(particle3, 3500);
    }, []);

    const handleLogin = () => {
        // Button press animation
        Animated.sequence([
            Animated.timing(buttonScale, {
                toValue: 0.95,
                duration: 100,
                useNativeDriver: true,
            }),
            Animated.timing(buttonScale, {
                toValue: 1,
                duration: 100,
                useNativeDriver: true,
            }),
        ]).start(() => {
            navigation.replace('Main');
        });
    };

    return (
        <View style={styles.container}>
            <StatusBar style="light" />

            {/* Beautiful Gradient Background */}
            <LinearGradient
                colors={['#0F2027', '#203A43', '#2C5364']}
                style={styles.gradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            />

            {/* Floating Decorative Elements */}
            <View style={styles.decorationContainer}>
                <Animated.View
                    style={[
                        styles.floatingCircle,
                        styles.circle1,
                        {
                            transform: [
                                { translateY: particle1.interpolate({ inputRange: [0, 1], outputRange: [0, -20] }) },
                                { scale: particle1.interpolate({ inputRange: [0, 0.5, 1], outputRange: [1, 1.1, 1] }) },
                            ],
                        },
                    ]}
                />
                <Animated.View
                    style={[
                        styles.floatingCircle,
                        styles.circle2,
                        {
                            transform: [
                                { translateY: particle2.interpolate({ inputRange: [0, 1], outputRange: [0, 15] }) },
                                { translateX: particle2.interpolate({ inputRange: [0, 1], outputRange: [0, -10] }) },
                            ],
                        },
                    ]}
                />
                <Animated.View
                    style={[
                        styles.floatingCircle,
                        styles.circle3,
                        {
                            transform: [
                                { translateY: particle3.interpolate({ inputRange: [0, 1], outputRange: [0, -15] }) },
                            ],
                        },
                    ]}
                />
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Help Icon */}
                    <Animated.View style={[styles.helpContainer, { opacity: fadeAnim }]}>
                        <TouchableOpacity style={styles.helpButton}>
                            <HelpCircle size={22} color="rgba(255,255,255,0.5)" />
                        </TouchableOpacity>
                    </Animated.View>

                    {/* Animated Logo */}
                    <Animated.View style={[
                        styles.logoContainer,
                        {
                            opacity: fadeAnim,
                            transform: [
                                { translateY: slideAnim },
                                { scale: logoScale },
                            ],
                        }
                    ]}>
                        <LinearGradient
                            colors={GRADIENTS.primary}
                            style={styles.logo}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                        >
                            <Text style={styles.logoText}>F</Text>
                            <View style={styles.logoSparkle}>
                                <Sparkles size={16} color="rgba(255,255,255,0.8)" />
                            </View>
                        </LinearGradient>
                        <Text style={styles.appName}>Finly</Text>
                        <Text style={styles.appTagline}>ניהול פיננסי חכם</Text>
                    </Animated.View>

                    {/* Title */}
                    <Animated.View style={[
                        styles.titleContainer,
                        {
                            opacity: fadeAnim,
                            transform: [{ translateY: formSlide }],
                        }
                    ]}>
                        <Text style={styles.title}>ברוכים השבים</Text>
                        <Text style={styles.subtitle}>הזן את הפרטים שלך כדי להתחבר</Text>
                    </Animated.View>

                    {/* Form */}
                    <Animated.View style={[
                        styles.formContainer,
                        {
                            opacity: fadeAnim,
                            transform: [{ translateY: formSlide }],
                        }
                    ]}>
                        {/* Email Input */}
                        <View style={styles.inputContainer}>
                            <View style={[
                                styles.inputWrapper,
                                focusedInput === 'email' && styles.inputWrapperFocused
                            ]}>
                                <View style={styles.inputIconContainer}>
                                    <Mail size={20} color={focusedInput === 'email' ? '#FF6B6B' : 'rgba(255,255,255,0.4)'} />
                                </View>
                                <View style={styles.inputContent}>
                                    <Text style={[
                                        styles.labelInside,
                                        focusedInput === 'email' && styles.labelFocused
                                    ]}>אימייל</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="name@agency.com"
                                        placeholderTextColor="rgba(255,255,255,0.25)"
                                        value={email}
                                        onChangeText={setEmail}
                                        keyboardType="email-address"
                                        autoCapitalize="none"
                                        onFocus={() => setFocusedInput('email')}
                                        onBlur={() => setFocusedInput(null)}
                                    />
                                </View>
                            </View>
                        </View>

                        {/* Password Input */}
                        <View style={styles.inputContainer}>
                            <View style={[
                                styles.inputWrapper,
                                focusedInput === 'password' && styles.inputWrapperFocused
                            ]}>
                                <View style={styles.inputIconContainer}>
                                    <Lock size={20} color={focusedInput === 'password' ? '#FF6B6B' : 'rgba(255,255,255,0.4)'} />
                                </View>
                                <View style={styles.inputContent}>
                                    <Text style={[
                                        styles.labelInside,
                                        focusedInput === 'password' && styles.labelFocused
                                    ]}>סיסמה</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="••••••••"
                                        placeholderTextColor="rgba(255,255,255,0.25)"
                                        value={password}
                                        onChangeText={setPassword}
                                        secureTextEntry={!showPassword}
                                        onFocus={() => setFocusedInput('password')}
                                        onBlur={() => setFocusedInput(null)}
                                    />
                                </View>
                                <TouchableOpacity
                                    onPress={() => setShowPassword(!showPassword)}
                                    style={styles.eyeButton}
                                >
                                    {showPassword ? (
                                        <Eye size={20} color="rgba(255,255,255,0.5)" />
                                    ) : (
                                        <EyeOff size={20} color="rgba(255,255,255,0.5)" />
                                    )}
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Forgot Password */}
                        <TouchableOpacity style={styles.forgotPassword}>
                            <Text style={styles.forgotPasswordText}>שכחת סיסמה?</Text>
                        </TouchableOpacity>

                        {/* Login Button */}
                        <Animated.View style={[styles.loginButtonContainer, { transform: [{ scale: buttonScale }] }]}>
                            <TouchableOpacity
                                style={styles.loginButton}
                                onPress={handleLogin}
                                activeOpacity={0.9}
                            >
                                <LinearGradient
                                    colors={GRADIENTS.primary}
                                    style={styles.loginButtonGradient}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                >
                                    <Text style={styles.loginButtonText}>התחברות</Text>
                                    <ArrowRight size={20} color="#fff" style={{ transform: [{ rotate: '180deg' }] }} />
                                </LinearGradient>
                            </TouchableOpacity>
                        </Animated.View>

                        {/* Divider */}
                        <View style={styles.divider}>
                            <View style={styles.dividerLine} />
                            <Text style={styles.dividerText}>או המשך באמצעות</Text>
                            <View style={styles.dividerLine} />
                        </View>

                        {/* Biometric Options */}
                        <View style={styles.biometricContainer}>
                            <TouchableOpacity style={styles.biometricButton} activeOpacity={0.8}>
                                <LinearGradient
                                    colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']}
                                    style={styles.biometricGradient}
                                >
                                    <Shield size={26} color="rgba(255,255,255,0.7)" />
                                </LinearGradient>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.biometricButton} activeOpacity={0.8}>
                                <LinearGradient
                                    colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']}
                                    style={styles.biometricGradient}
                                >
                                    <Fingerprint size={26} color="rgba(255,255,255,0.7)" />
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>

                        {/* Sign Up Link */}
                        <View style={styles.signupContainer}>
                            <Text style={styles.signupText}>חדש בפלטפורמה? </Text>
                            <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
                                <Text style={styles.signupLink}>יצירת חשבון</Text>
                            </TouchableOpacity>
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
        backgroundColor: '#0F2027',
    },
    gradient: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
    },
    decorationContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    floatingCircle: {
        position: 'absolute',
        borderRadius: 999,
    },
    circle1: {
        width: 200,
        height: 200,
        backgroundColor: 'rgba(255, 107, 107, 0.08)',
        top: -50,
        right: -50,
    },
    circle2: {
        width: 150,
        height: 150,
        backgroundColor: 'rgba(78, 205, 196, 0.06)',
        top: height * 0.3,
        left: -60,
    },
    circle3: {
        width: 120,
        height: 120,
        backgroundColor: 'rgba(255, 230, 109, 0.05)',
        bottom: 100,
        right: -40,
    },
    keyboardView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: 28,
        paddingTop: 60,
        paddingBottom: 40,
    },
    helpContainer: {
        alignItems: 'flex-start',
        marginBottom: 20,
    },
    helpButton: {
        padding: 8,
    },
    logoContainer: {
        alignItems: 'center',
        marginBottom: 36,
    },
    logo: {
        width: 90,
        height: 90,
        borderRadius: 28,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
        ...SHADOWS.xlarge,
        shadowColor: '#FF6B6B',
    },
    logoText: {
        fontSize: 44,
        fontFamily: FONTS.bold,
        color: '#fff',
    },
    logoSparkle: {
        position: 'absolute',
        top: 8,
        right: 8,
    },
    appName: {
        fontSize: 28,
        fontFamily: FONTS.bold,
        color: '#fff',
        marginBottom: 4,
    },
    appTagline: {
        fontSize: 14,
        fontFamily: FONTS.regular,
        color: 'rgba(255,255,255,0.5)',
    },
    titleContainer: {
        marginBottom: 32,
    },
    title: {
        fontSize: 32,
        fontFamily: FONTS.bold,
        color: '#ffffff',
        textAlign: 'right',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 15,
        fontFamily: FONTS.regular,
        color: 'rgba(255,255,255,0.5)',
        textAlign: 'right',
        lineHeight: 22,
    },
    formContainer: {
        flex: 1,
    },
    inputContainer: {
        marginBottom: 18,
    },
    inputWrapper: {
        flexDirection: 'row-reverse',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.06)',
        borderRadius: 18,
        borderWidth: 1.5,
        borderColor: 'rgba(255,255,255,0.08)',
        paddingHorizontal: 18,
        paddingVertical: 14,
        minHeight: 76,
    },
    inputWrapperFocused: {
        borderColor: 'rgba(255, 107, 107, 0.5)',
        backgroundColor: 'rgba(255,255,255,0.08)',
    },
    inputIconContainer: {
        marginLeft: 14,
    },
    inputContent: {
        flex: 1,
    },
    labelInside: {
        fontSize: 12,
        fontFamily: FONTS.medium,
        color: 'rgba(255,255,255,0.5)',
        marginBottom: 4,
        textAlign: 'right',
    },
    labelFocused: {
        color: '#FF6B6B',
    },
    input: {
        fontSize: 16,
        fontFamily: FONTS.medium,
        color: '#ffffff',
        textAlign: 'right',
        padding: 0,
    },
    eyeButton: {
        padding: 8,
        marginRight: -8,
    },
    forgotPassword: {
        alignSelf: 'flex-end',
        marginBottom: 28,
    },
    forgotPasswordText: {
        fontSize: 14,
        fontFamily: FONTS.medium,
        color: 'rgba(255,255,255,0.6)',
    },
    loginButtonContainer: {
        marginBottom: 28,
    },
    loginButton: {
        borderRadius: 18,
        overflow: 'hidden',
        ...SHADOWS.large,
        shadowColor: '#FF6B6B',
    },
    loginButtonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 18,
        gap: 10,
    },
    loginButtonText: {
        fontSize: 18,
        fontFamily: FONTS.bold,
        color: '#fff',
    },
    divider: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 28,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: 'rgba(255,255,255,0.1)',
    },
    dividerText: {
        fontSize: 13,
        fontFamily: FONTS.regular,
        color: 'rgba(255,255,255,0.4)',
        marginHorizontal: 16,
    },
    biometricContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 20,
        marginBottom: 32,
    },
    biometricButton: {
        borderRadius: 18,
        overflow: 'hidden',
    },
    biometricGradient: {
        width: 64,
        height: 64,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        borderRadius: 18,
    },
    signupContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    signupText: {
        fontSize: 15,
        fontFamily: FONTS.regular,
        color: 'rgba(255,255,255,0.5)',
    },
    signupLink: {
        fontSize: 15,
        fontFamily: FONTS.bold,
        color: '#FF6B6B',
    },
});
