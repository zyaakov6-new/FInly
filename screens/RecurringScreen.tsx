import React, { useState, useEffect, useRef } from 'react';
import {
    StyleSheet,
    Text,
    View,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Modal,
    Platform,
    Alert,
    Animated,
    Switch
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft, Plus, Repeat, Clock, Calendar, Edit2, Trash2, X, DollarSign, TrendingUp, TrendingDown } from 'lucide-react-native';
import { useTransactions, RecurringTransaction, Transaction } from '../context/TransactionsContext';
import { COLORS, FONTS } from '../constants/theme';

const FREQUENCY_OPTIONS = [
    { value: 'daily', label: 'יומי' },
    { value: 'weekly', label: 'שבועי' },
    { value: 'monthly', label: 'חודשי' },
    { value: 'yearly', label: 'שנתי' }
] as const;

export default function RecurringScreen() {
    const navigation = useNavigation<any>();
    const {
        recurringTransactions,
        addRecurringTransaction,
        updateRecurringTransaction,
        deleteRecurringTransaction,
        toggleRecurringActive,
        categories
    } = useTransactions();

    const [modalVisible, setModalVisible] = useState(false);
    const [editingRecurring, setEditingRecurring] = useState<RecurringTransaction | null>(null);

    // Animation
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
        }).start();
    }, []);

    // Form state
    const [formData, setFormData] = useState({
        title: '',
        amount: '',
        category: '',
        isIncome: false,
        frequency: 'monthly' as 'daily' | 'weekly' | 'monthly' | 'yearly',
        notes: '',
        startDate: new Date(),
        endDate: null as Date | null
    });

    const formatDate = (date: Date) => {
        return date.toLocaleDateString('he-IL', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    const adjustDate = (field: 'startDate' | 'endDate', days: number) => {
        setFormData(prev => {
            const currentDate = field === 'endDate' && prev.endDate === null ? new Date() : (prev[field] || new Date());
            const newDate = new Date(currentDate);
            newDate.setDate(newDate.getDate() + days);
            return { ...prev, [field]: newDate };
        });
    };

    const openAddModal = () => {
        setEditingRecurring(null);
        setFormData({
            title: '',
            amount: '',
            category: categories[0] || '',
            isIncome: false,
            frequency: 'monthly',
            notes: '',
            startDate: new Date(),
            endDate: null
        });
        setModalVisible(true);
    };

    const openEditModal = (recurring: RecurringTransaction) => {
        setEditingRecurring(recurring);
        setFormData({
            title: recurring.templateTransaction.title,
            amount: recurring.templateTransaction.amount.replace(/[^0-9.-]+/g, ''),
            category: recurring.templateTransaction.category || '',
            isIncome: recurring.templateTransaction.isIncome,
            frequency: recurring.frequency,
            notes: recurring.templateTransaction.notes || '',
            startDate: new Date(recurring.startDate),
            endDate: recurring.endDate ? new Date(recurring.endDate) : null
        });
        setModalVisible(true);
    };

    const handleSave = () => {
        if (!formData.title.trim() || !formData.amount.trim()) {
            Alert.alert('שגיאה', 'נא למלא כותרת וסכום');
            return;
        }

        const templateTransaction: Omit<Transaction, 'id' | 'date'> = {
            type: formData.isIncome ? 'invoice' : 'expense',
            title: formData.title,
            amount: `₪ ${parseInt(formData.amount).toLocaleString()}`,
            category: formData.category,
            isIncome: formData.isIncome,
            notes: formData.notes
        };

        if (editingRecurring) {
            updateRecurringTransaction(editingRecurring.id, {
                templateTransaction,
                frequency: formData.frequency,
                startDate: formData.startDate,
                endDate: formData.endDate || undefined
            });
        } else {
            const newRecurring: RecurringTransaction = {
                id: Date.now().toString(),
                templateTransaction,
                frequency: formData.frequency,
                startDate: formData.startDate,
                nextOccurrence: formData.startDate,
                endDate: formData.endDate || undefined,
                isActive: true
            };
            addRecurringTransaction(newRecurring);
        }
        setModalVisible(false);
    };

    const handleDelete = (id: string) => {
        Alert.alert(
            'מחיקת עסקה חוזרת',
            'האם אתה בטוח שברצונך למחוק?',
            [
                { text: 'ביטול', style: 'cancel' },
                { text: 'מחק', style: 'destructive', onPress: () => deleteRecurringTransaction(id) }
            ]
        );
    };

    const getFrequencyLabel = (frequency: string) => {
        return FREQUENCY_OPTIONS.find(f => f.value === frequency)?.label || frequency;
    };

    const RecurringCard = ({ item }: { item: RecurringTransaction }) => {
        const isIncome = item.templateTransaction.isIncome;

        return (
            <Animated.View style={{ opacity: fadeAnim }}>
                <TouchableOpacity
                    style={[styles.card, !item.isActive && styles.cardInactive]}
                    onPress={() => openEditModal(item)}
                    activeOpacity={0.7}
                >
                    <View style={styles.cardHeader}>
                        <View style={[styles.iconBg, { backgroundColor: isIncome ? `${COLORS.success}15` : `${COLORS.danger}15` }]}>
                            {isIncome ? (
                                <TrendingUp size={20} color={COLORS.success} />
                            ) : (
                                <TrendingDown size={20} color={COLORS.danger} />
                            )}
                        </View>
                        <View style={styles.cardInfo}>
                            <Text style={styles.cardTitle}>{item.templateTransaction.title}</Text>
                            <View style={styles.frequencyBadge}>
                                <Repeat size={12} color={COLORS.textSecondary} />
                                <Text style={styles.frequencyText}>{getFrequencyLabel(item.frequency)}</Text>
                            </View>
                        </View>
                        <View style={styles.cardRight}>
                            <Text style={[styles.cardAmount, { color: isIncome ? COLORS.success : COLORS.danger }]}>
                                {item.templateTransaction.amount}
                            </Text>
                            <Switch
                                value={item.isActive}
                                onValueChange={() => toggleRecurringActive(item.id)}
                                trackColor={{ false: COLORS.border, true: `${COLORS.success}50` }}
                                thumbColor={item.isActive ? COLORS.success : COLORS.textTertiary}
                            />
                        </View>
                    </View>
                </TouchableOpacity>
            </Animated.View>
        );
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <ArrowLeft size={24} color={COLORS.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>עסקאות חוזרות</Text>
                <TouchableOpacity onPress={openAddModal} style={styles.addButton}>
                    <Plus size={24} color={COLORS.primary} />
                </TouchableOpacity>
            </View>

            {/* List */}
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.listContent}
            >
                {recurringTransactions.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Repeat size={48} color={COLORS.textTertiary} />
                        <Text style={styles.emptyTitle}>אין עסקאות חוזרות</Text>
                        <Text style={styles.emptySubtitle}>הוסף הוצאות או הכנסות שחוזרות באופן קבוע</Text>
                        <TouchableOpacity style={styles.emptyButton} onPress={openAddModal}>
                            <Plus size={20} color={COLORS.white} />
                            <Text style={styles.emptyButtonText}>הוסף עסקה חוזרת</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    recurringTransactions.map(item => (
                        <RecurringCard key={item.id} item={item} />
                    ))
                )}
                <View style={{ height: 100 }} />
            </ScrollView>

            {/* Add/Edit Modal */}
            <Modal
                visible={modalVisible}
                transparent
                animationType="slide"
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>
                                {editingRecurring ? 'עריכת עסקה חוזרת' : 'עסקה חוזרת חדשה'}
                            </Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <X size={24} color={COLORS.textPrimary} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false}>
                            {/* Type Toggle */}
                            <View style={styles.typeToggle}>
                                <TouchableOpacity
                                    style={[styles.typeOption, !formData.isIncome && styles.typeOptionActive]}
                                    onPress={() => setFormData(prev => ({ ...prev, isIncome: false }))}
                                >
                                    <TrendingDown size={18} color={!formData.isIncome ? COLORS.white : COLORS.danger} />
                                    <Text style={[styles.typeText, !formData.isIncome && styles.typeTextActive]}>הוצאה</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.typeOption, formData.isIncome && styles.typeOptionIncome]}
                                    onPress={() => setFormData(prev => ({ ...prev, isIncome: true }))}
                                >
                                    <TrendingUp size={18} color={formData.isIncome ? COLORS.white : COLORS.success} />
                                    <Text style={[styles.typeText, formData.isIncome && styles.typeTextActive]}>הכנסה</Text>
                                </TouchableOpacity>
                            </View>

                            <View style={styles.formGroup}>
                                <Text style={styles.formLabel}>כותרת *</Text>
                                <TextInput
                                    style={styles.formInput}
                                    value={formData.title}
                                    onChangeText={(text) => setFormData(prev => ({ ...prev, title: text }))}
                                    placeholder="לדוגמה: דמי שכירות"
                                    placeholderTextColor={COLORS.textTertiary}
                                    textAlign="right"
                                />
                            </View>

                            <View style={styles.formGroup}>
                                <Text style={styles.formLabel}>סכום *</Text>
                                <TextInput
                                    style={styles.formInput}
                                    value={formData.amount}
                                    onChangeText={(text) => setFormData(prev => ({ ...prev, amount: text }))}
                                    placeholder="0"
                                    placeholderTextColor={COLORS.textTertiary}
                                    keyboardType="numeric"
                                    textAlign="right"
                                />
                            </View>

                            <View style={styles.formGroup}>
                                <Text style={styles.formLabel}>תדירות</Text>
                                <View style={styles.frequencyOptions}>
                                    {FREQUENCY_OPTIONS.map(opt => (
                                        <TouchableOpacity
                                            key={opt.value}
                                            style={[
                                                styles.frequencyOption,
                                                formData.frequency === opt.value && styles.frequencyOptionActive
                                            ]}
                                            onPress={() => setFormData(prev => ({ ...prev, frequency: opt.value }))}
                                        >
                                            <Text style={[
                                                styles.frequencyOptionText,
                                                formData.frequency === opt.value && styles.frequencyOptionTextActive
                                            ]}>{opt.label}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>

                            {/* Start Date */}
                            <View style={styles.formGroup}>
                                <Text style={styles.formLabel}>תאריך התחלה</Text>
                                <View style={styles.datePickerRow}>
                                    <TouchableOpacity
                                        style={styles.dateAdjustButton}
                                        onPress={() => adjustDate('startDate', -1)}
                                    >
                                        <Text style={styles.dateAdjustText}>-</Text>
                                    </TouchableOpacity>
                                    <View style={styles.dateDisplay}>
                                        <Calendar size={16} color={COLORS.primary} />
                                        <Text style={styles.dateText}>{formatDate(formData.startDate)}</Text>
                                    </View>
                                    <TouchableOpacity
                                        style={styles.dateAdjustButton}
                                        onPress={() => adjustDate('startDate', 1)}
                                    >
                                        <Text style={styles.dateAdjustText}>+</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>

                            {/* End Date */}
                            <View style={styles.formGroup}>
                                <View style={styles.endDateHeader}>
                                    <Text style={styles.formLabel}>תאריך סיום (אופציונלי)</Text>
                                    {formData.endDate && (
                                        <TouchableOpacity onPress={() => setFormData(prev => ({ ...prev, endDate: null }))}>
                                            <Text style={styles.clearDateText}>נקה</Text>
                                        </TouchableOpacity>
                                    )}
                                </View>
                                {formData.endDate ? (
                                    <View style={styles.datePickerRow}>
                                        <TouchableOpacity
                                            style={styles.dateAdjustButton}
                                            onPress={() => adjustDate('endDate', -1)}
                                        >
                                            <Text style={styles.dateAdjustText}>-</Text>
                                        </TouchableOpacity>
                                        <View style={styles.dateDisplay}>
                                            <Calendar size={16} color={COLORS.danger} />
                                            <Text style={styles.dateText}>{formatDate(formData.endDate)}</Text>
                                        </View>
                                        <TouchableOpacity
                                            style={styles.dateAdjustButton}
                                            onPress={() => adjustDate('endDate', 1)}
                                        >
                                            <Text style={styles.dateAdjustText}>+</Text>
                                        </TouchableOpacity>
                                    </View>
                                ) : (
                                    <TouchableOpacity
                                        style={styles.addEndDateButton}
                                        onPress={() => {
                                            const future = new Date();
                                            future.setMonth(future.getMonth() + 12);
                                            setFormData(prev => ({ ...prev, endDate: future }));
                                        }}
                                    >
                                        <Plus size={16} color={COLORS.primary} />
                                        <Text style={styles.addEndDateText}>הוסף תאריך סיום</Text>
                                    </TouchableOpacity>
                                )}
                            </View>

                            <View style={styles.formGroup}>
                                <Text style={styles.formLabel}>הערות</Text>
                                <TextInput
                                    style={[styles.formInput, styles.notesInput]}
                                    value={formData.notes}
                                    onChangeText={(text) => setFormData(prev => ({ ...prev, notes: text }))}
                                    placeholder="הערות נוספות..."
                                    placeholderTextColor={COLORS.textTertiary}
                                    multiline
                                    numberOfLines={3}
                                    textAlign="right"
                                    textAlignVertical="top"
                                />
                            </View>
                        </ScrollView>

                        <View style={styles.modalButtons}>
                            {editingRecurring && (
                                <TouchableOpacity
                                    style={styles.deleteButton}
                                    onPress={() => {
                                        setModalVisible(false);
                                        handleDelete(editingRecurring.id);
                                    }}
                                >
                                    <Trash2 size={20} color={COLORS.danger} />
                                </TouchableOpacity>
                            )}
                            <TouchableOpacity
                                style={styles.saveButton}
                                onPress={handleSave}
                            >
                                <Text style={styles.saveButtonText}>
                                    {editingRecurring ? 'עדכן' : 'שמור'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
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
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    backButton: {
        padding: 8,
    },
    headerTitle: {
        fontSize: 20,
        color: COLORS.textPrimary,
        fontFamily: FONTS.bold,
    },
    addButton: {
        padding: 8,
        backgroundColor: `${COLORS.primary}15`,
        borderRadius: 12,
    },
    listContent: {
        padding: 20,
    },
    card: {
        backgroundColor: COLORS.surface,
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: COLORS.border,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    cardInactive: {
        opacity: 0.6,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconBg: {
        width: 44,
        height: 44,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cardInfo: {
        flex: 1,
        marginHorizontal: 14,
    },
    cardTitle: {
        fontSize: 16,
        color: COLORS.textPrimary,
        fontFamily: FONTS.bold,
        marginBottom: 4,
    },
    frequencyBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    frequencyText: {
        fontSize: 12,
        color: COLORS.textSecondary,
        fontFamily: FONTS.medium,
    },
    cardRight: {
        alignItems: 'flex-end',
        gap: 8,
    },
    cardAmount: {
        fontSize: 16,
        fontFamily: FONTS.bold,
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
    },
    emptyTitle: {
        fontSize: 18,
        color: COLORS.textPrimary,
        fontFamily: FONTS.bold,
        marginTop: 16,
        marginBottom: 8,
    },
    emptySubtitle: {
        fontSize: 14,
        color: COLORS.textSecondary,
        fontFamily: FONTS.regular,
        marginBottom: 24,
        textAlign: 'center',
    },
    emptyButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.primary,
        paddingHorizontal: 24,
        paddingVertical: 14,
        borderRadius: 12,
        gap: 8,
    },
    emptyButtonText: {
        color: COLORS.white,
        fontSize: 16,
        fontFamily: FONTS.bold,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: COLORS.surface,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
        maxHeight: '85%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    modalTitle: {
        fontSize: 20,
        color: COLORS.textPrimary,
        fontFamily: FONTS.bold,
    },
    typeToggle: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 24,
    },
    typeOption: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        padding: 14,
        borderRadius: 12,
        backgroundColor: COLORS.background,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    typeOptionActive: {
        backgroundColor: COLORS.danger,
        borderColor: COLORS.danger,
    },
    typeOptionIncome: {
        backgroundColor: COLORS.success,
        borderColor: COLORS.success,
    },
    typeText: {
        fontSize: 14,
        fontFamily: FONTS.medium,
        color: COLORS.textPrimary,
    },
    typeTextActive: {
        color: COLORS.white,
    },
    formGroup: {
        marginBottom: 20,
    },
    formLabel: {
        fontSize: 14,
        color: COLORS.textSecondary,
        fontFamily: FONTS.medium,
        marginBottom: 8,
    },
    formInput: {
        backgroundColor: COLORS.background,
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        color: COLORS.textPrimary,
        fontFamily: FONTS.regular,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    notesInput: {
        minHeight: 80,
    },
    frequencyOptions: {
        flexDirection: 'row',
        gap: 8,
    },
    frequencyOption: {
        flex: 1,
        padding: 12,
        borderRadius: 10,
        backgroundColor: COLORS.background,
        borderWidth: 1,
        borderColor: COLORS.border,
        alignItems: 'center',
    },
    frequencyOptionActive: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
    },
    frequencyOptionText: {
        fontSize: 13,
        color: COLORS.textPrimary,
        fontFamily: FONTS.medium,
    },
    frequencyOptionTextActive: {
        color: COLORS.white,
    },
    modalButtons: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 16,
    },
    deleteButton: {
        width: 52,
        height: 52,
        borderRadius: 12,
        backgroundColor: `${COLORS.danger}15`,
        justifyContent: 'center',
        alignItems: 'center',
    },
    saveButton: {
        flex: 1,
        backgroundColor: COLORS.primary,
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    saveButtonText: {
        color: COLORS.white,
        fontSize: 16,
        fontFamily: FONTS.bold,
    },
    // Date Picker Styles
    datePickerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    dateAdjustButton: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: COLORS.background,
        borderWidth: 1,
        borderColor: COLORS.border,
        justifyContent: 'center',
        alignItems: 'center',
    },
    dateAdjustText: {
        fontSize: 22,
        color: COLORS.textPrimary,
        fontFamily: FONTS.bold,
    },
    dateDisplay: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        backgroundColor: COLORS.background,
        borderRadius: 12,
        padding: 14,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    dateText: {
        fontSize: 15,
        color: COLORS.textPrimary,
        fontFamily: FONTS.medium,
    },
    endDateHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    clearDateText: {
        fontSize: 13,
        color: COLORS.danger,
        fontFamily: FONTS.medium,
    },
    addEndDateButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        backgroundColor: COLORS.background,
        borderRadius: 12,
        padding: 14,
        borderWidth: 1,
        borderColor: COLORS.border,
        borderStyle: 'dashed',
    },
    addEndDateText: {
        fontSize: 14,
        color: COLORS.primary,
        fontFamily: FONTS.medium,
    },
});
