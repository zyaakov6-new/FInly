import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Platform, ScrollView, Alert, Dimensions } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ChevronRight, Edit2, Trash2, Mail, Printer, Check, Heart, ArrowLeft } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTransactions, Transaction } from '../context/TransactionsContext';
import { COLORS, FONTS } from '../constants/theme';

const { width } = Dimensions.get('window');

// Helper to parse "₪ 5,000" -> 5000
const parseAmount = (amountStr?: string) => {
    if (!amountStr) return 0;
    return parseFloat(amountStr.replace(/[^0-9.-]+/g, "")) || 0;
};

export default function InvoiceDetailsScreen() {
    const insets = useSafeAreaInsets();
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const { transactionId } = route.params || {};
    const { transactions, updateTransaction, deleteTransaction } = useTransactions();

    // Find transaction
    const transaction = transactions.find(t => t.id === transactionId);

    if (!transaction) {
        return (
            <View style={styles.container}>
                <View style={[styles.header, { paddingTop: insets.top }]}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <ArrowLeft size={24} color="#FFF" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>פרטי עסקה</Text>
                    <View style={{ width: 24 }} />
                </View>
                <View style={styles.center}>
                    <Text style={{ color: '#fff' }}>עסקה לא נמצאה</Text>
                </View>
            </View>
        );
    }

    // Calculations
    const invAmount = parseAmount(transaction.amount);
    const myCost = parseAmount(transaction.cost);

    const linkedExpenses = transactions.filter(t =>
        t.type === 'expense' &&
        t.clientName === transaction.clientName &&
        transaction.clientName
    );

    const expensesSum = linkedExpenses.reduce((sum, exp) => sum + parseAmount(exp.amount), 0);
    const totalExpenses = myCost + expensesSum;
    const netProfit = invAmount - totalExpenses;
    const margin = invAmount > 0 ? (netProfit / invAmount) * 100 : 0;

    // Status Logic
    const isOverdue = (date: Date) => {
        const today = new Date();
        const diffTime = today.getTime() - new Date(date).getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays > 30;
    };
    const _isOverdue = transaction.status === 'pending' && isOverdue(transaction.date);

    // Actions
    const handleMarkPaid = () => {
        const today = new Date();
        updateTransaction(transaction.id, {
            status: 'paid',
            paidDate: today // Set paid date
        });
        Alert.alert('סטטוס עודכן', 'החשבונית סומנה כשולמה בהצלחה!');
    };

    const handleDelete = () => {
        Alert.alert(
            'מחיקת חשבונית',
            'האם אתה בטוח שברצונך למחוק חשבונית זו? פעולה זו אינה הפיכה.',
            [
                { text: 'ביטול', style: 'cancel' },
                {
                    text: 'מחק',
                    style: 'destructive',
                    onPress: () => {
                        deleteTransaction(transaction.id);
                        navigation.goBack();
                    }
                }
            ]
        );
    };

    return (
        <View style={styles.container}>
            <StatusBar style="light" backgroundColor={COLORS.background} />

            <View style={[styles.header, { paddingTop: insets.top }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <ArrowLeft size={24} color={COLORS.white} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{transaction.title}</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>

                {/* 1. Info Card */}
                <View style={styles.detailCard}>
                    <View style={styles.detailRow}>
                        <Text style={styles.label}>לקוח:</Text>
                        <Text style={styles.value}>{transaction.clientName || '-'}</Text>
                    </View>
                    <View style={styles.detailRow}>
                        <Text style={styles.label}>סכום:</Text>
                        <Text style={[styles.value, { color: COLORS.primary, fontFamily: FONTS.bold }]}>{transaction.amount}</Text>
                    </View>
                    <View style={styles.detailRow}>
                        <Text style={styles.label}>תאריך:</Text>
                        <Text style={styles.value}>{new Date(transaction.date).toLocaleDateString()}</Text>
                    </View>
                    <View style={styles.detailRow}>
                        <Text style={styles.label}>סטטוס:</Text>
                        {transaction.status === 'paid' ? (
                            <View style={{ alignItems: 'flex-end' }}>
                                <Text style={[styles.value, { color: COLORS.success }]}>שולם</Text>
                                <Text style={styles.subValue}>
                                    {transaction.paidDate ? `ב-${new Date(transaction.paidDate).toLocaleDateString()}` : 'תאריך תשלום לא הוזן'}
                                </Text>
                            </View>
                        ) : (
                            <Text style={[styles.value, { color: _isOverdue ? COLORS.danger : COLORS.warning }]}>
                                {_isOverdue ? 'בתנודה' : 'בתהליך'}
                            </Text>
                        )}
                    </View>
                    {transaction.notes && (
                        <View style={{ marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: COLORS.border }}>
                            <Text style={styles.label}>תיאור:</Text>
                            <Text style={[styles.value, { marginTop: 4, textAlign: 'right' }]}>{transaction.notes}</Text>
                        </View>
                    )}
                </View>

                {/* 2. Profit Card */}
                {transaction.type === 'invoice' && (
                    <View style={[styles.detailCard, { backgroundColor: COLORS.surface, borderColor: COLORS.primary, borderWidth: 1 }]}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                            <Heart size={20} color={COLORS.primary} fill={COLORS.primary} />
                            <Text style={[styles.cardTitle, { fontSize: 18, color: COLORS.primary }]}>
                                רווח: ₪{netProfit.toLocaleString()} ({margin.toFixed(0)}%)
                            </Text>
                        </View>

                        <View style={styles.mathRow}>
                            <Text style={styles.mathText}>הכנסה:</Text>
                            <Text style={styles.mathVal}>{transaction.amount}</Text>
                        </View>
                        <View style={styles.mathRow}>
                            <Text style={styles.mathText}>פחות הוצאות:</Text>
                            <Text style={[styles.mathVal, { color: COLORS.danger }]}>-₪{totalExpenses.toLocaleString()}</Text>
                        </View>
                        <View style={styles.divider} />
                        <View style={styles.mathRow}>
                            <Text style={[styles.mathText, { fontFamily: FONTS.bold, color: COLORS.textPrimary }]}>רווח נטו:</Text>
                            <Text style={[styles.mathVal, { fontFamily: FONTS.bold, color: COLORS.primary }]}>₪{netProfit.toLocaleString()}</Text>
                        </View>
                    </View>
                )}

                {/* 3. Linked Expenses */}
                {transaction.type === 'invoice' && (
                    <>
                        <Text style={styles.sectionTitle}>הוצאות מקושרות</Text>
                        <View style={styles.detailCard}>
                            {transaction.cost && parseAmount(transaction.cost) > 0 && (
                                <View style={styles.expenseRow}>
                                    <Text style={styles.expName}>עלות שירות (פנימי)</Text>
                                    <Text style={styles.expAmount}>-₪{parseAmount(transaction.cost)}</Text>
                                </View>
                            )}
                            {linkedExpenses.map(exp => (
                                <View key={exp.id} style={styles.expenseRow}>
                                    <Text style={styles.expName}>{exp.title}</Text>
                                    <Text style={styles.expAmount}>-{exp.amount}</Text>
                                </View>
                            ))}
                            {linkedExpenses.length === 0 && !transaction.cost && (
                                <Text style={{ color: COLORS.textTertiary, textAlign: 'center' }}>אין הוצאות מקושרות</Text>
                            )}
                        </View>
                    </>
                )}

                {/* 4. Actions */}
                <View style={styles.actionGrid}>
                    <TouchableOpacity style={styles.actionBtn}>
                        <Edit2 size={20} color={COLORS.white} />
                        <Text style={styles.actionLabel}>ערוך</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionBtn} onPress={handleDelete}>
                        <Trash2 size={20} color={COLORS.danger} />
                        <Text style={[styles.actionLabel, { color: COLORS.danger }]}>מחק</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionBtn}>
                        <Mail size={20} color={COLORS.white} />
                        <Text style={styles.actionLabel}>שלח</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionBtn}>
                        <Printer size={20} color={COLORS.white} />
                        <Text style={styles.actionLabel}>הדפס</Text>
                    </TouchableOpacity>
                </View>

                {transaction.status !== 'paid' && (
                    <TouchableOpacity
                        style={styles.markPaidBtn}
                        onPress={handleMarkPaid}
                    >
                        <Text style={styles.markPaidText}>סימן כשולם</Text>
                        <Check size={20} color={COLORS.white} />
                    </TouchableOpacity>
                )}

                <View style={{ height: 40 }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingBottom: 20,
        paddingHorizontal: 20,
        backgroundColor: COLORS.background,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    headerTitle: {
        color: COLORS.textPrimary,
        fontSize: 18,
        fontFamily: FONTS.bold,
    },
    backButton: {
        padding: 4,
    },
    content: {
        padding: 20,
    },
    detailCard: {
        backgroundColor: COLORS.surface,
        borderRadius: 16,
        padding: 16,
        marginBottom: 20,
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
        alignItems: 'center',
    },
    label: { color: COLORS.textSecondary, fontSize: 14, fontFamily: FONTS.regular, textAlign: 'left' },
    value: { color: COLORS.textPrimary, fontSize: 14, fontFamily: FONTS.medium, textAlign: 'right', flex: 1, marginLeft: 16 },
    subValue: { color: COLORS.textTertiary, fontSize: 11, textAlign: 'right' },

    cardTitle: {
        color: COLORS.textPrimary,
        fontSize: 16,
        fontFamily: FONTS.medium,
    },
    mathRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    mathText: { color: COLORS.textSecondary, fontSize: 14 },
    mathVal: { color: COLORS.textPrimary, fontSize: 14 },
    divider: { height: 1, backgroundColor: COLORS.border, marginVertical: 8 },

    sectionTitle: {
        color: COLORS.textPrimary,
        fontSize: 16,
        fontFamily: FONTS.bold,
        marginBottom: 12,
        textAlign: 'left'
    },
    expenseRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    expName: { color: COLORS.textSecondary, fontSize: 14 },
    expAmount: { color: COLORS.danger, fontSize: 14, fontFamily: FONTS.medium },

    actionGrid: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 20,
        justifyContent: 'space-between',
    },
    actionBtn: {
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.surface,
        borderRadius: 12,
        padding: 12,
        flex: 1,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    actionLabel: {
        color: COLORS.textPrimary,
        fontSize: 12,
        marginTop: 4,
        fontFamily: FONTS.medium,
    },
    markPaidBtn: {
        backgroundColor: COLORS.primary,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        borderRadius: 16,
        gap: 8,
    },
    markPaidText: { color: COLORS.white, fontSize: 16, fontFamily: FONTS.bold },
});
