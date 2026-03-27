import React, { useState, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    SectionList,
    ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import {
    ChevronRight,
    Search,
    Check,
    Clock,
    AlertTriangle,
    FileText,
} from 'lucide-react-native';
import { StatusBar } from 'expo-status-bar';
import { useTransactions, Transaction } from '../context/TransactionsContext';
import { useTheme } from '../context/ThemeContext';
import { getColors, FONTS, SPACING, RADIUS, SHADOWS, TYPOGRAPHY, LAYOUT } from '../constants/theme';

type StatusTab = 'all' | 'pending' | 'paid' | 'overdue';

export default function InvoicesListScreen() {
    const insets = useSafeAreaInsets();
    const navigation = useNavigation<any>();
    const { resolvedTheme, isDark } = useTheme();
    const colors = getColors(resolvedTheme);
    const { transactions } = useTransactions();

    // State
    const [selectedTab, setSelectedTab] = useState<StatusTab>('all');
    const [searchQuery, setSearchQuery] = useState('');

    const route = useRoute<any>();

    // Handle incoming filter params
    React.useEffect(() => {
        if (route.params?.filter) {
            setSelectedTab(route.params.filter as StatusTab);
        }
    }, [route.params]);

    // --- Helpers ---
    const isOverdue = (date: Date) => {
        const today = new Date();
        const diffTime = today.getTime() - new Date(date).getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays > 30;
    };

    // --- Filtering Logic ---
    const processedData = useMemo(() => {
        let data = transactions.filter(t => t.type === 'invoice');

        if (selectedTab === 'pending') {
            data = data.filter(t => t.status === 'pending');
        } else if (selectedTab === 'paid') {
            data = data.filter(t => t.status === 'paid');
        } else if (selectedTab === 'overdue') {
            data = data.filter(t => t.status === 'pending' && isOverdue(t.date));
        }

        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            data = data.filter(t =>
                t.title.toLowerCase().includes(query) ||
                (t.clientName && t.clientName.toLowerCase().includes(query)) ||
                (t.category && t.category.toLowerCase().includes(query))
            );
        }

        data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        const grouped: { title: string, data: typeof data }[] = [];
        data.forEach(item => {
            const dateLabel = new Date(item.date).toLocaleDateString('he-IL', { month: 'long', year: 'numeric' });
            let group = grouped.find(g => g.title === dateLabel);
            if (!group) {
                group = { title: dateLabel, data: [] };
                grouped.push(group);
            }
            group.data.push(item);
        });

        return grouped;
    }, [transactions, selectedTab, searchQuery]);

    const renderItem = ({ item }: { item: Transaction }) => {
        const _isOverdue = item.status === 'pending' && isOverdue(item.date);

        return (
            <TouchableOpacity
                style={[styles.card, { backgroundColor: colors.surface }, SHADOWS.sm]}
                onPress={() => navigation.navigate('InvoiceDetails', { transactionId: item.id })}
            >
                <View style={styles.cardRow}>
                    <View style={{ gap: 4 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                            <FileText size={16} color={colors.textPrimary} />
                            <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>{item.title}</Text>
                        </View>
                        <Text style={[styles.cardClient, { color: colors.textSecondary }]}>
                            לקוח: {item.clientName || 'ללא לקוח'}
                        </Text>
                    </View>
                    <View style={{ alignItems: 'flex-end', gap: 4 }}>
                        <Text style={[styles.cardAmount, { color: colors.primary }]}>{item.amount}</Text>
                        <Text style={[styles.cardDate, { color: colors.textTertiary }]}>
                            {new Date(item.date).toLocaleDateString('he-IL', { day: 'numeric', month: 'short' })}
                        </Text>
                    </View>
                </View>

                <View style={styles.cardFooter}>
                    {item.status === 'paid' ? (
                        <View style={[styles.badge, { backgroundColor: colors.successMuted }]}>
                            <Check size={12} color={colors.success} />
                            <Text style={[styles.badgeText, { color: colors.success }]}>שולם</Text>
                        </View>
                    ) : _isOverdue ? (
                        <View style={[styles.badge, { backgroundColor: colors.dangerMuted }]}>
                            <AlertTriangle size={12} color={colors.danger} />
                            <Text style={[styles.badgeText, { color: colors.danger }]}>באיחור</Text>
                        </View>
                    ) : (
                        <View style={[styles.badge, { backgroundColor: colors.warningMuted }]}>
                            <Clock size={12} color={colors.warning} />
                            <Text style={[styles.badgeText, { color: colors.warning }]}>בתהליך</Text>
                        </View>
                    )}
                </View>
            </TouchableOpacity>
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
                    פרויקטים / חשבוניות
                </Text>
                <View style={{ width: 44 }} />
            </View>

            {/* Status Tabs */}
            <View style={[styles.tabsContainer, { borderBottomColor: colors.border }]}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsScroll}>
                    {(['all', 'pending', 'paid', 'overdue'] as StatusTab[]).map(tab => {
                        const isActive = selectedTab === tab;
                        const label = tab === 'all' ? 'הכל' : tab === 'pending' ? 'בתהליך' : tab === 'paid' ? 'שולם' : 'באיחור';
                        const count = transactions.filter(t =>
                            t.type === 'invoice' &&
                            (tab === 'all' ? true :
                                tab === 'overdue' ? (t.status === 'pending' && isOverdue(t.date)) :
                                    t.status === tab)
                        ).length;

                        return (
                            <TouchableOpacity
                                key={tab}
                                style={[
                                    styles.tab,
                                    { backgroundColor: colors.surface, borderColor: colors.border },
                                    isActive && { backgroundColor: colors.primary, borderColor: colors.primary }
                                ]}
                                onPress={() => setSelectedTab(tab)}
                            >
                                <Text style={[
                                    styles.tabText,
                                    { color: colors.textSecondary },
                                    isActive && { color: '#FFFFFF' }
                                ]}>
                                    {label} ({count})
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>
            </View>

            {/* Search Bar */}
            <View style={styles.filterBar}>
                <View style={[styles.searchContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <Search size={18} color={colors.textTertiary} />
                    <TextInput
                        style={[styles.searchInput, { color: colors.textPrimary }]}
                        placeholder="חפש פרויקט או לקוח..."
                        placeholderTextColor={colors.textQuaternary}
                        textAlign="right"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>
            </View>

            {/* List */}
            <SectionList
                sections={processedData}
                keyExtractor={item => item.id}
                renderItem={renderItem}
                renderSectionHeader={({ section: { title } }) => (
                    <Text style={[styles.sectionHeader, { backgroundColor: colors.background, color: colors.textSecondary }]}>
                        {title}
                    </Text>
                )}
                contentContainerStyle={{ paddingBottom: 100 }}
                stickySectionHeadersEnabled={true}
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <View style={[styles.emptyIcon, { backgroundColor: colors.surfaceSecondary }]}>
                            <FileText size={32} color={colors.textTertiary} />
                        </View>
                        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>לא נמצאו חשבוניות</Text>
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
    tabsContainer: {
        paddingBottom: SPACING.md,
        borderBottomWidth: 1,
    },
    tabsScroll: {
        paddingHorizontal: LAYOUT.screenPadding,
        gap: SPACING.sm,
    },
    tab: {
        paddingVertical: SPACING.sm,
        paddingHorizontal: SPACING.lg,
        borderRadius: RADIUS.full,
        borderWidth: 1,
    },
    tabText: {
        ...TYPOGRAPHY.caption,
        fontFamily: FONTS.medium,
    },
    filterBar: {
        padding: SPACING.lg,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: RADIUS.md,
        paddingHorizontal: SPACING.md,
        height: 48,
        gap: SPACING.sm,
        borderWidth: 1,
    },
    searchInput: {
        flex: 1,
        ...TYPOGRAPHY.body,
        textAlign: 'right',
    },
    sectionHeader: {
        paddingHorizontal: LAYOUT.screenPadding,
        paddingVertical: SPACING.sm,
        ...TYPOGRAPHY.caption,
        fontFamily: FONTS.medium,
    },
    card: {
        marginHorizontal: LAYOUT.screenPadding,
        marginBottom: SPACING.md,
        borderRadius: RADIUS.xl,
        padding: SPACING.lg,
    },
    cardRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: SPACING.md,
    },
    cardTitle: {
        ...TYPOGRAPHY.body,
        fontFamily: FONTS.medium,
    },
    cardClient: {
        ...TYPOGRAPHY.caption,
    },
    cardAmount: {
        ...TYPOGRAPHY.label,
    },
    cardDate: {
        ...TYPOGRAPHY.captionSmall,
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
    },
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: SPACING.sm,
        paddingVertical: SPACING.xs,
        borderRadius: RADIUS.sm,
        gap: 4,
    },
    badgeText: {
        ...TYPOGRAPHY.captionSmall,
        fontFamily: FONTS.medium,
    },
    emptyState: {
        padding: SPACING['4xl'],
        alignItems: 'center',
    },
    emptyIcon: {
        width: 80,
        height: 80,
        borderRadius: RADIUS.xl,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: SPACING.lg,
    },
    emptyText: {
        ...TYPOGRAPHY.body,
    },
});
