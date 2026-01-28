import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Receipt, ChevronLeft, Camera, X } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';
import { getColors, FONTS, SPACING, RADIUS, SHADOWS, TYPOGRAPHY, LAYOUT } from '../constants/theme';

interface ExpenseWithoutReceipt {
    id: string;
    title: string;
    category?: string;
    amount: string;
    date: string | Date;
}

interface Props {
    expenses: ExpenseWithoutReceipt[];
    onDismiss?: () => void;
}

export function ReceiptReminders({ expenses, onDismiss }: Props) {
    const { resolvedTheme } = useTheme();
    const colors = getColors(resolvedTheme);
    const navigation = useNavigation<any>();

    if (expenses.length === 0) {
        return null;
    }

    const handleAddReceipt = (expense: ExpenseWithoutReceipt) => {
        navigation.navigate('AddExpense', { expense, focusReceipt: true });
    };

    const formatDate = (date: string | Date) => {
        const d = new Date(date);
        return d.toLocaleDateString('he-IL', { day: 'numeric', month: 'short' });
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.warningMuted }, SHADOWS.sm]}>
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <View style={[styles.iconBg, { backgroundColor: colors.warning }]}>
                        <Receipt size={16} color="#FFFFFF" />
                    </View>
                    <View>
                        <Text style={[styles.title, { color: colors.textPrimary }]}>
                            קבלות חסרות
                        </Text>
                        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                            {expenses.length} הוצאות ללא קבלה
                        </Text>
                    </View>
                </View>
                {onDismiss && (
                    <TouchableOpacity onPress={onDismiss} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                        <X size={18} color={colors.textTertiary} />
                    </TouchableOpacity>
                )}
            </View>

            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.expensesList}
            >
                {expenses.slice(0, 5).map((expense) => (
                    <TouchableOpacity
                        key={expense.id}
                        style={[styles.expenseCard, { backgroundColor: colors.surface }]}
                        onPress={() => handleAddReceipt(expense)}
                        activeOpacity={0.7}
                    >
                        <View style={styles.expenseInfo}>
                            <Text style={[styles.expenseCategory, { color: colors.textPrimary }]} numberOfLines={1}>
                                {expense.category || 'הוצאה'}
                            </Text>
                            <Text style={[styles.expenseAmount, { color: colors.danger }]}>
                                {expense.amount}
                            </Text>
                            <Text style={[styles.expenseDate, { color: colors.textTertiary }]}>
                                {formatDate(expense.date)}
                            </Text>
                        </View>
                        <View style={[styles.addReceiptButton, { backgroundColor: colors.primaryMuted }]}>
                            <Camera size={14} color={colors.primary} />
                        </View>
                    </TouchableOpacity>
                ))}

                {expenses.length > 5 && (
                    <TouchableOpacity
                        style={[styles.viewAllCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
                        onPress={() => navigation.navigate('Expenses')}
                    >
                        <Text style={[styles.viewAllText, { color: colors.primary }]}>
                            +{expenses.length - 5} נוספים
                        </Text>
                        <ChevronLeft size={16} color={colors.primary} />
                    </TouchableOpacity>
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginHorizontal: LAYOUT.screenPadding,
        marginBottom: SPACING.lg,
        borderRadius: RADIUS.xl,
        padding: SPACING.lg,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: SPACING.md,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.sm,
    },
    iconBg: {
        width: 32,
        height: 32,
        borderRadius: RADIUS.sm,
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        ...TYPOGRAPHY.label,
    },
    subtitle: {
        ...TYPOGRAPHY.caption,
    },
    expensesList: {
        gap: SPACING.sm,
        paddingTop: SPACING.xs,
    },
    expenseCard: {
        width: 120,
        borderRadius: RADIUS.lg,
        padding: SPACING.md,
    },
    expenseInfo: {
        marginBottom: SPACING.sm,
    },
    expenseCategory: {
        ...TYPOGRAPHY.captionSmall,
        fontFamily: FONTS.medium,
        marginBottom: 2,
    },
    expenseAmount: {
        ...TYPOGRAPHY.label,
        marginBottom: 2,
    },
    expenseDate: {
        ...TYPOGRAPHY.captionSmall,
    },
    addReceiptButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: SPACING.xs,
        borderRadius: RADIUS.sm,
        gap: SPACING.xs,
    },
    viewAllCard: {
        width: 100,
        borderRadius: RADIUS.lg,
        padding: SPACING.md,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderStyle: 'dashed',
    },
    viewAllText: {
        ...TYPOGRAPHY.caption,
        fontFamily: FONTS.medium,
        marginBottom: SPACING.xs,
    },
});
