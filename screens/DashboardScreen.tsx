import React, { useEffect, useRef, useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Animated, Modal } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Search, Menu, TrendingUp, Trash2, FileText, AlertCircle, ShoppingCart, X, Home, BarChart3, Settings, User, LogOut, ArrowUpRight, ArrowDownLeft } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTransactions } from '../context/TransactionsContext';
import { useUserProfile } from '../context/UserProfileContext';
import { FONTS } from '../constants/theme';

const { width } = Dimensions.get('window');

export default function DashboardScreen() {
    const navigation = useNavigation<any>();
    const { userProfile: userProfileData } = useUserProfile();
    const { totalRevenue, totalExpenses, netProfit, profitMargin, transactions, recentActivity } = useTransactions();
    const [menuVisible, setMenuVisible] = useState(false);
    const [chartView, setChartView] = useState<'expenses' | 'income'>('expenses');

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

    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
        }).start();
    }, []);

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
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <TouchableOpacity style={styles.iconButton} onPress={openMenu}>
                        <Menu size={24} color="#fff" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.iconButton}>
                        <Search size={24} color="#fff" />
                    </TouchableOpacity>
                </View>
                <View style={styles.headerRight}>
                    <Text style={styles.greeting}>{userProfileData?.fullName || 'זיו המלך'}</Text>
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
                            colors={['#1a4d3e', '#0f3329', '#0a2419']}
                            style={styles.balanceGradient}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                        >
                            <View style={styles.balanceHeader}>
                                <Text style={styles.balanceLabel}>מיקוד שנתי נכון</Text>
                                <View style={styles.percentageBadge}>
                                    <TrendingUp size={12} color="#00ff88" />
                                    <Text style={styles.percentageText}>
                                        {yearlyGrowth >= 0 ? '+' : ''}{yearlyGrowth}%
                                    </Text>
                                </View>
                            </View>

                            <Text style={styles.balanceAmount}>₪{totalRevenue.toLocaleString()}</Text>

                            <View style={styles.balanceFooter}>
                                <View style={styles.balanceItem}>
                                    <Text style={styles.balanceItemLabel}>רווח אמיתי</Text>
                                    <Text style={styles.balanceItemValue}>₪{netProfit.toLocaleString()}</Text>
                                </View>
                                <View style={styles.balanceItem}>
                                    <Text style={styles.balanceItemLabel}>מהה הרווח</Text>
                                    <Text style={styles.balanceItemValue}>{profitMargin}%</Text>
                                </View>
                            </View>
                        </LinearGradient>
                    </TouchableOpacity>
                </Animated.View>

                {/* Monthly Summary Section */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>סיכום ביניים</Text>
                        <TouchableOpacity>
                            <View style={styles.dateBadge}>
                                <Trash2 size={16} color="#00ff88" />
                                <Text style={styles.dateText}>
                                    {new Date().toLocaleDateString('he-IL', { month: 'long', year: 'numeric' })}
                                </Text>
                            </View>
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity
                        style={styles.summaryCard}
                        activeOpacity={0.9}
                        onPress={() => navigation.navigate('ExpensesList')}
                    >
                        <View style={styles.summaryHeader}>
                            <Text style={styles.summaryAmount}>₪{totalExpenses.toLocaleString()}</Text>
                            <Text style={styles.summarySubtext}>מתוך ₪12,450</Text>
                        </View>
                        <Text style={styles.summaryLabel}>הוצאות אובדת 74%</Text>

                        {/* Progress Bar */}
                        <View style={styles.progressBar}>
                            <View style={[styles.progressFill, { width: '74%' }]} />
                        </View>

                        <Text style={styles.summaryNote}>
                            חדל מה שאתה מוציא הוא מהמכסה שהגדרת לחודש הזה. 54.2% יותר מאשר בחודש שעבר
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Monthly Chart Section */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>תנועה חודשית</Text>
                        <View style={styles.chartTabs}>
                            <TouchableOpacity
                                style={[styles.chartTab, chartView === 'expenses' && styles.chartTabActive]}
                                onPress={() => setChartView('expenses')}
                            >
                                <Text style={chartView === 'expenses' ? styles.chartTabTextActive : styles.chartTabText}>
                                    הוצאות
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.chartTab, chartView === 'income' && styles.chartTabActive]}
                                onPress={() => setChartView('income')}
                            >
                                <Text style={chartView === 'income' ? styles.chartTabTextActive : styles.chartTabText}>
                                    הכנסות
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <TouchableOpacity
                        style={styles.chartCard}
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
                                                    backgroundColor: index === monthlyChartData.length - 1 ? '#00ffdd' : '#1a5c4a'
                                                }
                                            ]}
                                        />
                                    </View>
                                    <Text style={styles.chartLabel}>{item.month}</Text>
                                </View>
                            ))}
                        </View>
                    </TouchableOpacity>
                </View>

                {/* Transactions Section */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>תשבוניות אחרונות</Text>
                        <TouchableOpacity onPress={() => navigation.navigate('AllActivity')}>
                            <Text style={styles.seeAllText}>בטל הכל</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Real Transaction Items from user data */}
                    {recentTransactions.length > 0 ? (
                        recentTransactions.map((transaction) => (
                            <TouchableOpacity
                                key={transaction.id}
                                style={styles.transactionCard}
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
                                                ? '#1a3d5c'
                                                : transaction.status === 'overdue'
                                                    ? '#5c3d1a'
                                                    : '#2a2a3c'
                                        }
                                    ]}>
                                        {transaction.isIncome ? (
                                            <ArrowDownLeft size={20} color="#4a9eff" />
                                        ) : transaction.status === 'overdue' ? (
                                            <AlertCircle size={20} color="#ff9a4a" />
                                        ) : (
                                            <ArrowUpRight size={20} color="#9a9aaa" />
                                        )}
                                    </View>
                                    <View>
                                        <Text style={styles.transactionTitle}>{transaction.title}</Text>
                                        <Text style={styles.transactionDate}>
                                            {new Date(transaction.date).toLocaleDateString('he-IL')} •
                                            {transaction.status === 'paid' ? ' שולם' :
                                                transaction.status === 'pending' ? ' ממתין' :
                                                    transaction.status === 'overdue' ? ' באיחור' : ' טיוטה'}
                                        </Text>
                                    </View>
                                </View>
                                <Text style={[
                                    styles.transactionAmount,
                                    { color: transaction.status === 'overdue' ? '#ff9a4a' : '#fff' }
                                ]}>
                                    {transaction.amount}
                                </Text>
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

            {/* Slide-out Menu */}
            <Modal
                visible={menuVisible}
                transparent
                animationType="none"
                onRequestClose={closeMenu}
            >
                <TouchableOpacity
                    style={styles.menuOverlay}
                    activeOpacity={1}
                    onPress={() => { }} // No longer closing on overlay press
                >
                    <Animated.View
                        style={[
                            styles.menuContainer,
                            { transform: [{ translateX: slideAnim }] }
                        ]}
                    >
                        <View style={styles.menuGradient}>
                            {/* Close Button */}
                            <TouchableOpacity onPress={closeMenu} style={styles.closeButton}>
                                <X size={24} color="#fff" />
                            </TouchableOpacity>

                            {/* Menu Header */}
                            <View style={styles.menuHeader}>
                                <View style={styles.menuProfile}>
                                    <View style={styles.menuAvatar}>
                                        <Text style={styles.menuAvatarText}>👤</Text>
                                    </View>
                                    <Text style={styles.menuName}>{userProfileData?.fullName || 'זיו המלך'}</Text>
                                    <Text style={styles.menuEmail}>{userProfileData?.email || 'user@finly.com'}</Text>
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
                                    <Settings size={24} color="#00ffdd" />
                                    <View style={{ flex: 1, paddingLeft: 10 }}>
                                        <Text style={styles.menuItemText}>הגדרות עסק</Text>
                                    </View>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.menuItem}
                                    onPress={() => {
                                        closeMenu();
                                        navigation.navigate('Settings'); // Temporarily linking to settings as a placeholder or specific profile screen if exists
                                    }}
                                >
                                    <User size={24} color="#00ffdd" />
                                    <View style={{ flex: 1, paddingLeft: 10 }}>
                                        <Text style={styles.menuItemText}>הגדרות פרופיל</Text>
                                    </View>
                                </TouchableOpacity>

                                <View style={styles.menuDivider} />

                                <TouchableOpacity
                                    style={styles.menuItem}
                                    onPress={() => {
                                        closeMenu();
                                        navigation.navigate('Login');
                                    }}
                                >
                                    <LogOut size={24} color="#ff6b6b" />
                                    <View style={{ flex: 1, paddingLeft: 10 }}>
                                        <Text style={[styles.menuItemText, { color: '#ff6b6b' }]}>התנתק</Text>
                                    </View>
                                </TouchableOpacity>
                            </ScrollView>
                        </View>
                    </Animated.View>
                </TouchableOpacity>
            </Modal>
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
