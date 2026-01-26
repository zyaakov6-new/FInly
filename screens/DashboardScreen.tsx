import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Animated, Modal, useColorScheme, StatusBar, Platform } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Search, Menu, TrendingUp, TrendingDown, Trash2, FileText, AlertCircle, ShoppingCart, X, Home, BarChart3, Settings, User, LogOut, ArrowUpRight, ArrowDownLeft, Info, Plus, ArrowUp, ArrowDown, Camera, Sparkles, Receipt, CreditCard, PieChart, Bell, ChevronLeft } from 'lucide-react-native';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import { LinearGradient } from 'expo-linear-gradient';
import { useTransactions } from '../context/TransactionsContext';
import { useUserProfile } from '../context/UserProfileContext';
import { FONTS, getColors, SPACING, BORDER_RADIUS, SHADOWS, GRADIENTS } from '../constants/theme';
import { formatCurrency, formatPercent, formatNumber } from '../utils/formatters';
import { AccessibleAmount } from '../components/AccessibleAmount';
import { Tooltip } from '../components/Tooltip';

const { width, height } = Dimensions.get('window');

export default function DashboardScreen() {
    const navigation = useNavigation<any>();
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

    const [menuVisible, setMenuVisible] = useState(false);
    const [chartView, setChartView] = useState<'expenses' | 'income'>('expenses');

    // Get dynamic expense progress
    const expenseProgress = useMemo(() => getMonthlyExpenseProgress(), [getMonthlyExpenseProgress]);

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(-width)).current;
    const scaleAnim = useRef(new Animated.Value(0.95)).current;
    const headerAnim = useRef(new Animated.Value(0)).current;

    // Staggered card animations
    const cardAnims = useRef([
        new Animated.Value(0),
        new Animated.Value(0),
        new Animated.Value(0),
        new Animated.Value(0),
        new Animated.Value(0),
    ]).current;

    // Calculate year-over-year growth
    const yearlyGrowth = useMemo(() => {
        const now = new Date();
        const currentYear = now.getFullYear();
        const lastYear = currentYear - 1;

        const currentYearRevenue = transactions
            .filter(tx => {
                const txDate = new Date(tx.date);
                return txDate.getFullYear() === currentYear && tx.isIncome && tx.status === 'paid';
            })
            .reduce((sum, tx) => sum + (parseFloat(tx.amount.replace(/[^\d.-]/g, '')) || 0), 0);

        const lastYearRevenue = transactions
            .filter(tx => {
                const txDate = new Date(tx.date);
                return txDate.getFullYear() === lastYear && tx.isIncome && tx.status === 'paid';
            })
            .reduce((sum, tx) => sum + (parseFloat(tx.amount.replace(/[^\d.-]/g, '')) || 0), 0);

        if (lastYearRevenue === 0) return 0;
        return parseFloat(((currentYearRevenue - lastYearRevenue) / lastYearRevenue * 100).toFixed(1));
    }, [transactions]);

    useFocusEffect(
        useCallback(() => {
            // Reset animations
            fadeAnim.setValue(0);
            scaleAnim.setValue(0.95);
            headerAnim.setValue(0);
            cardAnims.forEach(anim => anim.setValue(0));

            // Start entrance animations
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 400,
                    useNativeDriver: true,
                }),
                Animated.spring(scaleAnim, {
                    toValue: 1,
                    tension: 60,
                    friction: 12,
                    useNativeDriver: true,
                }),
                Animated.timing(headerAnim, {
                    toValue: 1,
                    duration: 500,
                    useNativeDriver: true,
                }),
            ]).start();

            // Staggered card animations
            cardAnims.forEach((anim, index) => {
                Animated.spring(anim, {
                    toValue: 1,
                    tension: 50,
                    friction: 10,
                    delay: index * 80,
                    useNativeDriver: true,
                }).start();
            });
        }, [])
    );

    const openMenu = () => {
        setMenuVisible(true);
        Animated.spring(slideAnim, {
            toValue: 0,
            useNativeDriver: true,
            tension: 65,
            friction: 11,
        }).start();
    };

    const closeMenu = () => {
        Animated.timing(slideAnim, {
            toValue: -width,
            duration: 250,
            useNativeDriver: true,
        }).start(() => setMenuVisible(false));
    };

    const onGestureEvent = (event: any) => {
        const { translationX } = event.nativeEvent;
        if (!menuVisible) {
            if (translationX > 0) {
                slideAnim.setValue(-width + translationX);
            }
        } else {
            if (translationX < 0) {
                slideAnim.setValue(translationX);
            }
        }
    };

    const onHandlerStateChange = (event: any) => {
        if (event.nativeEvent.state === State.END) {
            const { translationX, velocityX } = event.nativeEvent;

            if (!menuVisible) {
                if (translationX > width * 0.25 || velocityX > 500) {
                    openMenu();
                } else {
                    closeMenu();
                }
            } else {
                if (translationX < -width * 0.25 || velocityX < -500) {
                    closeMenu();
                } else {
                    openMenu();
                }
            }
        }
    };

    // Get real transactions for chart - group by month
    const monthlyChartData = useMemo(() => {
        const monthNames = ['ינו', 'פבר', 'מרץ', 'אפר', 'מאי', 'יוני', 'יולי', 'אוג', 'ספט', 'אוק', 'נוב', 'דצמ'];
        const last6Months = [];
        const now = new Date();

        for (let i = 5; i >= 0; i--) {
            const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const monthIndex = date.getMonth();
            const year = date.getFullYear();

            const monthTransactions = transactions.filter(tx => {
                const txDate = new Date(tx.date);
                return txDate.getMonth() === monthIndex &&
                    txDate.getFullYear() === year &&
                    (chartView === 'expenses' ? !tx.isIncome : tx.isIncome) &&
                    tx.status === 'paid';
            });

            const total = monthTransactions.reduce((sum, tx) => {
                const amount = parseFloat(tx.amount.replace(/[^\d.-]/g, '')) || 0;
                return sum + amount;
            }, 0);

            last6Months.push({
                month: monthNames[monthIndex],
                value: total
            });
        }

        return last6Months;
    }, [transactions, chartView]);

    const maxValue = Math.max(...monthlyChartData.map(d => d.value), 1);

    // Get recent transactions (last 3)
    const recentTransactions = useMemo(() => {
        return transactions
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .slice(0, 3);
    }, [transactions]);

    const getCardStyle = (index: number) => ({
        opacity: cardAnims[index],
        transform: [
            { translateY: cardAnims[index].interpolate({ inputRange: [0, 1], outputRange: [30, 0] }) },
            { scale: cardAnims[index].interpolate({ inputRange: [0, 1], outputRange: [0.95, 1] }) },
        ],
    });

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <PanGestureHandler
                onGestureEvent={onGestureEvent}
                onHandlerStateChange={onHandlerStateChange}
                activeOffsetX={[-10, 10]}
            >
                <View style={{ flex: 1 }}>
                    <StatusBar barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'} />

                    {/* Premium Header */}
                    <Animated.View style={[styles.header, { opacity: headerAnim }]}>
                        <View style={styles.headerLeft}>
                            <TouchableOpacity
                                style={[styles.iconButton, { backgroundColor: colors.glass }]}
                                onPress={openMenu}
                                activeOpacity={0.7}
                            >
                                <Menu size={22} color={colors.textPrimary} />
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.iconButton, { backgroundColor: colors.glass }]}
                                activeOpacity={0.7}
                            >
                                <Bell size={22} color={colors.textPrimary} />
                            </TouchableOpacity>
                        </View>
                        <View style={styles.headerRight}>
                            <View style={styles.headerTextContainer}>
                                <Text style={[styles.greeting, { color: colors.textSecondary }]}>שלום,</Text>
                                <Text style={[styles.userName, { color: colors.textPrimary }]}>
                                    {userProfileData?.fullName || 'משתמש'}
                                </Text>
                            </View>
                            <TouchableOpacity onPress={() => navigation.navigate('Settings')} activeOpacity={0.8}>
                                <LinearGradient
                                    colors={GRADIENTS.primary}
                                    style={styles.avatarGradient}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                >
                                    <Text style={styles.avatarText}>
                                        {(userProfileData?.fullName || 'M')[0].toUpperCase()}
                                    </Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>
                    </Animated.View>

                    <ScrollView
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={styles.scrollContent}
                    >
                        {/* Hero Balance Card */}
                        <Animated.View style={[
                            styles.balanceCard,
                            getCardStyle(0),
                            { ...SHADOWS.xlarge, shadowColor: colors.primary }
                        ]}>
                            <TouchableOpacity activeOpacity={0.95} onPress={() => navigation.navigate('PnL')}>
                                <LinearGradient
                                    colors={colorScheme === 'dark'
                                        ? ['#1E3A5F', '#0D1F33', '#0A1628']
                                        : ['#FF6B6B', '#FF8E53', '#FFB347']}
                                    style={styles.balanceGradient}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                >
                                    {/* Decorative elements */}
                                    <View style={styles.balanceDecoration}>
                                        <View style={[styles.decorCircle, styles.decorCircle1]} />
                                        <View style={[styles.decorCircle, styles.decorCircle2]} />
                                    </View>

                                    <View style={styles.balanceHeader}>
                                        <Tooltip text="השוואה בין ההכנסות בשנה הנוכחית לעומת השנה הקודמת" colors={colors}>
                                            <View style={styles.balanceLabelRow}>
                                                <Sparkles size={14} color="rgba(255,255,255,0.7)" />
                                                <Text style={styles.balanceLabel}>מיקוד שנתי</Text>
                                            </View>
                                        </Tooltip>
                                        <View style={[
                                            styles.percentageBadge,
                                            { backgroundColor: yearlyGrowth >= 0 ? 'rgba(0,255,148,0.2)' : 'rgba(255,107,107,0.2)' }
                                        ]}>
                                            {yearlyGrowth >= 0 ? (
                                                <TrendingUp size={14} color="#00FF94" />
                                            ) : (
                                                <TrendingDown size={14} color="#FF6B6B" />
                                            )}
                                            <Text style={[
                                                styles.percentageText,
                                                { color: yearlyGrowth >= 0 ? '#00FF94' : '#FF6B6B' }
                                            ]}>
                                                {formatPercent((yearlyGrowth >= 0 ? '+' : '') + yearlyGrowth)}
                                            </Text>
                                        </View>
                                    </View>

                                    <AccessibleAmount
                                        amount={totalRevenue}
                                        label="סך הכנסות שנתיות"
                                        style={styles.balanceAmount}
                                        colors={colors}
                                    />

                                    <View style={styles.balanceFooter}>
                                        <View style={styles.balanceItem}>
                                            <Text style={styles.balanceItemLabel}>רווח נקי</Text>
                                            <AccessibleAmount
                                                amount={netProfit}
                                                label="רווח נקי"
                                                style={styles.balanceItemValue}
                                                colors={colors}
                                                type="income"
                                            />
                                        </View>
                                        <View style={styles.balanceDivider} />
                                        <View style={styles.balanceItem}>
                                            <Tooltip text="היחס בין הרווח הנקי לסך ההכנסות" colors={colors}>
                                                <View style={styles.balanceLabelRow}>
                                                    <Text style={styles.balanceItemLabel}>מתח רווח</Text>
                                                </View>
                                            </Tooltip>
                                            <Text style={styles.balanceItemValue}>{formatPercent(profitMargin)}</Text>
                                        </View>
                                    </View>
                                </LinearGradient>
                            </TouchableOpacity>
                        </Animated.View>

                        {/* Quick Actions Grid */}
                        <Animated.View style={[styles.quickActionsContainer, getCardStyle(1)]}>
                            <View style={styles.quickActions}>
                                <TouchableOpacity
                                    style={[styles.quickAction, { backgroundColor: colors.infoLight }]}
                                    onPress={() => navigation.navigate('CreateInvoice')}
                                    activeOpacity={0.8}
                                >
                                    <View style={[styles.quickActionIcon, { backgroundColor: colors.info }]}>
                                        <ArrowDownLeft size={22} color="#fff" />
                                    </View>
                                    <Text style={[styles.quickActionText, { color: colors.textPrimary }]}>הכנסה</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[styles.quickAction, { backgroundColor: colors.dangerLight }]}
                                    onPress={() => navigation.navigate('AddExpense')}
                                    activeOpacity={0.8}
                                >
                                    <View style={[styles.quickActionIcon, { backgroundColor: colors.danger }]}>
                                        <ArrowUpRight size={22} color="#fff" />
                                    </View>
                                    <Text style={[styles.quickActionText, { color: colors.textPrimary }]}>הוצאה</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[styles.quickAction, { backgroundColor: colors.successLight }]}
                                    onPress={() => navigation.navigate('ReceiptGallery')}
                                    activeOpacity={0.8}
                                >
                                    <View style={[styles.quickActionIcon, { backgroundColor: colors.success }]}>
                                        <Camera size={22} color="#fff" />
                                    </View>
                                    <Text style={[styles.quickActionText, { color: colors.textPrimary }]}>סריקה</Text>
                                </TouchableOpacity>
                            </View>
                        </Animated.View>

                        {/* Monthly Summary Card */}
                        <Animated.View style={[styles.section, getCardStyle(2)]}>
                            <View style={styles.sectionHeader}>
                                <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>סיכום חודשי</Text>
                                <TouchableOpacity style={[styles.dateBadge, { backgroundColor: colors.glass }]}>
                                    <FileText size={14} color={colors.success} />
                                    <Text style={[styles.dateText, { color: colors.textSecondary }]}>
                                        {new Date().toLocaleDateString('he-IL', { month: 'long', year: 'numeric' })}
                                    </Text>
                                </TouchableOpacity>
                            </View>

                            <TouchableOpacity
                                style={[styles.summaryCard, {
                                    backgroundColor: colors.surface,
                                    borderColor: colors.border,
                                    ...SHADOWS.medium
                                }]}
                                activeOpacity={0.95}
                                onPress={() => navigation.navigate('ExpensesList')}
                            >
                                <View style={styles.summaryContent}>
                                    <View style={styles.summaryHeader}>
                                        <View style={styles.summaryAmountRow}>
                                            <AccessibleAmount
                                                amount={expenseProgress.current}
                                                label="הוצאות החודש"
                                                style={[styles.summaryAmount, { color: colors.textPrimary }]}
                                                colors={colors}
                                            />
                                            <Text style={[styles.summarySubtext, { color: colors.textTertiary }]}>
                                                / {formatCurrency(expenseProgress.limit)}
                                            </Text>
                                        </View>
                                        <View style={[styles.summaryBadge, { backgroundColor: colors.successLight }]}>
                                            <Text style={[styles.summaryBadgeText, { color: colors.success }]}>
                                                {formatPercent(expenseProgress.percentage)}
                                            </Text>
                                        </View>
                                    </View>

                                    {/* Beautiful Progress Bar */}
                                    <View style={styles.progressContainer}>
                                        <View style={[styles.progressBar, { backgroundColor: colors.divider }]}>
                                            <LinearGradient
                                                colors={expenseProgress.percentage > 80
                                                    ? GRADIENTS.warning
                                                    : GRADIENTS.success}
                                                style={[styles.progressFill, { width: `${Math.min(expenseProgress.percentage, 100)}%` }]}
                                                start={{ x: 0, y: 0 }}
                                                end={{ x: 1, y: 0 }}
                                            />
                                        </View>
                                    </View>

                                    <Text style={[styles.summaryNote, { color: colors.textTertiary }]}>
                                        {expenseProgress.percentage > 90
                                            ? 'קרוב למכסה - שים לב להוצאות'
                                            : 'הוצאות בטווח היעדים'}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        </Animated.View>

                        {/* Monthly Chart Section */}
                        <Animated.View style={[styles.section, getCardStyle(3)]}>
                            <View style={styles.sectionHeader}>
                                <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>תנועה חודשית</Text>
                                <View style={[styles.chartTabs, { backgroundColor: colors.glass }]}>
                                    <TouchableOpacity
                                        style={[
                                            styles.chartTab,
                                            chartView === 'expenses' && styles.chartTabActive,
                                            chartView === 'expenses' && { backgroundColor: colors.success }
                                        ]}
                                        onPress={() => setChartView('expenses')}
                                    >
                                        <Text style={[
                                            styles.chartTabText,
                                            { color: chartView === 'expenses' ? '#fff' : colors.textSecondary }
                                        ]}>
                                            הוצאות
                                        </Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[
                                            styles.chartTab,
                                            chartView === 'income' && styles.chartTabActive,
                                            chartView === 'income' && { backgroundColor: colors.info }
                                        ]}
                                        onPress={() => setChartView('income')}
                                    >
                                        <Text style={[
                                            styles.chartTabText,
                                            { color: chartView === 'income' ? '#fff' : colors.textSecondary }
                                        ]}>
                                            הכנסות
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </View>

                            <TouchableOpacity
                                style={[styles.chartCard, {
                                    backgroundColor: colors.surface,
                                    borderColor: colors.border,
                                    ...SHADOWS.medium
                                }]}
                                activeOpacity={0.95}
                                onPress={() => navigation.navigate('PnL')}
                            >
                                <View style={styles.chart}>
                                    {monthlyChartData.map((item, index) => (
                                        <View key={index} style={styles.chartBar}>
                                            <View style={styles.chartBarContainer}>
                                                <LinearGradient
                                                    colors={chartView === 'expenses'
                                                        ? (index === monthlyChartData.length - 1 ? GRADIENTS.success : ['rgba(0,255,148,0.4)', 'rgba(0,255,148,0.2)'])
                                                        : (index === monthlyChartData.length - 1 ? GRADIENTS.secondary : ['rgba(0,212,255,0.4)', 'rgba(0,212,255,0.2)'])}
                                                    style={[
                                                        styles.chartBarFill,
                                                        { height: item.value > 0 ? `${(item.value / maxValue) * 100}%` : '5%' }
                                                    ]}
                                                    start={{ x: 0, y: 1 }}
                                                    end={{ x: 0, y: 0 }}
                                                />
                                            </View>
                                            <Text style={[styles.chartLabel, { color: colors.textTertiary }]}>{item.month}</Text>
                                        </View>
                                    ))}
                                </View>
                            </TouchableOpacity>
                        </Animated.View>

                        {/* Recent Transactions Section */}
                        <Animated.View style={[styles.section, getCardStyle(4)]}>
                            <View style={styles.sectionHeader}>
                                <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>פעילות אחרונה</Text>
                                <TouchableOpacity onPress={() => navigation.navigate('AllActivity')}>
                                    <View style={styles.seeAllButton}>
                                        <Text style={[styles.seeAllText, { color: colors.info }]}>צפה בהכל</Text>
                                        <ChevronLeft size={16} color={colors.info} />
                                    </View>
                                </TouchableOpacity>
                            </View>

                            {recentTransactions.length > 0 ? (
                                recentTransactions.map((transaction, index) => (
                                    <TouchableOpacity
                                        key={transaction.id}
                                        style={[styles.transactionCard, {
                                            backgroundColor: colors.surface,
                                            borderColor: colors.border,
                                            ...SHADOWS.small
                                        }]}
                                        onPress={() => {
                                            if (transaction.isIncome) {
                                                navigation.navigate('InvoiceDetails', { transactionId: transaction.id });
                                            } else {
                                                navigation.navigate('AddExpense', { transactionId: transaction.id });
                                            }
                                        }}
                                        activeOpacity={0.8}
                                    >
                                        <View style={styles.transactionLeft}>
                                            <LinearGradient
                                                colors={transaction.isIncome
                                                    ? GRADIENTS.secondary
                                                    : transaction.status === 'overdue'
                                                        ? GRADIENTS.warning
                                                        : GRADIENTS.primary}
                                                style={styles.transactionIcon}
                                                start={{ x: 0, y: 0 }}
                                                end={{ x: 1, y: 1 }}
                                            >
                                                {transaction.isIncome ? (
                                                    <ArrowDownLeft size={18} color="#fff" />
                                                ) : transaction.status === 'overdue' ? (
                                                    <AlertCircle size={18} color="#fff" />
                                                ) : (
                                                    <ArrowUpRight size={18} color="#fff" />
                                                )}
                                            </LinearGradient>
                                            <View style={styles.transactionInfo}>
                                                <Text style={[styles.transactionTitle, { color: colors.textPrimary }]} numberOfLines={1}>
                                                    {transaction.title}
                                                </Text>
                                                <View style={styles.transactionMeta}>
                                                    <Text style={[styles.transactionDate, { color: colors.textTertiary }]}>
                                                        {new Date(transaction.date).toLocaleDateString('he-IL', { day: 'numeric', month: 'short' })}
                                                    </Text>
                                                    <View style={[styles.statusDot, {
                                                        backgroundColor: transaction.status === 'paid'
                                                            ? colors.success
                                                            : transaction.status === 'overdue'
                                                                ? colors.warning
                                                                : colors.textTertiary
                                                    }]} />
                                                    <Text style={[styles.transactionStatus, { color: colors.textTertiary }]}>
                                                        {transaction.status === 'paid' ? 'שולם' :
                                                            transaction.status === 'pending' ? 'ממתין' :
                                                                transaction.status === 'overdue' ? 'באיחור' : 'טיוטה'}
                                                    </Text>
                                                </View>
                                            </View>
                                        </View>
                                        <Text style={[
                                            styles.transactionAmount,
                                            { color: transaction.isIncome ? colors.success : colors.textPrimary }
                                        ]}>
                                            {transaction.isIncome ? '+' : '-'}{formatNumber(transaction.amount)}
                                        </Text>
                                    </TouchableOpacity>
                                ))
                            ) : (
                                <View style={[styles.emptyState, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                                    <Receipt size={48} color={colors.textTertiary} />
                                    <Text style={[styles.emptyStateTitle, { color: colors.textSecondary }]}>אין פעילות עדיין</Text>
                                    <Text style={[styles.emptyStateText, { color: colors.textTertiary }]}>התחל להוסיף הוצאות והכנסות</Text>
                                    <TouchableOpacity
                                        style={[styles.addButton]}
                                        onPress={() => navigation.navigate('AddExpense')}
                                    >
                                        <LinearGradient
                                            colors={GRADIENTS.primary}
                                            style={styles.addButtonGradient}
                                            start={{ x: 0, y: 0 }}
                                            end={{ x: 1, y: 0 }}
                                        >
                                            <Plus size={18} color="#fff" />
                                            <Text style={styles.addButtonText}>הוסף הוצאה</Text>
                                        </LinearGradient>
                                    </TouchableOpacity>
                                </View>
                            )}
                        </Animated.View>

                        <View style={{ height: 120 }} />
                    </ScrollView>
                </View>
            </PanGestureHandler>

            {/* Side Menu Overlay */}
            {menuVisible && (
                <TouchableOpacity
                    activeOpacity={1}
                    style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 99 }]}
                    onPress={closeMenu}
                />
            )}

            {/* Side Menu */}
            <PanGestureHandler
                onGestureEvent={onGestureEvent}
                onHandlerStateChange={onHandlerStateChange}
                activeOffsetX={[-10, 10]}
            >
                <Animated.View
                    style={[
                        styles.menuContainer,
                        {
                            transform: [{ translateX: slideAnim }],
                            position: 'absolute',
                            top: 0,
                            bottom: 0,
                            left: 0,
                            zIndex: 100,
                            backgroundColor: colors.surface,
                        }
                    ]}
                >
                    {/* Close Button */}
                    <TouchableOpacity onPress={closeMenu} style={[styles.closeButton, { backgroundColor: colors.glass }]}>
                        <X size={22} color={colors.textPrimary} />
                    </TouchableOpacity>

                    {/* Menu Header */}
                    <LinearGradient
                        colors={colorScheme === 'dark' ? ['#1E3A5F', '#0D1F33'] : GRADIENTS.primary}
                        style={styles.menuHeader}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                    >
                        <View style={styles.menuProfile}>
                            <View style={styles.menuAvatarContainer}>
                                <LinearGradient
                                    colors={['rgba(255,255,255,0.3)', 'rgba(255,255,255,0.1)']}
                                    style={styles.menuAvatar}
                                >
                                    <Text style={styles.menuAvatarText}>
                                        {(userProfileData?.fullName || 'M')[0].toUpperCase()}
                                    </Text>
                                </LinearGradient>
                            </View>
                            <Text style={styles.menuName}>{userProfileData?.fullName || 'משתמש'}</Text>
                            <Text style={styles.menuEmail}>{userProfileData?.email || 'user@finly.com'}</Text>
                        </View>
                    </LinearGradient>

                    {/* Menu Items */}
                    <ScrollView
                        style={styles.menuItems}
                        contentContainerStyle={styles.menuItemsContent}
                        showsVerticalScrollIndicator={false}
                    >
                        <TouchableOpacity
                            style={[styles.menuItem, { backgroundColor: colors.glass }]}
                            onPress={() => { closeMenu(); navigation.navigate('Settings'); }}
                        >
                            <View style={[styles.menuItemIcon, { backgroundColor: colors.infoLight }]}>
                                <Settings size={20} color={colors.info} />
                            </View>
                            <Text style={[styles.menuItemText, { color: colors.textPrimary }]}>הגדרות עסק</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.menuItem, { backgroundColor: colors.glass }]}
                            onPress={() => { closeMenu(); navigation.navigate('Settings'); }}
                        >
                            <View style={[styles.menuItemIcon, { backgroundColor: colors.successLight }]}>
                                <User size={20} color={colors.success} />
                            </View>
                            <Text style={[styles.menuItemText, { color: colors.textPrimary }]}>פרופיל אישי</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.menuItem, { backgroundColor: colors.glass }]}
                            onPress={() => { closeMenu(); navigation.navigate('Goals'); }}
                        >
                            <View style={[styles.menuItemIcon, { backgroundColor: colors.warningLight }]}>
                                <PieChart size={20} color={colors.warning} />
                            </View>
                            <Text style={[styles.menuItemText, { color: colors.textPrimary }]}>יעדים פיננסיים</Text>
                        </TouchableOpacity>

                        <View style={[styles.menuDivider, { backgroundColor: colors.divider }]} />

                        <TouchableOpacity
                            style={[styles.menuItem, { backgroundColor: colors.dangerLight }]}
                            onPress={() => { closeMenu(); navigation.navigate('Login'); }}
                        >
                            <View style={[styles.menuItemIcon, { backgroundColor: colors.dangerLight }]}>
                                <LogOut size={20} color={colors.danger} />
                            </View>
                            <Text style={[styles.menuItemText, { color: colors.danger }]}>התנתק</Text>
                        </TouchableOpacity>
                    </ScrollView>
                </Animated.View>
            </PanGestureHandler>
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
        paddingHorizontal: 20,
        paddingTop: Platform.OS === 'ios' ? 60 : 50,
        paddingBottom: 16,
    },
    headerLeft: {
        flexDirection: 'row',
        gap: 12,
    },
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
    },
    headerTextContainer: {
        alignItems: 'flex-end',
    },
    iconButton: {
        width: 44,
        height: 44,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
    greeting: {
        fontSize: 12,
        fontFamily: FONTS.regular,
    },
    userName: {
        fontSize: 16,
        fontFamily: FONTS.bold,
    },
    avatarGradient: {
        width: 46,
        height: 46,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarText: {
        fontSize: 20,
        fontFamily: FONTS.bold,
        color: '#fff',
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingTop: 8,
    },
    balanceCard: {
        marginBottom: 24,
        borderRadius: 28,
        overflow: 'hidden',
    },
    balanceGradient: {
        padding: 24,
        paddingTop: 28,
        position: 'relative',
        overflow: 'hidden',
    },
    balanceDecoration: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    decorCircle: {
        position: 'absolute',
        borderRadius: 999,
        backgroundColor: 'rgba(255,255,255,0.08)',
    },
    decorCircle1: {
        width: 150,
        height: 150,
        top: -50,
        right: -30,
    },
    decorCircle2: {
        width: 100,
        height: 100,
        bottom: -30,
        left: -20,
    },
    balanceHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    balanceLabelRow: {
        flexDirection: 'row-reverse',
        alignItems: 'center',
        gap: 6,
    },
    balanceLabel: {
        fontSize: 13,
        fontFamily: FONTS.medium,
        color: 'rgba(255,255,255,0.7)',
    },
    percentageBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        gap: 4,
    },
    percentageText: {
        fontSize: 13,
        fontFamily: FONTS.bold,
    },
    balanceAmount: {
        fontSize: 42,
        fontFamily: FONTS.bold,
        color: '#fff',
        textAlign: 'center',
        marginBottom: 24,
    },
    balanceFooter: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.15)',
        borderRadius: 16,
        padding: 16,
    },
    balanceItem: {
        flex: 1,
        alignItems: 'center',
    },
    balanceDivider: {
        width: 1,
        height: 36,
        backgroundColor: 'rgba(255,255,255,0.15)',
    },
    balanceItemLabel: {
        fontSize: 12,
        fontFamily: FONTS.regular,
        color: 'rgba(255,255,255,0.6)',
        marginBottom: 6,
    },
    balanceItemValue: {
        fontSize: 20,
        fontFamily: FONTS.bold,
        color: '#fff',
    },
    quickActionsContainer: {
        marginBottom: 24,
    },
    quickActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 12,
    },
    quickAction: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 18,
        borderRadius: 20,
        gap: 10,
    },
    quickActionIcon: {
        width: 48,
        height: 48,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    quickActionText: {
        fontSize: 13,
        fontFamily: FONTS.semiBold,
    },
    section: {
        marginBottom: 24,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 14,
    },
    sectionTitle: {
        fontSize: 18,
        fontFamily: FONTS.bold,
    },
    dateBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
        gap: 6,
    },
    dateText: {
        fontSize: 12,
        fontFamily: FONTS.medium,
    },
    summaryCard: {
        borderRadius: 20,
        borderWidth: 1,
        overflow: 'hidden',
    },
    summaryContent: {
        padding: 20,
    },
    summaryHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    summaryAmountRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
        gap: 4,
    },
    summaryAmount: {
        fontSize: 28,
        fontFamily: FONTS.bold,
    },
    summarySubtext: {
        fontSize: 14,
        fontFamily: FONTS.regular,
    },
    summaryBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    summaryBadgeText: {
        fontSize: 14,
        fontFamily: FONTS.bold,
    },
    progressContainer: {
        marginBottom: 12,
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
    summaryNote: {
        fontSize: 12,
        fontFamily: FONTS.regular,
        textAlign: 'right',
    },
    chartTabs: {
        flexDirection: 'row',
        borderRadius: 12,
        padding: 4,
    },
    chartTab: {
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderRadius: 8,
    },
    chartTabActive: {},
    chartTabText: {
        fontSize: 12,
        fontFamily: FONTS.semiBold,
    },
    chartCard: {
        borderRadius: 20,
        padding: 20,
        borderWidth: 1,
    },
    chart: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        height: 150,
    },
    chartBar: {
        flex: 1,
        alignItems: 'center',
        gap: 8,
    },
    chartBarContainer: {
        flex: 1,
        width: '65%',
        justifyContent: 'flex-end',
    },
    chartBarFill: {
        width: '100%',
        borderRadius: 6,
        minHeight: 8,
    },
    chartLabel: {
        fontSize: 11,
        fontFamily: FONTS.medium,
    },
    seeAllButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 2,
    },
    seeAllText: {
        fontSize: 13,
        fontFamily: FONTS.semiBold,
    },
    transactionCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderRadius: 16,
        padding: 14,
        marginBottom: 10,
        borderWidth: 1,
    },
    transactionLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        flex: 1,
    },
    transactionIcon: {
        width: 44,
        height: 44,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
    transactionInfo: {
        flex: 1,
    },
    transactionTitle: {
        fontSize: 15,
        fontFamily: FONTS.semiBold,
        marginBottom: 4,
        textAlign: 'right',
    },
    transactionMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    transactionDate: {
        fontSize: 12,
        fontFamily: FONTS.regular,
    },
    statusDot: {
        width: 4,
        height: 4,
        borderRadius: 2,
    },
    transactionStatus: {
        fontSize: 12,
        fontFamily: FONTS.regular,
    },
    transactionAmount: {
        fontSize: 16,
        fontFamily: FONTS.bold,
    },
    emptyState: {
        borderRadius: 20,
        padding: 32,
        alignItems: 'center',
        borderWidth: 1,
    },
    emptyStateTitle: {
        fontSize: 16,
        fontFamily: FONTS.semiBold,
        marginTop: 16,
        marginBottom: 4,
    },
    emptyStateText: {
        fontSize: 14,
        fontFamily: FONTS.regular,
        marginBottom: 20,
    },
    addButton: {
        borderRadius: 14,
        overflow: 'hidden',
    },
    addButtonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingHorizontal: 20,
        paddingVertical: 12,
    },
    addButtonText: {
        fontSize: 14,
        fontFamily: FONTS.bold,
        color: '#fff',
    },
    // Menu Styles
    menuContainer: {
        width: width * 0.78,
        height: '100%',
        shadowColor: '#000',
        shadowOffset: { width: 4, height: 0 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 20,
    },
    closeButton: {
        position: 'absolute',
        top: Platform.OS === 'ios' ? 56 : 16,
        left: 16,
        zIndex: 10,
        width: 40,
        height: 40,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    menuHeader: {
        paddingTop: Platform.OS === 'ios' ? 80 : 60,
        paddingHorizontal: 24,
        paddingBottom: 28,
    },
    menuProfile: {
        alignItems: 'center',
    },
    menuAvatarContainer: {
        marginBottom: 16,
    },
    menuAvatar: {
        width: 80,
        height: 80,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    menuAvatarText: {
        fontSize: 32,
        fontFamily: FONTS.bold,
        color: '#fff',
    },
    menuName: {
        fontSize: 20,
        fontFamily: FONTS.bold,
        color: '#fff',
        marginBottom: 4,
    },
    menuEmail: {
        fontSize: 14,
        fontFamily: FONTS.regular,
        color: 'rgba(255,255,255,0.7)',
    },
    menuItems: {
        flex: 1,
    },
    menuItemsContent: {
        padding: 20,
        gap: 10,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 14,
        borderRadius: 14,
        gap: 14,
    },
    menuItemIcon: {
        width: 40,
        height: 40,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    menuItemText: {
        fontSize: 16,
        fontFamily: FONTS.semiBold,
    },
    menuDivider: {
        height: 1,
        marginVertical: 10,
    },
});
