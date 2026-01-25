import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Animated, Modal, useColorScheme, StatusBar } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Search, Menu, TrendingUp, Trash2, FileText, AlertCircle, ShoppingCart, X, Home, BarChart3, Settings, User, LogOut, ArrowUpRight, ArrowDownLeft, Info, Plus, ArrowUp, ArrowDown, Camera } from 'lucide-react-native';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import { LinearGradient } from 'expo-linear-gradient';
import { useTransactions } from '../context/TransactionsContext';
import { useUserProfile } from '../context/UserProfileContext';
import { FONTS, getColors } from '../constants/theme';
import { formatCurrency, formatPercent, formatNumber } from '../utils/formatters';
import { AccessibleAmount } from '../components/AccessibleAmount';
import { Tooltip } from '../components/Tooltip';

const { width } = Dimensions.get('window');

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
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 600,
                useNativeDriver: true,
            }).start();

            // Re-opening the menu if it was open could be tricky, 
            // but usually we just want to ensure layout sync
        }, [])
    );

    const openMenu = () => {
        setMenuVisible(true);
        Animated.spring(slideAnim, {
            toValue: 0,
            useNativeDriver: true,
            tension: 50,
            friction: 8,
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
        // Only allow pulling from the left if menu is closed
        if (!menuVisible) {
            if (translationX > 0) {
                slideAnim.setValue(-width + translationX);
            }
        } else {
            // Allow pushing back to the left if menu is open
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

            // Filter transactions for this month
            const monthTransactions = transactions.filter(tx => {
                const txDate = new Date(tx.date);
                return txDate.getMonth() === monthIndex &&
                    txDate.getFullYear() === year &&
                    (chartView === 'expenses' ? !tx.isIncome : tx.isIncome) &&
                    tx.status === 'paid';
            });

            // Sum up the amounts
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

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <PanGestureHandler
                onGestureEvent={onGestureEvent}
                onHandlerStateChange={onHandlerStateChange}
                activeOffsetX={[-10, 10]}
            >
                <View style={{ flex: 1 }}>
                    <StatusBar barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'} />
                    {/* Header */}
                    <View style={styles.header}>
                        <View style={styles.headerLeft}>
                            <TouchableOpacity
                                style={[styles.iconButton, { backgroundColor: colors.divider }]}
                                onPress={openMenu}
                            >
                                <Menu size={24} color={colors.textPrimary} />
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.iconButton, { backgroundColor: colors.divider }]}
                            >
                                <Search size={24} color={colors.textPrimary} />
                            </TouchableOpacity>
                        </View>
                        <View style={styles.headerRight}>
                            <Text style={[styles.greeting, { color: colors.textPrimary }]}>
                                {userProfileData?.fullName || 'זיו המלך'}
                            </Text>
                            <TouchableOpacity onPress={() => navigation.navigate('Settings')}>
                                <View style={styles.avatar}>
                                    <Text style={styles.avatarText}>👤</Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <ScrollView
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={styles.scrollContent}
                    >
                        {/* Main Balance Card */}
                        <Animated.View style={[styles.balanceCard, { opacity: fadeAnim }]}>
                            <TouchableOpacity activeOpacity={0.9} onPress={() => navigation.navigate('PnL')}>
                                <LinearGradient
                                    colors={colorScheme === 'dark' ? ['#1a4d3e', '#0f3329', '#0a2419'] : ['#FD7979', '#FDACAC', '#FFCDC9']}
                                    style={styles.balanceGradient}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                >
                                    <View style={styles.balanceHeader}>
                                        <Tooltip text="השוואה בין ההכנסות בשנה הנוכחית לעומת השנה הקודמת" colors={colors}>
                                            <View style={{ flexDirection: 'row-reverse', alignItems: 'center', gap: 4 }}>
                                                <Text style={styles.balanceLabel}>מיקוד שנתי</Text>
                                                <Info size={12} color="rgba(255,255,255,0.6)" />
                                            </View>
                                        </Tooltip>
                                        <View style={styles.percentageBadge}>
                                            <TrendingUp size={12} color="#00ff88" />
                                            <Text style={styles.percentageText}>
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
                                        <View style={styles.balanceItem}>
                                            <Tooltip text="היחס בין הרווח הנקי לסך ההכנסות" colors={colors}>
                                                <View style={{ flexDirection: 'row-reverse', alignItems: 'center', gap: 4 }}>
                                                    <Text style={styles.balanceItemLabel}>מתח רווח</Text>
                                                    <Info size={10} color="rgba(255,255,255,0.5)" />
                                                </View>
                                            </Tooltip>
                                            <Text style={styles.balanceItemValue}>{formatPercent(profitMargin)}</Text>
                                        </View>
                                    </View>
                                </LinearGradient>
                            </TouchableOpacity>
                        </Animated.View>

                        {/* Quick Actions */}
                        <View style={styles.quickActions}>
                            <TouchableOpacity
                                style={[styles.quickAction, { backgroundColor: colors.info + '15' }]}
                                onPress={() => navigation.navigate('CreateInvoice')}
                            >
                                <View style={[styles.quickActionIcon, { backgroundColor: colors.info }]}>
                                    <ArrowDown size={20} color="#fff" />
                                </View>
                                <Text style={[styles.quickActionText, { color: colors.textPrimary }]}>הכנסה</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.quickAction, { backgroundColor: colors.primary + '15' }]}
                                onPress={() => navigation.navigate('AddExpense')}
                            >
                                <View style={[styles.quickActionIcon, { backgroundColor: colors.primary }]}>
                                    <Plus size={20} color="#fff" />
                                </View>
                                <Text style={[styles.quickActionText, { color: colors.textPrimary }]}>הוצאה</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.quickAction, { backgroundColor: colors.success + '15' }]}
                                onPress={() => navigation.navigate('ReceiptGallery')}
                            >
                                <View style={[styles.quickActionIcon, { backgroundColor: colors.success }]}>
                                    <Camera size={20} color="#fff" />
                                </View>
                                <Text style={[styles.quickActionText, { color: colors.textPrimary }]}>סריקה</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Monthly Summary Section */}
                        <View style={styles.section}>
                            <View style={styles.sectionHeader}>
                                <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>סיכום חודשי</Text>
                                <TouchableOpacity>
                                    <View style={[styles.dateBadge, { backgroundColor: colors.divider }]}>
                                        <FileText size={16} color={colors.success} />
                                        <Text style={[styles.dateText, { color: colors.textSecondary }]}>
                                            {new Date().toLocaleDateString('he-IL', { month: 'long', year: 'numeric' })}
                                        </Text>
                                    </View>
                                </TouchableOpacity>
                            </View>

                            <TouchableOpacity
                                style={[styles.summaryCard, { backgroundColor: colors.surfaceLight, borderColor: colors.border }]}
                                activeOpacity={0.9}
                                onPress={() => navigation.navigate('ExpensesList')}
                            >
                                <View style={styles.summaryHeader}>
                                    <AccessibleAmount
                                        amount={expenseProgress.current}
                                        label="הוצאות החודש"
                                        style={[styles.summaryAmount, { color: colors.textPrimary }]}
                                        colors={colors}
                                    />
                                    <Text style={[styles.summarySubtext, { color: colors.textTertiary }]}>
                                        מתוך {formatCurrency(expenseProgress.limit)}
                                    </Text>
                                </View>
                                <Text style={[styles.summaryLabel, { color: colors.success }]}>
                                    נוצלו {formatPercent(expenseProgress.percentage)} מהתקציב
                                </Text>

                                {/* Progress Bar */}
                                <View style={[styles.progressBar, { backgroundColor: colors.divider }]}>
                                    <View style={[styles.progressFill, { width: `${expenseProgress.percentage}%`, backgroundColor: colors.success }]} />
                                </View>

                                <Text style={[styles.summaryNote, { color: colors.textSecondary }]}>
                                    {expenseProgress.percentage > 90
                                        ? 'שים לב, אתה מתקרב למכסת ההוצאות החודשית שהגדרת.'
                                        : 'ההוצאות שלך נמצאות בטווח היעדים שהגדרת לחודש זה.'}
                                </Text>
                            </TouchableOpacity>
                        </View>

                        {/* Monthly Chart Section */}
                        <View style={styles.section}>
                            <View style={styles.sectionHeader}>
                                <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>תנועה חודשית</Text>
                                <View style={[styles.chartTabs, { backgroundColor: colors.divider }]}>
                                    <TouchableOpacity
                                        style={[styles.chartTab, chartView === 'expenses' && { backgroundColor: colors.success }]}
                                        onPress={() => setChartView('expenses')}
                                    >
                                        <Text style={[
                                            chartView === 'expenses' ? styles.chartTabTextActive : styles.chartTabText,
                                            { color: chartView === 'expenses' ? colors.background : colors.textSecondary }
                                        ]}>
                                            הוצאות
                                        </Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[styles.chartTab, chartView === 'income' && { backgroundColor: colors.info }]}
                                        onPress={() => setChartView('income')}
                                    >
                                        <Text style={[
                                            chartView === 'income' ? styles.chartTabTextActive : styles.chartTabText,
                                            { color: chartView === 'income' ? colors.background : colors.textSecondary }
                                        ]}>
                                            הכנסות
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </View>

                            <TouchableOpacity
                                style={[styles.chartCard, { backgroundColor: colors.surfaceLight, borderColor: colors.border }]}
                                activeOpacity={0.9}
                                onPress={() => navigation.navigate('PnL')}
                            >
                                <View style={styles.chart}>
                                    {monthlyChartData.map((item, index) => (
                                        <View key={index} style={styles.chartBar}>
                                            <View style={styles.chartBarContainer}>
                                                <View
                                                    style={[
                                                        styles.chartBarFill,
                                                        {
                                                            height: item.value > 0 ? `${(item.value / maxValue) * 100}%` : '5%',
                                                            backgroundColor: index === monthlyChartData.length - 1
                                                                ? (chartView === 'expenses' ? colors.success : colors.info)
                                                                : (chartView === 'expenses' ? 'rgba(0,255,136,0.3)' : 'rgba(74,158,255,0.3)')
                                                        }
                                                    ]}
                                                />
                                            </View>
                                            <Text style={[styles.chartLabel, { color: colors.textTertiary }]}>{item.month}</Text>
                                        </View>
                                    ))}
                                </View>
                            </TouchableOpacity>
                        </View>

                        {/* Transactions Section */}
                        <View style={styles.section}>
                            <View style={styles.sectionHeader}>
                                <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>תשבוניות אחרונות</Text>
                                <TouchableOpacity onPress={() => navigation.navigate('AllActivity')}>
                                    <Text style={[styles.seeAllText, { color: colors.info }]}>צפה בהכל</Text>
                                </TouchableOpacity>
                            </View>

                            {/* Real Transaction Items from user data */}
                            {recentTransactions.length > 0 ? (
                                recentTransactions.map((transaction) => (
                                    <TouchableOpacity
                                        key={transaction.id}
                                        style={[styles.transactionCard, { backgroundColor: colors.surfaceLight, borderColor: colors.border }]}
                                        onPress={() => {
                                            if (transaction.isIncome) {
                                                navigation.navigate('InvoiceDetails', { transactionId: transaction.id });
                                            } else {
                                                navigation.navigate('AddExpense', { transactionId: transaction.id });
                                            }
                                        }}
                                    >
                                        <View style={styles.transactionLeft}>
                                            <View style={[
                                                styles.transactionIcon,
                                                {
                                                    backgroundColor: transaction.isIncome
                                                        ? 'rgba(74,158,255,0.1)'
                                                        : transaction.status === 'overdue'
                                                            ? 'rgba(255,154,74,0.1)'
                                                            : 'rgba(170,170,170,0.1)'
                                                }
                                            ]}>
                                                {transaction.isIncome ? (
                                                    <ArrowDownLeft size={20} color={colors.info} />
                                                ) : transaction.status === 'overdue' ? (
                                                    <AlertCircle size={20} color={colors.warning} />
                                                ) : (
                                                    <ArrowUpRight size={20} color={colors.textTertiary} />
                                                )}
                                            </View>
                                            <View>
                                                <Text style={[styles.transactionTitle, { color: colors.textPrimary }]}>{transaction.title}</Text>
                                                <Text style={[styles.transactionDate, { color: colors.textTertiary }]}>
                                                    {formatNumber(transaction.amount)} |
                                                    {transaction.status === 'paid' ? ' שולם' :
                                                        transaction.status === 'pending' ? ' ממתין' :
                                                            transaction.status === 'overdue' ? ' באיחור' : ' טיוטה'}
                                                </Text>
                                            </View>
                                        </View>
                                        <AccessibleAmount
                                            amount={transaction.amount}
                                            label={`סכום ${transaction.isIncome ? 'הכנסה' : 'הוצאה'}`}
                                            style={[
                                                styles.transactionAmount,
                                                { color: transaction.status === 'overdue' ? colors.warning : colors.textPrimary }
                                            ]}
                                            colors={colors}
                                            type={transaction.isIncome ? 'income' : 'expense'}
                                        />
                                    </TouchableOpacity>
                                ))
                            ) : (
                                <View style={styles.emptyState}>
                                    <Text style={styles.emptyStateText}>אין תשבוניות אחרונות</Text>
                                    <TouchableOpacity
                                        style={styles.addButton}
                                        onPress={() => navigation.navigate('AddExpense')}
                                    >
                                        <Text style={styles.addButtonText}>הוסף הוצאה</Text>
                                    </TouchableOpacity>
                                </View>
                            )}
                        </View>

                        <View style={{ height: 100 }} />
                    </ScrollView>
                </View>
            </PanGestureHandler>

            {/* Side Menu Overlay - Custom Implementation instead of Modal */}
            {menuVisible && (
                <TouchableOpacity
                    activeOpacity={1}
                    style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 99 }]}
                    onPress={closeMenu}
                />
            )}

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
                            zIndex: 100
                        }
                    ]}
                >
                    <View style={[styles.menuGradient, { backgroundColor: colors.surface }]}>
                        {/* Close Button */}
                        <TouchableOpacity onPress={closeMenu} style={[styles.closeButton, { backgroundColor: colors.divider }]}>
                            <X size={24} color={colors.textPrimary} />
                        </TouchableOpacity>

                        {/* Menu Header */}
                        <View style={[styles.menuHeader, { backgroundColor: colorScheme === 'dark' ? '#0f3329' : colors.primary }]}>
                            <View style={styles.menuProfile}>
                                <View style={styles.menuAvatar}>
                                    <Text style={styles.menuAvatarText}>👤</Text>
                                </View>
                                <Text style={[styles.menuName, { color: colors.textOnDark }]}>{userProfileData?.fullName || 'זיו המלך'}</Text>
                                <Text style={[styles.menuEmail, { color: 'rgba(255,255,255,0.7)' }]}>{userProfileData?.email || 'user@finly.com'}</Text>
                            </View>
                        </View>

                        {/* Menu Items */}
                        <ScrollView
                            style={styles.menuItems}
                            contentContainerStyle={styles.menuItemsContent}
                            showsVerticalScrollIndicator={false}
                        >
                            <TouchableOpacity
                                style={styles.menuItem}
                                onPress={() => {
                                    closeMenu();
                                    navigation.navigate('Settings');
                                }}
                            >
                                <Settings size={24} color={colors.info} />
                                <View style={{ flex: 1, paddingRight: 10 }}>
                                    <Text style={[styles.menuItemText, { color: colors.textPrimary }]}>הגדרות עסק</Text>
                                </View>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.menuItem}
                                onPress={() => {
                                    closeMenu();
                                    navigation.navigate('Settings');
                                }}
                            >
                                <User size={24} color={colors.info} />
                                <View style={{ flex: 1, paddingRight: 10 }}>
                                    <Text style={[styles.menuItemText, { color: colors.textPrimary }]}>הגדרות פרופיל</Text>
                                </View>
                            </TouchableOpacity>

                            <View style={[styles.menuDivider, { backgroundColor: colors.divider }]} />

                            <TouchableOpacity
                                style={styles.menuItem}
                                onPress={() => {
                                    closeMenu();
                                    navigation.navigate('Login');
                                }}
                            >
                                <LogOut size={24} color={colors.danger} />
                                <View style={{ flex: 1, paddingRight: 10 }}>
                                    <Text style={[styles.menuItemText, { color: colors.danger }]}>התנתק</Text>
                                </View>
                            </TouchableOpacity>
                        </ScrollView>
                    </View>
                </Animated.View>
            </PanGestureHandler>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0a0a0f',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 50,
        paddingBottom: 20,
    },
    headerLeft: {
        flexDirection: 'row',
        gap: 12,
    },
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    iconButton: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.05)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    greeting: {
        fontSize: 14,
        fontFamily: FONTS.medium,
        color: '#fff',
        textAlign: 'right',
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#ff9a7a',
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarText: {
        fontSize: 20,
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    balanceCard: {
        marginBottom: 24,
        borderRadius: 24,
        overflow: 'hidden',
    },
    balanceGradient: {
        padding: 24,
    },
    balanceHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    balanceLabel: {
        fontSize: 13,
        fontFamily: FONTS.regular,
        color: 'rgba(255,255,255,0.6)',
        textAlign: 'right',
    },
    percentageBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0,255,136,0.15)',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        gap: 4,
    },
    percentageText: {
        fontSize: 12,
        fontFamily: FONTS.bold,
        color: '#00ff88',
    },
    balanceAmount: {
        fontSize: 40,
        fontFamily: FONTS.bold,
        color: '#fff',
        textAlign: 'center',
        marginBottom: 20,
    },
    balanceFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: 'rgba(0,0,0,0.2)',
        borderRadius: 16,
        padding: 16,
    },
    balanceItem: {
        flex: 1,
    },
    balanceItemLabel: {
        fontSize: 12,
        fontFamily: FONTS.regular,
        color: 'rgba(255,255,255,0.5)',
        marginBottom: 4,
        textAlign: 'right',
    },
    balanceItemValue: {
        fontSize: 18,
        fontFamily: FONTS.bold,
        color: '#00ffdd',
        textAlign: 'right',
    },
    quickActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 24,
        gap: 12,
    },
    quickAction: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 16,
        borderRadius: 20,
        gap: 8,
    },
    quickActionIcon: {
        width: 40,
        height: 40,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    quickActionText: {
        fontSize: 12,
        fontFamily: FONTS.bold,
    },
    section: {
        marginBottom: 24,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontFamily: FONTS.bold,
        color: '#fff',
        textAlign: 'right',
    },
    dateBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.05)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
        gap: 6,
    },
    dateText: {
        fontSize: 12,
        fontFamily: FONTS.medium,
        color: 'rgba(255,255,255,0.7)',
    },
    summaryCard: {
        backgroundColor: '#151520',
        borderRadius: 20,
        padding: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    summaryHeader: {
        flexDirection: 'row',
        alignItems: 'baseline',
        justifyContent: 'flex-end',
        marginBottom: 8,
        gap: 8,
    },
    summaryAmount: {
        fontSize: 28,
        fontFamily: FONTS.bold,
        color: '#fff',
    },
    summarySubtext: {
        fontSize: 14,
        fontFamily: FONTS.regular,
        color: 'rgba(255,255,255,0.4)',
    },
    summaryLabel: {
        fontSize: 13,
        fontFamily: FONTS.medium,
        color: '#00ff88',
        marginBottom: 16,
        textAlign: 'right',
    },
    progressBar: {
        height: 6,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 3,
        overflow: 'hidden',
        marginBottom: 12,
    },
    progressFill: {
        height: '100%',
        backgroundColor: '#00ff88',
        borderRadius: 3,
    },
    summaryNote: {
        fontSize: 11,
        fontFamily: FONTS.regular,
        color: 'rgba(255,255,255,0.4)',
        lineHeight: 16,
        textAlign: 'right',
    },
    chartTabs: {
        flexDirection: 'row',
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 12,
        padding: 4,
        gap: 4,
    },
    chartTab: {
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 8,
    },
    chartTabActive: {
        backgroundColor: '#00ffdd',
    },
    chartTabText: {
        fontSize: 12,
        fontFamily: FONTS.medium,
        color: 'rgba(255,255,255,0.6)',
    },
    chartTabTextActive: {
        fontSize: 12,
        fontFamily: FONTS.bold,
        color: '#0a0a0f',
    },
    chartCard: {
        backgroundColor: '#151520',
        borderRadius: 20,
        padding: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    chart: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        height: 140,
    },
    chartBar: {
        flex: 1,
        alignItems: 'center',
        gap: 8,
    },
    chartBarContainer: {
        flex: 1,
        width: '70%',
        justifyContent: 'flex-end',
    },
    chartBarFill: {
        width: '100%',
        borderRadius: 6,
        minHeight: 20,
    },
    chartLabel: {
        fontSize: 11,
        fontFamily: FONTS.regular,
        color: 'rgba(255,255,255,0.5)',
    },
    seeAllText: {
        fontSize: 13,
        fontFamily: FONTS.medium,
        color: '#00ffdd',
    },
    transactionCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#151520',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
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
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    transactionTitle: {
        fontSize: 14,
        fontFamily: FONTS.bold,
        color: '#fff',
        marginBottom: 4,
        textAlign: 'right',
    },
    transactionDate: {
        fontSize: 12,
        fontFamily: FONTS.regular,
        color: 'rgba(255,255,255,0.5)',
        textAlign: 'right',
    },
    transactionAmount: {
        fontSize: 16,
        fontFamily: FONTS.bold,
        color: '#fff',
    },
    emptyState: {
        backgroundColor: '#151520',
        borderRadius: 16,
        padding: 32,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    emptyStateText: {
        fontSize: 14,
        fontFamily: FONTS.regular,
        color: 'rgba(255,255,255,0.5)',
        marginBottom: 16,
    },
    addButton: {
        backgroundColor: '#00ffdd',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 12,
    },
    addButtonText: {
        fontSize: 14,
        fontFamily: FONTS.bold,
        color: '#0a0a0f',
    },
    // Menu Styles
    menuOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    menuContainer: {
        width: width * 0.75,
        height: '100%',
        backgroundColor: '#1a1a2e',
        shadowColor: '#000',
        shadowOffset: { width: 2, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 10,
        elevation: 10,
    },
    menuGradient: {
        flex: 1,
        backgroundColor: '#1a1a2e',
    },
    menuHeader: {
        paddingTop: 80,
        paddingHorizontal: 24,
        paddingBottom: 30,
        backgroundColor: '#0f3329',
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.1)',
    },
    closeButton: {
        position: 'absolute',
        top: 15,
        left: 20,
        zIndex: 10,
        padding: 8,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 8,
    },
    menuProfile: {
        alignItems: 'center',
    },
    menuAvatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#ff9a7a',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
        borderWidth: 3,
        borderColor: '#00ffdd',
    },
    menuAvatarText: {
        fontSize: 36,
    },
    menuName: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#ffffff',
        marginBottom: 4,
    },
    menuEmail: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.7)',
    },
    menuItems: {
        flex: 1,
    },
    menuItemsContent: {
        padding: 24,
        paddingBottom: 40,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 15,
        borderRadius: 12,
        marginBottom: 10,
        backgroundColor: 'rgba(255,255,255,0.08)',
        height: 55,
    },
    menuItemText: {
        fontSize: 18,
        color: '#FFFFFF',
        fontWeight: 'bold',
        marginLeft: 15,
        textAlignVertical: 'center',
    },
    menuDivider: {
        height: 1,
        backgroundColor: 'rgba(255,255,255,0.1)',
        marginVertical: 12,
    },
});
