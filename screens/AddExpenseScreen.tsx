import React, { useState } from 'react';
import {
    StyleSheet,
    Text,
    View,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Switch,
    Image,
    Platform,
    KeyboardAvoidingView,
    ActivityIndicator,
    Modal,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronRight, Camera, Image as ImageIcon, Calendar, ChevronDown, Check, Layers, X, Wand2 } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { useTransactions } from '../context/TransactionsContext';
import { useNotification } from '../context/NotificationContext';
import { useTheme } from '../context/ThemeContext';
import { SuccessModal } from '../components/SuccessModal';
import { getColors, FONTS, SPACING, RADIUS, SHADOWS, TYPOGRAPHY, LAYOUT } from '../constants/theme';
import { scanReceipt } from '../services/GoogleVisionService';
import { handleError } from '../utils/errorHandler';
import { uploadReceiptToCloud } from '../utils/receiptStorage';

export default function AddExpenseScreen({ route }: any) {
    const navigation = useNavigation();
    const insets = useSafeAreaInsets();
    const { resolvedTheme, isDark } = useTheme();
    const colors = getColors(resolvedTheme);
    const { addTransaction, updateTransaction, categories, transactions } = useTransactions();
    const { showWarning, showError } = useNotification();

    const editingExpense = route?.params?.expense;
    const isEditMode = !!editingExpense;

    const [amount, setAmount] = useState(editingExpense ? editingExpense.amount.replace(/[^0-9.]/g, '') : '');
    const [date, setDate] = useState(editingExpense ? new Date(editingExpense.date) : new Date());
    const [category, setCategory] = useState(editingExpense?.category || '');
    const [supplier, setSupplier] = useState(editingExpense?.supplier || '');
    const [description, setDescription] = useState(editingExpense?.title || '');
    const [projectId, setProjectId] = useState<string | null>(editingExpense?.clientId || null);
    const [isDeductible, setIsDeductible] = useState(editingExpense?.isDeductible ?? true);
    const [hasVat, setHasVat] = useState(true);
    const [receiptUri, setReceiptUri] = useState<string | null>(editingExpense?.receiptImageUri || null);
    const [isScanning, setIsScanning] = useState(false);
    const [showCategories, setShowCategories] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [keepForm, setKeepForm] = useState(false);

    const recentInvoices = transactions.filter(t => t.type === 'invoice').slice(0, 5);

    const handleCamera = async () => {
        try {
            const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
            if (!permissionResult.granted) {
                showWarning('דרושה הרשאה', 'אפליקציה זו זקוקה לגישה למצלמה');
                return;
            }

            const result = await ImagePicker.launchCameraAsync({
                mediaTypes: ['images'],
                allowsEditing: true,
                quality: 1,
            });

            if (!result.canceled) {
                setReceiptUri(result.assets[0].uri);
            }
        } catch (error) {
            showError('שגיאה', 'שגיאה בפתיחת המצלמה');
        }
    };

    const handleGallery = async () => {
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permissionResult.granted) {
            showWarning('דרושה הרשאה', 'אפליקציה זו זקוקה לגישה לגלריה');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            quality: 1,
        });

        if (!result.canceled) {
            setReceiptUri(result.assets[0].uri);
        }
    };

    const handleMagicScan = async () => {
        const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
        if (!permissionResult.granted) {
            showWarning('דרושה הרשאה', 'אפליקציה זו זקוקה לגישה למצלמה');
            return;
        }

        const result = await ImagePicker.launchCameraAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            quality: 1,
        });

        if (!result.canceled) {
            const uri = result.assets[0].uri;
            setReceiptUri(uri);
            setIsScanning(true);
            try {
                const data = await scanReceipt(uri);
                if (data.amount) setAmount(data.amount.toString());
                if (data.date) setDate(new Date(data.date));
                if (data.merchant) setSupplier(data.merchant);
                if (data.category) setDescription(data.category);
            } catch (error: any) {
                handleError(error, true);
            } finally {
                setIsScanning(false);
            }
        }
    };

    const handleGalleryScan = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: ['image/*', 'application/pdf'],
                copyToCacheDirectory: true
            });

            if (!result.canceled) {
                const uri = result.assets[0].uri;
                setReceiptUri(uri);
                setIsScanning(true);

                try {
                    const data = await scanReceipt(uri);
                    if (data.amount) setAmount(data.amount.toString());
                    if (data.date) setDate(new Date(data.date));
                    if (data.merchant) setSupplier(data.merchant);
                    if (data.category) setDescription(data.category);
                } catch (error: any) {
                    handleError(error, true);
                } finally {
                    setIsScanning(false);
                }
            }
        } catch (err) {
            console.error('Pick Document Error:', err);
        }
    };

    const validateForm = (): boolean => {
        if (!amount || amount.trim() === '' || parseFloat(amount) <= 0) return false;
        if (!category || category.trim() === '') return false;
        return true;
    };

    const handleSave = async (createAnother: boolean = false) => {
        if (!validateForm()) {
            showWarning('שדות חסרים', 'אנא מלא סכום וקטגוריה');
            return;
        }

        let cloudReceiptUrl = receiptUri;
        if (receiptUri && !receiptUri.startsWith('http')) {
            cloudReceiptUrl = await uploadReceiptToCloud(receiptUri, Date.now().toString());
        }

        if (isEditMode && editingExpense) {
            updateTransaction(editingExpense.id, {
                title: supplier || description || 'הוצאה כללית',
                amount: `₪ ${parseFloat(amount).toLocaleString()}`,
                date: date,
                category: category,
                notes: description,
                clientName: supplier,
                supplier: supplier,
                receiptImageUri: cloudReceiptUrl || undefined,
                isDeductible: isDeductible,
            });
            setShowSuccess(true);
            setTimeout(() => navigation.goBack(), 1500);
        } else {
            const newExpense = {
                id: Date.now().toString(),
                type: 'expense' as const,
                title: supplier || description || 'הוצאה כללית',
                amount: `₪ ${parseFloat(amount).toLocaleString()}`,
                date: date,
                category: category,
                isIncome: false,
                status: 'paid' as const,
                notes: description,
                clientName: supplier,
                supplier: supplier,
                receiptImageUri: cloudReceiptUrl || undefined,
                isDeductible: isDeductible,
            };

            addTransaction(newExpense);
            setKeepForm(createAnother);
            setShowSuccess(true);
        }
    };

    const handleModalClose = () => {
        setShowSuccess(false);
        if (keepForm) {
            setAmount('');
            setSupplier('');
            setDescription('');
            setReceiptUri(null);
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <StatusBar style={isDark ? 'light' : 'dark'} />
            <SuccessModal
                visible={showSuccess}
                title="ההוצאה נשמרה!"
                description="הנתונים עודכנו בהצלחה במערכת."
                onClose={handleModalClose}
            />

            {/* Loading Modal */}
            <Modal visible={isScanning} transparent animationType="fade">
                <View style={[styles.loadingOverlay, { backgroundColor: colors.overlay }]}>
                    <View style={[styles.loadingContainer, { backgroundColor: colors.surface }]}>
                        <ActivityIndicator size="large" color={colors.primary} />
                        <Text style={[styles.loadingText, { color: colors.textPrimary }]}>סורק קבלה...</Text>
                        <Text style={[styles.loadingSubtext, { color: colors.textSecondary }]}>זה עשוי לקחת מספר שניות</Text>
                    </View>
                </View>
            </Modal>

            {/* Header */}
            <View style={[styles.header, { paddingTop: insets.top + SPACING.md }]}>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={[styles.headerButton, { backgroundColor: colors.surfaceSecondary }]}
                >
                    <ChevronRight size={24} color={colors.textSecondary} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
                    {isEditMode ? 'עריכת הוצאה' : 'הוסף הוצאה'}
                </Text>
                <TouchableOpacity
                    onPress={() => navigation.navigate('ExpenseTemplates' as never)}
                    style={[styles.headerButton, { backgroundColor: colors.surfaceSecondary }]}
                >
                    <Layers size={20} color={colors.primary} />
                </TouchableOpacity>
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    {/* Receipt Section */}
                    <View style={styles.receiptSection}>
                        {receiptUri ? (
                            <View style={styles.previewContainer}>
                                <Image source={{ uri: receiptUri }} style={styles.receiptPreview} />
                                <TouchableOpacity
                                    onPress={() => setReceiptUri(null)}
                                    style={[styles.removeImageBtn, { backgroundColor: colors.overlay }]}
                                >
                                    <X size={20} color="#FFFFFF" />
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <View style={[styles.placeholderContainer, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}>
                                <Text style={[styles.placeholderLabel, { color: colors.textTertiary }]}>העלה קבלה</Text>
                                <View style={styles.imageActionsGrid}>
                                    <TouchableOpacity
                                        style={[styles.gridActionBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
                                        onPress={handleCamera}
                                    >
                                        <Camera size={20} color={colors.textSecondary} />
                                        <Text style={[styles.gridActionLabel, { color: colors.textPrimary }]}>צלם</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[styles.gridActionBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
                                        onPress={handleGallery}
                                    >
                                        <ImageIcon size={20} color={colors.textSecondary} />
                                        <Text style={[styles.gridActionLabel, { color: colors.textPrimary }]}>גלריה</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[styles.gridActionBtn, { backgroundColor: colors.primaryMuted, borderColor: colors.primary }]}
                                        onPress={handleMagicScan}
                                    >
                                        <Wand2 size={20} color={colors.primary} />
                                        <Text style={[styles.gridActionLabel, { color: colors.primary }]}>סרוק</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[styles.gridActionBtn, { backgroundColor: colors.primaryMuted, borderColor: colors.primary }]}
                                        onPress={handleGalleryScan}
                                    >
                                        <ImageIcon size={20} color={colors.primary} />
                                        <Text style={[styles.gridActionLabel, { color: colors.primary }]}>סרוק קובץ</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        )}
                    </View>

                    {/* Amount */}
                    <View style={styles.amountSection}>
                        <Text style={[styles.currencyPrefix, { color: colors.primary }]}>₪</Text>
                        <TextInput
                            style={[styles.amountInput, { color: colors.textPrimary }]}
                            placeholder="0.00"
                            placeholderTextColor={colors.textQuaternary}
                            keyboardType="numeric"
                            value={amount}
                            onChangeText={setAmount}
                            textAlign="center"
                        />
                    </View>

                    {/* Date & Category */}
                    <View style={styles.row}>
                        <View style={[styles.inputGroup, { flex: 1, marginLeft: SPACING.md }]}>
                            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>תאריך</Text>
                            <TouchableOpacity style={[styles.inputField, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}>
                                <Text style={[styles.inputText, { color: colors.textPrimary }]}>{date.toLocaleDateString('he-IL')}</Text>
                                <Calendar size={16} color={colors.textTertiary} />
                            </TouchableOpacity>
                        </View>

                        <View style={[styles.inputGroup, { flex: 1.5 }]}>
                            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>קטגוריה</Text>
                            <TouchableOpacity
                                style={[
                                    styles.inputField,
                                    { backgroundColor: colors.surfaceSecondary, borderColor: showCategories ? colors.primary : colors.border }
                                ]}
                                onPress={() => setShowCategories(!showCategories)}
                            >
                                <Text style={[styles.inputText, { color: category ? colors.textPrimary : colors.textTertiary }]}>
                                    {category || "בחר קטגוריה"}
                                </Text>
                                <ChevronDown size={16} color={colors.textTertiary} />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Dropdown */}
                    {showCategories && (
                        <View style={[styles.dropdown, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                            <ScrollView style={{ maxHeight: 200 }} nestedScrollEnabled>
                                {categories.map((cat, idx) => (
                                    <TouchableOpacity
                                        key={idx}
                                        style={[styles.dropdownItem, { borderBottomColor: colors.border }]}
                                        onPress={() => { setCategory(cat); setShowCategories(false); }}
                                    >
                                        <Text style={[styles.dropdownText, { color: category === cat ? colors.primary : colors.textPrimary }]}>
                                            {cat}
                                        </Text>
                                        {category === cat && <Check size={16} color={colors.primary} />}
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>
                    )}

                    {/* Supplier */}
                    <View style={styles.inputGroup}>
                        <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>שם העסק / ספק</Text>
                        <TextInput
                            style={[styles.textInput, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border, color: colors.textPrimary }]}
                            placeholder="איפה קנית?"
                            placeholderTextColor={colors.textTertiary}
                            value={supplier}
                            onChangeText={setSupplier}
                            textAlign="right"
                        />
                    </View>

                    {/* Project Chips */}
                    {recentInvoices.length > 0 && (
                        <View style={styles.inputGroup}>
                            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>שייך לפרויקט</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                {recentInvoices.map(proj => (
                                    <TouchableOpacity
                                        key={proj.id}
                                        style={[
                                            styles.chip,
                                            { backgroundColor: projectId === proj.id ? colors.primaryMuted : colors.surfaceSecondary, borderColor: projectId === proj.id ? colors.primary : colors.border }
                                        ]}
                                        onPress={() => setProjectId(projectId === proj.id ? null : proj.id)}
                                    >
                                        <Text style={[styles.chipText, { color: projectId === proj.id ? colors.primary : colors.textTertiary }]}>
                                            {proj.title}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>
                    )}

                    {/* Description */}
                    <View style={styles.inputGroup}>
                        <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>תיאור</Text>
                        <TextInput
                            style={[styles.textInput, styles.multilineInput, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border, color: colors.textPrimary }]}
                            placeholder="פרטים נוספים..."
                            placeholderTextColor={colors.textTertiary}
                            multiline
                            value={description}
                            onChangeText={setDescription}
                            textAlign="right"
                        />
                    </View>

                    {/* Settings Card */}
                    <View style={[styles.settingsCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                        <View style={styles.settingRow}>
                            <View>
                                <Text style={[styles.settingTitle, { color: colors.textPrimary }]}>מוכר למס</Text>
                                <Text style={[styles.settingSub, { color: colors.textTertiary }]}>האם ההוצאה מוכרת?</Text>
                            </View>
                            <Switch
                                trackColor={{ false: colors.border, true: colors.primary }}
                                thumbColor="#FFF"
                                onValueChange={setIsDeductible}
                                value={isDeductible}
                            />
                        </View>

                        <View style={[styles.settingDivider, { backgroundColor: colors.border }]} />

                        <View style={styles.settingRow}>
                            <View>
                                <Text style={[styles.settingTitle, { color: colors.textPrimary }]}>כולל מע״מ</Text>
                                <Text style={[styles.settingSub, { color: colors.textTertiary }]}>חישוב מע״מ אוטומטי</Text>
                            </View>
                            <Switch
                                trackColor={{ false: colors.border, true: colors.primary }}
                                thumbColor="#FFF"
                                onValueChange={setHasVat}
                                value={hasVat}
                            />
                        </View>

                        {hasVat && amount && (
                            <View style={[styles.vatInfo, { borderTopColor: colors.border }]}>
                                <Text style={[styles.vatDetail, { color: colors.textTertiary }]}>
                                    מע״מ: ₪{(parseFloat(amount) - (parseFloat(amount) / 1.17)).toFixed(2)}
                                </Text>
                                <Text style={[styles.vatDetail, { color: colors.textTertiary }]}>
                                    נטו: ₪{(parseFloat(amount) / 1.17).toFixed(2)}
                                </Text>
                            </View>
                        )}
                    </View>

                    {/* Actions */}
                    <View style={styles.actions}>
                        <TouchableOpacity
                            style={[styles.primaryButton, { backgroundColor: colors.primary }]}
                            onPress={() => handleSave(false)}
                        >
                            <Text style={styles.primaryButtonText}>שמור הוצאה</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.secondaryButton} onPress={() => handleSave(true)}>
                            <Text style={[styles.secondaryButtonText, { color: colors.primary }]}>שמור וצור נוסף</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={{ height: 120 }} />
                </ScrollView>
            </KeyboardAvoidingView>
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
    headerButton: {
        width: 44,
        height: 44,
        borderRadius: RADIUS.md,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        ...TYPOGRAPHY.h3,
    },
    scrollContent: {
        paddingHorizontal: LAYOUT.screenPadding,
    },
    receiptSection: {
        marginBottom: SPACING['2xl'],
    },
    placeholderContainer: {
        borderWidth: 1,
        borderStyle: 'dashed',
        borderRadius: RADIUS.lg,
        padding: SPACING.lg,
        alignItems: 'center',
    },
    placeholderLabel: {
        ...TYPOGRAPHY.bodySmall,
        marginBottom: SPACING.md,
    },
    imageActionsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: SPACING.sm,
        width: '100%',
    },
    gridActionBtn: {
        flex: 1,
        minWidth: '45%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: SPACING.sm,
        paddingVertical: SPACING.md,
        borderRadius: RADIUS.md,
        borderWidth: 1,
    },
    gridActionLabel: {
        ...TYPOGRAPHY.label,
    },
    previewContainer: {
        height: 180,
        borderRadius: RADIUS.lg,
        overflow: 'hidden',
        position: 'relative',
    },
    receiptPreview: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    removeImageBtn: {
        position: 'absolute',
        top: SPACING.sm,
        right: SPACING.sm,
        borderRadius: RADIUS.full,
        padding: SPACING.sm,
    },
    amountSection: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: SPACING['2xl'],
    },
    currencyPrefix: {
        ...TYPOGRAPHY.h1,
        marginRight: SPACING.xs,
    },
    amountInput: {
        ...TYPOGRAPHY.display,
        minWidth: 120,
    },
    row: {
        flexDirection: 'row',
        marginBottom: SPACING.lg,
    },
    inputGroup: {
        marginBottom: SPACING.lg,
    },
    inputLabel: {
        ...TYPOGRAPHY.caption,
        marginBottom: SPACING.sm,
        textAlign: 'right',
    },
    inputField: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        height: LAYOUT.inputHeight,
        borderRadius: RADIUS.md,
        paddingHorizontal: SPACING.lg,
        borderWidth: 1,
    },
    inputText: {
        ...TYPOGRAPHY.body,
    },
    textInput: {
        height: LAYOUT.inputHeight,
        borderRadius: RADIUS.md,
        paddingHorizontal: SPACING.lg,
        borderWidth: 1,
        ...TYPOGRAPHY.body,
    },
    multilineInput: {
        height: 80,
        textAlignVertical: 'top',
        paddingTop: SPACING.md,
    },
    dropdown: {
        borderRadius: RADIUS.md,
        borderWidth: 1,
        marginTop: -SPACING.md,
        marginBottom: SPACING.lg,
        zIndex: 10,
    },
    dropdownItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: SPACING.lg,
        borderBottomWidth: 1,
    },
    dropdownText: {
        ...TYPOGRAPHY.body,
    },
    chip: {
        paddingVertical: SPACING.sm,
        paddingHorizontal: SPACING.lg,
        borderRadius: RADIUS.full,
        borderWidth: 1,
        marginRight: SPACING.sm,
    },
    chipText: {
        ...TYPOGRAPHY.caption,
        fontFamily: FONTS.medium,
    },
    settingsCard: {
        borderRadius: RADIUS.lg,
        padding: SPACING.lg,
        borderWidth: 1,
        marginBottom: SPACING['2xl'],
    },
    settingRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    settingTitle: {
        ...TYPOGRAPHY.body,
        fontFamily: FONTS.medium,
    },
    settingSub: {
        ...TYPOGRAPHY.caption,
        marginTop: 2,
    },
    settingDivider: {
        height: 1,
        marginVertical: SPACING.md,
    },
    vatInfo: {
        flexDirection: 'row',
        gap: SPACING.lg,
        marginTop: SPACING.lg,
        paddingTop: SPACING.lg,
        borderTopWidth: 1,
    },
    vatDetail: {
        ...TYPOGRAPHY.caption,
    },
    actions: {
        gap: SPACING.md,
    },
    primaryButton: {
        height: LAYOUT.buttonHeight,
        borderRadius: RADIUS.md,
        alignItems: 'center',
        justifyContent: 'center',
    },
    primaryButtonText: {
        ...TYPOGRAPHY.h4,
        color: '#FFFFFF',
    },
    secondaryButton: {
        alignItems: 'center',
        paddingVertical: SPACING.md,
    },
    secondaryButtonText: {
        ...TYPOGRAPHY.label,
    },
    loadingOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingContainer: {
        borderRadius: RADIUS.xl,
        padding: SPACING['3xl'],
        alignItems: 'center',
        minWidth: 200,
    },
    loadingText: {
        ...TYPOGRAPHY.h4,
        marginTop: SPACING.lg,
    },
    loadingSubtext: {
        ...TYPOGRAPHY.bodySmall,
        marginTop: SPACING.sm,
        textAlign: 'center',
    },
});
