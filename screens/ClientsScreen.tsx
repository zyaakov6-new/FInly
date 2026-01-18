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
    Animated
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft, Plus, Search, User, Building2, Phone, Mail, Edit2, Trash2, X, ChevronRight } from 'lucide-react-native';
import { useTransactions, Client } from '../context/TransactionsContext';
import { COLORS, FONTS } from '../constants/theme';

export default function ClientsScreen() {
    const navigation = useNavigation<any>();
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
            Alert.alert('שגיאה', 'נא להזין שם לקוח');
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
        Alert.alert(
            'מחיקת לקוח',
            'האם אתה בטוח שברצונך למחוק לקוח זה?',
            [
                { text: 'ביטול', style: 'cancel' },
                { text: 'מחק', style: 'destructive', onPress: () => deleteClient(clientId) }
            ]
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
                    style={styles.clientCard}
                    onPress={() => openEditModal(client)}
                    activeOpacity={0.7}
                >
                    <View style={styles.cardLeft}>
                        <View style={styles.avatar}>
                            <User size={24} color={COLORS.primary} />
                        </View>
                        <View style={styles.clientInfo}>
                            <Text style={styles.clientName}>{client.name}</Text>
                            {client.company && (
                                <View style={styles.companyRow}>
                                    <Building2 size={12} color={COLORS.textSecondary} />
                                    <Text style={styles.companyText}>{client.company}</Text>
                                </View>
                            )}
                            <Text style={styles.statsText}>
                                {stats.count} עסקאות • ₪{stats.total.toLocaleString()}
                            </Text>
                        </View>
                    </View>
                    <ChevronRight size={20} color={COLORS.textTertiary} />
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
                <Text style={styles.headerTitle}>לקוחות</Text>
                <TouchableOpacity onPress={openAddModal} style={styles.addButton}>
                    <Plus size={24} color={COLORS.primary} />
                </TouchableOpacity>
            </View>

            {/* Search */}
            <View style={styles.searchContainer}>
                <Search size={20} color={COLORS.textSecondary} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="חיפוש לקוח..."
                    placeholderTextColor={COLORS.textTertiary}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    textAlign="right"
                />
            </View>

            {/* Client List */}
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.listContent}
            >
                {filteredClients.length === 0 ? (
                    <View style={styles.emptyState}>
                        <User size={48} color={COLORS.textTertiary} />
                        <Text style={styles.emptyTitle}>אין לקוחות עדיין</Text>
                        <Text style={styles.emptySubtitle}>הוסף את הלקוח הראשון שלך</Text>
                        <TouchableOpacity style={styles.emptyButton} onPress={openAddModal}>
                            <Plus size={20} color={COLORS.white} />
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
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>
                                {editingClient ? 'עריכת לקוח' : 'לקוח חדש'}
                            </Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <X size={24} color={COLORS.textPrimary} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false}>
                            <View style={styles.formGroup}>
                                <Text style={styles.formLabel}>שם *</Text>
                                <TextInput
                                    style={styles.formInput}
                                    value={formData.name}
                                    onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
                                    placeholder="שם הלקוח"
                                    placeholderTextColor={COLORS.textTertiary}
                                    textAlign="right"
                                />
                            </View>

                            <View style={styles.formGroup}>
                                <Text style={styles.formLabel}>חברה</Text>
                                <TextInput
                                    style={styles.formInput}
                                    value={formData.company}
                                    onChangeText={(text) => setFormData(prev => ({ ...prev, company: text }))}
                                    placeholder="שם החברה"
                                    placeholderTextColor={COLORS.textTertiary}
                                    textAlign="right"
                                />
                            </View>

                            <View style={styles.formGroup}>
                                <Text style={styles.formLabel}>טלפון</Text>
                                <TextInput
                                    style={styles.formInput}
                                    value={formData.phone}
                                    onChangeText={(text) => setFormData(prev => ({ ...prev, phone: text }))}
                                    placeholder="050-000-0000"
                                    placeholderTextColor={COLORS.textTertiary}
                                    keyboardType="phone-pad"
                                    textAlign="right"
                                />
                            </View>

                            <View style={styles.formGroup}>
                                <Text style={styles.formLabel}>אימייל</Text>
                                <TextInput
                                    style={styles.formInput}
                                    value={formData.email}
                                    onChangeText={(text) => setFormData(prev => ({ ...prev, email: text }))}
                                    placeholder="email@example.com"
                                    placeholderTextColor={COLORS.textTertiary}
                                    keyboardType="email-address"
                                    textAlign="right"
                                />
                            </View>

                            <View style={styles.formGroup}>
                                <Text style={styles.formLabel}>כתובת</Text>
                                <TextInput
                                    style={styles.formInput}
                                    value={formData.address}
                                    onChangeText={(text) => setFormData(prev => ({ ...prev, address: text }))}
                                    placeholder="כתובת הלקוח"
                                    placeholderTextColor={COLORS.textTertiary}
                                    textAlign="right"
                                />
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
                            {editingClient && (
                                <TouchableOpacity
                                    style={styles.deleteButton}
                                    onPress={() => {
                                        setModalVisible(false);
                                        handleDelete(editingClient.id);
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
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.surface,
        margin: 20,
        marginBottom: 0,
        borderRadius: 12,
        paddingHorizontal: 16,
        height: 48,
        gap: 12,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: COLORS.textPrimary,
        fontFamily: FONTS.regular,
    },
    listContent: {
        padding: 20,
    },
    clientCard: {
        backgroundColor: COLORS.surface,
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderWidth: 1,
        borderColor: COLORS.border,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    cardLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        gap: 14,
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: `${COLORS.primary}15`,
        justifyContent: 'center',
        alignItems: 'center',
    },
    clientInfo: {
        flex: 1,
    },
    clientName: {
        fontSize: 16,
        color: COLORS.textPrimary,
        fontFamily: FONTS.bold,
        marginBottom: 4,
    },
    companyRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginBottom: 4,
    },
    companyText: {
        fontSize: 13,
        color: COLORS.textSecondary,
        fontFamily: FONTS.regular,
    },
    statsText: {
        fontSize: 12,
        color: COLORS.textTertiary,
        fontFamily: FONTS.medium,
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
});
