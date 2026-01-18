import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useTransactions } from '../context/TransactionsContext';
import { LineChart } from 'react-native-chart-kit';
import { ChevronLeft, ArrowUpRight, ArrowDownLeft, AlertCircle } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { COLORS, FONTS } from '../constants/theme';

const SCREEN_WIDTH = Dimensions.get('window').width;

// Widget 1: Today's Summary
const TodaySummaryWidget = () => {
    const { getDailyStats } = useTransactions();
    const stats = useMemo(() => getDailyStats(new Date()), [getDailyStats]);

    return (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>היום (Today)</Text>
            </View>
            <View style={styles.statsRow}>
                <View style={styles.statItem}>
                    <Text style={styles.statLabel}>הכנסות</Text>
                    <Text style={[styles.statValue, { color: COLORS.success }]}>₪{stats.revenue.toLocaleString()}</Text>
                </View>
                <View style={styles.statItem}>
                    <Text style={styles.statLabel}>הוצאות</Text>
                    <Text style={[styles.statValue, { color: COLORS.danger }]}>₪{stats.expenses.toLocaleString()}</Text>
                </View>
                <View style={styles.statItem}>
                    <Text style={styles.statLabel}>רווח</Text>
                    <Text style={[styles.statValue, { color: COLORS.primary }]}>₪{stats.profit.toLocaleString()}</Text>
                </View>
            </View>
        </View>
    );
};

// Widget 2: Weekly Trend
const WeeklyTrendWidget = () => {
    const { getLast7DaysTrend } = useTransactions();
    const trendData = useMemo(() => getLast7DaysTrend(), [getLast7DaysTrend]);

    // Reverse for chart (L to R) but labels need to match logic
    // Actually ChartKit renders left to right. Our data is "Last 7 days" usually [Today, Yesterday...] or [Day-6, Day-5...].
    // getLast7DaysTrend returns [Day-6, ..., Today].
    const data = {
        labels: trendData.map(d => d.dayName),
        datasets: [{
            data: trendData.map(d => d.profit),
            color: (opacity = 1) => COLORS.primary, // Using solid primary for simplicity or construct rgba if needed
            strokeWidth: 2
        }]
    };

    // Screen width - Dashboard padding (24*2) - Card padding (16*2)
    const chartWidth = SCREEN_WIDTH - 48 - 32;

    return (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>מגמת רווח (השבוע)</Text>
            </View>
            <LineChart
                data={data}
                width={chartWidth}
                height={180}
                chartConfig={{
                    backgroundColor: COLORS.surface,
                    backgroundGradientFrom: COLORS.surface,
                    backgroundGradientTo: COLORS.surface,
                    decimalPlaces: 0,
                    color: (opacity = 1) => `rgba(108, 99, 255, ${opacity})`, // Secondary (Purple)
                    labelColor: (opacity = 1) => `rgba(184, 188, 196, ${opacity})`, // Text Secondary
                    style: { borderRadius: 16 },
                    propsForDots: { r: "4", strokeWidth: "2", stroke: COLORS.primary }
                }}
                bezier
                style={{ marginVertical: 8, borderRadius: 16 }}
            />
        </View>
    );
};

// Widget 3: Top Expense
const TopExpenseWidget = () => {
    const navigation = useNavigation<any>();
    const { getTopExpenseCategory } = useTransactions();
    const top = useMemo(() => getTopExpenseCategory('month'), [getTopExpenseCategory]);

    if (!top) return (
        <View style={styles.card}>
            <Text style={styles.cardTitle}>הוצאות החודש</Text>
            <Text style={{ color: '#64748b', marginTop: 8 }}>אין הוצאות החודש עדיין.</Text>
        </View>
    );

    return (
        <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('ExpensesList')}
        >
            <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>הוצאה מובילה (החודש)</Text>
                <ArrowUpRight size={16} color={COLORS.danger} />
            </View>
            <View style={{ marginTop: 8 }}>
                <Text style={styles.expenseCatName}>{top.category}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 8 }}>
                    <Text style={styles.expenseAmount}>₪{top.amount.toLocaleString()}</Text>
                    <Text style={styles.expensePercent}>({top.percentage}% מהסה״כ)</Text>
                </View>
                <Text style={styles.expenseCount}>{top.count} תנועות</Text>
            </View>
        </TouchableOpacity>
    );
};

// Widget 4: Pending Invoices
const PendingInvoicesWidget = () => {
    const navigation = useNavigation<any>();
    const { getPendingInvoicesStats, transactions } = useTransactions();
    const stats = useMemo(() => getPendingInvoicesStats(), [getPendingInvoicesStats, transactions]);

    const handleMarkPaid = () => {
        // In a real app, show a modal list. For MVP, we alert.
        Alert.alert('סמן כשולם', 'פתיחת דיאלוג לסגירת חשבוניות...');
        navigation.navigate('Customers', { filter: 'pending' });
    };

    if (stats.count === 0) return null;

    return (
        <TouchableOpacity
            style={[styles.card, { borderColor: stats.overdueCount > 0 ? COLORS.danger : COLORS.border }]}
            onPress={() => navigation.navigate('Customers', { filter: stats.overdueCount > 0 ? 'overdue' : 'pending' })}
        >
            <View style={styles.cardHeader}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Text style={styles.cardTitle}>חשבוניות בתהליך</Text>
                    {stats.overdueCount > 0 && <AlertCircle size={16} color={COLORS.danger} />}
                </View>
                <ArrowDownLeft size={16} color={COLORS.success} />
            </View>

            <View style={{ marginVertical: 12 }}>
                <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 8 }}>
                    <Text style={styles.pendingCount}>{stats.count} חשבוניות</Text>
                    <Text style={styles.pendingAmount}>₪{stats.totalAmount.toLocaleString()}</Text>
                </View>
                {stats.overdueCount > 0 && (
                    <Text style={styles.overdueText}>⚠️ {stats.overdueCount} באיחור של עד {stats.maxOverdueDays} ימים!</Text>
                )}
            </View>

            <View style={styles.actionsRow}>
                <TouchableOpacity style={styles.actionBtn} onPress={handleMarkPaid}>
                    <Text style={styles.actionBtnText}>סמן כשולם</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.actionBtn, styles.actionBtnSecondary]}>
                    <Text style={[styles.actionBtnText, { color: COLORS.secondary }]}>שלח תזכורת</Text>
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );
};

export default function DashboardWidgets() {
    return (
        <View style={styles.container}>
            <Text style={styles.sectionHeader}>תובנות מהירות (Insights)</Text>
            <TodaySummaryWidget />
            <WeeklyTrendWidget />
            <TopExpenseWidget />
            <PendingInvoicesWidget />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginTop: 24,
        // paddingHorizontal removed
        gap: 16,
        marginBottom: 40
    },
    sectionHeader: {
        color: COLORS.textPrimary,
        fontSize: 18,
        fontFamily: FONTS.bold,
        marginBottom: 8,
        textAlign: 'left'
    },
    card: {
        backgroundColor: COLORS.surface,
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: COLORS.border,
        marginBottom: 0
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12
    },
    cardTitle: {
        color: COLORS.textSecondary,
        fontSize: 14,
        fontFamily: FONTS.medium,
        textAlign: 'left'
    },
    // Today Widget
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    statItem: {
        display: 'flex',
        alignItems: 'flex-start' // RTL alignment
    },
    statLabel: {
        color: COLORS.textSecondary,
        fontSize: 12,
        fontFamily: FONTS.regular,
        marginBottom: 4
    },
    statValue: {
        fontSize: 18,
        fontFamily: FONTS.bold
    },
    // Expense Widget
    expenseCatName: {
        color: COLORS.textPrimary,
        fontSize: 16,
        fontFamily: FONTS.medium,
        marginBottom: 4,
        textAlign: 'left'
    },
    expenseAmount: {
        color: COLORS.danger,
        fontSize: 18,
        fontFamily: FONTS.bold
    },
    expensePercent: {
        color: COLORS.textSecondary,
        fontSize: 12
    },
    expenseCount: {
        color: COLORS.textSecondary,
        fontSize: 12,
        marginTop: 4,
        textAlign: 'left'
    },
    // Pending Widget
    pendingCount: {
        color: COLORS.textPrimary,
        fontSize: 16,
        fontFamily: FONTS.medium
    },
    pendingAmount: {
        color: COLORS.textPrimary,
        fontSize: 18,
        fontFamily: FONTS.bold
    },
    overdueText: {
        color: COLORS.danger,
        fontSize: 12,
        fontFamily: FONTS.medium,
        marginTop: 4,
        textAlign: 'left'
    },
    actionsRow: {
        flexDirection: 'row',
        marginTop: 12,
        gap: 8
    },
    actionBtn: {
        backgroundColor: COLORS.primary,
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 8,
    },
    actionBtnSecondary: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: COLORS.secondary
    },
    actionBtnText: {
        color: COLORS.black,
        fontSize: 12,
        fontFamily: FONTS.medium
    }
});
