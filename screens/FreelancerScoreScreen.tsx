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
    ChevronRight,
    TrendingUp,
    TrendingDown,
    Wallet,
    PiggyBank,
    Users,
    Clock,
    Shield,
    Zap,
    Info,
    ChevronLeft,
    ArrowUp,
    ArrowDown,
} from 'lucide-react-native';
import { useTransactions } from '../context/TransactionsContext';
import { useTheme } from '../context/ThemeContext';
import { getColors, FONTS, SPACING, RADIUS, SHADOWS, TYPOGRAPHY, LAYOUT } from '../constants/theme';

const { width } = Dimensions.get('window');
const SCORE_CIRCLE_SIZE = 200;
const SCORE_STROKE_WIDTH = 16;

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

// Score gauge component
const ScoreGauge = ({ score, colors, isDark }: { score: number; colors: any; isDark: boolean }) => {
    const animatedValue = useRef(new Animated.Value(0)).current;
    const radius = (SCORE_CIRCLE_SIZE - SCORE_STROKE_WIDTH) / 2;
    const circumference = 2 * Math.PI * radius;

    useEffect(() => {
        Animated.timing(animatedValue, {
            toValue: Math.min(score, 850),
            duration: 2000,
            useNativeDriver: false,
        }).start();
    }, [score]);

    const strokeDashoffset = animatedValue.interpolate({
        inputRange: [0, 850],
        outputRange: [circumference * 0.75, 0],
    });

    const getScoreColor = () => {
        if (score >= 750) return ['#10B981', '#34D399'];
        if (score >= 650) return ['#6366F1', '#818CF8'];
        if (score >= 500) return ['#F59E0B', '#FBBF24'];
        return ['#EF4444', '#F87171'];
    };

    const getScoreLabel = () => {
        if (score >= 750) return 'מצוין';
        if (score >= 650) return 'טוב';
        if (score >= 500) return 'בינוני';
        return 'דורש שיפור';
    };

    const gradientColors = getScoreColor();

    return (
        <View style={styles.gaugeContainer}>
            <Svg width={SCORE_CIRCLE_SIZE} height={SCORE_CIRCLE_SIZE} style={{ transform: [{ rotate: '135deg' }] }}>
                <Defs>
                    <SvgGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <Stop offset="0%" stopColor={gradientColors[0]} />
                        <Stop offset="100%" stopColor={gradientColors[1]} />
                    </SvgGradient>
                </Defs>
                {/* Background arc */}
                <Circle
                    cx={SCORE_CIRCLE_SIZE / 2}
                    cy={SCORE_CIRCLE_SIZE / 2}
                    r={radius}
                    stroke={isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'}
                    strokeWidth={SCORE_STROKE_WIDTH}
                    fill="none"
                    strokeDasharray={circumference}
                    strokeDashoffset={circumference * 0.25}
                    strokeLinecap="round"
                />
                {/* Score arc */}
                <AnimatedCircle
                    cx={SCORE_CIRCLE_SIZE / 2}
                    cy={SCORE_CIRCLE_SIZE / 2}
                    r={radius}
                    stroke="url(#scoreGradient)"
                    strokeWidth={SCORE_STROKE_WIDTH}
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                />
            </Svg>
            <View style={styles.gaugeCenter}>
                <Text style={[styles.scoreValue, { color: colors.textPrimary }]}>{score}</Text>
                <Text style={[styles.scoreLabel, { color: gradientColors[0] }]}>{getScoreLabel()}</Text>
                <Text style={[styles.scoreMax, { color: colors.textTertiary }]}>מתוך 850</Text>
            </View>
        </View>
    );
};

// Metric card component
const MetricCard = ({
    icon: Icon,
    title,
    value,
    score,
    maxScore,
    trend,
    tip,
    colors,
    iconColor,
    iconBg,
}: any) => {
    const animatedWidth = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(animatedWidth, {
            toValue: (score / maxScore) * 100,
            duration: 1000,
            delay: 300,
            useNativeDriver: false,
        }).start();
    }, [score]);

    const getBarColor = () => {
        const percentage = (score / maxScore) * 100;
        if (percentage >= 80) return colors.success;
        if (percentage >= 60) return colors.primary;
        if (percentage >= 40) return colors.warning;
        return colors.danger;
    };

    return (
        <View style={[styles.metricCard, { backgroundColor: colors.surface }, SHADOWS.sm]}>
            <View style={styles.metricHeader}>
                <View style={[styles.metricIcon, { backgroundColor: iconBg }]}>
                    <Icon size={20} color={iconColor} />
                </View>
                <View style={styles.metricInfo}>
                    <Text style={[styles.metricTitle, { color: colors.textPrimary }]}>{title}</Text>
                    <Text style={[styles.metricValue, { color: colors.textSecondary }]}>{value}</Text>
                </View>
                <View style={styles.metricScore}>
                    <Text style={[styles.metricScoreValue, { color: getBarColor() }]}>{score}</Text>
                    <Text style={[styles.metricScoreMax, { color: colors.textTertiary }]}>/{maxScore}</Text>
                </View>
            </View>

            <View style={[styles.metricBar, { backgroundColor: colors.fillSecondary }]}>
                <Animated.View
                    style={[
                        styles.metricBarFill,
                        {
                            backgroundColor: getBarColor(),
                            width: animatedWidth.interpolate({
                                inputRange: [0, 100],
                                outputRange: ['0%', '100%'],
                            }),
                        },
                    ]}
                />
            </View>

            {tip && (
                <View style={[styles.metricTip, { backgroundColor: colors.surfaceSecondary }]}>
                    <Info size={14} color={colors.primary} />
                    <Text style={[styles.metricTipText, { color: colors.textSecondary }]}>{tip}</Text>
                </View>
            )}
        </View>
    );
};

export default function FreelancerScoreScreen() {
    const navigation = useNavigation<any>();
    const insets = useSafeAreaInsets();
    const { resolvedTheme, isDark } = useTheme();
    const colors = getColors(resolvedTheme);

    const {
        transactions,
        totalRevenue,
        totalExpenses,
        netProfit,
        goals,
    } = useTransactions();

    // Calculate metrics
    const metrics = useMemo(() => {
        const invoices = transactions.filter(t => t.type === 'invoice');
        const expenses = transactions.filter(t => t.type === 'expense');
        const paidInvoices = invoices.filter(t => t.status === 'paid');
        const pendingInvoices = invoices.filter(t => t.status === 'pending');

        // 1. Income to Expense Ratio (max 150 points)
        const incomeExpenseRatio = totalExpenses > 0 ? totalRevenue / totalExpenses : totalRevenue > 0 ? 10 : 0;
        const ratioScore = Math.min(Math.round(incomeExpenseRatio * 30), 150);

        // 2. Collection Rate (max 150 points)
        const totalInvoices = invoices.length;
        const collectionRate = totalInvoices > 0 ? (paidInvoices.length / totalInvoices) * 100 : 100;
        const collectionScore = Math.round((collectionRate / 100) * 150);

        // 3. Savings Rate (max 150 points)
        const savingsRate = totalRevenue > 0 ? ((totalRevenue - totalExpenses) / totalRevenue) * 100 : 0;
        const savingsScore = Math.round(Math.max(0, Math.min(savingsRate, 50)) * 3);

        // 4. Goal Achievement (max 150 points)
        const incomeGoalProgress = goals.monthlyIncomeTarget > 0
            ? Math.min((totalRevenue / goals.monthlyIncomeTarget) * 100, 100)
            : 50;
        const goalScore = Math.round((incomeGoalProgress / 100) * 150);

        // 5. Client Diversity (max 150 points) - based on unique clients
        const uniqueClients = new Set(invoices.map(i => i.clientName).filter(Boolean));
        const diversityScore = Math.min(uniqueClients.size * 25, 150);

        // 6. Consistency (max 100 points) - based on having regular activity
        const hasRecentActivity = transactions.some(t => {
            const date = new Date(t.date);
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            return date >= thirtyDaysAgo;
        });
        const consistencyScore = hasRecentActivity ? 100 : 50;

        // Total Score
        const totalScore = ratioScore + collectionScore + savingsScore + goalScore + diversityScore + consistencyScore;

        return {
            totalScore: Math.min(totalScore, 850),
            ratioScore,
            collectionScore,
            savingsScore,
            goalScore,
            diversityScore,
            consistencyScore,
            incomeExpenseRatio,
            collectionRate,
            savingsRate,
            incomeGoalProgress,
            uniqueClients: uniqueClients.size,
            pendingAmount: pendingInvoices.reduce((sum, i) =>
                sum + (parseFloat(i.amount.replace(/[^0-9.-]+/g, '')) || 0), 0
            ),
        };
    }, [transactions, totalRevenue, totalExpenses, goals]);

    // Animations
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(50)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 800,
                useNativeDriver: true,
            }),
            Animated.spring(slideAnim, {
                toValue: 0,
                tension: 40,
                friction: 8,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <StatusBar style={isDark ? 'light' : 'dark'} />

            {/* Header */}
            <View style={[styles.header, { paddingTop: insets.top + SPACING.md }]}>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={[styles.headerButton, { backgroundColor: colors.surfaceSecondary }]}
                >
                    <ChevronRight size={24} color={colors.textSecondary} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>ציון פרילנסר</Text>
                <View style={{ width: 44 }} />
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                <Animated.View style={{
                    opacity: fadeAnim,
                    transform: [{ translateY: slideAnim }]
                }}>
                    {/* Score Hero */}
                    <LinearGradient
                        colors={isDark
                            ? ['#18181B', '#27272A']
                            : [colors.primary, colors.primaryDark || '#4F46E5']}
                        style={styles.scoreHero}
                    >
                        <ScoreGauge score={metrics.totalScore} colors={colors} isDark={isDark} />

                        <View style={styles.scoreInfo}>
                            <View style={[styles.scorePill, { backgroundColor: isDark ? colors.surface : 'rgba(255,255,255,0.2)' }]}>
                                <Zap size={16} color={isDark ? colors.warning : '#FBBF24'} />
                                <Text style={[styles.scorePillText, { color: isDark ? colors.textPrimary : '#FFFFFF' }]}>
                                    הציון שלך משקף את הבריאות הפיננסית שלך כעצמאי
                                </Text>
                            </View>
                        </View>
                    </LinearGradient>

                    {/* Metrics Section */}
                    <View style={styles.metricsSection}>
                        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
                            פירוט הציון
                        </Text>

                        <MetricCard
                            icon={Wallet}
                            title="יחס הכנסות להוצאות"
                            value={`₪${totalRevenue.toLocaleString()} / ₪${totalExpenses.toLocaleString()}`}
                            score={metrics.ratioScore}
                            maxScore={150}
                            colors={colors}
                            iconColor={colors.success}
                            iconBg={colors.successMuted}
                            tip={metrics.incomeExpenseRatio < 1.5 ? 'נסה להגדיל את ההכנסות או לצמצם הוצאות' : null}
                        />

                        <MetricCard
                            icon={Clock}
                            title="שיעור גביית חשבוניות"
                            value={`${Math.round(metrics.collectionRate)}% נגבו`}
                            score={metrics.collectionScore}
                            maxScore={150}
                            colors={colors}
                            iconColor={colors.primary}
                            iconBg={colors.primaryMuted}
                            tip={metrics.pendingAmount > 0 ? `₪${metrics.pendingAmount.toLocaleString()} ממתינים לתשלום` : null}
                        />

                        <MetricCard
                            icon={PiggyBank}
                            title="שיעור חיסכון"
                            value={`${Math.round(metrics.savingsRate)}% מההכנסות`}
                            score={metrics.savingsScore}
                            maxScore={150}
                            colors={colors}
                            iconColor={colors.warning}
                            iconBg={colors.warningMuted}
                            tip={metrics.savingsRate < 20 ? 'מומלץ לחסוך לפחות 20% מההכנסות' : null}
                        />

                        <MetricCard
                            icon={TrendingUp}
                            title="עמידה ביעדים"
                            value={`${Math.round(metrics.incomeGoalProgress)}% מהיעד החודשי`}
                            score={metrics.goalScore}
                            maxScore={150}
                            colors={colors}
                            iconColor={colors.info}
                            iconBg={colors.infoMuted}
                            tip={metrics.incomeGoalProgress < 80 ? 'הגדר יעדים ריאליים ועקוב אחריהם' : null}
                        />

                        <MetricCard
                            icon={Users}
                            title="פיזור לקוחות"
                            value={`${metrics.uniqueClients} לקוחות פעילים`}
                            score={metrics.diversityScore}
                            maxScore={150}
                            colors={colors}
                            iconColor={colors.secondary || colors.primary}
                            iconBg={colors.primaryMuted}
                            tip={metrics.uniqueClients < 3 ? 'פזר סיכונים על ידי הרחבת בסיס הלקוחות' : null}
                        />

                        <MetricCard
                            icon={Shield}
                            title="עקביות פעילות"
                            value={metrics.consistencyScore === 100 ? 'פעילות שוטפת' : 'חסרה פעילות לאחרונה'}
                            score={metrics.consistencyScore}
                            maxScore={100}
                            colors={colors}
                            iconColor={metrics.consistencyScore === 100 ? colors.success : colors.warning}
                            iconBg={metrics.consistencyScore === 100 ? colors.successMuted : colors.warningMuted}
                        />
                    </View>

                    {/* Tips Section */}
                    <View style={styles.tipsSection}>
                        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
                            טיפים לשיפור הציון
                        </Text>

                        <View style={[styles.tipCard, { backgroundColor: colors.surface }, SHADOWS.sm]}>
                            <View style={[styles.tipIcon, { backgroundColor: colors.successMuted }]}>
                                <ArrowUp size={20} color={colors.success} />
                            </View>
                            <View style={styles.tipContent}>
                                <Text style={[styles.tipTitle, { color: colors.textPrimary }]}>
                                    הגדל את ההכנסות
                                </Text>
                                <Text style={[styles.tipDesc, { color: colors.textSecondary }]}>
                                    הרחב את בסיס הלקוחות או העלה את המחירים לשירותים קיימים
                                </Text>
                            </View>
                        </View>

                        <View style={[styles.tipCard, { backgroundColor: colors.surface }, SHADOWS.sm]}>
                            <View style={[styles.tipIcon, { backgroundColor: colors.dangerMuted }]}>
                                <ArrowDown size={20} color={colors.danger} />
                            </View>
                            <View style={styles.tipContent}>
                                <Text style={[styles.tipTitle, { color: colors.textPrimary }]}>
                                    צמצם הוצאות מיותרות
                                </Text>
                                <Text style={[styles.tipDesc, { color: colors.textSecondary }]}>
                                    בדוק הוצאות חוזרות ובטל מנויים שאינך משתמש בהם
                                </Text>
                            </View>
                        </View>

                        <View style={[styles.tipCard, { backgroundColor: colors.surface }, SHADOWS.sm]}>
                            <View style={[styles.tipIcon, { backgroundColor: colors.primaryMuted }]}>
                                <Clock size={20} color={colors.primary} />
                            </View>
                            <View style={styles.tipContent}>
                                <Text style={[styles.tipTitle, { color: colors.textPrimary }]}>
                                    גבה חשבוניות בזמן
                                </Text>
                                <Text style={[styles.tipDesc, { color: colors.textSecondary }]}>
                                    שלח תזכורות ללקוחות עם חשבוניות פתוחות מעל 30 יום
                                </Text>
                            </View>
                        </View>
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
        paddingBottom: SPACING['2xl'],
    },
    // Score Hero
    scoreHero: {
        paddingVertical: SPACING['3xl'],
        paddingHorizontal: LAYOUT.screenPadding,
        borderBottomLeftRadius: RADIUS['3xl'],
        borderBottomRightRadius: RADIUS['3xl'],
        alignItems: 'center',
    },
    gaugeContainer: {
        width: SCORE_CIRCLE_SIZE,
        height: SCORE_CIRCLE_SIZE,
        justifyContent: 'center',
        alignItems: 'center',
    },
    gaugeCenter: {
        position: 'absolute',
        alignItems: 'center',
    },
    scoreValue: {
        fontSize: 56,
        fontFamily: FONTS.bold,
        letterSpacing: -2,
    },
    scoreLabel: {
        ...TYPOGRAPHY.label,
        marginTop: SPACING.xs,
    },
    scoreMax: {
        ...TYPOGRAPHY.caption,
        marginTop: SPACING.xs,
    },
    scoreInfo: {
        marginTop: SPACING.xl,
        width: '100%',
    },
    scorePill: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: SPACING.md,
        borderRadius: RADIUS.lg,
        gap: SPACING.sm,
    },
    scorePillText: {
        flex: 1,
        ...TYPOGRAPHY.bodySmall,
        textAlign: 'right',
    },
    // Metrics Section
    metricsSection: {
        paddingHorizontal: LAYOUT.screenPadding,
        marginTop: SPACING.xl,
    },
    sectionTitle: {
        ...TYPOGRAPHY.h4,
        marginBottom: SPACING.lg,
    },
    metricCard: {
        borderRadius: RADIUS.xl,
        padding: SPACING.lg,
        marginBottom: SPACING.md,
    },
    metricHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SPACING.md,
    },
    metricIcon: {
        width: 44,
        height: 44,
        borderRadius: RADIUS.md,
        alignItems: 'center',
        justifyContent: 'center',
    },
    metricInfo: {
        flex: 1,
        marginHorizontal: SPACING.md,
    },
    metricTitle: {
        ...TYPOGRAPHY.label,
        marginBottom: 2,
    },
    metricValue: {
        ...TYPOGRAPHY.caption,
    },
    metricScore: {
        flexDirection: 'row',
        alignItems: 'baseline',
    },
    metricScoreValue: {
        ...TYPOGRAPHY.h3,
    },
    metricScoreMax: {
        ...TYPOGRAPHY.caption,
    },
    metricBar: {
        height: 8,
        borderRadius: 4,
        overflow: 'hidden',
    },
    metricBarFill: {
        height: '100%',
        borderRadius: 4,
    },
    metricTip: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: SPACING.md,
        padding: SPACING.sm,
        borderRadius: RADIUS.md,
        gap: SPACING.sm,
    },
    metricTipText: {
        flex: 1,
        ...TYPOGRAPHY.caption,
    },
    // Tips Section
    tipsSection: {
        paddingHorizontal: LAYOUT.screenPadding,
        marginTop: SPACING.xl,
    },
    tipCard: {
        flexDirection: 'row',
        padding: SPACING.lg,
        borderRadius: RADIUS.xl,
        marginBottom: SPACING.md,
    },
    tipIcon: {
        width: 44,
        height: 44,
        borderRadius: RADIUS.md,
        alignItems: 'center',
        justifyContent: 'center',
    },
    tipContent: {
        flex: 1,
        marginLeft: SPACING.md,
    },
    tipTitle: {
        ...TYPOGRAPHY.label,
        marginBottom: SPACING.xs,
    },
    tipDesc: {
        ...TYPOGRAPHY.bodySmall,
    },
});
