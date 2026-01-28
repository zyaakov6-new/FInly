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
    FileText,
    Zap,
    PieChart,
    Users,
    Receipt,
    Clock,
    Calendar,
    Award,
    Lightbulb,
    AlertCircle,
} from 'lucide-react-native';
import { useTransactions } from '../context/TransactionsContext';
import { useTheme } from '../context/ThemeContext';
import { useUserProfile } from '../context/UserProfileContext';
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
    const { userProfile } = useUserProfile();

    const {
        transactions,
        totalRevenue,
        totalExpenses,
        netProfit,
        getMonthlyExpenseProgress,
        goals,
    } = useTransactions();

    const expenseProgress = useMemo(() => getMonthlyExpenseProgress(), [getMonthlyExpenseProgress]);

    // Calculate freelancer score
    const freelancerScore = useMemo(() => {
        const invoices = transactions.filter(t => t.type === 'invoice');
        const paidInvoices = invoices.filter(t => t.status === 'paid');

        // Income to Expense Ratio (max 150)
        const incomeExpenseRatio = totalExpenses > 0 ? totalRevenue / totalExpenses : totalRevenue > 0 ? 10 : 0;
        const ratioScore = Math.min(Math.round(incomeExpenseRatio * 30), 150);

        // Collection Rate (max 150)
        const totalInvoicesCount = invoices.length;
        const collectionRate = totalInvoicesCount > 0 ? (paidInvoices.length / totalInvoicesCount) * 100 : 100;
        const collectionScore = Math.round((collectionRate / 100) * 150);

        // Savings Rate (max 150)
        const savingsRate = totalRevenue > 0 ? ((totalRevenue - totalExpenses) / totalRevenue) * 100 : 0;
        const savingsScore = Math.round(Math.max(0, Math.min(savingsRate, 50)) * 3);

        // Goal Achievement (max 150)
        const incomeGoalProg = goals.monthlyIncomeTarget > 0
            ? Math.min((totalRevenue / goals.monthlyIncomeTarget) * 100, 100)
            : 50;
        const goalScore = Math.round((incomeGoalProg / 100) * 150);

        // Client Diversity (max 150)
        const uniqueClients = new Set(invoices.map(i => i.clientName).filter(Boolean));
        const diversityScore = Math.min(uniqueClients.size * 25, 150);

        // Consistency (max 100)
        const hasRecentActivity = transactions.some(t => {
            const date = new Date(t.date);
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            return date >= thirtyDaysAgo;
        });
        const consistencyScore = hasRecentActivity ? 100 : 50;

        const total = ratioScore + collectionScore + savingsScore + goalScore + diversityScore + consistencyScore;
        return Math.min(total, 850);
    }, [transactions, totalRevenue, totalExpenses, goals]);

    const getScoreColor = (score: number) => {
        if (score >= 750) return colors.success;
        if (score >= 650) return colors.primary;
        if (score >= 500) return colors.warning;
        return colors.danger;
    };

    const getScoreLabel = (score: number) => {
        if (score >= 750) return 'מצוין';
        if (score >= 650) return 'טוב';
        if (score >= 500) return 'בינוני';
        return 'דורש שיפור';
    };

    // Calculate insights
    const insights = useMemo(() => {
        const now = new Date();
        const thisMonth = now.getMonth();
        const lastMonth = thisMonth === 0 ? 11 : thisMonth - 1;
        const thisYear = now.getFullYear();
        const lastMonthYear = thisMonth === 0 ? thisYear - 1 : thisYear;

        // Get expenses by category this month
        const thisMonthExpenses = transactions.filter(t => {
            const date = new Date(t.date);
            return t.type === 'expense' && date.getMonth() === thisMonth && date.getFullYear() === thisYear;
        });

        const lastMonthExpenses = transactions.filter(t => {
            const date = new Date(t.date);
            return t.type === 'expense' && date.getMonth() === lastMonth && date.getFullYear() === lastMonthYear;
        });

        // Category breakdown
        const categoryTotals: { [key: string]: number } = {};
        thisMonthExpenses.forEach(t => {
            const cat = t.category || 'אחר';
            const amount = parseFloat(t.amount.replace(/[^0-9.-]+/g, '')) || 0;
            categoryTotals[cat] = (categoryTotals[cat] || 0) + amount;
        });

        // Find biggest category
        let biggestCategory = '';
        let biggestAmount = 0;
        Object.entries(categoryTotals).forEach(([cat, amount]) => {
            if (amount > biggestAmount) {
                biggestAmount = amount;
                biggestCategory = cat;
            }
        });

        // Compare to last month
        const thisMonthTotal = thisMonthExpenses.reduce((sum, t) =>
            sum + (parseFloat(t.amount.replace(/[^0-9.-]+/g, '')) || 0), 0);
        const lastMonthTotal = lastMonthExpenses.reduce((sum, t) =>
            sum + (parseFloat(t.amount.replace(/[^0-9.-]+/g, '')) || 0), 0);

        const monthOverMonthChange = lastMonthTotal > 0
            ? Math.round(((thisMonthTotal - lastMonthTotal) / lastMonthTotal) * 100)
            : 0;

        // Pending invoices
        const pendingInvoicesCount = transactions.filter(t =>
            t.type === 'invoice' && t.status === 'pending'
        ).length;

        // Generate insights array
        const insightsList: { text: string; type: 'info' | 'warning' | 'success'; icon: any }[] = [];

        if (biggestCategory && biggestAmount > 0) {
            insightsList.push({
                text: `ההוצאה הגדולה החודש: ${biggestCategory} (₪${biggestAmount.toLocaleString()})`,
                type: 'info',
                icon: PieChart,
            });
        }

        if (monthOverMonthChange > 20) {
            insightsList.push({
                text: `ההוצאות עלו ב-${monthOverMonthChange}% מהחודש שעבר`,
                type: 'warning',
                icon: TrendingUp,
            });
        } else if (monthOverMonthChange < -20) {
            insightsList.push({
                text: `חסכת ${Math.abs(monthOverMonthChange)}% בהוצאות מהחודש שעבר!`,
                type: 'success',
                icon: TrendingDown,
            });
        }

        if (pendingInvoicesCount > 0) {
            insightsList.push({
                text: `יש לך ${pendingInvoicesCount} חשבוניות שממתינות לתשלום`,
                type: 'warning',
                icon: AlertCircle,
            });
        }

        if (incomeProgress >= 100) {
            insightsList.push({
                text: 'עברת את יעד ההכנסות החודשי! כל הכבוד!',
                type: 'success',
                icon: Award,
            });
        }

        return insightsList.slice(0, 3); // Max 3 insights
    }, [transactions, incomeProgress]);

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
        const firstName = userProfile?.fullName?.split(' ')[0] || '';
        const nameSuffix = firstName ? `, ${firstName}` : '';

        if (hour < 12) return `בוקר טוב${nameSuffix}`;
        if (hour < 17) return `צהריים טובים${nameSuffix}`;
        if (hour < 21) return `ערב טוב${nameSuffix}`;
        return `לילה טוב${nameSuffix}`;
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
                                    <Text
                                        style={[styles.balanceAmount, { color: isDark ? colors.textPrimary : '#FFFFFF' }]}
                                        numberOfLines={1}
                                        adjustsFontSizeToFit
                                    >
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

                    {/* Goals Progress - Enhanced */}
                    <TouchableOpacity
                        style={[styles.goalsCard, { backgroundColor: colors.surface }, SHADOWS.lg]}
                        onPress={() => navigation.navigate('Goals')}
                        activeOpacity={0.8}
                    >
                        <LinearGradient
                            colors={isDark
                                ? ['rgba(16, 185, 129, 0.08)', 'transparent']
                                : ['rgba(16, 185, 129, 0.1)', 'rgba(99, 102, 241, 0.05)']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={StyleSheet.absoluteFill}
                        />
                        <View style={styles.goalsHeader}>
                            <View style={styles.goalsHeaderLeft}>
                                <View style={[styles.goalsIconBox, { backgroundColor: colors.primaryMuted }]}>
                                    <Zap size={18} color={colors.primary} />
                                </View>
                                <View>
                                    <Text style={[styles.goalsTitle, { color: colors.textPrimary }]}>
                                        יעדים חודשיים
                                    </Text>
                                    <Text style={[styles.goalsSubtitle, { color: colors.textTertiary }]}>
                                        לחץ לעריכה
                                    </Text>
                                </View>
                            </View>
                            <ChevronLeft size={20} color={colors.textTertiary} />
                        </View>

                        <View style={styles.goalsContent}>
                            {/* Income Goal */}
                            <View style={styles.goalItem}>
                                <View style={styles.goalHeader}>
                                    <View style={styles.goalLabelRow}>
                                        <View style={[styles.goalDot, { backgroundColor: colors.success }]} />
                                        <Text style={[styles.goalLabel, { color: colors.textPrimary }]}>הכנסות</Text>
                                    </View>
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
                                {goals.monthlyIncomeTarget > 0 && (
                                    <Text style={[styles.goalAmount, { color: colors.textTertiary }]}>
                                        ₪{totalRevenue.toLocaleString()} / ₪{goals.monthlyIncomeTarget.toLocaleString()}
                                    </Text>
                                )}
                            </View>

                            {/* Expense Goal */}
                            <View style={styles.goalItem}>
                                <View style={styles.goalHeader}>
                                    <View style={styles.goalLabelRow}>
                                        <View style={[styles.goalDot, { backgroundColor: expenseProgress.percentage > 80 ? colors.danger : colors.primary }]} />
                                        <Text style={[styles.goalLabel, { color: colors.textPrimary }]}>הוצאות</Text>
                                    </View>
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
                                {goals.monthlyExpenseLimit > 0 && (
                                    <Text style={[styles.goalAmount, { color: colors.textTertiary }]}>
                                        ₪{totalExpenses.toLocaleString()} / ₪{goals.monthlyExpenseLimit.toLocaleString()}
                                    </Text>
                                )}
                            </View>
                        </View>
                    </TouchableOpacity>

                    {/* Freelancer Score Card - Prominent */}
                    <TouchableOpacity
                        style={[styles.scoreCard, { backgroundColor: colors.surface }, SHADOWS.lg]}
                        onPress={() => navigation.navigate('FreelancerScore')}
                        activeOpacity={0.8}
                    >
                        <LinearGradient
                            colors={isDark
                                ? ['rgba(129, 140, 248, 0.15)', 'rgba(167, 139, 250, 0.05)']
                                : [getScoreColor(freelancerScore) + '20', 'transparent']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.scoreGradient}
                        />
                        <View style={styles.scoreContent}>
                            <View style={styles.scoreMainSection}>
                                <View style={[styles.scoreBigNumber, { borderColor: getScoreColor(freelancerScore) }]}>
                                    <Text style={[styles.scoreValue, { color: getScoreColor(freelancerScore) }]}>
                                        {freelancerScore}
                                    </Text>
                                </View>
                                <View style={styles.scoreTextSection}>
                                    <Text style={[styles.scoreTitle, { color: colors.textPrimary }]}>
                                        ציון פרילנסר
                                    </Text>
                                    <View style={[styles.scoreBadge, { backgroundColor: getScoreColor(freelancerScore) + '20' }]}>
                                        <Award size={14} color={getScoreColor(freelancerScore)} />
                                        <Text style={[styles.scoreBadgeText, { color: getScoreColor(freelancerScore) }]}>
                                            {getScoreLabel(freelancerScore)}
                                        </Text>
                                    </View>
                                </View>
                            </View>
                            <ChevronLeft size={20} color={colors.textTertiary} />
                        </View>
                        <View style={[styles.scoreProgressBar, { backgroundColor: colors.fillSecondary }]}>
                            <Animated.View
                                style={[
                                    styles.scoreProgressFill,
                                    {
                                        width: `${(freelancerScore / 850) * 100}%`,
                                        backgroundColor: getScoreColor(freelancerScore),
                                    }
                                ]}
                            />
                        </View>
                        <Text style={[styles.scoreHint, { color: colors.textTertiary }]}>
                            לחץ לפירוט מלא • מתוך 850
                        </Text>
                    </TouchableOpacity>

                    {/* Insights Card */}
                    {insights.length > 0 && (
                        <View style={[styles.insightsCard, { backgroundColor: colors.surface }, SHADOWS.md]}>
                            <View style={styles.insightsHeader}>
                                <View style={[styles.insightsIconBox, { backgroundColor: colors.warningMuted }]}>
                                    <Lightbulb size={18} color={colors.warning} />
                                </View>
                                <Text style={[styles.insightsTitle, { color: colors.textPrimary }]}>
                                    תובנות
                                </Text>
                            </View>
                            <View style={styles.insightsList}>
                                {insights.map((insight, index) => {
                                    const IconComponent = insight.icon;
                                    const iconColor = insight.type === 'success' ? colors.success
                                        : insight.type === 'warning' ? colors.warning
                                        : colors.info;
                                    const bgColor = insight.type === 'success' ? colors.successMuted
                                        : insight.type === 'warning' ? colors.warningMuted
                                        : colors.infoMuted;

                                    return (
                                        <View
                                            key={index}
                                            style={[styles.insightItem, { backgroundColor: bgColor }]}
                                        >
                                            <IconComponent size={16} color={iconColor} />
                                            <Text style={[styles.insightText, { color: colors.textPrimary }]}>
                                                {insight.text}
                                            </Text>
                                        </View>
                                    );
                                })}
                            </View>
                        </View>
                    )}

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
        flexShrink: 1,
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
    // Goals Card - Enhanced
    goalsCard: {
        marginHorizontal: LAYOUT.screenPadding,
        marginTop: SPACING.lg,
        borderRadius: RADIUS.xl,
        padding: SPACING.xl,
        overflow: 'hidden',
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
        gap: SPACING.md,
    },
    goalsIconBox: {
        width: 40,
        height: 40,
        borderRadius: RADIUS.md,
        alignItems: 'center',
        justifyContent: 'center',
    },
    goalsTitle: {
        ...TYPOGRAPHY.label,
    },
    goalsSubtitle: {
        ...TYPOGRAPHY.captionSmall,
        marginTop: 2,
    },
    goalsContent: {
        gap: SPACING.xl,
    },
    goalItem: {
        gap: SPACING.sm,
    },
    goalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    goalLabelRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.sm,
    },
    goalDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    goalLabel: {
        ...TYPOGRAPHY.body,
        fontFamily: FONTS.medium,
    },
    goalPercent: {
        ...TYPOGRAPHY.label,
    },
    goalBar: {
        height: 10,
        borderRadius: 5,
        overflow: 'hidden',
    },
    goalFill: {
        height: '100%',
        borderRadius: 5,
    },
    goalAmount: {
        ...TYPOGRAPHY.captionSmall,
        textAlign: 'left',
    },
    // Score Card - Prominent Design
    scoreCard: {
        marginHorizontal: LAYOUT.screenPadding,
        marginTop: SPACING.lg,
        borderRadius: RADIUS.xl,
        overflow: 'hidden',
        paddingBottom: SPACING.md,
    },
    scoreGradient: {
        position: 'absolute',
        left: 0,
        top: 0,
        right: 0,
        bottom: 0,
    },
    scoreContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: SPACING.lg,
        paddingBottom: SPACING.sm,
    },
    scoreMainSection: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.lg,
    },
    scoreBigNumber: {
        width: 72,
        height: 72,
        borderRadius: 36,
        borderWidth: 3,
        alignItems: 'center',
        justifyContent: 'center',
    },
    scoreValue: {
        fontSize: 28,
        fontFamily: FONTS.bold,
        letterSpacing: -1,
    },
    scoreTextSection: {
        gap: SPACING.xs,
    },
    scoreBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: SPACING.sm,
        paddingVertical: SPACING.xs,
        borderRadius: RADIUS.full,
        gap: SPACING.xs,
        alignSelf: 'flex-start',
    },
    scoreBadgeText: {
        ...TYPOGRAPHY.captionSmall,
        fontFamily: FONTS.semiBold,
    },
    scoreProgressBar: {
        height: 6,
        marginHorizontal: SPACING.lg,
        borderRadius: 3,
        overflow: 'hidden',
    },
    scoreProgressFill: {
        height: '100%',
        borderRadius: 3,
    },
    scoreHint: {
        ...TYPOGRAPHY.captionSmall,
        textAlign: 'center',
        marginTop: SPACING.sm,
    },
    scoreIconBox: {
        width: 48,
        height: 48,
        borderRadius: RADIUS.lg,
        alignItems: 'center',
        justifyContent: 'center',
    },
    scoreInfo: {
        flex: 1,
        marginHorizontal: SPACING.md,
    },
    scoreTitle: {
        ...TYPOGRAPHY.label,
        marginBottom: 2,
    },
    scoreSubtitle: {
        ...TYPOGRAPHY.caption,
    },
    // Insights Card
    insightsCard: {
        marginHorizontal: LAYOUT.screenPadding,
        marginTop: SPACING.lg,
        borderRadius: RADIUS.xl,
        padding: SPACING.lg,
    },
    insightsHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.md,
        marginBottom: SPACING.md,
    },
    insightsIconBox: {
        width: 36,
        height: 36,
        borderRadius: RADIUS.md,
        alignItems: 'center',
        justifyContent: 'center',
    },
    insightsTitle: {
        ...TYPOGRAPHY.label,
    },
    insightsList: {
        gap: SPACING.sm,
    },
    insightItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: SPACING.md,
        borderRadius: RADIUS.md,
        gap: SPACING.sm,
    },
    insightText: {
        flex: 1,
        ...TYPOGRAPHY.bodySmall,
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
