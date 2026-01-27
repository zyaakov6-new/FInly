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
import Svg, { Circle, Defs, LinearGradient as SvgGradient, Stop } from 'react-native-svg';
import {
    TrendingUp,
    TrendingDown,
    ArrowUpRight,
    ArrowDownRight,
    ChevronLeft,
    Plus,
    FileText,
    Zap,
    PieChart,
    Users,
    Receipt,
    Clock,
    Sparkles,
    Calendar,
} from 'lucide-react-native';
import { useTransactions } from '../context/TransactionsContext';
import { useTheme } from '../context/ThemeContext';
import { getColors, FONTS, SPACING, RADIUS, SHADOWS, TYPOGRAPHY, LAYOUT } from '../constants/theme';

const { width, height } = Dimensions.get('window');
const CIRCLE_SIZE = 180;
const STROKE_WIDTH = 12;

// Animated circular progress component
const CircularProgress = ({ progress, colors, isDark }: { progress: number; colors: any; isDark: boolean }) => {
    const animatedValue = useRef(new Animated.Value(0)).current;
    const radius = (CIRCLE_SIZE - STROKE_WIDTH) / 2;
    const circumference = 2 * Math.PI * radius;

    useEffect(() => {
        Animated.timing(animatedValue, {
            toValue: Math.min(progress, 100),
            duration: 1500,
            useNativeDriver: false,
        }).start();
    }, [progress]);

    const strokeDashoffset = animatedValue.interpolate({
        inputRange: [0, 100],
        outputRange: [circumference, 0],
    });

    return (
        <View style={styles.circularContainer}>
            <Svg width={CIRCLE_SIZE} height={CIRCLE_SIZE} style={{ transform: [{ rotate: '-90deg' }] }}>
                <Defs>
                    <SvgGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <Stop offset="0%" stopColor={isDark ? '#818CF8' : '#6366F1'} />
                        <Stop offset="100%" stopColor={isDark ? '#A78BFA' : '#8B5CF6'} />
                    </SvgGradient>
                </Defs>
                {/* Background circle */}
                <Circle
                    cx={CIRCLE_SIZE / 2}
                    cy={CIRCLE_SIZE / 2}
                    r={radius}
                    stroke={isDark ? 'rgba(255,255,255,0.1)' : 'rgba(99, 102, 241, 0.15)'}
                    strokeWidth={STROKE_WIDTH}
                    fill="none"
                />
                {/* Progress circle */}
                <AnimatedCircle
                    cx={CIRCLE_SIZE / 2}
                    cy={CIRCLE_SIZE / 2}
                    r={radius}
                    stroke="url(#gradient)"
                    strokeWidth={STROKE_WIDTH}
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                />
            </Svg>
        </View>
    );
};

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

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
        goals,
    } = useTransactions();

    const expenseProgress = useMemo(() => getMonthlyExpenseProgress(), [getMonthlyExpenseProgress]);

    // Animations
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(30)).current;
    const scaleAnim = useRef(new Animated.Value(0.95)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 600,
                useNativeDriver: true,
            }),
            Animated.spring(slideAnim, {
                toValue: 0,
                tension: 50,
                friction: 8,
                useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
                toValue: 1,
                tension: 50,
                friction: 8,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    const now = new Date();
    const isPositive = netProfit >= 0;
    const pendingInvoices = transactions.filter(t => t.type === 'invoice' && t.status === 'pending');
    const pendingTotal = pendingInvoices.reduce((sum, t) =>
        sum + (parseFloat(t.amount.replace(/[^0-9.-]+/g, '')) || 0), 0
    );

    // Calculate goal progress
    const incomeProgress = goals.monthlyIncomeTarget > 0
        ? Math.min((totalRevenue / goals.monthlyIncomeTarget) * 100, 100)
        : 0;

    const getGreeting = () => {
        const hour = now.getHours();
        if (hour < 12) return 'בוקר טוב';
        if (hour < 17) return 'צהריים טובים';
        if (hour < 21) return 'ערב טוב';
        return 'לילה טוב';
    };

    const formatCurrency = (amount: number) => {
        if (amount >= 1000000) return `${(amount / 1000000).toFixed(1)}M`;
        if (amount >= 1000) return `${(amount / 1000).toFixed(1)}K`;
        return amount.toLocaleString();
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <StatusBar style={isDark ? 'light' : 'dark'} />

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top }]}
            >
                <Animated.View style={{
                    opacity: fadeAnim,
                    transform: [{ translateY: slideAnim }, { scale: scaleAnim }]
                }}>
                    {/* Hero Section with Gradient */}
                    <LinearGradient
                        colors={isDark
                            ? ['#18181B', '#27272A', '#18181B']
                            : ['#6366F1', '#8B5CF6', '#6366F1']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.heroSection}
                    >
                        {/* Decorative circles */}
                        <View style={[styles.decorCircle1, { opacity: isDark ? 0.05 : 0.15 }]} />
                        <View style={[styles.decorCircle2, { opacity: isDark ? 0.03 : 0.1 }]} />

                        {/* Header */}
                        <View style={styles.heroHeader}>
                            <View>
                                <Text style={[styles.greeting, { color: isDark ? colors.textTertiary : 'rgba(255,255,255,0.8)' }]}>
                                    {getGreeting()}
                                </Text>
                                <Text style={[styles.dateText, { color: isDark ? colors.textPrimary : '#FFFFFF' }]}>
                                    {now.toLocaleDateString('he-IL', { weekday: 'long', day: 'numeric', month: 'long' })}
                                </Text>
                            </View>
                            <TouchableOpacity
                                style={[styles.addButton, { backgroundColor: isDark ? colors.primary : 'rgba(255,255,255,0.2)' }]}
                                onPress={() => navigation.navigate('CreateInvoice')}
                            >
                                <Plus size={22} color="#FFFFFF" strokeWidth={2.5} />
                            </TouchableOpacity>
                        </View>

                        {/* Balance Display */}
                        <TouchableOpacity
                            style={styles.balanceContainer}
                            onPress={() => navigation.navigate('PnL')}
                            activeOpacity={0.9}
                        >
                            <View style={styles.balanceContent}>
                                <CircularProgress progress={incomeProgress} colors={colors} isDark={isDark} />
                                <View style={styles.balanceTextContainer}>
                                    <Text style={[styles.balanceLabel, { color: isDark ? colors.textTertiary : 'rgba(255,255,255,0.7)' }]}>
                                        יתרה חודשית
                                    </Text>
                                    <Text style={[styles.balanceAmount, { color: isDark ? colors.textPrimary : '#FFFFFF' }]}>
                                        ₪{Math.abs(netProfit).toLocaleString()}
                                    </Text>
                                    <View style={[
                                        styles.balanceBadge,
                                        { backgroundColor: isPositive ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)' }
                                    ]}>
                                        {isPositive ? (
                                            <TrendingUp size={14} color="#34D399" />
                                        ) : (
                                            <TrendingDown size={14} color="#F87171" />
                                        )}
                                        <Text style={[styles.badgeText, { color: isPositive ? '#34D399' : '#F87171' }]}>
                                            {isPositive ? 'רווח' : 'הפסד'}
                                        </Text>
                                    </View>
                                </View>
                            </View>
                        </TouchableOpacity>

                        {/* Income/Expense Pills */}
                        <View style={styles.statsPills}>
                            <TouchableOpacity
                                style={[styles.pill, { backgroundColor: isDark ? colors.surface : 'rgba(255,255,255,0.15)' }]}
                                onPress={() => navigation.navigate('InvoicesList')}
                            >
                                <View style={[styles.pillIcon, { backgroundColor: 'rgba(52, 211, 153, 0.2)' }]}>
                                    <ArrowDownRight size={16} color="#34D399" />
                                </View>
                                <View style={styles.pillText}>
                                    <Text style={[styles.pillLabel, { color: isDark ? colors.textTertiary : 'rgba(255,255,255,0.7)' }]}>
                                        הכנסות
                                    </Text>
                                    <Text style={[styles.pillValue, { color: isDark ? colors.success : '#34D399' }]}>
                                        ₪{formatCurrency(totalRevenue)}
                                    </Text>
                                </View>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.pill, { backgroundColor: isDark ? colors.surface : 'rgba(255,255,255,0.15)' }]}
                                onPress={() => navigation.navigate('Expenses')}
                            >
                                <View style={[styles.pillIcon, { backgroundColor: 'rgba(248, 113, 113, 0.2)' }]}>
                                    <ArrowUpRight size={16} color="#F87171" />
                                </View>
                                <View style={styles.pillText}>
                                    <Text style={[styles.pillLabel, { color: isDark ? colors.textTertiary : 'rgba(255,255,255,0.7)' }]}>
                                        הוצאות
                                    </Text>
                                    <Text style={[styles.pillValue, { color: isDark ? colors.danger : '#F87171' }]}>
                                        ₪{formatCurrency(totalExpenses)}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                    </LinearGradient>

                    {/* Quick Actions - Creative Grid */}
                    <View style={styles.actionsSection}>
                        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
                            פעולות מהירות
                        </Text>
                        <View style={styles.actionsGrid}>
                            <TouchableOpacity
                                style={[styles.actionCard, styles.actionLarge, { backgroundColor: colors.surface }, SHADOWS.md]}
                                onPress={() => navigation.navigate('CreateInvoice')}
                                activeOpacity={0.7}
                            >
                                <LinearGradient
                                    colors={['rgba(99, 102, 241, 0.1)', 'rgba(139, 92, 246, 0.05)']}
                                    style={styles.actionGradient}
                                >
                                    <View style={[styles.actionIconLarge, { backgroundColor: colors.primaryMuted }]}>
                                        <FileText size={28} color={colors.primary} />
                                    </View>
                                    <Text style={[styles.actionLabelLarge, { color: colors.textPrimary }]}>
                                        חשבונית חדשה
                                    </Text>
                                    <Text style={[styles.actionDesc, { color: colors.textTertiary }]}>
                                        צור חשבונית ללקוח
                                    </Text>
                                </LinearGradient>
                            </TouchableOpacity>

                            <View style={styles.actionColumn}>
                                <TouchableOpacity
                                    style={[styles.actionCard, styles.actionSmall, { backgroundColor: colors.surface }, SHADOWS.sm]}
                                    onPress={() => navigation.navigate('AddExpense')}
                                >
                                    <View style={[styles.actionIcon, { backgroundColor: colors.dangerMuted }]}>
                                        <Receipt size={20} color={colors.danger} />
                                    </View>
                                    <Text style={[styles.actionLabel, { color: colors.textPrimary }]}>הוצאה</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[styles.actionCard, styles.actionSmall, { backgroundColor: colors.surface }, SHADOWS.sm]}
                                    onPress={() => navigation.navigate('Clients')}
                                >
                                    <View style={[styles.actionIcon, { backgroundColor: colors.infoMuted }]}>
                                        <Users size={20} color={colors.info} />
                                    </View>
                                    <Text style={[styles.actionLabel, { color: colors.textPrimary }]}>לקוחות</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>

                    {/* Pending Invoices Card */}
                    {pendingInvoices.length > 0 && (
                        <TouchableOpacity
                            style={[styles.pendingCard, { backgroundColor: colors.surface }, SHADOWS.md]}
                            onPress={() => navigation.navigate('InvoicesList', { filter: 'pending' })}
                            activeOpacity={0.8}
                        >
                            <LinearGradient
                                colors={[colors.warningMuted, 'transparent']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.pendingGradient}
                            />
                            <View style={styles.pendingContent}>
                                <View style={[styles.pendingIconBox, { backgroundColor: colors.warningMuted }]}>
                                    <Clock size={24} color={colors.warning} />
                                </View>
                                <View style={styles.pendingInfo}>
                                    <Text style={[styles.pendingTitle, { color: colors.textPrimary }]}>
                                        ממתינים לתשלום
                                    </Text>
                                    <Text style={[styles.pendingCount, { color: colors.textSecondary }]}>
                                        {pendingInvoices.length} חשבוניות
                                    </Text>
                                </View>
                                <View style={styles.pendingAmountBox}>
                                    <Text style={[styles.pendingAmount, { color: colors.warning }]}>
                                        ₪{pendingTotal.toLocaleString()}
                                    </Text>
                                    <ChevronLeft size={20} color={colors.textTertiary} />
                                </View>
                            </View>
                        </TouchableOpacity>
                    )}

                    {/* Goals Progress */}
                    <TouchableOpacity
                        style={[styles.goalsCard, { backgroundColor: colors.surface }, SHADOWS.md]}
                        onPress={() => navigation.navigate('Goals')}
                        activeOpacity={0.8}
                    >
                        <View style={styles.goalsHeader}>
                            <View style={styles.goalsHeaderLeft}>
                                <Zap size={20} color={colors.primary} />
                                <Text style={[styles.goalsTitle, { color: colors.textPrimary }]}>
                                    יעדים חודשיים
                                </Text>
                            </View>
                            <ChevronLeft size={20} color={colors.textTertiary} />
                        </View>

                        <View style={styles.goalsContent}>
                            {/* Income Goal */}
                            <View style={styles.goalItem}>
                                <View style={styles.goalHeader}>
                                    <Text style={[styles.goalLabel, { color: colors.textSecondary }]}>הכנסות</Text>
                                    <Text style={[styles.goalPercent, { color: colors.success }]}>
                                        {Math.round(incomeProgress)}%
                                    </Text>
                                </View>
                                <View style={[styles.goalBar, { backgroundColor: colors.successMuted }]}>
                                    <Animated.View
                                        style={[
                                            styles.goalFill,
                                            {
                                                width: `${incomeProgress}%`,
                                                backgroundColor: colors.success,
                                            }
                                        ]}
                                    />
                                </View>
                            </View>

                            {/* Expense Goal */}
                            <View style={styles.goalItem}>
                                <View style={styles.goalHeader}>
                                    <Text style={[styles.goalLabel, { color: colors.textSecondary }]}>הוצאות</Text>
                                    <Text style={[
                                        styles.goalPercent,
                                        { color: expenseProgress.percentage > 80 ? colors.danger : colors.primary }
                                    ]}>
                                        {Math.round(expenseProgress.percentage)}%
                                    </Text>
                                </View>
                                <View style={[styles.goalBar, { backgroundColor: colors.primaryMuted }]}>
                                    <Animated.View
                                        style={[
                                            styles.goalFill,
                                            {
                                                width: `${Math.min(expenseProgress.percentage, 100)}%`,
                                                backgroundColor: expenseProgress.percentage > 80 ? colors.danger : colors.primary,
                                            }
                                        ]}
                                    />
                                </View>
                            </View>
                        </View>
                    </TouchableOpacity>

                    {/* Recent Activity */}
                    <View style={styles.recentSection}>
                        <View style={styles.recentHeader}>
                            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
                                פעילות אחרונה
                            </Text>
                            <TouchableOpacity onPress={() => navigation.navigate('AllActivity')}>
                                <Text style={[styles.seeAll, { color: colors.primary }]}>הכל</Text>
                            </TouchableOpacity>
                        </View>

                        {transactions.slice(0, 3).map((item, index) => (
                            <TouchableOpacity
                                key={item.id}
                                style={[
                                    styles.activityItem,
                                    { backgroundColor: colors.surface },
                                    index === 0 && SHADOWS.sm
                                ]}
                                onPress={() => {
                                    if (item.type === 'invoice') {
                                        navigation.navigate('InvoiceDetails', { transactionId: item.id });
                                    }
                                }}
                            >
                                <View style={[
                                    styles.activityIcon,
                                    { backgroundColor: item.isIncome ? colors.successMuted : colors.dangerMuted }
                                ]}>
                                    {item.isIncome ? (
                                        <TrendingUp size={18} color={colors.success} />
                                    ) : (
                                        <TrendingDown size={18} color={colors.danger} />
                                    )}
                                </View>
                                <View style={styles.activityInfo}>
                                    <Text style={[styles.activityTitle, { color: colors.textPrimary }]} numberOfLines={1}>
                                        {item.title}
                                    </Text>
                                    <Text style={[styles.activityDate, { color: colors.textTertiary }]}>
                                        {new Date(item.date).toLocaleDateString('he-IL', { day: 'numeric', month: 'short' })}
                                    </Text>
                                </View>
                                <Text style={[
                                    styles.activityAmount,
                                    { color: item.isIncome ? colors.success : colors.danger }
                                ]}>
                                    {item.isIncome ? '+' : '-'}{item.amount}
                                </Text>
                            </TouchableOpacity>
                        ))}

                        {transactions.length === 0 && (
                            <View style={[styles.emptyActivity, { backgroundColor: colors.surface }]}>
                                <Calendar size={32} color={colors.textTertiary} />
                                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                                    אין פעילות עדיין
                                </Text>
                            </View>
                        )}
                    </View>

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
        paddingBottom: SPACING['2xl'],
    },
    // Hero Section
    heroSection: {
        paddingHorizontal: LAYOUT.screenPadding,
        paddingTop: SPACING.lg,
        paddingBottom: SPACING['3xl'],
        borderBottomLeftRadius: RADIUS['3xl'],
        borderBottomRightRadius: RADIUS['3xl'],
        overflow: 'hidden',
        position: 'relative',
    },
    decorCircle1: {
        position: 'absolute',
        width: 200,
        height: 200,
        borderRadius: 100,
        backgroundColor: '#FFFFFF',
        top: -50,
        right: -50,
    },
    decorCircle2: {
        position: 'absolute',
        width: 150,
        height: 150,
        borderRadius: 75,
        backgroundColor: '#FFFFFF',
        bottom: 20,
        left: -30,
    },
    heroHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: SPACING['2xl'],
    },
    greeting: {
        ...TYPOGRAPHY.body,
        marginBottom: SPACING.xs,
    },
    dateText: {
        ...TYPOGRAPHY.h3,
    },
    addButton: {
        width: 48,
        height: 48,
        borderRadius: RADIUS.lg,
        alignItems: 'center',
        justifyContent: 'center',
    },
    // Balance
    balanceContainer: {
        marginBottom: SPACING['2xl'],
    },
    balanceContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    circularContainer: {
        marginLeft: SPACING.lg,
    },
    balanceTextContainer: {
        flex: 1,
        alignItems: 'flex-end',
    },
    balanceLabel: {
        ...TYPOGRAPHY.body,
        marginBottom: SPACING.xs,
    },
    balanceAmount: {
        fontSize: 42,
        fontFamily: FONTS.bold,
        letterSpacing: -1,
        marginBottom: SPACING.sm,
    },
    balanceBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.sm,
        borderRadius: RADIUS.full,
        gap: SPACING.xs,
    },
    badgeText: {
        ...TYPOGRAPHY.labelSmall,
    },
    // Stats Pills
    statsPills: {
        flexDirection: 'row',
        gap: SPACING.md,
    },
    pill: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        padding: SPACING.md,
        borderRadius: RADIUS.xl,
        gap: SPACING.sm,
    },
    pillIcon: {
        width: 36,
        height: 36,
        borderRadius: RADIUS.md,
        alignItems: 'center',
        justifyContent: 'center',
    },
    pillText: {
        flex: 1,
    },
    pillLabel: {
        ...TYPOGRAPHY.captionSmall,
        marginBottom: 2,
    },
    pillValue: {
        ...TYPOGRAPHY.label,
    },
    // Actions Section
    actionsSection: {
        paddingHorizontal: LAYOUT.screenPadding,
        marginTop: -SPACING.xl,
    },
    sectionTitle: {
        ...TYPOGRAPHY.h4,
        marginBottom: SPACING.lg,
        marginTop: SPACING['2xl'],
    },
    actionsGrid: {
        flexDirection: 'row',
        gap: SPACING.md,
    },
    actionCard: {
        borderRadius: RADIUS.xl,
        overflow: 'hidden',
    },
    actionLarge: {
        flex: 1.5,
        minHeight: 160,
    },
    actionSmall: {
        flex: 1,
        padding: SPACING.lg,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 75,
    },
    actionColumn: {
        flex: 1,
        gap: SPACING.md,
    },
    actionGradient: {
        flex: 1,
        padding: SPACING.xl,
        justifyContent: 'flex-end',
    },
    actionIconLarge: {
        width: 56,
        height: 56,
        borderRadius: RADIUS.lg,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: SPACING.lg,
    },
    actionIcon: {
        width: 44,
        height: 44,
        borderRadius: RADIUS.md,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: SPACING.sm,
    },
    actionLabelLarge: {
        ...TYPOGRAPHY.h4,
        marginBottom: SPACING.xs,
    },
    actionLabel: {
        ...TYPOGRAPHY.labelSmall,
        textAlign: 'center',
    },
    actionDesc: {
        ...TYPOGRAPHY.caption,
    },
    // Pending Card
    pendingCard: {
        marginHorizontal: LAYOUT.screenPadding,
        marginTop: SPACING.xl,
        borderRadius: RADIUS.xl,
        overflow: 'hidden',
    },
    pendingGradient: {
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        width: '50%',
    },
    pendingContent: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: SPACING.lg,
    },
    pendingIconBox: {
        width: 48,
        height: 48,
        borderRadius: RADIUS.lg,
        alignItems: 'center',
        justifyContent: 'center',
    },
    pendingInfo: {
        flex: 1,
        marginHorizontal: SPACING.md,
    },
    pendingTitle: {
        ...TYPOGRAPHY.label,
        marginBottom: 2,
    },
    pendingCount: {
        ...TYPOGRAPHY.caption,
    },
    pendingAmountBox: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.xs,
    },
    pendingAmount: {
        ...TYPOGRAPHY.moneySmall,
    },
    // Goals Card
    goalsCard: {
        marginHorizontal: LAYOUT.screenPadding,
        marginTop: SPACING.lg,
        borderRadius: RADIUS.xl,
        padding: SPACING.xl,
    },
    goalsHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.xl,
    },
    goalsHeaderLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.sm,
    },
    goalsTitle: {
        ...TYPOGRAPHY.label,
    },
    goalsContent: {
        gap: SPACING.lg,
    },
    goalItem: {
        gap: SPACING.sm,
    },
    goalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    goalLabel: {
        ...TYPOGRAPHY.caption,
    },
    goalPercent: {
        ...TYPOGRAPHY.labelSmall,
    },
    goalBar: {
        height: 8,
        borderRadius: 4,
        overflow: 'hidden',
    },
    goalFill: {
        height: '100%',
        borderRadius: 4,
    },
    // Recent Activity
    recentSection: {
        paddingHorizontal: LAYOUT.screenPadding,
        marginTop: SPACING.xl,
    },
    recentHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.lg,
    },
    seeAll: {
        ...TYPOGRAPHY.label,
    },
    activityItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: SPACING.md,
        borderRadius: RADIUS.lg,
        marginBottom: SPACING.sm,
    },
    activityIcon: {
        width: 40,
        height: 40,
        borderRadius: RADIUS.md,
        alignItems: 'center',
        justifyContent: 'center',
    },
    activityInfo: {
        flex: 1,
        marginHorizontal: SPACING.md,
    },
    activityTitle: {
        ...TYPOGRAPHY.body,
        fontFamily: FONTS.medium,
        marginBottom: 2,
    },
    activityDate: {
        ...TYPOGRAPHY.captionSmall,
    },
    activityAmount: {
        ...TYPOGRAPHY.label,
    },
    emptyActivity: {
        padding: SPACING['3xl'],
        borderRadius: RADIUS.xl,
        alignItems: 'center',
        gap: SPACING.md,
    },
    emptyText: {
        ...TYPOGRAPHY.body,
    },
});
