import React, { useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    useColorScheme,
    RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
    TrendingUp,
    TrendingDown,
    ArrowUpRight,
    ArrowDownLeft,
    Receipt,
    PieChart,
    Settings,
    ChevronLeft,
    Target,
} from 'lucide-react-native';
import { useTransactions } from '../context/TransactionsContext';
import { useUserProfile } from '../context/UserProfileContext';
import { getColors, FONTS, SPACING, RADIUS, SHADOWS, TYPOGRAPHY, LAYOUT } from '../constants/theme';

export default function DashboardScreen() {
    const navigation = useNavigation<any>();
    const insets = useSafeAreaInsets();
    const colorScheme = useColorScheme();
    const colors = getColors(colorScheme);

    const { userProfile: userProfileData } = useUserProfile();
    const {
        totalRevenue,
        totalExpenses,
        netProfit,
        transactions,
        getMonthlyExpenseProgress
    } = useTransactions();

    const [refreshing, setRefreshing] = React.useState(false);

    const expenseProgress = useMemo(() => getMonthlyExpenseProgress(), [getMonthlyExpenseProgress]);

    // Get time-based greeting
    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'בוקר טוב';
        if (hour < 18) return 'צהריים טובים';
        return 'ערב טוב';
    };

    // Recent transactions
    const recentTransactions = useMemo(() => {
        return transactions
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .slice(0, 5);
    }, [transactions]);

    const parseAmount = (str?: string) => {
        if (!str) return 0;
        return parseFloat(str.replace(/[^0-9.-]+/g, '')) || 0;
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await new Promise(resolve => setTimeout(resolve, 800));
        setRefreshing(false);
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />

            {/* Header */}
            <View style={[styles.header, { paddingTop: insets.top + SPACING.md }]}>
                <View style={styles.headerLeft}>
                    <Text style={[styles.greeting, { color: colors.textTertiary }]}>
                        {getGreeting()}
                    </Text>
                    <Text style={[styles.userName, { color: colors.textPrimary }]}>
                        {userProfileData?.fullName || 'משתמש'}
                    </Text>
                </View>
                <TouchableOpacity
                    style={[styles.settingsButton, { backgroundColor: colors.surfaceSecondary }]}
                    onPress={() => navigation.navigate('Settings')}
                >
                    <Settings size={20} color={colors.textSecondary} />
                </TouchableOpacity>
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor={colors.primary}
                    />
                }
            >
                {/* Balance Card */}
                <View style={[styles.balanceCard, { backgroundColor: colors.surface }, SHADOWS.md]}>
                    <Text style={[styles.balanceLabel, { color: colors.textTertiary }]}>
                        יתרה נוכחית
                    </Text>
                    <Text style={[styles.balanceAmount, { color: colors.textPrimary }]}>
                        ₪{netProfit.toLocaleString()}
                    </Text>

                    <View style={styles.balanceStats}>
                        <View style={styles.balanceStat}>
                            <View style={[styles.statIcon, { backgroundColor: colors.successMuted }]}>
                                <ArrowDownLeft size={16} color={colors.success} />
                            </View>
                            <View>
                                <Text style={[styles.statLabel, { color: colors.textTertiary }]}>
                                    הכנסות
                                </Text>
                                <Text style={[styles.statValue, { color: colors.textPrimary }]}>
                                    ₪{totalRevenue.toLocaleString()}
                                </Text>
                            </View>
                        </View>

                        <View style={[styles.statDivider, { backgroundColor: colors.border }]} />

                        <View style={styles.balanceStat}>
                            <View style={[styles.statIcon, { backgroundColor: colors.dangerMuted }]}>
                                <ArrowUpRight size={16} color={colors.danger} />
                            </View>
                            <View>
                                <Text style={[styles.statLabel, { color: colors.textTertiary }]}>
                                    הוצאות
                                </Text>
                                <Text style={[styles.statValue, { color: colors.textPrimary }]}>
                                    ₪{totalExpenses.toLocaleString()}
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Quick Actions */}
                <View style={styles.quickActions}>
                    <TouchableOpacity
                        style={[styles.quickAction, { backgroundColor: colors.surface }, SHADOWS.sm]}
                        onPress={() => navigation.navigate('CreateInvoice')}
                    >
                        <View style={[styles.quickActionIcon, { backgroundColor: colors.primaryMuted }]}>
                            <ArrowDownLeft size={20} color={colors.primary} />
                        </View>
                        <Text style={[styles.quickActionText, { color: colors.textPrimary }]}>
                            הכנסה
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.quickAction, { backgroundColor: colors.surface }, SHADOWS.sm]}
                        onPress={() => navigation.navigate('AddExpense')}
                    >
                        <View style={[styles.quickActionIcon, { backgroundColor: colors.dangerMuted }]}>
                            <ArrowUpRight size={20} color={colors.danger} />
                        </View>
                        <Text style={[styles.quickActionText, { color: colors.textPrimary }]}>
                            הוצאה
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.quickAction, { backgroundColor: colors.surface }, SHADOWS.sm]}
                        onPress={() => navigation.navigate('PnL')}
                    >
                        <View style={[styles.quickActionIcon, { backgroundColor: colors.surfaceSecondary }]}>
                            <PieChart size={20} color={colors.textSecondary} />
                        </View>
                        <Text style={[styles.quickActionText, { color: colors.textPrimary }]}>
                            דוחות
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.quickAction, { backgroundColor: colors.surface }, SHADOWS.sm]}
                        onPress={() => navigation.navigate('Goals')}
                    >
                        <View style={[styles.quickActionIcon, { backgroundColor: colors.primaryMuted }]}>
                            <Target size={20} color={colors.primary} />
                        </View>
                        <Text style={[styles.quickActionText, { color: colors.textPrimary }]}>
                            יעדים
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Budget Progress */}
                <View style={[styles.section, { backgroundColor: colors.surface }, SHADOWS.sm]}>
                    <View style={styles.sectionHeader}>
                        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
                            תקציב חודשי
                        </Text>
                        <Text style={[styles.sectionSubtitle, { color: colors.textTertiary }]}>
                            {new Date().toLocaleDateString('he-IL', { month: 'long' })}
                        </Text>
                    </View>

                    <View style={styles.budgetRow}>
                        <Text style={[styles.budgetSpent, { color: colors.textPrimary }]}>
                            ₪{expenseProgress.current.toLocaleString()}
                        </Text>
                        <Text style={[styles.budgetTotal, { color: colors.textTertiary }]}>
                            מתוך ₪{expenseProgress.limit.toLocaleString()}
                        </Text>
                    </View>

                    <View style={[styles.progressBar, { backgroundColor: colors.surfaceSecondary }]}>
                        <View
                            style={[
                                styles.progressFill,
                                {
                                    width: `${Math.min(expenseProgress.percentage, 100)}%`,
                                    backgroundColor: expenseProgress.percentage > 80 ? colors.warning : colors.primary
                                }
                            ]}
                        />
                    </View>

                    <Text style={[styles.budgetRemaining, { color: colors.textTertiary }]}>
                        {expenseProgress.percentage < 100
                            ? `נותרו ₪${(expenseProgress.limit - expenseProgress.current).toLocaleString()}`
                            : 'חריגה מהתקציב'}
                    </Text>
                </View>

                {/* Recent Activity */}
                <View style={[styles.section, { backgroundColor: colors.surface }, SHADOWS.sm]}>
                    <View style={styles.sectionHeader}>
                        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
                            פעילות אחרונה
                        </Text>
                        <TouchableOpacity onPress={() => navigation.navigate('AllActivity')}>
                            <Text style={[styles.seeAllText, { color: colors.primary }]}>
                                הכל
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {recentTransactions.length === 0 ? (
                        <View style={styles.emptyState}>
                            <Receipt size={32} color={colors.textQuaternary} />
                            <Text style={[styles.emptyText, { color: colors.textTertiary }]}>
                                אין פעילות עדיין
                            </Text>
                        </View>
                    ) : (
                        recentTransactions.map((tx, index) => (
                            <TouchableOpacity
                                key={tx.id}
                                style={[
                                    styles.transaction,
                                    index < recentTransactions.length - 1 && {
                                        borderBottomWidth: 1,
                                        borderBottomColor: colors.border
                                    }
                                ]}
                                onPress={() => {
                                    if (tx.isIncome) {
                                        navigation.navigate('InvoiceDetails', { transactionId: tx.id });
                                    } else {
                                        navigation.navigate('AddExpense', { transactionId: tx.id });
                                    }
                                }}
                            >
                                <View style={[
                                    styles.txIcon,
                                    { backgroundColor: tx.isIncome ? colors.successMuted : colors.surfaceSecondary }
                                ]}>
                                    {tx.isIncome ? (
                                        <ArrowDownLeft size={16} color={colors.success} />
                                    ) : (
                                        <ArrowUpRight size={16} color={colors.textTertiary} />
                                    )}
                                </View>
                                <View style={styles.txInfo}>
                                    <Text style={[styles.txTitle, { color: colors.textPrimary }]} numberOfLines={1}>
                                        {tx.title || tx.category || 'ללא כותרת'}
                                    </Text>
                                    <Text style={[styles.txDate, { color: colors.textTertiary }]}>
                                        {new Date(tx.date).toLocaleDateString('he-IL', {
                                            day: 'numeric',
                                            month: 'short'
                                        })}
                                    </Text>
                                </View>
                                <Text style={[
                                    styles.txAmount,
                                    { color: tx.isIncome ? colors.success : colors.textPrimary }
                                ]}>
                                    {tx.isIncome ? '+' : '-'}₪{parseAmount(tx.amount).toLocaleString()}
                                </Text>
                            </TouchableOpacity>
                        ))
                    )}
                </View>

                <View style={{ height: 120 }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: LAYOUT.screenPadding,
        paddingBottom: SPACING.lg,
    },
    headerLeft: {
        alignItems: 'flex-start',
    },
    greeting: {
        ...TYPOGRAPHY.bodySmall,
        marginBottom: 2,
    },
    userName: {
        ...TYPOGRAPHY.h3,
    },
    settingsButton: {
        width: 44,
        height: 44,
        borderRadius: RADIUS.md,
        alignItems: 'center',
        justifyContent: 'center',
    },
    scrollContent: {
        paddingHorizontal: LAYOUT.screenPadding,
    },
    balanceCard: {
        borderRadius: RADIUS.xl,
        padding: SPACING['2xl'],
        marginBottom: SPACING.xl,
    },
    balanceLabel: {
        ...TYPOGRAPHY.bodySmall,
        marginBottom: SPACING.xs,
    },
    balanceAmount: {
        ...TYPOGRAPHY.display,
        marginBottom: SPACING['2xl'],
    },
    balanceStats: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    balanceStat: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.md,
    },
    statIcon: {
        width: 36,
        height: 36,
        borderRadius: RADIUS.sm,
        alignItems: 'center',
        justifyContent: 'center',
    },
    statLabel: {
        ...TYPOGRAPHY.caption,
        marginBottom: 2,
    },
    statValue: {
        ...TYPOGRAPHY.label,
    },
    statDivider: {
        width: 1,
        height: 36,
        marginHorizontal: SPACING.lg,
    },
    quickActions: {
        flexDirection: 'row',
        gap: SPACING.md,
        marginBottom: SPACING.xl,
    },
    quickAction: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: SPACING.lg,
        borderRadius: RADIUS.lg,
    },
    quickActionIcon: {
        width: 44,
        height: 44,
        borderRadius: RADIUS.md,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: SPACING.sm,
    },
    quickActionText: {
        ...TYPOGRAPHY.caption,
        fontFamily: FONTS.medium,
    },
    section: {
        borderRadius: RADIUS.xl,
        padding: SPACING.lg,
        marginBottom: SPACING.lg,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.lg,
    },
    sectionTitle: {
        ...TYPOGRAPHY.h4,
    },
    sectionSubtitle: {
        ...TYPOGRAPHY.caption,
    },
    seeAllText: {
        ...TYPOGRAPHY.label,
    },
    budgetRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
        gap: SPACING.sm,
        marginBottom: SPACING.md,
    },
    budgetSpent: {
        ...TYPOGRAPHY.h3,
    },
    budgetTotal: {
        ...TYPOGRAPHY.bodySmall,
    },
    progressBar: {
        height: 8,
        borderRadius: 4,
        marginBottom: SPACING.sm,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        borderRadius: 4,
    },
    budgetRemaining: {
        ...TYPOGRAPHY.caption,
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: SPACING['3xl'],
    },
    emptyText: {
        ...TYPOGRAPHY.body,
        marginTop: SPACING.md,
    },
    transaction: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: SPACING.md,
    },
    txIcon: {
        width: 40,
        height: 40,
        borderRadius: RADIUS.sm,
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: SPACING.md,
    },
    txInfo: {
        flex: 1,
        marginLeft: SPACING.md,
    },
    txTitle: {
        ...TYPOGRAPHY.body,
        fontFamily: FONTS.medium,
        marginBottom: 2,
    },
    txDate: {
        ...TYPOGRAPHY.caption,
    },
    txAmount: {
        ...TYPOGRAPHY.label,
    },
});
