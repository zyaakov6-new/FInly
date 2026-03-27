import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import {
    TrendingUp,
    TrendingDown,
    AlertTriangle,
    CheckCircle,
    Target,
    Zap,
    PiggyBank,
    Calendar,
    ArrowRight,
    Sparkles,
} from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';
import { useTransactions, Transaction } from '../context/TransactionsContext';
import { getColors, FONTS, SPACING, RADIUS, SHADOWS, TYPOGRAPHY, LAYOUT } from '../constants/theme';

interface Insight {
    id: string;
    type: 'success' | 'warning' | 'info' | 'prediction';
    icon: any;
    title: string;
    description: string;
    action?: string;
    onAction?: () => void;
    priority: number;
}

interface Props {
    onNavigate?: (screen: string, params?: any) => void;
    maxInsights?: number;
}

export function SmartInsights({ onNavigate, maxInsights = 5 }: Props) {
    const { resolvedTheme } = useTheme();
    const colors = getColors(resolvedTheme);
    const {
        transactions,
        totalRevenue,
        totalExpenses,
        goals,
    } = useTransactions();

    const insights = useMemo(() => {
        const insightsList: Insight[] = [];
        const now = new Date();
        const thisMonth = now.getMonth();
        const thisYear = now.getFullYear();
        const dayOfMonth = now.getDate();
        const daysInMonth = new Date(thisYear, thisMonth + 1, 0).getDate();

        // Get transactions by period
        const thisMonthExpenses = transactions.filter(t => {
            const date = new Date(t.date);
            return t.type === 'expense' && date.getMonth() === thisMonth && date.getFullYear() === thisYear;
        });

        const lastMonth = thisMonth === 0 ? 11 : thisMonth - 1;
        const lastMonthYear = thisMonth === 0 ? thisYear - 1 : thisYear;
        const lastMonthExpenses = transactions.filter(t => {
            const date = new Date(t.date);
            return t.type === 'expense' && date.getMonth() === lastMonth && date.getFullYear() === lastMonthYear;
        });

        // Calculate totals
        const parseAmount = (amount: string) => parseFloat(amount.replace(/[^0-9.-]+/g, '')) || 0;
        const thisMonthTotal = thisMonthExpenses.reduce((sum, t) => sum + parseAmount(t.amount), 0);
        const lastMonthTotal = lastMonthExpenses.reduce((sum, t) => sum + parseAmount(t.amount), 0);

        // Category breakdown
        const categoryTotals: { [key: string]: number } = {};
        thisMonthExpenses.forEach(t => {
            const cat = t.category || 'אחר';
            categoryTotals[cat] = (categoryTotals[cat] || 0) + parseAmount(t.amount);
        });

        const sortedCategories = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]);

        // 1. Spending Prediction
        if (dayOfMonth >= 5) {
            const dailyAverage = thisMonthTotal / dayOfMonth;
            const predictedMonthTotal = dailyAverage * daysInMonth;
            const expenseLimit = goals.monthlyExpenseLimit || 0;

            if (expenseLimit > 0 && predictedMonthTotal > expenseLimit) {
                const overAmount = Math.round(predictedMonthTotal - expenseLimit);
                insightsList.push({
                    id: 'prediction-over-budget',
                    type: 'warning',
                    icon: AlertTriangle,
                    title: 'צפי חריגה מהתקציב',
                    description: `בקצב הנוכחי, צפויה חריגה של ₪${overAmount.toLocaleString()} מהתקציב החודשי`,
                    action: 'צפה בהוצאות',
                    onAction: () => onNavigate?.('Expenses'),
                    priority: 1,
                });
            } else if (expenseLimit > 0 && predictedMonthTotal < expenseLimit * 0.7) {
                insightsList.push({
                    id: 'prediction-under-budget',
                    type: 'success',
                    icon: PiggyBank,
                    title: 'מצוין! אתה בדרך לחסוך',
                    description: `צפי חיסכון של ₪${Math.round(expenseLimit - predictedMonthTotal).toLocaleString()} החודש`,
                    priority: 3,
                });
            }
        }

        // 2. Month-over-month comparison
        if (lastMonthTotal > 0) {
            const percentChange = ((thisMonthTotal - lastMonthTotal) / lastMonthTotal) * 100;

            if (percentChange > 30) {
                insightsList.push({
                    id: 'expense-increase',
                    type: 'warning',
                    icon: TrendingUp,
                    title: `ההוצאות עלו ב-${Math.round(percentChange)}%`,
                    description: `החודש: ₪${thisMonthTotal.toLocaleString()} לעומת ₪${lastMonthTotal.toLocaleString()} בחודש שעבר`,
                    action: 'נתח הוצאות',
                    onAction: () => onNavigate?.('Expenses'),
                    priority: 2,
                });
            } else if (percentChange < -20) {
                insightsList.push({
                    id: 'expense-decrease',
                    type: 'success',
                    icon: TrendingDown,
                    title: `יפה! חסכת ${Math.abs(Math.round(percentChange))}%`,
                    description: `החודש הוצאת ₪${(lastMonthTotal - thisMonthTotal).toLocaleString()} פחות מהחודש שעבר`,
                    priority: 4,
                });
            }
        }

        // 3. Top spending category insight
        if (sortedCategories.length > 0) {
            const [topCategory, topAmount] = sortedCategories[0];
            const topPercent = thisMonthTotal > 0 ? Math.round((topAmount / thisMonthTotal) * 100) : 0;

            if (topPercent >= 40) {
                insightsList.push({
                    id: 'top-category',
                    type: 'info',
                    icon: Target,
                    title: `${topCategory} - ${topPercent}% מההוצאות`,
                    description: `₪${topAmount.toLocaleString()} הוצאת על ${topCategory} החודש`,
                    priority: 5,
                });
            }
        }

        // 4. Income goal progress
        const incomeProgress = goals.monthlyIncomeTarget > 0
            ? (totalRevenue / goals.monthlyIncomeTarget) * 100
            : 0;

        if (incomeProgress >= 100) {
            insightsList.push({
                id: 'income-goal-achieved',
                type: 'success',
                icon: CheckCircle,
                title: 'הגעת ליעד ההכנסות!',
                description: `עברת את יעד ה-₪${goals.monthlyIncomeTarget.toLocaleString()} - כל הכבוד!`,
                priority: 2,
            });
        } else if (incomeProgress >= 80 && dayOfMonth <= 20) {
            insightsList.push({
                id: 'income-goal-close',
                type: 'info',
                icon: Zap,
                title: 'קרוב ליעד ההכנסות',
                description: `עוד ₪${(goals.monthlyIncomeTarget - totalRevenue).toLocaleString()} להשלמת היעד החודשי`,
                action: 'צור חשבונית',
                onAction: () => onNavigate?.('CreateInvoice'),
                priority: 3,
            });
        }

        // 5. Pending invoices reminder
        const pendingInvoices = transactions.filter(t => t.type === 'invoice' && t.status === 'pending');
        if (pendingInvoices.length > 0) {
            const pendingTotal = pendingInvoices.reduce((sum, t) => sum + parseAmount(t.amount), 0);
            const oldestPending = pendingInvoices.reduce((oldest, t) => {
                const date = new Date(t.date);
                return date < oldest ? date : oldest;
            }, new Date());
            const daysSinceOldest = Math.floor((now.getTime() - oldestPending.getTime()) / (1000 * 60 * 60 * 24));

            if (daysSinceOldest > 30) {
                insightsList.push({
                    id: 'overdue-invoices',
                    type: 'warning',
                    icon: Calendar,
                    title: `${pendingInvoices.length} חשבוניות ממתינות`,
                    description: `₪${pendingTotal.toLocaleString()} ממתינים לתשלום כבר ${daysSinceOldest} יום`,
                    action: 'צפה בחשבוניות',
                    onAction: () => onNavigate?.('InvoicesList', { filter: 'pending' }),
                    priority: 1,
                });
            }
        }

        // 6. Savings rate insight
        if (totalRevenue > 0) {
            const savingsRate = ((totalRevenue - totalExpenses) / totalRevenue) * 100;
            if (savingsRate >= 30) {
                insightsList.push({
                    id: 'great-savings',
                    type: 'success',
                    icon: PiggyBank,
                    title: `שיעור חיסכון מעולה: ${Math.round(savingsRate)}%`,
                    description: `אתה חוסך ₪${(totalRevenue - totalExpenses).toLocaleString()} מההכנסות`,
                    priority: 4,
                });
            } else if (savingsRate < 10 && savingsRate >= 0) {
                insightsList.push({
                    id: 'low-savings',
                    type: 'info',
                    icon: PiggyBank,
                    title: 'שיעור חיסכון נמוך',
                    description: `נסה להגדיל את החיסכון - כרגע רק ${Math.round(savingsRate)}% מההכנסות`,
                    priority: 5,
                });
            }
        }

        // Sort by priority and limit
        return insightsList.sort((a, b) => a.priority - b.priority).slice(0, maxInsights);
    }, [transactions, totalRevenue, totalExpenses, goals, onNavigate, maxInsights]);

    if (insights.length === 0) {
        return null;
    }

    const getTypeColors = (type: Insight['type']) => {
        switch (type) {
            case 'success':
                return { bg: colors.successMuted, icon: colors.success };
            case 'warning':
                return { bg: colors.warningMuted, icon: colors.warning };
            case 'prediction':
                return { bg: colors.primaryMuted, icon: colors.primary };
            default:
                return { bg: colors.infoMuted, icon: colors.info };
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.surface }, SHADOWS.md]}>
            <View style={styles.header}>
                <View style={[styles.headerIcon, { backgroundColor: colors.primaryMuted }]}>
                    <Sparkles size={18} color={colors.primary} />
                </View>
                <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
                    תובנות חכמות
                </Text>
            </View>

            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.insightsScroll}
            >
                {insights.map((insight) => {
                    const IconComponent = insight.icon;
                    const typeColors = getTypeColors(insight.type);

                    return (
                        <TouchableOpacity
                            key={insight.id}
                            style={[styles.insightCard, { backgroundColor: typeColors.bg }]}
                            onPress={insight.onAction}
                            activeOpacity={insight.onAction ? 0.7 : 1}
                        >
                            <View style={styles.insightHeader}>
                                <IconComponent size={20} color={typeColors.icon} />
                                {insight.action && (
                                    <ArrowRight size={14} color={typeColors.icon} />
                                )}
                            </View>
                            <Text style={[styles.insightTitle, { color: colors.textPrimary }]} numberOfLines={2}>
                                {insight.title}
                            </Text>
                            <Text style={[styles.insightDescription, { color: colors.textSecondary }]} numberOfLines={2}>
                                {insight.description}
                            </Text>
                            {insight.action && (
                                <Text style={[styles.insightAction, { color: typeColors.icon }]}>
                                    {insight.action}
                                </Text>
                            )}
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginHorizontal: LAYOUT.screenPadding,
        marginBottom: SPACING.lg,
        borderRadius: RADIUS.xl,
        padding: SPACING.lg,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.sm,
        marginBottom: SPACING.md,
    },
    headerIcon: {
        width: 32,
        height: 32,
        borderRadius: RADIUS.sm,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        ...TYPOGRAPHY.label,
    },
    insightsScroll: {
        gap: SPACING.sm,
    },
    insightCard: {
        width: 200,
        borderRadius: RADIUS.lg,
        padding: SPACING.md,
    },
    insightHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.sm,
    },
    insightTitle: {
        ...TYPOGRAPHY.labelSmall,
        marginBottom: SPACING.xs,
        lineHeight: 18,
    },
    insightDescription: {
        ...TYPOGRAPHY.captionSmall,
        lineHeight: 16,
    },
    insightAction: {
        ...TYPOGRAPHY.captionSmall,
        fontFamily: FONTS.semiBold,
        marginTop: SPACING.sm,
    },
});
