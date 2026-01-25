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
        goalType,
        color
    }: any) => {
        return (
            <View style={styles.goalCard}>
                <View style={styles.goalCardHeader}>
                    <TouchableOpacity
                        style={styles.editButton}
                        onPress={() => handleEditGoal(goalType, target)}
                    >
                        <Edit2 size={22} color="rgba(255,255,255,0.4)" />
                    </TouchableOpacity>

                    <View style={styles.goalInfoContainer}>
                        <Text style={styles.goalCardTitle}>{title}</Text>
                        <View style={[styles.cardIconBox, { backgroundColor: `${color}15` }]}>
                            <Icon size={22} color={color} />
                        </View>
                    </View>
                </View>

                <View style={styles.goalProgressSection}>
                    <View style={styles.goalValueRow}>
                        <Text style={styles.goalValueTarget}>/ {target.toLocaleString()}</Text>
                        <Text style={styles.goalValueCurrent}>{current.toLocaleString()}</Text>
                    </View>

                    <View style={styles.goalProgressBar}>
                        <View
                            style={[
                                styles.goalProgressFill,
                                { width: `${Math.min(percentage, 100)}%`, backgroundColor: color }
                            ]}
                        />
                    </View>

                    <Text style={[styles.goalPercentageText, { color: color }]}>
                        {percentage.toFixed(1)}% מהיעד
                    </Text>
                </View>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={[styles.header, { paddingTop: Platform.OS === 'ios' ? 60 : 40 }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}>
                    <ArrowLeft size={24} color="#FFFFFF" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>היעדים שלי</Text>
                <View style={{ width: 44 }} />
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* Intro Card - Refined to match image */}
                <View style={styles.introSection}>
                    <View style={styles.targetIconCircle}>
                        <Target size={32} color="#8a5cf5" />
                    </View>
                    <Text style={styles.introText}>
                        הגדר יעדים חודשיים ועקוב אחר ההתקדמות שלך לקראת הצלחה פיננסית
                    </Text>
                </View>

                {/* Monthly Income Goal - Pink/Coral */}
                <GoalCard
                    title="יעד הכנסות חודשי"
                    icon={TrendingUp}
                    current={incomeProgress.current}
                    target={incomeProgress.target}
                    percentage={incomeProgress.percentage}
                    unit="₪"
                    goalType="income"
                    color="#ff4785"
                />

                {/* Monthly Expense Budget - Green */}
                <GoalCard
                    title="תקציב הוצאות חודשי"
                    icon={DollarSign}
                    current={expenseProgress.current}
                    target={expenseProgress.limit}
                    percentage={expenseProgress.percentage}
                    unit="₪"
                    goalType="expense"
                    isExpense={true}
                    color="#00d4aa"
                />

                {/* Profit Margin Goal - Blue */}
                <GoalCard
                    title="יעד שולי רווח"
                    icon={TrendingUp}
                    current={profitMarginProgress.current}
                    target={profitMarginProgress.target}
                    percentage={(profitMarginProgress.current / profitMarginProgress.target) * 100}
                    unit="%"
                    goalType="margin"
                    color="#3b82f6"
                />

                {/* Project Count Goal - Red/Coral */}
                <GoalCard
                    title="יעד פרויקטים"
                    icon={Briefcase}
                    current={projectProgress.current}
                    target={projectProgress.target}
                    percentage={projectProgress.percentage}
                    unit=""
                    goalType="projects"
                    color="#ff6b6b"
                />

                <View style={{ height: 100 }} />
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
        backgroundColor: '#050505',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingBottom: 20,
        backgroundColor: '#050505',
    },
    headerButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(255,255,255,0.05)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: 20,
        color: '#FFFFFF',
        fontFamily: FONTS.bold,
        flex: 1,
        textAlign: 'center',
    },
    scrollContent: {
        paddingHorizontal: 20,
    },
    introSection: {
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderRadius: 32,
        padding: 30,
        alignItems: 'center',
        marginBottom: 30,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    targetIconCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(138, 92, 245, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
        borderWidth: 1,
        borderColor: 'rgba(138, 92, 245, 0.2)',
    },
    introText: {
        fontSize: 16,
        color: 'rgba(255,255,255,0.6)',
        textAlign: 'center',
        fontFamily: FONTS.regular,
        lineHeight: 24,
    },

    // Goal Card Styles
    goalCard: {
        backgroundColor: 'rgba(255,255,255,0.04)',
        borderRadius: 32,
        padding: 24,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    goalCardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 30,
    },
    editButton: {
        padding: 8,
    },
    goalInfoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 15,
    },
    goalCardTitle: {
        fontSize: 19,
        color: '#FFFFFF',
        fontFamily: FONTS.bold,
    },
    cardIconBox: {
        width: 44,
        height: 44,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
    goalProgressSection: {
        gap: 15,
    },
    goalValueRow: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'baseline',
        gap: 8,
    },
    goalValueCurrent: {
        fontSize: 32,
        color: '#FFFFFF',
        fontFamily: FONTS.bold,
    },
    goalValueTarget: {
        fontSize: 16,
        color: 'rgba(255,255,255,0.4)',
        fontFamily: FONTS.medium,
    },
    goalProgressBar: {
        height: 8,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 4,
        overflow: 'hidden',
    },
    goalProgressFill: {
        height: '100%',
        borderRadius: 4,
    },
    goalPercentageText: {
        fontSize: 14,
        fontFamily: FONTS.bold,
        textAlign: 'left',
    },

    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContent: {
        backgroundColor: '#151515',
        borderRadius: 24,
        padding: 24,
        width: '100%',
        maxWidth: 400,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    modalHeader: {
        flexDirection: 'row-reverse',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    modalTitle: {
        fontSize: 18,
        color: '#FFFFFF',
        fontFamily: FONTS.bold,
    },
    modalInput: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 16,
        padding: 18,
        fontSize: 20,
        color: '#FFFFFF',
        fontFamily: FONTS.medium,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        marginBottom: 24,
    },
    modalButtons: {
        flexDirection: 'row',
        gap: 12,
    },
    modalButton: {
        flex: 1,
        padding: 16,
        borderRadius: 16,
        alignItems: 'center',
    },
    cancelButton: {
        backgroundColor: 'rgba(255,255,255,0.05)',
    },
    saveButton: {
        backgroundColor: '#8a5cf5',
    },
    cancelButtonText: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: 16,
        fontFamily: FONTS.medium,
    },
    saveButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontFamily: FONTS.bold,
    },
});
