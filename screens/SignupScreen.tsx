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
    ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { User, Mail, Phone, Calendar, Lock, Eye, EyeOff, ArrowLeft } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, FONTS } from '../constants/theme';

const { width, height } = Dimensions.get('window');

export default function SignupScreen() {
    const navigation = useNavigation<any>();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [dob, setDob] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isFocused, setIsFocused] = useState<string | null>(null);

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(30)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 800,
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

    const handleSignup = () => {
        navigation.replace('Onboarding');
    };

    const renderInput = (
        label: string,
        value: string,
        onChange: (text: string) => void,
        placeholder: string,
        icon: any,
        id: string,
        props: any = {}
    ) => (
        <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>{label}</Text>
            <View style={[styles.inputContainer, isFocused === id && styles.inputFocused]}>
                {icon && React.createElement(icon, { size: 18, color: COLORS.primary, style: styles.inputIcon })}
                <TextInput
                    style={styles.input}
                    placeholder={placeholder}
                    placeholderTextColor={COLORS.textTertiary}
                    value={value}
                    onChangeText={onChange}
                    onFocus={() => setIsFocused(id)}
                    onBlur={() => setIsFocused(null)}
                    textAlign="right" // Force right alignment
                    {...props}
                />
            </View>
        </View>
    );

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.container}>
                <StatusBar style="light" translucent={true} backgroundColor="transparent" />

                <View style={styles.background} />

                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                    style={styles.keyboardView}
                >
                    <ScrollView
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={[styles.scrollContent, { paddingTop: Platform.OS === 'ios' ? 100 : 80 }]}
                    >
                        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
                            <View style={styles.header}>
                                {/* Removed backButton as per user request for starting screen */}
                                <Text style={styles.title}>יצירת חשבון</Text>
                                <Text style={styles.subtitle}>הצטרף אלינו כדי לנהל את הכספים שלך בצורה חכמה.</Text>
                            </View>

                            <View style={styles.form}>
                                {renderInput('אימייל', email, setEmail, 'הכנס אימייל', Mail, 'email', { keyboardType: 'email-address', autoCapitalize: 'none' })}

                                <View style={styles.inputGroup}>
                                    <Text style={styles.inputLabel}>סיסמה</Text>
                                    <View style={[styles.inputContainer, isFocused === 'password' && styles.inputFocused]}>
                                        <Lock size={18} color={COLORS.primary} style={styles.inputIcon} />
                                        <TextInput
                                            style={styles.input}
                                            placeholder="הכנס סיסמה"
                                            placeholderTextColor={COLORS.textTertiary}
                                            value={password}
                                            onChangeText={setPassword}
                                            secureTextEntry={!showPassword}
                                            onFocus={() => setIsFocused('password')}
                                            onBlur={() => setIsFocused(null)}
                                            textAlign="right"
                                        />
                                        <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={{ paddingLeft: 10 }}>
                                            {showPassword ? <EyeOff size={18} color={COLORS.textSecondary} /> : <Eye size={18} color={COLORS.textSecondary} />}
                                        </TouchableOpacity>
                                    </View>
                                </View>

                                <View style={styles.inputGroup}>
                                    <Text style={styles.inputLabel}>אימות סיסמה</Text>
                                    <View style={[styles.inputContainer, isFocused === 'confirm' && styles.inputFocused]}>
                                        <Lock size={18} color={COLORS.primary} style={styles.inputIcon} />
                                        <TextInput
                                            style={styles.input}
                                            placeholder="הכנס סיסמה שוב"
                                            placeholderTextColor={COLORS.textTertiary}
                                            value={confirmPassword}
                                            onChangeText={setConfirmPassword}
                                            secureTextEntry={!showPassword}
                                            onFocus={() => setIsFocused('confirm')}
                                            onBlur={() => setIsFocused(null)}
                                            textAlign="right"
                                        />
                                    </View>
                                </View>

                                <TouchableOpacity
                                    style={styles.signupButton}
                                    onPress={handleSignup}
                                >
                                    <LinearGradient
                                        colors={COLORS.primaryGradient as [string, string, ...string[]]}
                                        style={styles.buttonGradient}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 1 }}
                                    >
                                        <Text style={styles.signupButtonText}>הרשמה</Text>
                                    </LinearGradient>
                                </TouchableOpacity>

                                {/* Social Buttons Sync */}
                                <View style={styles.footer}>
                                    <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                                        <Text style={styles.loginText}>התחברות</Text>
                                    </TouchableOpacity>
                                    <Text style={styles.footerText}>כבר יש לך חשבון?</Text>
                                </View>
                            </View>
                        </Animated.View>
                    </ScrollView>
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
    keyboardView: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 25,
        paddingTop: Platform.OS === 'ios' ? 70 : 50, // Reduced from 100/80
        paddingBottom: 40,
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
        width: '100%',
        alignSelf: 'stretch',
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
        backgroundColor: 'rgba(167, 139, 250, 0.08)',
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
    signupButton: {
        height: 60,
        borderRadius: 30,
        overflow: 'hidden',
        marginTop: 20,
        marginBottom: 30,
    },
    buttonGradient: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.primary,
    },
    signupButtonText: {
        color: COLORS.white,
        fontSize: 18,
        fontFamily: FONTS.bold,
        textShadowColor: 'rgba(0, 0, 0, 0.2)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 4,
    },
    footer: {
        flexDirection: 'row-reverse', // RTL Reverse = Start from Left. Button (Left) ... Text (Right)
        justifyContent: 'space-between',
        marginTop: 30,
        alignItems: 'center',
    },
    footerText: {
        color: COLORS.textSecondary,
        fontSize: 15,
        fontFamily: FONTS.regular,
        textAlign: 'right',
        writingDirection: 'rtl',
    },
    loginText: {
        color: COLORS.primary,
        fontSize: 15,
        fontFamily: FONTS.medium,
        textAlign: 'left',
    },
});
