import React, { useState, useMemo, useRef, useEffect } from 'react';
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
    RefreshControl,
    Animated,
    useColorScheme
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { ArrowRight, Search, Filter, SlidersHorizontal, ChevronDown, Trash2, FolderInput, Share as ShareIcon, X, Check, ArrowDown, ArrowUp, ImageIcon, Edit, Download, Calendar, Tag } from 'lucide-react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { useTransactions } from '../context/TransactionsContext';
import { getColors, FONTS, SHADOWS, GRADIENTS } from '../constants/theme';
import { exportToCSV } from '../utils/exportData';
import { hapticFeedback } from '../utils/haptics';
import { EmptyState } from '../components/EmptyState';

const { width } = Dimensions.get('window');

type SortOption = 'date-newest' | 'date-oldest' | 'amount-highest' | 'amount-lowest';

export default function ExpensesListScreen() {
    const insets = useSafeAreaInsets();
    const navigation = useNavigation();
    const colorScheme = useColorScheme();
    const colors = getColors(colorScheme);
    const { transactions, categories, deleteTransaction } = useTransactions();

    // Animations
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(20)).current;

    // State
    const [searchQuery, setSearchQuery] = useState('');
    const [isFilterExpanded, setIsFilterExpanded] = useState(false);
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [sortOption, setSortOption] = useState<SortOption>('date-newest');
    const [selectedReceipt, setSelectedReceipt] = useState<string | null>(null);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 400,
                useNativeDriver: true,
            }),
            Animated.spring(slideAnim, {
                toValue: 0,
                tension: 50,
                friction: 10,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    const parseAmount = (str?: string) => {
        if (!str) return 0;
        return parseFloat(str.replace(/[^0-9.-]+/g, '')) || 0;
    };

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

    const onRefresh = async () => {
        setRefreshing(true);
        await new Promise(resolve => setTimeout(resolve, 1000));
        setRefreshing(false);
    };

    const processedData = useMemo(() => {
        let data = transactions.filter(t => t.type === 'expense');

        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            data = data.filter(t =>
                t.title.toLowerCase().includes(query) ||
                (t.category && t.category.toLowerCase().includes(query)) ||
                (t.notes && t.notes.toLowerCase().includes(query)) ||
                (t.supplier && t.supplier.toLowerCase().includes(query))
            );
        }

        if (selectedCategories.length > 0) {
            data = data.filter(t => t.category && selectedCategories.includes(t.category));
        }

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

    const renderItem = ({ item, index }: { item: any, index: number }) => (
        <Animated.View
            style={[
                styles.itemContainer,
                {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                    ...SHADOWS.small,
                    opacity: fadeAnim,
                    transform: [{ translateY: slideAnim }],
                }
            ]}
        >
            <TouchableOpacity
                style={styles.itemContent}
                onPress={() => navigation.navigate('AddExpense' as never, { expense: item } as never)}
                activeOpacity={0.8}
            >
                <View style={styles.itemRow}>
                    <View style={styles.itemLeft}>
                        <LinearGradient
                            colors={GRADIENTS.primary}
                            style={styles.itemIcon}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                        >
                            <Tag size={18} color="#fff" />
                        </LinearGradient>
                        <View style={styles.itemInfo}>
                            <Text style={[styles.itemCategory, { color: colors.textPrimary }]}>
                                {item.category || 'כללי'}
                            </Text>
                            <View style={styles.itemMeta}>
                                <Calendar size={12} color={colors.textTertiary} />
                                <Text style={[styles.itemDate, { color: colors.textTertiary }]}>
                                    {new Date(item.date).toLocaleDateString('he-IL')}
                                </Text>
                                {item.supplier && (
                                    <Text style={[styles.itemSupplier, { color: colors.textTertiary }]}>
                                        {' | '}{item.supplier}
                                    </Text>
                                )}
                            </View>
                        </View>
                    </View>
                    <View style={styles.itemRight}>
                        <Text style={[styles.itemAmount, { color: colors.danger }]}>
                            -₪{parseAmount(item.amount).toLocaleString()}
                        </Text>
                        {item.receiptImageUri && (
                            <TouchableOpacity
                                onPress={() => setSelectedReceipt(item.receiptImageUri)}
                                style={[styles.receiptBadge, { backgroundColor: colors.infoLight }]}
                            >
                                <ImageIcon size={14} color={colors.info} />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            </TouchableOpacity>
            <View style={[styles.itemActions, { borderTopColor: colors.border }]}>
                <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: colors.infoLight }]}
                    onPress={() => {
                        hapticFeedback.light();
                        navigation.navigate('AddExpense' as never, { expense: item } as never);
                    }}
                >
                    <Edit size={16} color={colors.info} />
                    <Text style={[styles.actionText, { color: colors.info }]}>עריכה</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: colors.dangerLight }]}
                    onPress={() => {
                        hapticFeedback.warning();
                        Alert.alert(
                            'מחיקת הוצאה',
                            'האם למחוק הוצאה זו?',
                            [
                                { text: 'ביטול', style: 'cancel' },
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
                    <Trash2 size={16} color={colors.danger} />
                    <Text style={[styles.actionText, { color: colors.danger }]}>מחיקה</Text>
                </TouchableOpacity>
            </View>
        </Animated.View>
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
                <View style={[styles.receiptModalContent, { backgroundColor: colors.surface }]}>
                    <View style={[styles.receiptModalHeader, { borderBottomColor: colors.border }]}>
                        <Text style={[styles.receiptModalTitle, { color: colors.textPrimary }]}>קבלה</Text>
                        <TouchableOpacity
                            onPress={() => setSelectedReceipt(null)}
                            style={[styles.modalCloseButton, { backgroundColor: colors.glass }]}
                        >
                            <X color={colors.textPrimary} size={20} />
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
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />

            {/* Header */}
            <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={[styles.backButton, { backgroundColor: colors.glass }]}
                >
                    <ArrowRight color={colors.textPrimary} size={22} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>הוצאות</Text>
                <TouchableOpacity
                    onPress={handleExport}
                    style={[styles.exportButton, { backgroundColor: colors.glass }]}
                >
                    <Download color={colors.info} size={20} />
                </TouchableOpacity>
            </View>

            {/* Search & Filters */}
            <Animated.View style={[styles.filterSection, { opacity: fadeAnim }]}>
                {/* Search Bar */}
                <View style={[styles.searchBar, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <Search color={colors.textTertiary} size={20} />
                    <TextInput
                        style={[styles.searchInput, { color: colors.textPrimary }]}
                        placeholder="חפש הוצאה..."
                        placeholderTextColor={colors.textTertiary}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        textAlign="right"
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => setSearchQuery('')}>
                            <X color={colors.textTertiary} size={18} />
                        </TouchableOpacity>
                    )}
                </View>

                {/* Filter Controls */}
                <View style={styles.filterControls}>
                    <TouchableOpacity
                        style={[styles.filterButton, { backgroundColor: colors.glass }]}
                        onPress={() => setIsFilterExpanded(!isFilterExpanded)}
                    >
                        <Filter size={16} color={colors.textSecondary} />
                        <Text style={[styles.filterButtonText, { color: colors.textSecondary }]}>סינון</Text>
                        <ChevronDown
                            size={14}
                            color={colors.textSecondary}
                            style={{ transform: [{ rotate: isFilterExpanded ? '180deg' : '0deg' }] }}
                        />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.filterButton, { backgroundColor: colors.glass }]}
                        onPress={() => {
                            const nextSort = sortOption === 'date-newest' ? 'date-oldest' :
                                sortOption === 'date-oldest' ? 'amount-highest' :
                                    sortOption === 'amount-highest' ? 'amount-lowest' : 'date-newest';
                            setSortOption(nextSort);
                        }}
                    >
                        {sortOption.includes('newest') || sortOption.includes('highest') ? (
                            <ArrowDown size={16} color={colors.textSecondary} />
                        ) : (
                            <ArrowUp size={16} color={colors.textSecondary} />
                        )}
                        <Text style={[styles.filterButtonText, { color: colors.textSecondary }]}>
                            {sortOption === 'date-newest' ? 'חדש לישן' :
                                sortOption === 'date-oldest' ? 'ישן לחדש' :
                                    sortOption === 'amount-highest' ? 'גבוה לנמוך' : 'נמוך לגבוה'}
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Expandable Filters */}
                {isFilterExpanded && (
                    <View style={[styles.expandedFilters, { borderTopColor: colors.border }]}>
                        <Text style={[styles.filterLabel, { color: colors.textSecondary }]}>קטגוריות:</Text>
                        <View style={styles.catsRow}>
                            {categories.map(cat => {
                                const isSel = selectedCategories.includes(cat);
                                return (
                                    <TouchableOpacity
                                        key={cat}
                                        style={[
                                            styles.catChip,
                                            { backgroundColor: colors.surface, borderColor: colors.border },
                                            isSel && { borderColor: colors.primary, backgroundColor: `${colors.primary}15` }
                                        ]}
                                        onPress={() => {
                                            if (isSel) setSelectedCategories(prev => prev.filter(c => c !== cat));
                                            else setSelectedCategories(prev => [...prev, cat]);
                                        }}
                                    >
                                        <Text style={[
                                            styles.catChipText,
                                            { color: isSel ? colors.primary : colors.textSecondary }
                                        ]}>
                                            {cat}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    </View>
                )}
            </Animated.View>

            {/* List */}
            {processedData.grouped.length === 0 ? (
                <EmptyState
                    icon="receipt"
                    title="אין הוצאות עדיין"
                    message="לחץ על + בתפריט התחתון כדי להוסיף הוצאה"
                />
            ) : (
                <SectionList
                    sections={processedData.grouped}
                    keyExtractor={item => item.id}
                    renderItem={renderItem}
                    renderSectionHeader={({ section: { title } }) => (
                        <View style={[styles.sectionHeaderContainer, { backgroundColor: colors.background }]}>
                            <Text style={[styles.sectionHeader, { color: colors.textSecondary }]}>{title}</Text>
                        </View>
                    )}
                    contentContainerStyle={{ paddingBottom: 180, paddingHorizontal: 20 }}
                    stickySectionHeadersEnabled={true}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            tintColor={colors.primary}
                            colors={[colors.primary]}
                        />
                    }
                />
            )}

            {/* Footer Totals */}
            <View style={[styles.stickyFooter, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
                <View style={styles.footerContent}>
                    <View style={styles.footerRow}>
                        <Text style={[styles.footerLabel, { color: colors.textSecondary }]}>סה״כ הוצאות:</Text>
                        <Text style={[styles.footerAmount, { color: colors.danger }]}>
                            ₪{totalFilteredAmount.toLocaleString()}
                        </Text>
                    </View>
                    <Text style={[styles.footerCount, { color: colors.textTertiary }]}>
                        {processedData.raw.length} פריטים
                    </Text>
                </View>
            </View>

            {renderReceiptModal()}
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
        paddingHorizontal: 20,
        paddingBottom: 16,
    },
    backButton: {
        width: 44,
        height: 44,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
    exportButton: {
        width: 44,
        height: 44,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: 20,
        fontFamily: FONTS.bold,
    },
    filterSection: {
        paddingHorizontal: 20,
        paddingBottom: 16,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 16,
        paddingHorizontal: 16,
        height: 52,
        marginBottom: 12,
        borderWidth: 1,
        gap: 10,
    },
    searchInput: {
        flex: 1,
        fontSize: 15,
        fontFamily: FONTS.regular,
    },
    filterControls: {
        flexDirection: 'row',
        gap: 10,
    },
    filterButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 12,
        gap: 6,
    },
    filterButtonText: {
        fontSize: 13,
        fontFamily: FONTS.medium,
    },
    expandedFilters: {
        marginTop: 16,
        paddingTop: 16,
        borderTopWidth: 1,
    },
    filterLabel: {
        fontSize: 13,
        fontFamily: FONTS.medium,
        marginBottom: 10,
        textAlign: 'right',
    },
    catsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    catChip: {
        paddingVertical: 8,
        paddingHorizontal: 14,
        borderRadius: 20,
        borderWidth: 1,
    },
    catChipText: {
        fontSize: 13,
        fontFamily: FONTS.medium,
    },
    sectionHeaderContainer: {
        paddingVertical: 10,
        paddingHorizontal: 4,
    },
    sectionHeader: {
        fontSize: 14,
        fontFamily: FONTS.semiBold,
        textAlign: 'right',
    },
    itemContainer: {
        marginBottom: 12,
        borderRadius: 18,
        overflow: 'hidden',
        borderWidth: 1,
    },
    itemContent: {
        padding: 16,
    },
    itemRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    itemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        flex: 1,
    },
    itemIcon: {
        width: 44,
        height: 44,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
    itemInfo: {
        flex: 1,
    },
    itemCategory: {
        fontSize: 16,
        fontFamily: FONTS.semiBold,
        marginBottom: 4,
        textAlign: 'right',
    },
    itemMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    itemDate: {
        fontSize: 12,
        fontFamily: FONTS.regular,
    },
    itemSupplier: {
        fontSize: 12,
        fontFamily: FONTS.regular,
    },
    itemRight: {
        alignItems: 'flex-end',
        gap: 6,
    },
    itemAmount: {
        fontSize: 18,
        fontFamily: FONTS.bold,
    },
    receiptBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    itemActions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 10,
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderTopWidth: 1,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 10,
        gap: 6,
    },
    actionText: {
        fontSize: 13,
        fontFamily: FONTS.medium,
    },
    stickyFooter: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        paddingTop: 16,
        paddingBottom: Platform.OS === 'ios' ? 100 : 90,
        paddingHorizontal: 20,
        borderTopWidth: 1,
    },
    footerContent: {},
    footerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    footerLabel: {
        fontSize: 14,
        fontFamily: FONTS.medium,
    },
    footerAmount: {
        fontSize: 22,
        fontFamily: FONTS.bold,
    },
    footerCount: {
        fontSize: 12,
        fontFamily: FONTS.regular,
        textAlign: 'right',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalCloseArea: {
        ...StyleSheet.absoluteFillObject,
    },
    receiptModalContent: {
        width: width * 0.9,
        maxHeight: '80%',
        borderRadius: 24,
        overflow: 'hidden',
    },
    receiptModalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 18,
        borderBottomWidth: 1,
    },
    receiptModalTitle: {
        fontSize: 18,
        fontFamily: FONTS.bold,
    },
    modalCloseButton: {
        width: 36,
        height: 36,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    receiptImage: {
        width: '100%',
        height: 400,
    },
});
