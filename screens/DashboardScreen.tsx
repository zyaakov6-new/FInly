import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Animated, useColorScheme, StatusBar, Platform } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { TrendingUp, TrendingDown, Plus, ChevronLeft, ArrowUpRight, ArrowDownLeft, Receipt, CreditCard, PieChart, Bell, Settings, MoreHorizontal } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTransactions } from '../context/TransactionsContext';
import { useUserProfile } from '../context/UserProfileContext';
import { FONTS, getColors, SPACING, RADIUS, SHADOWS, TYPOGRAPHY } from '../constants/theme';
import { formatCurrency } from '../utils/formatters';

const { width } = Dimensions.get('window');

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
        profitMargin,
        transactions,
        getMonthlyExpenseProgress
    } = useTransactions();

    const expenseProgress = useMemo(() => getMonthlyExpenseProgress(), [getMonthlyExpenseProgress]);

    // Subtle fade animation
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useFocusEffect(
        useCallback(() => {
            fadeAnim.setValue(0);
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }).start();
        }, [])
    );

    // Calculate month change
    const monthChange = useMemo(() => {
        const now = new Date();
        const currentMonth = now.getMonth();
        const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;

        const currentMonthRevenue = transactions
            .filter(tx => {
                const txDate = new Date(tx.date);
                return txDate.getMonth() === currentMonth && tx.isIncome && tx.status === 'paid';
            })
            .reduce((sum, tx) => sum + (parseFloat(tx.amount.replace(/[^\d.-]/g, '')) || 0), 0);

        const lastMonthRevenue = transactions
            .filter(tx => {
                const txDate = new Date(tx.date);
                return txDate.getMonth() === lastMonth && tx.isIncome && tx.status === 'paid';
            })
            .reduce((sum, tx) => sum + (parseFloat(tx.amount.replace(/[^\d.-]/g, '')) || 0), 0);

        if (lastMonthRevenue === 0) return 0;
        return parseFloat(((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue * 100).toFixed(1));
    }, [transactions]);

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

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <StatusBar barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'} />

            <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
                {/* Header */}
                <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
                    <View style={styles.headerLeft}>
                        <Text style={[styles.greeting, { color: colors.textTertiary }]}>
                            {new Date().getHours() < 12 ? 'בוקר טוב' : new Date().getHours() < 18 ? 'צהריים טובים' : 'ערב טוב'}
                        </Text>
                        <Text style={[styles.userName, { color: colors.textPrimary }]}>
                            {userProfileData?.fullName || 'משתמש'}
                        </Text>
                    </View>
                    <View style={styles.headerRight}>
                        <TouchableOpacity
                            style={[styles.headerButton, { backgroundColor: colors.fill }]}
                            onPress={() => navigation.navigate('Settings')}
                        >
                            <Settings size={20} color={colors.textSecondary} />
                        </TouchableOpacity>
                    </View>
                </View>

                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                >
                    {/* Balance Card */}
                    <View style={[styles.balanceCard, { backgroundColor: colors.surface }, SHADOWS.md]}>
                        <View style={styles.balanceHeader}>
                            <Text style={[styles.balanceLabel, { color: colors.textTertiary }]}>יתרה כוללת</Text>
                            <View style={[
                                styles.changeBadge,
                                { backgroundColor: monthChange >= 0 ? colors.successMuted : colors.dangerMuted }
                            ]}>
                                {monthChange >= 0 ? (
                                    <TrendingUp size={12} color={colors.success} />
                                ) : (
                                    <TrendingDown size={12} color={colors.danger} />
                                )}
                                <Text style={[
                                    styles.changeText,
                                    { color: monthChange >= 0 ? colors.success : colors.danger }
                                ]}>
                                    {Math.abs(monthChange)}%
                                </Text>
                            </View>
                        </View>
                        <Text style={[styles.balanceAmount, { color: colors.textPrimary }]}>
                            ₪{netProfit.toLocaleString()}
                        </Text>
                        <View style={styles.balanceFooter}>
                            <View style={styles.balanceItem}>
                                <View style={[styles.balanceIcon, { backgroundColor: colors.successMuted }]}>
                                    <ArrowDownLeft size={14} color={colors.success} />
                                </View>
                                <View>
                                    <Text style={[styles.balanceItemLabel, { color: colors.textTertiary }]}>הכנסות</Text>
                                    <Text style={[styles.balanceItemValue, { color: colors.textPrimary }]}>
                                        ₪{totalRevenue.toLocaleString()}
                                    </Text>
                                </View>
                            </View>
                            <View style={styles.balanceDivider} />
                            <View style={styles.balanceItem}>
                                <View style={[styles.balanceIcon, { backgroundColor: colors.dangerMuted }]}>
                                    <ArrowUpRight size={14} color={colors.danger} />
                                </View>
                                <View>
                                    <Text style={[styles.balanceItemLabel, { color: colors.textTertiary }]}>הוצאות</Text>
                                    <Text style={[styles.balanceItemValue, { color: colors.textPrimary }]}>
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
                            <Text style={[styles.quickActionText, { color: colors.textPrimary }]}>הכנסה</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.quickAction, { backgroundColor: colors.surface }, SHADOWS.sm]}
                            onPress={() => navigation.navigate('AddExpense')}
                        >
                            <View style={[styles.quickActionIcon, { backgroundColor: colors.dangerMuted }]}>
                                <ArrowUpRight size={20} color={colors.danger} />
                            </View>
                            <Text style={[styles.quickActionText, { color: colors.textPrimary }]}>הוצאה</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.quickAction, { backgroundColor: colors.surface }, SHADOWS.sm]}
                            onPress={() => navigation.navigate('PnL')}
                        >
                            <View style={[styles.quickActionIcon, { backgroundColor: colors.tintPurple + '20' }]}>
                                <PieChart size={20} color={colors.tintPurple} />
                            </View>
                            <Text style={[styles.quickActionText, { color: colors.textPrimary }]}>דוחות</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Monthly Budget */}
                    <View style={[styles.section, { backgroundColor: colors.surface }, SHADOWS.sm]}>
                        <View style={styles.sectionHeader}>
                            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>תקציב חודשי</Text>
                            <Text style={[styles.sectionSubtitle, { color: colors.textTertiary }]}>
                                {new Date().toLocaleDateString('he-IL', { month: 'long' })}
                            </Text>
                        </View>
                        <View style={styles.budgetContent}>
                            <View style={styles.budgetHeader}>
                                <Text style={[styles.budgetSpent, { color: colors.textPrimary }]}>
                                    ₪{expenseProgress.current.toLocaleString()}
                                </Text>
                                <Text style={[styles.budgetTotal, { color: colors.textTertiary }]}>
                                    מתוך ₪{expenseProgress.limit.toLocaleString()}
                                </Text>
                            </View>
                            <View style={[styles.progressBar, { backgroundColor: colors.fill }]}>
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
                    </View>

                    {/* Recent Transactions */}
                    <View style={[styles.section, { backgroundColor: colors.surface }, SHADOWS.sm]}>
                        <View style={styles.sectionHeader}>
                            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>פעילות אחרונה</Text>
                            <TouchableOpacity onPress={() => navigation.navigate('AllActivity')}>
                                <Text style={[styles.seeAll, { color: colors.primary }]}>הכל</Text>
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
                                            borderBottomWidth: StyleSheet.hairlineWidth,
                                            borderBottomColor: colors.separator
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
                                        { backgroundColor: tx.isIncome ? colors.successMuted : colors.fill }
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
            </Animated.View>
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
        paddingHorizontal: SPACING.xl,
        paddingBottom: SPACING.lg,
    },
    headerLeft: {
        alignItems: 'flex-start',
    },
    headerRight: {
        flexDirection: 'row',
        gap: SPACING.sm,
    },
    greeting: {
        ...TYPOGRAPHY.subhead,
        marginBottom: 2,
    },
    userName: {
        ...TYPOGRAPHY.title2,
    },
    headerButton: {
        width: 40,
        height: 40,
        borderRadius: RADIUS.full,
        alignItems: 'center',
        justifyContent: 'center',
    },
    scrollContent: {
        paddingHorizontal: SPACING.xl,
    },
    balanceCard: {
        borderRadius: RADIUS.xl,
        padding: SPACING['2xl'],
        marginBottom: SPACING.xl,
    },
    balanceHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.sm,
    },
    balanceLabel: {
        ...TYPOGRAPHY.subhead,
    },
    changeBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: SPACING.sm,
        paddingVertical: SPACING.xs,
        borderRadius: RADIUS.full,
        gap: 4,
    },
    changeText: {
        ...TYPOGRAPHY.caption1,
        fontFamily: FONTS.semiBold,
    },
    balanceAmount: {
        fontSize: 40,
        fontFamily: FONTS.bold,
        letterSpacing: -1,
        marginBottom: SPACING['2xl'],
    },
    balanceFooter: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    balanceItem: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.md,
    },
    balanceDivider: {
        width: 1,
        height: 32,
        backgroundColor: 'rgba(0,0,0,0.1)',
        marginHorizontal: SPACING.lg,
    },
    balanceIcon: {
        width: 32,
        height: 32,
        borderRadius: RADIUS.sm,
        alignItems: 'center',
        justifyContent: 'center',
    },
    balanceItemLabel: {
        ...TYPOGRAPHY.caption1,
        marginBottom: 2,
    },
    balanceItemValue: {
        ...TYPOGRAPHY.headline,
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
        ...TYPOGRAPHY.caption1,
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
        ...TYPOGRAPHY.headline,
    },
    sectionSubtitle: {
        ...TYPOGRAPHY.caption1,
    },
    seeAll: {
        ...TYPOGRAPHY.subhead,
        fontFamily: FONTS.medium,
    },
    budgetContent: {},
    budgetHeader: {
        flexDirection: 'row',
        alignItems: 'baseline',
        gap: SPACING.sm,
        marginBottom: SPACING.md,
    },
    budgetSpent: {
        ...TYPOGRAPHY.title2,
    },
    budgetTotal: {
        ...TYPOGRAPHY.subhead,
    },
    progressBar: {
        height: 6,
        borderRadius: 3,
        marginBottom: SPACING.sm,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        borderRadius: 3,
    },
    budgetRemaining: {
        ...TYPOGRAPHY.caption1,
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: SPACING['3xl'],
    },
    emptyText: {
        ...TYPOGRAPHY.subhead,
        marginTop: SPACING.md,
    },
    transaction: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: SPACING.md,
    },
    txIcon: {
        width: 36,
        height: 36,
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
        ...TYPOGRAPHY.subhead,
        fontFamily: FONTS.medium,
        marginBottom: 2,
    },
    txDate: {
        ...TYPOGRAPHY.caption1,
    },
    txAmount: {
        ...TYPOGRAPHY.headline,
    },
});
