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
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import {
    ChevronRight,
    Plus,
    FileText,
    Trash2,
    X,
    Check,
    Edit2,
    Copy,
    ChevronDown,
} from 'lucide-react-native';
import { useTransactions, InvoiceTemplate } from '../context/TransactionsContext';
import { useNotification } from '../context/NotificationContext';
import { useTheme } from '../context/ThemeContext';
import { getColors, FONTS, SPACING, RADIUS, SHADOWS, TYPOGRAPHY, LAYOUT } from '../constants/theme';
import { EmptyState } from '../components/EmptyState';

export default function InvoiceTemplatesScreen() {
    const navigation = useNavigation<any>();
    const insets = useSafeAreaInsets();
    const { resolvedTheme, isDark } = useTheme();
    const colors = getColors(resolvedTheme);
    const { showDeleteConfirm, showSuccess } = useNotification();

    const {
        invoiceTemplates,
        addInvoiceTemplate,
        updateInvoiceTemplate,
        deleteInvoiceTemplate,
        incrementTemplateUsage,
        clients,
        categories,
    } = useTransactions();

    const [modalVisible, setModalVisible] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState<InvoiceTemplate | null>(null);
    const [clientModalVisible, setClientModalVisible] = useState(false);

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
        name: '',
        description: '',
        defaultAmount: '',
        category: '',
        clientId: '',
        clientName: '',
        notes: '',
    });

    const resetForm = () => {
        setFormData({
            name: '',
            description: '',
            defaultAmount: '',
            category: '',
            clientId: '',
            clientName: '',
            notes: '',
        });
        setEditingTemplate(null);
    };

    const openAddModal = () => {
        resetForm();
        setModalVisible(true);
    };

    const openEditModal = (template: InvoiceTemplate) => {
        setEditingTemplate(template);
        setFormData({
            name: template.name,
            description: template.description || '',
            defaultAmount: template.defaultAmount.replace(/[^0-9]/g, ''),
            category: template.category || '',
            clientId: template.clientId || '',
            clientName: template.clientName || '',
            notes: template.notes || '',
        });
        setModalVisible(true);
    };

    const handleSave = () => {
        if (!formData.name.trim()) {
            return;
        }

        const templateData: Omit<InvoiceTemplate, 'id' | 'createdAt' | 'usageCount'> = {
            name: formData.name.trim(),
            description: formData.description.trim() || undefined,
            defaultAmount: `₪ ${parseInt(formData.defaultAmount || '0').toLocaleString()}`,
            category: formData.category || undefined,
            clientId: formData.clientId || undefined,
            clientName: formData.clientName || undefined,
            notes: formData.notes.trim() || undefined,
        };

        if (editingTemplate) {
            updateInvoiceTemplate(editingTemplate.id, templateData);
            showSuccess('התבנית עודכנה', 'התבנית נשמרה בהצלחה');
        } else {
            const newTemplate: InvoiceTemplate = {
                ...templateData,
                id: Date.now().toString(),
                createdAt: new Date(),
                usageCount: 0,
            };
            addInvoiceTemplate(newTemplate);
            showSuccess('תבנית נוצרה', 'התבנית נשמרה בהצלחה');
        }

        setModalVisible(false);
        resetForm();
    };

    const handleDelete = (id: string) => {
        showDeleteConfirm(
            'מחיקת תבנית',
            'האם אתה בטוח שברצונך למחוק תבנית זו?',
            () => {
                deleteInvoiceTemplate(id);
                showSuccess('התבנית נמחקה', '');
            }
        );
    };

    const handleUseTemplate = (template: InvoiceTemplate) => {
        incrementTemplateUsage(template.id);
        navigation.navigate('CreateInvoice', {
            template: {
                title: template.name,
                amount: template.defaultAmount,
                category: template.category,
                clientId: template.clientId,
                clientName: template.clientName,
                notes: template.notes,
            }
        });
    };

    const selectClient = (client: { id: string; name: string }) => {
        setFormData(prev => ({
            ...prev,
            clientId: client.id,
            clientName: client.name,
        }));
        setClientModalVisible(false);
    };

    const TemplateCard = ({ item }: { item: InvoiceTemplate }) => (
        <Animated.View style={{ opacity: fadeAnim }}>
            <TouchableOpacity
                style={[styles.card, { backgroundColor: colors.surface }, SHADOWS.sm]}
                onPress={() => handleUseTemplate(item)}
                onLongPress={() => openEditModal(item)}
                activeOpacity={0.7}
            >
                <View style={styles.cardHeader}>
                    <View style={[styles.iconBg, { backgroundColor: colors.primaryMuted }]}>
                        <FileText size={20} color={colors.primary} />
                    </View>
                    <View style={styles.cardInfo}>
                        <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>
                            {item.name}
                        </Text>
                        {item.description && (
                            <Text style={[styles.cardDescription, { color: colors.textTertiary }]} numberOfLines={1}>
                                {item.description}
                            </Text>
                        )}
                        <View style={styles.cardMeta}>
                            {item.clientName && (
                                <Text style={[styles.metaText, { color: colors.textSecondary }]}>
                                    {item.clientName}
                                </Text>
                            )}
                            <Text style={[styles.metaText, { color: colors.textTertiary }]}>
                                {item.usageCount} שימושים
                            </Text>
                        </View>
                    </View>
                    <View style={styles.cardRight}>
                        <Text style={[styles.cardAmount, { color: colors.success }]}>
                            {item.defaultAmount}
                        </Text>
                        <TouchableOpacity
                            onPress={() => openEditModal(item)}
                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        >
                            <Edit2 size={16} color={colors.textTertiary} />
                        </TouchableOpacity>
                    </View>
                </View>
            </TouchableOpacity>
        </Animated.View>
    );

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
                    תבניות חשבוניות
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
                {invoiceTemplates.length === 0 ? (
                    <EmptyState
                        icon="file"
                        title="אין תבניות"
                        message="צור תבניות לחשבוניות שאתה יוצר לעיתים קרובות כדי לחסוך זמן"
                        actionLabel="צור תבנית"
                        onAction={openAddModal}
                    />
                ) : (
                    invoiceTemplates.map(item => (
                        <TemplateCard key={item.id} item={item} />
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
                                {editingTemplate ? 'עריכת תבנית' : 'תבנית חדשה'}
                            </Text>
                            <View style={{ width: 36 }} />
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false}>
                            <View style={styles.formGroup}>
                                <Text style={[styles.formLabel, { color: colors.textSecondary }]}>שם התבנית *</Text>
                                <TextInput
                                    style={[styles.formInput, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border, color: colors.textPrimary }]}
                                    value={formData.name}
                                    onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
                                    placeholder="לדוגמה: חבילת עיצוב בסיסית"
                                    placeholderTextColor={colors.textQuaternary}
                                    textAlign="right"
                                />
                            </View>

                            <View style={styles.formGroup}>
                                <Text style={[styles.formLabel, { color: colors.textSecondary }]}>תיאור</Text>
                                <TextInput
                                    style={[styles.formInput, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border, color: colors.textPrimary }]}
                                    value={formData.description}
                                    onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
                                    placeholder="תיאור קצר..."
                                    placeholderTextColor={colors.textQuaternary}
                                    textAlign="right"
                                />
                            </View>

                            <View style={styles.formGroup}>
                                <Text style={[styles.formLabel, { color: colors.textSecondary }]}>סכום ברירת מחדל</Text>
                                <TextInput
                                    style={[styles.formInput, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border, color: colors.textPrimary }]}
                                    value={formData.defaultAmount}
                                    onChangeText={(text) => setFormData(prev => ({ ...prev, defaultAmount: text }))}
                                    placeholder="0"
                                    placeholderTextColor={colors.textQuaternary}
                                    keyboardType="numeric"
                                    textAlign="right"
                                />
                            </View>

                            <View style={styles.formGroup}>
                                <Text style={[styles.formLabel, { color: colors.textSecondary }]}>לקוח (אופציונלי)</Text>
                                <TouchableOpacity
                                    style={[styles.dropdown, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}
                                    onPress={() => setClientModalVisible(true)}
                                >
                                    <Text style={[styles.dropdownText, { color: formData.clientName ? colors.textPrimary : colors.textQuaternary }]}>
                                        {formData.clientName || 'בחר לקוח'}
                                    </Text>
                                    <ChevronDown size={18} color={colors.textTertiary} />
                                </TouchableOpacity>
                            </View>

                            <View style={styles.formGroup}>
                                <Text style={[styles.formLabel, { color: colors.textSecondary }]}>הערות</Text>
                                <TextInput
                                    style={[styles.formInput, styles.notesInput, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border, color: colors.textPrimary }]}
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
                            {editingTemplate && (
                                <TouchableOpacity
                                    style={[styles.deleteButton, { backgroundColor: colors.dangerMuted }]}
                                    onPress={() => {
                                        setModalVisible(false);
                                        handleDelete(editingTemplate.id);
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
                                    {editingTemplate ? 'עדכן' : 'שמור'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Client Selection Modal */}
            <Modal
                visible={clientModalVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setClientModalVisible(false)}
            >
                <TouchableOpacity
                    style={[styles.modalOverlay, { backgroundColor: colors.overlay }]}
                    activeOpacity={1}
                    onPress={() => setClientModalVisible(false)}
                >
                    <View style={[styles.clientModal, { backgroundColor: colors.surface }]}>
                        <Text style={[styles.modalTitle, { color: colors.textPrimary, marginBottom: SPACING.lg }]}>
                            בחר לקוח
                        </Text>
                        <ScrollView style={{ maxHeight: 300 }}>
                            <TouchableOpacity
                                style={[styles.clientItem, { borderBottomColor: colors.border }]}
                                onPress={() => {
                                    setFormData(prev => ({ ...prev, clientId: '', clientName: '' }));
                                    setClientModalVisible(false);
                                }}
                            >
                                <Text style={[styles.clientItemText, { color: colors.textTertiary }]}>
                                    ללא לקוח
                                </Text>
                            </TouchableOpacity>
                            {clients.map(client => (
                                <TouchableOpacity
                                    key={client.id}
                                    style={[styles.clientItem, { borderBottomColor: colors.border }]}
                                    onPress={() => selectClient(client)}
                                >
                                    <Text style={[styles.clientItemText, { color: colors.textPrimary }]}>
                                        {client.name}
                                    </Text>
                                    {formData.clientId === client.id && (
                                        <Check size={18} color={colors.primary} />
                                    )}
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
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
    cardDescription: {
        ...TYPOGRAPHY.captionSmall,
        marginBottom: SPACING.xs,
    },
    cardMeta: {
        flexDirection: 'row',
        gap: SPACING.md,
    },
    metaText: {
        ...TYPOGRAPHY.captionSmall,
    },
    cardRight: {
        alignItems: 'flex-end',
        gap: SPACING.sm,
    },
    cardAmount: {
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
    clientModal: {
        margin: LAYOUT.screenPadding,
        borderRadius: RADIUS.xl,
        padding: SPACING.xl,
    },
    clientItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: SPACING.md,
        borderBottomWidth: 1,
    },
    clientItemText: {
        ...TYPOGRAPHY.body,
    },
});
