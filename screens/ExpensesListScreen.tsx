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
    Alert,
    Modal,
    Image,
    RefreshControl
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { ArrowRight, Search, Filter, SlidersHorizontal, ChevronDown, Trash2, FolderInput, Share as ShareIcon, X, Check, ArrowDown, ArrowUp, ImageIcon, Edit, Download } from 'lucide-react-native';
import { StatusBar } from 'expo-status-bar';
import { useTransactions } from '../context/TransactionsContext';
import { COLORS, FONTS } from '../constants/theme';
import { exportToCSV } from '../utils/exportData';
import { hapticFeedback } from '../utils/haptics';
import { EmptyState } from '../components/EmptyState';

const { width } = Dimensions.get('window');

// Types for Filters
type SortOption = 'date-newest' | 'date-oldest' | 'amount-highest' | 'amount-lowest';

export default function ExpensesListScreen() {
    const insets = useSafeAreaInsets();
    const navigation = useNavigation();
    const { transactions, categories, deleteTransaction } = useTransactions();

    // State
    const [searchQuery, setSearchQuery] = useState('');
    const [isFilterExpanded, setIsFilterExpanded] = useState(false);
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [sortOption, setSortOption] = useState<SortOption>('date-newest');
    const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);
    const [selectedReceipt, setSelectedReceipt] = useState<string | null>(null);
    const [refreshing, setRefreshing] = useState(false);

    // Batch Ops State
    // const [selectionMode, setSelectionMode] = useState(false);
    // const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

    // --- Helpers ---
    const parseAmount = (str?: string) => {
        if (!str) return 0;
        return parseFloat(str.replace(/[^0-9.-]+/g, '')) || 0;
    };

    // Export handler
    const handleExport = async () => {
        try {
            hapticFeedback.light();
            const expensesOnly = transactions
                .filter(t => t.type === 'expense')
                .map(t => ({
                    ...t,
                    date: t.date instanceof Date ? t.date.toISOString() : t.date
                }));
            if (expensesOnly.length === 0) {
                hapticFeedback.warning();
                Alert.alert('אין נתונים', 'אין הוצאות לייצוא');
                return;
            }
            await exportToCSV(expensesOnly, 'finly_expenses.csv');
            hapticFeedback.success();
            Alert.alert('הצלחה!', `יוצאו ${expensesOnly.length} הוצאות`);
        } catch (error) {
            hapticFeedback.error();
            Alert.alert('שגיאה', 'שגיאה בייצוא הנתונים');
        }
    };

    // Pull to refresh handler
    const onRefresh = async () => {
        setRefreshing(true);
        // Simulate refresh - in real app, would fetch from server
        await new Promise(resolve => setTimeout(resolve, 1000));
        setRefreshing(false);
    };

    // --- Filtering & Sorting Logic ---
    const processedData = useMemo(() => {
        let data = transactions.filter(t => t.type === 'expense');

        // 1. Search
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            data = data.filter(t =>
                t.title.toLowerCase().includes(query) ||
                (t.category && t.category.toLowerCase().includes(query)) ||
                (t.notes && t.notes.toLowerCase().includes(query)) ||
                (t.supplier && t.supplier.toLowerCase().includes(query))
            );
        }

        // 2. Filter by Category
        if (selectedCategories.length > 0) {
            data = data.filter(t => t.category && selectedCategories.includes(t.category));
        }

        // 3. Sort
        data.sort((a, b) => {
            const dateA = new Date(a.date).getTime();
            const dateB = new Date(b.date).getTime();
            const amountA = parseAmount(a.amount);
            const amountB = parseAmount(b.amount);

            switch (sortOption) {
                case 'date-newest': return dateB - dateA;
                case 'date-oldest': return dateA - dateB;
                case 'amount-highest': return amountB - amountA;
                case 'amount-lowest': return amountA - amountB;
                default: return dateB - dateA;
            }
        });

        // 4. Group by Date
        const grouped: { title: string, data: typeof data }[] = [];
        data.forEach(item => {
            const dateLabel = new Date(item.date).toLocaleDateString('he-IL', { day: 'numeric', month: 'long', year: 'numeric' });
            let group = grouped.find(g => g.title === dateLabel);
            if (!group) {
                group = { title: dateLabel, data: [] };
                grouped.push(group);
            }
            group.data.push(item);
        });

        return { grouped, raw: data };
    }, [transactions, searchQuery, selectedCategories, sortOption]);

    const totalFilteredAmount = processedData.raw.reduce((sum, item) => sum + parseAmount(item.amount), 0);

    // --- Render Items ---
    const renderItem = ({ item }: { item: any }) => (
        <View style={styles.itemContainer}>
            <TouchableOpacity style={styles.itemContent}>
                <View style={styles.itemRow}>
                    <View style={styles.itemIconData}>
                        <Text style={styles.itemCategory}>{item.category || 'כללי'}</Text>
                        <Text style={styles.itemDate}>{new Date(item.date).toLocaleDateString('he-IL')}</Text>
                    </View>
                    <View style={styles.itemAmountData}>
                        <Text style={styles.itemAmount}>₪{parseAmount(item.amount).toLocaleString()}</Text>
                        {item.supplier && <Text style={styles.itemSupplier}>{item.supplier}</Text>}
                    </View>
                    {item.receiptImageUri && (
                        <TouchableOpacity
                            onPress={() => setSelectedReceipt(item.receiptImageUri)}
                            style={{ marginRight: 8 }}
                        >
                            <ImageIcon size={20} color={COLORS.primary} />
                        </TouchableOpacity>
                    )}
                </View>
                {item.clientName && (
                    <Text style={styles.itemProject}>פרויקט: {item.clientName}</Text>
                )}
            </TouchableOpacity>
            <View style={styles.itemActions}>
                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => {
                        hapticFeedback.light();
                        // Navigate to edit screen with expense data
                        navigation.navigate('AddExpense' as never, { expense: item } as never);
                    }}
                >
                    <Edit size={18} color={COLORS.primary} />
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => {
                        hapticFeedback.warning();
                        Alert.alert(
                            'מחיקת הוצאה',
                            'האם למחוק הוצאה זו?',
                            [
                                {
                                    text: 'ביטול',
                                    style: 'cancel',
                                    onPress: () => hapticFeedback.light()
                                },
                                {
                                    text: 'מחק',
                                    style: 'destructive',
                                    onPress: () => {
                                        hapticFeedback.success();
                                        deleteTransaction(item.id);
                                    },
                                },
                            ]
                        );
                    }}
                >
                    <Trash2 size={18} color={COLORS.danger} />
                </TouchableOpacity>
            </View>
        </View>
    );

    const renderReceiptModal = () => (
        <Modal
            visible={selectedReceipt !== null}
            transparent
            animationType="fade"
            onRequestClose={() => setSelectedReceipt(null)}
        >
            <View style={styles.modalOverlay}>
                <TouchableOpacity
                    style={styles.modalCloseArea}
                    activeOpacity={1}
                    onPress={() => setSelectedReceipt(null)}
                />
                <View style={styles.receiptModalContent}>
                    <View style={styles.receiptModalHeader}>
                        <Text style={styles.receiptModalTitle}>קבלה</Text>
                        <TouchableOpacity onPress={() => setSelectedReceipt(null)}>
                            <X color={COLORS.textPrimary} size={24} />
                        </TouchableOpacity>
                    </View>
                    {selectedReceipt && (
                        <Image
                            source={{ uri: selectedReceipt }}
                            style={styles.receiptImage}
                            resizeMode="contain"
                        />
                    )}
                </View>
            </View>
        </Modal>
    );

    return (
        <View style={styles.container}>
            <StatusBar style="light" backgroundColor={COLORS.background} />

            {/* Header */}
            <View style={[styles.header, { paddingTop: insets.top }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <ArrowRight color={COLORS.primary} size={24} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>הוצאות</Text>
                <View style={{ width: 24 }} />
            </View>

            {/* Search & Filters */}
            <View style={styles.filterSection}>
                {/* Search Bar */}
                <View style={styles.searchBar}>
                    <Search color={COLORS.textSecondary} size={20} style={{ marginLeft: 8 }} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="חפש הוצאה..."
                        placeholderTextColor={COLORS.textSecondary}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        textAlign="right"
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => setSearchQuery('')}>
                            <X color={COLORS.textSecondary} size={18} />
                        </TouchableOpacity>
                    )}
                </View>

                {/* Filter Toggle Row */}
                <View style={styles.filterControls}>
                    <TouchableOpacity
                        style={styles.filterToggleBtn}
                        onPress={() => setIsFilterExpanded(!isFilterExpanded)}
                    >
                        <Filter size={16} color={COLORS.textSecondary} />
                        <Text style={styles.filterBtnText}>סינון</Text>
                        <ChevronDown size={14} color={COLORS.textSecondary} style={{ transform: [{ rotate: isFilterExpanded ? '180deg' : '0deg' }] }} />
                    </TouchableOpacity>

                    {/* Sort Dropdown Trigger (Simplified for now) */}
                    <TouchableOpacity
                        style={styles.filterToggleBtn}
                        onPress={() => {
                            // Cycle sort for MVP or open modal
                            const nextSort = sortOption === 'date-newest' ? 'date-oldest' :
                                sortOption === 'date-oldest' ? 'amount-highest' :
                                    sortOption === 'amount-highest' ? 'amount-lowest' : 'date-newest';
                            setSortOption(nextSort);
                        }}
                    >
                        <ArrowUp size={16} color={COLORS.textSecondary} />
                        <Text style={styles.filterBtnText}>
                            {sortOption === 'date-newest' ? 'תאריך (הכי חדש)' :
                                sortOption === 'date-oldest' ? 'תאריך (הכי ישן)' :
                                    sortOption === 'amount-highest' ? 'סכום (הכי גבוה)' : 'סכום (הכי נמוך)'}
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Expandable Filters */}
                {isFilterExpanded && (
                    <View style={styles.expandedFilters}>
                        <Text style={styles.filterLabel}>לפי קטגוריה:</Text>
                        <View style={styles.catsRow}>
                            {categories.map(cat => {
                                const isSel = selectedCategories.includes(cat);
                                return (
                                    <TouchableOpacity
                                        key={cat}
                                        style={[styles.catChip, isSel && styles.catChipSelected]}
                                        onPress={() => {
                                            if (isSel) setSelectedCategories(prev => prev.filter(c => c !== cat));
                                            else setSelectedCategories(prev => [...prev, cat]);
                                        }}
                                    >
                                        <Text style={[styles.catChipText, isSel && styles.catChipTextSelected]}>{cat}</Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    </View>
                )}
            </View>

            {/* List */}
            {processedData.grouped.length === 0 ? (
                <EmptyState
                    icon="📊"
                    title="אין הוצאות עדיין"
                    message="לחץ על כפתור + בתפריט התחתון\nכדי להוסיף הוצאה ראשונה"
                />
            ) : (
                <SectionList
                    sections={processedData.grouped}
                    keyExtractor={item => item.id}
                    renderItem={renderItem}
                    renderSectionHeader={({ section: { title } }) => (
                        <Text style={styles.sectionHeader}>{title}</Text>
                    )}
                    contentContainerStyle={{ paddingBottom: 100 }}
                    stickySectionHeadersEnabled={true}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            tintColor={COLORS.primary}
                            colors={[COLORS.primary]}
                        />
                    }
                />
            )}

            {/* Footer Totals */}
            <View style={styles.stickyFooter}>
                <View style={styles.footerRow}>
                    <Text style={styles.footerLabel}>סה״כ הוצאות מסוננות:</Text>
                    <Text style={styles.footerAmount}>₪{totalFilteredAmount.toLocaleString()}</Text>
                </View>
                <Text style={styles.footerCount}>מספר פריטים: {processedData.raw.length}</Text>
            </View>

            {renderReceiptModal()}
        </View>
    );
}

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
        paddingBottom: 20,
        backgroundColor: COLORS.background,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    backButton: { padding: 4 },
    exportButton: { padding: 4 },
    headerTitle: {
        fontSize: 20,
        color: COLORS.textPrimary,
        fontFamily: FONTS.medium,
    },

    // Filters
    filterSection: {
        padding: 16,
        backgroundColor: COLORS.background,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.surface,
        borderRadius: 12,
        paddingHorizontal: 12,
        height: 44,
        marginBottom: 12,
    },
    searchInput: {
        flex: 1,
        color: COLORS.textPrimary,
        fontSize: 14,
        fontFamily: FONTS.regular,
        marginHorizontal: 8,
        textAlign: 'right'
    },
    filterControls: {
        flexDirection: 'row',
        gap: 12,
    },
    filterToggleBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    filterBtnText: {
        color: COLORS.textSecondary,
        fontSize: 14,
        fontFamily: FONTS.medium,
    },
    expandedFilters: {
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
    },
    filterLabel: {
        color: COLORS.textSecondary,
        fontSize: 12,
        marginBottom: 8,
        textAlign: 'left'
    },
    catsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    catChip: {
        paddingVertical: 6,
        paddingHorizontal: 12,
        backgroundColor: COLORS.surface,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    catChipSelected: {
        borderColor: COLORS.primary,
        backgroundColor: 'rgba(0, 212, 170, 0.1)',
    },
    catChipText: {
        color: COLORS.textSecondary,
        fontSize: 12,
    },
    catChipTextSelected: {
        color: COLORS.primary,
    },

    // List
    sectionHeader: {
        paddingVertical: 8,
        paddingHorizontal: 20,
        backgroundColor: COLORS.background, // Sticky needs opaque bg
        color: COLORS.textSecondary,
        fontSize: 14,
        fontFamily: FONTS.medium,
        textAlign: 'left'
    },
    itemContainer: {
        marginHorizontal: 16,
        marginVertical: 6,
        backgroundColor: COLORS.surface,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: COLORS.border, // Subtle border
    },
    itemContent: {
        padding: 16,
    },
    itemActions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 12,
        paddingHorizontal: 16,
        paddingBottom: 12,
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
        paddingTop: 12,
    },
    actionButton: {
        padding: 8,
    },
    itemRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    itemIconData: {
        gap: 4,
    },
    itemCategory: {
        color: COLORS.textPrimary,
        fontSize: 16,
        fontFamily: FONTS.medium,
        textAlign: 'left'
    },
    itemDate: {
        color: COLORS.textSecondary,
        fontSize: 12,
        textAlign: 'left'
    },
    itemAmountData: {
        alignItems: 'flex-end',
        gap: 4,
    },
    itemAmount: {
        color: COLORS.danger,
        fontSize: 16,
        fontFamily: FONTS.bold,
    },
    itemSupplier: {
        color: COLORS.textSecondary,
        fontSize: 12,
    },
    itemProject: {
        marginTop: 8,
        color: COLORS.textSecondary,
        fontSize: 12,
        textAlign: 'left'
    },

    // Footer
    stickyFooter: {
        padding: 16,
        paddingBottom: 30, // Safe area
        backgroundColor: COLORS.surface,
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
    },
    footerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    footerLabel: {
        color: COLORS.textSecondary,
        fontSize: 14,
    },
    footerAmount: {
        color: COLORS.danger,
        fontSize: 18,
        fontFamily: FONTS.bold,
    },
    footerCount: {
        color: COLORS.textSecondary,
        fontSize: 12,
        textAlign: 'left'
    },

    // Receipt Modal
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalCloseArea: {
        ...StyleSheet.absoluteFillObject,
    },
    receiptModalContent: {
        width: width * 0.9,
        maxHeight: '80%',
        backgroundColor: COLORS.surface,
        borderRadius: 16,
        overflow: 'hidden',
    },
    receiptModalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    receiptModalTitle: {
        fontSize: 18,
        fontFamily: FONTS.bold,
        color: COLORS.textPrimary,
    },
    receiptImage: {
        width: '100%',
        height: 400,
    }
});
