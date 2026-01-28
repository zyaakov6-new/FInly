import React, { useState } from 'react';
import {
    StyleSheet,
    Text,
    View,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Image,
    Modal,
    FlatList,
    KeyboardAvoidingView,
    Platform,
    Switch,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import {
    ChevronLeft,
    ChevronRight,
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
    Lock,
    Sun,
    Moon,
    Smartphone,
    Palette,
    Receipt,
    Clock,
} from 'lucide-react-native';
import { useTransactions } from '../context/TransactionsContext';
import { useNotification } from '../context/NotificationContext';
import { useTheme, ThemeMode } from '../context/ThemeContext';
import { useUserProfile } from '../context/UserProfileContext';
import { getColors, FONTS, SPACING, RADIUS, SHADOWS, TYPOGRAPHY, LAYOUT } from '../constants/theme';

const SECTIONS = [
    { id: 'profile', title: 'פרופיל אישי', icon: User },
    { id: 'appearance', title: 'מראה ותצוגה', icon: Palette },
    { id: 'business', title: 'הגדרות עסק', icon: Building2 },
    { id: 'clients', title: 'ניהול לקוחות', icon: Users, navigate: 'Clients' },
    { id: 'recurring', title: 'עסקאות חוזרות', icon: Repeat, navigate: 'Recurring' },
    { id: 'templates', title: 'תבניות חשבוניות', icon: List, navigate: 'InvoiceTemplates' },
    { id: 'categories', title: 'ניהול קטגוריות', icon: List },
    { id: 'prices', title: 'מחירים וחיובים', icon: DollarSign },
    { id: 'notifications', title: 'התראות ותזכורות', icon: Bell },
    { id: 'backup', title: 'גיבוי וייצוא (בקרוב)', icon: Database, disabled: true },
    { id: 'security', title: 'פרטיות ואבטחה', icon: Shield },
    { id: 'about', title: 'אודות ועזרה', icon: HelpCircle },
];

const THEME_OPTIONS: { value: ThemeMode; label: string; icon: any }[] = [
    { value: 'light', label: 'בהיר', icon: Sun },
    { value: 'dark', label: 'כהה', icon: Moon },
    { value: 'system', label: 'לפי המערכת', icon: Smartphone },
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
    const { resolvedTheme, themeMode, setThemeMode, isDark } = useTheme();
    const colors = getColors(resolvedTheme);
    const { showDeleteConfirm, showSuccess } = useNotification();
    const { userProfile, updateUserProfile: updateUserProfileContext } = useUserProfile();

    const {
        userProfile: legacyProfile,
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

    // Use persisted settings from context
    const receiptReminders = userProfile?.receiptReminders ?? true;
    const expenseReminders = userProfile?.expenseReminders ?? true;

    const setReceiptReminders = (value: boolean) => {
        updateUserProfileContext({ receiptReminders: value });
    };

    const setExpenseReminders = (value: boolean) => {
        updateUserProfileContext({ expenseReminders: value });
    };

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
        showDeleteConfirm(
            'מחיקת קטגוריה',
            `האם למחוק את הקטגוריה "${category}"?`,
            () => deleteCategory(category)
        );
    };

    const handleAddCategory = () => {
        if (newCategoryName.trim()) {
            addCategory(newCategoryName.trim());
            setNewCategoryName('');
        }
    };

    const handleDeleteAccount = () => {
        showDeleteConfirm(
            'מחיקת חשבון',
            'זוהי פעולה בלתי הפיכה. האם אתה בטוח שברצונך למחוק את החשבון וכל הנתונים?',
            () => showSuccess('החשבון נמחק', 'כל הנתונים נמחקו בהצלחה')
        );
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <StatusBar style={isDark ? 'light' : 'dark'} />

            {/* Header */}
            <View style={[styles.header, { paddingTop: insets.top + SPACING.md }]}>
                <View style={{ width: 44 }} />
                <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>הגדרות</Text>
                <View style={{ width: 44 }} />
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={{ flex: 1 }}
            >
                <ScrollView
                    contentContainerStyle={styles.content}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Profile Card */}
                    <View style={[styles.profileCard, { backgroundColor: colors.surface }, SHADOWS.sm]}>
                        <TouchableOpacity style={styles.avatarContainer}>
                            {userProfile?.profilePicture ? (
                                <Image source={{ uri: userProfile.profilePicture }} style={styles.avatar} />
                            ) : (
                                <View style={[styles.avatar, styles.avatarPlaceholder, { backgroundColor: colors.primary }]}>
                                    <Text style={styles.avatarInitials}>{(userProfile?.fullName || 'U').charAt(0)}</Text>
                                </View>
                            )}
                            <View style={[styles.cameraIcon, { backgroundColor: colors.surface, borderColor: colors.background }]}>
                                <Camera size={12} color={colors.textSecondary} />
                            </View>
                        </TouchableOpacity>
                        <View style={styles.profileInfo}>
                            <Text style={[styles.profileName, { color: colors.textPrimary }]}>{userProfile?.fullName || 'משתמש'}</Text>
                            <Text style={[styles.profileEmail, { color: colors.textTertiary }]}>{userProfile?.email || ''}</Text>
                        </View>
                    </View>

                    {/* Sections */}
                    {SECTIONS.map((section) => (
                        <View
                            key={section.id}
                            style={[
                                styles.section,
                                { backgroundColor: colors.surface },
                                SHADOWS.sm,
                                section.disabled && { opacity: 0.5 }
                            ]}
                        >
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
                                <View style={styles.sectionLeft}>
                                    <View style={[styles.iconBox, { backgroundColor: colors.primaryMuted }]}>
                                        <section.icon size={18} color={section.disabled ? colors.textTertiary : colors.primary} />
                                    </View>
                                    <Text style={[styles.sectionTitle, { color: section.disabled ? colors.textTertiary : colors.textPrimary }]}>
                                        {section.title}
                                    </Text>
                                </View>
                                {!section.disabled && (
                                    <ChevronLeft
                                        size={18}
                                        color={colors.textTertiary}
                                        style={{ transform: [{ rotate: activeSection === section.id ? '-90deg' : '0deg' }] }}
                                    />
                                )}
                            </TouchableOpacity>

                            {activeSection === section.id && (
                                <View style={[styles.sectionContent, { borderTopColor: colors.border }]}>
                                    {section.id === 'profile' && (
                                        <View style={styles.inputList}>
                                            <View style={styles.inputGroup}>
                                                <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>שם מלא</Text>
                                                <TextInput
                                                    style={[styles.input, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border, color: colors.textPrimary }]}
                                                    value={userProfile?.fullName || ''}
                                                    onChangeText={(t) => updateUserProfileContext({ fullName: t })}
                                                />
                                            </View>
                                            <View style={styles.inputGroup}>
                                                <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>אימייל</Text>
                                                <TextInput
                                                    style={[styles.input, styles.inputDisabled, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border, color: colors.textTertiary }]}
                                                    value={userProfile?.email || ''}
                                                    editable={false}
                                                />
                                            </View>
                                            <View style={styles.inputGroup}>
                                                <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>טלפון</Text>
                                                <TextInput
                                                    style={[styles.input, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border, color: colors.textPrimary }]}
                                                    value={userProfile?.phone || ''}
                                                    onChangeText={(t) => updateUserProfileContext({ phone: t })}
                                                    keyboardType="phone-pad"
                                                />
                                            </View>
                                            <View style={styles.inputGroup}>
                                                <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>תחום עיסוק</Text>
                                                <TouchableOpacity
                                                    style={[styles.dropdown, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}
                                                    onPress={() => setIndustryModalVisible(true)}
                                                >
                                                    <Text style={[styles.dropdownText, { color: colors.textPrimary }]}>{userProfile?.businessCategory || 'בחר תחום'}</Text>
                                                    <ChevronDown size={18} color={colors.textTertiary} />
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                    )}

                                    {section.id === 'appearance' && (
                                        <View style={styles.inputList}>
                                            <Text style={[styles.inputLabel, { color: colors.textSecondary, marginBottom: SPACING.md }]}>
                                                בחר מצב תצוגה
                                            </Text>
                                            <View style={styles.themeOptions}>
                                                {THEME_OPTIONS.map((option) => {
                                                    const IconComponent = option.icon;
                                                    const isSelected = themeMode === option.value;
                                                    return (
                                                        <TouchableOpacity
                                                            key={option.value}
                                                            style={[
                                                                styles.themeOption,
                                                                {
                                                                    backgroundColor: isSelected ? colors.primaryMuted : colors.surfaceSecondary,
                                                                    borderColor: isSelected ? colors.primary : colors.border,
                                                                }
                                                            ]}
                                                            onPress={() => setThemeMode(option.value)}
                                                        >
                                                            <View style={[
                                                                styles.themeIconBox,
                                                                { backgroundColor: isSelected ? colors.primary : colors.fill }
                                                            ]}>
                                                                <IconComponent
                                                                    size={20}
                                                                    color={isSelected ? '#FFFFFF' : colors.textSecondary}
                                                                />
                                                            </View>
                                                            <Text style={[
                                                                styles.themeLabel,
                                                                { color: isSelected ? colors.primary : colors.textPrimary }
                                                            ]}>
                                                                {option.label}
                                                            </Text>
                                                            {isSelected && (
                                                                <View style={[styles.themeCheck, { backgroundColor: colors.primary }]}>
                                                                    <Save size={10} color="#FFFFFF" />
                                                                </View>
                                                            )}
                                                        </TouchableOpacity>
                                                    );
                                                })}
                                            </View>
                                            <Text style={[styles.themeHint, { color: colors.textTertiary }]}>
                                                {themeMode === 'system'
                                                    ? 'המראה ישתנה אוטומטית לפי הגדרות המכשיר שלך'
                                                    : themeMode === 'dark'
                                                    ? 'מצב כהה פעיל'
                                                    : 'מצב בהיר פעיל'
                                                }
                                            </Text>
                                        </View>
                                    )}

                                    {section.id === 'business' && (
                                        <View style={styles.inputList}>
                                            <View style={styles.inputGroup}>
                                                <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>שם העסק</Text>
                                                <TextInput
                                                    style={[styles.input, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border, color: colors.textPrimary }]}
                                                    value={businessSettings.name}
                                                    onChangeText={(t) => updateBusinessSettings({ name: t })}
                                                />
                                            </View>
                                            <View style={styles.inputGroup}>
                                                <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>ח.פ / עוסק מורשה</Text>
                                                <TextInput
                                                    style={[styles.input, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border, color: colors.textPrimary }]}
                                                    value={businessSettings.taxId}
                                                    onChangeText={(t) => updateBusinessSettings({ taxId: t })}
                                                    keyboardType="numeric"
                                                />
                                            </View>
                                            <View style={styles.inputGroup}>
                                                <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>כתובת העסק</Text>
                                                <TextInput
                                                    style={[styles.input, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border, color: colors.textPrimary }]}
                                                    value={businessSettings.address}
                                                    onChangeText={(t) => updateBusinessSettings({ address: t })}
                                                />
                                            </View>
                                        </View>
                                    )}

                                    {section.id === 'categories' && (
                                        <View style={styles.inputList}>
                                            {categories.map((cat, index) => (
                                                <View key={index} style={[styles.categoryRow, { borderBottomColor: colors.border }]}>
                                                    {editingCategory === cat ? (
                                                        <View style={styles.categoryEditRow}>
                                                            <TextInput
                                                                style={[styles.input, styles.categoryInput, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border, color: colors.textPrimary }]}
                                                                value={tempCategoryName}
                                                                onChangeText={setTempCategoryName}
                                                                autoFocus
                                                            />
                                                            <TouchableOpacity onPress={() => handleCategoryUpdate(cat)} style={styles.categoryAction}>
                                                                <Save size={18} color={colors.success} />
                                                            </TouchableOpacity>
                                                            <TouchableOpacity onPress={() => setEditingCategory(null)} style={styles.categoryAction}>
                                                                <X size={18} color={colors.danger} />
                                                            </TouchableOpacity>
                                                        </View>
                                                    ) : (
                                                        <>
                                                            <Text style={[styles.categoryText, { color: colors.textPrimary }]}>{cat}</Text>
                                                            {cat !== 'אחר...' && (
                                                                <View style={styles.categoryActions}>
                                                                    <TouchableOpacity
                                                                        onPress={() => {
                                                                            setEditingCategory(cat);
                                                                            setTempCategoryName(cat);
                                                                        }}
                                                                    >
                                                                        <Edit2 size={16} color={colors.primary} />
                                                                    </TouchableOpacity>
                                                                    <TouchableOpacity onPress={() => handleCategoryDelete(cat)}>
                                                                        <Trash2 size={16} color={colors.danger} />
                                                                    </TouchableOpacity>
                                                                </View>
                                                            )}
                                                        </>
                                                    )}
                                                </View>
                                            ))}
                                            <View style={styles.addCategoryRow}>
                                                <TextInput
                                                    style={[styles.input, styles.addCategoryInput, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border, color: colors.textPrimary }]}
                                                    placeholder="הוסף קטגוריה חדשה..."
                                                    placeholderTextColor={colors.textTertiary}
                                                    value={newCategoryName}
                                                    onChangeText={setNewCategoryName}
                                                />
                                                <TouchableOpacity
                                                    style={[styles.addCategoryButton, { backgroundColor: newCategoryName.trim() ? colors.primary : colors.fillSecondary }]}
                                                    onPress={handleAddCategory}
                                                    disabled={!newCategoryName.trim()}
                                                >
                                                    <Plus size={20} color={newCategoryName.trim() ? '#FFFFFF' : colors.textTertiary} />
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                    )}

                                    {section.id === 'prices' && (
                                        <View style={styles.inputList}>
                                            <View style={styles.inputGroup}>
                                                <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>מחיר שירות ברירת מחדל (₪)</Text>
                                                <TextInput
                                                    style={[styles.input, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border, color: colors.textPrimary }]}
                                                    value={priceSettings.defaultServicePrice}
                                                    onChangeText={(t) => updatePriceSettings({ defaultServicePrice: t })}
                                                    keyboardType="numeric"
                                                />
                                            </View>
                                            <View style={styles.inputGroup}>
                                                <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>תעריף שעתי (₪)</Text>
                                                <TextInput
                                                    style={[styles.input, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border, color: colors.textPrimary }]}
                                                    value={priceSettings.hourlyRate}
                                                    onChangeText={(t) => updatePriceSettings({ hourlyRate: t })}
                                                    keyboardType="numeric"
                                                />
                                            </View>
                                            <View style={styles.inputGroup}>
                                                <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>שיעור מע״מ (%)</Text>
                                                <TextInput
                                                    style={[styles.input, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border, color: colors.textPrimary }]}
                                                    value={priceSettings.taxRate.toString()}
                                                    onChangeText={(t) => updatePriceSettings({ taxRate: parseFloat(t) || 0 })}
                                                    keyboardType="numeric"
                                                />
                                            </View>
                                        </View>
                                    )}

                                    {section.id === 'notifications' && (
                                        <View style={styles.inputList}>
                                            <View style={[styles.toggleRow, { borderBottomColor: colors.border }]}>
                                                <View style={styles.toggleInfo}>
                                                    <Receipt size={18} color={colors.primary} />
                                                    <View style={styles.toggleTextContainer}>
                                                        <Text style={[styles.toggleTitle, { color: colors.textPrimary }]}>תזכורת קבלות</Text>
                                                        <Text style={[styles.toggleSubtitle, { color: colors.textTertiary }]}>
                                                            תזכורת להוסיף קבלות להוצאות
                                                        </Text>
                                                    </View>
                                                </View>
                                                <Switch
                                                    value={receiptReminders}
                                                    onValueChange={setReceiptReminders}
                                                    trackColor={{ false: colors.border, true: `${colors.success}50` }}
                                                    thumbColor={receiptReminders ? colors.success : colors.textQuaternary}
                                                />
                                            </View>
                                            <View style={[styles.toggleRow, { borderBottomColor: colors.border }]}>
                                                <View style={styles.toggleInfo}>
                                                    <Clock size={18} color={colors.primary} />
                                                    <View style={styles.toggleTextContainer}>
                                                        <Text style={[styles.toggleTitle, { color: colors.textPrimary }]}>תזכורת הוצאות</Text>
                                                        <Text style={[styles.toggleSubtitle, { color: colors.textTertiary }]}>
                                                            תזכורת יומית לתיעוד הוצאות
                                                        </Text>
                                                    </View>
                                                </View>
                                                <Switch
                                                    value={expenseReminders}
                                                    onValueChange={setExpenseReminders}
                                                    trackColor={{ false: colors.border, true: `${colors.success}50` }}
                                                    thumbColor={expenseReminders ? colors.success : colors.textQuaternary}
                                                />
                                            </View>
                                            <Text style={[styles.settingsHint, { color: colors.textTertiary }]}>
                                                התזכורות יופיעו בדשבורד כאשר יש הוצאות ללא קבלות
                                            </Text>
                                        </View>
                                    )}

                                    {section.id === 'security' && (
                                        <View style={styles.inputList}>
                                            <TouchableOpacity style={[styles.linkRow, { borderBottomColor: colors.border }]}>
                                                <Lock size={18} color={colors.primary} />
                                                <Text style={[styles.linkText, { color: colors.textPrimary }]}>שינוי סיסמה</Text>
                                                <ChevronLeft size={16} color={colors.textTertiary} />
                                            </TouchableOpacity>
                                            <TouchableOpacity style={[styles.linkRow, { borderBottomColor: colors.border }]}>
                                                <ExternalLink size={18} color={colors.primary} />
                                                <Text style={[styles.linkText, { color: colors.textPrimary }]}>מדיניות פרטיות</Text>
                                                <ChevronLeft size={16} color={colors.textTertiary} />
                                            </TouchableOpacity>
                                            <TouchableOpacity style={styles.linkRow} onPress={handleDeleteAccount}>
                                                <Trash2 size={18} color={colors.danger} />
                                                <Text style={[styles.linkText, { color: colors.danger }]}>מחק חשבון</Text>
                                            </TouchableOpacity>
                                        </View>
                                    )}

                                    {section.id === 'about' && (
                                        <View style={styles.inputList}>
                                            <View style={[styles.detailRow, { borderBottomColor: colors.border }]}>
                                                <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>גרסה</Text>
                                                <Text style={[styles.detailValue, { color: colors.textPrimary }]}>1.0.0</Text>
                                            </View>
                                            <TouchableOpacity style={styles.linkRow}>
                                                <MessageSquare size={18} color={colors.primary} />
                                                <Text style={[styles.linkText, { color: colors.textPrimary }]}>צור קשר עם תמיכה</Text>
                                                <ChevronLeft size={16} color={colors.textTertiary} />
                                            </TouchableOpacity>
                                        </View>
                                    )}
                                </View>
                            )}
                        </View>
                    ))}

                    {/* Logout Button */}
                    <TouchableOpacity
                        style={[styles.logoutButton, { backgroundColor: colors.dangerMuted, borderColor: colors.danger }]}
                        onPress={() => navigation.navigate('Login')}
                    >
                        <LogOut size={18} color={colors.danger} />
                        <Text style={[styles.logoutText, { color: colors.danger }]}>התנתק</Text>
                    </TouchableOpacity>

                    <View style={{ height: 100 }} />
                </ScrollView>
            </KeyboardAvoidingView>

            {/* Industry Modal */}
            <Modal visible={industryModalVisible} transparent animationType="fade">
                <TouchableOpacity
                    style={[styles.modalOverlay, { backgroundColor: colors.overlay }]}
                    activeOpacity={1}
                    onPress={() => setIndustryModalVisible(false)}
                >
                    <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
                        <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>בחר תחום עיסוק</Text>
                        <FlatList
                            data={INDUSTRIES}
                            keyExtractor={(item) => item}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={[styles.modalItem, { borderBottomColor: colors.border }]}
                                    onPress={() => {
                                        updateUserProfileContext({ businessCategory: item });
                                        setIndustryModalVisible(false);
                                    }}
                                >
                                    <Text style={[
                                        styles.modalItemText,
                                        { color: colors.textPrimary },
                                        userProfile?.businessCategory === item && { color: colors.primary, fontFamily: FONTS.semiBold }
                                    ]}>{item}</Text>
                                    {userProfile?.businessCategory === item && <Text style={{ color: colors.primary }}>✓</Text>}
                                </TouchableOpacity>
                            )}
                        />
                    </View>
                </TouchableOpacity>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: LAYOUT.screenPadding,
        paddingBottom: SPACING.lg,
    },
    backButton: {
        width: 44,
        height: 44,
        borderRadius: RADIUS.md,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        ...TYPOGRAPHY.h3,
    },
    content: {
        paddingHorizontal: LAYOUT.screenPadding,
        paddingTop: SPACING.sm,
    },
    profileCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: SPACING.lg,
        borderRadius: RADIUS.lg,
        marginBottom: SPACING.xl,
    },
    avatarContainer: {
        position: 'relative',
        marginLeft: SPACING.lg,
    },
    avatar: {
        width: 56,
        height: 56,
        borderRadius: 28,
    },
    avatarPlaceholder: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarInitials: {
        fontSize: 22,
        color: '#FFFFFF',
        fontFamily: FONTS.bold,
    },
    cameraIcon: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 22,
        height: 22,
        borderRadius: 11,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
    },
    profileInfo: {
        flex: 1,
    },
    profileName: {
        ...TYPOGRAPHY.h4,
        marginBottom: 2,
    },
    profileEmail: {
        ...TYPOGRAPHY.bodySmall,
    },
    section: {
        borderRadius: RADIUS.lg,
        marginBottom: SPACING.md,
        overflow: 'hidden',
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: SPACING.lg,
    },
    sectionLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.md,
    },
    iconBox: {
        width: 36,
        height: 36,
        borderRadius: RADIUS.sm,
        alignItems: 'center',
        justifyContent: 'center',
    },
    sectionTitle: {
        ...TYPOGRAPHY.body,
        fontFamily: FONTS.medium,
    },
    sectionContent: {
        padding: SPACING.lg,
        paddingTop: 0,
        borderTopWidth: 1,
    },
    inputList: {
        paddingTop: SPACING.lg,
    },
    inputGroup: {
        marginBottom: SPACING.lg,
    },
    inputLabel: {
        ...TYPOGRAPHY.caption,
        marginBottom: SPACING.sm,
        textAlign: 'right',
    },
    input: {
        height: 48,
        borderRadius: RADIUS.md,
        borderWidth: 1,
        paddingHorizontal: SPACING.lg,
        ...TYPOGRAPHY.body,
        textAlign: 'right',
    },
    inputDisabled: {
        opacity: 0.6,
    },
    dropdown: {
        height: 48,
        borderRadius: RADIUS.md,
        borderWidth: 1,
        paddingHorizontal: SPACING.lg,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    dropdownText: {
        ...TYPOGRAPHY.body,
    },
    categoryRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: SPACING.md,
        borderBottomWidth: 1,
    },
    categoryText: {
        ...TYPOGRAPHY.body,
    },
    categoryActions: {
        flexDirection: 'row',
        gap: SPACING.lg,
    },
    categoryEditRow: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.sm,
    },
    categoryInput: {
        flex: 1,
        height: 40,
    },
    categoryAction: {
        padding: SPACING.xs,
    },
    addCategoryRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.sm,
        marginTop: SPACING.md,
    },
    addCategoryInput: {
        flex: 1,
    },
    addCategoryButton: {
        width: 48,
        height: 48,
        borderRadius: RADIUS.md,
        alignItems: 'center',
        justifyContent: 'center',
    },
    linkRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: SPACING.md,
        borderBottomWidth: 1,
        gap: SPACING.md,
    },
    linkText: {
        flex: 1,
        ...TYPOGRAPHY.body,
        textAlign: 'left',
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: SPACING.md,
        borderBottomWidth: 1,
    },
    detailValue: {
        ...TYPOGRAPHY.body,
        fontFamily: FONTS.medium,
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: SPACING.sm,
        padding: SPACING.lg,
        borderRadius: RADIUS.lg,
        borderWidth: 1,
        marginTop: SPACING.xl,
    },
    logoutText: {
        ...TYPOGRAPHY.label,
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        padding: LAYOUT.screenPadding,
    },
    modalContent: {
        borderRadius: RADIUS.xl,
        padding: SPACING.xl,
        maxHeight: '70%',
    },
    modalTitle: {
        ...TYPOGRAPHY.h3,
        textAlign: 'center',
        marginBottom: SPACING.lg,
    },
    modalItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: SPACING.lg,
        borderBottomWidth: 1,
    },
    modalItemText: {
        ...TYPOGRAPHY.body,
    },
    // Theme styles
    themeOptions: {
        flexDirection: 'row',
        gap: SPACING.md,
        marginBottom: SPACING.lg,
    },
    themeOption: {
        flex: 1,
        padding: SPACING.md,
        borderRadius: RADIUS.lg,
        borderWidth: 1.5,
        alignItems: 'center',
        position: 'relative',
    },
    themeIconBox: {
        width: 44,
        height: 44,
        borderRadius: RADIUS.md,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: SPACING.sm,
    },
    themeLabel: {
        ...TYPOGRAPHY.labelSmall,
    },
    themeCheck: {
        position: 'absolute',
        top: 8,
        right: 8,
        width: 18,
        height: 18,
        borderRadius: 9,
        alignItems: 'center',
        justifyContent: 'center',
    },
    themeHint: {
        ...TYPOGRAPHY.caption,
        textAlign: 'center',
    },
    // Toggle/notification styles
    toggleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: SPACING.md,
        borderBottomWidth: 1,
    },
    toggleInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        gap: SPACING.md,
    },
    toggleTextContainer: {
        flex: 1,
    },
    toggleTitle: {
        ...TYPOGRAPHY.body,
        fontFamily: FONTS.medium,
        marginBottom: 2,
    },
    toggleSubtitle: {
        ...TYPOGRAPHY.caption,
    },
    settingsHint: {
        ...TYPOGRAPHY.caption,
        textAlign: 'center',
        marginTop: SPACING.lg,
    },
});
