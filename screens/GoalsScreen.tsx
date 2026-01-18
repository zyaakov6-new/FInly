import React, { useState } from 'react';
import {
    StyleSheet,
    Text,
    View,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Modal,
    Platform
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft, Target, TrendingUp, DollarSign, Briefcase, Edit2, X } from 'lucide-react-native';
import { useTransactions } from '../context/TransactionsContext';
import { COLORS, FONTS } from '../constants/theme';

export default function GoalsScreen() {
    const navigation = useNavigation<any>();
    const {
        goals,
        updateGoals,
        getMonthlyIncomeProgress,
        getMonthlyExpenseProgress,
        getProfitMarginProgress,
        getProjectCountProgress
    } = useTransactions();

    const [editModalVisible, setEditModalVisible] = useState(false);
    const [editingGoal, setEditingGoal] = useState<string | null>(null);
    const [editValue, setEditValue] = useState('');

    const incomeProgress = getMonthlyIncomeProgress();
    const expenseProgress = getMonthlyExpenseProgress();
    const profitMarginProgress = getProfitMarginProgress();
    const projectProgress = getProjectCountProgress();

    const handleEditGoal = (goalType: string, currentValue: number) => {
        setEditingGoal(goalType);
        setEditValue(currentValue.toString());
        setEditModalVisible(true);
    };

    const handleSaveGoal = () => {
        const value = parseFloat(editValue);
        if (!isNaN(value) && value >= 0) {
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

    const GoalCard = ({
        title,
        icon: Icon,
        current,
        target,
        percentage,
        unit,
        goalType,
        isExpense = false
    }: any) => {
        const isOverLimit = isExpense && percentage > 100;
        const progressColor = isExpense
            ? (isOverLimit ? COLORS.danger : COLORS.success)
            : (percentage >= 100 ? COLORS.success : COLORS.primary);

        return (
            <View style={styles.goalCard}>
                <View style={styles.goalHeader}>
                    <View style={styles.goalTitleRow}>
                        <View style={[styles.iconBox, { backgroundColor: `${progressColor}20` }]}>
                            <Icon size={24} color={progressColor} />
                        </View>
                        <Text style={styles.goalTitle}>{title}</Text>
                    </View>
                    <TouchableOpacity onPress={() => handleEditGoal(goalType, target)}>
                        <Edit2 size={20} color={COLORS.textPrimary} />
                    </TouchableOpacity>
                </View>

                <View style={styles.progressSection}>
                    <View style={styles.valuesRow}>
                        <Text style={styles.currentValue}>
                            {unit === '₪' ? `₪${current.toLocaleString()}` : `${current}${unit}`}
                        </Text>
                        <Text style={styles.targetValue}>
                            / {unit === '₪' ? `₪${target.toLocaleString()}` : `${target}${unit}`}
                        </Text>
                    </View>

                    <View style={styles.progressBarContainer}>
                        <View
                            style={[
                                styles.progressBarFill,
                                {
                                    width: `${Math.min(percentage, 100)}%`,
                                    backgroundColor: progressColor
                                }
                            ]}
                        />
                    </View>

                    <Text style={[styles.percentageText, { color: progressColor }]}>
                        {percentage.toFixed(1)}% {isExpense ? 'מהתקציב' : 'מהיעד'}
                    </Text>
                </View>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <ArrowLeft size={24} color={COLORS.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>היעדים שלי</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                <View style={styles.introSection}>
                    <Target size={32} color={COLORS.primary} />
                    <Text style={styles.introText}>
                        הגדר יעדים חודשיים ועקוב אחר ההתקדמות שלך לקראת הצלחה פיננסית
                    </Text>
                </View>

                <GoalCard
                    title="יעד הכנסות חודשי"
                    icon={TrendingUp}
                    current={incomeProgress.current}
                    target={incomeProgress.target}
                    percentage={incomeProgress.percentage}
                    unit="₪"
                    goalType="income"
                />

                <GoalCard
                    title="תקציב הוצאות חודשי"
                    icon={DollarSign}
                    current={expenseProgress.current}
                    target={expenseProgress.limit}
                    percentage={expenseProgress.percentage}
                    unit="₪"
                    goalType="expense"
                    isExpense={true}
                />

                <GoalCard
                    title="יעד שולי רווח"
                    icon={TrendingUp}
                    current={profitMarginProgress.current}
                    target={profitMarginProgress.target}
                    percentage={(profitMarginProgress.current / profitMarginProgress.target) * 100}
                    unit="%"
                    goalType="margin"
                />

                <GoalCard
                    title="יעד פרויקטים"
                    icon={Briefcase}
                    current={projectProgress.current}
                    target={projectProgress.target}
                    percentage={projectProgress.percentage}
                    unit=""
                    goalType="projects"
                />

                <View style={{ height: 40 }} />
            </ScrollView>

            {/* Edit Modal */}
            <Modal
                visible={editModalVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setEditModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>עריכת יעד</Text>
                            <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                                <X size={24} color={COLORS.textPrimary} />
                            </TouchableOpacity>
                        </View>

                        <TextInput
                            style={styles.modalInput}
                            value={editValue}
                            onChangeText={setEditValue}
                            keyboardType="numeric"
                            placeholder="הכנס ערך חדש"
                            placeholderTextColor={COLORS.textTertiary}
                            textAlign="right"
                        />

                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.cancelButton]}
                                onPress={() => setEditModalVisible(false)}
                            >
                                <Text style={styles.cancelButtonText}>ביטול</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.saveButton]}
                                onPress={handleSaveGoal}
                            >
                                <Text style={styles.saveButtonText}>שמור</Text>
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
        backgroundColor: COLORS.background,
        paddingTop: Platform.OS === 'android' ? 40 : 0,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    backButton: {
        padding: 8,
    },
    headerTitle: {
        fontSize: 20,
        color: COLORS.textPrimary,
        fontFamily: FONTS.bold,
    },
    scrollContent: {
        padding: 20,
    },
    introSection: {
        alignItems: 'center',
        marginBottom: 32,
        padding: 20,
        backgroundColor: COLORS.surface,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    introText: {
        fontSize: 16,
        color: COLORS.textPrimary,
        textAlign: 'center',
        marginTop: 12,
        fontFamily: FONTS.regular,
        lineHeight: 24,
    },
    goalCard: {
        backgroundColor: COLORS.surface,
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: COLORS.border,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    goalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    goalTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    iconBox: {
        width: 48,
        height: 48,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    goalTitle: {
        fontSize: 18,
        color: COLORS.textPrimary,
        fontFamily: FONTS.bold,
    },
    progressSection: {
        gap: 12,
    },
    valuesRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
        gap: 4,
    },
    currentValue: {
        fontSize: 28,
        color: COLORS.textPrimary,
        fontFamily: FONTS.bold,
    },
    targetValue: {
        fontSize: 16,
        color: COLORS.textSecondary,
        fontFamily: FONTS.regular,
    },
    progressBarContainer: {
        height: 12,
        backgroundColor: COLORS.border,
        borderRadius: 6,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        borderRadius: 6,
    },
    percentageText: {
        fontSize: 14,
        fontFamily: FONTS.medium,
        textAlign: 'right',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContent: {
        backgroundColor: COLORS.surface,
        borderRadius: 20,
        padding: 24,
        width: '100%',
        maxWidth: 400,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 20,
        color: COLORS.textPrimary,
        fontFamily: FONTS.bold,
    },
    modalInput: {
        backgroundColor: COLORS.background,
        borderRadius: 12,
        padding: 16,
        fontSize: 18,
        color: COLORS.textPrimary,
        fontFamily: FONTS.medium,
        borderWidth: 1,
        borderColor: COLORS.border,
        marginBottom: 20,
    },
    modalButtons: {
        flexDirection: 'row',
        gap: 12,
    },
    modalButton: {
        flex: 1,
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    cancelButton: {
        backgroundColor: COLORS.background,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    saveButton: {
        backgroundColor: COLORS.primary,
    },
    cancelButtonText: {
        color: COLORS.textPrimary,
        fontSize: 16,
        fontFamily: FONTS.medium,
    },
    saveButtonText: {
        color: COLORS.white,
        fontSize: 16,
        fontFamily: FONTS.bold,
    },
});
