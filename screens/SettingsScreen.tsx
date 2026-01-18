import React, { useState } from 'react';
import {
    StyleSheet,
    Text,
    View,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Alert,
    Switch,
    Image,
    Modal,
    FlatList,
    KeyboardAvoidingView,
    Platform
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import {
    ChevronLeft,
    User,
    Users,
    Repeat,
    Building2,
    List,
    DollarSign,
    Bell,
    Database,
    Shield,
    HelpCircle,
    LogOut,
    Camera,
    ChevronDown,
    Plus,
    Trash2,
    Edit2,
    Save,
    X,
    MessageSquare,
    ExternalLink,
    Lock
} from 'lucide-react-native';
import { useTransactions } from '../context/TransactionsContext';
import { COLORS, FONTS } from '../constants/theme';

const SECTIONS = [
    { id: 'profile', title: 'פרופיל אישי', icon: User },
    { id: 'business', title: 'הגדרות עסק', icon: Building2 },
    { id: 'clients', title: 'ניהול לקוחות', icon: Users, navigate: 'Clients' },
    { id: 'recurring', title: 'עסקאות חוזרות', icon: Repeat, navigate: 'Recurring' },
    { id: 'categories', title: 'ניהול קטגוריות', icon: List },
    { id: 'prices', title: 'מחירים וחיובים', icon: DollarSign },
    { id: 'notifications', title: 'התראות (בקרוב)', icon: Bell, disabled: true },
    { id: 'backup', title: 'גיבוי וייצוא (בקרוב)', icon: Database, disabled: true },
    { id: 'security', title: 'פרטיות ואבטחה', icon: Shield },
    { id: 'about', title: 'אודות ועזרה', icon: HelpCircle },
];

const INDUSTRIES = [
    'עיצוב גרפי',
    'פיתוח תוכנה/אתרים',
    'שיווק ופרסום',
    'ייעוץ עסקי',
    'אירועים והפקות',
    'צילום ועריכה',
    'אדריכלות ועיצוב פנים',
    'עריכת דין',
    'הנהלת חשבונות',
    'אחר'
];

export default function SettingsScreen() {
    const insets = useSafeAreaInsets();
    const navigation = useNavigation<any>();
    const {
        userProfile,
        updateUserProfile,
        businessSettings,
        updateBusinessSettings,
        priceSettings,
        updatePriceSettings,
        categories,
        addCategory,
        deleteCategory,
        updateCategory
    } = useTransactions();

    const [activeSection, setActiveSection] = useState<string | null>(null);
    const [editingCategory, setEditingCategory] = useState<string | null>(null);
    const [tempCategoryName, setTempCategoryName] = useState('');
    const [newCategoryName, setNewCategoryName] = useState('');
    const [industryModalVisible, setIndustryModalVisible] = useState(false);

    // Render Helpers
    const toggleSection = (id: string) => {
        setActiveSection(activeSection === id ? null : id);
    };

    const handleCategoryUpdate = (oldName: string) => {
        if (tempCategoryName.trim()) {
            updateCategory(oldName, tempCategoryName.trim());
            setEditingCategory(null);
        }
    };

    const handleCategoryDelete = (category: string) => {
        Alert.alert(
            'מחיקת קטגוריה',
            `האם למחוק את הקטגוריה "${category}"?`,
            [
                { text: 'ביטול', style: 'cancel' },
                { text: 'מחק', style: 'destructive', onPress: () => deleteCategory(category) }
            ]
        );
    };

    const handleAddCategory = () => {
        if (newCategoryName.trim()) {
            addCategory(newCategoryName.trim());
            setNewCategoryName('');
        }
    };

    const handleDeleteAccount = () => {
        Alert.alert(
            'מחיקת חשבון',
            'זוהי פעולה בלתי הפיכה. האם אתה בטוח שברצונך למחוק את החשבון וכל הנתונים?',
            [
                { text: 'ביטול', style: 'cancel' },
                { text: 'מחק הכל', style: 'destructive', onPress: () => Alert.alert('החשבון נמחק') }
            ]
        );
    };

    return (
        <View style={styles.container}>
            <StatusBar style="light" backgroundColor={COLORS.background} />

            {/* Header */}
            <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <ChevronLeft size={28} color={COLORS.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>הגדרות</Text>
                <View style={{ width: 28 }} />
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

                    {/* User Profile Summary Card */}
                    <View style={styles.profileCard}>
                        <TouchableOpacity style={styles.avatarContainer}>
                            {userProfile.avatarUri ? (
                                <Image source={{ uri: userProfile.avatarUri }} style={styles.avatar} />
                            ) : (
                                <View style={[styles.avatar, styles.avatarPlaceholder]}>
                                    <Text style={styles.avatarInitials}>{userProfile.name.charAt(0)}</Text>
                                </View>
                            )}
                            <View style={styles.cameraIcon}>
                                <Camera size={14} color={COLORS.white} />
                            </View>
                        </TouchableOpacity>
                        <View style={styles.profileInfo}>
                            <Text style={styles.profileName}>{userProfile.name}</Text>
                            <Text style={styles.profileEmail}>{userProfile.email}</Text>
                        </View>
                    </View>

                    {/* Sections */}
                    {SECTIONS.map((section) => (
                        <View key={section.id} style={[styles.section, section.disabled && styles.sectionDisabled]}>
                            <TouchableOpacity
                                style={styles.sectionHeader}
                                onPress={() => {
                                    if (section.disabled) return;
                                    if ((section as any).navigate) {
                                        navigation.navigate((section as any).navigate);
                                    } else {
                                        toggleSection(section.id);
                                    }
                                }}
                                activeOpacity={section.disabled ? 1 : 0.7}
                            >
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                                    <View style={[styles.iconBox, section.disabled && { backgroundColor: '#2a2a2a' }]}>
                                        <section.icon size={20} color={section.disabled ? COLORS.textTertiary : COLORS.primary} />
                                    </View>
                                    <Text style={[styles.sectionTitle, section.disabled && { color: COLORS.textTertiary }]}>
                                        {section.title}
                                    </Text>
                                </View>
                                {!section.disabled && (
                                    <ChevronLeft
                                        size={20}
                                        color={COLORS.textTertiary}
                                        style={{ transform: [{ rotate: activeSection === section.id ? '-90deg' : '0deg' }] }}
                                    />
                                )}
                            </TouchableOpacity>

                            {activeSection === section.id && (
                                <View style={styles.sectionContent}>

                                    {/* 1. User Profile Inputs */}
                                    {section.id === 'profile' && (
                                        <View style={{ gap: 16 }}>
                                            <View style={styles.inputGroup}>
                                                <Text style={styles.label}>שם מלא</Text>
                                                <TextInput
                                                    style={styles.input}
                                                    value={userProfile.name}
                                                    onChangeText={(t) => updateUserProfile({ name: t })}
                                                />
                                            </View>
                                            <View style={styles.inputGroup}>
                                                <Text style={styles.label}>אימייל (לקריאה בלבד)</Text>
                                                <TextInput
                                                    style={[styles.input, styles.inputDisabled]}
                                                    value={userProfile.email}
                                                    editable={false}
                                                />
                                            </View>
                                            <View style={styles.inputGroup}>
                                                <Text style={styles.label}>טלפון</Text>
                                                <TextInput
                                                    style={styles.input}
                                                    value={userProfile.phone}
                                                    onChangeText={(t) => updateUserProfile({ phone: t })}
                                                    keyboardType="phone-pad"
                                                />
                                            </View>
                                            <View style={styles.inputGroup}>
                                                <Text style={styles.label}>תחום עיסוק</Text>
                                                <TouchableOpacity
                                                    style={styles.dropdownButton}
                                                    onPress={() => setIndustryModalVisible(true)}
                                                >
                                                    <Text style={styles.dropdownText}>{userProfile.industry}</Text>
                                                    <ChevronDown size={20} color={COLORS.textTertiary} />
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                    )}

                                    {/* 2. Business Settings Inputs */}
                                    {section.id === 'business' && (
                                        <View style={{ gap: 16 }}>
                                            <View style={styles.inputGroup}>
                                                <Text style={styles.label}>שם העסק</Text>
                                                <TextInput
                                                    style={styles.input}
                                                    value={businessSettings.name}
                                                    onChangeText={(t) => updateBusinessSettings({ name: t })}
                                                />
                                            </View>
                                            <View style={styles.inputGroup}>
                                                <Text style={styles.label}>מטבע (נעול: שקלים)</Text>
                                                <TextInput
                                                    style={[styles.input, styles.inputDisabled]}
                                                    value={'שקל חדש (₪)'}
                                                    editable={false}
                                                />
                                            </View>
                                            <View style={styles.inputGroup}>
                                                <Text style={styles.label}>ח.פ / עוסק מורשה</Text>
                                                <TextInput
                                                    style={styles.input}
                                                    value={businessSettings.taxId}
                                                    onChangeText={(t) => updateBusinessSettings({ taxId: t })}
                                                    keyboardType="numeric"
                                                />
                                            </View>
                                            <View style={styles.inputGroup}>
                                                <Text style={styles.label}>כתובת העסק</Text>
                                                <TextInput
                                                    style={styles.input}
                                                    value={businessSettings.address}
                                                    onChangeText={(t) => updateBusinessSettings({ address: t })}
                                                />
                                            </View>
                                        </View>
                                    )}

                                    {/* 3. Categories Management */}
                                    {section.id === 'categories' && (
                                        <View style={{ gap: 12 }}>
                                            {categories.map((cat, index) => (
                                                <View key={index} style={styles.categoryRow}>
                                                    {editingCategory === cat ? (
                                                        <View style={{ flex: 1, flexDirection: 'row', gap: 8 }}>
                                                            <TextInput
                                                                style={[styles.input, { flex: 1, paddingVertical: 8, height: 40 }]}
                                                                value={tempCategoryName}
                                                                onChangeText={setTempCategoryName}
                                                                autoFocus
                                                            />
                                                            <TouchableOpacity onPress={() => handleCategoryUpdate(cat)} style={styles.actionIcon}>
                                                                <Save size={20} color={COLORS.success} />
                                                            </TouchableOpacity>
                                                            <TouchableOpacity onPress={() => setEditingCategory(null)} style={styles.actionIcon}>
                                                                <X size={20} color={COLORS.danger} />
                                                            </TouchableOpacity>
                                                        </View>
                                                    ) : (
                                                        <>
                                                            <Text style={styles.categoryText}>{cat}</Text>
                                                            <View style={{ flexDirection: 'row', gap: 12 }}>
                                                                {cat !== 'אחר...' && (
                                                                    <>
                                                                        <TouchableOpacity
                                                                            onPress={() => {
                                                                                setEditingCategory(cat);
                                                                                setTempCategoryName(cat);
                                                                            }}
                                                                        >
                                                                            <Edit2 size={18} color={COLORS.primary} />
                                                                        </TouchableOpacity>
                                                                        <TouchableOpacity onPress={() => handleCategoryDelete(cat)}>
                                                                            <Trash2 size={18} color={COLORS.danger} />
                                                                        </TouchableOpacity>
                                                                    </>
                                                                )}
                                                            </View>
                                                        </>
                                                    )}
                                                </View>
                                            ))}
                                            <View style={[styles.inputGroup, { flexDirection: 'row', gap: 8, marginTop: 8 }]}>
                                                <TextInput
                                                    style={[styles.input, { flex: 1 }]}
                                                    placeholder="הוסף קטגוריה חדשה..."
                                                    placeholderTextColor={COLORS.textTertiary}
                                                    value={newCategoryName}
                                                    onChangeText={setNewCategoryName}
                                                />
                                                <TouchableOpacity
                                                    style={[styles.addButton, !newCategoryName.trim() && { opacity: 0.5 }]}
                                                    onPress={handleAddCategory}
                                                    disabled={!newCategoryName.trim()}
                                                >
                                                    <Plus size={24} color={COLORS.white} />
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                    )}

                                    {/* 4. Price Settings */}
                                    {section.id === 'prices' && (
                                        <View style={{ gap: 16 }}>
                                            <View style={styles.inputGroup}>
                                                <Text style={styles.label}>מחיר שירות ברירת מחדל (₪)</Text>
                                                <TextInput
                                                    style={styles.input}
                                                    value={priceSettings.defaultServicePrice}
                                                    onChangeText={(t) => updatePriceSettings({ defaultServicePrice: t })}
                                                    keyboardType="numeric"
                                                />
                                            </View>
                                            <View style={styles.inputGroup}>
                                                <Text style={styles.label}>תעריף שעתי (₪)</Text>
                                                <TextInput
                                                    style={styles.input}
                                                    value={priceSettings.hourlyRate}
                                                    onChangeText={(t) => updatePriceSettings({ hourlyRate: t })}
                                                    keyboardType="numeric"
                                                />
                                            </View>
                                            <View style={styles.inputGroup}>
                                                <Text style={styles.label}>שיעור מע״מ (%)</Text>
                                                <TextInput
                                                    style={styles.input}
                                                    value={priceSettings.taxRate.toString()}
                                                    onChangeText={(t) => updatePriceSettings({ taxRate: parseFloat(t) || 0 })}
                                                    keyboardType="numeric"
                                                />
                                            </View>
                                            <View style={styles.inputGroup}>
                                                <Text style={styles.label}>הנחה קבועה (%)</Text>
                                                <TextInput
                                                    style={styles.input}
                                                    value={priceSettings.defaultDiscount.toString()}
                                                    onChangeText={(t) => updatePriceSettings({ defaultDiscount: parseFloat(t) || 0 })}
                                                    keyboardType="numeric"
                                                />
                                            </View>
                                        </View>
                                    )}

                                    {/* 5. Privacy & Security */}
                                    {section.id === 'security' && (
                                        <View style={{ gap: 16 }}>
                                            <TouchableOpacity style={styles.linkRow}>
                                                <Lock size={20} color={COLORS.primary} />
                                                <Text style={styles.linkText}>שינוי סיסמה</Text>
                                                <ChevronLeft size={16} color={COLORS.textTertiary} />
                                            </TouchableOpacity>
                                            <TouchableOpacity style={styles.linkRow}>
                                                <ExternalLink size={20} color={COLORS.primary} />
                                                <Text style={styles.linkText}>מדיניות פרטיות</Text>
                                                <ChevronLeft size={16} color={COLORS.textTertiary} />
                                            </TouchableOpacity>
                                            <TouchableOpacity
                                                style={[styles.linkRow, { borderBottomWidth: 0 }]}
                                                onPress={handleDeleteAccount}
                                            >
                                                <Trash2 size={20} color={COLORS.danger} />
                                                <Text style={[styles.linkText, { color: COLORS.danger }]}>מחק חשבון (איזור סכנה)</Text>
                                            </TouchableOpacity>
                                        </View>
                                    )}

                                    {/* 6. About & Help */}
                                    {section.id === 'about' && (
                                        <View style={{ gap: 16 }}>
                                            <View style={styles.detailRow}>
                                                <Text style={styles.label}>גרסה</Text>
                                                <Text style={styles.value}>1.0.0 (Beta)</Text>
                                            </View>
                                            <TouchableOpacity style={styles.linkRow}>
                                                <MessageSquare size={20} color={COLORS.primary} />
                                                <Text style={styles.linkText}>צור קשר עם תמיכה</Text>
                                                <ChevronLeft size={16} color={COLORS.textTertiary} />
                                            </TouchableOpacity>
                                        </View>
                                    )}

                                </View>
                            )}
                        </View>
                    ))}

                    <TouchableOpacity style={styles.logoutButton} onPress={() => navigation.navigate('Login')}>
                        <LogOut size={20} color={COLORS.danger} />
                        <Text style={styles.logoutText}>התנתק</Text>
                    </TouchableOpacity>

                    <View style={{ height: 40 }} />
                </ScrollView>
            </KeyboardAvoidingView>

            {/* Industry Picker Modal */}
            <Modal visible={industryModalVisible} transparent animationType="fade">
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setIndustryModalVisible(false)}
                >
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>בחר תחום עיסוק</Text>
                        <FlatList
                            data={INDUSTRIES}
                            keyExtractor={(item) => item}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={styles.modalItem}
                                    onPress={() => {
                                        updateUserProfile({ industry: item });
                                        setIndustryModalVisible(false);
                                    }}
                                >
                                    <Text style={[
                                        styles.modalItemText,
                                        userProfile.industry === item && { color: COLORS.primary, fontFamily: FONTS.bold }
                                    ]}>{item}</Text>
                                    {userProfile.industry === item && <Text style={{ color: COLORS.primary }}>✓</Text>}
                                </TouchableOpacity>
                            )}
                        />
                    </View>
                </TouchableOpacity>
            </Modal>
        </View >
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingBottom: 20,
        backgroundColor: COLORS.background,
    },
    backButton: {
        padding: 8,
        borderRadius: 12,
        backgroundColor: COLORS.surface,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    headerTitle: {
        fontSize: 20,
        fontFamily: FONTS.bold,
        color: COLORS.textPrimary,
    },
    content: {
        padding: 20,
        paddingTop: 10,
        paddingBottom: 100,
    },
    profileCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.surface,
        padding: 16,
        borderRadius: 16,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    avatarContainer: {
        width: 60,
        height: 60,
        borderRadius: 30,
        marginRight: 16,
        marginLeft: 4,
    },
    avatar: {
        width: 60,
        height: 60,
        borderRadius: 30,
    },
    avatarPlaceholder: {
        backgroundColor: COLORS.primary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarInitials: {
        fontSize: 24,
        color: COLORS.white, // Keep white as it's on primary color
        fontFamily: FONTS.bold,
    },
    cameraIcon: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: COLORS.surface,
        borderRadius: 12,
        width: 24,
        height: 24,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: COLORS.background,
    },
    profileInfo: {
        flex: 1,
    },
    profileName: {
        fontSize: 18,
        color: COLORS.textPrimary,
        fontFamily: FONTS.bold,
        marginBottom: 4,
    },
    profileEmail: {
        fontSize: 14,
        color: COLORS.textTertiary,
        fontFamily: FONTS.regular,
    },
    section: {
        marginBottom: 16,
        backgroundColor: COLORS.surface,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: COLORS.border,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 3,
        elevation: 2,
    },
    sectionDisabled: {
        opacity: 0.6,
        backgroundColor: COLORS.background, // Or a slightly lighter generic bg
        borderColor: COLORS.border,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
    },
    iconBox: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: 'rgba(132, 101, 243, 0.1)', // Keep rgba or map to primary/alpha
        alignItems: 'center',
        justifyContent: 'center',
    },
    sectionTitle: {
        fontSize: 16,
        color: COLORS.textPrimary,
        fontFamily: FONTS.medium,
    },
    sectionContent: {
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
    },
    inputGroup: {
        marginBottom: 4,
    },
    label: {
        fontSize: 14,
        color: COLORS.textSecondary,
        marginBottom: 8,
        fontFamily: FONTS.regular,
    },
    input: {
        backgroundColor: COLORS.background,
        borderRadius: 12,
        padding: 12,
        color: COLORS.textPrimary,
        borderWidth: 1,
        borderColor: COLORS.border,
        fontFamily: FONTS.regular,
        textAlign: 'right'
    },
    inputDisabled: {
        opacity: 0.6,
        backgroundColor: COLORS.surface,
    },
    dropdownButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: COLORS.background,
        borderRadius: 12,
        padding: 12,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    dropdownText: {
        color: COLORS.textPrimary,
        fontFamily: FONTS.regular,
    },
    categoryRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    categoryText: {
        fontSize: 16,
        color: COLORS.textPrimary,
        fontFamily: FONTS.regular,
    },
    actionIcon: {
        padding: 4,
    },
    addButton: {
        backgroundColor: COLORS.primary,
        width: 48,
        height: 48,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    linkRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
        gap: 12
    },
    linkText: {
        fontSize: 16,
        color: COLORS.textPrimary,
        fontFamily: FONTS.regular,
        flex: 1,
        textAlign: 'left'
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    value: {
        fontSize: 16,
        color: COLORS.textPrimary,
        fontFamily: FONTS.medium,
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 24,
        gap: 8,
        padding: 16,
        backgroundColor: 'rgba(255, 82, 82, 0.1)',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(255, 82, 82, 0.3)',
    },
    logoutText: {
        color: COLORS.danger,
        fontSize: 16,
        fontFamily: FONTS.medium,
    },
    // Modal
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.7)',
        justifyContent: 'center',
        padding: 20
    },
    modalContent: {
        backgroundColor: COLORS.surface,
        borderRadius: 24,
        padding: 20,
        maxHeight: '70%',
    },
    modalTitle: {
        fontSize: 20,
        color: COLORS.textPrimary,
        fontFamily: FONTS.bold,
        marginBottom: 16,
        textAlign: 'center',
    },
    modalItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    modalItemText: {
        fontSize: 16,
        color: COLORS.textPrimary,
        fontFamily: FONTS.regular,
    }
});
