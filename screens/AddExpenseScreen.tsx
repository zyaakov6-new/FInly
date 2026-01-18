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
    KeyboardAvoidingView
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { ChevronRight, Camera, Image as ImageIcon, Calendar, ChevronDown, Check, Save, Layers, DollarSign, FileText, ArrowLeft, X, Wand2 } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { useTransactions } from '../context/TransactionsContext';
import { SuccessModal } from '../components/SuccessModal';
import { COLORS, FONTS } from '../constants/theme';
import { scanReceipt } from '../services/MLKitOCRService';

export default function AddExpenseScreen() {
    const navigation = useNavigation();
    const { addTransaction, categories, transactions } = useTransactions();

    // Form State
    const [amount, setAmount] = useState('');
    const [date, setDate] = useState(new Date());
    const [category, setCategory] = useState('');
    const [supplier, setSupplier] = useState('');
    const [description, setDescription] = useState('');

    // Additional Expense Fields
    const [projectId, setProjectId] = useState<string | null>(null);
    const [isDeductible, setIsDeductible] = useState(true);
    const [hasVat, setHasVat] = useState(true);
    const [receiptUri, setReceiptUri] = useState<string | null>(null);
    const [isScanning, setIsScanning] = useState(false);

    // Dropdown State
    const [showCategories, setShowCategories] = useState(false);

    // Modal State
    const [showSuccess, setShowSuccess] = useState(false);
    const [keepForm, setKeepForm] = useState(false); // If true, "Save and Create Another"

    // Recent Invoices for Project Linking
    const recentInvoices = transactions.filter(t => t.type === 'invoice').slice(0, 5);

    const handleCamera = async () => {
        const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
        if (!permissionResult.granted) {
            Alert.alert("דרושה הרשאה", "אפליקציה זו זקוקה לגישה למצלמה.");
            return;
        }

        const result = await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        if (!result.canceled) {
            setReceiptUri(result.assets[0].uri);
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
                Alert.alert("סריקה הושלמה", "הפרטים מולאו אוטומטית!");
            } catch (error: any) {
                const errorMessage = error?.message || 'Network request failed';
                Alert.alert("שגיאה בסריקה", `${errorMessage}\n\nבדוק את החיבור לאינטרנט ואת ה-API Key.`);
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
                    Alert.alert("סריקה הושלמה", "הפרטים מולאו אוטומטית!");
                } catch (error: any) {
                    const errorMessage = error?.message || 'Network request failed';
                    Alert.alert("שגיאה בסריקה", `${errorMessage}`);
                    console.error('File Scan error:', error);
                } finally {
                    setIsScanning(false);
                }
            }
        } catch (err) {
            console.error('Pick Document Error:', err);
        }
    };

    const handleSave = (createAnother: boolean = false) => {
        if (!amount || !category) {
            Alert.alert('חסרים פרטים', 'נא למלא סכום וקטגוריה לפחות.');
            return;
        }

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
            receiptImageUri: receiptUri || undefined,
            isDeductible: isDeductible,
        };

        addTransaction(newExpense);
        setKeepForm(createAnother);
        setShowSuccess(true);
    };

    const handleModalClose = () => {
        setShowSuccess(false);
        if (keepForm) {
            // Reset crucial fields only
            setAmount('');
            setSupplier('');
            setDescription('');
            setReceiptUri(null);
        } else {
            navigation.goBack();
        }
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

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <ChevronRight size={28} color={COLORS.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>הוסף הוצאה</Text>
                <View style={{ width: 28 }} />
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
                                <View style={styles.imageActions}>
                                    <TouchableOpacity style={styles.actionIconBtn} onPress={handleCamera}>
                                        <Camera size={24} color={COLORS.primary} />
                                        <Text style={styles.actionIconLabel}>צלם</Text>
                                    </TouchableOpacity>
                                    <View style={styles.dividerVertical} />
                                    <TouchableOpacity style={styles.actionIconBtn} onPress={handleGallery}>
                                        <ImageIcon size={24} color={COLORS.primary} />
                                        <Text style={styles.actionIconLabel}>גלריה</Text>
                                    </TouchableOpacity>
                                    <View style={styles.dividerVertical} />
                                    <TouchableOpacity style={[styles.actionIconBtn, { backgroundColor: 'rgba(139, 92, 246, 0.1)', borderColor: COLORS.primary }]} onPress={handleMagicScan}>
                                        <Wand2 size={24} color={COLORS.primary} />
                                        <Text style={[styles.actionIconLabel, { color: COLORS.primary, fontWeight: 'bold' }]}>סרוק</Text>
                                    </TouchableOpacity>
                                    <View style={styles.dividerVertical} />
                                    <TouchableOpacity style={[styles.actionIconBtn, { backgroundColor: 'rgba(139, 92, 246, 0.1)', borderColor: COLORS.primary }]} onPress={handleGalleryScan}>
                                        <ImageIcon size={24} color={COLORS.primary} />
                                        <Text style={[styles.actionIconLabel, { color: COLORS.primary, fontWeight: 'bold' }]}>סרוק קובץ</Text>
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
});
