import React, { useState, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import {
    ChevronRight,
    TrendingUp,
    TrendingDown,
    ArrowUpRight,
    ArrowDownLeft,
    FileText,
    Share2,
} from 'lucide-react-native';
import { useTransactions } from '../context/TransactionsContext';
import { useNotification } from '../context/NotificationContext';
import { useTheme } from '../context/ThemeContext';
import { PieChart as PieChartKit } from 'react-native-chart-kit';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { getColors, FONTS, SPACING, RADIUS, SHADOWS, TYPOGRAPHY, LAYOUT } from '../constants/theme';

type TimePeriod = 'week' | 'month' | 'year' | 'all';

export default function PnLScreen() {
    const insets = useSafeAreaInsets();
    const navigation = useNavigation<any>();
    const { resolvedTheme, isDark } = useTheme();
    const colors = getColors(resolvedTheme);
    const { transactions, userProfile, businessSettings } = useTransactions();
    const { showError } = useNotification();

    const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>('month');

    const parseAmount = (str?: string) => {
        if (!str) return 0;
        return parseFloat(str.replace(/[^0-9.-]+/g, '')) || 0;
    };

    const invoices = useMemo(() => (transactions || []).filter(t => t.type === 'invoice'), [transactions]);

    const getPeriodLabel = (period: TimePeriod) => {
        const now = new Date();
        switch (period) {
            case 'week': return 'השבוע';
            case 'month': return now.toLocaleDateString('he-IL', { month: 'long', year: 'numeric' });
            case 'year': return `${now.getFullYear()}`;
            case 'all': return 'כל הזמן';
            default: return '';
        }
    };

    const filteredData = useMemo(() => {
        const now = new Date();
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
        startOfWeek.setHours(0, 0, 0, 0);

        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfYear = new Date(now.getFullYear(), 0, 1);

        const filterDate = (dateString: string | Date) => {
            const date = new Date(dateString);
            if (selectedPeriod === 'week') return date >= startOfWeek;
            if (selectedPeriod === 'month') return date >= startOfMonth;
            if (selectedPeriod === 'year') return date >= startOfYear;
            return true;
        };

        const periodRevenues = invoices.filter(inv =>
            (inv.status === 'paid' || inv.status === 'pending') && filterDate(inv.date)
        );

        const periodExpenses = transactions.filter(t =>
            t.type === 'expense' && filterDate(t.date)
        );

        return { periodRevenues, periodExpenses };
    }, [selectedPeriod, invoices, transactions]);

    const totalRevenue = filteredData.periodRevenues.reduce((sum, inv) => sum + parseAmount(inv.amount), 0);
    const expensesFromInvoices = filteredData.periodRevenues.reduce((sum, inv) => sum + parseAmount(inv.cost), 0);
    const directExpenses = filteredData.periodExpenses.reduce((sum, exp) => sum + parseAmount(exp.amount), 0);
    const totalExpenses = directExpenses + expensesFromInvoices;
    const netProfit = totalRevenue - totalExpenses;
    const profitMargin = totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(1) : '0.0';

    const expensesByCategory = useMemo(() => {
        const groups: Record<string, number> = {};

        filteredData.periodExpenses.forEach(exp => {
            const amount = parseAmount(exp.amount);
            const catName = exp.category || 'אחר';
            groups[catName] = (groups[catName] || 0) + amount;
        });

        if (expensesFromInvoices > 0) {
            groups['עלות מכר'] = expensesFromInvoices;
        }

        const CHART_COLORS = ['#0D9488', '#059669', '#D97706', '#DC2626', '#7C3AED', '#2563EB'];

        return Object.entries(groups)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([name, amount], index) => ({
                name,
                amount,
                color: CHART_COLORS[index % CHART_COLORS.length],
                legendFontColor: colors.textSecondary,
                legendFontSize: 12
            }));
    }, [filteredData, expensesFromInvoices, colors]);

    const handleExportPDF = async () => {
        try {
            const { name, email } = userProfile;
            const businessName = businessSettings.name || name;

            const html = `
                <html dir="rtl">
                  <head>
                    <meta charset="utf-8">
                    <style>
                      body { font-family: 'Helvetica', sans-serif; padding: 40px; direction: rtl; }
                      h1 { color: #0D9488; text-align: center; }
                      .card { border: 1px solid #E2E8F0; padding: 20px; margin-bottom: 20px; border-radius: 12px; }
                      .row { display: flex; justify-content: space-between; margin-bottom: 10px; }
                      .footer { margin-top: 40px; text-align: center; color: #94A3B8; font-size: 12px; }
                    </style>
                  </head>
                  <body>
                    <h1>דוח רווח והפסד - Finly</h1>
                    <p style="text-align: center; color: #64748B;">${businessName} | ${getPeriodLabel(selectedPeriod)}</p>
                    <div class="card">
                        <div class="row"><span>הכנסות:</span> <span>₪${totalRevenue.toLocaleString()}</span></div>
                        <div class="row"><span>הוצאות:</span> <span>₪${totalExpenses.toLocaleString()}</span></div>
                        <hr style="border: 0; border-top: 1px solid #E2E8F0; margin: 15px 0;">
                        <div class="row"><strong style="color: #0D9488;">רווח נקי:</strong> <strong style="color: #0D9488;">₪${netProfit.toLocaleString()}</strong></div>
                    </div>
                    <div class="footer">הופק ע״י Finly בתאריך ${new Date().toLocaleDateString('he-IL')}</div>
                  </body>
                </html>
            `;

            const { uri } = await Print.printToFileAsync({ html });
            await Sharing.shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
        } catch (error) {
            showError('שגיאה', 'נכשל ביצירת קובץ PDF');
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <StatusBar style={isDark ? 'light' : 'dark'} />

            {/* Header */}
            <View style={[styles.header, { paddingTop: insets.top + SPACING.md }]}>
                <View style={{ width: 44 }} />
                <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
                    דוחות
                </Text>
                <View style={{ width: 44 }} />
            </View>

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Period Selector */}
                <View style={[styles.periodSelector, { backgroundColor: colors.surfaceSecondary }]}>
                    {(['week', 'month', 'year', 'all'] as TimePeriod[]).map((p) => (
                        <TouchableOpacity
                            key={p}
                            style={[
                                styles.periodTab,
                                selectedPeriod === p && [styles.periodTabActive, { backgroundColor: colors.surface }]
                            ]}
                            onPress={() => setSelectedPeriod(p)}
                        >
                            <Text style={[
                                styles.periodTabText,
                                { color: colors.textTertiary },
                                selectedPeriod === p && { color: colors.textPrimary }
                            ]}>
                                {p === 'week' ? 'שבוע' : p === 'month' ? 'חודש' : p === 'year' ? 'שנה' : 'הכל'}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <Text style={[styles.periodLabel, { color: colors.textTertiary }]}>
                    {getPeriodLabel(selectedPeriod)}
                </Text>

                {/* Summary Card */}
                <View style={[styles.summaryCard, { backgroundColor: colors.surface }, SHADOWS.md]}>
                    <Text style={[styles.summaryLabel, { color: colors.textTertiary }]}>
                        רווח נקי
                    </Text>
                    <Text style={[
                        styles.summaryAmount,
                        { color: netProfit >= 0 ? colors.success : colors.danger }
                    ]}>
                        ₪{netProfit.toLocaleString()}
                    </Text>
                    <View style={[styles.marginBadge, { backgroundColor: colors.primaryMuted }]}>
                        <Text style={[styles.marginText, { color: colors.primary }]}>
                            מרווח: {profitMargin}%
                        </Text>
                    </View>
                </View>

                {/* KPI Cards */}
                <View style={styles.kpiRow}>
                    <View style={[styles.kpiCard, { backgroundColor: colors.surface }, SHADOWS.sm]}>
                        <View style={[styles.kpiIcon, { backgroundColor: colors.successMuted }]}>
                            <ArrowDownLeft size={18} color={colors.success} />
                        </View>
                        <Text style={[styles.kpiLabel, { color: colors.textTertiary }]}>הכנסות</Text>
                        <Text style={[styles.kpiValue, { color: colors.textPrimary }]}>
                            ₪{totalRevenue.toLocaleString()}
                        </Text>
                    </View>

                    <View style={[styles.kpiCard, { backgroundColor: colors.surface }, SHADOWS.sm]}>
                        <View style={[styles.kpiIcon, { backgroundColor: colors.dangerMuted }]}>
                            <ArrowUpRight size={18} color={colors.danger} />
                        </View>
                        <Text style={[styles.kpiLabel, { color: colors.textTertiary }]}>הוצאות</Text>
                        <Text style={[styles.kpiValue, { color: colors.textPrimary }]}>
                            ₪{totalExpenses.toLocaleString()}
                        </Text>
                    </View>
                </View>

                {/* Expenses Breakdown */}
                {expensesByCategory.length > 0 && (
                    <View style={[styles.section, { backgroundColor: colors.surface }, SHADOWS.sm]}>
                        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
                            פילוח הוצאות
                        </Text>

                        <View style={styles.chartContainer}>
                            <PieChartKit
                                data={expensesByCategory}
                                width={160}
                                height={160}
                                chartConfig={{
                                    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                                }}
                                accessor={"amount"}
                                backgroundColor={"transparent"}
                                paddingLeft={"40"}
                                center={[0, 0]}
                                absolute={false}
                                hasLegend={false}
                            />

                            <View style={styles.legendContainer}>
                                {expensesByCategory.map((exp, i) => (
                                    <View key={i} style={styles.legendItem}>
                                        <View style={[styles.legendDot, { backgroundColor: exp.color }]} />
                                        <Text style={[styles.legendText, { color: colors.textSecondary }]} numberOfLines={1}>
                                            {exp.name}
                                        </Text>
                                        <Text style={[styles.legendAmount, { color: colors.textPrimary }]}>
                                            ₪{exp.amount.toLocaleString()}
                                        </Text>
                                    </View>
                                ))}
                            </View>
                        </View>
                    </View>
                )}

                {/* Export Actions */}
                <View style={styles.actions}>
                    <TouchableOpacity
                        style={[styles.primaryButton, { backgroundColor: colors.primary }]}
                        onPress={handleExportPDF}
                    >
                        <FileText size={20} color="#FFFFFF" />
                        <Text style={styles.primaryButtonText}>ייצוא דוח PDF</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.secondaryButton, { backgroundColor: colors.surfaceSecondary }]}
                    >
                        <Share2 size={20} color={colors.textPrimary} />
                        <Text style={[styles.secondaryButtonText, { color: colors.textPrimary }]}>
                            שתף סיכום
                        </Text>
                    </TouchableOpacity>
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
    scrollContent: {
        paddingHorizontal: LAYOUT.screenPadding,
    },
    periodSelector: {
        flexDirection: 'row',
        borderRadius: RADIUS.lg,
        padding: SPACING.xs,
        marginBottom: SPACING.md,
    },
    periodTab: {
        flex: 1,
        paddingVertical: SPACING.md,
        alignItems: 'center',
        borderRadius: RADIUS.md,
    },
    periodTabActive: {},
    periodTabText: {
        ...TYPOGRAPHY.label,
    },
    periodLabel: {
        ...TYPOGRAPHY.caption,
        textAlign: 'center',
        marginBottom: SPACING.xl,
    },
    summaryCard: {
        borderRadius: RADIUS.xl,
        padding: SPACING['2xl'],
        alignItems: 'center',
        marginBottom: SPACING.xl,
    },
    summaryLabel: {
        ...TYPOGRAPHY.bodySmall,
        marginBottom: SPACING.sm,
    },
    summaryAmount: {
        ...TYPOGRAPHY.display,
        marginBottom: SPACING.lg,
    },
    marginBadge: {
        paddingHorizontal: SPACING.lg,
        paddingVertical: SPACING.sm,
        borderRadius: RADIUS.full,
    },
    marginText: {
        ...TYPOGRAPHY.label,
    },
    kpiRow: {
        flexDirection: 'row',
        gap: SPACING.md,
        marginBottom: SPACING.xl,
    },
    kpiCard: {
        flex: 1,
        borderRadius: RADIUS.lg,
        padding: SPACING.lg,
    },
    kpiIcon: {
        width: 36,
        height: 36,
        borderRadius: RADIUS.sm,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: SPACING.md,
    },
    kpiLabel: {
        ...TYPOGRAPHY.caption,
        marginBottom: SPACING.xs,
    },
    kpiValue: {
        ...TYPOGRAPHY.h4,
    },
    section: {
        borderRadius: RADIUS.xl,
        padding: SPACING.lg,
        marginBottom: SPACING.xl,
    },
    sectionTitle: {
        ...TYPOGRAPHY.h4,
        marginBottom: SPACING.lg,
    },
    chartContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    legendContainer: {
        flex: 1,
        gap: SPACING.md,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.sm,
    },
    legendDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
    },
    legendText: {
        flex: 1,
        ...TYPOGRAPHY.caption,
    },
    legendAmount: {
        ...TYPOGRAPHY.label,
    },
    actions: {
        gap: SPACING.md,
    },
    primaryButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: SPACING.sm,
        height: LAYOUT.buttonHeight,
        borderRadius: RADIUS.md,
    },
    primaryButtonText: {
        ...TYPOGRAPHY.h4,
        color: '#FFFFFF',
    },
    secondaryButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: SPACING.sm,
        height: LAYOUT.buttonHeight,
        borderRadius: RADIUS.md,
    },
    secondaryButtonText: {
        ...TYPOGRAPHY.h4,
    },
});
