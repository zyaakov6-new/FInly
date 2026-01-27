import React, { useState, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    SectionList,
    Platform,
    Alert,
    Modal,
    Image,
    RefreshControl,
    useColorScheme
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { ChevronRight, Search, X, ImageIcon, Download, ArrowUpRight } from 'lucide-react-native';
import { StatusBar } from 'expo-status-bar';
import { useTransactions } from '../context/TransactionsContext';
import { getColors, FONTS, SPACING, RADIUS, SHADOWS, TYPOGRAPHY, LAYOUT } from '../constants/theme';
import { exportToCSV } from '../utils/exportData';
import { hapticFeedback } from '../utils/haptics';
import { EmptyState } from '../components/EmptyState';

export default function ExpensesListScreen() {
    const insets = useSafeAreaInsets();
    const navigation = useNavigation();
    const colorScheme = useColorScheme();
    const colors = getColors(colorScheme);
    const { transactions } = useTransactions();

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedReceipt, setSelectedReceipt] = useState<string | null>(null);
    const [refreshing, setRefreshing] = useState(false);

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

        data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

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
    }, [transactions, searchQuery]);

    const totalFilteredAmount = processedData.raw.reduce((sum, item) => sum + parseAmount(item.amount), 0);

    const renderItem = ({ item }: { item: any }) => (
        <TouchableOpacity
            style={[styles.item, { backgroundColor: colors.surface }, SHADOWS.sm]}
            onPress={() => navigation.navigate('AddExpense' as never, { expense: item } as never)}
            activeOpacity={0.7}
        >
            <View style={[styles.itemIcon, { backgroundColor: colors.surfaceSecondary }]}>
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
                        <ImageIcon size={14} color={colors.textTertiary} />
                    </TouchableOpacity>
                )}
            </View>
        </TouchableOpacity>
    );

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
                <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>הוצאות</Text>
                <TouchableOpacity
                    onPress={handleExport}
                    style={[styles.headerButton, { backgroundColor: colors.surfaceSecondary }]}
                >
                    <Download size={20} color={colors.primary} />
                </TouchableOpacity>
            </View>

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
                <Text style={[styles.footerCount, { color: colors.textTertiary }]}>
                    {processedData.raw.length} פריטים
                </Text>
            </View>

            {/* Receipt Modal */}
            <Modal
                visible={selectedReceipt !== null}
                transparent
                animationType="fade"
                onRequestClose={() => setSelectedReceipt(null)}
            >
                <View style={[styles.modalOverlay, { backgroundColor: colors.overlay }]}>
                    <TouchableOpacity
                        style={StyleSheet.absoluteFill}
                        activeOpacity={1}
                        onPress={() => setSelectedReceipt(null)}
                    />
                    <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
                        <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
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
    searchSection: {
        paddingHorizontal: LAYOUT.screenPadding,
        paddingBottom: SPACING.lg,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: RADIUS.md,
        paddingHorizontal: SPACING.lg,
        height: 48,
        gap: SPACING.sm,
    },
    searchInput: {
        flex: 1,
        ...TYPOGRAPHY.body,
    },
    listContent: {
        paddingHorizontal: LAYOUT.screenPadding,
        paddingBottom: 180,
    },
    sectionHeader: {
        paddingVertical: SPACING.sm,
    },
    sectionTitle: {
        ...TYPOGRAPHY.caption,
        fontFamily: FONTS.medium,
    },
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: SPACING.lg,
        borderRadius: RADIUS.lg,
        marginBottom: SPACING.sm,
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
        ...TYPOGRAPHY.body,
        fontFamily: FONTS.medium,
        marginBottom: 2,
    },
    itemSubtitle: {
        ...TYPOGRAPHY.caption,
    },
    itemRight: {
        alignItems: 'flex-end',
        gap: SPACING.xs,
    },
    itemAmount: {
        ...TYPOGRAPHY.label,
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        paddingTop: SPACING.lg,
        paddingBottom: Platform.OS === 'ios' ? 100 : 90,
        paddingHorizontal: LAYOUT.screenPadding,
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
        ...TYPOGRAPHY.body,
    },
    footerAmount: {
        ...TYPOGRAPHY.h2,
    },
    footerCount: {
        ...TYPOGRAPHY.caption,
        textAlign: 'right',
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: LAYOUT.screenPadding,
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
        borderBottomWidth: 1,
    },
    modalTitle: {
        ...TYPOGRAPHY.h4,
    },
    receiptImage: {
        width: '100%',
        height: 400,
    },
});
