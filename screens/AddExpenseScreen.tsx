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
    Alert,
    Platform,
    I18nManager,
    KeyboardAvoidingView,
    ActivityIndicator,
    Modal
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { ChevronRight, Camera, Image as ImageIcon, Calendar, ChevronDown, Check, Save, Layers, DollarSign, FileText, ArrowLeft, X, Wand2 } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { useTransactions } from '../context/TransactionsContext';
import { SuccessModal } from '../components/SuccessModal';
import { COLORS, FONTS } from '../constants/theme';
import { scanReceipt } from '../services/GoogleVisionService';
import { handleError } from '../utils/errorHandler';
import { uploadReceiptToCloud } from '../utils/receiptStorage';

export default function AddExpenseScreen({ route }: any) {
    const navigation = useNavigation();
    const { addTransaction, updateTransaction, categories, transactions } = useTransactions();

    // Check if editing existing expense
    const editingExpense = route?.params?.expense;
    const isEditMode = !!editingExpense;

    // Form State - Pre-fill if editing
    const [amount, setAmount] = useState(editingExpense ? editingExpense.amount.replace(/[^0-9.]/g, '') : '');
    const [date, setDate] = useState(editingExpense ? new Date(editingExpense.date) : new Date());
    const [category, setCategory] = useState(editingExpense?.category || '');
    const [supplier, setSupplier] = useState(editingExpense?.supplier || '');
    const [description, setDescription] = useState(editingExpense?.title || '');

    // Additional Expense Fields
    const [projectId, setProjectId] = useState<string | null>(editingExpense?.clientId || null);
    const [isDeductible, setIsDeductible] = useState(editingExpense?.isDeductible ?? true);
    const [hasVat, setHasVat] = useState(true);
    const [receiptUri, setReceiptUri] = useState<string | null>(editingExpense?.receiptImageUri || null);
    const [isScanning, setIsScanning] = useState(false);

    // Dropdown State
    const [showCategories, setShowCategories] = useState(false);

    // Modal State
    const [showSuccess, setShowSuccess] = useState(false);
    const [keepForm, setKeepForm] = useState(false); // If true, "Save and Create Another"

    // Validation errors
    const [amountError, setAmountError] = useState('');
    const [categoryError, setCategoryError] = useState('');

    // Recent Invoices for Project Linking
    const recentInvoices = transactions.filter(t => t.type === 'invoice').slice(0, 5);

    const handleCamera = async () => {
        try {
            const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
            if (!permissionResult.granted) {
                Alert.alert("דרושה הרשאה", "אפליקציה זו זקוקה לגישה למצלמה.");
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
            console.error('Camera error:', error);
            Alert.alert('שגיאה', 'שגיאה בפתיחת המצלמה');
        }
    };

    const handleGallery = async () => {
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permissionResult.granted) {
            Alert.alert("דרושה הרשאה", "אפליקציה זו זקוקה לגישה לגלריה.");
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
            Alert.alert("דרושה הרשאה", "אפליקציה זו זקוקה לגישה למצלמה.");
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
                // Simple category matching or default
                if (data.category) {
                    // Try to match or set description
                    setDescription(data.category);
                }
                // Show success with auto-filled data
                setShowSuccess(true);
                setTimeout(() => setShowSuccess(false), 2000);
            } catch (error: any) {
                handleError(error, true); // Show Hebrew error message
                console.error('Scan error:', error);
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
                const asset = result.assets[0];
                const uri = asset.uri;
                const name = asset.name;
                const mimeType = asset.mimeType || 'application/octet-stream';

                setReceiptUri(uri);
                setIsScanning(true);

                try {
                    const data = await scanReceipt(uri);
                    if (data.amount) setAmount(data.amount.toString());
                    if (data.date) setDate(new Date(data.date));
                    if (data.merchant) setSupplier(data.merchant);
                    if (data.category) {
                        setDescription(data.category);
                    }
                    // Show success with auto-filled data
                    setShowSuccess(true);
                    setTimeout(() => setShowSuccess(false), 2000);
                } catch (error: any) {
                    handleError(error, true); // Show Hebrew error message
                    console.error('File Scan error:', error);
                } finally {
                    setIsScanning(false);
                }
            }
        } catch (err) {
            console.error('Pick Document Error:', err);
        }
    };

    const validateForm = (): boolean => {
        let isValid = true;

        // Validate amount
        if (!amount || amount.trim() === '') {
            setAmountError('שדה חובה');
            isValid = false;
        } else if (parseFloat(amount) <= 0) {
            setAmountError('הסכום חייב להיות גדול מ-0');
            isValid = false;
        } else {
            setAmountError('');
        }

        // Validate category
        if (!category || category.trim() === '') {
            setCategoryError('שדה חובה');
            isValid = false;
        } else {
            setCategoryError('');
        }

        return isValid;
    };

    const handleSave = async (createAnother: boolean = false) => {
        if (!validateForm()) {
            // Show detailed error message
            const missingFields = [];
            if (!amount || amount.trim() === '') missingFields.push('סכום');
            if (parseFloat(amount) <= 0) missingFields.push('סכום תקין');
            if (!category || category.trim() === '') missingFields.push('קטגוריה');

            Alert.alert(
                'שדות חסרים',
                `אנא מלא את השדות הבאים:\n• ${missingFields.join('\n• ')}`,
                [{ text: 'אישור', style: 'default' }]
            );
            return;
        }

        // Upload receipt to cloud if present
        let cloudReceiptUrl = receiptUri;
        if (receiptUri && !receiptUri.startsWith('http')) {
            console.log('📤 Uploading receipt to cloud...');
            cloudReceiptUrl = await uploadReceiptToCloud(receiptUri, Date.now().toString());
        }

        if (isEditMode && editingExpense) {
            // Update existing expense
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
            setTimeout(() => {
                navigation.goBack();
            }, 1500);
        } else {
            // Create new expense
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
            // Reset crucial fields only
            setAmount('');
            setSupplier('');
            setDescription('');
            setReceiptUri(null);
        }
        // Don't navigate back - let user review and edit
    };

    return (
        <View style={styles.container}>
            <StatusBar style="light" backgroundColor={COLORS.background} />
            <SuccessModal
                visible={showSuccess}
                title="ההוצאה נשמרה!"
                description="הנתונים עודכנו בהצלחה במערכת."
                onClose={handleModalClose}
            />

            {/* Loading Modal */}
            <Modal
                visible={isScanning}
                transparent
                animationType="fade"
            >
                <View style={styles.loadingOverlay}>
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color={COLORS.primary} />
                        <Text style={styles.loadingText}>סורק קבלה...</Text>
                        <Text style={styles.loadingSubtext}>זה עשוי לקחת מספר שניות</Text>
                    </View>
                </View>
            </Modal>

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <ChevronRight size={28} color={COLORS.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{isEditMode ? 'עריכת הוצאה' : 'הוסף הוצאה'}</Text>
                <TouchableOpacity onPress={() => navigation.navigate('ExpenseTemplates' as never)} style={styles.templatesButton}>
                    <Layers size={24} color={COLORS.primary} />
                </TouchableOpacity>
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                    {/* SECTION 1: RECEIPT VISUAL */}
                    <View style={styles.receiptSection}>
                        {receiptUri ? (
                            <View style={styles.previewContainer}>
                                <Image source={{ uri: receiptUri }} style={styles.receiptPreview} />
                                <TouchableOpacity onPress={() => setReceiptUri(null)} style={styles.removeImageBtn}>
                                    <X size={20} color={COLORS.white} />
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <View style={styles.placeholderContainer}>
                                <Text style={styles.placeholderLabel}>העלה קבלה</Text>
                                <View style={styles.imageActionsGrid}>
                                    <TouchableOpacity style={styles.gridActionBtn} onPress={handleCamera}>
                                        <Camera size={20} color={COLORS.primary} />
                                        <Text style={styles.gridActionLabel}>צלם</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={styles.gridActionBtn} onPress={handleGallery}>
                                        <ImageIcon size={20} color={COLORS.primary} />
                                        <Text style={styles.gridActionLabel}>גלריה</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={[styles.gridActionBtn, styles.gridActionHighlight]} onPress={handleMagicScan}>
                                        <Wand2 size={20} color={COLORS.primary} />
                                        <Text style={[styles.gridActionLabel, { color: COLORS.primary }]}>סרוק</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={[styles.gridActionBtn, styles.gridActionHighlight]} onPress={handleGalleryScan}>
                                        <ImageIcon size={20} color={COLORS.primary} />
                                        <Text style={[styles.gridActionLabel, { color: COLORS.primary }]}>סרוק קובץ</Text>
                                    </TouchableOpacity>
                                </View>
                                {isScanning && <Text style={{ textAlign: 'center', marginTop: 10, color: COLORS.primary }}>סורק קבלה...</Text>}
                            </View>
                        )}
                    </View>

                    {/* SECTION 2: MAIN FORM - CLEAN LOOK */}
                    <View style={styles.formContainer}>

                        {/* Amount - Big & Clean */}
                        <View style={styles.amountInputContainer}>
                            <Text style={styles.currencyPrefix}>₪</Text>
                            <TextInput
                                style={styles.amountInput}
                                placeholder="0.00"
                                placeholderTextColor={COLORS.textTertiary}
                                keyboardType="numeric"
                                value={amount}
                                onChangeText={setAmount}
                                textAlign={I18nManager.isRTL ? 'right' : 'left'}
                            />
                        </View>

                        {/* Date & Category Row */}
                        <View style={styles.row}>
                            <View style={[styles.inputGroup, { flex: 1, marginLeft: 12 }]}>
                                <Text style={styles.miniLabel}>תאריך</Text>
                                <TouchableOpacity style={styles.miniInput}>
                                    <Text style={styles.inputText}>{date.toLocaleDateString()}</Text>
                                    <Calendar size={16} color={COLORS.textSecondary} />
                                </TouchableOpacity>
                            </View>

                            <View style={[styles.inputGroup, { flex: 1.5 }]}>
                                <Text style={styles.miniLabel}>קטגוריה</Text>
                                <TouchableOpacity
                                    style={[styles.miniInput, showCategories && { borderColor: COLORS.primary }]}
                                    onPress={() => setShowCategories(!showCategories)}
                                >
                                    <Text style={[styles.inputText, !category && { color: COLORS.textSecondary }]}>
                                        {category || "בחר קטגוריה"}
                                    </Text>
                                    <ChevronDown size={16} color={COLORS.textSecondary} />
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Dropdown Expansion */}
                        {showCategories && (
                            <View style={styles.dropdownContainer}>
                                <ScrollView style={{ maxHeight: 200 }} nestedScrollEnabled>
                                    {categories.map((cat, idx) => (
                                        <TouchableOpacity
                                            key={idx}
                                            style={styles.dropdownItem}
                                            onPress={() => {
                                                setCategory(cat);
                                                setShowCategories(false);
                                            }}
                                        >
                                            <Text style={[styles.dropdownText, category === cat && styles.dropdownTextActive]}>
                                                {cat}
                                            </Text>
                                            {category === cat && <Check size={16} color={COLORS.primary} />}
                                        </TouchableOpacity>
                                    ))}
                                </ScrollView>
                            </View>
                        )}

                        {/* Supplier */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.miniLabel}>שם העסק / ספק</Text>
                            <TextInput
                                style={styles.regularInput}
                                placeholder="איפה קנית?"
                                placeholderTextColor={COLORS.textSecondary}
                                value={supplier}
                                onChangeText={setSupplier}
                                textAlign={I18nManager.isRTL ? 'right' : 'left'}
                            />
                        </View>

                        {/* Project Links (Chips) */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.miniLabel}>שייך לפרויקט (אופציונלי)</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingVertical: 4 }}>
                                {recentInvoices.map(proj => (
                                    <TouchableOpacity
                                        key={proj.id}
                                        style={[styles.chip, projectId === proj.id && styles.chipActive]}
                                        onPress={() => setProjectId(projectId === proj.id ? null : proj.id)}
                                    >
                                        <Text style={[styles.chipText, projectId === proj.id && styles.chipTextActive]}>
                                            {proj.title}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>

                        {/* Description */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.miniLabel}>תיאור</Text>
                            <TextInput
                                style={[styles.regularInput, { height: 80, textAlignVertical: 'top' }]}
                                placeholder="פרטים נוספים..."
                                placeholderTextColor={COLORS.textSecondary}
                                multiline
                                value={description}
                                onChangeText={setDescription}
                                textAlign={I18nManager.isRTL ? 'right' : 'left'}
                            />
                        </View>

                        {/* Settings Toggles - Card Style */}
                        <View style={styles.settingsCard}>
                            <View style={styles.settingRow}>
                                <View>
                                    <Text style={styles.settingTitle}>מוכר למס</Text>
                                    <Text style={styles.settingSub}>האם ההוצאה מוכרת?</Text>
                                </View>
                                <Switch
                                    trackColor={{ false: COLORS.border, true: COLORS.primary }}
                                    thumbColor={"#FFF"}
                                    onValueChange={setIsDeductible}
                                    value={isDeductible}
                                />
                            </View>
                            <View style={[styles.settingRow, { borderTopWidth: 1, borderTopColor: COLORS.border, paddingTop: 12, marginTop: 12 }]}>
                                <View>
                                    <Text style={styles.settingTitle}>כולל מע״מ</Text>
                                    <Text style={styles.settingSub}>חישוב מע״מ אוטומטי</Text>
                                </View>
                                <Switch
                                    trackColor={{ false: COLORS.border, true: COLORS.primary }}
                                    thumbColor={"#FFF"}
                                    onValueChange={setHasVat}
                                    value={hasVat}
                                />
                            </View>

                            {hasVat && amount && (
                                <View style={styles.vatInfo}>
                                    <Text style={styles.vatDetail}>מע״מ: ₪{(parseFloat(amount) - (parseFloat(amount) / 1.17)).toFixed(2)}</Text>
                                    <Text style={styles.vatDetail}>נטו: ₪{(parseFloat(amount) / 1.17).toFixed(2)}</Text>
                                </View>
                            )}
                        </View>
                    </View>

                    {/* SECTION 4: ACTIONS */}
                    <View style={styles.footerActions}>
                        <TouchableOpacity style={styles.saveBtn} onPress={() => handleSave(false)}>
                            <Text style={styles.saveBtnText}>שמור הוצאה</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.secondaryBtn} onPress={() => handleSave(true)}>
                            <Text style={styles.secondaryBtnText}>שמור וצור נוסף</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={{ height: 40 }} />
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
        paddingTop: Platform.OS === 'android' ? 40 : 0,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingBottom: 20,
        backgroundColor: COLORS.background,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    backButton: { padding: 8 },
    templatesButton: { padding: 8 },
    headerTitle: {
        fontSize: 18,
        color: COLORS.textPrimary,
        fontFamily: FONTS.medium,
    },
    scrollContent: { padding: 24 },

    // Receipt Visualization
    receiptSection: {
        marginBottom: 32,
        alignItems: 'center',
    },
    placeholderContainer: {
        width: '100%',
        height: 120,
        backgroundColor: 'rgba(132, 101, 243, 0.05)',
        borderWidth: 1,
        borderColor: COLORS.border,
        borderStyle: 'dashed',
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    placeholderLabel: {
        color: COLORS.textSecondary,
        marginBottom: 12,
        fontFamily: FONTS.regular,
    },
    imageActions: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    actionIconBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
    },
    actionIconLabel: {
        color: COLORS.primary,
        marginLeft: 8,
        fontFamily: FONTS.medium,
    },
    dividerVertical: {
        width: 1,
        height: 20,
        backgroundColor: COLORS.border,
        marginHorizontal: 8,
    },
    previewContainer: {
        width: '100%',
        height: 200,
        borderRadius: 16,
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
        top: 10,
        right: 10,
        backgroundColor: 'rgba(0,0,0,0.6)',
        borderRadius: 20,
        padding: 6,
    },

    // Form
    formContainer: { gap: 24 },
    amountInputContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    currencyPrefix: {
        fontSize: 32,
        color: COLORS.primary,
        fontFamily: FONTS.bold,
        marginRight: 4,
    },
    amountInput: {
        fontSize: 40,
        color: COLORS.textPrimary,
        fontFamily: FONTS.bold,
        minWidth: 100,
        textAlign: 'center',
        padding: 0,
    },

    row: { flexDirection: 'row' },
    inputGroup: { gap: 8 },
    miniLabel: {
        color: COLORS.textSecondary,
        fontSize: 12,
        fontFamily: FONTS.medium,
        textAlign: 'left',
    },
    miniInput: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: COLORS.surface,
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    regularInput: {
        backgroundColor: COLORS.surface,
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        color: COLORS.textPrimary,
        fontSize: 16,
        fontFamily: FONTS.regular,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    inputText: {
        color: COLORS.textPrimary,
        fontSize: 14,
        fontFamily: FONTS.regular,
    },

    dropdownContainer: {
        backgroundColor: COLORS.surface,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: COLORS.border,
        marginTop: -16,
        zIndex: 10,
    },
    dropdownItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    dropdownText: {
        color: COLORS.textPrimary,
        fontSize: 14,
        fontFamily: FONTS.regular,
    },
    dropdownTextActive: {
        color: COLORS.primary,
        fontFamily: FONTS.medium,
    },

    // Chips
    chip: {
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 20,
        backgroundColor: COLORS.surface,
        borderWidth: 1,
        borderColor: COLORS.border,
        marginRight: 8,
    },
    chipActive: {
        backgroundColor: 'rgba(132, 101, 243, 0.15)',
        borderColor: COLORS.primary,
    },
    chipText: {
        color: COLORS.textTertiary,
        fontSize: 12,
        fontFamily: FONTS.regular,
    },
    chipTextActive: {
        color: COLORS.primary,
        fontFamily: FONTS.medium,
    },

    // Settings Card
    settingsCard: {
        backgroundColor: COLORS.surface,
        borderRadius: 16,
        padding: 20,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    settingRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    settingTitle: {
        color: COLORS.textPrimary,
        fontSize: 14,
        fontFamily: FONTS.medium,
    },
    settingSub: {
        color: COLORS.textSecondary,
        fontSize: 12,
        fontFamily: FONTS.regular,
        marginTop: 2,
    },
    vatInfo: {
        flexDirection: 'row',
        marginTop: 16,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
        gap: 16,
    },
    vatDetail: {
        color: COLORS.textTertiary,
        fontSize: 12,
        fontFamily: FONTS.regular,
    },

    // Footer
    footerActions: {
        marginTop: 40,
        gap: 16,
    },
    saveBtn: {
        backgroundColor: COLORS.primary,
        borderRadius: 16,
        paddingVertical: 18,
        alignItems: 'center',
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    saveBtnText: {
        color: COLORS.white, // Button text stays white
        fontSize: 16,
        fontFamily: FONTS.bold,
    },
    secondaryBtn: {
        alignItems: 'center',
        paddingVertical: 8,
    },
    secondaryBtnText: {
        color: COLORS.primary,
        fontSize: 14,
        fontFamily: FONTS.medium,
    },

    // Loading Modal
    loadingOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingContainer: {
        backgroundColor: COLORS.surface,
        borderRadius: 16,
        padding: 32,
        alignItems: 'center',
        minWidth: 200,
    },
    loadingText: {
        marginTop: 16,
        fontSize: 18,
        fontFamily: FONTS.bold,
        color: COLORS.textPrimary,
    },
    loadingSubtext: {
        marginTop: 8,
        fontSize: 14,
        color: COLORS.textSecondary,
        textAlign: 'center',
    },

    // Validation Errors
    errorText: {
        color: COLORS.danger,
        fontSize: 12,
        marginTop: 4,
        marginRight: 16,
        fontFamily: FONTS.regular,
    },

    // Grid Button Layout
    imageActionsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        marginTop: 12,
    },
    gridActionBtn: {
        flex: 1,
        minWidth: '45%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 12,
        paddingHorizontal: 16,
        backgroundColor: COLORS.surface,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    gridActionHighlight: {
        backgroundColor: 'rgba(0, 212, 170, 0.1)',
        borderColor: COLORS.primary,
    },
    gridActionLabel: {
        fontSize: 14,
        fontFamily: FONTS.medium,
        color: COLORS.textPrimary,
    },
});
