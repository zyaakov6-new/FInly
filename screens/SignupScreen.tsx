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
    useColorScheme,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Mail, User, ChevronRight } from 'lucide-react-native';
import { getColors, FONTS, SPACING, RADIUS, TYPOGRAPHY, LAYOUT } from '../constants/theme';
import { useUserProfile } from '../context/UserProfileContext';

export default function SignupScreen() {
    const navigation = useNavigation<any>();
    const insets = useSafeAreaInsets();
    const colorScheme = useColorScheme();
    const colors = getColors(colorScheme);
    const { updateUserProfile } = useUserProfile();

    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [focusedField, setFocusedField] = useState<string | null>(null);

    const handleContinue = async () => {
        await updateUserProfile({ fullName, email });
        navigation.navigate('SignupStep2');
    };

    const isValid = fullName.trim().length > 0 && email.trim().length > 0;

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />

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
                    {/* Progress */}
                    <View style={styles.progressContainer}>
                        <View style={[styles.progressStep, { backgroundColor: colors.primary }]} />
                        <View style={[styles.progressStep, { backgroundColor: colors.border }]} />
                        <View style={[styles.progressStep, { backgroundColor: colors.border }]} />
                        <View style={[styles.progressStep, { backgroundColor: colors.border }]} />
                    </View>

                    {/* Back Button */}
                    <TouchableOpacity
                        style={[styles.backButton, { backgroundColor: colors.surfaceSecondary }]}
                        onPress={() => navigation.goBack()}
                    >
                        <ChevronRight size={24} color={colors.textSecondary} />
                    </TouchableOpacity>

                    {/* Header */}
                    <View style={styles.headerSection}>
                        <Text style={[styles.title, { color: colors.textPrimary }]}>
                            יצירת חשבון
                        </Text>
                        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                            הזן את הפרטים שלך כדי להתחיל
                        </Text>
                    </View>

                    {/* Form */}
                    <View style={styles.form}>
                        {/* Full Name */}
                        <View style={styles.inputGroup}>
                            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
                                שם מלא
                            </Text>
                            <View style={[
                                styles.inputContainer,
                                {
                                    backgroundColor: colors.surfaceSecondary,
                                    borderColor: focusedField === 'name' ? colors.primary : colors.border
                                }
                            ]}>
                                <User
                                    size={20}
                                    color={focusedField === 'name' ? colors.primary : colors.textTertiary}
                                />
                                <TextInput
                                    style={[styles.input, { color: colors.textPrimary }]}
                                    placeholder="ישראל ישראלי"
                                    placeholderTextColor={colors.textQuaternary}
                                    value={fullName}
                                    onChangeText={setFullName}
                                    onFocus={() => setFocusedField('name')}
                                    onBlur={() => setFocusedField(null)}
                                />
                            </View>
                        </View>

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

                        {/* Continue Button */}
                        <TouchableOpacity
                            style={[
                                styles.continueButton,
                                { backgroundColor: isValid ? colors.primary : colors.fillSecondary }
                            ]}
                            onPress={handleContinue}
                            activeOpacity={0.8}
                            disabled={!isValid}
                        >
                            <Text style={[
                                styles.continueButtonText,
                                { color: isValid ? '#FFFFFF' : colors.textTertiary }
                            ]}>
                                המשך
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* Login Link */}
                    <View style={styles.loginSection}>
                        <Text style={[styles.loginText, { color: colors.textTertiary }]}>
                            כבר יש לך חשבון?{' '}
                        </Text>
                        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                            <Text style={[styles.loginLink, { color: colors.primary }]}>
                                התחבר
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
    progressContainer: {
        flexDirection: 'row',
        gap: SPACING.sm,
        marginBottom: SPACING['2xl'],
    },
    progressStep: {
        flex: 1,
        height: 4,
        borderRadius: 2,
    },
    backButton: {
        width: 44,
        height: 44,
        borderRadius: RADIUS.md,
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf: 'flex-start',
        marginBottom: SPACING['2xl'],
    },
    headerSection: {
        marginBottom: SPACING['3xl'],
    },
    title: {
        ...TYPOGRAPHY.h1,
        textAlign: 'right',
        marginBottom: SPACING.sm,
    },
    subtitle: {
        ...TYPOGRAPHY.body,
        textAlign: 'right',
    },
    form: {
        flex: 1,
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
    continueButton: {
        height: LAYOUT.buttonHeight,
        borderRadius: RADIUS.md,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: SPACING['2xl'],
    },
    continueButtonText: {
        ...TYPOGRAPHY.h4,
    },
    loginSection: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: SPACING['3xl'],
    },
    loginText: {
        ...TYPOGRAPHY.body,
    },
    loginLink: {
        ...TYPOGRAPHY.label,
    },
});
