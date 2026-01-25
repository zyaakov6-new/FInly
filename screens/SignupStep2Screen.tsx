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
import { ArrowLeft, Briefcase, TrendingUp, Code, Palette, Edit3 } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { FONTS } from '../constants/theme';
import { useUserProfile } from '../context/UserProfileContext';

const { width } = Dimensions.get('window');

const BUSINESS_CATEGORIES = [
    { id: 'lab', label: 'מעבדת', icon: <Briefcase size={24} color="rgba(255,255,255,0.7)" /> },
    { id: 'design', label: 'מפתח/ת', icon: <Code size={24} color="rgba(255,255,255,0.7)" /> },
    { id: 'marketing', label: 'עיצוב/ת', icon: <Palette size={24} color="rgba(255,255,255,0.7)" /> },
    { id: 'consulting', label: 'מחבר/ת', icon: <TrendingUp size={24} color="rgba(255,255,255,0.7)" /> },
    { id: 'other', label: 'אחר', icon: <Edit3 size={24} color="rgba(255,255,255,0.7)" /> },
];

export default function SignupStep2Screen() {
    const navigation = useNavigation<any>();
    const { updateUserProfile } = useUserProfile();
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [customCategory, setCustomCategory] = useState('');

    const handleCategorySelect = (id: string) => {
        setSelectedCategory(id);
        if (id !== 'other') {
            setCustomCategory('');
        }
    };

    const handleContinue = async () => {
        // Save business category data
        const categoryToSave = selectedCategory === 'other' ? customCategory : selectedCategory;
        await updateUserProfile({
            businessCategory: categoryToSave || '',
            customCategory: selectedCategory === 'other' ? customCategory : undefined
        });
        navigation.navigate('SignupStep3' as never);
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
                            <View style={styles.progressStep} />
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
                    <Text style={styles.title}>הצטרף לעידן החדש של בנקאות לעצמאיים</Text>
                    <Text></Text>
                    <Text></Text>
                    {/* Business Category Selection */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>קטגוריית עסק</Text>
                        <View style={styles.categoryGrid}>
                            {BUSINESS_CATEGORIES.map((category) => (
                                <TouchableOpacity
                                    key={category.id}
                                    style={[
                                        styles.categoryButton,
                                        selectedCategory === category.id && styles.categoryButtonActive,
                                    ]}
                                    onPress={() => handleCategorySelect(category.id)}
                                    activeOpacity={0.7}
                                >
                                    <View style={styles.categoryIcon}>
                                        {category.icon}
                                    </View>
                                    <Text
                                        style={[
                                            styles.categoryLabel,
                                            selectedCategory === category.id && styles.categoryLabelActive,
                                        ]}
                                    >
                                        {category.label}
                                    </Text>
                                    {selectedCategory === category.id && (
                                        <View style={styles.categoryCheck}>
                                            <Text style={styles.categoryCheckText}>✓</Text>
                                        </View>
                                    )}
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {/* Custom Category Input - Shows when "Other" is selected */}
                    {selectedCategory === 'other' && (
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>מה תחום העיסוק שלך?</Text>
                            <View style={styles.inputWrapper}>
                                <TextInput
                                    style={styles.input}
                                    placeholder="לדוגמה: צלם, מאמן כושר, יועץ משכנתאות..."
                                    placeholderTextColor="rgba(255,255,255,0.3)"
                                    value={customCategory}
                                    onChangeText={setCustomCategory}
                                    autoFocus
                                />
                            </View>
                        </View>
                    )}

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
    section: {
        marginBottom: 28,
    },
    sectionTitle: {
        fontSize: 14,
        fontFamily: FONTS.medium,
        color: 'rgba(255,255,255,0.8)',
        marginBottom: 12,
        textAlign: 'left',
    },
    categoryGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    categoryButton: {
        width: (width - 60) / 2,
        backgroundColor: 'rgba(255,255,255,0.08)',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        padding: 20,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 110,
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
    inputWrapper: {
        backgroundColor: 'rgba(255,255,255,0.08)',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        paddingHorizontal: 16,
        paddingVertical: 16,
        minHeight: 56,
    },
    input: {
        fontSize: 16,
        fontFamily: FONTS.regular,
        color: '#ffffff',
        textAlign: 'left',
    },
    continueButton: {
        marginTop: 40,
        marginBottom: 24,
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
    loginContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    loginText: {
        fontSize: 14,
        fontFamily: FONTS.regular,
        color: 'rgba(255,255,255,0.6)',
    },
    loginLink: {
        fontSize: 14,
        fontFamily: FONTS.bold,
        color: '#00ff88',
    },
});
