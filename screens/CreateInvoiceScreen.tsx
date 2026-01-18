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
    FileText
} from 'lucide-react-native';
import { useTransactions, TransactionStatus, Client } from '../context/TransactionsContext';
import { COLORS, FONTS } from '../constants/theme';
import { SuccessModal } from '../components/SuccessModal';
import { Plus, User } from 'lucide-react-native';

const { width } = Dimensions.get('window');
type ServiceType = 'hourly' | 'project' | 'package' | 'retainer';

export default function CreateInvoiceScreen() {
    const navigation = useNavigation<any>();
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
    const [unit, setUnit] = useState('שעות'); // Default label
    const [rate, setRate] = useState('');
    const [totalAmount, setTotalAmount] = useState('');
    const [serviceCost, setServiceCost] = useState('');

    const [isTotalLocked, setIsTotalLocked] = useState(false);

    // Dates
    const [serviceDate, setServiceDate] = useState(new Date().toLocaleDateString('he-IL'));
    const [invoiceDate, setInvoiceDate] = useState(new Date().toLocaleDateString('he-IL'));

    const [paymentStatus, setPaymentStatus] = useState<TransactionStatus>('pending'); // Default pending
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
        // Update Unit Label based on Service Type
        if (serviceType === 'hourly') setUnit('שעות');
        if (serviceType === 'package') setUnit('יחידות');
        if (serviceType === 'project') setUnit(''); // Hidden often
        if (serviceType === 'retainer') setUnit('חודשים');

        setIsTotalLocked(false);
    }, [serviceType]);

    useEffect(() => {
        // Auto Calculate Total
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
            alert('אנא מלא שם שירות וסכום'); // Could use a customtoast here too
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
            title: serviceName, // Simplified title
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
                style={[styles.serviceTypeCard, isSelected && styles.serviceTypeCardActive]}
                onPress={() => setServiceType(type)}
            >
                <Icon size={24} color={isSelected ? COLORS.primary : COLORS.textSecondary} />
                <Text style={[styles.serviceTypeLabel, isSelected && styles.serviceTypeLabelActive]}>{label}</Text>
                {isSelected && <View style={styles.activeDot} />}
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            <StatusBar style="light" backgroundColor={COLORS.background} />
            <SuccessModal
                visible={showSuccess}
                title="החשבונית נוצרה!"
                description={createAnotherAfterSave ? "החשבונית נשמרה. הטופס אופס עבורך." : "החשבונית נוספה בהצלחה לדשבורד."}
                onClose={handleModalClose}
                buttonText={createAnotherAfterSave ? "צור חדשה" : "חזור לדשבורד"}
            />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <ChevronRight size={28} color={COLORS.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>צור חשבונית</Text>
                <View style={{ width: 28 }} />
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

                    {/* SECTION 1: SERVICE TYPE SELECTOR */}
                    <Text style={styles.sectionTitle}>בחר סוג שירות</Text>
                    <View style={styles.serviceTypesGrid}>
                        <ServiceTypeCard type="hourly" label="שעתי" icon={Clock} />
                        <ServiceTypeCard type="project" label="פרויקט" icon={Folder} />
                        <ServiceTypeCard type="package" label="חבילה" icon={Package} />
                        <ServiceTypeCard type="retainer" label="ריטיינר" icon={RotateCw} />
                    </View>

                    {/* SECTION 2: MAIN DETAILS */}
                    <View style={styles.cardContainer}>

                        {/* Service Name */}
                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>שם השירות / הפרויקט</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="לדוגמה: עיצוב דף נחיתה"
                                placeholderTextColor={COLORS.textSecondary}
                                value={serviceName}
                                onChangeText={setServiceName}
                                textAlign="right"
                            />
                        </View>

                        {/* Client Name */}
                        <View style={[styles.inputContainer, { zIndex: 3000 }]}>
                            <Text style={styles.label}>לקוח</Text>
                            {isNewClient ? (
                                <View style={styles.customCatRow}>
                                    <TextInput
                                        style={[styles.input, { flex: 1 }]}
                                        placeholder="שם הלקוח החדש"
                                        placeholderTextColor={COLORS.textSecondary}
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
                                        style={styles.closeIcon}
                                    >
                                        <X size={20} color={COLORS.textSecondary} />
                                    </TouchableOpacity>
                                </View>
                            ) : (
                                <>
                                    <TouchableOpacity
                                        style={styles.dropdownTrigger}
                                        onPress={() => setShowClientDropdown(!showClientDropdown)}
                                    >
                                        <Text style={styles.dropdownValue}>
                                            {selectedClientId
                                                ? clients.find(c => c.id === selectedClientId)?.name || 'בחר לקוח'
                                                : 'בחר לקוח'
                                            }
                                        </Text>
                                        <ChevronDown size={18} color={COLORS.textSecondary} />
                                    </TouchableOpacity>
                                    {showClientDropdown && (
                                        <View style={[styles.dropdownList, { maxHeight: 250 }]}>
                                            <ScrollView nestedScrollEnabled>
                                                {/* New Client Option */}
                                                <TouchableOpacity
                                                    style={[styles.dropdownItem, { backgroundColor: `${COLORS.primary}10` }]}
                                                    onPress={() => {
                                                        setIsNewClient(true);
                                                        setSelectedClientId(null);
                                                        setShowClientDropdown(false);
                                                    }}
                                                >
                                                    <Plus size={16} color={COLORS.primary} />
                                                    <Text style={[styles.dropdownItemText, { color: COLORS.primary }]}>לקוח חדש</Text>
                                                </TouchableOpacity>
                                                {/* Existing Clients */}
                                                {clients.map(client => (
                                                    <TouchableOpacity
                                                        key={client.id}
                                                        style={[
                                                            styles.dropdownItem,
                                                            selectedClientId === client.id && styles.dropdownItemActive
                                                        ]}
                                                        onPress={() => {
                                                            setSelectedClientId(client.id);
                                                            setClientName(client.name);
                                                            setShowClientDropdown(false);
                                                        }}
                                                    >
                                                        <User size={16} color={COLORS.textSecondary} />
                                                        <View>
                                                            <Text style={styles.dropdownItemText}>{client.name}</Text>
                                                            {client.company && (
                                                                <Text style={styles.dropdownItemSubtext}>{client.company}</Text>
                                                            )}
                                                        </View>
                                                    </TouchableOpacity>
                                                ))}
                                                {clients.length === 0 && (
                                                    <Text style={styles.noClientsText}>אין לקוחות עדיין</Text>
                                                )}
                                            </ScrollView>
                                        </View>
                                    )}
                                </>
                            )}
                        </View>

                        {/* Category Dropdown */}
                        <View style={{ zIndex: 2000 }}>
                            <Text style={styles.label}>קטגוריה</Text>
                            {isCustomCategory ? (
                                <View style={styles.customCatRow}>
                                    <TextInput
                                        style={[styles.input, { flex: 1 }]}
                                        placeholder="הזן קטגוריה חדשה"
                                        placeholderTextColor={COLORS.textSecondary}
                                        value={customCategoryText}
                                        onChangeText={setCustomCategoryText}
                                        textAlign="right"
                                    />
                                    <TouchableOpacity onPress={() => { setIsCustomCategory(false); setCategory(categories[0]); }} style={styles.closeIcon}>
                                        <X size={20} color={COLORS.textSecondary} />
                                    </TouchableOpacity>
                                </View>
                            ) : (
                                <TouchableOpacity
                                    style={styles.dropdownTrigger}
                                    onPress={() => setShowCatDropdown(!showCatDropdown)}
                                >
                                    <Text style={styles.dropdownValue}>{category}</Text>
                                    <ChevronDown size={20} color={COLORS.textSecondary} />
                                </TouchableOpacity>
                            )}

                            {showCatDropdown && (
                                <View style={styles.dropdownList}>
                                    <ScrollView style={{ maxHeight: 200 }} nestedScrollEnabled>
                                        {categories.map((cat, idx) => (
                                            <TouchableOpacity key={idx} style={styles.dropdownItem} onPress={() => handleCategorySelect(cat)}>
                                                <Text style={styles.dropdownItemText}>{cat}</Text>
                                                {category === cat && <CheckCircle size={14} color={COLORS.primary} />}
                                            </TouchableOpacity>
                                        ))}
                                    </ScrollView>
                                </View>
                            )}
                        </View>
                    </View>

                    {/* SECTION 3: PRICING LOGIC */}
                    <View style={styles.cardContainer}>

                        {/* Dynamic Fields based on Service Type */}
                        {(serviceType !== 'project') && (
                            <View style={styles.row}>
                                {/* Quantity */}
                                <View style={{ flex: 1, marginLeft: 12 }}>
                                    <Text style={styles.label}>{unit || 'כמות'}</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="0"
                                        placeholderTextColor={COLORS.textSecondary}
                                        keyboardType="numeric"
                                        value={quantity}
                                        onChangeText={setQuantity}
                                        textAlign="center"
                                    />
                                </View>
                                {/* Rate */}
                                <View style={{ flex: 1.5 }}>
                                    <Text style={styles.label}>מחיר ל{unit ? unit.slice(0, -1) : 'יחידה'}</Text>
                                    <View style={styles.moneyInput}>
                                        <Text style={styles.currencySymbol}>₪</Text>
                                        <TextInput
                                            style={styles.moneyTextInput}
                                            placeholder="0.00"
                                            placeholderTextColor={COLORS.textSecondary}
                                            keyboardType="numeric"
                                            value={rate}
                                            onChangeText={setRate}
                                            textAlign="right"
                                        />
                                    </View>
                                </View>
                            </View>
                        )}

                        {/* Service Cost (My Cost) - Only for Service-based */}
                        {(serviceType === 'project' || serviceType === 'hourly' || serviceType === 'retainer') && (
                            <View style={[styles.inputContainer, { marginTop: 12 }]}>
                                <Text style={styles.label}>עלות השירות (הוצאה שלי)</Text>
                                <View style={styles.moneyInput}>
                                    <Text style={styles.currencySymbol}>₪</Text>
                                    <TextInput
                                        style={styles.moneyTextInput}
                                        placeholder="0.00"
                                        placeholderTextColor={COLORS.textSecondary}
                                        keyboardType="numeric"
                                        value={serviceCost}
                                        onChangeText={setServiceCost}
                                        textAlign="right"
                                    />
                                </View>
                            </View>
                        )}

                        {/* Suggestion Bubble */}
                        {averagePrice > 0 && serviceType !== 'project' && (
                            <TouchableOpacity
                                style={styles.suggestionBubble}
                                onPress={() => setRate(averagePrice.toString())}
                            >
                                <Info size={14} color={COLORS.secondary} />
                                <Text style={styles.suggestionText}>תמחור ממוצע לקטגוריה: ₪{averagePrice}</Text>
                            </TouchableOpacity>
                        )}

                        {/* Total Amount - Highlighted */}
                        <View style={styles.totalSection}>
                            <Text style={styles.totalLabel}>סה״כ לתשלום</Text>
                            <View style={styles.totalInputContainer}>
                                <Text style={styles.totalCurrency}>₪</Text>
                                <TextInput
                                    style={styles.totalInput}
                                    placeholder="0.00"
                                    placeholderTextColor="rgba(132, 101, 243, 0.3)" // Keep as is or map if necessary
                                    keyboardType="numeric"
                                    value={totalAmount}
                                    onChangeText={(val) => {
                                        setTotalAmount(val);
                                        setIsTotalLocked(true);
                                    }}
                                    textAlign="left" // LTR for numbers looks better usually, but sticking to RTL logic
                                />
                            </View>
                        </View>

                    </View>

                    {/* SECTION 4: DATES & STATUS */}
                    <View style={styles.cardContainer}>
                        <View style={styles.row}>
                            <View style={{ flex: 1, marginLeft: 12 }}>
                                <Text style={styles.label}>תאריך העבודה</Text>
                                <View style={styles.dateDisplay}>
                                    <Text style={styles.dateDisplayText}>{serviceDate}</Text>
                                    <Calendar size={16} color={COLORS.textSecondary} />
                                </View>
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.label}>תאריך דרישה</Text>
                                <View style={styles.dateDisplay}>
                                    <Text style={styles.dateDisplayText}>{invoiceDate}</Text>
                                    <Calendar size={16} color={COLORS.textSecondary} />
                                </View>
                            </View>
                        </View>

                        <Text style={[styles.label, { marginTop: 16 }]}>סטטוס תשלום</Text>
                        <View style={styles.statusRow}>
                            {['pending', 'paid', 'overdue'].map((status) => {
                                const activeStyle =
                                    status === 'pending' ? styles.pendingActive :
                                        status === 'paid' ? styles.paidActive :
                                            styles.overdueActive;

                                return (
                                    <TouchableOpacity
                                        key={status}
                                        style={[styles.statusChip, paymentStatus === status && activeStyle]}
                                        onPress={() => setPaymentStatus(status as TransactionStatus)}
                                    >
                                        <Text style={[styles.statusText, paymentStatus === status && { color: COLORS.white }]}>
                                            {status === 'pending' ? 'ממתין' : status === 'paid' ? 'שולם' : 'בפיגור'}
                                        </Text>
                                    </TouchableOpacity>
                                )
                            })}
                        </View>
                    </View>

                    {/* Actions */}
                    <View style={styles.footerActions}>
                        <TouchableOpacity style={styles.saveBtn} onPress={() => handleSave(false)}>
                            <Text style={styles.saveBtnText}>צור חשבונית</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.secondaryBtn} onPress={() => handleSave(true)}>
                            <Text style={styles.secondaryBtnText}>שמור וצור חדשה</Text>
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
    content: { padding: 20 },

    sectionTitle: {
        color: COLORS.textSecondary,
        fontSize: 14,
        fontFamily: FONTS.medium,
        marginBottom: 12,
        marginLeft: 4,
        textAlign: 'left'
    },
    serviceTypesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginBottom: 24,
        gap: 12,
    },
    serviceTypeCard: {
        width: '48%',
        backgroundColor: COLORS.surface,
        borderRadius: 16,
        padding: 16,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.border,
        gap: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 3,
        elevation: 2,
    },
    serviceTypeCardActive: {
        borderColor: COLORS.primary,
        backgroundColor: 'rgba(0, 212, 170, 0.1)', // Primary with opacity
    },
    serviceTypeLabel: {
        color: COLORS.textSecondary,
        fontSize: 14,
        fontFamily: FONTS.medium,
    },
    serviceTypeLabelActive: {
        color: COLORS.primary,
    },
    activeDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: COLORS.primary,
        position: 'absolute',
        top: 10,
        right: 10,
    },

    cardContainer: {
        backgroundColor: COLORS.surface,
        borderRadius: 16,
        padding: 20,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: COLORS.border,
        gap: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    inputContainer: { gap: 8 },
    label: {
        color: COLORS.textSecondary,
        fontSize: 12,
        fontFamily: FONTS.medium,
        textAlign: 'left',
    },
    input: {
        backgroundColor: COLORS.background,
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: 12,
        padding: 14,
        color: COLORS.textPrimary,
        fontSize: 16,
        fontFamily: FONTS.regular,
    },

    // Custom Cat
    customCatRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    closeIcon: {
        padding: 10,
        backgroundColor: COLORS.background,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: COLORS.border,
    },

    // Dropdown
    dropdownTrigger: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: COLORS.background,
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: 12,
        padding: 14,
    },
    dropdownValue: {
        color: COLORS.textPrimary,
        fontSize: 16,
        fontFamily: FONTS.regular,
    },
    dropdownList: {
        position: 'absolute',
        top: '100%',
        left: 0,
        right: 0,
        backgroundColor: COLORS.surface,
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: 12,
        zIndex: 5000,
        marginTop: 4,
        elevation: 5,
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
    },
    dropdownItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 14,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    dropdownItemText: {
        color: COLORS.textSecondary,
        fontSize: 14,
        fontFamily: FONTS.regular,
    },
    dropdownItemActive: {
        backgroundColor: `${COLORS.primary}10`,
    },
    dropdownItemSubtext: {
        color: COLORS.textTertiary,
        fontSize: 12,
        fontFamily: FONTS.regular,
        marginTop: 2,
    },
    noClientsText: {
        color: COLORS.textTertiary,
        fontSize: 14,
        fontFamily: FONTS.regular,
        padding: 16,
        textAlign: 'center',
    },

    // Money
    row: { flexDirection: 'row' },
    moneyInput: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.background,
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: 12,
        paddingHorizontal: 16,
    },
    currencySymbol: {
        color: COLORS.textSecondary,
        fontSize: 16,
        marginRight: 4,
        fontFamily: FONTS.medium,
    },
    moneyTextInput: {
        flex: 1,
        color: COLORS.textPrimary,
        paddingVertical: 14,
        fontSize: 16,
        fontFamily: FONTS.regular,
    },

    // Suggestion
    suggestionBubble: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(108, 99, 255, 0.1)', // Keep secondary faint for suggestion
        padding: 10,
        borderRadius: 8,
        alignSelf: 'flex-start',
    },
    suggestionText: {
        color: COLORS.secondary,
        fontSize: 12,
        marginLeft: 8,
        fontFamily: FONTS.medium,
    },

    // Total
    totalSection: {
        marginTop: 8,
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
        paddingTop: 16,
    },
    totalLabel: {
        color: COLORS.textSecondary,
        fontSize: 14,
        fontFamily: FONTS.medium,
        marginBottom: 8,
        textAlign: 'left',
    },
    totalInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    totalCurrency: {
        fontSize: 24,
        color: COLORS.primary,
        fontFamily: FONTS.bold,
        marginRight: 8,
    },
    totalInput: {
        fontSize: 32,
        color: COLORS.textPrimary,
        fontFamily: FONTS.bold,
        minWidth: 120,
        textAlign: 'center',
    },

    // Dates
    dateDisplay: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: COLORS.background,
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: 12,
        padding: 14,
    },
    dateDisplayText: {
        color: COLORS.textPrimary,
        fontSize: 14,
        fontFamily: FONTS.regular,
    },

    // Status
    statusRow: {
        flexDirection: 'row-reverse',
        gap: 8,
    },
    statusChip: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 10,
        borderRadius: 12,
        backgroundColor: COLORS.background,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    statusText: {
        color: COLORS.textSecondary,
        fontSize: 12,
        fontFamily: FONTS.medium,
    },
    pendingActive: { backgroundColor: COLORS.warning, borderColor: COLORS.warning },
    paidActive: { backgroundColor: COLORS.success, borderColor: COLORS.success },
    overdueActive: { backgroundColor: COLORS.danger, borderColor: COLORS.danger },

    // Footer
    footerActions: { gap: 12, marginTop: 12 },
    saveBtn: {
        backgroundColor: COLORS.primary,
        borderRadius: 12,
        paddingVertical: 18,
        alignItems: 'center',
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    saveBtnText: {
        color: COLORS.white, // Keep button text white for contrast
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
