import React, { useState, useEffect } from 'react';
import {
    StyleSheet,
    Text,
    View,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Platform,
    KeyboardAvoidingView,
    Modal,
    Dimensions
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
    ChevronRight,
    Calendar,
    Paperclip,
    ChevronDown,
    Info,
    X,
    Folder,
    Clock,
    Package,
    RotateCw,
    CheckCircle,
    FileText,
    Plus,
    User
} from 'lucide-react-native';
import { useTransactions, TransactionStatus, Client } from '../context/TransactionsContext';
import { useTheme } from '../context/ThemeContext';
import { getColors, FONTS, SPACING, RADIUS, SHADOWS, TYPOGRAPHY, LAYOUT } from '../constants/theme';
import { SuccessModal } from '../components/SuccessModal';

const { width } = Dimensions.get('window');
type ServiceType = 'hourly' | 'project' | 'package' | 'retainer';

export default function CreateInvoiceScreen() {
    const navigation = useNavigation<any>();
    const insets = useSafeAreaInsets();
    const { resolvedTheme, isDark } = useTheme();
    const colors = getColors(resolvedTheme);
    const { addTransaction, categories, addCategory, getPriceHistoryByCategory, clients, addClient } = useTransactions();

    // --- State ---
    const [serviceType, setServiceType] = useState<ServiceType>('project');
    const [serviceName, setServiceName] = useState('');
    const [clientName, setClientName] = useState('');

    // Category Logic
    const [category, setCategory] = useState(categories[0]);
    const [showCatDropdown, setShowCatDropdown] = useState(false);
    const [isCustomCategory, setIsCustomCategory] = useState(false);
    const [customCategoryText, setCustomCategoryText] = useState('');

    // Client Logic
    const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
    const [showClientDropdown, setShowClientDropdown] = useState(false);
    const [isNewClient, setIsNewClient] = useState(false);

    const [quantity, setQuantity] = useState('');
    const [unit, setUnit] = useState('שעות');
    const [rate, setRate] = useState('');
    const [totalAmount, setTotalAmount] = useState('');
    const [serviceCost, setServiceCost] = useState('');

    const [isTotalLocked, setIsTotalLocked] = useState(false);

    // Dates
    const [serviceDate, setServiceDate] = useState(new Date().toLocaleDateString('he-IL'));
    const [invoiceDate, setInvoiceDate] = useState(new Date().toLocaleDateString('he-IL'));

    const [paymentStatus, setPaymentStatus] = useState<TransactionStatus>('pending');
    const [notes, setNotes] = useState('');
    const [attachment, setAttachment] = useState<string | null>(null);

    // Modal State
    const [showSuccess, setShowSuccess] = useState(false);
    const [createAnotherAfterSave, setCreateAnotherAfterSave] = useState(false);

    // Derived State
    const priceHistory = getPriceHistoryByCategory(isCustomCategory ? customCategoryText : category);
    const averagePrice = priceHistory.length > 0
        ? Math.round(priceHistory.reduce((acc, curr) => acc + parseFloat(curr.amount.replace(/[^0-9.-]+/g, "")), 0) / priceHistory.length)
        : 0;

    // --- Effects ---
    useEffect(() => {
        if (serviceType === 'hourly') setUnit('שעות');
        if (serviceType === 'package') setUnit('יחידות');
        if (serviceType === 'project') setUnit('');
        if (serviceType === 'retainer') setUnit('חודשים');
        setIsTotalLocked(false);
    }, [serviceType]);

    useEffect(() => {
        if (!isTotalLocked && quantity && rate) {
            const q = parseFloat(quantity);
            const r = parseFloat(rate);
            if (!isNaN(q) && !isNaN(r)) {
                setTotalAmount((q * r).toString());
            }
        }
    }, [quantity, rate, isTotalLocked]);

    // --- Handlers ---
    const handleSave = (createAnother = false) => {
        if (!serviceName || !totalAmount) {
            alert('אנא מלא שם שירות וסכום');
            return;
        }

        let finalCategory = category;
        if (isCustomCategory && customCategoryText) {
            addCategory(customCategoryText);
            finalCategory = customCategoryText;
        }

        let finalClientId = selectedClientId;
        if (isNewClient && clientName) {
            const newClient: Client = {
                id: Date.now().toString(),
                name: clientName,
                createdAt: new Date()
            };
            addClient(newClient);
            finalClientId = newClient.id;
        }

        addTransaction({
            id: Date.now().toString(),
            type: 'invoice',
            title: serviceName,
            amount: `₪ ${parseFloat(totalAmount).toLocaleString()}`,
            date: new Date(),
            category: finalCategory,
            isIncome: true,
            cost: serviceCost ? `₪ ${serviceCost}` : undefined,
            status: paymentStatus,
            clientName,
            clientId: finalClientId || undefined,
            notes
        });

        setCreateAnotherAfterSave(createAnother);
        setShowSuccess(true);
    };

    const handleModalClose = () => {
        setShowSuccess(false);
        if (createAnotherAfterSave) {
            resetForm();
        } else {
            navigation.goBack();
        }
    };

    const resetForm = () => {
        setServiceName('');
        setQuantity('');
        setRate('');
        setTotalAmount('');
        setServiceCost('');
        setIsTotalLocked(false);
        setNotes('');
        setAttachment(null);
        setPaymentStatus('pending');
    };

    const handleCategorySelect = (cat: string) => {
        if (cat === 'אחר...') {
            setIsCustomCategory(true);
            setCategory('אחר...');
        } else {
            setIsCustomCategory(false);
            setCategory(cat);
        }
        setShowCatDropdown(false);
    };

    // --- Components ---
    const ServiceTypeCard = ({ type, label, icon: Icon }: any) => {
        const isSelected = serviceType === type;
        return (
            <TouchableOpacity
                style={[
                    styles.serviceTypeCard,
                    { backgroundColor: colors.surface, borderColor: colors.border },
                    isSelected && { borderColor: colors.primary, backgroundColor: colors.primaryMuted }
                ]}
                onPress={() => setServiceType(type)}
            >
                <Icon size={24} color={isSelected ? colors.primary : colors.textSecondary} />
                <Text style={[
                    styles.serviceTypeLabel,
                    { color: colors.textSecondary },
                    isSelected && { color: colors.primary }
                ]}>{label}</Text>
                {isSelected && <View style={[styles.activeDot, { backgroundColor: colors.primary }]} />}
            </TouchableOpacity>
        );
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
            <StatusBar style={isDark ? 'light' : 'dark'} />
            <SuccessModal
                visible={showSuccess}
                title="החשבונית נוצרה!"
                description={createAnotherAfterSave ? "החשבונית נשמרה. הטופס אופס עבורך." : "החשבונית נוספה בהצלחה לדשבורד."}
                onClose={handleModalClose}
                buttonText={createAnotherAfterSave ? "צור חדשה" : "חזור לדשבורד"}
            />

            {/* Header */}
            <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <ChevronRight size={28} color={colors.textPrimary} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>צור חשבונית</Text>
                <View style={{ width: 28 }} />
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

                    {/* SECTION 1: SERVICE TYPE SELECTOR */}
                    <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>בחר סוג שירות</Text>
                    <View style={styles.serviceTypesGrid}>
                        <ServiceTypeCard type="hourly" label="שעתי" icon={Clock} />
                        <ServiceTypeCard type="project" label="פרויקט" icon={Folder} />
                        <ServiceTypeCard type="package" label="חבילה" icon={Package} />
                        <ServiceTypeCard type="retainer" label="ריטיינר" icon={RotateCw} />
                    </View>

                    {/* SECTION 2: MAIN DETAILS */}
                    <View style={[styles.cardContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>

                        {/* Service Name */}
                        <View style={styles.inputContainer}>
                            <Text style={[styles.label, { color: colors.textSecondary }]}>שם השירות / הפרויקט</Text>
                            <TextInput
                                style={[styles.input, { backgroundColor: colors.background, borderColor: colors.border, color: colors.textPrimary }]}
                                placeholder="לדוגמה: עיצוב דף נחיתה"
                                placeholderTextColor={colors.textTertiary}
                                value={serviceName}
                                onChangeText={setServiceName}
                                textAlign="right"
                            />
                        </View>

                        {/* Client Name */}
                        <View style={[styles.inputContainer, { zIndex: 3000 }]}>
                            <Text style={[styles.label, { color: colors.textSecondary }]}>לקוח</Text>
                            {isNewClient ? (
                                <View style={styles.customCatRow}>
                                    <TextInput
                                        style={[styles.input, { flex: 1, backgroundColor: colors.background, borderColor: colors.border, color: colors.textPrimary }]}
                                        placeholder="שם הלקוח החדש"
                                        placeholderTextColor={colors.textTertiary}
                                        value={clientName}
                                        onChangeText={setClientName}
                                        textAlign="right"
                                    />
                                    <TouchableOpacity
                                        onPress={() => {
                                            setIsNewClient(false);
                                            setClientName('');
                                            setSelectedClientId(clients.length > 0 ? clients[0].id : null);
                                        }}
                                        style={[styles.closeIcon, { backgroundColor: colors.background, borderColor: colors.border }]}
                                    >
                                        <X size={20} color={colors.textSecondary} />
                                    </TouchableOpacity>
                                </View>
                            ) : (
                                <>
                                    <TouchableOpacity
                                        style={[styles.dropdownTrigger, { backgroundColor: colors.background, borderColor: colors.border }]}
                                        onPress={() => setShowClientDropdown(!showClientDropdown)}
                                    >
                                        <Text style={[styles.dropdownValue, { color: colors.textPrimary }]}>
                                            {selectedClientId
                                                ? clients.find(c => c.id === selectedClientId)?.name || 'בחר לקוח'
                                                : 'בחר לקוח'
                                            }
                                        </Text>
                                        <ChevronDown size={18} color={colors.textSecondary} />
                                    </TouchableOpacity>
                                    {showClientDropdown && (
                                        <View style={[styles.dropdownList, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                                            <ScrollView nestedScrollEnabled style={{ maxHeight: 250 }}>
                                                <TouchableOpacity
                                                    style={[styles.dropdownItem, { backgroundColor: colors.primaryMuted, borderBottomColor: colors.border }]}
                                                    onPress={() => {
                                                        setIsNewClient(true);
                                                        setSelectedClientId(null);
                                                        setShowClientDropdown(false);
                                                    }}
                                                >
                                                    <Plus size={16} color={colors.primary} />
                                                    <Text style={[styles.dropdownItemText, { color: colors.primary }]}>לקוח חדש</Text>
                                                </TouchableOpacity>
                                                {clients.map(client => (
                                                    <TouchableOpacity
                                                        key={client.id}
                                                        style={[
                                                            styles.dropdownItem,
                                                            { borderBottomColor: colors.border },
                                                            selectedClientId === client.id && { backgroundColor: colors.primaryMuted }
                                                        ]}
                                                        onPress={() => {
                                                            setSelectedClientId(client.id);
                                                            setClientName(client.name);
                                                            setShowClientDropdown(false);
                                                        }}
                                                    >
                                                        <User size={16} color={colors.textSecondary} />
                                                        <View>
                                                            <Text style={[styles.dropdownItemText, { color: colors.textPrimary }]}>{client.name}</Text>
                                                            {client.company && (
                                                                <Text style={[styles.dropdownItemSubtext, { color: colors.textTertiary }]}>{client.company}</Text>
                                                            )}
                                                        </View>
                                                    </TouchableOpacity>
                                                ))}
                                                {clients.length === 0 && (
                                                    <Text style={[styles.noClientsText, { color: colors.textTertiary }]}>אין לקוחות עדיין</Text>
                                                )}
                                            </ScrollView>
                                        </View>
                                    )}
                                </>
                            )}
                        </View>

                        {/* Category Dropdown */}
                        <View style={{ zIndex: 2000 }}>
                            <Text style={[styles.label, { color: colors.textSecondary }]}>קטגוריה</Text>
                            {isCustomCategory ? (
                                <View style={styles.customCatRow}>
                                    <TextInput
                                        style={[styles.input, { flex: 1, backgroundColor: colors.background, borderColor: colors.border, color: colors.textPrimary }]}
                                        placeholder="הזן קטגוריה חדשה"
                                        placeholderTextColor={colors.textTertiary}
                                        value={customCategoryText}
                                        onChangeText={setCustomCategoryText}
                                        textAlign="right"
                                    />
                                    <TouchableOpacity
                                        onPress={() => { setIsCustomCategory(false); setCategory(categories[0]); }}
                                        style={[styles.closeIcon, { backgroundColor: colors.background, borderColor: colors.border }]}
                                    >
                                        <X size={20} color={colors.textSecondary} />
                                    </TouchableOpacity>
                                </View>
                            ) : (
                                <TouchableOpacity
                                    style={[styles.dropdownTrigger, { backgroundColor: colors.background, borderColor: colors.border }]}
                                    onPress={() => setShowCatDropdown(!showCatDropdown)}
                                >
                                    <Text style={[styles.dropdownValue, { color: colors.textPrimary }]}>{category}</Text>
                                    <ChevronDown size={20} color={colors.textSecondary} />
                                </TouchableOpacity>
                            )}

                            {showCatDropdown && (
                                <View style={[styles.dropdownList, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                                    <ScrollView style={{ maxHeight: 200 }} nestedScrollEnabled>
                                        {categories.map((cat, idx) => (
                                            <TouchableOpacity
                                                key={idx}
                                                style={[styles.dropdownItem, { borderBottomColor: colors.border }]}
                                                onPress={() => handleCategorySelect(cat)}
                                            >
                                                <Text style={[styles.dropdownItemText, { color: colors.textPrimary }]}>{cat}</Text>
                                                {category === cat && <CheckCircle size={14} color={colors.primary} />}
                                            </TouchableOpacity>
                                        ))}
                                    </ScrollView>
                                </View>
                            )}
                        </View>
                    </View>

                    {/* SECTION 3: PRICING LOGIC */}
                    <View style={[styles.cardContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>

                        {(serviceType !== 'project') && (
                            <View style={styles.row}>
                                <View style={{ flex: 1, marginLeft: 12 }}>
                                    <Text style={[styles.label, { color: colors.textSecondary }]}>{unit || 'כמות'}</Text>
                                    <TextInput
                                        style={[styles.input, { backgroundColor: colors.background, borderColor: colors.border, color: colors.textPrimary }]}
                                        placeholder="0"
                                        placeholderTextColor={colors.textTertiary}
                                        keyboardType="numeric"
                                        value={quantity}
                                        onChangeText={setQuantity}
                                        textAlign="center"
                                    />
                                </View>
                                <View style={{ flex: 1.5 }}>
                                    <Text style={[styles.label, { color: colors.textSecondary }]}>מחיר ל{unit ? unit.slice(0, -1) : 'יחידה'}</Text>
                                    <View style={[styles.moneyInput, { backgroundColor: colors.background, borderColor: colors.border }]}>
                                        <Text style={[styles.currencySymbol, { color: colors.textSecondary }]}>₪</Text>
                                        <TextInput
                                            style={[styles.moneyTextInput, { color: colors.textPrimary }]}
                                            placeholder="0.00"
                                            placeholderTextColor={colors.textTertiary}
                                            keyboardType="numeric"
                                            value={rate}
                                            onChangeText={setRate}
                                            textAlign="right"
                                        />
                                    </View>
                                </View>
                            </View>
                        )}

                        {(serviceType === 'project' || serviceType === 'hourly' || serviceType === 'retainer') && (
                            <View style={[styles.inputContainer, { marginTop: 12 }]}>
                                <Text style={[styles.label, { color: colors.textSecondary }]}>עלות השירות (הוצאה שלי)</Text>
                                <View style={[styles.moneyInput, { backgroundColor: colors.background, borderColor: colors.border }]}>
                                    <Text style={[styles.currencySymbol, { color: colors.textSecondary }]}>₪</Text>
                                    <TextInput
                                        style={[styles.moneyTextInput, { color: colors.textPrimary }]}
                                        placeholder="0.00"
                                        placeholderTextColor={colors.textTertiary}
                                        keyboardType="numeric"
                                        value={serviceCost}
                                        onChangeText={setServiceCost}
                                        textAlign="right"
                                    />
                                </View>
                            </View>
                        )}

                        {averagePrice > 0 && serviceType !== 'project' && (
                            <TouchableOpacity
                                style={[styles.suggestionBubble, { backgroundColor: colors.infoMuted }]}
                                onPress={() => setRate(averagePrice.toString())}
                            >
                                <Info size={14} color={colors.info} />
                                <Text style={[styles.suggestionText, { color: colors.info }]}>תמחור ממוצע לקטגוריה: ₪{averagePrice}</Text>
                            </TouchableOpacity>
                        )}

                        {/* Total Amount */}
                        <View style={[styles.totalSection, { borderTopColor: colors.border }]}>
                            <Text style={[styles.totalLabel, { color: colors.textSecondary }]}>סה״כ לתשלום</Text>
                            <View style={styles.totalInputContainer}>
                                <Text style={[styles.totalCurrency, { color: colors.primary }]}>₪</Text>
                                <TextInput
                                    style={[styles.totalInput, { color: colors.textPrimary }]}
                                    placeholder="0.00"
                                    placeholderTextColor={colors.textQuaternary}
                                    keyboardType="numeric"
                                    value={totalAmount}
                                    onChangeText={(val) => {
                                        setTotalAmount(val);
                                        setIsTotalLocked(true);
                                    }}
                                    textAlign="left"
                                />
                            </View>
                        </View>
                    </View>

                    {/* SECTION 4: DATES & STATUS */}
                    <View style={[styles.cardContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                        <View style={styles.row}>
                            <View style={{ flex: 1, marginLeft: 12 }}>
                                <Text style={[styles.label, { color: colors.textSecondary }]}>תאריך העבודה</Text>
                                <View style={[styles.dateDisplay, { backgroundColor: colors.background, borderColor: colors.border }]}>
                                    <Text style={[styles.dateDisplayText, { color: colors.textPrimary }]}>{serviceDate}</Text>
                                    <Calendar size={16} color={colors.textSecondary} />
                                </View>
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={[styles.label, { color: colors.textSecondary }]}>תאריך דרישה</Text>
                                <View style={[styles.dateDisplay, { backgroundColor: colors.background, borderColor: colors.border }]}>
                                    <Text style={[styles.dateDisplayText, { color: colors.textPrimary }]}>{invoiceDate}</Text>
                                    <Calendar size={16} color={colors.textSecondary} />
                                </View>
                            </View>
                        </View>

                        <Text style={[styles.label, { marginTop: 16, color: colors.textSecondary }]}>סטטוס תשלום</Text>
                        <View style={styles.statusRow}>
                            {['pending', 'paid', 'overdue'].map((status) => {
                                const isActive = paymentStatus === status;
                                const statusColors = {
                                    pending: colors.warning,
                                    paid: colors.success,
                                    overdue: colors.danger,
                                };
                                const activeColor = statusColors[status as keyof typeof statusColors];

                                return (
                                    <TouchableOpacity
                                        key={status}
                                        style={[
                                            styles.statusChip,
                                            { backgroundColor: colors.background, borderColor: colors.border },
                                            isActive && { backgroundColor: activeColor, borderColor: activeColor }
                                        ]}
                                        onPress={() => setPaymentStatus(status as TransactionStatus)}
                                    >
                                        <Text style={[
                                            styles.statusText,
                                            { color: colors.textSecondary },
                                            isActive && { color: '#FFFFFF' }
                                        ]}>
                                            {status === 'pending' ? 'ממתין' : status === 'paid' ? 'שולם' : 'בפיגור'}
                                        </Text>
                                    </TouchableOpacity>
                                )
                            })}
                        </View>
                    </View>

                    {/* Actions */}
                    <View style={styles.footerActions}>
                        <TouchableOpacity style={[styles.saveBtn, { backgroundColor: colors.primary }]} onPress={() => handleSave(false)}>
                            <Text style={styles.saveBtnText}>צור חשבונית</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.secondaryBtn} onPress={() => handleSave(true)}>
                            <Text style={[styles.secondaryBtnText, { color: colors.primary }]}>שמור וצור חדשה</Text>
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
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: LAYOUT.screenPadding,
        paddingVertical: SPACING.lg,
        borderBottomWidth: 1,
    },
    backButton: { padding: SPACING.sm },
    headerTitle: {
        ...TYPOGRAPHY.h3,
    },
    content: { padding: LAYOUT.screenPadding },

    sectionTitle: {
        ...TYPOGRAPHY.caption,
        fontFamily: FONTS.medium,
        marginBottom: SPACING.md,
        marginLeft: SPACING.xs,
        textAlign: 'left'
    },
    serviceTypesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginBottom: SPACING.xl,
        gap: SPACING.md,
    },
    serviceTypeCard: {
        width: '48%',
        borderRadius: RADIUS.lg,
        padding: SPACING.lg,
        alignItems: 'center',
        borderWidth: 1,
        gap: SPACING.sm,
    },
    serviceTypeLabel: {
        ...TYPOGRAPHY.caption,
        fontFamily: FONTS.medium,
    },
    activeDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        position: 'absolute',
        top: 10,
        right: 10,
    },

    cardContainer: {
        borderRadius: RADIUS.lg,
        padding: SPACING.lg,
        marginBottom: SPACING.lg,
        borderWidth: 1,
        gap: SPACING.lg,
    },
    inputContainer: { gap: SPACING.sm },
    label: {
        ...TYPOGRAPHY.caption,
        fontFamily: FONTS.medium,
        textAlign: 'left',
    },
    input: {
        borderWidth: 1,
        borderRadius: RADIUS.md,
        padding: SPACING.md,
        ...TYPOGRAPHY.body,
    },

    customCatRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.sm,
    },
    closeIcon: {
        padding: SPACING.sm,
        borderRadius: RADIUS.md,
        borderWidth: 1,
    },

    dropdownTrigger: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderWidth: 1,
        borderRadius: RADIUS.md,
        padding: SPACING.md,
    },
    dropdownValue: {
        ...TYPOGRAPHY.body,
    },
    dropdownList: {
        position: 'absolute',
        top: '100%',
        left: 0,
        right: 0,
        borderWidth: 1,
        borderRadius: RADIUS.md,
        zIndex: 5000,
        marginTop: SPACING.xs,
        elevation: 5,
        ...SHADOWS.lg,
    },
    dropdownItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: SPACING.md,
        borderBottomWidth: 1,
        gap: SPACING.sm,
    },
    dropdownItemText: {
        ...TYPOGRAPHY.body,
    },
    dropdownItemSubtext: {
        ...TYPOGRAPHY.caption,
        marginTop: 2,
    },
    noClientsText: {
        ...TYPOGRAPHY.body,
        padding: SPACING.lg,
        textAlign: 'center',
    },

    row: { flexDirection: 'row' },
    moneyInput: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderRadius: RADIUS.md,
        paddingHorizontal: SPACING.lg,
    },
    currencySymbol: {
        ...TYPOGRAPHY.body,
        marginRight: SPACING.xs,
        fontFamily: FONTS.medium,
    },
    moneyTextInput: {
        flex: 1,
        paddingVertical: SPACING.md,
        ...TYPOGRAPHY.body,
    },

    suggestionBubble: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: SPACING.sm,
        borderRadius: RADIUS.sm,
        alignSelf: 'flex-start',
    },
    suggestionText: {
        ...TYPOGRAPHY.caption,
        marginLeft: SPACING.sm,
        fontFamily: FONTS.medium,
    },

    totalSection: {
        marginTop: SPACING.sm,
        borderTopWidth: 1,
        paddingTop: SPACING.lg,
    },
    totalLabel: {
        ...TYPOGRAPHY.caption,
        fontFamily: FONTS.medium,
        marginBottom: SPACING.sm,
        textAlign: 'left',
    },
    totalInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    totalCurrency: {
        fontSize: 24,
        fontFamily: FONTS.bold,
        marginRight: SPACING.sm,
    },
    totalInput: {
        fontSize: 32,
        fontFamily: FONTS.bold,
        minWidth: 120,
        textAlign: 'center',
    },

    dateDisplay: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderWidth: 1,
        borderRadius: RADIUS.md,
        padding: SPACING.md,
    },
    dateDisplayText: {
        ...TYPOGRAPHY.body,
    },

    statusRow: {
        flexDirection: 'row-reverse',
        gap: SPACING.sm,
    },
    statusChip: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: SPACING.sm,
        borderRadius: RADIUS.md,
        borderWidth: 1,
    },
    statusText: {
        ...TYPOGRAPHY.caption,
        fontFamily: FONTS.medium,
    },

    footerActions: { gap: SPACING.md, marginTop: SPACING.md },
    saveBtn: {
        borderRadius: RADIUS.md,
        paddingVertical: SPACING.lg,
        alignItems: 'center',
        ...SHADOWS.md,
    },
    saveBtnText: {
        color: '#FFFFFF',
        ...TYPOGRAPHY.label,
    },
    secondaryBtn: {
        alignItems: 'center',
        paddingVertical: SPACING.sm,
    },
    secondaryBtnText: {
        ...TYPOGRAPHY.label,
    },
});
