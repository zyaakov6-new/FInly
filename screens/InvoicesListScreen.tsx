import React, { useState, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    SectionList,
    Platform,
    Dimensions,
    Modal,
    ScrollView,
    Alert
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import {
    ArrowRight,
    Search,
    Filter,
    ChevronDown,
    Trash2,
    Edit2,
    Check,
    X,
    Clock,
    AlertTriangle,
    FileText,
    Mail,
    Printer,
    Briefcase,
    TrendingUp,
    Heart,
    ArrowLeft
} from 'lucide-react-native';
import { StatusBar } from 'expo-status-bar';
import { useTransactions, Transaction } from '../context/TransactionsContext';
import { COLORS, FONTS } from '../constants/theme';

const { width, height } = Dimensions.get('window');

type StatusTab = 'all' | 'pending' | 'paid' | 'overdue';

export default function InvoicesListScreen() {
    const insets = useSafeAreaInsets();
    const navigation = useNavigation<any>();
    const { transactions, updateTransaction, deleteTransaction } = useTransactions();

    // State
    const [selectedTab, setSelectedTab] = useState<StatusTab>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [isFilterExpanded, setIsFilterExpanded] = useState(false);

    const route = useRoute<any>();

    // Handle incoming filter params
    React.useEffect(() => {
        if (route.params?.filter) {
            setSelectedTab(route.params.filter as StatusTab);
            // Clear params to avoid sticky filter? Optional.
        }
    }, [route.params]);

    // Effect: Handle Navigation Params (e.g. from Dashboard Widgets)
    React.useEffect(() => {
        if (navigation.getState().routes) {
            const params = (navigation as any).getState().routes.find((r: any) => r.name === 'Customers')?.params;
            // OR simpler if inside the screen: const { params } = useRoute();
            // Since we use useNavigation, let's use a standard hook approach if possible or check params locally.
            // Actually, since this is a Screen, props.route is better, but we used useNavigation hook.
        }
    }, [navigation]);

    // Better implementation check:
    // This is a direct screen component, so it receives { route } prop.
    // I will refactor the signature to accept props.

    // --- Helpers ---
    const parseAmount = (str?: string) => {
        if (!str) return 0;
        return parseFloat(str.replace(/[^0-9.-]+/g, '')) || 0;
    };

    const isOverdue = (date: Date) => {
        const today = new Date();
        const diffTime = today.getTime() - new Date(date).getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays > 30; // 30 days default term
    };

    // --- Filtering Logic ---
    const processedData = useMemo(() => {
        // 1. Filter Invoices Only
        let data = transactions.filter(t => t.type === 'invoice');

        // 2. Status Filter
        if (selectedTab === 'pending') {
            data = data.filter(t => t.status === 'pending');
        } else if (selectedTab === 'paid') {
            data = data.filter(t => t.status === 'paid');
        } else if (selectedTab === 'overdue') {
            data = data.filter(t => t.status === 'pending' && isOverdue(t.date));
            // Or if status is explicitly 'overdue' if we set that
        }

        // 3. Search
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            data = data.filter(t =>
                t.title.toLowerCase().includes(query) ||
                (t.clientName && t.clientName.toLowerCase().includes(query)) ||
                (t.category && t.category.toLowerCase().includes(query))
            );
        }

        // 4. Sort by Date Newest
        data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        // 5. Group by Month
        const grouped: { title: string, data: typeof data }[] = [];
        data.forEach(item => {
            const dateLabel = new Date(item.date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
            let group = grouped.find(g => g.title === dateLabel);
            if (!group) {
                group = { title: dateLabel, data: [] };
                grouped.push(group);
            }
            group.data.push(item);
        });

        return grouped;
    }, [transactions, selectedTab, searchQuery]);

    // --- Actions ---
    // Actions are now handled in Detail Screen via Navigation

    // --- List Logic ---
    const renderItem = ({ item }: { item: Transaction }) => {
        const _isOverdue = item.status === 'pending' && isOverdue(item.date);

        return (
            <TouchableOpacity
                style={styles.card}
                onPress={() => navigation.navigate('InvoiceDetails', { transactionId: item.id })}
            >
                <View style={styles.cardRow}>
                    <View style={{ gap: 4 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                            <FileText size={16} color={COLORS.textPrimary} />
                            <Text style={styles.cardTitle}>{item.title}</Text>
                        </View>
                        <Text style={styles.cardClient}>לקוח: {item.clientName || 'ללא לקוח'}</Text>
                    </View>
                    <View style={{ alignItems: 'flex-end', gap: 4 }}>
                        <Text style={styles.cardAmount}>{item.amount}</Text>
                        <Text style={styles.cardDate}>{new Date(item.date).toLocaleDateString('he-IL', { day: 'numeric', month: 'short' })}</Text>
                    </View>
                </View>

                {/* Status Badge */}
                <View style={styles.cardFooter}>
                    {item.status === 'paid' ? (
                        <View style={[styles.badge, styles.badgePaid]}>
                            <Check size={12} color={COLORS.success} />
                            <Text style={[styles.badgeText, styles.textPaid]}>שולם (6 ינו׳)</Text>
                        </View>
                    ) : _isOverdue ? (
                        <View style={[styles.badge, styles.badgeOverdue]}>
                            <AlertTriangle size={12} color={COLORS.danger} />
                            <Text style={[styles.badgeText, styles.textOverdue]}>בתנודה (10 ימים!)</Text>
                        </View>
                    ) : (
                        <View style={[styles.badge, styles.badgePending]}>
                            <Clock size={12} color={COLORS.warning} />
                            <Text style={[styles.badgeText, styles.textPending]}>בתהליך</Text>
                        </View>
                    )}
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            <StatusBar style="light" backgroundColor={COLORS.background} />

            {/* 1. Header */}
            <View style={[styles.header, { paddingTop: insets.top }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <ArrowRight size={24} color={COLORS.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>פרויקטים / חשבוניות</Text>
                <View style={{ width: 24 }} />
            </View>

            {/* 1B. Status Tabs */}
            <View style={styles.tabsContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsScroll}>
                    {(['all', 'pending', 'paid', 'overdue'] as StatusTab[]).map(tab => {
                        const isActive = selectedTab === tab;
                        const label = tab === 'all' ? 'הכל' : tab === 'pending' ? 'בתהליך' : tab === 'paid' ? 'שולם' : 'בתנודה';
                        const count = transactions.filter(t =>
                            t.type === 'invoice' &&
                            (tab === 'all' ? true :
                                tab === 'overdue' ? (t.status === 'pending' && isOverdue(t.date)) :
                                    t.status === tab)
                        ).length;

                        return (
                            <TouchableOpacity
                                key={tab}
                                style={[styles.tab, isActive && styles.tabActive]}
                                onPress={() => setSelectedTab(tab)}
                            >
                                <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
                                    {label} ({count})
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>
            </View>

            {/* 2. Search & Filter Bar */}
            <View style={styles.filterBar}>
                <View style={styles.searchContainer}>
                    <Search size={18} color={COLORS.textSecondary} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="חפש פרויקט או לקוח..."
                        placeholderTextColor={COLORS.textSecondary}
                        textAlign="right"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>
                {/* Expandable filters placeholder */}
            </View>

            {/* 3. List */}
            <SectionList
                sections={processedData}
                keyExtractor={item => item.id}
                renderItem={renderItem}
                renderSectionHeader={({ section: { title } }) => (
                    <Text style={styles.sectionHeader}>{title}</Text>
                )}
                contentContainerStyle={{ paddingBottom: 100 }}
                stickySectionHeadersEnabled={true}
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyText}>לא נמצאו חשבוניות</Text>
                    </View>
                }
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingBottom: 16,
        backgroundColor: COLORS.background,
    },
    backBtn: { padding: 4 },
    headerTitle: {
        fontSize: 20,
        color: COLORS.textPrimary,
        fontFamily: FONTS.medium,
    },
    // Tabs
    tabsContainer: {
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    tabsScroll: {
        paddingHorizontal: 20,
        gap: 12,
    },
    tab: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        backgroundColor: COLORS.surface,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    tabActive: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
    },
    tabText: {
        color: COLORS.textSecondary,
        fontSize: 14,
        fontFamily: FONTS.medium,
    },
    tabTextActive: {
        color: COLORS.textPrimary,
    },
    // Search
    filterBar: {
        padding: 16,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.surface,
        borderRadius: 12,
        paddingHorizontal: 12,
        height: 44,
        gap: 8,
    },
    searchInput: {
        flex: 1,
        color: COLORS.textPrimary,
        fontFamily: FONTS.regular,
        textAlign: 'right',
        fontSize: 14,
    },
    // List
    sectionHeader: {
        backgroundColor: COLORS.background,
        paddingHorizontal: 20,
        paddingVertical: 8,
        color: COLORS.textPrimary,
        fontSize: 14,
        fontFamily: FONTS.medium,
        textAlign: 'left'
    },
    card: {
        backgroundColor: COLORS.surface,
        marginHorizontal: 20,
        marginBottom: 12,
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: COLORS.border,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 3,
        elevation: 2,
    },
    cardRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    cardTitle: {
        color: COLORS.textPrimary,
        fontSize: 16,
        fontFamily: FONTS.medium,
    },
    cardClient: {
        color: COLORS.textSecondary,
        fontSize: 13,
        fontFamily: FONTS.regular,
        textAlign: 'left'
    },
    cardAmount: {
        color: COLORS.primary,
        fontSize: 16,
        fontFamily: FONTS.bold,
    },
    cardDate: {
        color: COLORS.textTertiary,
        fontSize: 12,
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
    },
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        gap: 4,
    },
    badgePaid: { backgroundColor: 'rgba(76, 175, 80, 0.1)' },
    badgePending: { backgroundColor: 'rgba(255, 152, 0, 0.1)' },
    badgeOverdue: { backgroundColor: 'rgba(255, 82, 82, 0.1)' },
    badgeText: { fontSize: 12, fontFamily: FONTS.medium },
    textPaid: { color: COLORS.success },
    textPending: { color: COLORS.warning },
    textOverdue: { color: COLORS.danger },

    emptyState: { padding: 40, alignItems: 'center' },
    emptyText: { color: COLORS.textSecondary, fontSize: 16 },

    // FAB
    fabContainer: {
        position: 'absolute',
        bottom: 30,
        left: 20,
        right: 20,
    },
    fab: {
        backgroundColor: COLORS.primary,
        borderRadius: 16,
        paddingVertical: 16,
        alignItems: 'center',
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    fabText: {
        color: COLORS.white,
        fontSize: 16,
        fontFamily: FONTS.bold,
    },

    // Modal
    modalContainer: {
        flex: 1,
        backgroundColor: COLORS.background,
        paddingVertical: 20,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    closeText: { color: COLORS.secondary, fontSize: 16, fontFamily: FONTS.medium },
    modalTitle: { color: COLORS.textPrimary, fontSize: 18, fontFamily: FONTS.bold },
    modalContent: { padding: 20 },
    detailCard: {
        backgroundColor: COLORS.surface,
        borderRadius: 16,
        padding: 16,
        marginBottom: 20,
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    label: { color: COLORS.textSecondary, fontSize: 14, fontFamily: FONTS.regular, textAlign: 'left' },
    value: { color: COLORS.textPrimary, fontSize: 14, fontFamily: FONTS.medium, textAlign: 'right', flex: 1, marginLeft: 16 },

    sectionTitle: {
        color: COLORS.textPrimary,
        fontSize: 16,
        fontFamily: FONTS.bold,
        marginBottom: 12,
        textAlign: 'left'
    },
    mathRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    mathText: { color: COLORS.textSecondary, fontSize: 14 },
    mathVal: { color: COLORS.textPrimary, fontSize: 14 },
    divider: { height: 1, backgroundColor: COLORS.border, marginVertical: 8 },

    expenseRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    expName: { color: COLORS.textSecondary, fontSize: 14 },
    expAmount: { color: COLORS.danger, fontSize: 14, fontFamily: FONTS.medium },

    actionGrid: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 20,
        justifyContent: 'space-between',
    },
    actionBtn: {
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.surface,
        borderRadius: 12,
        padding: 12,
        flex: 1,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    actionLabel: {
        color: COLORS.textPrimary,
        fontSize: 12,
        marginTop: 4,
        fontFamily: FONTS.medium,
    },
    markPaidBtn: {
        backgroundColor: COLORS.primary,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        borderRadius: 16,
        gap: 8,
    },
    markPaidText: { color: COLORS.white, fontSize: 16, fontFamily: FONTS.bold },
});
