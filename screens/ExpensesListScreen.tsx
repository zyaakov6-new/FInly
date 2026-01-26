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
import { ChevronLeft, Search, X, Trash2, ImageIcon, Edit2, Download, ArrowUpRight } from 'lucide-react-native';
import { StatusBar } from 'expo-status-bar';
import { useTransactions } from '../context/TransactionsContext';
import { getColors, FONTS, SPACING, RADIUS, SHADOWS, TYPOGRAPHY } from '../constants/theme';
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

    const fadeAnim = useRef(new Animated.Value(0)).current;

    const [searchQuery, setSearchQuery] = useState('');
    const [sortOption, setSortOption] = useState<SortOption>('date-newest');
    const [selectedReceipt, setSelectedReceipt] = useState<string | null>(null);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
        }).start();
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
                Alert.alert('אין נתונים', 'אין הוצאות לייצוא');
                return;
            }
            await exportToCSV(expensesOnly, 'finly_expenses.csv');
            Alert.alert('הצלחה', `יוצאו ${expensesOnly.length} הוצאות`);
        } catch (error) {
            Alert.alert('שגיאה', 'שגיאה בייצוא הנתונים');
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await new Promise(resolve => setTimeout(resolve, 800));
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
    }, [transactions, searchQuery, sortOption]);

    const totalFilteredAmount = processedData.raw.reduce((sum, item) => sum + parseAmount(item.amount), 0);

    const renderItem = ({ item, index }: { item: any, index: number }) => (
        <TouchableOpacity
            style={[styles.item, { backgroundColor: colors.surface }]}
            onPress={() => navigation.navigate('AddExpense' as never, { expense: item } as never)}
            activeOpacity={0.7}
        >
            <View style={[styles.itemIcon, { backgroundColor: colors.fill }]}>
                <ArrowUpRight size={18} color={colors.textTertiary} />
            </View>
            <View style={styles.itemContent}>
                <Text style={[styles.itemTitle, { color: colors.textPrimary }]} numberOfLines={1}>
                    {item.category || 'כללי'}
                </Text>
                <Text style={[styles.itemSubtitle, { color: colors.textTertiary }]} numberOfLines={1}>
                    {item.supplier || item.notes || 'ללא תיאור'}
                </Text>
            </View>
            <View style={styles.itemRight}>
                <Text style={[styles.itemAmount, { color: colors.danger }]}>
                    -₪{parseAmount(item.amount).toLocaleString()}
                </Text>
                {item.receiptImageUri && (
                    <TouchableOpacity
                        onPress={() => setSelectedReceipt(item.receiptImageUri)}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                        <ImageIcon size={16} color={colors.textTertiary} />
                    </TouchableOpacity>
                )}
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />

            {/* Header */}
            <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={[styles.backButton, { backgroundColor: colors.fill }]}
                >
                    <ChevronLeft color={colors.textPrimary} size={24} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>הוצאות</Text>
                <TouchableOpacity
                    onPress={handleExport}
                    style={[styles.backButton, { backgroundColor: colors.fill }]}
                >
                    <Download color={colors.primary} size={20} />
                </TouchableOpacity>
            </View>

            <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
                {/* Search */}
                <View style={styles.searchSection}>
                    <View style={[styles.searchBar, { backgroundColor: colors.surface }, SHADOWS.sm]}>
                        <Search color={colors.textTertiary} size={20} />
                        <TextInput
                            style={[styles.searchInput, { color: colors.textPrimary }]}
                            placeholder="חיפוש..."
                            placeholderTextColor={colors.textQuaternary}
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
                </View>

                {/* List */}
                {processedData.grouped.length === 0 ? (
                    <EmptyState
                        icon="receipt"
                        title="אין הוצאות"
                        message="לחץ על + להוספת הוצאה חדשה"
                    />
                ) : (
                    <SectionList
                        sections={processedData.grouped}
                        keyExtractor={item => item.id}
                        renderItem={renderItem}
                        renderSectionHeader={({ section: { title } }) => (
                            <View style={[styles.sectionHeader, { backgroundColor: colors.background }]}>
                                <Text style={[styles.sectionTitle, { color: colors.textTertiary }]}>{title}</Text>
                            </View>
                        )}
                        contentContainerStyle={styles.listContent}
                        stickySectionHeadersEnabled
                        showsVerticalScrollIndicator={false}
                        refreshControl={
                            <RefreshControl
                                refreshing={refreshing}
                                onRefresh={onRefresh}
                                tintColor={colors.primary}
                            />
                        }
                    />
                )}

                {/* Footer */}
                <View style={[styles.footer, { backgroundColor: colors.surface }, SHADOWS.lg]}>
                    <View style={styles.footerContent}>
                        <Text style={[styles.footerLabel, { color: colors.textTertiary }]}>סה״כ</Text>
                        <Text style={[styles.footerAmount, { color: colors.textPrimary }]}>
                            ₪{totalFilteredAmount.toLocaleString()}
                        </Text>
                    </View>
                    <Text style={[styles.footerCount, { color: colors.textQuaternary }]}>
                        {processedData.raw.length} פריטים
                    </Text>
                </View>
            </Animated.View>

            {/* Receipt Modal */}
            <Modal
                visible={selectedReceipt !== null}
                transparent
                animationType="fade"
                onRequestClose={() => setSelectedReceipt(null)}
            >
                <View style={styles.modalOverlay}>
                    <TouchableOpacity
                        style={StyleSheet.absoluteFill}
                        activeOpacity={1}
                        onPress={() => setSelectedReceipt(null)}
                    />
                    <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
                        <View style={[styles.modalHeader, { borderBottomColor: colors.separator }]}>
                            <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>קבלה</Text>
                            <TouchableOpacity onPress={() => setSelectedReceipt(null)}>
                                <X color={colors.textPrimary} size={24} />
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
        paddingHorizontal: SPACING.xl,
        paddingBottom: SPACING.lg,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: RADIUS.full,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        ...TYPOGRAPHY.headline,
    },
    searchSection: {
        paddingHorizontal: SPACING.xl,
        paddingBottom: SPACING.lg,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: RADIUS.md,
        paddingHorizontal: SPACING.lg,
        height: 44,
        gap: SPACING.sm,
    },
    searchInput: {
        flex: 1,
        ...TYPOGRAPHY.body,
    },
    listContent: {
        paddingHorizontal: SPACING.xl,
        paddingBottom: 160,
    },
    sectionHeader: {
        paddingVertical: SPACING.sm,
    },
    sectionTitle: {
        ...TYPOGRAPHY.footnote,
        fontFamily: FONTS.medium,
        textTransform: 'uppercase',
    },
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: SPACING.lg,
        borderRadius: RADIUS.lg,
        marginBottom: SPACING.sm,
        ...SHADOWS.sm,
    },
    itemIcon: {
        width: 40,
        height: 40,
        borderRadius: RADIUS.sm,
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: SPACING.md,
    },
    itemContent: {
        flex: 1,
    },
    itemTitle: {
        ...TYPOGRAPHY.subhead,
        fontFamily: FONTS.medium,
        marginBottom: 2,
    },
    itemSubtitle: {
        ...TYPOGRAPHY.caption1,
    },
    itemRight: {
        alignItems: 'flex-end',
        gap: SPACING.xs,
    },
    itemAmount: {
        ...TYPOGRAPHY.headline,
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        paddingTop: SPACING.lg,
        paddingBottom: Platform.OS === 'ios' ? 100 : 90,
        paddingHorizontal: SPACING.xl,
        borderTopLeftRadius: RADIUS.xl,
        borderTopRightRadius: RADIUS.xl,
    },
    footerContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.xs,
    },
    footerLabel: {
        ...TYPOGRAPHY.subhead,
    },
    footerAmount: {
        ...TYPOGRAPHY.title2,
    },
    footerCount: {
        ...TYPOGRAPHY.caption1,
        textAlign: 'right',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: SPACING.xl,
    },
    modalContent: {
        width: '100%',
        maxHeight: '80%',
        borderRadius: RADIUS.xl,
        overflow: 'hidden',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: SPACING.lg,
        borderBottomWidth: StyleSheet.hairlineWidth,
    },
    modalTitle: {
        ...TYPOGRAPHY.headline,
    },
    receiptImage: {
        width: '100%',
        height: 400,
    },
});
