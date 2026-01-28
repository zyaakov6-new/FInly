import React, { useState, useMemo } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    FlatList,
    TextInput,
    Modal,
    Pressable,
    Animated,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import {
    ChevronRight,
    FileText,
    TrendingUp,
    TrendingDown,
    Search,
    Filter,
    X,
    Download,
    Check,
    Calendar,
} from 'lucide-react-native';
import { useTransactions, Transaction } from '../context/TransactionsContext';
import { useTheme } from '../context/ThemeContext';
import { useNotification } from '../context/NotificationContext';
import { getColors, FONTS, SPACING, RADIUS, SHADOWS, TYPOGRAPHY, LAYOUT } from '../constants/theme';
import { exportTransactions } from '../services/DataExportService';

type FilterType = 'all' | 'income' | 'expense';
type SortType = 'date' | 'amount';
type TimeRange = 'all' | 'week' | 'month' | 'year';

export default function AllActivityScreen() {
    const navigation = useNavigation<any>();
    const insets = useSafeAreaInsets();
    const { resolvedTheme, isDark } = useTheme();
    const colors = getColors(resolvedTheme);
    const { allTransactions } = useTransactions();
    const { showSuccess, showError } = useNotification();

    // Search & Filter State
    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState<FilterType>('all');
    const [sortType, setSortType] = useState<SortType>('date');
    const [timeRange, setTimeRange] = useState<TimeRange>('all');
    const [showFilterModal, setShowFilterModal] = useState(false);
    const [isExporting, setIsExporting] = useState(false);

    // Filtered & Sorted Transactions
    const filteredTransactions = useMemo(() => {
        let result = [...allTransactions];

        // Apply search
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            result = result.filter(t =>
                t.title?.toLowerCase().includes(query) ||
                t.clientName?.toLowerCase().includes(query) ||
                t.category?.toLowerCase().includes(query) ||
                t.amount?.toLowerCase().includes(query)
            );
        }

        // Apply type filter
        if (filterType === 'income') {
            result = result.filter(t => t.isIncome || t.type === 'invoice');
        } else if (filterType === 'expense') {
            result = result.filter(t => !t.isIncome && t.type !== 'invoice');
        }

        // Apply time range
        const now = new Date();
        if (timeRange === 'week') {
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            result = result.filter(t => new Date(t.date) >= weekAgo);
        } else if (timeRange === 'month') {
            const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
            result = result.filter(t => new Date(t.date) >= monthAgo);
        } else if (timeRange === 'year') {
            const yearStart = new Date(now.getFullYear(), 0, 1);
            result = result.filter(t => new Date(t.date) >= yearStart);
        }

        // Apply sort
        if (sortType === 'date') {
            result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        } else {
            result.sort((a, b) => {
                const amountA = parseFloat(a.amount.replace(/[^0-9.-]+/g, '')) || 0;
                const amountB = parseFloat(b.amount.replace(/[^0-9.-]+/g, '')) || 0;
                return amountB - amountA;
            });
        }

        return result;
    }, [allTransactions, searchQuery, filterType, sortType, timeRange]);

    const handleExport = async (type: 'all' | 'monthly' | 'yearly') => {
        try {
            setIsExporting(true);
            await exportTransactions(allTransactions, type);
            showSuccess('הנתונים יוצאו בהצלחה', 'הקובץ מוכן לשיתוף');
        } catch (error) {
            showError('שגיאה בייצוא', 'לא הצלחנו לייצא את הנתונים');
        } finally {
            setIsExporting(false);
            setShowFilterModal(false);
        }
    };

    const handleTransactionPress = (item: Transaction) => {
        if (item.type === 'invoice') {
            navigation.navigate('InvoiceDetails', { transactionId: item.id });
        }
    };

    const renderItem = ({ item }: { item: Transaction }) => {
        const timeAgo = () => {
            const days = Math.floor((Date.now() - new Date(item.date).getTime()) / (1000 * 60 * 60 * 24));
            if (days === 0) return 'היום';
            if (days === 1) return 'אתמול';
            return `לפני ${days} ימים`;
        };

        const isIncome = item.isIncome;

        return (
            <TouchableOpacity
                style={[styles.activityItem, { backgroundColor: colors.surface }, SHADOWS.sm]}
                onPress={() => handleTransactionPress(item)}
                activeOpacity={0.7}
            >
                <View style={styles.activityContent}>
                    <View style={[
                        styles.iconContainer,
                        { backgroundColor: isIncome ? colors.successMuted : colors.dangerMuted }
                    ]}>
                        {isIncome ? (
                            <TrendingUp size={18} color={colors.success} />
                        ) : (
                            <TrendingDown size={18} color={colors.danger} />
                        )}
                    </View>
                    <View style={styles.textContent}>
                        <Text style={[styles.activityTitle, { color: colors.textPrimary }]}>
                            {item.title}
                        </Text>
                        <Text style={[styles.activityTime, { color: colors.textTertiary }]}>
                            {timeAgo()} • {item.category || 'כללי'}
                        </Text>
                    </View>
                </View>
                <View style={styles.amountSection}>
                    <Text style={[
                        styles.activityAmount,
                        { color: isIncome ? colors.success : colors.danger }
                    ]}>
                        {isIncome ? '+' : '-'}{item.amount}
                    </Text>
                    {item.type === 'invoice' && (
                        <View style={[
                            styles.statusBadge,
                            { backgroundColor: item.status === 'paid' ? colors.successMuted : colors.warningMuted }
                        ]}>
                            <Text style={[
                                styles.statusText,
                                { color: item.status === 'paid' ? colors.success : colors.warning }
                            ]}>
                                {item.status === 'paid' ? 'שולם' : 'ממתין'}
                            </Text>
                        </View>
                    )}
                </View>
            </TouchableOpacity>
        );
    };

    // Filter Modal
    const FilterModal = () => (
        <Modal
            visible={showFilterModal}
            transparent
            animationType="fade"
            onRequestClose={() => setShowFilterModal(false)}
        >
            <Pressable style={styles.modalOverlay} onPress={() => setShowFilterModal(false)}>
                <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
                    <View style={styles.modalHeader}>
                        <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
                            סינון וייצוא
                        </Text>
                        <TouchableOpacity onPress={() => setShowFilterModal(false)}>
                            <X size={24} color={colors.textTertiary} />
                        </TouchableOpacity>
                    </View>

                    {/* Type Filter */}
                    <Text style={[styles.filterLabel, { color: colors.textSecondary }]}>סוג עסקה</Text>
                    <View style={styles.filterOptions}>
                        {(['all', 'income', 'expense'] as FilterType[]).map(type => (
                            <TouchableOpacity
                                key={type}
                                style={[
                                    styles.filterOption,
                                    { backgroundColor: colors.surfaceSecondary },
                                    filterType === type && { backgroundColor: colors.primary }
                                ]}
                                onPress={() => setFilterType(type)}
                            >
                                <Text style={[
                                    styles.filterOptionText,
                                    { color: colors.textSecondary },
                                    filterType === type && { color: '#FFFFFF' }
                                ]}>
                                    {type === 'all' ? 'הכל' : type === 'income' ? 'הכנסות' : 'הוצאות'}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Time Range */}
                    <Text style={[styles.filterLabel, { color: colors.textSecondary }]}>טווח זמן</Text>
                    <View style={styles.filterOptions}>
                        {([
                            { value: 'all', label: 'הכל' },
                            { value: 'week', label: 'שבוע' },
                            { value: 'month', label: 'חודש' },
                            { value: 'year', label: 'שנה' },
                        ] as { value: TimeRange; label: string }[]).map(item => (
                            <TouchableOpacity
                                key={item.value}
                                style={[
                                    styles.filterOption,
                                    { backgroundColor: colors.surfaceSecondary },
                                    timeRange === item.value && { backgroundColor: colors.primary }
                                ]}
                                onPress={() => setTimeRange(item.value)}
                            >
                                <Text style={[
                                    styles.filterOptionText,
                                    { color: colors.textSecondary },
                                    timeRange === item.value && { color: '#FFFFFF' }
                                ]}>
                                    {item.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Sort */}
                    <Text style={[styles.filterLabel, { color: colors.textSecondary }]}>מיון לפי</Text>
                    <View style={styles.filterOptions}>
                        {([
                            { value: 'date', label: 'תאריך' },
                            { value: 'amount', label: 'סכום' },
                        ] as { value: SortType; label: string }[]).map(item => (
                            <TouchableOpacity
                                key={item.value}
                                style={[
                                    styles.filterOption,
                                    { backgroundColor: colors.surfaceSecondary },
                                    sortType === item.value && { backgroundColor: colors.primary }
                                ]}
                                onPress={() => setSortType(item.value)}
                            >
                                <Text style={[
                                    styles.filterOptionText,
                                    { color: colors.textSecondary },
                                    sortType === item.value && { color: '#FFFFFF' }
                                ]}>
                                    {item.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Export Options */}
                    <Text style={[styles.filterLabel, { color: colors.textSecondary, marginTop: SPACING.lg }]}>
                        ייצוא נתונים
                    </Text>
                    <View style={styles.exportOptions}>
                        <TouchableOpacity
                            style={[styles.exportButton, { backgroundColor: colors.surfaceSecondary }]}
                            onPress={() => handleExport('all')}
                            disabled={isExporting}
                        >
                            <Download size={20} color={colors.primary} />
                            <Text style={[styles.exportButtonText, { color: colors.textPrimary }]}>
                                כל העסקאות
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.exportButton, { backgroundColor: colors.surfaceSecondary }]}
                            onPress={() => handleExport('monthly')}
                            disabled={isExporting}
                        >
                            <Calendar size={20} color={colors.primary} />
                            <Text style={[styles.exportButtonText, { color: colors.textPrimary }]}>
                                דוח חודשי
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.exportButton, { backgroundColor: colors.surfaceSecondary }]}
                            onPress={() => handleExport('yearly')}
                            disabled={isExporting}
                        >
                            <FileText size={20} color={colors.primary} />
                            <Text style={[styles.exportButtonText, { color: colors.textPrimary }]}>
                                דוח שנתי
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Pressable>
        </Modal>
    );

    const activeFiltersCount = (filterType !== 'all' ? 1 : 0) + (timeRange !== 'all' ? 1 : 0);

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <StatusBar style={isDark ? 'light' : 'dark'} />
            <FilterModal />

            {/* Header */}
            <View style={[styles.header, { paddingTop: insets.top + SPACING.md }]}>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={[styles.headerButton, { backgroundColor: colors.surfaceSecondary }]}
                >
                    <ChevronRight size={24} color={colors.textSecondary} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
                    כל הפעילות
                </Text>
                <TouchableOpacity
                    onPress={() => setShowFilterModal(true)}
                    style={[styles.headerButton, { backgroundColor: colors.surfaceSecondary }]}
                >
                    <Filter size={20} color={colors.textSecondary} />
                    {activeFiltersCount > 0 && (
                        <View style={[styles.filterBadge, { backgroundColor: colors.primary }]}>
                            <Text style={styles.filterBadgeText}>{activeFiltersCount}</Text>
                        </View>
                    )}
                </TouchableOpacity>
            </View>

            {/* Search Bar */}
            <View style={[styles.searchContainer, { paddingHorizontal: LAYOUT.screenPadding }]}>
                <View style={[styles.searchBar, { backgroundColor: colors.surface }]}>
                    <Search size={20} color={colors.textTertiary} />
                    <TextInput
                        style={[styles.searchInput, { color: colors.textPrimary }]}
                        placeholder="חיפוש עסקאות..."
                        placeholderTextColor={colors.textTertiary}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        textAlign="right"
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => setSearchQuery('')}>
                            <X size={18} color={colors.textTertiary} />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {/* Results Count */}
            <View style={[styles.resultsBar, { paddingHorizontal: LAYOUT.screenPadding }]}>
                <Text style={[styles.resultsText, { color: colors.textSecondary }]}>
                    {filteredTransactions.length} עסקאות
                </Text>
            </View>

            {/* List */}
            <FlatList
                data={filteredTransactions}
                renderItem={renderItem}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <View style={[styles.emptyIcon, { backgroundColor: colors.surfaceSecondary }]}>
                            <FileText size={32} color={colors.textTertiary} />
                        </View>
                        <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>
                            {searchQuery ? 'לא נמצאו תוצאות' : 'אין פעילות עדיין'}
                        </Text>
                        <Text style={[styles.emptySubtitle, { color: colors.textTertiary }]}>
                            {searchQuery ? 'נסה לחפש משהו אחר' : 'ההכנסות וההוצאות שלך יופיעו כאן'}
                        </Text>
                    </View>
                }
            />
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
        paddingBottom: SPACING.md,
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
    filterBadge: {
        position: 'absolute',
        top: 6,
        right: 6,
        width: 18,
        height: 18,
        borderRadius: 9,
        alignItems: 'center',
        justifyContent: 'center',
    },
    filterBadgeText: {
        color: '#FFFFFF',
        fontSize: 10,
        fontFamily: FONTS.bold,
    },
    searchContainer: {
        paddingBottom: SPACING.md,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.sm,
        borderRadius: RADIUS.lg,
        gap: SPACING.sm,
    },
    searchInput: {
        flex: 1,
        ...TYPOGRAPHY.body,
        paddingVertical: SPACING.xs,
    },
    resultsBar: {
        paddingBottom: SPACING.md,
    },
    resultsText: {
        ...TYPOGRAPHY.caption,
    },
    listContent: {
        paddingHorizontal: LAYOUT.screenPadding,
        paddingBottom: 100,
    },
    activityItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: SPACING.lg,
        borderRadius: RADIUS.xl,
        marginBottom: SPACING.md,
    },
    activityContent: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    iconContainer: {
        width: 44,
        height: 44,
        borderRadius: RADIUS.md,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: SPACING.md,
    },
    textContent: {
        flex: 1,
    },
    activityTitle: {
        ...TYPOGRAPHY.body,
        fontFamily: FONTS.medium,
        marginBottom: SPACING.xs,
    },
    activityTime: {
        ...TYPOGRAPHY.caption,
    },
    amountSection: {
        alignItems: 'flex-end',
    },
    activityAmount: {
        ...TYPOGRAPHY.label,
        marginBottom: SPACING.xs,
    },
    statusBadge: {
        paddingHorizontal: SPACING.sm,
        paddingVertical: SPACING.xs,
        borderRadius: RADIUS.sm,
    },
    statusText: {
        ...TYPOGRAPHY.captionSmall,
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: SPACING['6xl'],
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
    },
    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        borderTopLeftRadius: RADIUS['2xl'],
        borderTopRightRadius: RADIUS['2xl'],
        padding: LAYOUT.screenPadding,
        paddingBottom: SPACING['3xl'],
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.xl,
    },
    modalTitle: {
        ...TYPOGRAPHY.h3,
    },
    filterLabel: {
        ...TYPOGRAPHY.label,
        marginBottom: SPACING.sm,
        marginTop: SPACING.md,
    },
    filterOptions: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: SPACING.sm,
    },
    filterOption: {
        paddingHorizontal: SPACING.lg,
        paddingVertical: SPACING.sm,
        borderRadius: RADIUS.full,
    },
    filterOptionText: {
        ...TYPOGRAPHY.bodySmall,
        fontFamily: FONTS.medium,
    },
    exportOptions: {
        gap: SPACING.sm,
    },
    exportButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: SPACING.md,
        borderRadius: RADIUS.lg,
        gap: SPACING.md,
    },
    exportButtonText: {
        ...TYPOGRAPHY.body,
        fontFamily: FONTS.medium,
    },
});
