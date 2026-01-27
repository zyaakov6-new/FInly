import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
    StyleSheet,
    Text,
    View,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Modal,
    Animated,
    Easing,
    useColorScheme,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
    ChevronRight,
    TrendingUp,
    Edit3,
    X,
    Check,
    Info,
} from 'lucide-react-native';
import { useTransactions } from '../context/TransactionsContext';
import { getColors, FONTS, SPACING, RADIUS, SHADOWS, TYPOGRAPHY, LAYOUT } from '../constants/theme';

type GoalType = 'income' | 'expense' | 'margin' | 'projects';

interface GoalData {
    id: GoalType;
    title: string;
    subtitle: string;
    current: number;
    target: number;
    percentage: number;
    unit: string;
    isInverse?: boolean;
}

export default function GoalsScreen() {
    const navigation = useNavigation<any>();
    const insets = useSafeAreaInsets();
    const colorScheme = useColorScheme();
    const colors = getColors(colorScheme);

    const {
        goals,
        updateGoals,
        getMonthlyIncomeProgress,
        getMonthlyExpenseProgress,
        getProfitMarginProgress,
        getProjectCountProgress
    } = useTransactions();

    const [editModalVisible, setEditModalVisible] = useState(false);
    const [editingGoal, setEditingGoal] = useState<GoalType | null>(null);
    const [editValue, setEditValue] = useState('');

    // Animations
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(30)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 400,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 400,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    // Progress data
    const incomeProgress = getMonthlyIncomeProgress();
    const expenseProgress = getMonthlyExpenseProgress();
    const profitMarginProgress = getProfitMarginProgress();
    const projectProgress = getProjectCountProgress();

    const goalsData: GoalData[] = useMemo(() => [
        {
            id: 'income',
            title: 'יעד הכנסות',
            subtitle: 'חודשי',
            current: incomeProgress.current,
            target: incomeProgress.target,
            percentage: incomeProgress.percentage,
            unit: '₪',
        },
        {
            id: 'expense',
            title: 'תקציב הוצאות',
            subtitle: 'חודשי',
            current: expenseProgress.current,
            target: expenseProgress.limit,
            percentage: expenseProgress.percentage,
            unit: '₪',
            isInverse: true,
        },
        {
            id: 'margin',
            title: 'שולי רווח',
            subtitle: 'יעד אחוז',
            current: profitMarginProgress.current,
            target: profitMarginProgress.target,
            percentage: (profitMarginProgress.current / profitMarginProgress.target) * 100,
            unit: '%',
        },
        {
            id: 'projects',
            title: 'פרויקטים',
            subtitle: 'יעד חודשי',
            current: projectProgress.current,
            target: projectProgress.target,
            percentage: projectProgress.percentage,
            unit: '',
        },
    ], [incomeProgress, expenseProgress, profitMarginProgress, projectProgress]);

    // Calculate overall progress
    const overallProgress = useMemo(() => {
        const validGoals = goalsData.filter(g => g.target > 0);
        if (validGoals.length === 0) return 0;
        const sum = validGoals.reduce((acc, g) => {
            const pct = g.isInverse ? Math.max(0, 100 - g.percentage) : Math.min(g.percentage, 100);
            return acc + pct;
        }, 0);
        return sum / validGoals.length;
    }, [goalsData]);

    // Motivational messages
    const getMotivationalMessage = () => {
        if (overallProgress >= 100) return { text: 'מדהים! עברת את כל היעדים', emoji: '🏆' };
        if (overallProgress >= 80) return { text: 'עוד קצת ומגיעים ליעד!', emoji: '🔥' };
        if (overallProgress >= 50) return { text: 'בדרך הנכונה, המשך כך!', emoji: '⭐' };
        if (overallProgress >= 25) return { text: 'התחלה טובה, אל תוותר!', emoji: '✨' };
        return { text: 'הגדר יעדים והתחל את המסע', emoji: '🎯' };
    };

    const motivation = getMotivationalMessage();

    const handleEditGoal = (goalType: GoalType, currentTarget: number) => {
        setEditingGoal(goalType);
        setEditValue(currentTarget.toString());
        setEditModalVisible(true);
    };

    const handleSaveGoal = () => {
        const value = parseFloat(editValue);
        if (!isNaN(value) && value >= 0 && editingGoal) {
            switch (editingGoal) {
                case 'income':
                    updateGoals({ monthlyIncomeTarget: value });
                    break;
                case 'expense':
                    updateGoals({ monthlyExpenseLimit: value });
                    break;
                case 'margin':
                    updateGoals({ profitMarginTarget: value });
                    break;
                case 'projects':
                    updateGoals({ projectCountGoal: Math.floor(value) });
                    break;
            }
        }
        setEditModalVisible(false);
    };

    const getGoalStatus = (goal: GoalData) => {
        if (goal.isInverse) {
            if (goal.percentage >= 100) return { color: colors.danger, label: 'חריגה' };
            if (goal.percentage >= 80) return { color: colors.warning, label: 'קרוב לגבול' };
            return { color: colors.success, label: 'בטווח' };
        }
        if (goal.percentage >= 100) return { color: colors.success, label: 'הושג!' };
        if (goal.percentage >= 70) return { color: colors.primary, label: 'קרוב' };
        if (goal.percentage >= 30) return { color: colors.warning, label: 'בדרך' };
        return { color: colors.textTertiary, label: 'התחלה' };
    };

    // Goal Card Component
    const GoalCard = ({ goal, index }: { goal: GoalData; index: number }) => {
        const status = getGoalStatus(goal);
        const progressAnim = useRef(new Animated.Value(0)).current;

        useEffect(() => {
            Animated.timing(progressAnim, {
                toValue: Math.min(goal.percentage, 100),
                duration: 800,
                delay: index * 100,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: false,
            }).start();
        }, [goal.percentage]);

        const progressWidth = progressAnim.interpolate({
            inputRange: [0, 100],
            outputRange: ['0%', '100%'],
        });

        return (
            <Animated.View
                style={[
                    styles.goalCard,
                    { backgroundColor: colors.surface },
                    SHADOWS.sm,
                    {
                        opacity: fadeAnim,
                        transform: [{ translateY: slideAnim }],
                    }
                ]}
            >
                <View style={styles.goalCardHeader}>
                    <TouchableOpacity
                        style={[styles.editButton, { backgroundColor: colors.surfaceSecondary }]}
                        onPress={() => handleEditGoal(goal.id, goal.target)}
                    >
                        <Edit3 size={16} color={colors.textTertiary} />
                    </TouchableOpacity>
                    <View style={styles.goalTitleSection}>
                        <Text style={[styles.goalTitle, { color: colors.textPrimary }]}>
                            {goal.title}
                        </Text>
                        <Text style={[styles.goalSubtitle, { color: colors.textTertiary }]}>
                            {goal.subtitle}
                        </Text>
                    </View>
                </View>

                <View style={styles.goalValueSection}>
                    <View style={styles.goalValues}>
                        <Text style={[styles.goalCurrent, { color: colors.textPrimary }]}>
                            {goal.unit === '₪' ? '₪' : ''}{goal.current.toLocaleString()}{goal.unit === '%' ? '%' : ''}
                        </Text>
                        <Text style={[styles.goalTarget, { color: colors.textTertiary }]}>
                            מתוך {goal.unit === '₪' ? '₪' : ''}{goal.target.toLocaleString()}{goal.unit === '%' ? '%' : ''}
                        </Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: `${status.color}15` }]}>
                        <View style={[styles.statusDot, { backgroundColor: status.color }]} />
                        <Text style={[styles.statusText, { color: status.color }]}>
                            {status.label}
                        </Text>
                    </View>
                </View>

                <View style={[styles.progressBar, { backgroundColor: colors.surfaceSecondary }]}>
                    <Animated.View
                        style={[
                            styles.progressFill,
                            {
                                width: progressWidth,
                                backgroundColor: status.color,
                            }
                        ]}
                    />
                </View>

                <Text style={[styles.progressText, { color: colors.textTertiary }]}>
                    {goal.isInverse
                        ? goal.percentage >= 100
                            ? `חריגה של ₪${(goal.current - goal.target).toLocaleString()}`
                            : `נותרו ₪${(goal.target - goal.current).toLocaleString()}`
                        : goal.percentage >= 100
                            ? 'היעד הושג!'
                            : `חסרים עוד ${goal.unit === '₪' ? '₪' : ''}${(goal.target - goal.current).toLocaleString()}${goal.unit === '%' ? '%' : ''}`
                    }
                </Text>
            </Animated.View>
        );
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />

            {/* Header */}
            <View style={[styles.header, { paddingTop: insets.top + SPACING.md }]}>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={[styles.headerButton, { backgroundColor: colors.surfaceSecondary }]}
                >
                    <ChevronRight size={24} color={colors.textSecondary} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
                    היעדים שלי
                </Text>
                <View style={{ width: 44 }} />
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* Hero Section */}
                <Animated.View
                    style={[
                        styles.heroSection,
                        { backgroundColor: colors.surface },
                        SHADOWS.md,
                        {
                            opacity: fadeAnim,
                            transform: [{ translateY: slideAnim }],
                        }
                    ]}
                >
                    <View style={styles.heroTop}>
                        <View style={styles.heroText}>
                            <Text style={[styles.heroEmoji]}>{motivation.emoji}</Text>
                            <Text style={[styles.heroTitle, { color: colors.textPrimary }]}>
                                {motivation.text}
                            </Text>
                            <Text style={[styles.heroSubtitle, { color: colors.textTertiary }]}>
                                {new Date().toLocaleDateString('he-IL', { month: 'long', year: 'numeric' })}
                            </Text>
                        </View>
                        <View style={styles.heroProgress}>
                            <View style={[styles.progressCircle, { borderColor: colors.surfaceSecondary }]}>
                                <View style={[
                                    styles.progressCircleInner,
                                    { backgroundColor: colors.surface }
                                ]}>
                                    <Text style={[styles.circlePercentage, { color: colors.primary }]}>
                                        {Math.round(overallProgress)}%
                                    </Text>
                                    <Text style={[styles.circleLabel, { color: colors.textTertiary }]}>
                                        הושג
                                    </Text>
                                </View>
                            </View>
                        </View>
                    </View>

                    <View style={[styles.heroDivider, { backgroundColor: colors.border }]} />

                    <View style={styles.heroStats}>
                        <View style={styles.heroStat}>
                            <Text style={[styles.heroStatValue, { color: colors.success }]}>
                                {goalsData.filter(g => g.percentage >= 100 && !g.isInverse).length}
                            </Text>
                            <Text style={[styles.heroStatLabel, { color: colors.textTertiary }]}>
                                הושגו
                            </Text>
                        </View>
                        <View style={[styles.heroStatDivider, { backgroundColor: colors.border }]} />
                        <View style={styles.heroStat}>
                            <Text style={[styles.heroStatValue, { color: colors.primary }]}>
                                {goalsData.filter(g => g.percentage > 0 && g.percentage < 100).length}
                            </Text>
                            <Text style={[styles.heroStatLabel, { color: colors.textTertiary }]}>
                                בתהליך
                            </Text>
                        </View>
                        <View style={[styles.heroStatDivider, { backgroundColor: colors.border }]} />
                        <View style={styles.heroStat}>
                            <Text style={[styles.heroStatValue, { color: colors.textPrimary }]}>
                                {goalsData.length}
                            </Text>
                            <Text style={[styles.heroStatLabel, { color: colors.textTertiary }]}>
                                סה״כ יעדים
                            </Text>
                        </View>
                    </View>
                </Animated.View>

                {/* Section Title */}
                <View style={styles.sectionHeader}>
                    <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
                        היעדים שלך
                    </Text>
                    <Text style={[styles.sectionSubtitle, { color: colors.textTertiary }]}>
                        לחץ על עפרון לעריכה
                    </Text>
                </View>

                {/* Goal Cards */}
                {goalsData.map((goal, index) => (
                    <GoalCard key={goal.id} goal={goal} index={index} />
                ))}

                {/* Tips Section */}
                <View style={[styles.tipsCard, { backgroundColor: colors.primaryMuted }]}>
                    <View style={styles.tipsIcon}>
                        <Info size={20} color={colors.primary} />
                    </View>
                    <View style={styles.tipsContent}>
                        <Text style={[styles.tipsTitle, { color: colors.primary }]}>
                            טיפ להצלחה
                        </Text>
                        <Text style={[styles.tipsText, { color: colors.textSecondary }]}>
                            הגדר יעדים ריאליים והתאם אותם מדי חודש לפי הביצועים שלך. יעדים ברי-השגה מגבירים מוטיבציה!
                        </Text>
                    </View>
                </View>

                <View style={{ height: 120 }} />
            </ScrollView>

            {/* Edit Modal */}
            <Modal
                visible={editModalVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setEditModalVisible(false)}
            >
                <View style={[styles.modalOverlay, { backgroundColor: colors.overlay }]}>
                    <View style={[styles.modalContent, { backgroundColor: colors.surface }, SHADOWS.xl]}>
                        <View style={styles.modalHeader}>
                            <TouchableOpacity
                                onPress={() => setEditModalVisible(false)}
                                style={[styles.modalCloseButton, { backgroundColor: colors.surfaceSecondary }]}
                            >
                                <X size={20} color={colors.textSecondary} />
                            </TouchableOpacity>
                            <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
                                עריכת יעד
                            </Text>
                            <View style={{ width: 36 }} />
                        </View>

                        <Text style={[styles.modalLabel, { color: colors.textSecondary }]}>
                            הזן ערך חדש
                        </Text>
                        <TextInput
                            style={[
                                styles.modalInput,
                                {
                                    backgroundColor: colors.surfaceSecondary,
                                    borderColor: colors.border,
                                    color: colors.textPrimary,
                                }
                            ]}
                            value={editValue}
                            onChangeText={setEditValue}
                            keyboardType="numeric"
                            placeholder="0"
                            placeholderTextColor={colors.textQuaternary}
                            textAlign="center"
                        />

                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={[styles.modalButton, { backgroundColor: colors.surfaceSecondary }]}
                                onPress={() => setEditModalVisible(false)}
                            >
                                <Text style={[styles.modalButtonText, { color: colors.textPrimary }]}>
                                    ביטול
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalButton, { backgroundColor: colors.primary }]}
                                onPress={handleSaveGoal}
                            >
                                <Check size={18} color="#FFFFFF" style={{ marginLeft: SPACING.xs }} />
                                <Text style={[styles.modalButtonText, { color: '#FFFFFF' }]}>
                                    שמור
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
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

    // Hero Section
    heroSection: {
        borderRadius: RADIUS.xl,
        padding: SPACING['2xl'],
        marginBottom: SPACING.xl,
    },
    heroTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    heroText: {
        flex: 1,
        marginLeft: SPACING.lg,
    },
    heroEmoji: {
        fontSize: 32,
        marginBottom: SPACING.sm,
    },
    heroTitle: {
        ...TYPOGRAPHY.h3,
        marginBottom: SPACING.xs,
    },
    heroSubtitle: {
        ...TYPOGRAPHY.bodySmall,
    },
    heroProgress: {
        alignItems: 'center',
    },
    progressCircle: {
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    progressCircleInner: {
        width: 80,
        height: 80,
        borderRadius: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    circlePercentage: {
        ...TYPOGRAPHY.h2,
    },
    circleLabel: {
        ...TYPOGRAPHY.captionSmall,
    },
    heroDivider: {
        height: 1,
        marginVertical: SPACING.xl,
    },
    heroStats: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    heroStat: {
        alignItems: 'center',
    },
    heroStatValue: {
        ...TYPOGRAPHY.h3,
        marginBottom: SPACING.xs,
    },
    heroStatLabel: {
        ...TYPOGRAPHY.caption,
    },
    heroStatDivider: {
        width: 1,
        height: 40,
    },

    // Section Header
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.lg,
    },
    sectionTitle: {
        ...TYPOGRAPHY.h4,
    },
    sectionSubtitle: {
        ...TYPOGRAPHY.caption,
    },

    // Goal Card
    goalCard: {
        borderRadius: RADIUS.xl,
        padding: SPACING.lg,
        marginBottom: SPACING.md,
    },
    goalCardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: SPACING.lg,
    },
    editButton: {
        width: 36,
        height: 36,
        borderRadius: RADIUS.sm,
        alignItems: 'center',
        justifyContent: 'center',
    },
    goalTitleSection: {
        alignItems: 'flex-end',
    },
    goalTitle: {
        ...TYPOGRAPHY.h4,
        marginBottom: 2,
    },
    goalSubtitle: {
        ...TYPOGRAPHY.caption,
    },
    goalValueSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        marginBottom: SPACING.md,
    },
    goalValues: {
        alignItems: 'flex-start',
    },
    goalCurrent: {
        ...TYPOGRAPHY.h2,
        marginBottom: 2,
    },
    goalTarget: {
        ...TYPOGRAPHY.bodySmall,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.sm,
        borderRadius: RADIUS.full,
    },
    statusDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        marginLeft: SPACING.xs,
    },
    statusText: {
        ...TYPOGRAPHY.caption,
        fontFamily: FONTS.medium,
    },
    progressBar: {
        height: 8,
        borderRadius: 4,
        overflow: 'hidden',
        marginBottom: SPACING.sm,
    },
    progressFill: {
        height: '100%',
        borderRadius: 4,
    },
    progressText: {
        ...TYPOGRAPHY.caption,
        textAlign: 'left',
    },

    // Tips Card
    tipsCard: {
        flexDirection: 'row',
        borderRadius: RADIUS.lg,
        padding: SPACING.lg,
        marginTop: SPACING.lg,
    },
    tipsIcon: {
        width: 40,
        height: 40,
        borderRadius: RADIUS.sm,
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: SPACING.md,
    },
    tipsContent: {
        flex: 1,
    },
    tipsTitle: {
        ...TYPOGRAPHY.label,
        marginBottom: SPACING.xs,
    },
    tipsText: {
        ...TYPOGRAPHY.bodySmall,
        lineHeight: 20,
    },

    // Modal
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: SPACING['2xl'],
    },
    modalContent: {
        width: '100%',
        maxWidth: 320,
        borderRadius: RADIUS.xl,
        padding: SPACING['2xl'],
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.xl,
    },
    modalCloseButton: {
        width: 36,
        height: 36,
        borderRadius: RADIUS.sm,
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalTitle: {
        ...TYPOGRAPHY.h4,
    },
    modalLabel: {
        ...TYPOGRAPHY.caption,
        textAlign: 'center',
        marginBottom: SPACING.sm,
    },
    modalInput: {
        height: 64,
        borderRadius: RADIUS.md,
        borderWidth: 1,
        ...TYPOGRAPHY.h2,
        marginBottom: SPACING.xl,
    },
    modalButtons: {
        flexDirection: 'row',
        gap: SPACING.md,
    },
    modalButton: {
        flex: 1,
        height: 48,
        borderRadius: RADIUS.md,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalButtonText: {
        ...TYPOGRAPHY.label,
    },
});
