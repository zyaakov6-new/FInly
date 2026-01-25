import React, { useState } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { ArrowLeft, Car, Printer, Code, TrendingUp } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { FONTS } from '../constants/theme';
import { useUserProfile } from '../context/UserProfileContext';

const { width } = Dimensions.get('window');

const EXPENSE_CATEGORIES = [
    { id: 'transport', label: 'רכב ונסיעות', icon: <Car size={32} color="rgba(255,255,255,0.7)" /> },
    { id: 'office', label: 'ציוד משרדי', icon: <Printer size={32} color="rgba(255,255,255,0.7)" /> },
    { id: 'software', label: 'תוכנה ועגן', icon: <Code size={32} color="rgba(255,255,255,0.7)" /> },
    { id: 'marketing', label: 'שיווק ופרסום', icon: <TrendingUp size={32} color="rgba(255,255,255,0.7)" /> },
];

export default function SignupStep3Screen() {
    const navigation = useNavigation<any>();
    const { updateUserProfile } = useUserProfile();
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [autoTrack, setAutoTrack] = useState(true);

    const toggleCategory = (id: string) => {
        if (selectedCategories.includes(id)) {
            setSelectedCategories(selectedCategories.filter(c => c !== id));
        } else {
            setSelectedCategories([...selectedCategories, id]);
        }
    };

    const handleContinue = async () => {
        // Save expense preferences
        await updateUserProfile({
            expenseCategories: selectedCategories,
            autoTrackExpenses: autoTrack
        });
        navigation.navigate('SignupStep4' as never);
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
                    {/* Step Progress Indicator - Scrolls with content */}
                    <View style={styles.progressContainer}>
                        <View style={styles.progressSteps}>
                            <View style={[styles.progressStep, styles.progressStepActive]} />
                            <View style={[styles.progressStep, styles.progressStepActive]} />
                            <View style={[styles.progressStep, styles.progressStepActive]} />
                            <View style={styles.progressStep} />
                        </View>
                    </View>

                    {/* Back Button */}
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => navigation.goBack()}
                    >
                        <ArrowLeft size={24} color="rgba(255,255,255,0.8)" style={{ transform: [{ rotate: '180deg' }] }} />
                    </TouchableOpacity>

                    {/* Title */}
                    <Text style={styles.title}>ניהול הוצאות מוכרות</Text>
                    <Text style={styles.subtitle}></Text>

                    {/* Expense Categories Grid */}
                    <View style={styles.categoryGrid}>
                        {EXPENSE_CATEGORIES.map((category) => (
                            <TouchableOpacity
                                key={category.id}
                                style={[
                                    styles.categoryButton,
                                    selectedCategories.includes(category.id) && styles.categoryButtonActive,
                                ]}
                                onPress={() => toggleCategory(category.id)}
                                activeOpacity={0.7}
                            >
                                <View style={styles.categoryIcon}>
                                    {category.icon}
                                </View>
                                <Text
                                    style={[
                                        styles.categoryLabel,
                                        selectedCategories.includes(category.id) && styles.categoryLabelActive,
                                    ]}
                                >
                                    {category.label}
                                </Text>
                                {selectedCategories.includes(category.id) && (
                                    <View style={styles.categoryCheck}>
                                        <Text style={styles.categoryCheckText}>✓</Text>
                                    </View>
                                )}
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Auto-track Checkbox */}
                    <TouchableOpacity
                        style={styles.checkboxContainer}
                        onPress={() => setAutoTrack(!autoTrack)}
                        activeOpacity={0.7}
                    >
                        <View style={[styles.checkbox, autoTrack && styles.checkboxActive]}>
                            {autoTrack && <Text style={styles.checkboxCheck}>✓</Text>}
                        </View>
                        <Text style={styles.checkboxText}>
                            המערכת תזהה ותרשום אלו באופן אוטומטי ותשאיר אותן
                            לאישורך.
                        </Text>
                    </TouchableOpacity>

                    {/* Continue Button */}
                    <TouchableOpacity
                        style={styles.continueButton}
                        onPress={handleContinue}
                        activeOpacity={0.8}
                    >
                        <LinearGradient
                            colors={['#00ff88', '#00cc6f']}
                            style={styles.continueButtonGradient}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                        >
                            <Text style={styles.continueButtonText}>המשך</Text>
                            <ArrowLeft size={20} color="#0a3d2e" style={styles.arrowIcon} />
                        </LinearGradient>
                    </TouchableOpacity>

                    {/* Skip Link */}
                    <TouchableOpacity
                        style={styles.skipContainer}
                        onPress={() => navigation.navigate('SignupStep4' as never)}
                    >
                        <Text style={styles.skipText}>דלג לשלב הבא</Text>
                    </TouchableOpacity>
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
    progressContainer: {
        marginBottom: 32,
    },
    progressSteps: {
        flexDirection: 'row',
        gap: 8,
    },
    progressStep: {
        flex: 1,
        height: 4,
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 2,
    },
    progressStepActive: {
        backgroundColor: '#00ff88',
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
    backButton: {
        alignSelf: 'flex-start',
        padding: 8,
        marginBottom: 20,
    },
    title: {
        fontSize: 36,
        fontFamily: FONTS.bold,
        color: '#ffffff',
        textAlign: 'left',
        lineHeight: 44,
    },
    subtitle: {
        fontSize: 14,
        fontFamily: FONTS.regular,
        color: 'rgba(255,255,255,0.6)',
        textAlign: 'left',
        marginTop: 12,
        marginBottom: 40,
        lineHeight: 20,
    },
    categoryGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        marginBottom: 32,
    },
    categoryButton: {
        width: (width - 60) / 2,
        backgroundColor: 'rgba(255,255,255,0.08)',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        padding: 24,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 120,
        position: 'relative',
    },
    categoryButtonActive: {
        backgroundColor: 'rgba(0,255,136,0.15)',
        borderColor: '#00ff88',
        borderWidth: 2,
    },
    categoryIcon: {
        marginBottom: 12,
    },
    categoryLabel: {
        fontSize: 14,
        fontFamily: FONTS.medium,
        color: 'rgba(255,255,255,0.7)',
        textAlign: 'center',
    },
    categoryLabelActive: {
        color: '#00ff88',
    },
    categoryCheck: {
        position: 'absolute',
        top: 12,
        right: 12,
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#00ff88',
        alignItems: 'center',
        justifyContent: 'center',
    },
    categoryCheckText: {
        fontSize: 14,
        color: '#0a3d2e',
        fontFamily: FONTS.bold,
    },
    checkboxContainer: {
        flexDirection: 'row-reverse',
        alignItems: 'flex-start',
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 12,
        padding: 16,
        marginBottom: 32,
    },
    checkbox: {
        width: 24,
        height: 24,
        borderRadius: 6,
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.3)',
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 12,
        marginTop: 2,
    },
    checkboxActive: {
        backgroundColor: '#00ff88',
        borderColor: '#00ff88',
    },
    checkboxCheck: {
        fontSize: 14,
        color: '#0a3d2e',
        fontFamily: FONTS.bold,
    },
    checkboxText: {
        flex: 1,
        fontSize: 13,
        fontFamily: FONTS.regular,
        color: 'rgba(255,255,255,0.7)',
        textAlign: 'right',
        lineHeight: 20,
    },
    continueButton: {
        marginBottom: 16,
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: '#00ff88',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
        elevation: 8,
    },
    continueButtonGradient: {
        paddingVertical: 18,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    continueButtonText: {
        fontSize: 18,
        fontFamily: FONTS.bold,
        color: '#0a3d2e',
        marginRight: 8,
    },
    arrowIcon: {
        transform: [{ rotate: '0deg' }],
    },
    skipContainer: {
        alignItems: 'center',
        paddingVertical: 12,
    },
    skipText: {
        fontSize: 14,
        fontFamily: FONTS.regular,
        color: 'rgba(255,255,255,0.5)',
    },
});
