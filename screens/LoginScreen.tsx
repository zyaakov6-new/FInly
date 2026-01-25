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
    Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { Mail, Lock, Eye, EyeOff, HelpCircle, Fingerprint } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { FONTS } from '../constants/theme';

const { width } = Dimensions.get('window');

export default function LoginScreen() {
    const navigation = useNavigation<any>();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const handleLogin = () => {
        // Mock login - navigate to main
        navigation.replace('Main');
    };

    return (
        <View style={styles.container}>
            <StatusBar style="light" />

            {/* Dark Green Gradient Background */}
            <LinearGradient
                colors={['#0a3d2e', '#1a5c47', '#0a3d2e']}
                style={styles.gradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            />

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
                    <TouchableOpacity style={styles.helpButton}>
                        <HelpCircle size={24} color="rgba(255,255,255,0.6)" />
                    </TouchableOpacity>

                    {/* Logo */}
                    <View style={styles.logoContainer}>
                        <View style={styles.logo}>
                            <Text style={styles.logoText}>F</Text>
                        </View>
                    </View>

                    {/* Title */}
                    <Text style={styles.title}>ברוכים השבים</Text>
                    <Text style={styles.subtitle}>הזן את הפרטים שלך כדי להתחבר  </Text>

                    {/* Email Input */}
                    <View style={styles.inputContainer}>
                        <View style={styles.inputWrapper}>
                            <Mail size={20} color="rgba(255,255,255,0.5)" style={styles.inputIcon} />
                            <View style={styles.inputContent}>
                                <Text style={styles.labelInside}>אימייל</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="name@agency.com"
                                    placeholderTextColor="rgba(255,255,255,0.3)"
                                    value={email}
                                    onChangeText={setEmail}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                />
                            </View>
                        </View>
                    </View>

                    {/* Password Input */}
                    <View style={styles.inputContainer}>
                        <View style={styles.inputWrapper}>
                            <Lock size={20} color="rgba(255,255,255,0.5)" style={styles.inputIcon} />
                            <View style={styles.inputContent}>
                                <Text style={styles.labelInside}>סיסמה</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="••••••••"
                                    placeholderTextColor="rgba(255,255,255,0.3)"
                                    value={password}
                                    onChangeText={setPassword}
                                    secureTextEntry={!showPassword}
                                />
                            </View>
                            <TouchableOpacity
                                onPress={() => setShowPassword(!showPassword)}
                                style={styles.eyeIcon}
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
                    <TouchableOpacity
                        style={styles.loginButton}
                        onPress={handleLogin}
                        activeOpacity={0.8}
                    >
                        <LinearGradient
                            colors={['#00ff88', '#00cc6f']}
                            style={styles.loginButtonGradient}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                        >
                            <Text style={styles.loginButtonText}>התחברות</Text>
                        </LinearGradient>
                    </TouchableOpacity>

                    {/* Divider */}
                    <View style={styles.divider}>
                        <View style={styles.dividerLine} />
                        <Text style={styles.dividerText}>או המשך באמצעות</Text>
                        <View style={styles.dividerLine} />
                    </View>

                    {/* Biometric Options */}
                    <View style={styles.biometricContainer}>
                        <TouchableOpacity style={styles.biometricButton}>
                            <View style={styles.biometricIcon}>
                                <Text style={styles.biometricEmoji}>🔐</Text>
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.biometricButton}>
                            <Fingerprint size={28} color="rgba(255,255,255,0.6)" />
                        </TouchableOpacity>
                    </View>

                    {/* Sign Up Link */}
                    <View style={styles.signupContainer}>
                        <Text style={styles.signupText}>כבר יש לך חשבון? </Text>
                        <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
                            <Text style={styles.signupLink}>יצירת חשבון</Text>
                        </TouchableOpacity>
                        <Text style={styles.signupText}> חדש בפלטפורמה?</Text>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0a3d2e',
    },
    gradient: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
    },
    keyboardView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: 24,
        paddingTop: 60,
        paddingBottom: 40,
    },
    helpButton: {
        alignSelf: 'flex-start',
        padding: 8,
        marginBottom: 20,
    },
    logoContainer: {
        alignItems: 'center',
        marginBottom: 40,
    },
    logo: {
        width: 80,
        height: 80,
        borderRadius: 20,
        backgroundColor: '#00ff88',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#00ff88',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
        elevation: 8,
    },
    logoText: {
        fontSize: 40,
        fontFamily: FONTS.bold,
        color: '#0a3d2e',
    },
    title: {
        fontSize: 32,
        fontFamily: FONTS.bold,
        color: '#ffffff',
        textAlign: 'right',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 14,
        fontFamily: FONTS.regular,
        color: 'rgba(255,255,255,0.6)',
        textAlign: 'right',
        marginBottom: 40,
        lineHeight: 20,
    },
    inputContainer: {
        marginBottom: 20,
    },
    inputWrapper: {
        flexDirection: 'row-reverse',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.08)',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        paddingHorizontal: 16,
        paddingVertical: 12,
        minHeight: 72,
    },
    inputIcon: {
        marginLeft: 12,
        alignSelf: 'flex-start',
        marginTop: 8,
    },
    inputContent: {
        flex: 1,
    },
    labelInside: {
        fontSize: 12,
        fontFamily: FONTS.medium,
        color: 'rgba(255,255,255,0.6)',
        marginBottom: 4,
        textAlign: 'right',
    },
    input: {
        fontSize: 16,
        fontFamily: FONTS.regular,
        color: '#ffffff',
        textAlign: 'right',
        padding: 0,
    },
    eyeIcon: {
        padding: 8,
        marginRight: -8,
        alignSelf: 'flex-start',
        marginTop: 8,
    },
    forgotPassword: {
        alignSelf: 'flex-end',
        marginBottom: 32,
    },
    forgotPasswordText: {
        fontSize: 14,
        fontFamily: FONTS.medium,
        color: 'rgba(255,255,255,0.7)',
    },
    loginButton: {
        marginBottom: 32,
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: '#00ff88',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
        elevation: 8,
    },
    loginButtonGradient: {
        paddingVertical: 18,
        alignItems: 'center',
        justifyContent: 'center',
    },
    loginButtonText: {
        fontSize: 18,
        fontFamily: FONTS.bold,
        color: '#0a3d2e',
    },
    divider: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 32,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: 'rgba(255,255,255,0.1)',
    },
    dividerText: {
        fontSize: 14,
        fontFamily: FONTS.regular,
        color: 'rgba(255,255,255,0.5)',
        marginHorizontal: 16,
    },
    biometricContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 16,
        marginBottom: 32,
    },
    biometricButton: {
        width: 64,
        height: 64,
        borderRadius: 16,
        backgroundColor: 'rgba(255,255,255,0.08)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    biometricIcon: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    biometricEmoji: {
        fontSize: 28,
    },
    signupContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    signupText: {
        fontSize: 14,
        fontFamily: FONTS.regular,
        color: 'rgba(255,255,255,0.6)',
    },
    signupLink: {
        fontSize: 14,
        fontFamily: FONTS.bold,
        color: '#00ff88',
    },
});
