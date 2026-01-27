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
    useColorScheme,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { ChevronRight, Plus, Search, User, Building2, Trash2, X, ChevronLeft, Check } from 'lucide-react-native';
import { useTransactions, Client } from '../context/TransactionsContext';
import { useNotification } from '../context/NotificationContext';
import { getColors, FONTS, SPACING, RADIUS, SHADOWS, TYPOGRAPHY, LAYOUT } from '../constants/theme';

export default function ClientsScreen() {
    const navigation = useNavigation<any>();
    const insets = useSafeAreaInsets();
    const colorScheme = useColorScheme();
    const colors = getColors(colorScheme);
    const { showDeleteConfirm, showWarning } = useNotification();

    const { clients, addClient, updateClient, deleteClient, getClientTransactions } = useTransactions();

    const [searchQuery, setSearchQuery] = useState('');
    const [modalVisible, setModalVisible] = useState(false);
    const [editingClient, setEditingClient] = useState<Client | null>(null);

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
        email: '',
        phone: '',
        company: '',
        address: '',
        notes: ''
    });

    const filteredClients = clients.filter(client =>
        client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (client.company && client.company.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const openAddModal = () => {
        setEditingClient(null);
        setFormData({ name: '', email: '', phone: '', company: '', address: '', notes: '' });
        setModalVisible(true);
    };

    const openEditModal = (client: Client) => {
        setEditingClient(client);
        setFormData({
            name: client.name,
            email: client.email || '',
            phone: client.phone || '',
            company: client.company || '',
            address: client.address || '',
            notes: client.notes || ''
        });
        setModalVisible(true);
    };

    const handleSave = () => {
        if (!formData.name.trim()) {
            showWarning('נא להזין שם לקוח');
            return;
        }

        if (editingClient) {
            updateClient(editingClient.id, formData);
        } else {
            const newClient: Client = {
                id: Date.now().toString(),
                ...formData,
                createdAt: new Date()
            };
            addClient(newClient);
        }
        setModalVisible(false);
    };

    const handleDelete = (clientId: string) => {
        showDeleteConfirm(
            'מחיקת לקוח',
            'האם אתה בטוח שברצונך למחוק לקוח זה?',
            () => deleteClient(clientId)
        );
    };

    const getClientStats = (clientId: string) => {
        const transactions = getClientTransactions(clientId);
        const totalAmount = transactions.reduce((sum, t) => {
            const amount = parseFloat(t.amount.replace(/[^0-9.-]+/g, '')) || 0;
            return sum + amount;
        }, 0);
        return { count: transactions.length, total: totalAmount };
    };

    const ClientCard = ({ client }: { client: Client }) => {
        const stats = getClientStats(client.id);

        return (
            <Animated.View style={{ opacity: fadeAnim }}>
                <TouchableOpacity
                    style={[styles.clientCard, { backgroundColor: colors.surface }, SHADOWS.sm]}
                    onPress={() => openEditModal(client)}
                    activeOpacity={0.7}
                >
                    <View style={styles.cardLeft}>
                        <View style={[styles.avatar, { backgroundColor: colors.primaryMuted }]}>
                            <User size={24} color={colors.primary} />
                        </View>
                        <View style={styles.clientInfo}>
                            <Text style={[styles.clientName, { color: colors.textPrimary }]}>{client.name}</Text>
                            {client.company && (
                                <View style={styles.companyRow}>
                                    <Building2 size={12} color={colors.textTertiary} />
                                    <Text style={[styles.companyText, { color: colors.textSecondary }]}>{client.company}</Text>
                                </View>
                            )}
                            <Text style={[styles.statsText, { color: colors.textTertiary }]}>
                                {stats.count} עסקאות • ₪{stats.total.toLocaleString()}
                            </Text>
                        </View>
                    </View>
                    <ChevronLeft size={20} color={colors.textTertiary} />
                </TouchableOpacity>
            </Animated.View>
        );
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />

            {/* Header */}
            <View style={[styles.header, { paddingTop: insets.top + SPACING.md }]}>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={[styles.headerButton, { backgroundColor: colors.surfaceSecondary }]}
                >
                    <ChevronRight size={24} color={colors.textSecondary} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>לקוחות</Text>
                <TouchableOpacity
                    onPress={openAddModal}
                    style={[styles.headerButton, { backgroundColor: colors.primaryMuted }]}
                >
                    <Plus size={24} color={colors.primary} />
                </TouchableOpacity>
            </View>

            {/* Search */}
            <View style={styles.searchWrapper}>
                <View style={[styles.searchContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <Search size={20} color={colors.textTertiary} />
                    <TextInput
                        style={[styles.searchInput, { color: colors.textPrimary }]}
                        placeholder="חיפוש לקוח..."
                        placeholderTextColor={colors.textQuaternary}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        textAlign="right"
                    />
                </View>
            </View>

            {/* Client List */}
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.listContent}
            >
                {filteredClients.length === 0 ? (
                    <View style={styles.emptyState}>
                        <View style={[styles.emptyIcon, { backgroundColor: colors.surfaceSecondary }]}>
                            <User size={32} color={colors.textTertiary} />
                        </View>
                        <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>אין לקוחות עדיין</Text>
                        <Text style={[styles.emptySubtitle, { color: colors.textTertiary }]}>הוסף את הלקוח הראשון שלך</Text>
                        <TouchableOpacity
                            style={[styles.emptyButton, { backgroundColor: colors.primary }]}
                            onPress={openAddModal}
                        >
                            <Plus size={20} color="#FFFFFF" />
                            <Text style={styles.emptyButtonText}>הוסף לקוח</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    filteredClients.map(client => (
                        <ClientCard key={client.id} client={client} />
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
                                {editingClient ? 'עריכת לקוח' : 'לקוח חדש'}
                            </Text>
                            <View style={{ width: 36 }} />
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false}>
                            <View style={styles.formGroup}>
                                <Text style={[styles.formLabel, { color: colors.textSecondary }]}>שם *</Text>
                                <TextInput
                                    style={[styles.formInput, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border, color: colors.textPrimary }]}
                                    value={formData.name}
                                    onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
                                    placeholder="שם הלקוח"
                                    placeholderTextColor={colors.textQuaternary}
                                    textAlign="right"
                                />
                            </View>

                            <View style={styles.formGroup}>
                                <Text style={[styles.formLabel, { color: colors.textSecondary }]}>חברה</Text>
                                <TextInput
                                    style={[styles.formInput, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border, color: colors.textPrimary }]}
                                    value={formData.company}
                                    onChangeText={(text) => setFormData(prev => ({ ...prev, company: text }))}
                                    placeholder="שם החברה"
                                    placeholderTextColor={colors.textQuaternary}
                                    textAlign="right"
                                />
                            </View>

                            <View style={styles.formGroup}>
                                <Text style={[styles.formLabel, { color: colors.textSecondary }]}>טלפון</Text>
                                <TextInput
                                    style={[styles.formInput, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border, color: colors.textPrimary }]}
                                    value={formData.phone}
                                    onChangeText={(text) => setFormData(prev => ({ ...prev, phone: text }))}
                                    placeholder="050-000-0000"
                                    placeholderTextColor={colors.textQuaternary}
                                    keyboardType="phone-pad"
                                    textAlign="right"
                                />
                            </View>

                            <View style={styles.formGroup}>
                                <Text style={[styles.formLabel, { color: colors.textSecondary }]}>אימייל</Text>
                                <TextInput
                                    style={[styles.formInput, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border, color: colors.textPrimary }]}
                                    value={formData.email}
                                    onChangeText={(text) => setFormData(prev => ({ ...prev, email: text }))}
                                    placeholder="email@example.com"
                                    placeholderTextColor={colors.textQuaternary}
                                    keyboardType="email-address"
                                    textAlign="right"
                                />
                            </View>

                            <View style={styles.formGroup}>
                                <Text style={[styles.formLabel, { color: colors.textSecondary }]}>כתובת</Text>
                                <TextInput
                                    style={[styles.formInput, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border, color: colors.textPrimary }]}
                                    value={formData.address}
                                    onChangeText={(text) => setFormData(prev => ({ ...prev, address: text }))}
                                    placeholder="כתובת הלקוח"
                                    placeholderTextColor={colors.textQuaternary}
                                    textAlign="right"
                                />
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
                            {editingClient && (
                                <TouchableOpacity
                                    style={[styles.deleteButton, { backgroundColor: colors.dangerMuted }]}
                                    onPress={() => {
                                        setModalVisible(false);
                                        handleDelete(editingClient.id);
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
                                    {editingClient ? 'עדכן' : 'שמור'}
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
    searchWrapper: {
        paddingHorizontal: LAYOUT.screenPadding,
        marginBottom: SPACING.md,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: RADIUS.md,
        paddingHorizontal: SPACING.md,
        height: 48,
        gap: SPACING.md,
        borderWidth: 1,
    },
    searchInput: {
        flex: 1,
        ...TYPOGRAPHY.body,
    },
    listContent: {
        paddingHorizontal: LAYOUT.screenPadding,
    },
    clientCard: {
        borderRadius: RADIUS.xl,
        padding: SPACING.lg,
        marginBottom: SPACING.md,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    cardLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        gap: SPACING.md,
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
    },
    clientInfo: {
        flex: 1,
    },
    clientName: {
        ...TYPOGRAPHY.body,
        fontFamily: FONTS.semiBold,
        marginBottom: SPACING.xs,
    },
    companyRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginBottom: SPACING.xs,
    },
    companyText: {
        ...TYPOGRAPHY.caption,
    },
    statsText: {
        ...TYPOGRAPHY.captionSmall,
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
});
