import React, { useRef, useEffect, useMemo } from 'react';
import {
    StyleSheet,
    Text,
    View,
    ScrollView,
    TouchableOpacity,
    Animated,
    Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import {
    TrendingUp,
    TrendingDown,
    ArrowUpRight,
    ChevronLeft,
    Plus,
    FileText,
    Wallet,
    PieChart,
    Users,
    Receipt,
    Clock,
} from 'lucide-react-native';
import { useTransactions } from '../context/TransactionsContext';
import { useTheme } from '../context/ThemeContext';
import { getColors, FONTS, SPACING, RADIUS, SHADOWS, TYPOGRAPHY, LAYOUT } from '../constants/theme';

const { width } = Dimensions.get('window');

export default function DashboardScreen() {
    const navigation = useNavigation<any>();
    const insets = useSafeAreaInsets();
    const { resolvedTheme, isDark } = useTheme();
    const colors = getColors(resolvedTheme);

    const {
        transactions,
        totalRevenue,
        totalExpenses,
        netProfit,
        getMonthlyExpenseProgress,
    } = useTransactions();

    const expenseProgress = useMemo(() => getMonthlyExpenseProgress(), [getMonthlyExpenseProgress]);

    // Animations
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(20)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 500,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 500,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    const now = new Date();
    const isPositive = netProfit >= 0;

    const pendingInvoices = transactions.filter(t => t.type === 'invoice' && t.status === 'pending');

    // Greeting based on time
    const getGreeting = () => {
        const hour = now.getHours();
        if (hour < 12) return 'בוקר טוב';
        if (hour < 17) return 'צהריים טובים';
        if (hour < 21) return 'ערב טוב';
        return 'לילה טוב';
    };

    const QuickAction = ({ icon: Icon, label, color, onPress }: any) => (
        <TouchableOpacity
            style={[styles.quickAction, { backgroundColor: colors.surface }, SHADOWS.sm]}
            onPress={onPress}
            activeOpacity={0.7}
        >
            <View style={[styles.quickActionIcon, { backgroundColor: `${color}15` }]}>
                <Icon size={20} color={color} />
            </View>
            <Text style={[styles.quickActionLabel, { color: colors.textPrimary }]}>{label}</Text>
        </TouchableOpacity>
    );

    const StatCard = ({ title, value, trend, color, onPress }: any) => (
        <TouchableOpacity
            style={[styles.statCard, { backgroundColor: colors.surface }, SHADOWS.sm]}
            onPress={onPress}
            activeOpacity={0.7}
        >
            <View style={styles.statHeader}>
                <Text style={[styles.statTitle, { color: colors.textSecondary }]}>{title}</Text>
                <ChevronLeft size={16} color={colors.textTertiary} />
            </View>
            <Text style={[styles.statValue, { color: color || colors.textPrimary }]}>
                ₪{value.toLocaleString()}
            </Text>
            {trend !== undefined && (
                <View style={styles.trendRow}>
                    {trend >= 0 ? (
                        <TrendingUp size={14} color={colors.success} />
                    ) : (
                        <TrendingDown size={14} color={colors.danger} />
                    )}
                    <Text style={[
                        styles.trendText,
                        { color: trend >= 0 ? colors.success : colors.danger }
                    ]}>
                        {Math.abs(trend)}% מהחודש שעבר
                    </Text>
                </View>
            )}
        </TouchableOpacity>
    );

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <StatusBar style={isDark ? 'light' : 'dark'} />

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={[
                    styles.scrollContent,
                    { paddingTop: insets.top + SPACING.md }
                ]}
            >
                <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
                    {/* Header */}
                    <View style={styles.header}>
                        <View>
                            <Text style={[styles.greeting, { color: colors.textSecondary }]}>
                                {getGreeting()}
                            </Text>
                            <Text style={[styles.monthLabel, { color: colors.textPrimary }]}>
                                {now.toLocaleDateString('he-IL', { month: 'long', year: 'numeric' })}
                            </Text>
                        </View>
                        <TouchableOpacity
                            style={[styles.addButton, { backgroundColor: colors.primary }]}
                            onPress={() => navigation.navigate('CreateInvoice')}
                        >
                            <Plus size={22} color="#FFFFFF" />
                        </TouchableOpacity>
                    </View>

                    {/* Main Balance Card */}
                    <TouchableOpacity
                        activeOpacity={0.9}
                        onPress={() => navigation.navigate('PnL')}
                    >
                        <LinearGradient
                            colors={isDark ? ['#27272A', '#18181B'] : ['#6366F1', '#4F46E5']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={[styles.balanceCard, SHADOWS.lg]}
                        >
                            <View style={styles.balanceHeader}>
                                <Text style={[styles.balanceLabel, { color: isDark ? colors.textSecondary : 'rgba(255,255,255,0.8)' }]}>
                                    יתרה חודשית
                                </Text>
                                <ArrowUpRight size={20} color={isDark ? colors.textSecondary : 'rgba(255,255,255,0.8)'} />
                            </View>
                            <Text style={[styles.balanceAmount, { color: isDark ? colors.textPrimary : '#FFFFFF' }]}>
                                ₪{Math.abs(netProfit).toLocaleString()}
                            </Text>
                            <View style={[
                                styles.balanceBadge,
                                { backgroundColor: isPositive ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)' }
                            ]}>
                                {isPositive ? (
                                    <TrendingUp size={14} color={isDark ? colors.success : '#34D399'} />
                                ) : (
                                    <TrendingDown size={14} color={isDark ? colors.danger : '#F87171'} />
                                )}
                                <Text style={[
                                    styles.balanceBadgeText,
                                    { color: isPositive ? (isDark ? colors.success : '#34D399') : (isDark ? colors.danger : '#F87171') }
                                ]}>
                                    {isPositive ? 'רווח' : 'הפסד'}
                                </Text>
                            </View>

                            {/* Mini Stats Row */}
                            <View style={styles.miniStats}>
                                <TouchableOpacity
                                    style={styles.miniStat}
                                    onPress={() => navigation.navigate('InvoicesList')}
                                >
                                    <Text style={[styles.miniStatLabel, { color: isDark ? colors.textTertiary : 'rgba(255,255,255,0.6)' }]}>
                                        הכנסות
                                    </Text>
                                    <Text style={[styles.miniStatValue, { color: isDark ? colors.success : '#34D399' }]}>
                                        +₪{totalRevenue.toLocaleString()}
                                    </Text>
                                </TouchableOpacity>
                                <View style={[styles.miniStatDivider, { backgroundColor: isDark ? colors.border : 'rgba(255,255,255,0.2)' }]} />
                                <TouchableOpacity
                                    style={styles.miniStat}
                                    onPress={() => navigation.navigate('Expenses')}
                                >
                                    <Text style={[styles.miniStatLabel, { color: isDark ? colors.textTertiary : 'rgba(255,255,255,0.6)' }]}>
                                        הוצאות
                                    </Text>
                                    <Text style={[styles.miniStatValue, { color: isDark ? colors.danger : '#F87171' }]}>
                                        -₪{totalExpenses.toLocaleString()}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </LinearGradient>
                    </TouchableOpacity>

                    {/* Quick Actions */}
                    <View style={styles.sectionHeader}>
                        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
                            פעולות מהירות
                        </Text>
                    </View>
                    <View style={styles.quickActions}>
                        <QuickAction
                            icon={FileText}
                            label="חשבונית"
                            color={colors.primary}
                            onPress={() => navigation.navigate('CreateInvoice')}
                        />
                        <QuickAction
                            icon={Receipt}
                            label="הוצאה"
                            color={colors.danger}
                            onPress={() => navigation.navigate('AddExpense')}
                        />
                        <QuickAction
                            icon={Users}
                            label="לקוחות"
                            color={colors.info}
                            onPress={() => navigation.navigate('Clients')}
                        />
                        <QuickAction
                            icon={PieChart}
                            label="דוחות"
                            color={colors.warning}
                            onPress={() => navigation.navigate('PnL')}
                        />
                    </View>

                    {/* Stats Cards */}
                    <View style={styles.sectionHeader}>
                        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
                            סטטיסטיקות
                        </Text>
                        <TouchableOpacity onPress={() => navigation.navigate('AllActivity')}>
                            <Text style={[styles.seeAll, { color: colors.primary }]}>
                                הכל
                            </Text>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.statsRow}>
                        <StatCard
                            title="הכנסות"
                            value={totalRevenue}
                            trend={12}
                            color={colors.success}
                            onPress={() => navigation.navigate('InvoicesList')}
                        />
                        <StatCard
                            title="הוצאות"
                            value={totalExpenses}
                            trend={-5}
                            color={colors.danger}
                            onPress={() => navigation.navigate('Expenses')}
                        />
                    </View>

                    {/* Pending Section */}
                    {pendingInvoices.length > 0 && (
                        <>
                            <View style={styles.sectionHeader}>
                                <View style={styles.sectionTitleRow}>
                                    <Clock size={18} color={colors.warning} />
                                    <Text style={[styles.sectionTitle, { color: colors.textPrimary, marginRight: SPACING.sm }]}>
                                        ממתינים לתשלום
                                    </Text>
                                </View>
                                <TouchableOpacity onPress={() => navigation.navigate('InvoicesList', { filter: 'pending' })}>
                                    <Text style={[styles.seeAll, { color: colors.primary }]}>
                                        {pendingInvoices.length} פריטים
                                    </Text>
                                </TouchableOpacity>
                            </View>
                            <View style={[styles.pendingCard, { backgroundColor: colors.warningMuted, borderColor: colors.warning + '30' }]}>
                                <View style={styles.pendingInfo}>
                                    <Text style={[styles.pendingLabel, { color: colors.textSecondary }]}>
                                        סה״כ ממתין
                                    </Text>
                                    <Text style={[styles.pendingAmount, { color: colors.warning }]}>
                                        ₪{pendingInvoices.reduce((sum, t) =>
                                            sum + (parseFloat(t.amount.replace(/[^0-9.-]+/g, '')) || 0), 0
                                        ).toLocaleString()}
                                    </Text>
                                </View>
                                <TouchableOpacity
                                    style={[styles.pendingButton, { backgroundColor: colors.warning }]}
                                    onPress={() => navigation.navigate('InvoicesList', { filter: 'pending' })}
                                >
                                    <Text style={styles.pendingButtonText}>צפה</Text>
                                </TouchableOpacity>
                            </View>
                        </>
                    )}

                    {/* Goals Progress */}
                    <TouchableOpacity
                        style={[styles.goalsCard, { backgroundColor: colors.surface }, SHADOWS.sm]}
                        onPress={() => navigation.navigate('Goals')}
                        activeOpacity={0.7}
                    >
                        <View style={styles.goalsHeader}>
                            <View>
                                <Text style={[styles.goalsTitle, { color: colors.textPrimary }]}>
                                    יעד הוצאות חודשי
                                </Text>
                                <Text style={[styles.goalsSubtitle, { color: colors.textSecondary }]}>
                                    ₪{expenseProgress.current.toLocaleString()} מתוך ₪{expenseProgress.limit.toLocaleString()}
                                </Text>
                            </View>
                            <View style={[
                                styles.goalsPercentBadge,
                                { backgroundColor: expenseProgress.percentage > 80 ? colors.dangerMuted : colors.successMuted }
                            ]}>
                                <Text style={[
                                    styles.goalsPercent,
                                    { color: expenseProgress.percentage > 80 ? colors.danger : colors.success }
                                ]}>
                                    {Math.round(expenseProgress.percentage)}%
                                </Text>
                            </View>
                        </View>
                        <View style={[styles.progressBar, { backgroundColor: colors.surfaceSecondary }]}>
                            <View
                                style={[
                                    styles.progressFill,
                                    {
                                        width: `${Math.min(expenseProgress.percentage, 100)}%`,
                                        backgroundColor: expenseProgress.percentage > 80 ? colors.danger : colors.primary
                                    }
                                ]}
                            />
                        </View>
                    </TouchableOpacity>

                    <View style={{ height: 120 }} />
                </Animated.View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: LAYOUT.screenPadding,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING['2xl'],
    },
    greeting: {
        ...TYPOGRAPHY.body,
        marginBottom: SPACING.xs,
    },
    monthLabel: {
        ...TYPOGRAPHY.h2,
    },
    addButton: {
        width: 48,
        height: 48,
        borderRadius: RADIUS.md,
        alignItems: 'center',
        justifyContent: 'center',
    },
    balanceCard: {
        borderRadius: RADIUS['2xl'],
        padding: SPACING['2xl'],
        marginBottom: SPACING['2xl'],
    },
    balanceHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.sm,
    },
    balanceLabel: {
        ...TYPOGRAPHY.body,
    },
    balanceAmount: {
        ...TYPOGRAPHY.money,
        marginBottom: SPACING.md,
    },
    balanceBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.sm,
        borderRadius: RADIUS.full,
        gap: SPACING.xs,
        marginBottom: SPACING.xl,
    },
    balanceBadgeText: {
        ...TYPOGRAPHY.labelSmall,
    },
    miniStats: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    miniStat: {
        flex: 1,
    },
    miniStatDivider: {
        width: 1,
        height: 32,
        marginHorizontal: SPACING.lg,
    },
    miniStatLabel: {
        ...TYPOGRAPHY.caption,
        marginBottom: SPACING.xs,
    },
    miniStatValue: {
        ...TYPOGRAPHY.label,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.lg,
        marginTop: SPACING.md,
    },
    sectionTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    sectionTitle: {
        ...TYPOGRAPHY.h4,
    },
    seeAll: {
        ...TYPOGRAPHY.label,
    },
    quickActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: SPACING.lg,
    },
    quickAction: {
        width: (width - LAYOUT.screenPadding * 2 - SPACING.md * 3) / 4,
        aspectRatio: 1,
        borderRadius: RADIUS.xl,
        alignItems: 'center',
        justifyContent: 'center',
        padding: SPACING.sm,
    },
    quickActionIcon: {
        width: 40,
        height: 40,
        borderRadius: RADIUS.md,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: SPACING.sm,
    },
    quickActionLabel: {
        ...TYPOGRAPHY.captionSmall,
        textAlign: 'center',
    },
    statsRow: {
        flexDirection: 'row',
        gap: SPACING.md,
        marginBottom: SPACING.lg,
    },
    statCard: {
        flex: 1,
        borderRadius: RADIUS.xl,
        padding: SPACING.lg,
    },
    statHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.sm,
    },
    statTitle: {
        ...TYPOGRAPHY.caption,
    },
    statValue: {
        ...TYPOGRAPHY.moneySmall,
        marginBottom: SPACING.sm,
    },
    trendRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.xs,
    },
    trendText: {
        ...TYPOGRAPHY.captionSmall,
    },
    pendingCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: SPACING.lg,
        borderRadius: RADIUS.xl,
        borderWidth: 1,
        marginBottom: SPACING.lg,
    },
    pendingInfo: {
        flex: 1,
    },
    pendingLabel: {
        ...TYPOGRAPHY.caption,
        marginBottom: SPACING.xs,
    },
    pendingAmount: {
        ...TYPOGRAPHY.moneySmall,
    },
    pendingButton: {
        paddingHorizontal: SPACING.xl,
        paddingVertical: SPACING.md,
        borderRadius: RADIUS.md,
    },
    pendingButtonText: {
        color: '#FFFFFF',
        ...TYPOGRAPHY.button,
    },
    goalsCard: {
        borderRadius: RADIUS.xl,
        padding: SPACING.lg,
        marginTop: SPACING.md,
    },
    goalsHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: SPACING.lg,
    },
    goalsTitle: {
        ...TYPOGRAPHY.label,
        marginBottom: SPACING.xs,
    },
    goalsSubtitle: {
        ...TYPOGRAPHY.caption,
    },
    goalsPercentBadge: {
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.sm,
        borderRadius: RADIUS.sm,
    },
    goalsPercent: {
        ...TYPOGRAPHY.labelSmall,
    },
    progressBar: {
        height: 8,
        borderRadius: 4,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        borderRadius: 4,
    },
});
