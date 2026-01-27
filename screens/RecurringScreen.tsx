import React, { useState, useEffect, useRef } from 'react';
import {
    StyleSheet,
    Text,
    View,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Modal,
    Animated,
    Switch,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { ChevronRight, Plus, Repeat, Calendar, Trash2, X, TrendingUp, TrendingDown, Check } from 'lucide-react-native';
import { useTransactions, RecurringTransaction, Transaction } from '../context/TransactionsContext';
import { useNotification } from '../context/NotificationContext';
import { useTheme } from '../context/ThemeContext';
import { getColors, FONTS, SPACING, RADIUS, SHADOWS, TYPOGRAPHY, LAYOUT } from '../constants/theme';

const FREQUENCY_OPTIONS = [
    { value: 'daily', label: 'יומי' },
    { value: 'weekly', label: 'שבועי' },
    { value: 'monthly', label: 'חודשי' },
    { value: 'yearly', label: 'שנתי' }
] as const;

export default function RecurringScreen() {
    const navigation = useNavigation<any>();
    const insets = useSafeAreaInsets();
    const { resolvedTheme, isDark } = useTheme();
    const colors = getColors(resolvedTheme);
    const { showDeleteConfirm, showWarning } = useNotification();

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
            showWarning('נא למלא כותרת וסכום');
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
        showDeleteConfirm(
            'מחיקת עסקה חוזרת',
            'האם אתה בטוח שברצונך למחוק?',
            () => deleteRecurringTransaction(id)
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
                    style={[
                        styles.card,
                        { backgroundColor: colors.surface },
                        SHADOWS.sm,
                        !item.isActive && styles.cardInactive
                    ]}
                    onPress={() => openEditModal(item)}
                    activeOpacity={0.7}
                >
                    <View style={styles.cardHeader}>
                        <View style={[
                            styles.iconBg,
                            { backgroundColor: isIncome ? colors.successMuted : colors.dangerMuted }
                        ]}>
                            {isIncome ? (
                                <TrendingUp size={20} color={colors.success} />
                            ) : (
                                <TrendingDown size={20} color={colors.danger} />
                            )}
                        </View>
                        <View style={styles.cardInfo}>
                            <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>
                                {item.templateTransaction.title}
                            </Text>
                            <View style={[styles.frequencyBadge, { backgroundColor: colors.surfaceSecondary }]}>
                                <Repeat size={12} color={colors.textTertiary} />
                                <Text style={[styles.frequencyText, { color: colors.textSecondary }]}>
                                    {getFrequencyLabel(item.frequency)}
                                </Text>
                            </View>
                        </View>
                        <View style={styles.cardRight}>
                            <Text style={[
                                styles.cardAmount,
                                { color: isIncome ? colors.success : colors.danger }
                            ]}>
                                {item.templateTransaction.amount}
                            </Text>
                            <Switch
                                value={item.isActive}
                                onValueChange={() => toggleRecurringActive(item.id)}
                                trackColor={{ false: colors.border, true: `${colors.success}50` }}
                                thumbColor={item.isActive ? colors.success : colors.textQuaternary}
                            />
                        </View>
                    </View>
                </TouchableOpacity>
            </Animated.View>
        );
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <StatusBar style={isDark ? 'light' : 'dark'} />

            {/* Header */}
            <View style={[styles.header, { paddingTop: insets.top + SPACING.md }]}>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={[styles.headerButton, { backgroundColor: colors.surfaceSecondary }]}
                >
                    <ChevronRight size={24} color={colors.textSecondary} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
                    עסקאות חוזרות
                </Text>
                <TouchableOpacity
                    onPress={openAddModal}
                    style={[styles.headerButton, { backgroundColor: colors.primaryMuted }]}
                >
                    <Plus size={24} color={colors.primary} />
                </TouchableOpacity>
            </View>

            {/* List */}
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.listContent}
            >
                {recurringTransactions.length === 0 ? (
                    <View style={styles.emptyState}>
                        <View style={[styles.emptyIcon, { backgroundColor: colors.surfaceSecondary }]}>
                            <Repeat size={32} color={colors.textTertiary} />
                        </View>
                        <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>
                            אין עסקאות חוזרות
                        </Text>
                        <Text style={[styles.emptySubtitle, { color: colors.textTertiary }]}>
                            הוסף הוצאות או הכנסות שחוזרות באופן קבוע
                        </Text>
                        <TouchableOpacity
                            style={[styles.emptyButton, { backgroundColor: colors.primary }]}
                            onPress={openAddModal}
                        >
                            <Plus size={20} color="#FFFFFF" />
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
                <View style={[styles.modalOverlay, { backgroundColor: colors.overlay }]}>
                    <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
                        <View style={styles.modalHeader}>
                            <TouchableOpacity
                                onPress={() => setModalVisible(false)}
                                style={[styles.modalCloseButton, { backgroundColor: colors.surfaceSecondary }]}
                            >
                                <X size={20} color={colors.textSecondary} />
                            </TouchableOpacity>
                            <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
                                {editingRecurring ? 'עריכת עסקה חוזרת' : 'עסקה חוזרת חדשה'}
                            </Text>
                            <View style={{ width: 36 }} />
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false}>
                            {/* Type Toggle */}
                            <View style={styles.typeToggle}>
                                <TouchableOpacity
                                    style={[
                                        styles.typeOption,
                                        { backgroundColor: colors.surfaceSecondary, borderColor: colors.border },
                                        !formData.isIncome && { backgroundColor: colors.danger, borderColor: colors.danger }
                                    ]}
                                    onPress={() => setFormData(prev => ({ ...prev, isIncome: false }))}
                                >
                                    <TrendingDown size={18} color={!formData.isIncome ? '#FFFFFF' : colors.danger} />
                                    <Text style={[
                                        styles.typeText,
                                        { color: colors.textPrimary },
                                        !formData.isIncome && { color: '#FFFFFF' }
                                    ]}>הוצאה</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[
                                        styles.typeOption,
                                        { backgroundColor: colors.surfaceSecondary, borderColor: colors.border },
                                        formData.isIncome && { backgroundColor: colors.success, borderColor: colors.success }
                                    ]}
                                    onPress={() => setFormData(prev => ({ ...prev, isIncome: true }))}
                                >
                                    <TrendingUp size={18} color={formData.isIncome ? '#FFFFFF' : colors.success} />
                                    <Text style={[
                                        styles.typeText,
                                        { color: colors.textPrimary },
                                        formData.isIncome && { color: '#FFFFFF' }
                                    ]}>הכנסה</Text>
                                </TouchableOpacity>
                            </View>

                            <View style={styles.formGroup}>
                                <Text style={[styles.formLabel, { color: colors.textSecondary }]}>כותרת *</Text>
                                <TextInput
                                    style={[
                                        styles.formInput,
                                        {
                                            backgroundColor: colors.surfaceSecondary,
                                            borderColor: colors.border,
                                            color: colors.textPrimary
                                        }
                                    ]}
                                    value={formData.title}
                                    onChangeText={(text) => setFormData(prev => ({ ...prev, title: text }))}
                                    placeholder="לדוגמה: דמי שכירות"
                                    placeholderTextColor={colors.textQuaternary}
                                    textAlign="right"
                                />
                            </View>

                            <View style={styles.formGroup}>
                                <Text style={[styles.formLabel, { color: colors.textSecondary }]}>סכום *</Text>
                                <TextInput
                                    style={[
                                        styles.formInput,
                                        {
                                            backgroundColor: colors.surfaceSecondary,
                                            borderColor: colors.border,
                                            color: colors.textPrimary
                                        }
                                    ]}
                                    value={formData.amount}
                                    onChangeText={(text) => setFormData(prev => ({ ...prev, amount: text }))}
                                    placeholder="0"
                                    placeholderTextColor={colors.textQuaternary}
                                    keyboardType="numeric"
                                    textAlign="right"
                                />
                            </View>

                            <View style={styles.formGroup}>
                                <Text style={[styles.formLabel, { color: colors.textSecondary }]}>תדירות</Text>
                                <View style={styles.frequencyOptions}>
                                    {FREQUENCY_OPTIONS.map(opt => (
                                        <TouchableOpacity
                                            key={opt.value}
                                            style={[
                                                styles.frequencyOption,
                                                {
                                                    backgroundColor: colors.surfaceSecondary,
                                                    borderColor: colors.border
                                                },
                                                formData.frequency === opt.value && {
                                                    backgroundColor: colors.primary,
                                                    borderColor: colors.primary
                                                }
                                            ]}
                                            onPress={() => setFormData(prev => ({ ...prev, frequency: opt.value }))}
                                        >
                                            <Text style={[
                                                styles.frequencyOptionText,
                                                { color: colors.textPrimary },
                                                formData.frequency === opt.value && { color: '#FFFFFF' }
                                            ]}>{opt.label}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>

                            {/* Start Date */}
                            <View style={styles.formGroup}>
                                <Text style={[styles.formLabel, { color: colors.textSecondary }]}>תאריך התחלה</Text>
                                <View style={styles.datePickerRow}>
                                    <TouchableOpacity
                                        style={[
                                            styles.dateAdjustButton,
                                            { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }
                                        ]}
                                        onPress={() => adjustDate('startDate', -1)}
                                    >
                                        <Text style={[styles.dateAdjustText, { color: colors.textPrimary }]}>-</Text>
                                    </TouchableOpacity>
                                    <View style={[
                                        styles.dateDisplay,
                                        { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }
                                    ]}>
                                        <Calendar size={16} color={colors.primary} />
                                        <Text style={[styles.dateText, { color: colors.textPrimary }]}>
                                            {formatDate(formData.startDate)}
                                        </Text>
                                    </View>
                                    <TouchableOpacity
                                        style={[
                                            styles.dateAdjustButton,
                                            { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }
                                        ]}
                                        onPress={() => adjustDate('startDate', 1)}
                                    >
                                        <Text style={[styles.dateAdjustText, { color: colors.textPrimary }]}>+</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>

                            {/* End Date */}
                            <View style={styles.formGroup}>
                                <View style={styles.endDateHeader}>
                                    <Text style={[styles.formLabel, { color: colors.textSecondary }]}>
                                        תאריך סיום (אופציונלי)
                                    </Text>
                                    {formData.endDate && (
                                        <TouchableOpacity onPress={() => setFormData(prev => ({ ...prev, endDate: null }))}>
                                            <Text style={[styles.clearDateText, { color: colors.danger }]}>נקה</Text>
                                        </TouchableOpacity>
                                    )}
                                </View>
                                {formData.endDate ? (
                                    <View style={styles.datePickerRow}>
                                        <TouchableOpacity
                                            style={[
                                                styles.dateAdjustButton,
                                                { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }
                                            ]}
                                            onPress={() => adjustDate('endDate', -1)}
                                        >
                                            <Text style={[styles.dateAdjustText, { color: colors.textPrimary }]}>-</Text>
                                        </TouchableOpacity>
                                        <View style={[
                                            styles.dateDisplay,
                                            { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }
                                        ]}>
                                            <Calendar size={16} color={colors.danger} />
                                            <Text style={[styles.dateText, { color: colors.textPrimary }]}>
                                                {formatDate(formData.endDate)}
                                            </Text>
                                        </View>
                                        <TouchableOpacity
                                            style={[
                                                styles.dateAdjustButton,
                                                { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }
                                            ]}
                                            onPress={() => adjustDate('endDate', 1)}
                                        >
                                            <Text style={[styles.dateAdjustText, { color: colors.textPrimary }]}>+</Text>
                                        </TouchableOpacity>
                                    </View>
                                ) : (
                                    <TouchableOpacity
                                        style={[
                                            styles.addEndDateButton,
                                            { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }
                                        ]}
                                        onPress={() => {
                                            const future = new Date();
                                            future.setMonth(future.getMonth() + 12);
                                            setFormData(prev => ({ ...prev, endDate: future }));
                                        }}
                                    >
                                        <Plus size={16} color={colors.primary} />
                                        <Text style={[styles.addEndDateText, { color: colors.primary }]}>
                                            הוסף תאריך סיום
                                        </Text>
                                    </TouchableOpacity>
                                )}
                            </View>

                            <View style={styles.formGroup}>
                                <Text style={[styles.formLabel, { color: colors.textSecondary }]}>הערות</Text>
                                <TextInput
                                    style={[
                                        styles.formInput,
                                        styles.notesInput,
                                        {
                                            backgroundColor: colors.surfaceSecondary,
                                            borderColor: colors.border,
                                            color: colors.textPrimary
                                        }
                                    ]}
                                    value={formData.notes}
                                    onChangeText={(text) => setFormData(prev => ({ ...prev, notes: text }))}
                                    placeholder="הערות נוספות..."
                                    placeholderTextColor={colors.textQuaternary}
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
                                    style={[styles.deleteButton, { backgroundColor: colors.dangerMuted }]}
                                    onPress={() => {
                                        setModalVisible(false);
                                        handleDelete(editingRecurring.id);
                                    }}
                                >
                                    <Trash2 size={20} color={colors.danger} />
                                </TouchableOpacity>
                            )}
                            <TouchableOpacity
                                style={[styles.saveButton, { backgroundColor: colors.primary }]}
                                onPress={handleSave}
                            >
                                <Check size={18} color="#FFFFFF" style={{ marginLeft: SPACING.xs }} />
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
    listContent: {
        paddingHorizontal: LAYOUT.screenPadding,
    },
    card: {
        borderRadius: RADIUS.xl,
        padding: SPACING.lg,
        marginBottom: SPACING.md,
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
        borderRadius: RADIUS.md,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cardInfo: {
        flex: 1,
        marginHorizontal: SPACING.md,
    },
    cardTitle: {
        ...TYPOGRAPHY.body,
        fontFamily: FONTS.semiBold,
        marginBottom: SPACING.xs,
    },
    frequencyBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        paddingHorizontal: SPACING.sm,
        paddingVertical: SPACING.xs,
        borderRadius: RADIUS.full,
        gap: 4,
    },
    frequencyText: {
        ...TYPOGRAPHY.captionSmall,
    },
    cardRight: {
        alignItems: 'flex-end',
        gap: SPACING.sm,
    },
    cardAmount: {
        ...TYPOGRAPHY.label,
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: SPACING['4xl'],
    },
    emptyIcon: {
        width: 80,
        height: 80,
        borderRadius: RADIUS.xl,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: SPACING.lg,
    },
    emptyTitle: {
        ...TYPOGRAPHY.h4,
        marginBottom: SPACING.sm,
    },
    emptySubtitle: {
        ...TYPOGRAPHY.body,
        textAlign: 'center',
        marginBottom: SPACING.xl,
    },
    emptyButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: SPACING.xl,
        paddingVertical: SPACING.md,
        borderRadius: RADIUS.md,
        gap: SPACING.sm,
    },
    emptyButtonText: {
        color: '#FFFFFF',
        ...TYPOGRAPHY.label,
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    modalContent: {
        borderTopLeftRadius: RADIUS['2xl'],
        borderTopRightRadius: RADIUS['2xl'],
        padding: SPACING['2xl'],
        maxHeight: '85%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.xl,
    },
    modalCloseButton: {
        width: 36,
        height: 36,
        borderRadius: RADIUS.sm,
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalTitle: {
        ...TYPOGRAPHY.h4,
    },
    typeToggle: {
        flexDirection: 'row',
        gap: SPACING.md,
        marginBottom: SPACING.xl,
    },
    typeOption: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: SPACING.sm,
        padding: SPACING.md,
        borderRadius: RADIUS.md,
        borderWidth: 1,
    },
    typeText: {
        ...TYPOGRAPHY.label,
    },
    formGroup: {
        marginBottom: SPACING.lg,
    },
    formLabel: {
        ...TYPOGRAPHY.caption,
        marginBottom: SPACING.sm,
    },
    formInput: {
        borderRadius: RADIUS.md,
        padding: SPACING.md,
        ...TYPOGRAPHY.body,
        borderWidth: 1,
    },
    notesInput: {
        minHeight: 80,
    },
    frequencyOptions: {
        flexDirection: 'row',
        gap: SPACING.sm,
    },
    frequencyOption: {
        flex: 1,
        padding: SPACING.md,
        borderRadius: RADIUS.md,
        borderWidth: 1,
        alignItems: 'center',
    },
    frequencyOptionText: {
        ...TYPOGRAPHY.captionSmall,
        fontFamily: FONTS.medium,
    },
    modalButtons: {
        flexDirection: 'row',
        gap: SPACING.md,
        marginTop: SPACING.lg,
    },
    deleteButton: {
        width: 52,
        height: 52,
        borderRadius: RADIUS.md,
        justifyContent: 'center',
        alignItems: 'center',
    },
    saveButton: {
        flex: 1,
        flexDirection: 'row',
        padding: SPACING.md,
        borderRadius: RADIUS.md,
        alignItems: 'center',
        justifyContent: 'center',
    },
    saveButtonText: {
        color: '#FFFFFF',
        ...TYPOGRAPHY.label,
    },
    datePickerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.md,
    },
    dateAdjustButton: {
        width: 44,
        height: 44,
        borderRadius: RADIUS.md,
        borderWidth: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    dateAdjustText: {
        fontSize: 22,
        fontFamily: FONTS.bold,
    },
    dateDisplay: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: SPACING.sm,
        borderRadius: RADIUS.md,
        padding: SPACING.md,
        borderWidth: 1,
    },
    dateText: {
        ...TYPOGRAPHY.body,
        fontFamily: FONTS.medium,
    },
    endDateHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.sm,
    },
    clearDateText: {
        ...TYPOGRAPHY.caption,
        fontFamily: FONTS.medium,
    },
    addEndDateButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: SPACING.sm,
        borderRadius: RADIUS.md,
        padding: SPACING.md,
        borderWidth: 1,
        borderStyle: 'dashed',
    },
    addEndDateText: {
        ...TYPOGRAPHY.body,
        fontFamily: FONTS.medium,
    },
});
